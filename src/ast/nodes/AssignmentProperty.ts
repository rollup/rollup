import { PatternNode } from './shared/Pattern';
import { ExpressionNode } from './shared/Expression';

export default interface AssignmentProperty extends PatternNode {
	type: 'Property';
	value: PatternNode;
	key: ExpressionNode,
	kind: 'init';
	method: false;
}
