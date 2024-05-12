import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../../rollup/types';
import { NodeBase } from './Node';

export default class JSXClosingBase extends NodeBase {
	render(code: MagicString): void {
		const { preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		}
	}
}
