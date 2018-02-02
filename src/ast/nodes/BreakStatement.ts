import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { NodeType } from './NodeType';
import { NodeBase } from './shared/Node';

export default class BreakStatement extends NodeBase {
	type: NodeType.BreakStatement;
	label: Identifier | null;

	hasEffects (options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			!options.ignoreBreakStatements() ||
			(this.label && !options.ignoreLabel(this.label.name))
		);
	}
}
