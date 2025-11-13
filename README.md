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