import Statement from './shared/Statement';
import StatementType from './statement';
import BlockScope from '../scopes/BlockScope';
import { UNDEFINED_ASSIGNMENT } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';

export default class BlockStatement extends Statement {
	type: 'BlockStatement';
	scope: BlockScope;
	body: StatementType[];

	bindImplicitReturnExpressionToScope () {
		const lastStatement = this.body[this.body.length - 1];
		if (!lastStatement || lastStatement.type !== 'ReturnStatement') {
			this.scope.addReturnExpression(UNDEFINED_ASSIGNMENT);
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

	initialiseAndReplaceScope (scope: BlockScope) {
		this.scope = scope;
		this.initialiseNode();
		this.initialiseChildren();
	}

	initialiseChildren () {
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

	render (code, es) {
		if (this.body.length) {
			for (const node of this.body) {
				node.render(code, es);
			}
		} else {
			Statement.prototype.render.call(this, code, es);
		}
	}
}
