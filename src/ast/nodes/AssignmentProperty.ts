import { PatternNode } from './shared/Pattern';
import { ExpressionNode } from './shared/Node';
import * as NodeType from './NodeType';

export default interface AssignmentProperty extends PatternNode {
	type: NodeType.tProperty;
	value: PatternNode;
	key: ExpressionNode;
	kind: 'init';
	method: false;
}
