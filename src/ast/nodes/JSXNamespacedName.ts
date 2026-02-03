import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXNamespacedName extends NodeBase {
	declare type: NodeType.tJSXNamespacedName;
	declare name: JSXIdentifier;
	declare namespace: JSXIdentifier;
}

JSXNamespacedName.prototype.includeNode = onlyIncludeSelf;
