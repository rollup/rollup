import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ExportSpecifier extends Node {
	exported: Identifier;
	local: Identifier;
	type: NodeType.tExportSpecifier;
}
