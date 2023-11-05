import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import { UNDEFINED_EXPRESSION } from '../values';
import type LocalVariable from '../variables/LocalVariable';
import ParameterScope from './ParameterScope';

export default class CatchScope extends ParameterScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		// Catch scopes have special scoping in that the parameter actually shadows the var but receives the assignment:
		// try {
		// 	throw new Error();
		// } catch {
		// 	var e = 'value';
		// 	console.log(e); // "value"
		// }
		// console.log(e); // undefined

		// if (kind === VariableKind.var) {
		// 	const name = identifier.name;
		// 	let variable = this.variables.get(name) as LocalVariable | undefined;
		// 	if (variable) {
		// 		if (variable.kind !== VariableKind.var && variable.kind !== VariableKind.function) {
		// 			context.error(logRedeclarationError(name), identifier.start);
		// 		}
		// 		variable.addDeclaration(identifier, init);
		// 	} else {
		// 		// We add the variable to this and all parent scopes to reliably detect conflicts
		// 		variable = this.parent.addDeclaration(identifier, context, init, kind);
		// 		this.variables.set(name, variable);
		// 	}
		// 	// Necessary to make sure the init is deoptimized for conditional declarations.
		// 	// We cannot call deoptimizePath here.
		// 	variable.markInitializersForDeoptimization();
		// 	return variable;
		// } else {
		// 	return super.addDeclaration(identifier, context, init, kind);
		// }

		// TODO Lukas we should only hoist var here. First, create logic locally
		const existingParameter = this.variables.get(identifier.name) as LocalVariable | undefined;
		if (existingParameter) {
			// TODO Lukas also re-use the variable here
			// While we still create a hoisted declaration, the initializer goes to
			// the parameter. Note that technically, the declaration now belongs to
			// two variables, which is not correct but should not cause issues.
			this.parent.addDeclaration(identifier, context, UNDEFINED_EXPRESSION, kind);
			existingParameter.addDeclaration(identifier, init);
			return existingParameter;
		}
		return this.parent.addDeclaration(identifier, context, init, kind);
	}
}
