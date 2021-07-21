import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';

export default class BlockScope extends ChildScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity | null,
		isHoisted: boolean
	): LocalVariable {
		if (isHoisted) {
			const variable = this.parent.addDeclaration(identifier, context, init, isHoisted);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			variable.markInitializersForDeoptimization();
			return variable;
		} else {
			return super.addDeclaration(identifier, context, init, false);
		}
	}
}
