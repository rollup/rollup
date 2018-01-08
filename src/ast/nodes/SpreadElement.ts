import { ExpressionEntity, ExpressionNode } from './shared/Expression';
import { Node } from './shared/Node';

export default interface SpreadElement extends ExpressionEntity, Node {
  type: 'SpreadElement';
  argument: ExpressionNode;
}
