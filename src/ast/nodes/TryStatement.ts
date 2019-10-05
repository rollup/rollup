import { EffectsExecutionContext, ExecutionContext } from '../ExecutionContext';
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

	hasEffects(context: EffectsExecutionContext): boolean {
		return (
			this.block.body.length > 0 ||
			(this.handler !== null && this.handler.hasEffects(context)) ||
			(this.finalizer !== null && this.finalizer.hasEffects(context))
		);
	}

	include(includeChildrenRecursively: IncludeChildren, context: ExecutionContext) {
		if (!this.directlyIncluded || !this.context.tryCatchDeoptimization) {
			this.included = true;
			this.directlyIncluded = true;
			this.block.include(
				this.context.tryCatchDeoptimization ? INCLUDE_PARAMETERS : includeChildrenRecursively,
				context
			);
		}
		if (this.handler !== null) {
			this.handler.include(includeChildrenRecursively, context);
		}
		if (this.finalizer !== null) {
			this.finalizer.include(includeChildrenRecursively, context);
		}
	}
}
