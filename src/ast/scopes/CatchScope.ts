import Identifier from '../nodes/Identifier';
import LocalVariable from '../variables/LocalVariable';
import ParameterScope from './ParameterScope';
import Scope from './Scope';

export default class CatchScope extends ParameterScope {
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
