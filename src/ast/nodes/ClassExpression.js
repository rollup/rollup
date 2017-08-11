import Class from './shared/Class.js';

export default class ClassExpression extends Class {
	initialiseChildren (parentScope) {
		if ( this.id ) {
			this.name = this.id.name;
			this.scope.addDeclaration( this.name, this, false, false );
			this.id.initialise( this.scope );
		}
		super.initialiseChildren(parentScope);
	}
}
