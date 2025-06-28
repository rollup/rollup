import type { ast } from '../../rollup/types';
import type { HasEffectsContext } from '../ExecutionContext';
import { checkEffectForNodes } from '../utils/checkEffectForNodes';
import type Decorator from './Decorator';
import type FunctionExpression from './FunctionExpression';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import type PrivateIdentifier from './PrivateIdentifier';
import PropertyBase from './shared/PropertyBase';

export default class MethodDefinition extends PropertyBase<ast.MethodDefinition> {
	declare parent: nodes.MethodDefinitionParent;
	declare key: nodes.Expression | PrivateIdentifier;
	declare kind: ast.MethodDefinition['kind'];
	declare static: boolean;
	declare type: NodeType.tMethodDefinition;
	declare value: FunctionExpression;
	declare decorators: Decorator[];

	hasEffects(context: HasEffectsContext): boolean {
		return super.hasEffects(context) || checkEffectForNodes(this.decorators, context);
	}
}
