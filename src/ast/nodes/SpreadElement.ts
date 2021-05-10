import { UnknownKey } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	argument!: ExpressionNode;
	type!: NodeType.tSpreadElement;
	protected deoptimized = false;

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UnknownKey, UnknownKey]);
	}
}
