import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { StatementBase, StatementNode } from './shared/Statement';

export default class LabeledStatement extends StatementBase {
	type: 'LabeledStatement';
	label: Identifier;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions) {
		return this.body.hasEffects(
			options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements()
		);
	}
}
