import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionNode } from '../nodes/shared/Node';
import SpreadElement from '../nodes/SpreadElement';
import { UNKNOWN_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import Scope from './Scope';

export default class ParameterScope extends ChildScope {
	hoistedBodyVarScope: ChildScope;

	protected parameters: LocalVariable[][] = [];
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
	addParameterDeclaration(identifier: Identifier) {
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

	addParameterVariables(parameters: LocalVariable[][], hasRest: boolean) {
		this.parameters = parameters;
		for (const parameterList of parameters) {
			for (const parameter of parameterList) {
				parameter.alwaysRendered = true;
			}
		}
		this.hasRest = hasRest;
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		let calledFromTryStatement = false;
		let argIncluded = false;
		const restParam = this.hasRest && this.parameters[this.parameters.length - 1];
		for (let index = args.length - 1; index >= 0; index--) {
			const paramVars = this.parameters[index] || restParam;
			const arg = args[index];
			if (paramVars) {
				calledFromTryStatement = false;
				for (const variable of paramVars) {
					if (variable.included) {
						argIncluded = true;
					}
					if (variable.calledFromTryStatement) {
						calledFromTryStatement = true;
					}
				}
			}
			if (!argIncluded && arg.shouldBeIncluded()) {
				argIncluded = true;
			}
			if (argIncluded) {
				arg.include(calledFromTryStatement);
			}
		}
	}
}
