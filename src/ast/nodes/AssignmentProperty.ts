import * as NodeType from './NodeType';
import { ExpressionNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default interface AssignmentProperty extends PatternNode {
	type: NodeType.tProperty;
	value: PatternNode;
	key: ExpressionNode;
	kind: 'init';
	method: false;
}
