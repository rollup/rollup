import Node from '../Node.js';

export default class CatchClause extends Node {
	initialise ( scope ) {
		this.body.createScope( scope );
		this.scope = this.body.scope;

		this.body.initialise( this.scope );
	}
}