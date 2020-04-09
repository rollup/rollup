import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

export default class PrivateName extends NodeBase {
	name!: string;
	type!: NodeType.tFieldDefinition;
}
