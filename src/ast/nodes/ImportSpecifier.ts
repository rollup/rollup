import type { ast } from '../../rollup/types';
import type Identifier from './Identifier';
import type Literal from './Literal';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportSpecifier extends NodeBase<ast.ImportSpecifier> {
	declare parent: nodes.ImportSpecifierParent;
	declare imported: Identifier | Literal<string>;
	declare local: Identifier;
	declare type: NodeType.tImportSpecifier;
}

ImportSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
