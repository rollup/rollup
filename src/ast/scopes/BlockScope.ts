import Scope from './Scope';
import Identifier from '../nodes/Identifier';

export default class BlockScope extends Scope {
	parent: Scope;

	addDeclaration (identifier: Identifier, options = {}) {
		if (options.isHoisted) {
			return this.parent.addDeclaration(identifier, options);
		} else {
			return super.addDeclaration(identifier, options);
		}
	}
}
