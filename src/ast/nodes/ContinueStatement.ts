import {
	BROKEN_FLOW_BREAK_CONTINUE,
	BROKEN_FLOW_ERROR_RETURN_LABEL,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class ContinueStatement extends StatementBase {
	declare label: Identifier | null;
	declare type: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.label) {
			if (!context.ignore.labels.has(this.label.name)) return true;
			context.includedLabels.add(this.label.name);
			context.brokenFlow = BROKEN_FLOW_ERROR_RETURN_LABEL;
		} else {
			if (!context.ignore.continues) return true;
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
