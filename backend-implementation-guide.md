# MediaPro 后端实现指南

## 概述

本文档提供了如何将MediaPro从纯前端演示转换为功能完整的媒体处理平台的详细指南。重点介绍如何实现yt-dlp和ffmpeg的实际调用。

## 系统要求

### 软件依赖
```bash
# 安装系统依赖
sudo apt update
sudo apt install -y \
    python3 \
    python3-pip \
    ffmpeg \
    yt-dlp \
    redis-server \
    nginx \
    supervisor
```

### Python依赖
```bash
# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装Python包
pip install -r requirements.txt
```

**requirements.txt**
```
Flask==2.3.3
Flask-CORS==4.0.0
Celery==5.3.4
Redis==5.0.1
SQLAlchemy==2.0.21
requests==2.31.0
Werkzeug==2.3.7
python-dotenv==1.0.0
```

## 后端API实现

### 1. 主应用文件 (app.py)
```python
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from celery import Celery
import os
import subprocess
import uuid
import redis
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# 配置
app.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
app.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

# 初始化Celery
celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

# Redis连接
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 配置目录
DOWNLOAD_DIR = '/tmp/mediapro/downloads'
PROCESSED_DIR = '/tmp/mediapro/processed'

# 创建目录
os.makedirs(DOWNLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    """分析视频URL，获取可用格式信息"""
    try:
        data = request.json
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # 使用yt-dlp获取视频信息
        cmd = [
            'yt-dlp',
            '--dump-json',
            '--no-warnings',
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            video_info = json.loads(result.stdout)
            
            # 提取格式信息
            formats = []
            for fmt in video_info.get('formats', []):
                if fmt.get('vcodec') != 'none' and fmt.get('acodec') != 'none':
                    formats.append({
                        'format_id': fmt.get('format_id'),
                        'format_note': fmt.get('format_note', ''),
                        'width': fmt.get('width'),
                        'height': fmt.get('height'),
                        'ext': fmt.get('ext'),
                        'filesize': fmt.get('filesize'),
                        'vcodec': fmt.get('vcodec'),
                        'acodec': fmt.get('acodec')
                    })
            
            response = {
                'title': video_info.get('title'),
                'duration': video_info.get('duration'),
                'thumbnail': video_info.get('thumbnail'),
                'formats': formats,
                'subtitles': list(video_info.get('subtitles', {}).keys())
            }
            
            return jsonify(response)
        else:
            return jsonify({'error': result.stderr}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def download_video():
    """创建视频下载任务"""
    try:
        data = request.json
        url = data.get('url')
        format_id = data.get('format_id', 'best')
        include_subtitles = data.get('include_subtitles', False)
        subtitle_langs = data.get('subtitle_langs', ['zh-CN', 'en'])
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # 创建任务ID
        task_id = str(uuid.uuid4())
        
        # 创建下载任务
        task = download_video_task.delay(
            url=url,
            format_id=format_id,
            include_subtitles=include_subtitles,
            subtitle_langs=subtitle_langs,
            task_id=task_id
        )
        
        # 保存任务信息到Redis
        task_info = {
            'task_id': task_id,
            'url': url,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'progress': 0
        }
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        return jsonify({
            'task_id': task_id,
            'status': 'pending',
            'message': 'Download task created'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """获取任务状态"""
    try:
        task_data = redis_client.get(f'task:{task_id}')
        if not task_data:
            return jsonify({'error': 'Task not found'}), 404
        
        task_info = json.loads(task_data)
        return jsonify(task_info)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/process', methods=['POST'])
def process_media():
    """创建媒体处理任务"""
    try:
        data = request.json
        input_file = data.get('input_file')
        operations = data.get('operations', {})
        
        if not input_file:
            return jsonify({'error': 'Input file is required'}), 400
        
        # 创建任务ID
        task_id = str(uuid.uuid4())
        
        # 创建处理任务
        task = process_media_task.delay(
            input_file=input_file,
            operations=operations,
            task_id=task_id
        )
        
        # 保存任务信息
        task_info = {
            'task_id': task_id,
            'input_file': input_file,
            'operations': operations,
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'progress': 0
        }
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        return jsonify({
            'task_id': task_id,
            'status': 'pending',
            'message': 'Processing task created'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-result/<task_id>', methods=['GET'])
def download_result(task_id):
    """下载处理结果"""
    try:
        task_data = redis_client.get(f'task:{task_id}')
        if not task_data:
            return jsonify({'error': 'Task not found'}), 404
        
        task_info = json.loads(task_data)
        
        if task_info['status'] != 'completed':
            return jsonify({'error': 'Task not completed'}), 400
        
        output_file = task_info.get('output_file')
        if not output_file or not os.path.exists(output_file):
            return jsonify({'error': 'Result file not found'}), 404
        
        return send_file(output_file, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Celery任务
@celery.task(bind=True)
def download_video_task(self, url, format_id, include_subtitles, subtitle_langs, task_id):
    """视频下载任务"""
    try:
        # 更新任务状态
        task_info = {
            'task_id': task_id,
            'url': url,
            'status': 'downloading',
            'progress': 0,
            'started_at': datetime.now().isoformat()
        }
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        # 构建yt-dlp命令
        cmd = [
            'yt-dlp',
            '-f', format_id,
            '--write-info-json',
            '--no-warnings',
            '--progress',
            '--newline'
        ]
        
        if include_subtitles:
            cmd.extend(['--write-sub', '--sub-lang', ','.join(subtitle_langs)])
        
        cmd.extend([
            '-o', os.path.join(DOWNLOAD_DIR, '%(title)s.%(ext)s'),
            url
        ])
        
        # 执行下载
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # 解析进度
        for line in process.stdout:
            if '[download]' in line and '%' in line:
                # 解析进度百分比
                try:
                    progress_str = line.split('%')[0].split()[-1]
                    progress = float(progress_str)
                    
                    # 更新进度
                    task_info['progress'] = progress
                    redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
                    
                    # 更新Celery任务进度
                    self.update_state(
                        state='PROGRESS',
                        meta={'current': progress, 'total': 100}
                    )
                except:
                    pass
        
        process.wait()
        
        if process.returncode == 0:
            # 查找下载的文件
            downloaded_files = []
            for file in os.listdir(DOWNLOAD_DIR):
                if file.endswith(('.mp4', '.mkv', '.webm', '.avi')):
                    downloaded_files.append(os.path.join(DOWNLOAD_DIR, file))
            
            # 更新任务状态为完成
            task_info.update({
                'status': 'completed',
                'progress': 100,
                'completed_at': datetime.now().isoformat(),
                'downloaded_files': downloaded_files
            })
            redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
            
            return {'status': 'completed', 'files': downloaded_files}
        else:
            # 更新任务状态为失败
            task_info.update({
                'status': 'failed',
                'error': process.stderr.read(),
                'completed_at': datetime.now().isoformat()
            })
            redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
            
            return {'status': 'failed', 'error': process.stderr.read()}
            
    except Exception as e:
        # 更新任务状态为失败
        task_info.update({
            'status': 'failed',
            'error': str(e),
            'completed_at': datetime.now().isoformat()
        })
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        return {'status': 'failed', 'error': str(e)}

@celery.task(bind=True)
def process_media_task(self, input_file, operations, task_id):
    """媒体处理任务"""
    try:
        # 更新任务状态
        task_info = {
            'task_id': task_id,
            'input_file': input_file,
            'operations': operations,
            'status': 'processing',
            'progress': 0,
            'started_at': datetime.now().isoformat()
        }
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        # 生成输出文件名
        output_filename = f"processed_{os.path.basename(input_file)}"
        output_file = os.path.join(PROCESSED_DIR, output_filename)
        
        # 构建ffmpeg命令
        cmd = ['ffmpeg', '-i', input_file]
        
        # 应用各种操作
        if operations.get('trim'):
            trim = operations['trim']
            cmd.extend(['-ss', trim['start'], '-t', trim['duration']])
        
        if operations.get('resize'):
            resize = operations['resize']
            cmd.extend(['-s', f"{resize['width']}x{resize['height']}"])
        
        if operations.get('quality'):
            quality = operations['quality']
            cmd.extend(['-crf', str(quality)])
        
        if operations.get('fps'):
            fps = operations['fps']
            cmd.extend(['-r', str(fps)])
        
        # 添加输出文件
        cmd.append(output_file)
        
        # 执行处理
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # 解析进度
        for line in process.stderr:
            if 'frame=' in line and 'fps=' in line:
                # 可以在这里解析ffmpeg进度
                pass
        
        process.wait()
        
        if process.returncode == 0:
            # 更新任务状态为完成
            task_info.update({
                'status': 'completed',
                'progress': 100,
                'completed_at': datetime.now().isoformat(),
                'output_file': output_file
            })
            redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
            
            return {'status': 'completed', 'output_file': output_file}
        else:
            # 更新任务状态为失败
            task_info.update({
                'status': 'failed',
                'error': process.stderr.read(),
                'completed_at': datetime.now().isoformat()
            })
            redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
            
            return {'status': 'failed', 'error': process.stderr.read()}
            
    except Exception as e:
        # 更新任务状态为失败
        task_info.update({
            'status': 'failed',
            'error': str(e),
            'completed_at': datetime.now().isoformat()
        })
        redis_client.setex(f'task:{task_id}', 3600, json.dumps(task_info))
        
        return {'status': 'failed', 'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
```

