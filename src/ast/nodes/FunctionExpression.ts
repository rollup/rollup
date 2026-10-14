import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import ChildScope from '../scopes/ChildScope';
import type * as nodes from './node-unions';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionExpression extends FunctionNode {
	declare parent: nodes.FunctionExpressionParent;
	declare type: NodeType.tFunctionExpression;
	declare idScope: ChildScope;

	createScope(parentScope: ChildScope) {
		super.createScope((this.idScope = new ChildScope(parentScope, parentScope.context)));
	}

	protected onlyFunctionCallUsed(): boolean {
		const isIIFE =
			this.parent.type === NodeType.CallExpression &&
			this.parent.callee === this &&
			(this.id === null || this.id.variable.getOnlyFunctionCallUsed());
		return isIIFE || super.onlyFunctionCallUsed();
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		super.render(code, options);
		if (renderedSurroundingElement === NodeType.ExpressionStatement) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
	}
}
