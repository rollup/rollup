import Identifier from './Identifier';
import { Node } from './shared/Node';

export default interface ImportSpecifier extends Node {
	type: 'ImportSpecifier';
	local: Identifier;
	imported: Identifier;
}
