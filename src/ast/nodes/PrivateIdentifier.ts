import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class PrivateIdentifier extends NodeBase {
	declare name: string;
	declare type: NodeType.tPrivateIdentifier;
}
