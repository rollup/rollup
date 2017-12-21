import Node from '../Node';
import Identifier from './Identifier';

export default class ExportSpecifier extends Node {
	type: 'ExportSpecifier';
	local: Identifier;
	exported: Identifier;
}
