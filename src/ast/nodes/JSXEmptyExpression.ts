import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXEmptyExpression extends NodeBase {
	declare type: NodeType.tJSXEmptyExpression;
}

JSXEmptyExpression.prototype.includeNode = onlyIncludeSelf;
