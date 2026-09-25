'use client';

import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeMirrorEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

const customStudioTheme = EditorView.theme({
  '&': {
    fontSize: '14px',
    fontFamily: 'var(--font-ibm-plex-mono), monospace',
    height: '100%',
    minHeight: '480px',
    backgroundColor: '#1E1B2E',
    color: '#EDE9FE',
    borderRadius: '0.75rem',
  },
  '.cm-content': {
    padding: '16px',
    direction: 'rtl',
    textAlign: 'right',
    lineHeight: '1.8',
  },
  '.cm-line': {
    padding: '0 4px',
  },
  '.cm-gutters': {
    backgroundColor: '#161324',
    color: '#706B80',
    border: 'none',
    borderLeft: '1px solid #2E2942',
    direction: 'ltr',
  },
  '.cm-activeLine': {
    backgroundColor: '#27233D',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#27233D',
    color: '#A78BFA',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#A78BFA',
  },
  '&.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: '#4C3A7A',
  },
});

export function CodeMirrorEditor({
  value,
  onChange,
  readOnly = false,
  className = '',
  theme = 'dark',
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      markdown(),
      EditorView.lineWrapping,
      EditorState.readOnly.of(readOnly),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const docString = update.state.doc.toString();
          onChangeRef.current(docString);
        }
      }),
    ];

    if (theme === 'dark') {
      extensions.push(oneDark);
      extensions.push(customStudioTheme);
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
    // Initialize once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronize external value changes to CodeMirror state without clobbering cursor
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-lavender-border ${className}`}
      dir="ltr"
    />
  );
}
