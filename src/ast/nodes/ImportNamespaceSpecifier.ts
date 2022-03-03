import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportNamespaceSpecifier extends NodeBase {
	declare local: Identifier;
	declare type: NodeType.tImportNamespaceSpecifier;
}
