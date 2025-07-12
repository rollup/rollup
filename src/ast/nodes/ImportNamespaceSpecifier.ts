import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportNamespaceSpecifier extends NodeBase<ast.ImportNamespaceSpecifier> {
	parent!: nodes.ImportNamespaceSpecifierParent;
	local!: Identifier;
	type!: NodeType.tImportNamespaceSpecifier;
}

ImportNamespaceSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportNamespaceSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
