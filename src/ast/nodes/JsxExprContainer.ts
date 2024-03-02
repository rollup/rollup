import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JsxExprContainer extends NodeBase {
	type!: NodeType.tJsxExprContainer;
	expression!: ExpressionNode;
}
