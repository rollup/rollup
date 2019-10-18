import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import ChildScope from '../scopes/ChildScope';
import Scope from '../scopes/Scope';
import { UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { IncludeChildren, Node, StatementBase, StatementNode } from './shared/Node';

export default class BlockStatement extends StatementBase {
	body!: StatementNode[];
	type!: NodeType.tBlockStatement;

	addImplicitReturnExpressionToScope() {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	createScope(parentScope: Scope) {
		this.scope = (this.parent as Node).preventChildBlockScope
			? (parentScope as ChildScope)
			: new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext) {
		for (const node of this.body) {
			if (node.hasEffects(context)) return true;
			if (context.brokenFlow) break;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(context, includeChildrenRecursively);
		}
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
		} else {
			super.render(code, options);
		}
	}
}
