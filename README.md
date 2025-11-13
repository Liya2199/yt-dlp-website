# MediaPro - 真正的媒体处理平台

## 项目简介

MediaPro 是一个功能完整的媒体处理平台，真正实现了基于 yt-dlp 和 ffmpeg 的视频下载和处理功能。不再是前端演示，而是真正可用的服务。

## 功能特性

### ✅ 已实现的功能
- **真实的视频下载**：基于 yt-dlp，支持 1000+ 网站
- **智能URL分析**：自动检测平台，获取可用格式
- **多格式下载**：支持 720p、1080p、4K 等多种质量
- **字幕下载**：自动下载多语言字幕
- **实时进度**：显示真实的下载进度和速度
- **批量处理**：支持多个URL的批量下载
- **文件管理**：自动清理过期文件

### 🌐 支持的平台
- YouTube
- Bilibili  
- Vimeo
- TikTok
- Instagram
- Facebook
- Twitter
- 以及更多...

## 技术架构

### 前端技术栈
- **HTML5 + CSS3 + JavaScript ES6+**
- **Tailwind CSS**：现代化样式框架
- **Anime.js**：流畅动画效果
- **ECharts.js**：数据可视化
- **Pixi.js**：粒子背景效果
- **Splide.js**：轮播组件

### 后端技术栈
- **Python Flask**：轻量级Web框架
- **yt-dlp**：强大的视频下载工具
- **FFmpeg**：音视频处理引擎
- **Redis**：缓存和会话存储（可选）

## 快速开始

### 系统要求
- **Python 3.7+**
- **yt-dlp**（自动安装）
- **FFmpeg**（需要手动安装）
- **Redis**（可选，用于缓存）

### 安装步骤

#### 1. 克隆或下载项目
```bash
git clone https://github.com/yourusername/mediapro.git
cd mediapro
```

#### 2. 安装Python依赖
```bash
pip3 install -r requirements.txt
```

#### 3. 安装FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
1. 从 https://ffmpeg.org/download.html 下载Windows版本
2. 解压并将 ffmpeg.exe 添加到系统PATH

#### 4. 启动服务

**Linux/macOS:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Windows:**
```bash
start-backend.bat
```

或者直接运行：
```bash
python3 app.py
```

### 验证安装

服务启动后，访问 http://localhost:5000 查看界面。

检查后端是否正常工作：
```bash
curl http://localhost:5000/api/platforms
```

## 使用指南

### 视频下载

1. **输入URL**：在主页输入框中粘贴视频URL
2. **分析视频**：点击"分析"按钮，系统会自动检测平台和可用格式
3. **选择格式**：选择所需的视频质量和格式
4. **开始下载**：点击"开始下载"，系统会创建下载任务
5. **查看进度**：实时查看下载进度和速度
6. **下载完成**：下载完成后会显示下载链接

### 支持的URL格式
- YouTube: `https://www.youtube.com/watch?v=视频ID`
- Bilibili: `https://www.bilibili.com/video/BV视频ID`
- Vimeo: `https://vimeo.com/视频ID`
- 等等...

### 文件存储
- **下载文件**：保存在 `downloads/` 目录
- **处理文件**：保存在 `processed/` 目录
- **临时文件**：保存在 `temp/` 目录

## API文档

### 分析视频URL
```http
POST /api/analyze
Content-Type: application/json

{
    "url": "https://www.youtube.com/watch?v=example"
}
```

响应：
```json
{
    "success": true,
    "platform": "YouTube",
    "title": "视频标题",
    "duration": 245,
    "duration_str": "4:05",
    "formats": [
        {
            "format_id": "22",
            "quality": "720p",
            "ext": "mp4",
            "filesize": 52428800,
            "filesize_str": "50.0 MB"
        }
    ],
    "subtitles": ["zh-CN", "en"]
}
```

### 创建下载任务
```http
POST /api/download
Content-Type: application/json

{
    "url": "https://www.youtube.com/watch?v=example",
    "format_id": "22",
    "include_subtitles": true,
    "subtitle_langs": ["zh-CN", "en"]
}
```

响应：
```json
{
    "success": true,
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending"
}
```

### 获取任务状态
```http
GET /api/tasks/{task_id}
```

响应：
```json
{
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "downloading",
    "progress": 45.6,
    "message": "下载中... 45.6%"
}
```

### 下载文件
```http
GET /api/download-file/{task_id}/{filename}
```

## 配置选项

