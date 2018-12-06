import pureFunctions from '../nodes/shared/pureFunctions';
import { ObjectPath } from '../values';
import Variable from './Variable';

export default class GlobalVariable extends Variable {
	included = true;

	hasEffectsWhenAccessedAtPath(path: ObjectPath) {
		// path.length == 0 can also have an effect but we postpone this for now
		return (
			path.length > 0 &&
			!this.isPureFunctionMember(path) &&
			!(this.name === 'Reflect' && path.length === 1)
		);
	}

	hasEffectsWhenCalledAtPath(path: ObjectPath) {
		return !pureFunctions[[this.name, ...path].join('.')];
	}

	private isPureFunctionMember(path: ObjectPath) {
		return (
			pureFunctions[[this.name, ...path].join('.')] ||
			(path.length >= 1 && pureFunctions[[this.name, ...path.slice(0, -1)].join('.')]) ||
			(path.length >= 2 &&
				pureFunctions[[this.name, ...path.slice(0, -2)].join('.')] &&
				path[path.length - 2] === 'prototype')
		);
	}
}
