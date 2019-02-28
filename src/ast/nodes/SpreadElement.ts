import { UNKNOWN_KEY } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	argument: ExpressionNode;
	type: NodeType.tSpreadElement;

	bind() {
		super.bind();
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UNKNOWN_KEY, UNKNOWN_KEY]);
	}
}
