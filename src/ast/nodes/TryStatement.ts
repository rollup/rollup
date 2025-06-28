import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type BlockStatement from './BlockStatement';
import type CatchClause from './CatchClause';
import type * as NodeType from './NodeType';
import {
	doNotDeoptimize,
	INCLUDE_PARAMETERS,
	type IncludeChildren,
	onlyIncludeSelfNoDeoptimize,
	StatementBase
} from './shared/Node';

export default class TryStatement extends StatementBase {
	block!: BlockStatement;
	finalizer!: BlockStatement | null;
	handler!: CatchClause | null;
	type!: NodeType.tTryStatement;

	private directlyIncluded = false;
	private includedLabelsAfterBlock: string[] | null = null;

	hasEffects(context: HasEffectsContext): boolean {
		return (
			((this.scope.context.options.treeshake as NormalizedTreeshakingOptions).tryCatchDeoptimization
				? this.block.body.length > 0
				: this.block.hasEffects(context)) || !!this.finalizer?.hasEffects(context)
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		const tryCatchDeoptimization = (
			this.scope.context.options.treeshake as NormalizedTreeshakingOptions
		)?.tryCatchDeoptimization;
		const { brokenFlow, includedLabels } = context;
		if (!this.directlyIncluded || !tryCatchDeoptimization) {
			this.included = true;
			this.directlyIncluded = true;
			this.block.include(
				context,
				tryCatchDeoptimization ? INCLUDE_PARAMETERS : includeChildrenRecursively
			);
			if (includedLabels.size > 0) {
				this.includedLabelsAfterBlock = [...includedLabels];
			}
			context.brokenFlow = brokenFlow;
		} else if (this.includedLabelsAfterBlock) {
			for (const label of this.includedLabelsAfterBlock) {
				includedLabels.add(label);
			}
		}
		if (this.handler !== null) {
			this.handler.include(context, includeChildrenRecursively);
			context.brokenFlow = brokenFlow;
		}
		this.finalizer?.include(context, includeChildrenRecursively);
	}
}

TryStatement.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
TryStatement.prototype.applyDeoptimizations = doNotDeoptimize;
