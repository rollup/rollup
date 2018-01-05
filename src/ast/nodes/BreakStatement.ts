import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { GenericStatementNode } from './shared/Statement';

export default class BreakStatement extends GenericStatementNode {
	type: 'BreakStatement';
	label: Identifier | null;

	hasEffects (options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			!options.ignoreBreakStatements() ||
			(this.label && !options.ignoreLabel(this.label.name))
		);
	}
}
