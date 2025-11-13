// MediaPro - 主要JavaScript逻辑
class MediaPro {
    constructor() {
        this.init();
        this.setupEventListeners();
        this.initializeAnimations();
        this.initializeParticleBackground();
        this.initializeCarousel();
    }
    
    init() {
        // 初始化状态
        this.currentQuality = '1080p';
        this.isProcessing = false;
        this.downloadQueue = [];
        this.supportedPlatforms = [
            'youtube.com', 'youtu.be', 'bilibili.com', 'vimeo.com', 
            'tiktok.com', 'instagram.com', 'facebook.com', 'twitter.com'
        ];
        
        // 模拟数据
        this.mockVideoInfo = {
            'youtube.com': {
                title: '示例视频标题',
                duration: '12:34',
                originalQuality: '1080p60',
                audioQuality: '192kbps',
                subtitles: '中文, 英文',
                platform: 'YouTube'
            }
        };
    }
    
    setupEventListeners() {
        // URL分析和下载相关事件
        const analyzeBtn = document.getElementById('analyze-btn');
        const downloadBtn = document.getElementById('download-btn');
        const videoUrlInput = document.getElementById('video-url');
        const batchUrlsTextarea = document.getElementById('batch-urls');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeUrl());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.startDownload());
        }
        
        if (videoUrlInput) {
            videoUrlInput.addEventListener('paste', (e) => {
                setTimeout(() => this.analyzeUrl(), 100);
            });
            videoUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeUrl();
                }
            });
        }
        
        if (batchUrlsTextarea) {
            batchUrlsTextarea.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.currentTarget.classList.add('drag-over');
            });
            
            batchUrlsTextarea.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('drag-over');
            });
            
            batchUrlsTextarea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                // 处理拖拽的文件
                this.handleFileDrop(e);
            });
        }
        
        // 质量选择器事件
        const qualitySelectors = document.querySelectorAll('.quality-selector');
        qualitySelectors.forEach(selector => {
            selector.addEventListener('click', () => {
                qualitySelectors.forEach(s => s.classList.remove('selected'));
                selector.classList.add('selected');
                this.currentQuality = selector.dataset.quality;
                this.updateFileSize();
            });
        });
        
        // 滚动动画
        window.addEventListener('scroll', () => this.handleScroll());
        
        // 统计数字动画
        this.animateStats();
    }
    
    initializeAnimations() {
        // 页面加载动画
        anime({
            targets: '.fade-in',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(200),
            duration: 800,
            easing: 'easeOutQuart'
        });
        
        // 按钮悬停动画
        const buttons = document.querySelectorAll('.btn-primary');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                anime({
                    targets: button,
                    scale: 1.05,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
            
            button.addEventListener('mouseleave', () => {
                anime({
                    targets: button,
                    scale: 1,
                    duration: 200,
                    easing: 'easeOutQuad'
                });
            });
        });
    }
    
    initializeParticleBackground() {
        // 使用PIXI.js创建粒子背景
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x0a0e1a,
            transparent: true,
            antialias: true
        });
        
        const container = document.getElementById('particle-container');
        if (container) {
            container.appendChild(app.view);
            
            // 创建粒子容器
            const particleContainer = new PIXI.Container();
            app.stage.addChild(particleContainer);
            
            // 创建粒子
            const particles = [];
            const particleCount = 50;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = new PIXI.Graphics();
                particle.beginFill(0x4a90e2, 0.3);
                particle.drawCircle(0, 0, Math.random() * 3 + 1);
                particle.endFill();
                
                particle.x = Math.random() * app.screen.width;
                particle.y = Math.random() * app.screen.height;
                particle.vx = (Math.random() - 0.5) * 0.5;
                particle.vy = (Math.random() - 0.5) * 0.5;
                
                particles.push(particle);
                particleContainer.addChild(particle);
            }
            
            // 动画循环
            app.ticker.add(() => {
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // 边界检测
                    if (particle.x < 0 || particle.x > app.screen.width) {
                        particle.vx *= -1;
                    }
                    if (particle.y < 0 || particle.y > app.screen.height) {
                        particle.vy *= -1;
                    }
                    
                    // 保持在屏幕内
                    particle.x = Math.max(0, Math.min(app.screen.width, particle.x));
                    particle.y = Math.max(0, Math.min(app.screen.height, particle.y));
                });
            });
            
            // 响应式调整
            window.addEventListener('resize', () => {
                app.renderer.resize(window.innerWidth, window.innerHeight);
            });
        }
    }
    
    initializeCarousel() {
        // 初始化平台轮播
        const carousel = new Splide('#platform-carousel', {
            type: 'loop',
            perPage: 6,
            perMove: 1,
            autoplay: true,
            interval: 2000,
            arrows: false,
            pagination: false,
            gap: '2rem',
            breakpoints: {
                768: {
                    perPage: 4,
                },
                480: {
                    perPage: 3,
                }
            }
        });
        
        carousel.mount();
    }
    
    analyzeUrl() {
        const urlInput = document.getElementById('video-url');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('请输入有效的视频URL', 'error');
            return;
        }
        
        // 检测平台
        const platform = this.detectPlatform(url);
        if (!platform) {
            this.showNotification('暂不支持该平台', 'error');
            return;
        }
        
        // 显示分析状态
        this.showAnalyzingStatus();
        
        // 模拟分析过程
        setTimeout(() => {
            this.showQualityOptions();
            this.updateVideoInfo(platform);
            this.showNotification('视频分析完成', 'success');
        }, 1500);
    }
    
    detectPlatform(url) {
        for (const platform of this.supportedPlatforms) {
            if (url.includes(platform)) {
                return platform;
            }
        }
        return null;
    }
    
    showAnalyzingStatus() {
        const analyzeBtn = document.getElementById('analyze-btn');
        analyzeBtn.innerHTML = `
            <svg class="w-4 h-4 inline mr-2 processing-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            分析中...
        `;
        analyzeBtn.disabled = true;
    }
    
    showQualityOptions() {
        const qualityOptions = document.getElementById('quality-options');
        const downloadOptions = document.getElementById('download-options');
        
        qualityOptions.classList.remove('hidden');
        downloadOptions.classList.remove('hidden');
        
        // 重置分析按钮
        const analyzeBtn = document.getElementById('analyze-btn');
        analyzeBtn.innerHTML = '分析';
        analyzeBtn.disabled = false;
    }
    
    updateVideoInfo(platform) {
        const videoInfo = this.mockVideoInfo['youtube.com'] || {
            title: '未知视频',
            duration: '未知',
            originalQuality: '未知',
            audioQuality: '未知',
            subtitles: '无',
            platform: '未知平台'
        };
        
        // 更新视频信息面板
        document.getElementById('platform').textContent = videoInfo.platform;
        document.getElementById('duration').textContent = videoInfo.duration;
        document.getElementById('original-quality').textContent = videoInfo.originalQuality;
        document.getElementById('audio-quality').textContent = videoInfo.audioQuality;
        document.getElementById('subtitles').textContent = videoInfo.subtitles;
    }
    
    updateFileSize() {
        // 根据选择的质量更新文件大小显示
        const sizeMap = {
            '720p': '~150MB',
            '1080p': '~280MB',
            '4k': '~800MB',
            'audio': '~12MB'
        };
        
        const selectedElement = document.querySelector('.quality-selector.selected');
        if (selectedElement) {
            const sizeElement = selectedElement.querySelector('.text-accent');
            if (sizeElement) {
                sizeElement.textContent = sizeMap[this.currentQuality] || '~280MB';
            }
        }
    }
    
    startDownload() {
        if (this.isProcessing) {
            this.showNotification('已有任务在处理中', 'warning');
            return;
        }
        
        this.isProcessing = true;
        const downloadProgress = document.getElementById('download-progress');
        downloadProgress.classList.remove('hidden');
        
        // 模拟下载过程
        this.simulateDownload();
    }
    
    simulateDownload() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const speedElement = document.getElementById('speed');
        const etaElement = document.getElementById('eta');
        
        let progress = 0;
        const duration = 30000; // 30秒模拟下载
        const interval = 100; // 100ms更新一次
        const increment = (100 * interval) / duration;
        
        const downloadInterval = setInterval(() => {
            progress += increment + (Math.random() * 2 - 1); // 添加随机性
            progress = Math.min(100, progress);
            
            // 更新进度条
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            // 更新速度和剩余时间
            const speed = (5 + Math.random() * 10).toFixed(1);
            speedElement.textContent = `速度: ${speed} MB/s`;
            
            const remaining = Math.round((100 - progress) * 0.3);
            etaElement.textContent = `剩余时间: ${remaining}秒`;
            
            if (progress >= 100) {
                clearInterval(downloadInterval);
                this.completeDownload();
            }
        }, interval);
    }
    
    completeDownload() {
        this.isProcessing = false;
        
        // 显示完成状态
        const progressText = document.getElementById('progress-text');
        const speedElement = document.getElementById('speed');
        const etaElement = document.getElementById('eta');
        
        progressText.textContent = '100%';
        progressText.classList.add('text-success');
        speedElement.textContent = '速度: 完成';
        etaElement.textContent = '剩余时间: 已完成';
        
        // 显示成功通知
        this.showNotification('下载完成！', 'success');
        
        // 添加完成动画
        anime({
            targets: '#download-progress',
            scale: [1, 1.02, 1],
            duration: 600,
            easing: 'easeInOutQuad'
        });
        
        // 3秒后隐藏进度条
        setTimeout(() => {
            document.getElementById('download-progress').classList.add('hidden');
        }, 3000);
    }
    
    handleFileDrop(event) {
        const files = event.dataTransfer.files;
        const text = event.dataTransfer.getData('text/plain');
        
        if (files.length > 0) {
            // 处理文件上传
            this.processDroppedFiles(files);
        } else if (text) {
            // 处理URL文本
            const urls = text.split('\\n').filter(url => url.trim());
            this.addUrlsToQueue(urls);
        }
    }
    
    processDroppedFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                this.addFileToQueue(file);
            }
        });
    }
    
    addFileToQueue(file) {
        const queue = document.getElementById('processing-queue');
        const fileElement = document.createElement('div');
        fileElement.className = 'bg-secondary rounded-lg p-4 flex items-center justify-between';
        fileElement.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-white processing-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                </div>
                <div>
                    <div class="font-semibold text-sm">${file.name}</div>
                    <div class="text-xs text-text-secondary">${(file.size / 1024 / 1024).toFixed(1)}MB</div>
                </div>
            </div>
            <div class="text-accent text-sm font-mono">准备中</div>
        `;
        queue.appendChild(fileElement);
    }
    
    addUrlsToQueue(urls) {
        urls.forEach(url => {
            const queue = document.getElementById('processing-queue');
            const urlElement = document.createElement('div');
            urlElement.className = 'bg-secondary rounded-lg p-4 flex items-center justify-between';
            urlElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white processing-animation" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="font-semibold text-sm truncate">${url.substring(0, 40)}...</div>
                        <div class="text-xs text-text-secondary">等待分析</div>
                    </div>
                </div>
                <div class="text-accent text-sm font-mono">队列中</div>
            `;
            queue.appendChild(urlElement);
        });
    }
    
    animateStats() {
        // 统计数字动画
        const stats = [
            { id: 'supported-sites', target: 1000, suffix: '+' },
            { id: 'processed-files', target: 50000, suffix: 'K+' },
            { id: 'success-rate', target: 99.8, suffix: '%' },
            { id: 'processing-speed', target: 10, suffix: 'x' }
        ];
        
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                anime({
                    targets: { value: 0 },
                    value: stat.target,
                    duration: 2000,
                    delay: 500,
                    easing: 'easeOutQuart',
                    update: function(anim) {
                        const value = anim.animatables[0].target.value;
                        let displayValue;
                        
                        if (stat.id === 'processed-files') {
                            displayValue = (value / 1000).toFixed(0);
                        } else if (stat.id === 'success-rate') {
                            displayValue = value.toFixed(1);
                        } else {
                            displayValue = Math.round(value);
                        }
                        
                        element.textContent = displayValue + stat.suffix;
                    }
                });
            }
        });
    }
    
    handleScroll() {
        // 滚动时的动画处理
        const elements = document.querySelectorAll('.fade-in');
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8;
            
            if (isVisible && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
        
        // 根据类型设置样式
        const styles = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            warning: 'bg-yellow-600 text-white',
            info: 'bg-blue-600 text-white'
        };
        
        notification.className += ` ${styles[type] || styles.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new MediaPro();
});

// 导出给其他页面使用
window.MediaPro = MediaPro;