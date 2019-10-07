import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class ContinueStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext) {
		return (
			!context.ignore.breakStatements ||
			(this.label !== null && !context.ignore.labels.has(this.label.name))
		);
	}

	include(_includeChildrenRecursively: boolean | 'variables', context: InclusionContext) {
		this.included = true;
		if (this.label) this.label.include();
		context.breakFlow = new Set();
	}
}
