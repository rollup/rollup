import {
	createInclusionContext,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { StatementBase } from './shared/Node';

export default class BreakStatement extends StatementBase {
	declare label: Identifier | null;
	declare type: NodeType.tBreakStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.label) {
			if (!context.ignore.labels.has(this.label.name)) return true;
			context.includedLabels.add(this.label.name);
		} else {
			if (!context.ignore.breaks) return true;
			context.hasBreak = true;
		}
		context.brokenFlow = true;
		return false;
	}

	includePath(_: ObjectPath, context: InclusionContext): void {
		this.included = true;
		if (this.label) {
			this.label.includePath(UNKNOWN_PATH, createInclusionContext());
			context.includedLabels.add(this.label.name);
		} else {
			context.hasBreak = true;
		}
		context.brokenFlow = true;
	}
}
