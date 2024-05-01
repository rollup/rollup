import type JSXAttribute from './JSXAttribute';
import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXOpeningElement extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	name!: JSXIdentifier;
	attributes!: JSXAttribute /* TODO | JSXSpreadAttribute */[];
	selfClosing!: boolean;
}
