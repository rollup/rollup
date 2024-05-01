import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXClosingElement extends NodeBase {
	type!: NodeType.tJSXClosingElement;
	name!: JSXIdentifier /* TODO | JSXMemberExpression | JSXNamespacedName */;
}
