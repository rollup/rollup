import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../../rollup/types';
import type { RenderOptions } from '../../../utils/renderHelpers';
import { NodeBase } from './Node';

export default class JSXClosingBase extends NodeBase {
	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		} else {
			super.render(code, options);
		}
	}
}
