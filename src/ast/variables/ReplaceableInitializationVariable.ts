import LocalVariable from './LocalVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ReplaceableInitializationVariable extends LocalVariable {
	constructor (name, declarator) {
		super(name, declarator, null);
	}

	getName () {
		return this.name;
	}

	hasEffectsWhenAccessedAtPath (path, options) {
		return (
			this._getInit(options).hasEffectsWhenAccessedAtPath(path, options) ||
			super.hasEffectsWhenAccessedAtPath(path, options)
		);
	}

	hasEffectsWhenAssignedAtPath (path, options) {
		return (
			this._getInit(options).hasEffectsWhenAssignedAtPath(path, options) ||
			super.hasEffectsWhenAssignedAtPath(path, options)
		);
	}

	hasEffectsWhenCalledAtPath (path, callOptions, options) {
		return (
			this._getInit(options).hasEffectsWhenCalledAtPath(
				path,
				callOptions,
				options
			) || super.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	someReturnExpressionWhenCalledAtPath (
		path,
		callOptions,
		predicateFunction,
		options
	) {
		return (
			this._getInit(options).someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			) ||
			super.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			)
		);
	}

	_getInit (options) {
		return options.getReplacedVariableInit(this) || UNKNOWN_ASSIGNMENT;
	}
}
