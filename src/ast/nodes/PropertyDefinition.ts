import { HasEffectsContext } from '../ExecutionContext';
import * as NodeType from './NodeType';
import PrivateIdentifier from './PrivateIdentifier';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class PropertyDefinition extends NodeBase {
	computed!: boolean;
	key!: ExpressionNode | PrivateIdentifier;
	static!: boolean;
	type!: NodeType.tPropertyDefinition;
	value!: ExpressionNode | null;

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.key.hasEffects(context) ||
			(this.static && this.value !== null && this.value.hasEffects(context))
		);
	}
}
