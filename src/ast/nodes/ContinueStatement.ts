import {
	BREAKFLOW_BREAK_CONTINUE,
	BREAKFLOW_ERROR_RETURN_LABEL,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class ContinueStatement extends StatementBase {
	label!: Identifier | null;
	type!: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext) {
		if (this.label) {
			if (!context.ignore.labels.has(this.label.name)) return true;
			context.includedLabels.add(this.label.name);
			context.breakFlow = BREAKFLOW_ERROR_RETURN_LABEL;
		} else {
			if (!context.ignore.breakStatements) return true;
			context.breakFlow = BREAKFLOW_BREAK_CONTINUE;
		}
		return false;
	}

	include(context: InclusionContext) {
		this.included = true;
		if (this.label) {
			this.label.include(context);
			context.includedLabels.add(this.label.name);
		}
		context.breakFlow = this.label ? BREAKFLOW_ERROR_RETURN_LABEL : BREAKFLOW_BREAK_CONTINUE;
	}
}
