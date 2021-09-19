import {
	BROKEN_FLOW_BREAK_CONTINUE,
	BROKEN_FLOW_ERROR_RETURN_LABEL,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	declare label: Identifier | null;
	declare type: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.label) {
			if (!context.ignore.labels.has(this.label.name)) return true;
			context.includedLabels.add(this.label.name);
			context.brokenFlow = BROKEN_FLOW_ERROR_RETURN_LABEL;
		} else {
			if (!context.ignore.breaks) return true;
			context.brokenFlow = BROKEN_FLOW_BREAK_CONTINUE;
		}
		return false;
	}

	include(context: InclusionContext): void {
		this.included = true;
		if (this.label) {
			this.label.include();
			context.includedLabels.add(this.label.name);
		}
		context.brokenFlow = this.label ? BROKEN_FLOW_ERROR_RETURN_LABEL : BROKEN_FLOW_BREAK_CONTINUE;
	}
}
