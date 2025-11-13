#!/bin/bash

# MediaPro 后端服务启动脚本

echo "==================================="
echo "MediaPro 后端服务启动脚本"
echo "==================================="

# 检查Python3是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: Python3 未安装"
    echo "请先安装 Python3: https://www.python.org/downloads/"
    exit 1
fi

# 检查pip是否安装
if ! command -v pip3 &> /dev/null; then
    echo "错误: pip3 未安装"
    echo "请先安装 pip3"
    exit 1
fi

# 检查yt-dlp是否安装
if ! command -v yt-dlp &> /dev/null; then
    echo "警告: yt-dlp 未安装"
    echo "正在安装 yt-dlp..."
    pip3 install yt-dlp
fi

# 检查ffmpeg是否安装
if ! command -v ffmpeg &> /dev/null; then
    echo "警告: ffmpeg 未安装"
    echo "请先安装 ffmpeg:"
    echo "  Ubuntu/Debian: sudo apt install ffmpeg"
    echo "  macOS: brew install ffmpeg"
    echo "  Windows: 从 https://ffmpeg.org/download.html 下载"
    exit 1
fi

# 检查Redis是否安装（可选）
if command -v redis-server &> /dev/null; then
    echo "✓ Redis 已安装"
    # 尝试启动Redis（如果未运行）
    if ! redis-cli ping &> /dev/null; then
        echo "正在启动 Redis 服务..."
        redis-server --daemonize yes
    fi
else
    echo "⚠ Redis 未安装（可选）"
    echo "  如需安装: sudo apt install redis-server (Ubuntu/Debian)"
    echo "  或: brew install redis (macOS)"
fi

# 安装Python依赖
echo "正在安装Python依赖..."
pip3 install -r requirements.txt

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p downloads processed temp

# 显示版本信息
echo ""
echo "版本信息:"
echo "-----------"
python3 --version
echo "yt-dlp版本: $(yt-dlp --version 2>/dev/null || echo '未知')"
echo "FFmpeg版本: $(ffmpeg -version 2>/dev/null | head -1 || echo '未知')"

# 启动服务
echo ""
echo "正在启动 MediaPro 后端服务..."
echo "服务将在 http://localhost:5000 启动"
echo "按 Ctrl+C 停止服务"
echo ""

# 运行Flask应用
python3 app.py