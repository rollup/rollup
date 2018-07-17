import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import { ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from './LocalVariable';
import ParameterVariable from './ParameterVariable';

const getParameterVariable = (path: ObjectPath, options: ExecutionPathOptions) => {
	const firstArgNum = parseInt(<string>path[0], 10);

	return (
		(firstArgNum < options.getArgumentsVariables().length &&
			options.getArgumentsVariables()[firstArgNum]) ||
		UNKNOWN_EXPRESSION
	);
};

export default class ArgumentsVariable extends LocalVariable {
	private parameters: ParameterVariable[];

	constructor(parameters: ParameterVariable[], deoptimizationTracker: EntityPathTracker) {
		super('arguments', null, UNKNOWN_EXPRESSION, deoptimizationTracker);
		this.parameters = parameters;
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 1 &&
			getParameterVariable(path, options).hasEffectsWhenAccessedAtPath(path.slice(1), options)
		);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length === 0 ||
			this.included ||
			getParameterVariable(path, options).hasEffectsWhenAssignedAtPath(path.slice(1), options)
		);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		if (path.length === 0) {
			return true;
		}
		return getParameterVariable(path, options).hasEffectsWhenCalledAtPath(
			path.slice(1),
			callOptions,
			options
		);
	}

	deoptimizePath(path: ObjectPath) {
		const firstArgNum = parseInt(<string>path[0], 10);
		if (path.length > 0) {
			if (firstArgNum >= 0 && this.parameters[firstArgNum]) {
				this.parameters[firstArgNum].deoptimizePath(path.slice(1));
			}
		}
	}
}
