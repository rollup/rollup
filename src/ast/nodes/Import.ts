import { Node } from './shared/Node';
import CallExpression from './CallExpression';
import { NodeType } from './index';

export default interface Import extends Node {
	type: NodeType.Import;
	parent: CallExpression;
}
