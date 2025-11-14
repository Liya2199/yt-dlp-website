import { Request, Response } from 'express';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { YtDlp } from 'ytdlp-nodejs';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');

// --- CONFIGURATION ---
const app = express();
const port = 3001;
const downloadsDir = path.join(__dirname, '..', 'downloads');
const rootDir = path.join(__dirname, '..', '..');
const ytdlp = new YtDlp(); // Create a single instance

// --- SETUP ---
fs.mkdir(downloadsDir, { recursive: true });

app.use(cors({
    exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json());

// --- SERVE FRONTEND ---
app.use(express.static(rootDir));
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// --- HELPERS ---
const runFfmpeg = (command: FfmpegCommand, outputFilePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        command
            .on('error', (err: Error) => reject(err))
            .on('end', () => resolve(outputFilePath))
            .save(outputFilePath);
    });
};

// --- API ENDPOINTS ---

// 1. Get Video Info
app.post('/info', async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) return res.status(400).send({ message: 'Video URL is required.' });

    try {
        const metadata = await ytdlp.getInfoAsync(url);
        res.json(metadata);
    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).send({ message: 'Failed to fetch video info.', error });
    }
});

// 3. Download Video
app.post('/download', async (req: Request, res: Response) => {
    const { url, format, subLang } = req.body;
    if (!url || !format) return res.status(400).send({ message: 'URL and format are required.' });

    const tempId = uuidv4();
    const tempOutputDir = path.join(downloadsDir, tempId);
    let finalFilePath = '';
    let originalFilename = '';

    try {
        await fs.mkdir(tempOutputDir, { recursive: true });
        const outputTemplate = path.join(tempOutputDir, `%(title)s.%(ext)s`);

        const options: any = {
            format,
            output: outputTemplate,
            mergeOutputFormat: 'mp4',
        };

        if (subLang) {
            options.embedSubs = true;
            options.subLangs = `all,${subLang},-live_chat`;
        }

        console.log(`Starting download for URL: ${url} with options:`, options);
        
        await ytdlp.downloadAsync(url, options);

        const files = await fs.readdir(tempOutputDir);
        if (files.length === 0) {
            throw new Error('yt-dlp did not produce a file.');
        }
        originalFilename = files[0];
        finalFilePath = path.join(tempOutputDir, originalFilename);

        console.log(`Download complete. Sending file: ${finalFilePath}`);
        res.download(finalFilePath, originalFilename);

    } catch (error) {
        console.error('Download process failed:', error);
        res.status(500).send({ message: 'Download process failed.', error });
    } finally {
        if (finalFilePath) {
            setTimeout(async () => {
                try {
                    await fs.rm(tempOutputDir, { recursive: true, force: true });
                    console.log(`Cleaned up directory: ${tempOutputDir}`);
                } catch (cleanupError) {
                    console.error(`Failed to cleanup directory ${tempOutputDir}:`, cleanupError);
                }
            }, 30000);
        }
    }
});

// 4. Extract Audio
app.post('/extract-audio', async (req: Request, res: Response) => {
    const { url, audioFormat } = req.body;
    if (!url || !audioFormat) return res.status(400).send({ message: 'URL and audio format are required.' });

    const tempId = uuidv4();
    let finalAudioPath = '';
    let finalFilename = '';

    try {
        console.log(`Starting audio extraction for URL: ${url}`);
        
        const info = await ytdlp.getInfoAsync(url);
        const safeTitle = info.title.replace(/[^a-z0-9_ \-\.]/gi, '_');
        finalFilename = `${safeTitle}.${audioFormat}`;
        finalAudioPath = path.join(downloadsDir, `${tempId}.${audioFormat}`);

        const stream = ytdlp.stream(url, { format: 'bestaudio' });

        console.log(`Piping audio stream to ffmpeg for conversion to ${audioFormat}...`);
        const command = ffmpeg(stream)
            .audioCodec(audioFormat === 'mp3' ? 'libmp3lame' : 'pcm_s16le')
            .toFormat(audioFormat);

        await runFfmpeg(command, finalAudioPath);

        console.log(`Conversion complete. Sending file: ${finalAudioPath}`);
        res.download(finalAudioPath, finalFilename);

    } catch (error) {
        console.error('Audio extraction failed:', error);
        res.status(500).send({ message: 'Audio extraction failed.', error });
    } finally {
        if (finalAudioPath) {
            setTimeout(async () => {
                try {
                    await fs.unlink(finalAudioPath);
                    console.log(`Cleaned up file: ${finalAudioPath}`);
                } catch (cleanupError) {
                    console.error(`Failed to cleanup file ${finalAudioPath}:`, cleanupError);
                }
            }, 30000);
        }
    }
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});