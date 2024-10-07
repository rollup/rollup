import type { HasEffectsContext } from '../ExecutionContext';
import { checkEffectForNodes } from '../utils/checkEffectForNodes';
import type Decorator from './Decorator';
import type FunctionExpression from './FunctionExpression';
import type * as NodeType from './NodeType';
import type PrivateIdentifier from './PrivateIdentifier';
import MethodBase from './shared/MethodBase';
import type { ExpressionNode } from './shared/Node';

export default class MethodDefinition extends MethodBase {
	key!: ExpressionNode | PrivateIdentifier;
	kind!: 'constructor' | 'method' | 'get' | 'set';
	static!: boolean;
	type!: NodeType.tMethodDefinition;
	value!: FunctionExpression;
	decorators!: Decorator[];

	hasEffects(context: HasEffectsContext): boolean {
		return super.hasEffects(context) || checkEffectForNodes(this.decorators, context);
	}
}
