import Identifier from './Identifier';
import { Node } from './shared/Node';
import * as NodeType from './NodeType';

export default interface ImportNamespaceSpecifier extends Node {
	type: NodeType.tImportNamespaceSpecifier;
	local: Identifier;
}
