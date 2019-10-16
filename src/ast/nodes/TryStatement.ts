import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockStatement from './BlockStatement';
import CatchClause from './CatchClause';
import * as NodeType from './NodeType';
import { INCLUDE_PARAMETERS, IncludeChildren, StatementBase } from './shared/Node';

export default class TryStatement extends StatementBase {
	block!: BlockStatement;
	finalizer!: BlockStatement | null;
	handler!: CatchClause | null;
	type!: NodeType.tTryStatement;

	private directlyIncluded = false;

	hasEffects(context: HasEffectsContext): boolean {
		return (
			(this.context.tryCatchDeoptimization
				? this.block.body.length > 0
				: this.block.hasEffects(context)) ||
			(this.finalizer !== null && this.finalizer.hasEffects(context))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		const { breakFlow } = context;
		if (!this.directlyIncluded || !this.context.tryCatchDeoptimization) {
			this.included = true;
			this.directlyIncluded = true;
			this.block.include(
				context,
				this.context.tryCatchDeoptimization ? INCLUDE_PARAMETERS : includeChildrenRecursively
			);
			context.breakFlow = breakFlow;
		}
		if (this.handler !== null) {
			this.handler.include(context, includeChildrenRecursively);
			context.breakFlow = breakFlow;
		}
		if (this.finalizer !== null) {
			this.finalizer.include(context, includeChildrenRecursively);
		}
	}
}
