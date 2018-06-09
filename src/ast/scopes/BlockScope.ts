import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import LocalVariable from '../variables/LocalVariable';
import Scope from './Scope';

export default class BlockScope extends Scope {
	parent: Scope;

	addDeclaration(
		identifier: Identifier,
		reassignmentTracker: EntityPathTracker,
		init: ExpressionEntity | null = null,
		isHoisted: boolean = false
	) {
		if (isHoisted) {
			return this.parent.addDeclaration(
				identifier,
				reassignmentTracker,
				init,
				true
			) as LocalVariable;
		} else {
			return super.addDeclaration(identifier, reassignmentTracker, init, false) as LocalVariable;
		}
	}
}
