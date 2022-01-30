import type { AstContext } from '../../Module';
import type { InclusionContext } from '../ExecutionContext';
import type Identifier from '../nodes/Identifier';
import SpreadElement from '../nodes/SpreadElement';
import { UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
import type { ExpressionNode } from '../nodes/shared/Node';
import LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import type Scope from './Scope';

export default class ParameterScope extends ChildScope {
	readonly hoistedBodyVarScope: ChildScope;

	protected parameters: readonly LocalVariable[][] = [];
	private context: AstContext;
	private hasRest = false;

	constructor(parent: Scope, context: AstContext) {
		super(parent);
		this.context = context;
		this.hoistedBodyVarScope = new ChildScope(this);
	}

	/**
	 * Adds a parameter to this scope. Parameters must be added in the correct
	 * order, e.g. from left to right.
	 */
	addParameterDeclaration(identifier: Identifier): LocalVariable {
		const name = identifier.name;
		let variable = this.hoistedBodyVarScope.variables.get(name) as LocalVariable;
		if (variable) {
			variable.addDeclaration(identifier, null);
		} else {
			variable = new LocalVariable(name, identifier, UNKNOWN_EXPRESSION, this.context);
		}
		this.variables.set(name, variable);
		return variable;
	}

	addParameterVariables(parameters: LocalVariable[][], hasRest: boolean): void {
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
		args: readonly (ExpressionNode | SpreadElement)[]
	): void {
		let calledFromTryStatement = false;
		let argIncluded = false;
		const restParam = this.hasRest && this.parameters[this.parameters.length - 1];
		for (const checkedArg of args) {
			if (checkedArg instanceof SpreadElement) {
				for (const arg of args) {
					arg.include(context, false);
				}
				break;
			}
		}
		for (let index = args.length - 1; index >= 0; index--) {
			const paramVars = this.parameters[index] || restParam;
			const arg = args[index];
			if (paramVars) {
				calledFromTryStatement = false;
				if (paramVars.length === 0) {
					// handle empty destructuring
					argIncluded = true;
				} else {
					for (const variable of paramVars) {
						if (variable.included) {
							argIncluded = true;
						}
						if (variable.calledFromTryStatement) {
							calledFromTryStatement = true;
						}
					}
				}
			}
			if (!argIncluded && arg.shouldBeIncluded(context)) {
				argIncluded = true;
			}
			if (argIncluded) {
				arg.include(context, calledFromTryStatement);
			}
		}
	}
}
