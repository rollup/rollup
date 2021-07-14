import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNDEFINED_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import ParameterScope from './ParameterScope';

export default class CatchScope extends ParameterScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity | null,
		isHoisted: boolean
	): LocalVariable {
		const existingParameter = this.variables.get(identifier.name) as LocalVariable;
		if (existingParameter) {
			// While we still create a hoisted declaration, the initializer goes to
			// the parameter. Note that technically, the declaration now belongs to
			// two variables, which is not correct but should not cause issues.
			this.parent.addDeclaration(identifier, context, UNDEFINED_EXPRESSION, isHoisted);
			existingParameter.addDeclaration(identifier, init);
			return existingParameter;
		}
		return this.parent.addDeclaration(identifier, context, init, isHoisted);
	}
}
