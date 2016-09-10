import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import { STRING } from '../values.js';

export default class ForInStatement extends Statement {
	initialise ( scope ) {
		super.initialise( scope );
		assignTo( this.left, scope, STRING );
	}
}
