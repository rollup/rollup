import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ExportSpecifier extends NodeBase {
	declare parent: nodes.ExportSpecifierParent;
	declare exported: Identifier | Literal<string>;
	declare local: Identifier | Literal<string>;
	declare type: NodeType.tExportSpecifier;
}

ExportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
