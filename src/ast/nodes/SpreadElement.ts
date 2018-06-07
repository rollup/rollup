import * as NodeType from './NodeType';
import { ExpressionNode } from './shared/Node';

export default interface SpreadElement extends ExpressionNode {
	type: NodeType.tSpreadElement;
	argument: ExpressionNode;
}
