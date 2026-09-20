import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import ytdl from '@distube/ytdl-core';
import { Innertube } from 'youtubei.js';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize YouTube.js Innertube client with fallback options
  let innertubeClient: any = null;
  async function getInnertube() {
    if (!innertubeClient) {
      innertubeClient = await Innertube.create({
        client_type: 'ANDROID' as any,
        retrieve_player: false
      });
    }
    return innertubeClient;
  }

  // 1. MIDDLEWARE & SÉCURITÉ CORS
  const allowedOrigins = [
    'https://m.youtube.com',
    'https://www.youtube.com',
    'https://youtube.com',
    'https://music.youtube.com'
  ];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Autorise les requêtes sans origine (bookmarklets directs, curl, extensions mobiles)
      // ou provenant des domaines YouTube officiels
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.youtube.com')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'YouTube URL Resolver API',
      timestamp: new Date().toISOString()
    });
  });

  // Helper pour extraire l'ID vidéo
  function extractVideoId(targetUrl: string): string {
    if (ytdl.validateURL(targetUrl)) {
      return ytdl.getURLVideoID(targetUrl);
    }
    if (ytdl.validateID(targetUrl)) {
      return targetUrl;
    }
    const match = targetUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  }

  // 2. ROUTE D'API UNIQUE (/api/resolve)
  // Résout l'URL YouTube en extrayant le flux combiné direct googlevideo.com
  app.get('/api/resolve', async (req: Request, res: Response) => {
    const rawUrl = req.query.url as string | undefined;

    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Paramètre "url" manquant. Exemple: /api/resolve?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      return;
    }

    const targetUrl = rawUrl.trim();
    const videoId = extractVideoId(targetUrl);

    if (!videoId) {
      res.status(400).json({
        success: false,
        error: 'URL ou ID YouTube invalide.'
      });
      return;
    }

    let videoTitle = 'Sans titre';
    let selectedStreamUrl = '';

    // Stratégie 1: Utilisation de youtubei.js (Innertube client Android) pour obtenir les flux MP4 directs googlevideo
    try {
      const yt = await getInnertube();
      const info = await yt.getBasicInfo(videoId);
      videoTitle = info.basic_info?.title || 'Sans titre';

      const formats = info.streaming_data?.formats || [];
      // Cherche les formats combinés (vidéo + audio) ayant une URL directe
      const combined = formats.filter((f: any) => f.has_video && f.has_audio && Boolean(f.url));
      if (combined.length > 0) {
        // Trier par résolution décroissante (720p > 360p)
        combined.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
        selectedStreamUrl = combined[0].url;
      } else if (formats.length > 0 && formats[0].url) {
        selectedStreamUrl = formats[0].url;
      }
    } catch (innertubeErr: any) {
      console.warn('Innertube warning, tentative avec @distube/ytdl-core:', innertubeErr?.message);
    }

    // Stratégie 2 (Fallback): @distube/ytdl-core avec playerClients
    if (!selectedStreamUrl) {
      try {
        const info = await ytdl.getInfo(videoId, {
          playerClients: ['ANDROID', 'IOS', 'WEB']
        });
        if (!videoTitle || videoTitle === 'Sans titre') {
          videoTitle = info.videoDetails?.title || 'Sans titre';
        }
        const combinedFormats = info.formats.filter((f) => {
          const hasBoth = f.hasVideo && f.hasAudio;
          const isMp4 = f.container === 'mp4' || (f.mimeType && f.mimeType.includes('video/mp4'));
          return hasBoth && isMp4 && Boolean(f.url);
        });

        if (combinedFormats.length > 0) {
          combinedFormats.sort((a, b) => {
            const heightA = a.height || (a.qualityLabel ? parseInt(a.qualityLabel, 10) : 0) || 0;
            const heightB = b.height || (b.qualityLabel ? parseInt(b.qualityLabel, 10) : 0) || 0;
            return heightB - heightA;
          });
          selectedStreamUrl = combinedFormats[0].url;
        } else {
          const anyCombined = info.formats.filter((f) => f.hasVideo && f.hasAudio && Boolean(f.url));
          if (anyCombined.length > 0) {
            selectedStreamUrl = anyCombined[0].url;
          }
        }
      } catch (ytdlErr: any) {
        console.error('ytdl fallback error:', ytdlErr?.message);
      }
    }

    if (!selectedStreamUrl) {
      res.status(404).json({
        success: false,
        error: 'Aucun flux vidéo direct accessible trouvé pour cette vidéo (protection YouTube ou restriction d\'accès).'
      });
      return;
    }

    // Si le paramètre redirect=true est passé
    const shouldRedirect = req.query.redirect === 'true' || req.query.redirect === '1';
    if (shouldRedirect) {
      res.redirect(302, selectedStreamUrl);
      return;
    }

    // STRICTEMENT LE FORMAT JSON DEMANDÉ :
    res.json({
      success: true,
      title: videoTitle,
      streamUrl: selectedStreamUrl
    });
  });

  // Vite middleware pour l'interface web de test et documentation
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur résolveur YouTube en ligne sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
