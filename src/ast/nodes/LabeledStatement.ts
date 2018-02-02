import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { NodeType } from './NodeType';
import { NodeBase, Node } from './shared/Node';

export default class LabeledStatement extends NodeBase {
	type: NodeType.LabeledStatement;
	label: Identifier;
	body: Node;

	hasEffects (options: ExecutionPathOptions) {
		return this.body.hasEffects(
			options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements()
		);
	}
}
