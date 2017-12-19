import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Identifier from './Identifier';

export default class BreakStatement extends Node {
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
