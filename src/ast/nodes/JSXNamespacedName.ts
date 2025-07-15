import type { ast } from '../../rollup/types';
import type JSXIdentifier from './JSXIdentifier';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class JSXNamespacedName extends NodeBase<ast.JSXNamespacedName> {
	parent!: nodes.JSXNamespacedNameParent;
	type!: NodeType.tJSXNamespacedName;
	name!: JSXIdentifier;
	namespace!: JSXIdentifier;
}

JSXNamespacedName.prototype.includeNode = onlyIncludeSelf;
