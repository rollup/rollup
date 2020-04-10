import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ImportNamespaceSpecifier extends NodeBase {
	local!: Identifier;
	type!: NodeType.tImportNamespaceSpecifier;
}
