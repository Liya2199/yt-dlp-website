const videoUrlInput = document.getElementById('videoUrl');
const getInfoBtn = document.getElementById('getInfoBtn');
const videoInfoResult = document.getElementById('videoInfoResult');
const downloadFormatSelect = document.getElementById('downloadFormat');
const outputFormatSelect = document.getElementById('outputFormat');
const noSubtitlesCheckbox = document.getElementById('noSubtitles');
const downloadBtn = document.getElementById('downloadBtn');
const downloadResult = document.getElementById('downloadResult');
const audioFormatSelect = document.getElementById('audioFormat');
const extractAudioBtn = document.getElementById('extractAudioBtn');
const extractAudioResult = document.getElementById('extractAudioResult');
const trimStartTimeInput = document.getElementById('trimStartTime');
const trimDurationInput = document.getElementById('trimDuration');
const processOutputFormatSelect = document.getElementById('processOutputFormat');
const processVideoBtn = document.getElementById('processVideoBtn');
const processVideoResult = document.getElementById('processVideoResult');

const BACKEND_URL = 'http://localhost:3000';

getInfoBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value;
    if (!url) {
        alert('Please enter a video URL.');
        return;
    }

    videoInfoResult.innerHTML = 'Fetching info...';
    try {
        const response = await fetch(`${BACKEND_URL}/info`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        const data = await response.json();

        if (response.ok) {
            videoInfoResult.innerHTML = `
                <h3>Title: ${data.title}</h3>
                <p>Uploader: ${data.uploader}</p>
                <p>Duration: ${formatDuration(data.duration)}</p>
                <h4>Available Formats:</h4>
                <pre>${JSON.stringify(data.formats.map(f => ({
                    format_id: f.format_id,
                    ext: f.ext,
                    resolution: f.resolution,
                    vcodec: f.vcodec,
                    acodec: f.acodec,
                    filesize: f.filesize,
                    format_note: f.format_note
                })), null, 2)}</pre>
                <h4>Available Subtitles:</h4>
                <pre>${JSON.stringify(data.subtitles, null, 2)}</pre>
            `;

            // Populate download format select
            downloadFormatSelect.innerHTML = '';
            data.formats.forEach(format => {
                const option = document.createElement('option');
                option.value = format.format_id;
                option.textContent = `${format.format_id} - ${format.ext} - ${format.resolution || 'audio only'} - ${format.format_note || ''}`;
                downloadFormatSelect.appendChild(option);
            });
        } else {
            videoInfoResult.innerHTML = `<p class="error">Error: ${data}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        videoInfoResult.innerHTML = `<p class="error">Failed to fetch video info. Check console for details.</p>`;
    }
});

downloadBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value;
    const format = downloadFormatSelect.value;
    const outputFormat = outputFormatSelect.value;
    const noSubtitles = noSubtitlesCheckbox.checked;

    if (!url || !format) {
        alert('Please get video info first and select a format.');
        return;
    }

    downloadResult.innerHTML = 'Starting download...';
    try {
        const response = await fetch(`${BACKEND_URL}/download`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, format, outputFormat, noSubtitles }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            downloadResult.innerHTML = '<p class="success">Download started!</p>';
        } else {
            const errorText = await response.text();
            downloadResult.innerHTML = `<p class="error">Error: ${errorText}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        downloadResult.innerHTML = `<p class="error">Failed to initiate download. Check console for details.</p>`;
    }
});

extractAudioBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value;
    const audioFormat = audioFormatSelect.value;

    if (!url) {
        alert('Please enter a video URL.');
        return;
    }

    extractAudioResult.innerHTML = 'Extracting audio... This might take a while.';
    try {
        const response = await fetch(`${BACKEND_URL}/extract-audio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, audioFormat }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `audio.${audioFormat}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            extractAudioResult.innerHTML = '<p class="success">Audio extraction started!</p>';
        } else {
            const errorText = await response.text();
            extractAudioResult.innerHTML = `<p class="error">Error: ${errorText}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        extractAudioResult.innerHTML = `<p class="error">Failed to extract audio. Check console for details.</p>`;
    }
});

processVideoBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value;
    const startTime = trimStartTimeInput.value;
    const duration = trimDurationInput.value;
    const outputFormat = processOutputFormatSelect.value;

    if (!url || !startTime || !duration || !outputFormat) {
        alert('Please enter video URL, start time, duration, and output format.');
        return;
    }

    processVideoResult.innerHTML = 'Processing video... This might take a while.';
    try {
        const response = await fetch(`${BACKEND_URL}/process-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, startTime, duration, outputFormat }),
        });

        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `processed.${outputFormat}`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            processVideoResult.innerHTML = '<p class="success">Video processing started!</p>';
        } else {
            const errorText = await response.text();
            processVideoResult.innerHTML = `<p class="error">Error: ${errorText}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        processVideoResult.innerHTML = `<p class="error">Failed to process video. Check console for details.</p>`;
    }
});


function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map(v => v < 10 ? '0' + v : v)
        .filter((v, i) => v !== '00' || i > 0)
        .join(':');
}
