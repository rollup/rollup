import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import BlockScope from '../scopes/BlockScope';
import ChildScope from '../scopes/ChildScope';
import Scope from '../scopes/Scope';
import { UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { Node, StatementBase, StatementNode } from './shared/Node';

export function isBlockStatement(node: Node): node is BlockStatement {
	return node.type === NodeType.BlockStatement;
}

export default class BlockStatement extends StatementBase {
	type: NodeType.tBlockStatement;
	body: StatementNode[];

	addImplicitReturnExpressionToScope() {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	createScope(parentScope: Scope) {
		this.scope = (<Node>this.parent).preventChildBlockScope
			? <ChildScope>parentScope
			: new BlockScope(parentScope);
	}

	hasEffects(options: ExecutionPathOptions) {
		for (const node of this.body) {
			if (node.hasEffects(options)) return true;
		}
	}

	include(includeAllChildrenRecursively: boolean) {
		this.included = true;
		for (const node of this.body) {
			if (includeAllChildrenRecursively || node.shouldBeIncluded())
				node.include(includeAllChildrenRecursively);
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
