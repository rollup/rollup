import { EntityPathTracker } from '../utils/EntityPathTracker';
import ReplaceableInitializationVariable from './ReplaceableInitializationVariable';

export default class ThisVariable extends ReplaceableInitializationVariable {
	constructor(reassignmentTracker: EntityPathTracker) {
		super('this', null, reassignmentTracker);
	}
}
