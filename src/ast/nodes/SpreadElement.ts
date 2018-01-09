import { ExpressionNode } from './shared/Node';
import { NodeType } from './index';

export default interface SpreadElement extends ExpressionNode {
  type: NodeType.SpreadElement;
  argument: ExpressionNode;
}
