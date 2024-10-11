import type MagicString from 'magic-string';
import type { ast } from '../../rollup/types';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import ChildScope from '../scopes/ChildScope';
import type CallExpression from './CallExpression';
import type { IdentifierWithVariable } from './Identifier';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionExpression extends FunctionNode<ast.FunctionExpression> {
	type!: NodeType.tFunctionExpression;
	idScope!: ChildScope;

	createScope(parentScope: ChildScope) {
		super.createScope((this.idScope = new ChildScope(parentScope, parentScope.context)));
	}

	parseNode(esTreeNode: ast.FunctionExpression): this {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(this, this.idScope).parseNode(
				esTreeNode.id
			) as IdentifierWithVariable;
		}
		return super.parseNode(esTreeNode);
	}

	protected onlyFunctionCallUsed(): boolean {
		const isIIFE =
			this.parent.type === NodeType.CallExpression &&
			(this.parent as CallExpression).callee === this &&
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
