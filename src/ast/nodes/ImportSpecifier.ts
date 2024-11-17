import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportSpecifier extends NodeBase<ast.ImportSpecifier> {
	parent!: nodes.ImportSpecifierParent;
	imported!: Identifier | Literal<string>;
	local!: Identifier;
	type!: NodeType.tImportSpecifier;
}

ImportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
