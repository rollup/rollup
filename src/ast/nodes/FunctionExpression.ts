import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionExpression extends FunctionNode {
	type!: NodeType.tFunctionExpression;
}
