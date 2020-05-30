import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockStatement from './BlockStatement';
import CatchClause from './CatchClause';
import * as NodeType from './NodeType';
import { IncludeChildren, INCLUDE_PARAMETERS, StatementBase } from './shared/Node';

export default class TryStatement extends StatementBase {
	block!: BlockStatement;
	finalizer!: BlockStatement | null;
	handler!: CatchClause | null;
	type!: NodeType.tTryStatement;

	private directlyIncluded = false;

	hasEffects(context: HasEffectsContext): boolean {
		return (
			((this.context.options.treeshake as NormalizedTreeshakingOptions).tryCatchDeoptimization
				? this.block.body.length > 0
				: this.block.hasEffects(context)) ||
			(this.finalizer !== null && this.finalizer.hasEffects(context))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		const tryCatchDeoptimization = (this.context.options.treeshake as NormalizedTreeshakingOptions)
			?.tryCatchDeoptimization;
		const { brokenFlow } = context;
		if (!this.directlyIncluded || !tryCatchDeoptimization) {
			this.included = true;
			this.directlyIncluded = true;
			this.block.include(
				context,
				tryCatchDeoptimization ? INCLUDE_PARAMETERS : includeChildrenRecursively
			);
			context.brokenFlow = brokenFlow;
		}
		if (this.handler !== null) {
			this.handler.include(context, includeChildrenRecursively);
			context.brokenFlow = brokenFlow;
		}
		if (this.finalizer !== null) {
			this.finalizer.include(context, includeChildrenRecursively);
		}
	}
}