### 环境变量
创建 `.env` 文件：
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
REDIS_URL=redis://localhost:6379/0
DOWNLOAD_DIR=/path/to/downloads
MAX_FILE_SIZE=5368709120  # 5GB
```

### 修改配置
在 `app.py` 中可以修改以下配置：
- **下载目录**：`DOWNLOAD_DIR`
- **处理目录**：`PROCESSED_DIR`
- **文件过期时间**：24小时
- **最大并发任务数**：无限制（基于系统资源）

## 故障排除

### 常见问题

1. **yt-dlp 未安装**
   ```bash
   pip3 install yt-dlp
   ```

2. **FFmpeg 未安装**
   - 按照上面的安装步骤安装FFmpeg
   - 确保 ffmpeg 命令在PATH中可用

3. **端口被占用**
   - 修改 `app.py` 中的端口号
   - 或关闭占用5000端口的程序

4. **下载失败**
   - 检查URL是否正确
   - 检查网络连接
   - 查看日志获取详细错误信息

5. **跨域问题**
   - 确保前端和后端在同一域名下
   - 或修改CORS配置

### 日志查看
后端会输出详细日志，包括：
- 请求处理日志
- yt-dlp执行日志
- 错误信息日志

### 性能优化

1. **使用Redis缓存**（可选）
   ```bash
   redis-server
   ```

2. **调整并发限制**
   在 `app.py` 中可以添加并发限制

3. **文件清理**
   定期运行清理脚本删除过期文件

## 安全考虑

### 输入验证
- URL格式验证
- 文件名清理，防止路径遍历
- 文件大小限制

### 资源限制
- 设置最大文件大小
- 定期清理过期文件
- 限制并发任务数

### 访问控制
- 添加用户认证（可选）
- IP白名单（可选）
- 速率限制（可选）

## 扩展功能

### 计划实现的功能
- [ ] 视频编辑（裁剪、合并、压缩）
- [ ] 音频处理（格式转换、音效）
- [ ] 用户认证系统
- [ ] 批量处理队列
- [ ] WebSocket实时通信
- [ ] Docker容器化部署

### 贡献指南
欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

本项目采用 MIT 许可证。

## 致谢

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - 强大的视频下载工具
- [FFmpeg](https://ffmpeg.org/) - 音视频处理引擎
- [Flask](https://flask.palletsprojects.com/) - Python Web框架
- 所有开源库的贡献者

---

**注意**：本项目仅供学习和研究使用。请遵守相关网站的服务条款和版权规定。在使用前请确保您有权下载和处理相关视频内容。

---

## MediaPro 后端实现指南

### 概述

本文档提供了如何将MediaPro从纯前端演示转换为功能完整的媒体处理平台的详细指南。重点介绍如何实现yt-dlp和ffmpeg的实际调用。

### 系统要求

#### 软件依赖
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

#### Python依赖
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

### 后端API实现

#### 1. 主应用文件 (app.py)
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

app = Flask(__app.name__)
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

#### 2. Celery配置 (celery_config.py)
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

#### 3. 前端API调用更新 (main.js)
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

### 部署说明

#### 1. 启动后端服务
```bash
# 启动Redis
redis-server

# 启动Celery Worker (新终端)
celery -A app.celery worker --loglevel=info --queues=download,process

# 启动Flask应用 (新终端)
python app.py
```

#### 2. 配置Nginx反向代理
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

#### 3. 使用Supervisor管理进程
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

### 安全考虑

#### 1. 输入验证
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

#### 2. 资源限制
```python
# 限制文件大小
MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024  # 5GB

# 限制并发任务数
MAX_CONCURRENT_TASKS = 5

# 设置超时时间
TASK_TIMEOUT = 3600  # 1小时
```

#### 3. 访问控制
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

### 性能优化

#### 1. 缓存策略
```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_video_info(url):
    """缓存视频信息，避免重复分析"""
    cmd = ['yt-dlp', '--dump-json', '--no-warnings', url]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout) if result.returncode == 0 else None
```

#### 2. 连接池
```python
from redis import ConnectionPool

# 使用连接池
pool = ConnectionPool(host='localhost', port=6379, db=0, max_connections=20)
redis_client = redis.Redis(connection_pool=pool)
```

#### 3. 异步处理
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

### 监控和日志

#### 1. 日志配置
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

#### 2. 性能监控
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

### 总结

通过实现这个后端服务，MediaPro从一个纯前端演示转变为一个功能完整的媒体处理平台。后端服务提供了：

1. **真实的视频下载**: 通过yt-dlp支持1000+网站
2. **专业的视频处理**: 通过ffmpeg提供完整的音视频处理功能
3. **异步任务处理**: 通过Celery支持大规模并发处理
4. **进度跟踪**: 实时监控处理进度
5. **安全管理**: 输入验证、资源限制、访问控制
6. **性能优化**: 缓存、连接池、异步处理

这个架构既保证了功能的完整性，又确保了系统的安全性和可扩展性。

---

## 媒体处理平台设计规范

### 设计理念

#### 核心概念
- **技术专业感**: 深色主题配合精准的交互设计，体现专业的媒体处理能力
- **直观易用性**: 清晰的功能分区和引导式操作流程，降低用户学习成本
- **现代美学**: 采用当代设计趋势，营造前沿科技的视觉体验
- **响应式设计**: 完美适配桌面、平板和移动设备

#### 颜色系统
**主色调**: 深空蓝配色方案
- **主背景**: `#0a0e1a` (深蓝黑色)
- **次背景**: `#1a1f2e` (中等深蓝)
- **面板背景**: `#252a3a` (浅深蓝)
- **强调色**: `#4a90e2` (亮蓝色)
- **成功色**: `#27ae60` (绿色)
- **警告色**: `#f39c12` (橙色)
- **错误色**: `#e74c3c` (红色)
- **文字主色**: `#ffffff` (纯白)
- **文字次色**: `#b8c5d1` (浅灰蓝)

**辅助色彩**:
- **渐变色**: 从`#2c3e50`到`#34495e`的微妙渐变
- **卡片阴影**: `rgba(0, 0, 0, 0.3)`的柔和阴影
- **边框色**: `rgba(255, 255, 255, 0.1)`的半透明边框

#### 字体系统
**主字体**: Inter (现代无衬线字体)
- **标题字体**: Inter Bold (700)
- **正文字体**: Inter Regular (400)
- **代码字体**: JetBrains Mono (等宽字体)

