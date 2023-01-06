import type { ViewUpdate } from '@codemirror/view';
import { Decoration, dropCursor, EditorView, keymap, lineNumbers } from '@codemirror/view';
import type { StateEffectType } from '@codemirror/state';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';

export type AddWarnings = StateEffectType<{
	messages: { message: string; pos: number }[];
	type: 'error' | 'warning';
}>;

export const addWarnings: AddWarnings = StateEffect.define<{
	messages: { message: string; pos: number }[];
	type: 'error' | 'warning';
}>();

const warningsField = StateField.define({
	create() {
		return Decoration.none;
	},
	provide: field => EditorView.decorations.from(field),
	update(warnings, transaction) {
		let hasWarning = false;
		for (const effect of transaction.effects) {
			if (effect.is(addWarnings)) {
				if (!hasWarning) {
					hasWarning = true;
					warnings = Decoration.none;
				}
				warnings = warnings.update({
					add: effect.value.messages
						.sort((a, b) => a.pos - b.pos)
						.map(({ pos, message }) =>
							Decoration.mark({
								attributes: {
									class: `cm-rollup-${effect.value.type}`,
									title: message
								}
							}).range(pos, pos + 1)
						)
				});
			}
		}
		return warnings;
	}
});

const theme = EditorView.baseTheme({
	'&.cm-editor.cm-focused': {
		outline: 'none'
	},
	'.cm-content': {
		color: '#333',
		height: '100%'
	},
	'.cm-gutters': {
		borderRight: '1px solid #eee',
		color: '#999'
	},
	'.cm-rollup-error': {
		backgroundColor: 'var(--error-background)',
		color: 'var(--error-color)',
		margin: '-1px',
		padding: '1px'
	},
	'.cm-rollup-warning': {
		backgroundColor: 'var(--warning-background)',
		color: 'var(--warning-color)',
		margin: '-1px',
		padding: '1px'
	},
	'.cm-scroller': {
		fontFamily: 'Inconsolata, monospace',
		fontSize: '16px',
		fontWeight: '400',
		lineHeight: '1.2'
	}
});

export const createEditor = (
	parent: HTMLElement,
	document_: string,
	onUpdate: (
		update: ViewUpdate & {
			changedRanges: {
				fromA: number;
				fromB: number;
				toA: number;
				toB: number;
			}[];
		}
	) => void,
	readonly: boolean
) =>
	new EditorView({
		doc: document_,
		extensions: [
			lineNumbers(),
			history(),
			dropCursor(),
			indentOnInput(),
			syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
			closeBrackets(),
			keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap]),
			javascript(),
			EditorState.readOnly.of(readonly),
			EditorView.lineWrapping,
			EditorState.tabSize.of(2),
			EditorView.updateListener.of(onUpdate as any),
			warningsField,
			theme
		],
		parent
	});
