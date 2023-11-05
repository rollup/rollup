import { logDuplicateArgumentNameError, logRedeclarationError } from '../../utils/logs';
import type { InclusionContext } from '../ExecutionContext';
import type Identifier from '../nodes/Identifier';
import SpreadElement from '../nodes/SpreadElement';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import type LocalVariable from '../variables/LocalVariable';
import ParameterVariable from '../variables/ParameterVariable';
import ChildScope from './ChildScope';

export default class ParameterScope extends ChildScope {
	parameters: readonly ParameterVariable[][] = [];

	private hasRest = false;

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, i.e. from left to right.
	 */
	addParameterDeclaration(identifier: Identifier): ParameterVariable {
		const { name, start } = identifier;
		const variable = new ParameterVariable(name, identifier, this.context);
		const existingVariable = this.variables.get(name) as LocalVariable | undefined;
		if (existingVariable) {
			const { kind } = existingVariable;
			if (kind === VariableKind.parameter) {
				return this.context.error(logDuplicateArgumentNameError(name), start);
			}
			if (kind !== VariableKind.var && kind !== VariableKind.function) {
				return this.context.error(logRedeclarationError(name), start);
			}
			variable.mergeDeclarations(existingVariable);
		}
		this.variables.set(name, variable);
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

	includeCallArguments(
		context: InclusionContext,
		parameters: readonly (ExpressionEntity | SpreadElement)[]
	): void {
		let calledFromTryStatement = false;
		let argumentIncluded = false;
		const restParameter = this.hasRest && this.parameters[this.parameters.length - 1];
		for (const checkedArgument of parameters) {
			if (checkedArgument instanceof SpreadElement) {
				for (const argument of parameters) {
					argument.include(context, false);
				}
				break;
			}
		}
		for (let index = parameters.length - 1; index >= 0; index--) {
			const parameterVariables = this.parameters[index] || restParameter;
			const argument = parameters[index];
			if (parameterVariables) {
				calledFromTryStatement = false;
				if (parameterVariables.length === 0) {
					// handle empty destructuring
					argumentIncluded = true;
				} else {
					for (const variable of parameterVariables) {
						if (variable.included) {
							argumentIncluded = true;
						}
						if (variable.calledFromTryStatement) {
							calledFromTryStatement = true;
						}
					}
				}
			}
			if (!argumentIncluded && argument.shouldBeIncluded(context)) {
				argumentIncluded = true;
			}
			if (argumentIncluded) {
				argument.include(context, calledFromTryStatement);
			}
		}
	}
}