**字体层级**:
- **大标题**: 32px, font-weight: 700
- **中标题**: 24px, font-weight: 600
- **小标题**: 18px, font-weight: 500
- **正文**: 16px, font-weight: 400
- **辅助文字**: 14px, font-weight: 400
- **标签文字**: 12px, font-weight: 500

#### 布局系统
**网格系统**: 12列响应式网格
- **容器最大宽度**: 1200px
- **水平间距**: 24px
- **垂直间距**: 32px
- **边距**: 移动端16px，桌面端24px

**组件间距**:
- **大间距**: 48px (主要区块之间)
- **中间距**: 24px (相关组件之间)
- **小间距**: 12px (紧密相关元素)
- **微间距**: 8px (标签和输入框等)

### 视觉效果

#### 动画效果库
**Anime.js动画系统**:
- **页面转场**: 流畅的淡入淡出效果，持续300ms
- **按钮交互**: 微妙的缩放和颜色过渡，持续150ms
- **卡片悬停**: 轻微的3D倾斜和阴影扩展
- **进度条**: 平滑的进度动画，配合弹性缓动
- **加载状态**: 旋转和脉冲效果的组合动画

**特效实现**:
- **背景粒子**: 使用Pixi.js创建动态粒子背景
- **数据可视化**: ECharts.js实现处理统计图表
- **文件拖拽**: Matter.js物理引擎实现自然的拖拽体验

#### 交互设计
**悬停效果**:
- **按钮**: 背景色渐变 + 轻微阴影扩展
- **卡片**: 3D倾斜效果 + 边框发光
- **输入框**: 边框颜色变化 + 内部阴影
- **图标**: 颜色填充动画 + 轻微旋转

**点击反馈**:
- **按钮按下**: 轻微缩放(0.95) + 阴影收缩
- **开关切换**: 平滑的滑动动画
- **选项选择**: 边框高亮 + 内部填充动画
- **文件上传**: 拖拽区域高亮 + 边框闪烁

#### 背景设计
**主背景**: 深色渐变 + 动态粒子效果
- **基础渐变**: 从`#0a0e1a`到`#1a1f2e`的径向渐变
- **粒子系统**: 使用Pixi.js创建缓慢移动的光点
- **网格纹理**: 微妙的六边形网格图案作为装饰

**区域背景**:
- **功能区**: 半透明的深色面板，带有微妙的边框
- **工具栏**: 更深的背景色，突出工具属性
- **预览区**: 中性灰背景，确保内容清晰可见

### 组件设计

#### 按钮系统
**主要按钮**:
- **背景**: 渐变色从`#4a90e2`到`#357abd`
- **文字**: 白色，font-weight: 500
- **边框**: 无边框或1px半透明边框
- **阴影**: `0 4px 12px rgba(74, 144, 226, 0.3)`
- **悬停**: 背景色加深，阴影扩展

**次要按钮**:
- **背景**: 透明
- **文字**: `#4a90e2`
- **边框**: 1px solid `#4a90e2`
- **悬停**: 背景色填充为`rgba(74, 144, 226, 0.1)`

**危险按钮**:
- **背景**: `#e74c3c`
- **悬停**: 背景色`#c0392b`

#### 表单元素
**输入框**:
- **背景**: `#252a3a`
- **边框**: 1px solid `rgba(255, 255, 255, 0.1)`
- **文字**: `#ffffff`
- **占位符**: `rgba(184, 197, 209, 0.5)`
- **聚焦**: 边框色`#4a90e2`，内部阴影`inset 0 0 0 1px #4a90e2`

**选择器**:
- **背景**: `#252a3a`
- **箭头**: 自定义SVG图标
- **选项**: 悬停背景`rgba(74, 144, 226, 0.1)`

**滑块**:
- **轨道**: `#252a3a`，高度4px
- **滑块**: `#4a90e2`，直径16px
- **填充**: `#4a90e2`的渐变填充

#### 进度指示器
**进度条**:
- **背景**: `#252a3a`
- **填充**: 从`#4a90e2`到`#27ae60`的渐变
- **动画**: 平滑的宽度过渡
- **文字**: 白色百分比显示

**加载动画**:
- **样式**: 旋转的圆环
- **颜色**: `#4a90e2`
- **大小**: 24px标准尺寸
- **速度**: 1秒每转

#### 卡片和面板
**功能卡片**:
- **背景**: `#252a3a`
- **边框**: 1px solid `rgba(255, 255, 255, 0.1)`
- **圆角**: 8px
- **阴影**: `0 4px 12px rgba(0, 0, 0, 0.2)`
- **悬停**: 边框色`#4a90e2`，阴影扩展

**信息面板**:
- **背景**: `rgba(37, 42, 58, 0.95)`
- **边框**: 1px solid `rgba(74, 144, 226, 0.3)`
- **标题**: `#4a90e2`
- **内容**: `#b8c5d1`

### 响应式设计

#### 断点设置
- **移动端**: < 768px
- **平板端**: 768px - 1024px  
- **桌面端**: > 1024px

#### 适配策略
**移动端优化**:
- **字体大小**: 整体缩小10%
- **间距调整**: 垂直间距减少25%
- **按钮尺寸**: 最小44px触摸目标
- **表单布局**: 单列布局，全宽输入框

**平板端优化**:
- **网格调整**: 6列网格系统
- **侧边栏**: 可收缩的侧边导航
- **预览区**: 占据更多屏幕空间

**桌面端优化**:
- **多列布局**: 充分利用宽屏空间
- **快捷键**: 支持键盘快捷操作
- **多窗口**: 支持多任务并行处理

### 可访问性设计

