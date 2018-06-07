import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ImportNamespaceSpecifier extends Node {
	type: NodeType.tImportNamespaceSpecifier;
	local: Identifier;
}
