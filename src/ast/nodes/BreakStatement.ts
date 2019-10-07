import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

// TODO Lukas also implement continue statements
export default class BreakStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext) {
		return (
			super.hasEffects(context) ||
			!context.ignore.breakStatements ||
			(this.label !== null && !context.ignore.labels.has(this.label.name))
		);
	}

	include(_includeChildrenRecursively: boolean | 'variables', context: InclusionContext) {
		this.included = true;
		if (this.label) {
			this.label.include();
		}
		context.breakFlow = new Set();
	}
}
