import ParameterScope from './ParameterScope';

export default class CatchScope extends ParameterScope {
	addDeclaration ( identifier, options = {} ) {
		if ( options.isHoisted ) {
			return this.parent.addDeclaration( identifier, options );
		} else {
			return super.addDeclaration( identifier, options );
		}
	}
}
