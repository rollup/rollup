import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { UnknownKey } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	argument!: ExpressionNode;
	type!: NodeType.tSpreadElement;
	private deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return this.argument.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.argument.include(context, includeChildrenRecursively);
	}

	private applyDeoptimizations(): void {
		this.deoptimized = true;
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UnknownKey, UnknownKey]);
	}
}
