import Node from '../Node';
import CatchScope from '../scopes/CatchScope';
import Pattern from './Pattern';
import BlockStatement from './BlockStatement';
import Scope from '../scopes/Scope';

export default class CatchClause extends Node {
	type: 'CatchClause';
	param: Pattern;
	body: BlockStatement;

	initialiseChildren () {
		this.param && this.param.initialiseAndDeclare(this.scope, 'parameter');
		this.body.initialiseAndReplaceScope(this.scope);
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new CatchScope({ parent: parentScope });
	}
}
