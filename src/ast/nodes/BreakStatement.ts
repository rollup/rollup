import { ExecutionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tBreakStatement;

	hasEffects(context: ExecutionContext) {
		return (
			super.hasEffects(context) ||
			!context.ignoreBreakStatements ||
			(this.label !== null && !context.ignoredLabels.has(this.label.name))
		);
	}
}
