import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';
import { BasicStatementNode } from './shared/Statement';

export default class BreakStatement extends BasicStatementNode {
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
