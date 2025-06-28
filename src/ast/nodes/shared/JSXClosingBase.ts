import type MagicString from 'magic-string';
import type { AstNode } from '../../../rollup/ast-types';
import type { NormalizedJsxOptions } from '../../../rollup/types';
import type { RenderOptions } from '../../../utils/renderHelpers';
import { NodeBase, onlyIncludeSelf } from './Node';

export default class JSXClosingBase<T extends AstNode> extends NodeBase<T> {
	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.end, ')', { contentOnly: true });
		} else {
			super.render(code, options);
		}
	}
}

JSXClosingBase.prototype.includeNode = onlyIncludeSelf;
