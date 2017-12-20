import Statement from './shared/Statement';
import StatementType from './Statement';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';

export default class LabeledStatement extends Statement {
	type: 'LabeledStatement';
	label: Identifier;
	body: StatementType;

	hasEffects (options: ExecutionPathOptions) {
		return this.body.hasEffects(
			options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements()
		);
	}
}
