import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { BasicStatementNode, StatementNode } from './shared/Statement';

export default class LabeledStatement extends BasicStatementNode {
	type: 'LabeledStatement';
	label: Identifier;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions) {
		return this.body.hasEffects(
			options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements()
		);
	}
}
