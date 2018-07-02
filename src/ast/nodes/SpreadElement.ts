import { UNKNOWN_KEY } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	type: NodeType.tSpreadElement;
	argument: ExpressionNode;

	bind() {
		super.bind();
		// Only properties of properties of the argument could become subject to reassignment
		this.argument.reassignPath([UNKNOWN_KEY, UNKNOWN_KEY]);
	}
}