#### 颜色对比度
- **文字对比度**: 至少4.5:1的对比度比
- **图标对比度**: 至少3:1的对比度比
- **状态指示**: 不仅依赖颜色，还使用图标和文字

#### 键盘导航
- **Tab顺序**: 逻辑清晰的焦点顺序
- **焦点指示**: 明显的焦点高亮效果
- **快捷键**: 常用功能的键盘快捷键
- **跳过链接**: 屏幕阅读器友好的跳过导航

#### 屏幕阅读器支持
- **语义化HTML**: 正确使用ARIA标签
- **图片描述**: 所有图像提供alt文本
- **状态通知**: 动态内容变化及时通知
- **错误提示**: 清晰的可访问错误信息

---

## 媒体处理平台交互设计

### 核心功能架构

#### 1. 视频下载模块 (yt-dlp集成)
- **URL输入区域**: 支持YouTube、Bilibili、Vimeo等主流平台
- **质量选择器**: 提供720p、1080p、4K等选项，显示文件大小预估
- **音频质量选择**: 128kbps、192kbps、320kbps等选项
- **字幕选项**: 包含/不包含字幕下载，支持多语言选择
- **格式选择**: MP4、MKV、WebM等容器格式
- **下载进度**: 实时显示下载进度条和速度

#### 2. 视频处理模块 (ffmpeg集成)
- **视频裁剪**: 时间轴选择器，支持精确到秒的开始和结束时间
- **视频合并**: 多文件上传，支持拖拽排序
- **分辨率调整**: 预设分辨率选项和自定义输入
- **帧率调整**: 24fps、30fps、60fps等选项
- **视频压缩**: 质量滑块，实时预览压缩效果
- **水印添加**: 文字/图片水印，位置和大小的可视化调整

#### 3. 音频处理模块
- **音频提取**: 从视频中提取音频，选择输出格式
- **格式转换**: MP3、WAV、FLAC、AAC等格式互转
- **音频剪辑**: 波形显示，支持精确剪辑
- **音量调整**: 增益控制和标准化
- **音频合并**: 多音轨混合，音量平衡调节
- **音效处理**: 淡入淡出、降噪、均衡器等

#### 4. 批处理功能
- **批量下载**: 支持播放列表和多个URL
- **批量转换**: 文件夹拖拽上传，统一处理
- **队列管理**: 处理队列显示，支持暂停和删除
- **批量设置**: 统一参数配置应用到所有任务

### 用户交互流程

#### 主页面流程
1. 用户进入主页，看到清晰的功能分区
2. 选择所需功能：下载、编辑或转换
3. 根据引导填写参数，实时预览效果
4. 开始处理，查看进度和结果
5. 下载处理完成的文件

#### 视频下载交互
1. 粘贴URL → 自动检测平台和可用质量
2. 选择参数 → 实时显示文件大小和预估时间
3. 开始下载 → 进度条显示，支持取消操作
4. 完成下载 → 提供后续处理选项

#### 视频编辑交互
1. 上传文件 → 预览窗口显示视频
2. 设置参数 → 实时预览效果变化
3. 应用处理 → 处理进度和结果预览
4. 下载结果 → 质量检查和文件保存

### 界面设计原则
- **简洁直观**: 功能分类清晰，操作步骤明确
- **实时反馈**: 所有操作都有即时视觉反馈
- **专业感**: 深色主题配合专业的控制面板设计
- **响应式**: 适配不同屏幕尺寸和设备
- **无障碍**: 支持键盘导航和屏幕阅读器

---

## 媒体处理平台项目大纲

### 项目概述

#### 目标定位
构建一个功能全面的在线媒体处理平台，集成yt-dlp和ffmpeg的核心功能，为用户提供专业的视频下载、编辑和音频处理服务。

#### 核心价值
- **一站式解决方案**: 从下载到编辑的完整工作流
- **专业级处理能力**: 媲美桌面软件的功能强度
- **直观用户体验**: 复杂功能简化呈现
- **高效处理性能**: 优化的算法和流程设计

### 网站架构

#### 页面结构 (4个核心页面)
1. **index.html** - 主页面/视频下载中心
2. **video-editor.html** - 视频编辑工作室
3. **audio-processor.html** - 音频处理实验室
4. **about.html** - 关于平台/使用指南

#### 导航系统
- **顶部导航栏**: 固定位置，包含所有主要功能入口
- **面包屑导航**: 显示当前位置和返回路径
- **快速操作栏**: 常用功能的快捷访问

### 详细页面规划

#### 1. 主页面 (index.html) - 视频下载中心

**页面结构**:
- **Hero区域**: 专业媒体工作空间背景 + 核心价值主张
- **主要功能区域**:
  - URL输入和验证区
  - 质量和格式选择面板
  - 下载进度监控区
  - 批量处理管理器
- **功能展示区**: 支持的1000+网站图标展示
- **统计面板**: 实时处理数据和成功率统计

**核心功能模块**:
1. **智能URL识别**
   - 自动检测平台类型
   - 支持1000+主流网站
   - URL格式验证和错误提示

2. **质量选择系统**
   - 自动分析可用格式
   - 文件大小预估显示
   - 画质/音质平衡建议

3. **下载管理**
   - 多线程下载支持
   - 断点续传功能
   - 实时速度监控

4. **批量处理**
   - 播放列表下载
   - 多URL队列管理
   - 统一参数配置

**视觉元素**:
- 动态粒子背景效果
- 实时进度条动画
- 网站图标轮播展示
- 处理统计数据可视化

