import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type { ImportDefaultSpecifierParent } from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportDefaultSpecifier extends NodeBase<ast.ImportDefaultSpecifier> {
	parent!: ImportDefaultSpecifierParent;
	local!: Identifier;
	type!: NodeType.tImportDefaultSpecifier;
}

ImportDefaultSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportDefaultSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
