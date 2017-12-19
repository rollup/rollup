import GlobalVariable from '../variables/GlobalVariable';

export default class BundleScope extends Scope {
	findVariable ( name ) {
		if ( !this.variables[ name ] ) {
			this.variables[ name ] = new GlobalVariable( name );
		}

		return this.variables[ name ];
	}
}
