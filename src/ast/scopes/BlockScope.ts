import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';

export default class BlockScope extends ChildScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
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
