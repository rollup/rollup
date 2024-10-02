import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXNamespacedName extends NodeBase {
	type!: NodeType.tJSXNamespacedName;
	name!: JSXIdentifier;
	namespace!: JSXIdentifier;
}
