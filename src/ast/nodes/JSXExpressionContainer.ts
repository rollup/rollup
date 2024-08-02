import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type JSXEmptyExpression from './JSXEmptyExpression';
import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXExpressionContainer extends NodeBase {
	type!: NodeType.tJSXExpressionContainer;
	expression!: ExpressionNode | JSXEmptyExpression;

	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			code.remove(this.start, this.expression.start);
			code.remove(this.expression.end, this.end);
		}
		this.expression.render(code, options);
	}
}
