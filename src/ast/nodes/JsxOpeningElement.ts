import type JsxIdentifier from './JsxIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxOpeningElement extends NodeBase {
	type!: NodeType.tJsxOpeningElement;
	selfClosing!: boolean;
	name!: JsxIdentifier;
	attributes!: any; // TODO JSXAttribute
}
