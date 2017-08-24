import Scope from './Scope.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

class SyntheticGlobalDeclaration {
	constructor ( name ) {
		this.name = name;
		this.isExternal = true;
		this.isGlobal = true;
		this.isReassigned = false;
		this.included = true;
	}

	addReference ( reference ) {
		reference.declaration = this;
		if ( reference.isReassignment ) this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT );
	}

	getName () {
		return this.name;
	}

	includeDeclaration() {
		this.included = true;
		return false;
	}
}

export default class BundleScope extends Scope {
	findDeclaration ( name ) {
		if ( !this.declarations[ name ] ) {
			this.declarations[ name ] = new SyntheticGlobalDeclaration( name );
		}

		return this.declarations[ name ];
	}
}
