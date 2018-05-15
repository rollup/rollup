import BlockScope from '../scopes/BlockScope';
import { UNKNOWN_EXPRESSION } from '../values';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { Node, StatementBase, StatementNode } from './shared/Node';
import * as NodeType from './NodeType';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';

export function isBlockStatement(node: Node): node is BlockStatement {
	return node.type === NodeType.BlockStatement;
}

export default class BlockStatement extends StatementBase {
	type: NodeType.tBlockStatement;
	body: StatementNode[];

	bindImplicitReturnExpressionToScope() {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	createScope(parentScope: Scope) {
		this.scope = (<Node>this.parent).preventChildBlockScope
			? parentScope
			: new BlockScope({ parent: parentScope });
	}

	hasEffects(options: ExecutionPathOptions) {
		for (const node of this.body) {
			if (node.hasEffects(options)) return true;
		}
	}

	include() {
		this.included = true;
		for (const node of this.body) {
			if (node.shouldBeIncluded()) node.include();
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
