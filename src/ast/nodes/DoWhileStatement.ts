import Statement from './shared/Statement';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class DoWhileStatement extends Statement {
	type: 'DoWhileStatement';
	body: Statement;
	test: Expression;

	hasEffects (options: ExecutionPathOptions) {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
