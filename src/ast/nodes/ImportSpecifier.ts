import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportSpecifier extends NodeBase {
	declare parent: nodes.ImportSpecifierParent;
	declare imported: Identifier | Literal<string>;
	declare local: Identifier;
	declare type: NodeType.tImportSpecifier;
}

ImportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
