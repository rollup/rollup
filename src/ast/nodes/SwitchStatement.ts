import BlockScope from '../scopes/BlockScope';
import Statement from './shared/Statement';
import SwitchCase from './SwitchCase';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';

export default class SwitchStatement extends Statement {
	type: 'SwitchStatement';
	discriminant: Expression;
	cases: SwitchCase[];

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options.setIgnoreBreakStatements());
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