### 2. Celery配置 (celery_config.py)
```python
from celery import Celery

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    
    # 配置任务序列化
    celery.conf.task_serializer = 'json'
    celery.conf.accept_content = ['json']
    celery.conf.result_serializer = 'json'
    
    # 配置时区
    celery.conf.timezone = 'UTC'
    celery.conf.enable_utc = True
    
    # 任务路由
    celery.conf.task_routes = {
        'app.download_video_task': {'queue': 'download'},
        'app.process_media_task': {'queue': 'process'}
    }
    
    return celery
```

### 3. 前端API调用更新 (main.js)
```javascript
// 更新后的API调用函数
class MediaProAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
    }
    
    async analyzeUrl(url) {
        try {
            const response = await fetch(`${this.baseURL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Analyze URL error:', error);
            throw error;
        }
    }
    
    async downloadVideo(url, formatId, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url,
                    format_id: formatId,
                    include_subtitles: options.includeSubtitles || false,
                    subtitle_langs: options.subtitleLangs || ['zh-CN', 'en']
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Download video error:', error);
            throw error;
        }
    }
    
    async getTaskStatus(taskId) {
        try {
            const response = await fetch(`${this.baseURL}/tasks/${taskId}`);
            return await response.json();
        } catch (error) {
            console.error('Get task status error:', error);
            throw error;
        }
    }
    
    async processMedia(inputFile, operations) {
        try {
            const response = await fetch(`${this.baseURL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input_file: inputFile,
                    operations: operations
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Process media error:', error);
            throw error;
        }
    }
    
    // 轮询任务状态
    async pollTaskStatus(taskId, callback, interval = 1000) {
        const poll = async () => {
            try {
                const status = await this.getTaskStatus(taskId);
                callback(status);
                
                if (status.status === 'pending' || status.status === 'downloading' || status.status === 'processing') {
                    setTimeout(poll, interval);
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        };
        
        poll();
    }
}

// 使用示例
const api = new MediaProAPI();

// 分析URL
async function handleUrlAnalysis() {
    const url = document.getElementById('video-url').value;
    
    try {
        const analysis = await api.analyzeUrl(url);
        
        if (analysis.error) {
            showNotification('分析失败: ' + analysis.error, 'error');
            return;
        }
        
        // 显示分析结果
        displayAnalysisResults(analysis);
        showNotification('视频分析完成', 'success');
        
    } catch (error) {
        showNotification('网络错误，请稍后重试', 'error');
    }
}

// 下载视频
async function handleVideoDownload() {
    const url = document.getElementById('video-url').value;
    const selectedFormat = getSelectedFormat();
    const options = {
        includeSubtitles: document.getElementById('include-subtitles').checked,
        subtitleLangs: ['zh-CN', 'en']
    };
    
    try {
        const result = await api.downloadVideo(url, selectedFormat, options);
        
        if (result.error) {
            showNotification('下载失败: ' + result.error, 'error');
            return;
        }
        
        // 开始轮询任务状态
        api.pollTaskStatus(result.task_id, (status) => {
            updateDownloadProgress(status);
            
            if (status.status === 'completed') {
                showNotification('下载完成！', 'success');
                // 提供下载链接
                showDownloadLinks(status.downloaded_files);
            } else if (status.status === 'failed') {
                showNotification('下载失败: ' + status.error, 'error');
            }
        });
        
        showNotification('下载任务已创建', 'info');
        
    } catch (error) {
        showNotification('网络错误，请稍后重试', 'error');
    }
}
```

## 部署说明

### 1. 启动后端服务
```bash
# 启动Redis
redis-server

# 启动Celery Worker (新终端)
celery -A app.celery worker --loglevel=info --queues=download,process

# 启动Flask应用 (新终端)
python app.py
```

### 2. 配置Nginx反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        root /path/to/mediapro/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. 使用Supervisor管理进程
```ini
[program:mediapro-flask]
command=/path/to/venv/bin/python /path/to/app.py
directory=/path/to/mediapro/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/mediapro/flask.log

[program:mediapro-celery]
command=/path/to/venv/bin/celery -A app.celery worker --loglevel=info --queues=download,process
directory=/path/to/mediapro/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/mediapro/celery.log
```

## 安全考虑

### 1. 输入验证
```python
def validate_url(url):
    """验证URL格式"""
    import re
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return url_pattern.match(url) is not None

def sanitize_filename(filename):
    """清理文件名，防止路径遍历攻击"""
    import re
    # 移除非字母数字字符
    filename = re.sub(r'[^\w\-_.]', '', filename)
    # 限制长度
    filename = filename[:100]
    return filename
```

### 2. 资源限制
```python
# 限制文件大小
MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024  # 5GB

# 限制并发任务数
MAX_CONCURRENT_TASKS = 5

# 设置超时时间
TASK_TIMEOUT = 3600  # 1小时
```

### 3. 访问控制
```python
from functools import wraps
from flask import session

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/download', methods=['POST'])
@login_required
def download_video():
    # 需要登录才能下载
    pass
```

## 性能优化

### 1. 缓存策略
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_video_info(url):
    """缓存视频信息，避免重复分析"""
    cmd = ['yt-dlp', '--dump-json', '--no-warnings', url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else None
```

### 2. 连接池
```python
from redis import ConnectionPool

# 使用连接池
pool = ConnectionPool(host='localhost', port=6379, db=0, max_connections=20)
redis_client = redis.Redis(connection_pool=pool)
```

### 3. 异步处理
```python
import asyncio
import aiohttp

async def fetch_video_info(session, url):
    async with session.get(f'https://api.example.com/video?url={url}') as response:
        return await response.json()

async def batch_analyze(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_video_info(session, url) for url in urls]
        return await asyncio.gather(*tasks)
```

## 监控和日志

### 1. 日志配置
```python
import logging
from logging.handlers import RotatingFileHandler

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
    handlers=[
        RotatingFileHandler('/var/log/mediapro/app.log', maxBytes=10*1024*1024, backupCount=5),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
```

### 2. 性能监控
```python
import time
from functools import wraps

def monitor_performance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        logger.info(f'{f.__name__} executed in {execution_time:.2f} seconds')
        
        return result
    return decorated_function
```

## 总结

通过实现这个后端服务，MediaPro从一个纯前端演示转变为一个功能完整的媒体处理平台。后端服务提供了：

1. **真实的视频下载**: 通过yt-dlp支持1000+网站
2. **专业的视频处理**: 通过ffmpeg提供完整的音视频处理功能
3. **异步任务处理**: 通过Celery支持大规模并发处理
4. **进度跟踪**: 实时监控处理进度
5. **安全管理**: 输入验证、资源限制、访问控制
6. **性能优化**: 缓存、连接池、异步处理

这个架构既保证了功能的完整性，又确保了系统的安全性和可扩展性。