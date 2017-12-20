import LocalVariable from './LocalVariable';
import { UNKNOWN_ASSIGNMENT, PredicateFunction } from '../values';
import Expression from '../nodes/Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';

export default class ReplaceableInitializationVariable extends LocalVariable {
	constructor (name: string, declarator: Expression) {
		super(name, declarator, null);
	}

	getName () {
		return this.name;
	}

	hasEffectsWhenAccessedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			this._getInit(options).hasEffectsWhenAccessedAtPath(path, options) ||
			super.hasEffectsWhenAccessedAtPath(path, options)
		);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			this._getInit(options).hasEffectsWhenAssignedAtPath(path, options) ||
			super.hasEffectsWhenAssignedAtPath(path, options)
		);
	}

	hasEffectsWhenCalledAtPath (path: string[], callOptions: CallOptions, options: ExecutionPathOptions) {
		return (
			this._getInit(options).hasEffectsWhenCalledAtPath(
				path,
				callOptions,
				options
			) || super.hasEffectsWhenCalledAtPath(path, callOptions, options)
		);
	}

	someReturnExpressionWhenCalledAtPath (
		path: string[],
		callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
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
