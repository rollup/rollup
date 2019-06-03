import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionNode, INCLUDE_VARIABLES } from '../nodes/shared/Node';
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
		this.hasRest = hasRest;
	}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		let hasInitBeenForceIncluded = false;
		for (let index = 0; index < args.length; index++) {
			const paramVars = this.parameters[index];
			const arg = args[index];
			if (paramVars) {
				hasInitBeenForceIncluded = false;
				for (const variable of paramVars) {
					if (variable.hasInitBeenForceIncluded) {
						hasInitBeenForceIncluded = true;
						break;
					}
				}
				arg.include(hasInitBeenForceIncluded ? INCLUDE_VARIABLES : false);
			} else if (this.hasRest || arg.shouldBeIncluded()) {
				arg.include(hasInitBeenForceIncluded ? INCLUDE_VARIABLES : false);
			}
		}
	}
}
