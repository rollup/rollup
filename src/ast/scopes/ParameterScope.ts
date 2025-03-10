import { logDuplicateArgumentNameError } from '../../utils/logs';
import type { InclusionContext } from '../ExecutionContext';
import type { NodeInteractionCalled } from '../NodeInteractions';
import type Identifier from '../nodes/Identifier';
import SpreadElement from '../nodes/SpreadElement';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import ParameterVariable from '../variables/ParameterVariable';
import CatchBodyScope from './CatchBodyScope';
import ChildScope from './ChildScope';
import FunctionBodyScope from './FunctionBodyScope';

export default class ParameterScope extends ChildScope {
	readonly bodyScope: ChildScope;

	protected hasRest = false;
	protected parameters: readonly ParameterVariable[][] = [];

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

	includeCallArguments({ args }: NodeInteractionCalled, context: InclusionContext): void {
		let calledFromTryStatement = false;
		let argumentIncluded = false;
		const restParameter = this.hasRest && this.parameters[this.parameters.length - 1];
		let lastExplicitlyIncludedIndex = args.length - 1;
		// If there is a SpreadElement, we need to include all arguments after it
		// because we no longer know which argument corresponds to which parameter.
		for (let argumentIndex = 1; argumentIndex < args.length; argumentIndex++) {
			const argument = args[argumentIndex];
			if (argument instanceof SpreadElement && !argumentIncluded) {
				argumentIncluded = true;
				lastExplicitlyIncludedIndex = argumentIndex - 1;
			}
			if (argumentIncluded) {
				argument!.includePath(UNKNOWN_PATH, context);
				argument!.include(context, false);
			}
		}
		// Now we go backwards either starting from the last argument or before the
		// first SpreadElement to ensure all arguments before are included as needed
		for (let index = lastExplicitlyIncludedIndex; index >= 1; index--) {
			const parameterVariables = this.parameters[index - 1] || restParameter;
			const argument = args[index]!;
			if (parameterVariables) {
				calledFromTryStatement = false;
				if (parameterVariables.length === 0) {
					// handle empty destructuring to avoid destructuring undefined
					argumentIncluded = true;
				} else {
					for (const parameterVariable of parameterVariables) {
						if (parameterVariable.calledFromTryStatement) {
							calledFromTryStatement = true;
						}
						if (parameterVariable.included) {
							argumentIncluded = true;
							if (calledFromTryStatement) {
								argument.include(context, true);
							} else {
								parameterVariable.includeArgumentPaths(argument, context);
								argument.include(context, false);
							}
						}
					}
				}
			}
			if (argumentIncluded || argument.shouldBeIncluded(context)) {
				argumentIncluded = true;
				argument.include(context, calledFromTryStatement);
			}
		}
	}
}
