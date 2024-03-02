import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class JsxElement extends NodeBase {
	declare closingFragment: unknown;
	declare openingFragment: unknown;
	declare type: NodeType.tJsxElement;
	declare children: ExpressionNode[];
}
