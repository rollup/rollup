import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import JSXClosingBase from './shared/JSXClosingBase';

export default class JSXClosingElement extends JSXClosingBase {
	type!: NodeType.tJSXClosingElement;
	name!: JSXIdentifier /* TODO | JSXMemberExpression | JSXNamespacedName */;
}
