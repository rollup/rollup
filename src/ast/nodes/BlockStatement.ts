import BlockScope from '../scopes/BlockScope';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { Node, StatementBase, StatementNode } from './shared/Node';
import { NodeType } from './NodeType';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';

export function isBlockStatement(node: Node): node is BlockStatement {
	return node.type === NodeType.BlockStatement;
}

export default class BlockStatement extends StatementBase {
	type: NodeType.BlockStatement;
	scope: Scope;
	body: StatementNode[];

	bindImplicitReturnExpressionToScope() {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	hasEffects(options: ExecutionPathOptions) {
		return this.body.some(child => child.hasEffects(options));
	}

	includeInBundle() {
		let addedNewNodes = !this.included;
		this.included = true;
		for (const node of this.body) {
			if (node.shouldBeIncluded() && node.includeInBundle()) {
				addedNewNodes = true;
			}
		}
		return addedNewNodes;
	}

	initialiseAndReplaceScope(scope: Scope) {
		this.scope = scope;
		this.initialiseNode(scope);
		this.initialiseChildren(scope);
	}

	initialiseChildren(_parentScope: Scope) {
		for (const node of this.body) {
			node.initialise(this.scope);
		}
	}

	initialiseScope(parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
		} else {
			super.render(code, options);
		}
	}
}
