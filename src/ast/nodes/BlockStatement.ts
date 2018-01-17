import BlockScope from '../scopes/BlockScope';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { Node } from './shared/Node';
import { StatementBase, StatementNode } from './shared/Statement';
import { NodeType } from './NodeType';

export function isBlockStatement (node: Node): node is BlockStatement {
	return node.type === NodeType.BlockStatement;
}

export default class BlockStatement extends StatementBase {
	type: NodeType.BlockStatement;
	scope: Scope;
	body: StatementNode[];

	bindImplicitReturnExpressionToScope () {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
			this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
		}
	}

	hasEffects (options: ExecutionPathOptions) {
		return this.body.some(child => child.hasEffects(options));
	}

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.body.forEach(node => {
			if (node.shouldBeIncluded()) {
				if (node.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		return addedNewNodes;
	}

	initialiseAndReplaceScope (scope: Scope) {
		this.scope = scope;
		this.initialiseNode(scope);
		this.initialiseChildren(scope);
	}

	initialiseChildren (_parentScope: Scope) {
		let lastNode;
		for (const node of this.body) {
			node.initialise(this.scope);

			if (lastNode) lastNode.next = node.start;
			lastNode = node;
		}
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}

	render (code: MagicString, es: boolean) {
		if (this.body.length) {
			for (const node of this.body) {
				node.render(code, es);
			}
		} else {
			super.render(code, es);
		}
	}
}
