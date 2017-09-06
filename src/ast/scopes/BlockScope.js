import Scope from './Scope';

export default class BlockScope extends Scope {
	addDeclaration ( identifier, isHoisted, init ) {
		if ( isHoisted ) {
			this.parent.addDeclaration( identifier, isHoisted, init );
		} else {
			super.addDeclaration( identifier, false, init );
		}
	}
}
