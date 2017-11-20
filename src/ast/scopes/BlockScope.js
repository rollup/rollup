import Scope from './Scope';

export default class BlockScope extends Scope {
	addDeclaration ( identifier, options = {} ) {
		if ( options.isHoisted ) {
			return this.parent.addDeclaration( identifier, options );
		} else {
			return super.addDeclaration( identifier, options );
		}
	}
}
