import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from '../nodes/shared/Expression';
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
			return this.parent.addDeclaration(identifier, context, UNKNOWN_EXPRESSION, isHoisted);
		} else {
			return super.addDeclaration(identifier, context, init, false);
		}
	}
}
