import type { ast } from '../../rollup/types';
import {
	createInclusionContext,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import { type ObjectPath, UNKNOWN_PATH } from '../utils/PathTracker';
import type Identifier from './Identifier';
import type { BreakStatementParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class BreakStatement extends NodeBase<ast.BreakStatement> {
	parent!: BreakStatementParent;
	label!: Identifier | null;
	type!: NodeType.tBreakStatement;

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
