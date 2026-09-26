'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, Code, Copy, Check, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react';

interface InteractiveMermaidProps {
  code: string;
  title?: string;
}

export function InteractiveMermaid({ code, title = 'مخطط سير البيانات (Mermaid)' }: InteractiveMermaidProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    renderIdRef.current += 1;
    const currentRun = renderIdRef.current;

    async function renderDiagram() {
      if (!code || !code.trim()) {
        if (isMounted) {
          setSvgHtml('');
          setError(null);
        }
        return;
      }

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#F4EEFF',
            primaryTextColor: '#242035',
            primaryBorderColor: '#7054D4',
            lineColor: '#7054D4',
            secondaryColor: '#FFFFFF',
            tertiaryColor: '#F8F6FF',
            fontFamily: 'var(--font-ibm-plex-arabic), system-ui, sans-serif',
            fontSize: '13px',
          },
          securityLevel: 'loose',
        });

        const id = `mermaid-render-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const { svg } = await mermaid.render(id, code.trim());

        if (isMounted && currentRun === renderIdRef.current) {
          setSvgHtml(svg);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted && currentRun === renderIdRef.current) {
          const message = err instanceof Error ? err.message : 'فشل توليد الرسم التخطيطي';
          setError(message);
          setSvgHtml('');
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.7, prev + delta), 1.6));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="my-8 rounded-2xl border border-lavender-border bg-linear-to-b from-white via-lavender-light/30 to-white shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-lavender-border bg-white">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-ink-primary">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'visual' && !error && svgHtml && (
            <div className="flex items-center gap-1 bg-lavender-light/60 px-1.5 py-1 rounded-lg border border-lavender-border text-xs">
              <button
                type="button"
                onClick={() => handleZoom(0.15)}
                className="p-1 hover:text-primary transition-colors text-ink-secondary rounded"
                title="تكبير"
                aria-label="تكبير المخطط"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleZoom(-0.15)}
                className="p-1 hover:text-primary transition-colors text-ink-secondary rounded"
                title="تصغير"
                aria-label="تصغير المخطط"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="p-1 hover:text-primary transition-colors text-ink-secondary rounded"
                title="إعادة ضبط المقياس"
                aria-label="إعادة ضبط المقياس"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-lavender-light/50 p-1 rounded-xl border border-lavender-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'visual'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المخطط البصري</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>الكود المصدري</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="p-6 relative">
        {activeTab === 'visual' ? (
          error ? (
            <div className="p-6 text-center text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <p className="text-xs font-bold mb-1">تعذر تصيير الرسم التخطيطي بصرياً</p>
              <p className="text-2xs text-amber-800 font-mono" dir="ltr">{error}</p>
            </div>
          ) : svgHtml ? (
            <div
              ref={containerRef}
              className="overflow-x-auto flex justify-center py-4 transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-ink-muted">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs">جاري بناء وتصيير المخطط البياني...</span>
            </div>
          )
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-3 z-10">
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/90 hover:bg-white text-ink-primary hover:text-primary rounded-lg text-xs font-semibold shadow-2xs border border-lavender-border transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الكود</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-5 rounded-xl bg-[#171520] text-[#F8F6FF] font-mono text-xs leading-relaxed overflow-x-auto" dir="ltr">
              {code}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
