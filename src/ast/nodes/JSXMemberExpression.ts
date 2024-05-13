import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXMemberExpression extends NodeBase {
	type!: NodeType.tJSXMemberExpression;
	object!: JSXMemberExpression | JSXIdentifier;
	property!: JSXIdentifier;
}
