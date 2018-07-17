import { EntityPathTracker } from '../utils/EntityPathTracker';
import ReplaceableInitializationVariable from './ReplaceableInitializationVariable';

export default class ThisVariable extends ReplaceableInitializationVariable {
	constructor(deoptimizationTracker: EntityPathTracker) {
		super('this', null, deoptimizationTracker);
	}
}
