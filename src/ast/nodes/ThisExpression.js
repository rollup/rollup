import Node from '../Node.js';
import {normalize} from '../../utils/path';

function getContext (module) {
	let context = module.bundle.context;
	const moduleContext = module.bundle.moduleContext;
	if (moduleContext) {
		const moduleId = normalize(module.id);
		const candidates = Object.keys(moduleContext)
			.map(relPath => moduleId.indexOf(relPath) >= 0 ? moduleContext[relPath] : undefined)
			.filter(context => !!context);

		if (candidates.length) {
			context = String( candidates[candidates.length - 1] );
		} 
	}

	return context;
}

export default class ThisExpression extends Node {
	initialise ( scope ) {
		const lexicalBoundary = scope.findLexicalBoundary();

		if ( lexicalBoundary.isModuleScope ) {
			this.alias = getContext(this.module);
			if ( this.alias === 'undefined' ) {
				this.module.bundle.onwarn( 'The `this` keyword is equivalent to `undefined` at the top level of an ES module, and has been rewritten' );
			}
		}
	}

	render ( code ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}
	}
}
