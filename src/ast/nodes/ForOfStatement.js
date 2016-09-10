import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import { UNKNOWN } from '../values.js';

export default class ForOfStatement extends Statement {
	initialise ( scope ) {
		super.initialise( scope );
		assignTo( this.left, scope, UNKNOWN );
	}
}
