import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class PrivateIdentifier extends NodeBase {
	declare name: string;
	declare type: NodeType.tPrivateIdentifier;
}

PrivateIdentifier.prototype.includeNode = onlyIncludeSelf;
