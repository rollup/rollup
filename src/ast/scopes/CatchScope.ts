import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
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
			existingParameter.addDeclaration(identifier, init);
			return existingParameter;
		}
		// as parameters are handled differently, all remaining declarations are
		// hoisted
		return this.parent.addDeclaration(identifier, context, init, isHoisted);
	}
}
