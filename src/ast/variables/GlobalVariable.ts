import { isGlobalMember, isPureGlobal } from '../nodes/shared/knownGlobals';
import { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		return !isGlobalMember([this.name, ...path]);
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath) {
		return !isPureGlobal([this.name, ...path]);
	}
}
