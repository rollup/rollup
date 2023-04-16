import { type HasEffectsContext, type InclusionContext, UnlabeledBreak } from '../ExecutionContext';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	declare label: Identifier | null;
	declare type: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext): boolean {
		const labelName = this.label?.name || UnlabeledBreak;
		if (!context.ignore.labels.has(labelName)) return true;
		context.includedLabels.add(labelName);
		context.brokenFlow = true;
		return false;
	}

	include(context: InclusionContext): void {
		this.included = true;
		if (this.label) {
			this.label.include();
			context.includedLabels.add(this.label.name);
		} else {
			context.includedLabels.add(UnlabeledBreak);
		}
		context.brokenFlow = true;
	}
}
