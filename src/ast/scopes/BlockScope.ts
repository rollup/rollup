import Identifier from '../nodes/Identifier';
import LocalVariable from '../variables/LocalVariable';
import Scope from './Scope';

export default class BlockScope extends Scope {
	parent: Scope;

	addDeclaration(
		identifier: Identifier,
		options = {
			isHoisted: false
		}
	) {
		if (options.isHoisted) {
			return this.parent.addDeclaration(identifier, options) as LocalVariable;
		} else {
			return super.addDeclaration(identifier, options) as LocalVariable;
		}
	}
}
