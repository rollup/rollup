import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type { ExportSpecifierParent } from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportSpecifier extends NodeBase<ast.ExportSpecifier> {
	parent!: ExportSpecifierParent;
	exported!: Identifier | Literal<string>;
	local!: Identifier | Literal<string>;
	type!: NodeType.tExportSpecifier;

	protected applyDeoptimizations() {}
}
