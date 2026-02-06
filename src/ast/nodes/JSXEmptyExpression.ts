import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXEmptyExpression extends NodeBase {
	declare parent: nodes.JSXEmptyExpressionParent;
	declare type: NodeType.tJSXEmptyExpression;
}

JSXEmptyExpression.prototype.includeNode = onlyIncludeSelf;
