import Scope from './Scope.js';
import { unknown } from '../values';

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

	call ( args ) {
		// TODO assume args can be called?
	}

	gatherPossibleValues ( values ) {
		values.add( unknown );
	}

	getInstance () {
		return unknown;
	}

	getProperty () {
		return unknown;
	}

	getName () {
		return this.name;
	}

	markReturnStatements () {
		// noop
	}

	toString () {
		return `[[SyntheticGlobalDeclaration:${this.name}]]`;
	}
}

export default class BundleScope extends Scope {
	findDeclaration ( name ) {
		if ( !this.declarations[ name ] ) {
			this.declarations[ name ] = new SyntheticGlobalDeclaration( name );
		}

		return this.declarations[ name ];
	}

	getValue ( name ) {
		return this.declarations[ name ];
	}
}
