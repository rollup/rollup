import BlockScope from '../scopes/BlockScope';
import VariableDeclaration from './VariableDeclaration';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { BasicStatementNode, StatementNode } from './shared/Statement';
import { ExpressionNode } from './shared/Expression';

export default class ForStatement extends BasicStatementNode {
	type: 'ForStatement';
	init: VariableDeclaration | ExpressionNode | null;
	test: ExpressionNode | null;
	update: ExpressionNode | null;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			(this.init && this.init.hasEffects(options)) ||
			(this.test && this.test.hasEffects(options)) ||
			(this.update && this.update.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	initialiseChildren () {
		if (this.init) this.init.initialise(this.scope);
		if (this.test) this.test.initialise(this.scope);
		if (this.update) this.update.initialise(this.scope);
		this.body.initialise(this.scope);
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
