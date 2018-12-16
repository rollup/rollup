import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import LocalVariable from '../variables/LocalVariable';
import Scope from './Scope';

export default class BlockScope extends Scope {
	parent: Scope;

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity | null = null,
		isHoisted: boolean = false
	) {
		if (isHoisted) {
			return this.parent.addDeclaration(identifier, context, init, true) as LocalVariable;
		} else {
			return super.addDeclaration(identifier, context, init, false) as LocalVariable;
		}
	}
}
