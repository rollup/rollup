import type JSXAttribute from './JSXAttribute';
import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JSXOpeningElement extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	selfClosing!: boolean;
	name!: JSXIdentifier;
	attributes!: JSXAttribute[];
}
