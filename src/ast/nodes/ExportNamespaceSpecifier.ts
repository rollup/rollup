import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class ExportNamespaceSpecifier extends NodeBase {
	exported!: Identifier;
	type!: NodeType.tExportNamespaceSpecifier;
}
