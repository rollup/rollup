import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

const RE_WHITESPACE_TRIM = /^[ \t]*\r?\n[ \t\r\n]*|[ \t]*\r?\n[ \t\r\n]*$/g;
const RE_WHITESPACE_MERGE = /[ \t]*\r?\n[ \t\r\n]*/g;

export default class JSXText extends NodeBase {
	declare type: NodeType.tJSXText;
	declare value: string;
	declare raw: string;

	private renderedText: string | undefined;

	shouldRender() {
		return !!this.getRenderedText();
	}

	render(code: MagicString) {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.end, JSON.stringify(this.getRenderedText()), {
				contentOnly: true
			});
		}
	}

	private getRenderedText() {
		if (this.renderedText === undefined)
			this.renderedText = this.value
				.replace(RE_WHITESPACE_TRIM, '')
				.replace(RE_WHITESPACE_MERGE, ' ');
		return this.renderedText;
	}
}

JSXText.prototype.includeNode = onlyIncludeSelf;
