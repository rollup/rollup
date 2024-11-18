import type { ast } from '../../rollup/types';
import type JSXIdentifier from './JSXIdentifier';
import type * as nodes from './node-unions';
import type { JSXMemberExpressionParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXMemberExpression extends NodeBase<ast.JSXMemberExpression> {
	parent!: JSXMemberExpressionParent;
	type!: NodeType.tJSXMemberExpression;
	object!: nodes.JSXTagNameExpression;
	property!: JSXIdentifier;
}
