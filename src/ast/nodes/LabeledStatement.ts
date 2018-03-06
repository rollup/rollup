import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { NodeType } from './NodeType';
import { StatementBase, StatementNode } from './shared/Node';

export default class LabeledStatement extends StatementBase {
	type: NodeType.LabeledStatement;
	label: Identifier;
	body: StatementNode;

	hasEffects(options: ExecutionPathOptions) {
		return this.body.hasEffects(options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements());
	}
}
