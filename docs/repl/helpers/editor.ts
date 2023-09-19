import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import type { StateEffectType } from '@codemirror/state';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import { Decoration, dropCursor, EditorView, keymap, lineNumbers } from '@codemirror/view';
import { tags } from '@lezer/highlight';

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
		caretColor: 'var(--vp-c-neutral)',
		color: '#A6ACCD',
		fontFamily: 'var(--vp-font-family-mono)',
		fontSize: '14px',
		height: '100%',
		lineHeight: '24px',
		padding: '8px'
	},
	'.cm-gutters': {
		backgroundColor: 'var(--vp-code-block-bg)',
		border: 'none',
		borderBottomLeftRadius: '8px',
		borderRight: '1px solid var(--vp-code-block-divider-color)',
		borderTopLeftRadius: '8px',
		color: 'var(--vp-code-line-number-color)',
		minWidth: '32px'
	},
	'.cm-gutters .cm-gutterElement': {
		textAlign: 'center'
	},
	'.cm-lineNumbers': {
		alignItems: 'center',
		width: '100%'
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
		borderBottomLeftRadius: '8px',
		borderBottomRightRadius: '8px',
		fontFamily: 'var(--vp-font-family-mono)',
		fontSize: '14px',
		fontWeight: '400',
		lineHeight: '24px',
		marginTop: '2px'
	}
});

const highlightStyle = HighlightStyle.define([
	{ color: '#676E95', fontStyle: 'italic', tag: tags.comment },
	{ color: '#C3E88D', tag: tags.string },
	{ color: '#FF9CAC', tag: tags.literal },
	// names
	{ color: '#A6ACCD', tag: tags.name },
	{ color: '#f07178', tag: tags.variableName },
	{ color: '#82AAFF', tag: tags.propertyName },
	// punctuation
	{ color: '#89DDFF', tag: tags.punctuation },
	{ color: '#89DDFF', tag: tags.operator },
	// keywords
	{ color: '#89DDFF', tag: tags.keyword },
	{ color: '#C792EA', tag: tags.definitionKeyword }
]);

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
			syntaxHighlighting(highlightStyle, { fallback: true }),
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
