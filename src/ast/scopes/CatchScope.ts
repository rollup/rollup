import ParameterScope from './ParameterScope';
import Identifier from '../nodes/Identifier';

export default class CatchScope extends ParameterScope {
	addDeclaration (identifier: Identifier, options: {
		isHoisted: boolean;
	} = {
		isHoisted: false
	}) {
		if (options.isHoisted) {
			return this.parent.addDeclaration(identifier, options);
		} else {
			return super.addDeclaration(identifier, options);
		}
	}
}
