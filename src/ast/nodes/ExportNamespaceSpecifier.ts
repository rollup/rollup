import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/Node';

export default interface ExportNamespaceSpecifier extends Node {
	exported: Identifier;
	type: NodeType.tExportNamespaceSpecifier;
}
