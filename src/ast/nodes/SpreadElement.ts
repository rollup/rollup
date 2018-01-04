import { Expression, ExpressionNode } from './shared/Expression';
import { Node } from './shared/Node';

export default interface SpreadElement extends Expression, Node {
  type: 'SpreadElement';
  argument: ExpressionNode;
}
