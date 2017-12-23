import Node from '../Node';
import Identifier from './Identifier';

export default interface ExportSpecifier extends Node {
	type: 'ExportSpecifier';
	local: Identifier;
	exported: Identifier;
}
