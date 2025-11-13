# MediaPro 技术文档

## 项目概述

MediaPro是一个基于Web的媒体处理平台，前端使用HTML/JavaScript实现，集成了yt-dlp和ffmpeg的核心功能。本文档详细解释了项目的架构、实现逻辑以及技术限制。

## 系统架构

### 前端架构
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