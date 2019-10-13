import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext) {
		if (!(this.label ? context.ignore.labels.has(this.label.name) : context.ignore.breakStatements))
			return true;
		context.breakFlow = new Set([this.label && this.label.name]);
		return false;
	}

	include(context: InclusionContext) {
		this.included = true;
		if (this.label) this.label.include(context);
		context.breakFlow = new Set([this.label && this.label.name]);
	}
}
