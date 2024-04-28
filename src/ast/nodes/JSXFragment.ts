import type JSXOpeningFragment from './JSXOpeningFragment';
import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class JsxElement extends NodeBase {
	declare closingFragment: unknown;
	declare openingFragment: JSXOpeningFragment;
	declare type: NodeType.tJSXElement;
	declare children: ExpressionNode[];
}
