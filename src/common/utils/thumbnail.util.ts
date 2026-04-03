const ffmpeg = require('fluent-ffmpeg');
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as path from 'path';
import * as os from 'os';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath('C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1-essentials_build\\bin\\ffprobe.exe');

export function generateThumbnail(videoPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const thumbnailName = `thumb_${Date.now()}.jpg`;
    const thumbnailPath = path.join(os.tmpdir(), thumbnailName);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [10],
        filename: thumbnailName,
        folder: os.tmpdir(),
        size: '1280x720',
      })
      .on('end', () => resolve(thumbnailPath))
      .on('error', (err) => reject(err));
  });
}

export function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.round(metadata.format.duration || 0));
    });
  });
}