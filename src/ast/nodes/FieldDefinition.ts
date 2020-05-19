import { HasEffectsContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import PrivateName from './PrivateName';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class FieldDefinition extends NodeBase {
	computed!: boolean;
	key!: ExpressionNode | PrivateName;
	static!: boolean;
	type!: NodeType.tFieldDefinition;
	value!: ExpressionNode | null;

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.key.hasEffects(context) ||
			(this.static && this.value !== null && this.value.hasEffects(context))
		);
	}
}
