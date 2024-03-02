import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class JsxIdentifier extends NodeBase {
	type!: NodeType.tJsxIdentifier;
	name!: string;
}
