import type JsxIdentifier from './JsxIdentifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxAttribute extends NodeBase {
	declare name: JsxIdentifier;
	declare value: undefined;
	declare type: NodeType.tJsxAttribute;
}
