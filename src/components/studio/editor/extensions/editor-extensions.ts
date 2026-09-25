import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { CalloutNode } from '../nodes/callout-node';
import { PullQuoteNode } from '../nodes/pull-quote-node';
import { FigureNode } from '../nodes/figure-node';
import { MermaidNode } from '../nodes/mermaid-node';
import { FootnoteDefinitionNode } from '../nodes/footnote-node';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

const lowlight = createLowlight(common);

export function getStudioEditorExtensions() {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        class: 'editorial-code-block',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'editorial-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: {
        class: 'editorial-link',
      },
    }),
    Placeholder.configure({
      placeholder: STUDIO_STRINGS.bodyPlaceholder,
      emptyEditorClass: 'is-editor-empty',
    }),
    BubbleMenuExtension,
    CalloutNode,
    PullQuoteNode,
    FigureNode,
    MermaidNode,
    FootnoteDefinitionNode,
  ];
}
