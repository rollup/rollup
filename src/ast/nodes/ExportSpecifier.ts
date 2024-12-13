import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ExportSpecifier extends NodeBase {
	declare exported: Identifier | Literal<string>;
	declare local: Identifier | Literal<string>;
	declare type: NodeType.tExportSpecifier;
}

ExportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
