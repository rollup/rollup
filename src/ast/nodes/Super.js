import Node from '../Node.js';

export default class Super extends Node {
	call ( context, args ) {
		const classDeclaration = this.findParent( /ClassDeclaration/ );
		context = 'TODO';
		classDeclaration.call( context, args ); // TODO call constructor, not the class itself...
	}

	markReturnStatements () {
		// noop?
	}
}
