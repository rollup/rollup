import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { NodeType } from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	type: NodeType.BreakStatement;
	label: Identifier | null;

	hasEffects(options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			!options.ignoreBreakStatements() ||
			(this.label && !options.ignoreLabel(this.label.name))
		);
	}
}
