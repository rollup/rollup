import { Node } from './shared/Node';
import Identifier from './Identifier';

export default interface ExportSpecifier extends Node {
	type: 'ExportSpecifier';
	local: Identifier;
	exported: Identifier;
}
