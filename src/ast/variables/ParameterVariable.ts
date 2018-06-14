import Identifier from '../nodes/Identifier';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import ReplaceableInitializationVariable from './ReplaceableInitializationVariable';

export default class ParameterVariable extends ReplaceableInitializationVariable {
	constructor(identifier: Identifier, reassignmentTracker: EntityPathTracker) {
		super(identifier.name, identifier, reassignmentTracker);
	}
}
