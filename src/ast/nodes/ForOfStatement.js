import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import { UNKNOWN } from '../values.js';

export default class ForOfStatement extends Statement {
	initialise ( scope ) {
		this.body.createScope( scope );
		super.initialise( this.body.scope );
		assignTo( this.left, this.body.scope, UNKNOWN );
	}
}
