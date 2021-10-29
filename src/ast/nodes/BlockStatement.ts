import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import ChildScope from '../scopes/ChildScope';
import Scope from '../scopes/Scope';
import ExpressionStatement from './ExpressionStatement';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { IncludeChildren, Node, StatementBase, StatementNode } from './shared/Node';

export default class BlockStatement extends StatementBase {
	declare body: StatementNode[];
	declare type: NodeType.tBlockStatement;

	private declare deoptimizeBody: boolean;
	private directlyIncluded = false;

	addImplicitReturnExpressionToScope(): void {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	createScope(parentScope: Scope): void {
		this.scope = (this.parent as Node).preventChildBlockScope
			? (parentScope as ChildScope)
			: new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.deoptimizeBody) return true;
		for (const node of this.body) {
			if (context.brokenFlow) break;
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!(this.deoptimizeBody && this.directlyIncluded)) {
			this.included = true;
			this.directlyIncluded = true;
			if (this.deoptimizeBody) includeChildrenRecursively = true;
			for (const node of this.body) {
				if (includeChildrenRecursively || node.shouldBeIncluded(context))
					node.include(context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		const firstBodyStatement = this.body[0];
		this.deoptimizeBody =
			firstBodyStatement instanceof ExpressionStatement &&
			firstBodyStatement.directive === 'use asm';
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.body.length) {
			renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
		} else {
			super.render(code, options);
		}
	}
}
