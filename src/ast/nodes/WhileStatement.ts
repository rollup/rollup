import Statement from './shared/Statement';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class WhileStatement extends Statement {
	type: 'WhileStatement';
	test: Expression;
	body: Statement;

	hasEffects (options: ExecutionPathOptions) {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
