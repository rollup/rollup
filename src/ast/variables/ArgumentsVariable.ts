import LocalVariable from './LocalVariable';
import { UNKNOWN_ASSIGNMENT, PredicateFunction } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import CallOptions from '../CallOptions';
import ParameterVariable from './ParameterVariable';
import { ObjectPath } from './VariableReassignmentTracker';

const getParameterVariable = (path: ObjectPath, options: ExecutionPathOptions) => {
	const firstArgNum = parseInt(<string> path[0], 10);

	return (firstArgNum < options.getArgumentsVariables().length &&
		options.getArgumentsVariables()[firstArgNum]) ||
		UNKNOWN_ASSIGNMENT;
};

export default class ArgumentsVariable extends LocalVariable {
	private _parameters: ParameterVariable[];

	constructor (parameters: ParameterVariable[]) {
		super('arguments', null, UNKNOWN_ASSIGNMENT);
		this._parameters = parameters;
	}

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		const firstArgNum = parseInt(<string> path[0], 10);
		if (path.length > 0) {
			if (firstArgNum >= 0 && this._parameters[firstArgNum]) {
				this._parameters[firstArgNum].reassignPath(path.slice(1), options);
			}
		}
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 1 &&
			getParameterVariable(path, options).hasEffectsWhenAccessedAtPath(
				path.slice(1),
				options
			)
		);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length === 0 ||
			this.included ||
			getParameterVariable(path, options).hasEffectsWhenAssignedAtPath(
				path.slice(1),
				options
			)
		);
	}

	hasEffectsWhenCalledAtPath (path: ObjectPath, callOptions: CallOptions, options: ExecutionPathOptions): boolean {
		if (path.length === 0) {
			return true;
		}
		return getParameterVariable(path, options).hasEffectsWhenCalledAtPath(
			path.slice(1),
			callOptions,
			options
		);
	}

	someReturnExpressionWhenCalledAtPath (
		path: ObjectPath,
		callOptions: CallOptions,
		predicateFunction: (options: ExecutionPathOptions) => PredicateFunction,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 0) {
			return true;
		}
		return getParameterVariable(
			path,
			options
		).someReturnExpressionWhenCalledAtPath(
			path.slice(1),
			callOptions,
			predicateFunction,
			options
		);
	}
}
