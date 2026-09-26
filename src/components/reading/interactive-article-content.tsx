'use client';

import { useState, useEffect, useMemo } from 'react';
import { InteractiveMermaid } from '@/components/interactive/interactive-mermaid';
import { FunnelSimulator } from '@/components/interactive/funnel-simulator';
import { TTPMExplorer } from '@/components/interactive/ttpm-explorer';
import { BriefWorksheetInteractive } from '@/components/interactive/brief-worksheet-interactive';

interface InteractiveArticleContentProps {
  html: string;
  slug: string;
}

type ContentSegment =
  | { type: 'html'; content: string }
  | { type: 'mermaid'; code: string }
  | { type: 'funnel-simulator' }
  | { type: 'ttpm-explorer' }
  | { type: 'brief-worksheet' };

export function InteractiveArticleContent({ html, slug }: InteractiveArticleContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Split HTML into interactive segments and HTML chunks
  const segments = useMemo(() => {
    const isMetadocPost = slug === 'brief-says-downloads-what-does-business-want';
    const result: ContentSegment[] = [];

    // Regex to detect .editorial-mermaid containers
    const mermaidRegex = /<div class="editorial-mermaid"[^>]*data-mermaid="([^"]*)"[^>]*>[\s\S]*?<\/div>/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mermaidRegex.exec(html)) !== null) {
      const precedingHtml = html.slice(lastIndex, match.index);
      if (precedingHtml) {
        result.push({ type: 'html', content: precedingHtml });
      }

      const encodedCode = match[1];
      try {
        const decodedCode = decodeURIComponent(encodedCode);
        result.push({ type: 'mermaid', code: decodedCode });
      } catch {
        result.push({ type: 'html', content: match[0] });
      }

      lastIndex = match.index + match[0].length;
    }

    const trailingHtml = html.slice(lastIndex);
    if (trailingHtml) {
      result.push({ type: 'html', content: trailingHtml });
    }

    // For the Metadoc post, intelligently weave in the 3 interactive blocks
    if (isMetadocPost) {
      const enriched: ContentSegment[] = [];

      for (const segment of result) {
        if (segment.type !== 'html') {
          enriched.push(segment);
          // If this was the funnel mermaid diagram, follow it with the interactive simulator!
          if (segment.type === 'mermaid' && segment.code.includes('Visitors')) {
            enriched.push({ type: 'funnel-simulator' });
          }
          continue;
        }

        let content = segment.content;

        // Check for TTPM table and inject TTPM Explorer
        const ttpmMarker = 'TTPM';
        const ttpmTableEnd = '</table>';
        const ttpmIndex = content.indexOf(ttpmMarker);

        if (ttpmIndex !== -1) {
          const tableEndIndex = content.indexOf(ttpmTableEnd, ttpmIndex);
          if (tableEndIndex !== -1) {
            const cutPoint = tableEndIndex + ttpmTableEnd.length;
            const part1 = content.slice(0, cutPoint);
            const part2 = content.slice(cutPoint);

            enriched.push({ type: 'html', content: part1 });
            enriched.push({ type: 'ttpm-explorer' });
            content = part2;
          }
        }

        // Check for Brief Worksheet section and inject Interactive Worksheet
        const worksheetMarker = 'Worksheet';
        const wsIndex = content.indexOf(worksheetMarker);

        if (wsIndex !== -1) {
          // Look for end of worksheet list or callout
          const calloutEnd = '</div></div>';
          const calloutIndex = content.indexOf(calloutEnd, wsIndex);

          if (calloutIndex !== -1) {
            const cutPoint = calloutIndex + calloutEnd.length;
            const part1 = content.slice(0, cutPoint);
            const part2 = content.slice(cutPoint);

            enriched.push({ type: 'html', content: part1 });
            enriched.push({ type: 'brief-worksheet' });
            enriched.push({ type: 'html', content: part2 });
            continue;
          }
        }

        enriched.push({ type: 'html', content });
      }

      return enriched;
    }

    return result;
  }, [html, slug]);

  // Server-side / Pre-hydration: render pure HTML to avoid flicker or mismatch
  if (!isMounted) {
    return (
      <div
        className="editorial-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Client-side: render enriched interactive segments
  return (
    <div className="editorial-prose">
      {segments.map((segment, index) => {
        if (segment.type === 'html') {
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
          );
        }

        if (segment.type === 'mermaid') {
          return (
            <InteractiveMermaid
              key={`mermaid-${index}`}
              code={segment.code}
              title="مخطط رحلة وقمع التحويل (Conversion Funnel)"
            />
          );
        }

        if (segment.type === 'funnel-simulator') {
          return <FunnelSimulator key={`simulator-${index}`} />;
        }

        if (segment.type === 'ttpm-explorer') {
          return <TTPMExplorer key={`ttpm-${index}`} />;
        }

        if (segment.type === 'brief-worksheet') {
          return <BriefWorksheetInteractive key={`worksheet-${index}`} />;
        }

        return null;
      })}
    </div>
  );
}
