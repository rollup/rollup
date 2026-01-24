import type JSXIdentifier from './JSXIdentifier';
import type JSXMemberExpression from './JSXMemberExpression';
import type JSXNamespacedName from './JSXNamespacedName';
import type * as NodeType from './NodeType';
import JSXClosingBase from './shared/JSXClosingBase';

export default class JSXClosingElement extends JSXClosingBase {
	declare type: NodeType.tJSXClosingElement;
	declare name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName;
}
