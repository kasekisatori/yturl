import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Code2, 
  Info,
  AlertTriangle,
  Globe
} from 'lucide-react';

interface ResolveResponse {
  success: boolean;
  title?: string;
  streamUrl?: string;
  error?: string;
}

export default function App() {
  const [inputUrl, setInputUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customHost, setCustomHost] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCustomHost(window.location.origin);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResolve = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    setResult(null);
    const startTime = performance.now();

    try {
      const response = await fetch(`/api/resolve?url=${encodeURIComponent(inputUrl.trim())}`);
      const data: ResolveResponse = await response.json();
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResult(data);
    } catch (err: any) {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setResult({
        success: false,
        error: err.message || 'Erreur réseau lors de l\'appel à l\'API'
      });
    } finally {
      setLoading(false);
    }
  };

  const effectiveHost = customHost.trim().replace(/\/+$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');
  const apiUrl = `${effectiveHost}/api/resolve`;

  // Bookmarklet JavaScript avec redirection directe / window.open
  const bookmarkletCode = `javascript:(function(){
  var currentUrl = encodeURIComponent(window.location.href);
  var target = '${apiUrl}?url=' + currentUrl + '&redirect=true';
  window.open(target, '_blank');
})();`;

  // Version compactée sur une seule ligne prête pour les favoris mobiles
  const bookmarkletOneLiner = `javascript:(function(){var currentUrl=encodeURIComponent(window.location.href);var target='${apiUrl}?url='+currentUrl+'&redirect=true';window.open(target,'_blank');})();`;

  const samplePresets = [
    { label: 'Standard URL', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'Short URL (youtu.be)', url: 'https://youtu.be/dQw4w9WgXcQ' },
    { label: 'Mobile URL (m.youtube.com)', url: 'https://m.youtube.com/watch?v=dQw4w9WgXcQ' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">YouTube URL Resolver</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                  REST API v1
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Zéro proxy • Zéro stockage binaire • Support CORS natif</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              API Prête & Active
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Notice regarding Render.com Deployment */}
        <section className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 shadow-md">
          <Globe className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs">
            <h2 className="font-bold text-indigo-200 text-sm">
              Prêt pour le déploiement public sur Render.com
            </h2>
            <p className="text-indigo-100/90 leading-relaxed">
              Le code est optimisé pour Render avec écoute sur <code className="bg-indigo-950/70 px-1 py-0.5 rounded text-indigo-200 font-mono">process.env.PORT || 3000</code>, redirection <code className="bg-indigo-950/70 px-1 py-0.5 rounded text-indigo-200 font-mono">302 Found</code>, et configuration <code className="bg-indigo-950/70 px-1 py-0.5 rounded text-indigo-200 font-mono">render.yaml</code>. Une fois déployé sur Render, votre instance disposera d'une URL publique sans aucune restriction IAM ni erreur 403.
            </p>
          </div>
        </section>

        {/* Specifications summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">CORS & Redirection</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Autorise les requêtes de <code className="text-indigo-300 font-mono">m.youtube.com</code> et redirige instantanément via <code className="text-indigo-300 font-mono">302 Found</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Flux Direct googlevideo.com</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extrait le flux MP4 combiné (vidéo + audio) de meilleure résolution via le moteur d'extraction direct.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Zéro Stockage Binaire</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Aucun téléchargement ni proxy binaire : le flux vidéo est lu directement depuis les serveurs CDN de Google.
              </p>
            </div>
          </div>
        </section>

        {/* Live Interactive Tester */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="h-5 w-5 text-rose-500" />
                Testeur Interactif de l'API (/api/resolve)
              </h2>
              <p className="text-xs text-slate-400">
                Testez l'extraction du flux direct MP4 en temps réel.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  id={`btn-preset-${idx}`}
                  type="button"
                  onClick={() => setInputUrl(preset.url)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleResolve} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  id="input-youtube-url"
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-mono"
                />
              </div>

              <button
                id="btn-submit-resolve"
                type="submit"
                disabled={loading || !inputUrl.trim()}
                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Résolution en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Résoudre le flux
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Output */}
          {result && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    result.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {result.success ? '200 OK • Succès' : 'Erreur'}
                  </span>
                  {responseTime !== null && (
                    <span className="text-xs text-slate-400 font-mono">
                      Latence : {responseTime} ms
                    </span>
                  )}
                </div>

                <button
                  id="btn-copy-json"
                  onClick={() => handleCopy(JSON.stringify(result, null, 2), 'json-res')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80"
                >
                  {copiedField === 'json-res' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'json-res' ? 'Copié !' : 'Copier JSON'}
                </button>
              </div>

              {result.success && result.streamUrl && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Metadata and Direct Stream Link */}
                  <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Titre Détecté</span>
                      <p className="text-sm font-medium text-slate-100 mt-0.5">{result.title}</p>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Stream URL (Direct googlevideo.com)</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          id="input-stream-url"
                          type="text"
                          readOnly
                          value={result.streamUrl}
                          className="w-full text-xs font-mono bg-slate-900 text-slate-300 p-2 rounded-lg border border-slate-800 select-all"
                        />
                        <button
                          id="btn-copy-stream-url"
                          type="button"
                          onClick={() => handleCopy(result.streamUrl!, 'stream-url')}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shrink-0"
                          title="Copier l'URL du flux"
                        >
                          {copiedField === 'stream-url' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      <a
                        id="link-open-stream"
                        href={result.streamUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ouvrir le flux direct
                      </a>
                    </div>
                  </div>

                  {/* Video Player Preview */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                      <Play className="h-3.5 w-3.5 text-rose-400" />
                      Aperçu de lecture direct
                    </span>
                    <video
                      id="video-preview-player"
                      controls
                      playsInline
                      className="w-full rounded-lg bg-black aspect-video max-h-52 object-contain border border-slate-800"
                      src={result.streamUrl}
                      key={result.streamUrl}
                    >
                      Votre navigateur ne supporte pas la balise vidéo.
                    </video>
                  </div>
                </div>
              )}

              {result.error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  <strong>Erreur:</strong> {result.error}
                </div>
              )}

              {/* Raw JSON Preview */}
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                  Réponse JSON brute
                </span>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>

        {/* Bookmarklet Mobile Section */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">
                  Générateur de Bookmarklet Mobile
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Redirection 302
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Générez le code JavaScript pour votre marque-page mobile avec l'hôte de votre choix.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                Paramètre <code className="text-amber-300 font-mono">&redirect=true</code> inclus
              </span>
            </div>
          </div>

          {/* Host configuration input */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="input-custom-host" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-indigo-400" />
                Adresse de l'API (Host) utilisée par le Bookmarklet
              </label>
              <span className="text-[11px] text-slate-500">Modifiable si déployé sur un domaine personnalisé</span>
            </div>
            <input
              id="input-custom-host"
              type="text"
              value={customHost}
              onChange={(e) => setCustomHost(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Code JavaScript du Bookmarklet
              </span>
              <div className="flex gap-2">
                <button
                  id="btn-copy-bookmarklet"
                  type="button"
                  onClick={() => handleCopy(bookmarkletCode, 'bookmarklet')}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition-colors shadow"
                >
                  {copiedField === 'bookmarklet' ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'bookmarklet' ? 'Copié !' : 'Copier le Bookmarklet'}
                </button>
                <button
                  id="btn-copy-bookmarklet-oneline"
                  type="button"
                  onClick={() => handleCopy(bookmarkletOneLiner, 'bookmarklet-1line')}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium transition-colors border border-slate-700"
                >
                  {copiedField === 'bookmarklet-1line' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedField === 'bookmarklet-1line' ? 'Copié (1 ligne) !' : 'Copier (1 ligne)'}
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 whitespace-pre overflow-x-auto select-all leading-relaxed">
{bookmarkletCode}
            </pre>
          </div>

          {/* Explication technique */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Le Bookmarklet capture l'URL courante de <code className="text-slate-200 font-mono">m.youtube.com</code> et ouvre l'API avec <code className="text-amber-300 font-mono">&redirect=true</code>. Le serveur répond immédiatement par un code HTTP <strong>302 Found</strong> vers l'URL directe <code className="text-emerald-300 font-mono">googlevideo.com</code>, lançant la lecture du flux MP4.
            </div>
          </div>

          {/* Mobile Installation Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="flex h-5 w-5 rounded-full bg-slate-800 items-center justify-center text-[10px] text-slate-300 font-bold">1</span>
                Installation sur iOS (Safari)
              </h3>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Ajoutez n'importe quelle page à vos favoris.</li>
                <li>Modifiez le favori : nommez-le <strong className="text-slate-200">"▶ Résoudre YouTube"</strong>.</li>
                <li>Remplacez l'adresse URL du favori par le code copié ci-dessus.</li>
                <li>Sur <code className="text-slate-300">m.youtube.com</code>, ouvrez vos favoris et touchez le bookmarklet !</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="flex h-5 w-5 rounded-full bg-slate-800 items-center justify-center text-[10px] text-slate-300 font-bold">2</span>
                Installation sur Android (Chrome / Firefox)
              </h3>
              <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Enregistrez un marque-page.</li>
                <li>Ouvrez le gestionnaire de favoris et appuyez sur "Modifier".</li>
                <li>Collez le code JavaScript dans le champ URL.</li>
                <li>Sur une vidéo YouTube, tapez le nom du marque-page dans la barre d'adresse et sélectionnez-le.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Documentation API Section */}
        <section className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Documentation Technique de la Route API</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">GET</span>
                <code className="text-sm font-mono text-slate-200">/api/resolve?url=&#123;YOUTUBE_URL&#125;&redirect=true</code>
              </div>
              <p className="text-xs text-slate-400">
                Extrait le flux direct googlevideo.com et redirige (302) ou renvoie le JSON avec <code>title</code> et <code>streamUrl</code>.
              </p>
            </div>

            {/* Response Schema */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-2">Schéma JSON de réponse (sans redirection)</span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <pre className="text-xs font-mono text-slate-300">
{`{
  "success": true,
  "title": "Titre de la vidéo",
  "streamUrl": "https://rr---sn-...googlevideo.com/videoplayback?..."
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>YouTube URL Resolver API • Conforme aux spécifications Express & CORS</p>
      </footer>
    </div>
  );
}
