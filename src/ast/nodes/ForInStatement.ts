import Statement from './shared/Statement';
import StatementType from './Statement';
import BlockScope from '../scopes/BlockScope';
import VariableDeclaration from './VariableDeclaration';
import Pattern from './Pattern';
import Expression from './Expression';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ForInStatement extends Statement {
	type: 'ForInStatement';
	left: VariableDeclaration | Pattern;
	right: Expression;
	body: StatementType;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			(this.left &&
				(this.left.hasEffects(options) ||
					this.left.hasEffectsWhenAssignedAtPath([], options))) ||
			(this.right && this.right.hasEffects(options)) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}

	initialiseChildren () {
		this.left.initialise(this.scope);
		this.right.initialise(this.scope.parent);
		this.body.initialiseAndReplaceScope
			? this.body.initialiseAndReplaceScope(this.scope)
			: this.body.initialise(this.scope);
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if (this.left.includeWithAllDeclarations()) {
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
