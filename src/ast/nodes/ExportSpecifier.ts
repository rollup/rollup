import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class ExportSpecifier extends NodeBase {
	declare exported: Identifier | Literal<string>;
	declare local: Identifier | Literal<string>;
	declare type: NodeType.tExportSpecifier;

	protected applyDeoptimizations() {}
}

ExportSpecifier.prototype.includeNode = onlyIncludeSelf;
