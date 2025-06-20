import type { ast } from '../../rollup/types';
import type { JSXEmptyExpressionParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXEmptyExpression extends NodeBase<ast.JSXEmptyExpression> {
	parent!: JSXEmptyExpressionParent;
	type!: NodeType.tJSXEmptyExpression;
}

JSXEmptyExpression.prototype.includeNode = onlyIncludeSelf;
