import { AstContext } from '../../Module';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { ObjectPath, UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from './LocalVariable';

const getParameterVariable = (path: ObjectPath, options: ExecutionPathOptions) => {
	const firstArgNum = parseInt(path[0] as string, 10);

	return (
		(firstArgNum < options.getArgumentsVariables().length &&
			options.getArgumentsVariables()[firstArgNum]) ||
		UNKNOWN_EXPRESSION
	);
};

export default class ArgumentsVariable extends LocalVariable {
	private parameters: LocalVariable[];

	constructor(parameters: LocalVariable[], context: AstContext) {
		super('arguments', null, UNKNOWN_EXPRESSION, context);
		this.parameters = parameters;
	}

	deoptimizePath(path: ObjectPath) {
		const firstArgNum = parseInt(path[0] as string, 10);
		if (path.length > 0) {
			if (firstArgNum >= 0 && this.parameters[firstArgNum]) {
				this.parameters[firstArgNum].deoptimizePath(path.slice(1));
			}
		}
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
}
