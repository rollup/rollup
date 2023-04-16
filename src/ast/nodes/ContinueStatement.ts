import {
	type HasEffectsContext,
	type InclusionContext,
	UnlabeledContinue
} from '../ExecutionContext';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class ContinueStatement extends StatementBase {
	declare label: Identifier | null;
	declare type: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext): boolean {
		const labelName = this.label?.name || UnlabeledContinue;
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
			context.includedLabels.add(UnlabeledContinue);
		}
		context.brokenFlow = true;
	}
}
