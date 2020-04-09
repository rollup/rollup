import Identifier from './Identifier';
import * as NodeType from './NodeType';
import PrivateName from './PrivateName';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class FieldDefinition extends NodeBase {
	computed!: boolean;
	key!: Identifier | PrivateName;
	type!: NodeType.tFieldDefinition;
	value!: ExpressionNode;
}
