import FunctionExpression from './FunctionExpression';
import * as NodeType from './NodeType';
import PrivateIdentifier from './PrivateIdentifier';
import MethodBase from './shared/MethodBase';
import { ExpressionNode } from './shared/Node';

export default class MethodDefinition extends MethodBase {
	declare key: ExpressionNode | PrivateIdentifier;
	declare kind: 'constructor' | 'method' | 'get' | 'set';
	declare static: boolean;
	declare type: NodeType.tMethodDefinition;
	declare value: FunctionExpression;
}
