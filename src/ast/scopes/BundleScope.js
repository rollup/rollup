import Scope from './Scope.js';
import { UNKNOWN } from '../values';

class SyntheticGlobalDeclaration {
	constructor ( name ) {
		this.name = name;
		this.isExternal = true;
		this.isGlobal = true;
		this.isReassigned = false;

		this.activated = true;
	}

	activate () {
		/* noop */
	}

	addReference ( reference ) {
		reference.declaration = this;
		if ( reference.isReassignment ) this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN );
	}

	getName () {
		return this.name;
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
