import Node from '../Node.js';
import getLocation from '../../utils/getLocation.js';

export default class ThisExpression extends Node {
	initialise ( scope ) {
		const lexicalBoundary = scope.findLexicalBoundary();

		if ( lexicalBoundary.isModuleScope ) {
			this.alias = this.module.context;
			if ( this.alias === 'undefined' ) {
				const location = getLocation(this.module.code, this.module.ast.end);
				const detail = `${this.module.id}, line: ${location.line}, column: ${location.column}`;
				this.module.bundle.onwarn( `The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten (in ${detail})`);
			}
		}
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}
	}
}
