import Statement from './shared/Statement';
import BlockScope from '../scopes/BlockScope';
import VariableDeclaration from './VariableDeclaration';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';

export default class ForStatement extends Statement {
	type: 'ForStatement';
	init: VariableDeclaration | Expression | null;
	test: Expression | null;
	update: Expression | null;
	body: Statement;

	hasEffects (options: ExecutionPathOptions) {
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

		if (this.body.type === 'BlockStatement') {
			this.body.initialiseScope(this.scope);
			this.body.initialiseChildren();
		} else {
			this.body.initialise(this.scope);
		}
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
