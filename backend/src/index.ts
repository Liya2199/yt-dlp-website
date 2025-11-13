import express from 'express';
import cors from 'cors';
import { YtDlpWrap } from 'yt-dlp-wrap';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Ensure yt-dlp is available
const ytDlpWrap = new YtDlpWrap();

// Ensure ffmpeg is available (you might need to set the path if not in system PATH)
// ffmpeg.setFfmpegPath('/path/to/ffmpeg');
// ffmpeg.setFfprobePath('/path/to/ffprobe');

const downloadsDir = path.join(__dirname, '../downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

// Endpoint to get video information
app.post('/info', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send('Video URL is required.');
  }

  try {
    const metadata = await ytDlpWrap.getVideoInfo(url);
    res.json(metadata);
  } catch (error: any) {
    console.error('Error fetching video info:', error);
    res.status(500).send(error.message);
  }
});

// Endpoint to download video/audio
app.post('/download', async (req, res) => {
  const { url, format, outputFormat, noSubtitles } = req.body;
  if (!url || !format) {
    return res.status(400).send('Video URL and format are required.');
  }

  try {
    const outputFilePath = path.join(downloadsDir, `video-${Date.now()}.${outputFormat || 'mp4'}`);
    const args = [
      '-f', format,
      '-o', outputFilePath,
      '--merge-output-format', outputFormat || 'mp4',
    ];

    if (noSubtitles) {
      args.push('--skip-download'); // Placeholder, need to adjust based on actual yt-dlp-wrap usage for subtitles
    }

    ytDlpWrap.exec(args.concat(url))
      .on('progress', (progress) => console.log(progress))
      .on('ytDlpEvent', (eventType, eventData) => console.log(eventType, eventData))
      .on('error', (error) => {
        console.error('Download error:', error);
        res.status(500).send(error.message);
      })
      .on('close', () => {
        res.download(outputFilePath, (err) => {
          if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file.');
          }
          fs.unlinkSync(outputFilePath); // Clean up
        });
      });
  } catch (error: any) {
    console.error('Error initiating download:', error);
    res.status(500).send(error.message);
  }
});

// Endpoint to extract audio
app.post('/extract-audio', async (req, res) => {
  const { url, audioFormat } = req.body; // audioFormat can be 'mp3' or 'wav'
  if (!url || !audioFormat) {
    return res.status(400).send('Video URL and audio format are required.');
  }

  try {
    const videoFilePath = path.join(downloadsDir, `temp-video-${Date.now()}.mp4`);
    const audioOutputFilePath = path.join(downloadsDir, `audio-${Date.now()}.${audioFormat}`);

    // First, download the video
    await ytDlpWrap.exec([
      '-f', 'bestvideo+bestaudio',
      '-o', videoFilePath,
      '--merge-output-format', 'mp4',
      url
    ]);

    // Then, extract audio using ffmpeg
    ffmpeg(videoFilePath)
      .toFormat(audioFormat)
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).send(err.message);
        fs.unlinkSync(videoFilePath); // Clean up temp video
      })
      .on('end', () => {
        res.download(audioOutputFilePath, (err) => {
          if (err) {
            console.error('Error sending audio file:', err);
            res.status(500).send('Error sending audio file.');
          }
          fs.unlinkSync(videoFilePath); // Clean up temp video
          fs.unlinkSync(audioOutputFilePath); // Clean up audio
        });
      })
      .save(audioOutputFilePath);

  } catch (error: any) {
    console.error('Error extracting audio:', error);
    res.status(500).send(error.message);
  }
});

// Basic FFmpeg processing endpoint (e.g., trim)
app.post('/process-video', async (req, res) => {
  const { url, startTime, duration, outputFormat } = req.body; // Example: trim video
  if (!url || !startTime || !duration || !outputFormat) {
    return res.status(400).send('Video URL, start time, duration, and output format are required.');
  }

  try {
    const inputFilePath = path.join(downloadsDir, `input-video-${Date.now()}.mp4`);
    const outputFilePath = path.join(downloadsDir, `processed-video-${Date.now()}.${outputFormat}`);

    // Download the video first
    await ytDlpWrap.exec([
      '-f', 'bestvideo+bestaudio',
      '-o', inputFilePath,
      '--merge-output-format', 'mp4',
      url
    ]);

    ffmpeg(inputFilePath)
      .setStartTime(startTime) // '00:00:10'
      .setDuration(duration)   // '00:00:30'
      .toFormat(outputFormat)
      .on('error', (err) => {
        console.error('FFmpeg processing error:', err);
        res.status(500).send(err.message);
        fs.unlinkSync(inputFilePath); // Clean up input video
      })
      .on('end', () => {
        res.download(outputFilePath, (err) => {
          if (err) {
            console.error('Error sending processed file:', err);
            res.status(500).send('Error sending processed file.');
          }
          fs.unlinkSync(inputFilePath); // Clean up input video
          fs.unlinkSync(outputFilePath); // Clean up output video
        });
      })
      .save(outputFilePath);

  } catch (error: any) {
    console.error('Error processing video:', error);
    res.status(500).send(error.message);
  }
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
