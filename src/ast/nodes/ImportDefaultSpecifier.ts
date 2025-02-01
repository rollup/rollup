import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { doNotDeoptimize, NodeBase, onlyIncludeSelfNoDeoptimize } from './shared/Node';

export default class ImportDefaultSpecifier extends NodeBase {
	declare local: Identifier;
	declare type: NodeType.tImportDefaultSpecifier;
}

ImportDefaultSpecifier.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ImportDefaultSpecifier.prototype.applyDeoptimizations = doNotDeoptimize;
