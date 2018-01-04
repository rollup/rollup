import { Node } from './shared/Node';
import CallExpression from './CallExpression';

export default interface Import extends Node {
	type: 'Import';
	parent: CallExpression;
}