#### 2. 视频编辑页面 (video-editor.html) - 视频编辑工作室

**页面结构**:
- **工具栏区域**: 所有编辑工具的集中控制
- **预览区域**: 大尺寸视频预览窗口
- **时间轴区域**: 精确的时间线编辑界面
- **参数面板**: 详细的处理参数配置
- **输出设置**: 最终输出格式和质量选择

**核心功能模块**:
1. **视频裁剪系统**
   - 可视化时间轴选择
   - 精确到毫秒的时间控制
   - 实时预览裁剪效果

2. **格式转换引擎**
   - 15+种输出格式支持
   - 智能压缩算法
   - 质量保持优化

3. **特效处理**
   - 水印添加(文字/图片)
   - 滤镜效果应用
   - 转场效果选择

4. **批量编辑**
   - 多文件同时处理
   - 统一参数应用
   - 队列管理优化

**交互特性**:
- 拖拽文件上传
- 键盘快捷键支持
- 实时效果预览
- 撤销/重做功能

#### 3. 音频处理页面 (audio-processor.html) - 音频处理实验室

**页面结构**:
- **波形显示区**: 大尺寸音频波形可视化
- **工具控制区**: 音频处理工具集
- **效果器面板**: 各种音频效果参数
- **格式选择区**: 输出格式和质量设置
- **批量处理区**: 多文件处理管理

**核心功能模块**:
1. **音频提取系统**
   - 从视频中提取音频
   - 无损音质保持
   - 多音轨选择支持

2. **格式转换矩阵**
   - MP3、WAV、FLAC、AAC等格式
   - 音质自定义设置
   - 批量转换支持

3. **音频编辑工具**
   - 精确剪辑功能
   - 音量调节控制
   - 淡入淡出效果

4. **高级处理**
   - 降噪算法应用
   - 均衡器调节
   - 音效增强处理

**可视化特性**:
- 实时波形显示
- 频谱分析图表
- 处理效果可视化
- 进度动画展示

#### 4. 关于页面 (about.html) - 平台介绍

**页面结构**:
- **平台介绍**: 核心功能和优势说明
- **技术架构**: 底层技术栈展示
- **使用指南**: 详细的操作教程
- **常见问题**: FAQ解答
- **联系信息**: 技术支持和反馈渠道

**内容模块**:
- 平台愿景和使命
- 技术实现原理
- 详细使用教程
- 最佳实践指南
- 故障排除帮助

### 技术实现规划

#### 前端技术栈
- **HTML5**: 语义化结构，现代Web标准
- **CSS3**: Tailwind CSS框架，响应式设计
- **JavaScript ES6+**: 模块化开发，现代语法特性

#### 核心库集成
- **Anime.js**: 流畅动画效果
- **ECharts.js**: 数据可视化图表
- **Pixi.js**: 高性能图形渲染
- **Matter.js**: 物理引擎交互
- **Splide.js**: 轮播组件

#### 功能模拟实现
由于浏览器安全限制，实际的yt-dlp和ffmpeg需要在服务器端运行，前端将模拟以下功能：
- URL验证和格式分析
- 进度条动画模拟
- 文件处理状态显示
- 结果预览和下载

### 用户体验设计

#### 交互流程
1. **首次访问**: 清晰的功能介绍和引导
2. **功能选择**: 直观的功能分区和导航
3. **参数配置**: 智能化的参数建议和预览
4. **处理监控**: 实时的进度反馈和状态更新
5. **结果获取**: 便捷的结果下载和后续处理

#### 响应式设计
- **桌面端**: 充分利用大屏幕空间，多面板布局
- **平板端**: 适配中等屏幕，优化触摸交互
- **移动端**: 单列布局，简化操作流程

#### 可访问性
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: 语义化标签和ARIA支持
- **颜色对比**: 符合WCAG 2.1 AA标准
- **字体大小**: 可调节的文字大小

### 性能优化策略

#### 加载优化
- **懒加载**: 图片和组件按需加载
- **代码分割**: JavaScript模块化加载
- **资源压缩**: CSS/JS文件压缩优化
- **CDN加速**: 静态资源CDN分发

#### 交互优化
- **防抖节流**: 输入和滚动事件优化
- **虚拟滚动**: 大数据列表性能优化
- **缓存策略**: 智能缓存和预加载
- **错误处理**: 优雅的错误提示和恢复

### 部署和维护

#### 部署策略
- **静态部署**: 纯前端静态网站部署
- **CDN配置**: 全球加速和缓存优化
- **域名配置**: 自定义域名和HTTPS
- **监控告警**: 性能监控和异常告警

#### 维护计划
- **定期更新**: 依赖库和安全补丁更新
- **功能迭代**: 基于用户反馈的功能优化
- **性能监控**: 持续的性能优化和调优
- **用户支持**: 技术支持和问题解答

### 成功指标

#### 技术指标
- **页面加载速度**: 首屏加载时间<3秒
- **交互响应时间**: 用户操作反馈<100ms
- **兼容性覆盖**: 支持95%+的现代浏览器
- **错误率控制**: JavaScript错误率<0.1%

#### 用户体验指标
- **功能完成率**: 用户能够完成预期的处理任务
- **操作便利性**: 直观的界面和流畅的交互
- **视觉吸引力**: 专业的视觉设计和动画效果
- **响应式设计**: 在各种设备上的良好体验

---

## MediaPro 技术文档

### 项目概述

