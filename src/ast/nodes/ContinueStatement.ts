import type { ast } from '../../rollup/types';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import type Identifier from './Identifier';
import type { ContinueStatementParent } from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ContinueStatement extends NodeBase<ast.ContinueStatement> {
	parent!: ContinueStatementParent;
	label!: Identifier | null;
	type!: NodeType.tContinueStatement;

	hasEffects(context: HasEffectsContext): boolean {
		if (this.label) {
			if (!context.ignore.labels.has(this.label.name)) return true;
			context.includedLabels.add(this.label.name);
		} else {
			if (!context.ignore.continues) return true;
			context.hasContinue = true;
		}
		context.brokenFlow = true;
		return false;
	}

	include(context: InclusionContext): void {
		this.included = true;
		if (this.label) {
			this.label.include(context);
			context.includedLabels.add(this.label.name);
		} else {
			context.hasContinue = true;
		}
		context.brokenFlow = true;
	}
}

ContinueStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ContinueStatement.prototype.applyDeoptimizations = doNotDeoptimize;
