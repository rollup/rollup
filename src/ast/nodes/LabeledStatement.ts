import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { GenericStatementNode, StatementNode } from './shared/Statement';

export default class LabeledStatement extends GenericStatementNode {
	type: 'LabeledStatement';
	label: Identifier;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions) {
		return this.body.hasEffects(
			options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements()
		);
	}
}