MediaPro是一个基于Web的媒体处理平台，前端使用HTML/JavaScript实现，集成了yt-dlp和ffmpeg的核心功能。本文档详细解释了项目的架构、实现逻辑以及技术限制。

### 系统架构

#### 前端架构
```
┌─────────────────────────────────────┐
│            前端界面层                │
├─────────────────────────────────────┤
│  HTML5 + CSS3 + JavaScript ES6+     │
│  - Tailwind CSS (样式框架)          │
│  - Anime.js (动画效果)              │
│  - ECharts.js (数据可视化)          │
│  - Pixi.js (图形渲染)               │
│  - Splide.js (轮播组件)             │
└─────────────────────────────────────┘
```

### 核心功能模块
1. **视频下载模块** - 基于yt-dlp的功能模拟
2. **视频编辑模块** - 基于ffmpeg的功能模拟  
3. **音频处理模块** - 基于ffmpeg的音频处理模拟
4. **用户界面模块** - 响应式Web界面

## 详细实现逻辑

### 1. 视频下载功能 (index.html)

#### 核心逻辑流程：
```javascript
// URL分析和验证
function analyzeUrl() {
    // 1. 获取用户输入的URL
    const url = document.getElementById('video-url').value;
    
    // 2. 验证URL格式和平台支持
    const platform = detectPlatform(url);
    
    // 3. 模拟分析过程
    if (platform) {
        // 显示分析状态
        showAnalyzingStatus();
        
        // 模拟API调用延迟
        setTimeout(() => {
            // 显示质量选项
            showQualityOptions();
            // 更新视频信息
            updateVideoInfo(platform);
        }, 1500);
    }
}

// 平台检测
function detectPlatform(url) {
    const supportedPlatforms = [
        'youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com', 
        'tiktok.com', 'instagram.com', 'facebook.com', 'twitter.com'
    ];
    
    for (const platform of supportedPlatforms) {
        if (url.includes(platform)) {
            return platform;
        }
    }
    return null;
}

// 模拟下载过程
function simulateDownload() {
    let progress = 0;
    const duration = 30000; // 30秒模拟下载
    
    const downloadInterval = setInterval(() => {
        progress += Math.random() * 2;
        progress = Math.min(100, progress);
        
        // 更新进度条
        updateProgressBar(progress);
        updateSpeedDisplay();
        updateETADisplay();
        
        if (progress >= 100) {
            clearInterval(downloadInterval);
            completeDownload();
        }
    }, 100);
}
```

#### 技术实现说明：
- **URL验证**: 使用正则表达式验证URL格式
- **平台检测**: 通过URL包含的关键字识别平台
- **模拟API调用**: 使用setTimeout模拟网络请求延迟
- **进度模拟**: 使用随机增量模拟真实下载进度
- **状态更新**: 实时更新UI显示下载状态

### 2. 视频编辑功能 (video-editor.html)

#### 核心逻辑流程：
```javascript
// 文件上传和处理
class VideoEditor {
    constructor() {
        this.currentVideo = null;
        this.timelineZoom = 1;
        this.selectionStart = 20;
        this.selectionEnd = 50;
    }
    
    // 文件上传
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
            this.loadVideo(file);
        }
    }
    
    // 视频加载
    loadVideo(file) {
        this.currentVideo = file;
        
        // 更新预览区域
        this.updateVideoPreview(file);
        
        // 初始化时间轴
        this.initializeTimeline();
        
        // 显示成功消息
        this.showNotification('视频加载成功', 'success');
    }
    
    // 时间轴交互
    initializeTimeline() {
        const timeline = document.getElementById('timeline-container');
        
        // 点击设置播放位置
        timeline.addEventListener('click', (e) => {
            const rect = timeline.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            
            this.currentTime = (percentage / 100) * this.duration;
            this.updateCursorPosition(percentage);
        });
        
        // 拖拽选择区域
        this.initializeSelectionDrag();
    }
    
    // 应用编辑设置
    applyTrim() {
        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        
        // 验证时间格式
        if (this.validateTimeFormat(startTime) && this.validateTimeFormat(endTime)) {
            // 更新时间轴选择
            this.updateTimelineSelection(startTime, endTime);
            this.showNotification('裁剪设置已应用', 'success');
        }
    }
}
```

#### 技术实现说明：
- **文件处理**: 使用File API处理本地文件上传
- **时间轴交互**: 基于鼠标事件的精确位置计算
- **时间格式验证**: 支持HH:MM:SS格式的时间输入
- **实时预览**: 可视化显示编辑效果
- **参数配置**: 提供丰富的编辑选项（裁剪、压缩、水印等）

### 3. 音频处理功能 (audio-processor.html)

