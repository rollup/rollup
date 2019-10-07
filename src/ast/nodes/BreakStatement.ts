import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext) {
		return (
			!context.ignore.breakStatements ||
			(this.label !== null && !context.ignore.labels.has(this.label.name))
		);
	}

	include(_includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		if (this.label) {
			this.label.include();
			context.breakFlow = new Set([this.label.name]);
		} else {
			context.breakFlow = new Set([null]);
		}
	}
}
