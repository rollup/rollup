import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class PrivateIdentifier extends NodeBase {
	name!: string;
	type!: NodeType.tPrivateIdentifier;
}
