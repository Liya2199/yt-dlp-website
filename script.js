document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const urlInput = document.getElementById('video-url');
    const getInfoBtn = document.getElementById('get-info-btn');
    const videoInfoDiv = document.getElementById('video-info');
    const thumbnailImg = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('video-title');
    const audioOnlyCheckbox = document.getElementById('audio-only');
    const videoOptionsDiv = document.getElementById('video-options');
    const audioOptionsDiv = document.getElementById('audio-options');
    const videoFormatSelect = document.getElementById('video-format');
    const subtitleSelect = document.getElementById('subtitle');
    const audioFormatSelect = document.getElementById('audio-format');
    const downloadBtn = document.getElementById('download-btn');
    const statusDiv = document.getElementById('status');
    const statusMessage = document.getElementById('status-message');

    const API_URL = 'http://localhost:3001';

    // --- STATE ---
    let videoMetadata = null;

    // --- EVENT LISTENERS ---
    getInfoBtn.addEventListener('click', handleGetInfo);
    downloadBtn.addEventListener('click', handleDownload);
    audioOnlyCheckbox.addEventListener('change', toggleOptionsVisibility);

    // --- HANDLER FUNCTIONS ---

    async function handleGetInfo() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('Please enter a video URL.');
            return;
        }

        showLoading('Fetching video information...');
        hideVideoInfo();

        try {
            const infoResponse = await fetch(`${API_URL}/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!infoResponse.ok) {
                const err = await infoResponse.json();
                throw new Error(err.message || 'Failed to get video info.');
            }

            videoMetadata = await infoResponse.json();
            
            updateUWithVideoInfo(videoMetadata);
            hideStatus();
            showVideoInfo();

        } catch (error) {
            console.error('Error fetching info:', error);
            showError(error.message);
            videoMetadata = null;
        }
    }

    function handleDownload() {
        const url = urlInput.value.trim();
        if (!url || !videoMetadata) {
            showError('Please get video info before downloading.');
            return;
        }

        showLoading('Preparing download... This may take a moment.');

        if (audioOnlyCheckbox.checked) {
            // Audio Only Download
            const audioFormat = audioFormatSelect.value;
            downloadAudio(url, audioFormat);
        } else {
            // Video Download
            const formatCode = videoFormatSelect.value;
            const subLang = subtitleSelect.value;
            downloadVideo(url, formatCode, subLang);
        }
    }

    function toggleOptionsVisibility() {
        const isAudioOnly = audioOnlyCheckbox.checked;
        videoOptionsDiv.classList.toggle('hidden', isAudioOnly);
        audioOptionsDiv.classList.toggle('hidden', !isAudioOnly);
    }


    // --- API CALL & UI LOGIC ---

    function updateUWithVideoInfo(data) {
        videoTitle.textContent = data.title;
        thumbnailImg.src = data.thumbnail;

        // Populate video formats
        videoFormatSelect.innerHTML = '';
        if (data.formats) {
            data.formats.forEach(f => {
                if (f.vcodec !== 'none' && f.acodec !== 'none') { // Only show formats with video and audio
                    const option = document.createElement('option');
                    option.value = f.format_id;
                    let label = `${f.ext} - ${f.resolution}`;
                    if(f.format_note) label += ` (${f.format_note})`;
                    if(f.filesize) label += ` - ${Math.round(f.filesize / 1024 / 1024)}MB`;
                    option.textContent = label;
                    videoFormatSelect.appendChild(option);
                }
            });
        }

        // Populate subtitles
        subtitleSelect.innerHTML = '<option value="">None</option>';
        const allSubs = { ...(data.subtitles || {}), ...(data.automatic_captions || {}) };

        if (Object.keys(allSubs).length > 0) {
            for (const lang in allSubs) {
                const subInfo = allSubs[lang][0];
                if (subInfo) {
                    const option = document.createElement('option');
                    option.value = lang;
                    // The 'name' property might not exist for automatic captions, so create a fallback.
                    option.textContent = subInfo.name || `${lang} (auto)`; 
                    subtitleSelect.appendChild(option);
                }
            }
        }
    }

    async function downloadVideo(url, format, subLang) {
        try {
            const response = await fetch(`${API_URL}/download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, format, subLang }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Download failed.');
            }

            // Trigger browser download
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'video.mp4';

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            hideStatus();

        } catch (error) {
            console.error('Download error:', error);
            showError(error.message);
        }
    }
    
    async function downloadAudio(url, audioFormat) {
        try {
            const response = await fetch(`${API_URL}/extract-audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, audioFormat }),
            });
    
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Audio extraction failed.');
            }
    
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : `audio.${audioFormat}`;
    
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            hideStatus();
    
        } catch (error) {
            console.error('Audio extraction error:', error);
            showError(error.message);
        }
    }


    // --- UI HELPER FUNCTIONS ---

    function showLoading(message) {
        statusDiv.classList.remove('hidden');
        statusMessage.textContent = message;
        statusMessage.style.color = 'var(--text-color)';
        downloadBtn.disabled = true;
        getInfoBtn.disabled = true;
    }

    function showError(message) {
        statusDiv.classList.remove('hidden');
        statusMessage.textContent = `Error: ${message}`;
        statusMessage.style.color = 'var(--error-color)';
        downloadBtn.disabled = false;
        getInfoBtn.disabled = false;
    }

    function hideStatus() {
        statusDiv.classList.add('hidden');
        downloadBtn.disabled = false;
        getInfoBtn.disabled = false;
    }

    function showVideoInfo() {
        videoInfoDiv.classList.remove('hidden');
    }

    function hideVideoInfo() {
        videoInfoDiv.classList.add('hidden');
    }
});
