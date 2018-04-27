import { ExpressionNode } from './shared/Node';
import * as NodeType from './NodeType';

export default interface SpreadElement extends ExpressionNode {
	type: NodeType.tSpreadElement;
	argument: ExpressionNode;
}
