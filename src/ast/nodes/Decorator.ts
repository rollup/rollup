import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class Decorator extends NodeBase {
	declare type: NodeType.tDecorator;
	declare expression: ExpressionNode;
}
