import FunctionExpression from './FunctionExpression';
import * as NodeType from './NodeType';
import PrivateIdentifier from './PrivateIdentifier';
import MethodBase from './shared/MethodBase';
import { ExpressionNode } from './shared/Node';

export default class MethodDefinition extends MethodBase {
	key!: ExpressionNode | PrivateIdentifier;
	kind!: 'constructor' | 'method' | 'get' | 'set';
	static!: boolean;
	type!: NodeType.tMethodDefinition;
	value!: FunctionExpression;
}
