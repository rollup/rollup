import Node from '../Node';
import CallExpression from './CallExpression';

export default interface Import extends Node {
	type: 'Import';
	parent: CallExpression;
}
