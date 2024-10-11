import type MagicString from 'magic-string';
import type { ast, NormalizedJsxOptions } from '../../rollup/types';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXText extends NodeBase<ast.JSXText> {
	type!: NodeType.tJSXText;
	value!: string;
	raw!: string;

	render(code: MagicString) {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.end, JSON.stringify(this.value), {
				contentOnly: true
			});
		}
	}
}

JSXText.prototype.includeNode = onlyIncludeSelf;
