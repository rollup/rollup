import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ImportDefaultSpecifier extends Node {
	type: NodeType.tImportDefaultSpecifier;
	local: Identifier;
}
