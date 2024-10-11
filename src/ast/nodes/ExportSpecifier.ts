import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ExportSpecifier extends NodeBase<ast.ExportSpecifier> {
	exported!: Identifier | Literal<string>;
	local!: Identifier | Literal<string>;
	type!: NodeType.tExportSpecifier;
}

ExportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
