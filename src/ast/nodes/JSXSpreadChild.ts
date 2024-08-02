import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXSpreadChild extends NodeBase {
	type!: NodeType.tJSXSpreadChild;
	expression!: ExpressionNode;

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.overwrite(this.start, this.expression.start, '...', { contentOnly: true });
			code.overwrite(this.expression.end, this.end, '', { contentOnly: true });
		}
	}
}
