import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import { UNDEFINED_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type ChildScope from './ChildScope';

export default class Scope {
	readonly children: ChildScope[] = [];
	readonly variables = new Map<string, Variable>();

	/*
	Redeclaration rules:
	- var and function can always redeclare each other
	- var is hoisted across scopes, function remains in the scope it is declared
	- var and function can redeclare function parameters, but parameters cannot redeclare parameters
	- function cannot redeclare catch scope parameters
	- var can redeclare catch scope parameters in a way
		- if the parameter is an identifier and not a pattern
		- then the variable is still declared in the hoisted outer scope, but the initializer is assigned to the parameter
	- const, let, class cannot redeclare anything
	Approach:
	- add "kind" to "addDeclaration"
	- add "kind" to variable in scope? constructor?
	- for existing variables, we do NOT replace kind
	 */
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		const name = identifier.name;
		let variable = this.variables.get(name) as LocalVariable;
		if (variable) {
			if (kind !== VariableKind.var && kind !== VariableKind.function) {
				context.error(logRedeclarationError(name), identifier.start);
			}
			if (
				variable.kind !== VariableKind.var &&
				variable.kind !== VariableKind.function &&
				variable.kind !== VariableKind.parameter
			) {
				context.error(logRedeclarationError(name), identifier.start);
			}
			variable.addDeclaration(identifier, init);
		} else {
			variable = new LocalVariable(
				identifier.name,
				identifier,
				init || UNDEFINED_EXPRESSION,
				context,
				kind
			);
			this.variables.set(name, variable);
		}
		return variable;
	}

	contains(name: string): boolean {
		return this.variables.has(name);
	}

	findVariable(_name: string): Variable {
		throw new Error('Internal Error: findVariable needs to be implemented by a subclass');
	}
}
