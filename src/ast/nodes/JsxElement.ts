import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class JsxElement extends NodeBase {
	declare closingElement: unknown;
	declare openingElement: unknown;
	declare type: NodeType.tJsxElement;
	declare children: ExpressionNode[];
}
