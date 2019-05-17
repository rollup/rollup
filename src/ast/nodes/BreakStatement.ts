import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	label: Identifier | null;
	type: NodeType.tBreakStatement;

	hasEffects(options: ExecutionPathOptions) {
		return (
			super.hasEffects(options) ||
			!options.ignoreBreakStatements() ||
			((this.label && !options.ignoreLabel(this.label.name)) as boolean)
		);
	}
}
