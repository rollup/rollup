import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class ImportNamespaceSpecifier extends NodeBase {
	declare local: Identifier;
	declare type: NodeType.tImportNamespaceSpecifier;

	protected applyDeoptimizations() {}
}

ImportNamespaceSpecifier.prototype.includeNode = onlyIncludeSelf;
