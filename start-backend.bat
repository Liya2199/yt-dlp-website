@echo off
REM MediaPro 后端服务启动脚本 (Windows)

echo ===================================
echo MediaPro 后端服务启动脚本
echo ===================================

REM 检查Python是否安装
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: Python 未安装
    echo 请先安装 Python: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查pip是否安装
where pip >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误: pip 未安装
    echo 请先安装 pip
    pause
    exit /b 1
)

REM 检查yt-dlp是否安装
where yt-dlp >nul 2>nul
if %errorlevel% neq 0 (
    echo 警告: yt-dlp 未安装
    echo 正在安装 yt-dlp...
    pip install yt-dlp
)

REM 检查ffmpeg是否安装
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo 警告: ffmpeg 未安装
    echo 请先安装 ffmpeg:
    echo   从 https://ffmpeg.org/download.html 下载Windows版本
    echo   并将ffmpeg.exe添加到系统PATH
    pause
    exit /b 1
)

REM 检查Redis是否安装（可选）
where redis-server >nul 2>nul
if %errorlevel% equ 0 (
    echo √ Redis 已安装
) else (
    echo ○ Redis 未安装（可选）
    echo   如需安装，请从 https://github.com/tporadowski/redis/releases 下载
)

REM 安装Python依赖
echo 正在安装Python依赖...
pip install -r requirements.txt

REM 创建必要的目录
echo 创建必要的目录...
if not exist downloads mkdir downloads
if not exist processed mkdir processed
if not exist temp mkdir temp

REM 显示版本信息
echo.
echo 版本信息:
echo -----------
python --version
for /f "tokens=*" %%i in ('yt-dlp --version 2^>nul') do (
    echo yt-dlp版本: %%i
) || echo yt-dlp版本: 未知

for /f "tokens=*" %%i in ('ffmpeg -version 2^>nul ^| findstr /n "^" ^| findstr "^1:"') do (
    echo FFmpeg版本: %%i
) || echo FFmpeg版本: 未知

REM 启动服务
echo.
echo 正在启动 MediaPro 后端服务...
echo 服务将在 http://localhost:5000 启动
echo 按 Ctrl+C 停止服务
echo.

REM 运行Flask应用
python app.py

REM 暂停，方便查看错误信息
pause