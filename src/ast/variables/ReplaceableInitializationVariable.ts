import LocalVariable from './LocalVariable';
import { UNKNOWN_ASSIGNMENT, PredicateFunction, UnknownAssignment } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import Expression from '../nodes/Expression';
import Identifier from '../nodes/Identifier';

export default class ReplaceableInitializationVariable extends LocalVariable {
	constructor (name: string, declarator: Identifier | null) {
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
	): boolean {
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

	_getInit (options: ExecutionPathOptions): Expression | UnknownAssignment {
		return (<Expression>options.getReplacedVariableInit(this)) || UNKNOWN_ASSIGNMENT;
	}
}
