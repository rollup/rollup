import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../../rollup/types';
import { NodeBase } from './Node';

// TODO Lukas get rid of this and move into JSXElement
export default class JSXClosingBase extends NodeBase {
	render(code: MagicString): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		}
	}
}
