import Scope from './Scope';

export default class BlockScope extends Scope {
	addDeclaration ( identifier, options = {} ) {
		if ( options.isHoisted ) {
			this.parent.addDeclaration( identifier, options );
		} else {
			super.addDeclaration( identifier, options );
		}
	}
}
