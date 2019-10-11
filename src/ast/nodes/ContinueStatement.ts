import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, StatementBase } from './shared/Node';

export default class ContinueStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext) {
		if (!(this.label ? context.ignore.labels.has(this.label.name) : context.ignore.breakStatements))
			return true;
		context.breakFlow = new Set([this.label && this.label.name]);
		return false;
	}

	include(_includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		if (this.label) this.label.include();
		context.breakFlow = new Set([this.label && this.label.name]);
	}
}