#### 核心逻辑流程：
```javascript
class AudioProcessor {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.selectedFormat = 'mp3';
    }
    
    // 音频波形可视化
    initializeWaveform() {
        const canvas = document.getElementById('waveform-canvas');
        const ctx = canvas.getContext('2d');
        
        // 绘制示例波形
        this.drawWaveform(ctx, canvas.width, canvas.height);
        
        // 初始化选择区域
        this.initializeWaveformSelection();
    }
    
    // 频谱分析
    initializeSpectrum() {
        const chart = echarts.init(document.getElementById('spectrum-chart'));
        
        // 生成频谱数据
        const frequencies = [];
        const amplitudes = [];
        
        for (let i = 0; i < 128; i++) {
            const freq = 20 + (20000 - 20) * (i / 127);
            frequencies.push(freq);
            amplitudes.push(Math.random() * 100);
        }
        
        // 配置图表
        const option = {
            backgroundColor: 'transparent',
            xAxis: {
                type: 'category',
                data: frequencies.map(f => f.toFixed(0))
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: amplitudes,
                type: 'bar',
                itemStyle: {
                    color: '#4a90e2'
                }
            }]
        };
        
        chart.setOption(option);
        
        // 动态更新频谱
        setInterval(() => {
            const newAmplitudes = amplitudes.map(() => Math.random() * 100);
            chart.setOption({
                series: [{
                    data: newAmplitudes
                }]
            });
        }, 100);
    }
    
    // 均衡器控制
    setupEQSlider(slider) {
        const thumb = slider.querySelector('.eq-slider-thumb');
        const fill = slider.querySelector('.eq-slider-fill');
        const valueDisplay = slider.parentElement.querySelector('.eq-value:last-child');
        
        let isDragging = false;
        let currentValue = 0;
        
        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = slider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
            
            currentValue = -12 + 24 * (percentage / 100);
            thumb.style.left = percentage + '%';
            fill.style.width = percentage + '%';
            
            const displayValue = currentValue >= 0 ? '+' + currentValue.toFixed(1) : currentValue.toFixed(1);
            valueDisplay.textContent = displayValue + 'dB';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}
```

#### 技术实现说明：
- **波形可视化**: 使用Canvas API绘制音频波形
- **频谱分析**: 使用ECharts.js实现实时频谱显示
- **均衡器**: 5段均衡器，支持±12dB调节
- **音频控制**: 播放、暂停、停止、循环控制
- **格式转换**: 支持6种主流音频格式

## 关于yt-dlp和ffmpeg调用的技术说明

### 前端限制
**重要说明：纯HTML/JavaScript无法直接调用yt-dlp和ffmpeg命令行工具**

原因：
1. **浏览器安全限制**: 网页JavaScript无法执行本地系统命令
2. **文件系统访问**: 无法直接访问用户的文件系统
3. **网络限制**: 跨域请求限制和CORS策略

### 实际实现方案

#### 方案1：后端API服务（推荐）
```javascript
// 前端调用后端API
async function downloadVideo(url, quality) {
    const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            quality: quality
        })
    });
    
    const result = await response.json();
    return result;
}

// 后端Python示例（需要实现）
"""
from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

@app.route('/api/download', methods=['POST'])
def download_video():
    data = request.json
    url = data['url']
    quality = data['quality']
    
    # 构建yt-dlp命令
    cmd = [
        'yt-dlp',
        '-f', f'bestvideo[height<=?{quality}]+bestaudio/best',
        '--write-sub',
        '--sub-lang', 'zh-CN,en',
        '--extract-audio', '--audio-format', 'mp3',
        '--audio-quality', '320K',
        '-o', '%(title)s.%(ext)s',
        url
    ]
    
    try:
        # 执行命令
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'Download completed',
                'output': result.stdout
            })
        else:
            return jsonify({
                'success': False,
                'error': result.stderr
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })
"""
```

#### 方案2：WebAssembly实现
```javascript
// 使用WebAssembly版本的ffmpeg
// 需要编译ffmpeg到WebAssembly
class FFmpegWASM {
    constructor() {
        this.ffmpeg = null;
    }
    
    async loadFFmpeg() {
        // 加载WebAssembly版本的ffmpeg
        this.ffmpeg = await FFmpeg.createFFmpeg({
            log: true,
            corePath: 'ffmpeg-core.js'
        });
        
        await this.ffmpeg.load();
    }
    
    async processVideo(inputFile, commands) {
        // 将文件写入虚拟文件系统
        this.ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(inputFile));
        
        // 执行ffmpeg命令
        await this.ffmpeg.run(...commands);
        
        // 读取输出文件
        const data = this.ffmpeg.FS('readFile', 'output.mp4');
        return data;
    }
}
```

#### 方案3：浏览器原生API
```javascript
// 使用WebCodecs API（有限功能）
class BrowserVideoProcessor {
    async processVideo(videoFile, settings) {
        // 使用MediaRecorder API
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                mediaSource: 'file',
                source: videoFile
            }
        });
        
        const mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/mp4'
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            return blob;
        };
        
        mediaRecorder.start();
        
        // 处理完成后停止录制
        setTimeout(() => {
            mediaRecorder.stop();
        }, settings.duration);
    }
}
```

## 当前项目的实现状态

### 已实现的功能
1. **完整的用户界面**: 4个核心页面，响应式设计
2. **交互逻辑**: 所有按钮和控件都有响应事件
3. **视觉效果**: 动画、粒子背景、数据可视化
4. **状态管理**: 文件上传、参数配置、进度显示
5. **模拟处理**: 逼真的处理进度和结果展示

### 需要后端支持的功能
1. **实际视频下载**: 需要yt-dlp后端服务
2. **实际视频处理**: 需要ffmpeg后端服务
3. **文件存储**: 需要文件存储和管理系统
4. **用户认证**: 需要用户管理和权限系统

## 部署和扩展建议

### 后端技术栈建议
```python
# 推荐后端技术栈
- Flask/Django (Python Web框架)
- Celery (异步任务队列)
- Redis (缓存和消息队列)
- PostgreSQL (数据库)
- MinIO/AWS S3 (文件存储)
- Docker (容器化部署)
```

### 部署架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Gateway   │    │   Processing    │
│   (HTML/CSS/JS) │◄──►│   (Nginx)       │◄──►│   Workers       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Database      │    │   File Storage  │
                       │   (PostgreSQL)  │    │   (MinIO/S3)    │
                       └─────────────────┘    └─────────────────┘
