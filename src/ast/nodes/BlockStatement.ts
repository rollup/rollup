import BlockScope from '../scopes/BlockScope';
import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import MagicString from 'magic-string';
import { Node } from './shared/Node';
import { StatementBase, StatementNode } from './shared/Statement';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';

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

	render (code: MagicString, options: RenderOptions) {
		if (this.body.length) {
			let nextLineBreakPos = code.slice(this.start + 1, this.body[0].start).indexOf('\n');
			let nodeStart = Math.max(0, nextLineBreakPos + 1) + this.start + 1;
			let nodeEnd;
			for (let nodeIdx = 0; nodeIdx < this.body.length; nodeIdx++) {
				const node = this.body[nodeIdx];
				if (nodeIdx === this.body.length - 1) {
					nodeEnd = this.end - 1;
				} else {
					const nextNode = this.body[nodeIdx + 1];
					nextLineBreakPos = code.slice(node.end, nextNode.start).indexOf('\n');
					nodeEnd = Math.max(0, nextLineBreakPos + 1) + node.end;
				}
				if (!node.included) {
					code.remove(nodeStart, nodeEnd);
				} else {
					node.render(code, options);
				}
				nodeStart = nodeEnd;
			}
		} else {
			super.render(code, options);
		}
	}
}
