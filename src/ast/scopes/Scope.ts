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
	hoistedVariables?: Map<string, LocalVariable>;

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
		kind: VariableKind,
		variable: LocalVariable | null
	): LocalVariable {
		const name = identifier.name;
		const existingVariable =
			this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable);
		if (existingVariable) {
			const existingKind = existingVariable.kind;
			if (
				(kind === VariableKind.var &&
					(existingKind === VariableKind.var || existingKind === VariableKind.parameter)) ||
				(kind === VariableKind.function && existingKind === VariableKind.parameter)
			) {
				existingVariable.addDeclaration(identifier, init);
				return existingVariable;
			}
			context.error(logRedeclarationError(name), identifier.start);
		}
		const newVariable =
			variable ||
			new LocalVariable(identifier.name, identifier, init || UNDEFINED_EXPRESSION, context, kind);
		this.variables.set(name, newVariable);
		return newVariable;
	}

	addHoistedVariable(name: string, variable: LocalVariable) {
		(this.hoistedVariables ||= new Map()).set(name, variable);
	}

	contains(name: string): boolean {
		return this.variables.has(name);
	}

	findVariable(_name: string): Variable {
		throw new Error('Internal Error: findVariable needs to be implemented by a subclass');
	}
}
