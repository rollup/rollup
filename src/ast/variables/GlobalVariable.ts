import { isGlobalMember, isPureGlobal } from '../nodes/shared/knownGlobals';
import { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	isReassigned = true;

	hasEffectsWhenAccessedAtPath(path: ObjectPath): boolean {
		return !isGlobalMember([this.name, ...path]);
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath): boolean {
		return !isPureGlobal([this.name, ...path]);
	}
}
