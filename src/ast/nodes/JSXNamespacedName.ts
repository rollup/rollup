import type { ast } from '../../rollup/types';
import type JSXIdentifier from './JSXIdentifier';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXNamespacedName extends NodeBase<ast.JSXNamespacedName> {
	declare parent: nodes.JSXNamespacedNameParent;
	declare type: NodeType.tJSXNamespacedName;
	declare name: JSXIdentifier;
	declare namespace: JSXIdentifier;
}

JSXNamespacedName.prototype.includeNode = onlyIncludeSelf;
