import { logDuplicateArgumentNameError } from '../../utils/logs';
import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteractionCalled } from '../NodeInteractions';
import type Identifier from '../nodes/Identifier';
import SpreadElement from '../nodes/SpreadElement';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, UNKNOWN_PATH } from '../utils/PathTracker';
import ParameterVariable from '../variables/ParameterVariable';
import CatchBodyScope from './CatchBodyScope';
import ChildScope from './ChildScope';
import FunctionBodyScope from './FunctionBodyScope';

export default class ParameterScope extends ChildScope {
	readonly bodyScope: ChildScope;
	parameters: readonly ParameterVariable[][] = [];

	private hasRest = false;

	constructor(parent: ChildScope, isCatchScope: boolean) {
		super(parent, parent.context);
		this.bodyScope = isCatchScope ? new CatchBodyScope(this) : new FunctionBodyScope(this);
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, i.e. from left to right.
	 */
	addParameterDeclaration(identifier: Identifier, argumentPath: ObjectPath): ParameterVariable {
		const { name, start } = identifier;
		const existingParameter = this.variables.get(name);
		if (existingParameter) {
			return this.context.error(logDuplicateArgumentNameError(name), start);
		}
		const variable = new ParameterVariable(name, identifier, argumentPath, this.context);
		this.variables.set(name, variable);
		// We also add it to the body scope to detect name conflicts with local
		// variables. We still need the intermediate scope, though, as parameter
		// defaults are NOT taken from the body scope but from the parameters or
		// outside scope.
		this.bodyScope.addHoistedVariable(name, variable);
		return variable;
	}

	addParameterVariables(parameters: ParameterVariable[][], hasRest: boolean): void {
		this.parameters = parameters;
		for (const parameterList of parameters) {
			for (const parameter of parameterList) {
				parameter.alwaysRendered = true;
			}
		}
		this.hasRest = hasRest;
	}

	includeCallArguments(context: InclusionContext, interaction: NodeInteractionCalled): void {
		let calledFromTryStatement = false;
		let argumentIncluded = false;
		const restParameter = this.hasRest && this.parameters[this.parameters.length - 1];
		const { args } = interaction;
		let hasSpread = false;
		for (let argumentIndex = 1; argumentIndex < args.length; argumentIndex++) {
			if (args[argumentIndex] instanceof SpreadElement) {
				hasSpread = true;
			}
			if (hasSpread) {
				args[argumentIndex]!.includePath(UNKNOWN_PATH, context, false);
			}
		}
		for (let index = args.length - 1; index >= 1; index--) {
			const parameterVariables = this.parameters[index - 1] || restParameter;
			const argument = args[index]!;
			if (parameterVariables) {
				calledFromTryStatement = false;
				if (parameterVariables.length === 0) {
					// handle empty destructuring to avoid destructuring undefined
					argumentIncluded = true;
				} else {
					for (const variable of parameterVariables) {
						if (variable.calledFromTryStatement) {
							calledFromTryStatement = true;
						}
						if (variable.included) {
							argumentIncluded = true;
							if (calledFromTryStatement) {
								argument.includePath(UNKNOWN_PATH, context, true);
							} else {
								// TODO Lukas as this is repeated over and over (check), we
								// should think about only including call arguments once and
								// then only include additional paths or arguments as needed.
								// TODO Lukas what about SpreadElements?
								variable.includeArgumentPaths(argument, context);
							}
						}
					}
				}
			}
			if (!argument.included && (argumentIncluded || argument.shouldBeIncluded(context))) {
				argumentIncluded = true;
				argument.includePath(EMPTY_PATH, context, calledFromTryStatement);
			}
		}
	}
}
