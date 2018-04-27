import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { Node } from './shared/node';

export function isMetaProperty(node: Node): node is MetaProperty {
	return node.type === NodeType.MetaProperty;
}

export default interface MetaProperty extends Node {
	type: NodeType.tMetaProperty;
	meta: Identifier;
	property: Identifier;
}
