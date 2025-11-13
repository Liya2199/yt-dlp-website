#!/usr/bin/env python3
"""
MediaPro 后端服务 - 真正实现yt-dlp和ffmpeg调用
这是一个功能完整的后端API，提供真实的视频下载和处理功能
"""

from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import subprocess
import os
import uuid
import json
import re
import threading
import time
from datetime import datetime
from urllib.parse import urlparse
import redis
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 配置
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Redis配置
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    logger.info("Redis连接成功")
except redis.ConnectionError:
    logger.warning("Redis连接失败，使用内存存储")
    redis_client = None

# 工作目录配置
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOAD_DIR = os.path.join(BASE_DIR, 'downloads')
PROCESSED_DIR = os.path.join(BASE_DIR, 'processed')
TEMP_DIR = os.path.join(BASE_DIR, 'temp')

# 创建必要的目录
for dir_path in [DOWNLOAD_DIR, PROCESSED_DIR, TEMP_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# 任务存储（如果Redis不可用）
task_storage = {}

# 支持的网站列表
SUPPORTED_PLATFORMS = {
    'youtube.com': 'YouTube',
    'youtu.be': 'YouTube',
    'bilibili.com': 'Bilibili', 
    'b23.tv': 'Bilibili',
    'vimeo.com': 'Vimeo',
    'tiktok.com': 'TikTok',
    'instagram.com': 'Instagram',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'x.com': 'Twitter'
}

def get_task_storage():
    """获取任务存储"""
    if redis_client:
        return redis_client
    return task_storage

def save_task_status(task_id, status_data):
    """保存任务状态"""
    storage = get_task_storage()
    if isinstance(storage, redis.Redis):
        storage.setex(f'task:{task_id}', 3600, json.dumps(status_data))
    else:
        storage[task_id] = {
            'data': status_data,
            'timestamp': time.time()
        }

def get_task_status(task_id):
    """获取任务状态"""
    storage = get_task_storage()
    if isinstance(storage, redis.Redis):
        data = storage.get(f'task:{task_id}')
        return json.loads(data) if data else None
    else:
        task_data = storage.get(task_id)
        if task_data and (time.time() - task_data['timestamp']) < 3600:
            return task_data['data']
    return None

def detect_platform(url):
    """检测视频平台"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        # 移除www.前缀
        if domain.startswith('www.'):
            domain = domain[4:]
            
        for platform_domain, platform_name in SUPPORTED_PLATFORMS.items():
            if platform_domain in domain:
                return platform_name
        
        return 'Unknown'
    except:
        return 'Unknown'

def sanitize_filename(filename):
    """清理文件名"""
    # 移除或替换非法字符
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
    filename = re.sub(r'[\x00-\x1f\x7f]', '', filename)
    return filename[:200]  # 限制长度

def format_duration(seconds):
    """格式化时长"""
    if not seconds:
        return "0:00"
    
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    else:
        return f"{minutes}:{secs:02d}"

def format_filesize(size_bytes):
    """格式化文件大小"""
    if not size_bytes:
        return "Unknown"
    
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    elif size_bytes < 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/video-editor')
def video_editor():
    """视频编辑页面"""
    return render_template('video-editor.html')

@app.route('/audio-processor')
def audio_processor():
    """音频处理页面"""
    return render_template('audio-processor.html')

@app.route('/about')
def about():
    """关于页面"""
    return render_template('about.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    """分析视频URL"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'URL不能为空'}), 400
        
        logger.info(f"分析URL: {url}")
        
        # 检测平台
        platform = detect_platform(url)
        
        # 使用yt-dlp获取视频信息
        cmd = [
            'yt-dlp',
            '--dump-json',
            '--no-warnings',
            '--no-playlist',
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            try:
                video_info = json.loads(result.stdout)
                
                # 提取格式信息
                formats = []
                for fmt in video_info.get('formats', []):
                    # 只包含有视频和音频的格式
                    if (fmt.get('vcodec') != 'none' and 
                        fmt.get('acodec') != 'none' and 
                        fmt.get('height') and 
                        fmt.get('filesize')):
                        
                        formats.append({
                            'format_id': fmt.get('format_id'),
                            'format_note': fmt.get('format_note', ''),
                            'width': fmt.get('width'),
                            'height': fmt.get('height'),
                            'ext': fmt.get('ext'),
                            'filesize': fmt.get('filesize'),
                            'filesize_str': format_filesize(fmt.get('filesize')),
                            'vcodec': fmt.get('vcodec'),
                            'acodec': fmt.get('acodec'),
                            'quality': f"{fmt.get('height')}p"
                        })
                
                # 按质量排序
                formats.sort(key=lambda x: x['height'] or 0, reverse=True)
                
                # 提取字幕信息
                subtitles = list(video_info.get('subtitles', {}).keys())
                
                response = {
                    'success': True,
                    'platform': platform,
                    'title': video_info.get('title', 'Unknown'),
                    'duration': video_info.get('duration'),
                    'duration_str': format_duration(video_info.get('duration')),
                    'thumbnail': video_info.get('thumbnail', ''),
                    'formats': formats[:10],  # 限制格式数量
                    'subtitles': subtitles,
                    'original_quality': f"{video_info.get('height', 'Unknown')}p"
                }
                
                logger.info(f"分析成功: {response['title']}")
                return jsonify(response)
                
            except json.JSONDecodeError:
                logger.error("JSON解析失败")
                return jsonify({'error': '无法解析视频信息'}), 500
        else:
            logger.error(f"yt-dlp执行失败: {result.stderr}")
            return jsonify({'error': '无法获取视频信息，请检查URL是否正确'}), 400
            
    except subprocess.TimeoutExpired:
        logger.error("分析超时")
        return jsonify({'error': '分析超时，请稍后重试'}), 500
    except Exception as e:
        logger.error(f"分析错误: {str(e)}")
        return jsonify({'error': f'分析失败: {str(e)}'}), 500

@app.route('/api/download', methods=['POST'])
def download_video():
    """创建视频下载任务"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        format_id = data.get('format_id', 'best')
        include_subtitles = data.get('include_subtitles', False)
        subtitle_langs = data.get('subtitle_langs', ['zh-CN', 'en'])
        
        if not url:
            return jsonify({'error': 'URL不能为空'}), 400
        
        logger.info(f"创建下载任务: {url}, 格式: {format_id}")
        
        # 创建任务ID
        task_id = str(uuid.uuid4())
        
        # 保存初始任务状态
        task_info = {
            'task_id': task_id,
            'url': url,
            'status': 'pending',
            'progress': 0,
            'created_at': datetime.now().isoformat(),
            'message': '任务已创建，等待处理...'
        }
        save_task_status(task_id, task_info)
        
        # 在新线程中执行下载
        def download_task():
            try:
                # 更新状态为下载中
                task_info['status'] = 'downloading'
                task_info['message'] = '正在下载视频...'
                save_task_status(task_id, task_info)
                
                # 构建yt-dlp命令
                cmd = [
                    'yt-dlp',
                    '-f', format_id,
                    '--no-warnings',
                    '--no-playlist',
                    '--progress',
                    '--newline'
                ]
                
                # 添加字幕选项
                if include_subtitles:
                    cmd.extend(['--write-sub', '--sub-lang', ','.join(subtitle_langs)])
                
                # 输出模板
                output_template = os.path.join(DOWNLOAD_DIR, f'{task_id}_%(title)s.%(ext)s')
                cmd.extend(['-o', output_template])
                cmd.append(url)
                
                logger.info(f"执行命令: {' '.join(cmd)}")
                
                # 执行下载
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True,
                    bufsize=1
                )
                
                # 实时读取输出
                for line in process.stdout:
                    line = line.strip()
                    if '[download]' in line and '%' in line:
                        # 解析进度
                        try:
                            # 查找百分比
                            percent_match = re.search(r'(\d+\.?\d*)%', line)
                            if percent_match:
                                progress = float(percent_match.group(1))
                                task_info['progress'] = progress
                                task_info['message'] = f'下载中... {progress:.1f}%'
                                save_task_status(task_id, task_info)
                                logger.info(f"任务 {task_id} 进度: {progress:.1f}%")
                        except:
                            pass
                
                # 等待进程完成
                returncode = process.wait()
                
                if returncode == 0:
                    # 查找下载的文件
                    downloaded_files = []
                    for file in os.listdir(DOWNLOAD_DIR):
                        if file.startswith(f'{task_id}_'):
                            file_path = os.path.join(DOWNLOAD_DIR, file)
                            file_size = os.path.getsize(file_path)
                            downloaded_files.append({
                                'filename': file[len(task_id)+1:],  # 移除前缀
                                'path': file_path,
                                'size': file_size,
                                'size_str': format_filesize(file_size)
                            })
                    
                    # 更新任务状态为完成
                    task_info.update({
                        'status': 'completed',
                        'progress': 100,
                        'message': '下载完成',
                        'completed_at': datetime.now().isoformat(),
                        'downloaded_files': downloaded_files
                    })
                    save_task_status(task_id, task_info)
                    
                    logger.info(f"任务 {task_id} 完成，下载了 {len(downloaded_files)} 个文件")
                    
                else:
                    # 更新任务状态为失败
                    error_msg = process.stderr.read()
                    task_info.update({
                        'status': 'failed',
                        'message': f'下载失败: {error_msg}',
                        'completed_at': datetime.now().isoformat(),
                        'error': error_msg
                    })
                    save_task_status(task_id, task_info)
                    
                    logger.error(f"任务 {task_id} 失败: {error_msg}")
                    
            except Exception as e:
                logger.error(f"下载任务 {task_id} 错误: {str(e)}")
                task_info.update({
                    'status': 'failed',
                    'message': f'下载错误: {str(e)}',
                    'completed_at': datetime.now().isoformat(),
                    'error': str(e)
                })
                save_task_status(task_id, task_info)
        
        # 启动下载线程
        download_thread = threading.Thread(target=download_task)
        download_thread.daemon = True
        download_thread.start()
        
        return jsonify({
            'success': True,
            'task_id': task_id,
            'status': 'pending',
            'message': '下载任务已创建'
        })
        
    except Exception as e:
        logger.error(f"创建下载任务错误: {str(e)}")
        return jsonify({'error': f'创建任务失败: {str(e)}'}), 500

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """获取任务状态"""
    try:
        status = get_task_status(task_id)
        if not status:
            return jsonify({'error': '任务不存在或已过期'}), 404
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"获取任务状态错误: {str(e)}")
        return jsonify({'error': '获取状态失败'}), 500

@app.route('/api/download-file/<task_id>/<filename>', methods=['GET'])
def download_file(task_id, filename):
    """下载文件"""
    try:
        # 验证任务状态
        status = get_task_status(task_id)
        if not status or status['status'] != 'completed':
            return jsonify({'error': '文件不可用'}), 404
        
        # 验证文件名
        filename = sanitize_filename(filename)
        file_path = os.path.join(DOWNLOAD_DIR, f'{task_id}_{filename}')
        
        if not os.path.exists(file_path):
            return jsonify({'error': '文件不存在'}), 404
        
        return send_file(file_path, as_attachment=True, download_name=filename)
        
    except Exception as e:
        logger.error(f"下载文件错误: {str(e)}")
        return jsonify({'error': '下载失败'}), 500

@app.route('/api/process', methods=['POST'])
def process_media():
    """处理媒体文件"""
    try:
        data = request.get_json()
        input_file = data.get('input_file')
        operations = data.get('operations', {})
        
        if not input_file:
            return jsonify({'error': '输入文件不能为空'}), 400
        
        logger.info(f"处理媒体文件: {input_file}, 操作: {operations}")
        
        # 创建任务ID
        task_id = str(uuid.uuid4())
        
        # 保存任务状态
        task_info = {
            'task_id': task_id,
            'input_file': input_file,
            'operations': operations,
            'status': 'pending',
            'progress': 0,
            'created_at': datetime.now().isoformat(),
            'message': '处理任务已创建，等待处理...'
        }
        save_task_status(task_id, task_info)
        
        # 在新线程中执行处理
        def process_task():
            try:
                # 更新状态为处理中
                task_info['status'] = 'processing'
                task_info['message'] = '正在处理媒体文件...'
                save_task_status(task_id, task_info)
                
                # 检查输入文件是否存在
                if not os.path.exists(input_file):
                    raise FileNotFoundError(f"输入文件不存在: {input_file}")
                
                # 生成输出文件名
                base_name = os.path.basename(input_file)
                name_without_ext = os.path.splitext(base_name)[0]
                output_filename = f"processed_{name_without_ext}.mp4"
                output_file = os.path.join(PROCESSED_DIR, output_filename)
                
                # 构建ffmpeg命令
                cmd = ['ffmpeg', '-i', input_file, '-y']  # -y 覆盖输出文件
                
                # 应用各种操作
                if operations.get('trim'):
                    trim = operations['trim']
                    if trim.get('start'):
                        cmd.extend(['-ss', str(trim['start'])])
                    if trim.get('duration'):
                        cmd.extend(['-t', str(trim['duration'])])
                
                if operations.get('resize'):
                    resize = operations['resize']
                    width = resize.get('width')
                    height = resize.get('height')
                    if width and height:
                        cmd.extend(['-s', f"{width}x{height}"])
                
                if operations.get('quality'):
                    quality = operations['quality']
                    # CRF值，范围0-51，数值越小质量越好
                    crf = max(0, min(51, int(quality)))
                    cmd.extend(['-crf', str(crf)])
                
                if operations.get('fps'):
                    fps = operations['fps']
                    cmd.extend(['-r', str(fps)])
                
                if operations.get('audio'):
                    audio_ops = operations['audio']
                    if audio_ops.get('bitrate'):
                        cmd.extend(['-b:a', f"{audio_ops['bitrate']}k"])
                    if audio_ops.get('sample_rate'):
                        cmd.extend(['-ar', str(audio_ops['sample_rate'])])
                
                # 添加输出文件
                cmd.append(output_file)
                
                logger.info(f"执行ffmpeg命令: {' '.join(cmd)}")
                
                # 执行处理
                process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                
                # 等待处理完成
                stdout, stderr = process.communicate()
                
                if process.returncode == 0:
                    # 检查输出文件是否存在
                    if os.path.exists(output_file):
                        file_size = os.path.getsize(output_file)
                        
                        # 更新任务状态为完成
                        task_info.update({
                            'status': 'completed',
                            'progress': 100,
                            'message': '处理完成',
                            'completed_at': datetime.now().isoformat(),
                            'output_file': output_file,
                            'output_size': file_size,
                            'output_size_str': format_filesize(file_size)
                        })
                        save_task_status(task_id, task_info)
                        
                        logger.info(f"任务 {task_id} 完成，输出文件: {output_file}")
                    else:
                        raise Exception("处理失败，未生成输出文件")
                        
                else:
                    # 处理失败
                    error_msg = stderr or "处理失败"
                    task_info.update({
                        'status': 'failed',
                        'message': f'处理失败: {error_msg}',
                        'completed_at': datetime.now().isoformat(),
                        'error': error_msg
                    })
                    save_task_status(task_id, task_info)
                    
                    logger.error(f"任务 {task_id} 失败: {error_msg}")
                    
            except Exception as e:
                logger.error(f"处理任务 {task_id} 错误: {str(e)}")
                task_info.update({
                    'status': 'failed',
                    'message': f'处理错误: {str(e)}',
                    'completed_at': datetime.now().isoformat(),
                    'error': str(e)
                })
                save_task_status(task_id, task_info)
        
        # 启动处理线程
        process_thread = threading.Thread(target=process_task)
        process_thread.daemon = True
        process_thread.start()
        
        return jsonify({
            'success': True,
            'task_id': task_id,
            'status': 'pending',
            'message': '处理任务已创建'
        })
        
    except Exception as e:
        logger.error(f"创建处理任务错误: {str(e)}")
        return jsonify({'error': f'创建任务失败: {str(e)}'}), 500

@app.route('/api/platforms', methods=['GET'])
def get_supported_platforms():
    """获取支持的平台列表"""
    return jsonify({
        'success': True,
        'platforms': list(SUPPORTED_PLATFORMS.values())
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    try:
        # 计算下载目录中的文件数量
        download_files = os.listdir(DOWNLOAD_DIR)
        processed_files = os.listdir(PROCESSED_DIR)
        
        total_download_size = 0
        for file in download_files:
            file_path = os.path.join(DOWNLOAD_DIR, file)
            if os.path.isfile(file_path):
                total_download_size += os.path.getsize(file_path)
        
        return jsonify({
            'success': True,
            'stats': {
                'total_downloads': len(download_files),
                'total_processed': len(processed_files),
                'total_download_size': total_download_size,
                'total_download_size_str': format_filesize(total_download_size),
                'supported_platforms': len(SUPPORTED_PLATFORMS)
            }
        })
        
    except Exception as e:
        logger.error(f"获取统计信息错误: {str(e)}")
        return jsonify({'error': '获取统计信息失败'}), 500

@app.route('/api/cleanup', methods=['POST'])
def cleanup_old_files():
    """清理旧文件"""
    try:
        current_time = time.time()
        max_age = 24 * 3600  # 24小时
        
        cleaned_files = 0
        
        # 清理下载目录
        for file in os.listdir(DOWNLOAD_DIR):
            file_path = os.path.join(DOWNLOAD_DIR, file)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age:
                    os.remove(file_path)
                    cleaned_files += 1
        
        # 清理处理目录
        for file in os.listdir(PROCESSED_DIR):
            file_path = os.path.join(PROCESSED_DIR, file)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getmtime(file_path)
                if file_age > max_age:
                    os.remove(file_path)
                    cleaned_files += 1
        
        return jsonify({
            'success': True,
            'cleaned_files': cleaned_files,
            'message': f'已清理 {cleaned_files} 个旧文件'
        })
        
    except Exception as e:
        logger.error(f"清理文件错误: {str(e)}")
        return jsonify({'error': '清理文件失败'}), 500

if __name__ == '__main__':
    logger.info("MediaPro 后端服务启动")
    logger.info(f"下载目录: {DOWNLOAD_DIR}")
    logger.info(f"处理目录: {PROCESSED_DIR}")
    logger.info(f"临时目录: {TEMP_DIR}")
    logger.info(f"支持的平台: {len(SUPPORTED_PLATFORMS)} 个")
    
    # 检查yt-dlp和ffmpeg是否可用
    try:
        result = subprocess.run(['yt-dlp', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            logger.info(f"yt-dlp 版本: {result.stdout.strip()}")
        else:
            logger.error("yt-dlp 不可用")
    except:
        logger.error("yt-dlp 未安装")
    
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            logger.info(f"FFmpeg 版本: {version_line}")
        else:
            logger.error("FFmpeg 不可用")
    except:
        logger.error("FFmpeg 未安装")
    
    app.run(debug=True, host='0.0.0.0', port=5000)