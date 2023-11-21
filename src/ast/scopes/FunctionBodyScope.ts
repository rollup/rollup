import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import type ParameterScope from './ParameterScope';

export default class FunctionBodyScope extends ChildScope {
	constructor(parent: ParameterScope) {
		super(parent, parent.context);
	}

	// There is stuff that is only allowed in function scopes, i.e. functions can
	// be redeclared, functions and var can redeclare each other
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		const name = identifier.name;
		const existingVariable =
			this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable);
		if (existingVariable) {
			const existingKind = existingVariable.kind;
			if (
				(kind === VariableKind.var || kind === VariableKind.function) &&
				(existingKind === VariableKind.var ||
					existingKind === VariableKind.function ||
					existingKind === VariableKind.parameter)
			) {
				existingVariable.addDeclaration(identifier, init);
				return existingVariable;
			}
			context.error(logRedeclarationError(name), identifier.start);
		}
		const newVariable = new LocalVariable(identifier.name, identifier, init, context, kind);
		this.variables.set(name, newVariable);
		return newVariable;
	}
}
