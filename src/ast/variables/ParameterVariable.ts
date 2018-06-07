import Identifier from '../nodes/Identifier';
import ReplaceableInitializationVariable from './ReplaceableInitializationVariable';

export default class ParameterVariable extends ReplaceableInitializationVariable {
	constructor(identifier: Identifier) {
		super(identifier.name, identifier);
	}
}
