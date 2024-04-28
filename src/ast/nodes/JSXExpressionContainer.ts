import type * as NodeType from './NodeType';
import type { ExpressionNode } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXExpressionContainer extends NodeBase {
	type!: NodeType.tJSXExpressionContainer;
	expression!: ExpressionNode;
}
