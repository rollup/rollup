import type { ast } from '../../rollup/types';
import type { PrivateIdentifierParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class PrivateIdentifier extends NodeBase<ast.PrivateIdentifier> {
	parent!: PrivateIdentifierParent;
	name!: string;
	type!: NodeType.tPrivateIdentifier;
}

PrivateIdentifier.prototype.includeNode = onlyIncludeSelf;
