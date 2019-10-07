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

	// TODO Lukas check brokenFlow here as well
	// simple logic: Break if flow is broken, as we only run this for non-included nodes
	// Are there other places where this is relevant, everywhere we are using shouldBeIncluded?
	// We definitely need to restore flow everywhere we do this for include
	// TODO Lukas we could also eliminate trailing continue statements
	hasEffects(context: HasEffectsContext) {
		for (const node of this.body) {
			if (node.hasEffects(context)) return true;
		}
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		for (const node of this.body) {
			if (includeChildrenRecursively || node.shouldBeIncluded(context))
				node.include(includeChildrenRecursively, context);
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