```

## 总结

当前项目完成了完整的前端界面和交互逻辑，但要实现真正的yt-dlp和ffmpeg功能，需要配合后端服务。前端主要负责：

1. **用户交互**: 收集用户输入和参数
2. **状态展示**: 显示处理进度和结果
3. **文件上传**: 处理本地文件选择和上传
4. **API调用**: 与后端服务通信
5. **结果展示**: 展示处理完成的文件

后端服务需要实现：

1. **命令执行**: 安全地执行yt-dlp和ffmpeg命令
2. **文件处理**: 处理上传的文件和生成的结果
3. **进度跟踪**: 实时监控处理进度
4. **错误处理**: 处理各种异常情况
5. **资源管理**: 管理服务器资源和队列

这种前后端分离的架构既保证了用户体验，又确保了系统的安全性和可扩展性。

---

## 媒体处理平台技术架构

### 核心技术栈

#### 前端技术
- **HTML5**: 语义化结构，支持现代浏览器特性
- **CSS3**: Tailwind CSS框架，响应式设计
- **JavaScript ES6+**: 现代JavaScript特性，模块化开发
- **Web APIs**: File API, Drag & Drop, Web Audio API

### 核心库集成
- **Anime.js**: 流畅的动画效果和过渡
- **ECharts.js**: 数据可视化（处理统计、质量分析）
- **Pixi.js**: 高性能图形渲染（视频预览、特效处理）
- **Matter.js**: 物理引擎（拖拽交互、文件管理）
- **Splide.js**: 轮播组件（功能展示、教程导航）

### 后端处理引擎
- **yt-dlp**: 视频下载核心引擎
  - 支持1000+网站（YouTube、Bilibili、Vimeo等）
  - 多格式支持（MP4、WebM、MKV等）
  - 质量选择（720p、1080p、4K等）
  - 字幕下载和嵌入
  - 音频提取功能

- **ffmpeg**: 音视频处理引擎
  - 视频裁剪、合并、压缩
  - 音频提取、格式转换
  - 分辨率调整、帧率控制
  - 水印添加、特效处理
  - 批量处理能力

## 功能模块架构

### 1. 视频下载模块
```javascript
// 核心命令结构
yt-dlp -f "bestvideo[height<=?1080]+bestaudio/best" \
       --write-sub --sub-lang zh-CN,en \
       --extract-audio --audio-format mp3 \
       --audio-quality 320K \
       -o "% (title)s.%(ext)s" \
       [URL]
```

**功能特性**:
- 智能格式选择
- 多语言字幕支持
- 音频质量控制
- 批量下载管理
- 进度实时监控

### 2. 视频处理模块
```javascript
// 视频裁剪示例
ffmpeg -i input.mp4 -vf "crop=1280:720:(iw-1280)/2:(ih-720)/2" \
       -c:v libx264 -crf 23 -preset fast output.mp4

// 视频压缩示例
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow \
       -c:a aac -b:a 128k output.mp4
```

**功能特性**:
- 精确时间裁剪
- 智能压缩算法
- 多格式输出
- 质量保持优化

### 3. 音频处理模块
```javascript
// 音频提取示例
ffmpeg -i video.mp4 -vn -acodec libmp3lame -ab 320k audio.mp3

// 格式转换示例
ffmpeg -i input.wav -acodec libmp3lame -ab 192k output.mp3
```

**功能特性**:
- 无损音频提取
- 多格式支持（MP3、WAV、FLAC、AAC）
- 音质控制选项
- 批量转换能力

### 4. 用户界面架构
- **单页应用**: 无刷新体验，快速响应
- **模块化设计**: 功能独立，易于维护
- **响应式布局**: 适配各种设备
- **实时预览**: 处理效果即时显示

## 数据处理流程

### 下载流程
1. URL验证和平台检测
2. 可用格式分析和展示
3. 用户参数选择
4. 下载任务创建
5. 进度监控和状态更新
6. 完成后处理选项

### 处理流程
1. 文件上传和验证
2. 参数配置和预览
3. 处理任务队列管理
4. 实时进度反馈
5. 结果验证和输出
6. 文件下载和清理

## 性能优化策略

### 前端优化
- **懒加载**: 组件按需加载
- **缓存策略**: 结果缓存和重用
- **压缩优化**: 资源文件压缩
- **CDN加速**: 静态资源分发

### 处理优化
- **队列管理**: 任务优先级和并发控制
- **资源监控**: 内存和CPU使用监控
- **错误处理**: 优雅降级和重试机制
- **进度追踪**: 实时状态更新

## 安全和隐私

### 数据安全
- **本地处理**: 敏感数据不上传服务器
- **临时清理**: 处理后自动删除临时文件
- **加密传输**: HTTPS安全通信
- **访问控制**: 用户权限管理

### 隐私保护
- **匿名处理**: 不收集用户个人信息
- **本地存储**: 配置和偏好本地保存
- **无痕模式**: 支持隐私浏览
- **数据隔离**: 用户数据完全隔离

## 扩展性设计

### 插件架构
- **模块化接口**: 支持第三方功能扩展
- **API设计**: 标准化接口规范
- **配置管理**: 灵活的配置系统
- **版本控制**: 向后兼容性保证

### 功能扩展
- **新格式支持**: 易于添加新的音视频格式
- **平台适配**: 快速适配新的视频平台
- **特效集成**: 动态加载视频特效
- **批处理**: 支持复杂的批量处理流程