import type { ast } from '../../rollup/types';
import type { JSXEmptyExpressionParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXEmptyExpression extends NodeBase<ast.JSXEmptyExpression> {
	parent!: JSXEmptyExpressionParent;
	type!: NodeType.tJSXEmptyExpression;
}
