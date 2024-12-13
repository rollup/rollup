import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportNamespaceSpecifier extends NodeBase {
	declare local: Identifier;
	declare type: NodeType.tImportNamespaceSpecifier;
}

ImportNamespaceSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportNamespaceSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
