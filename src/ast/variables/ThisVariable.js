import ReplaceableInitVariable from './ReplaceableInitVariable';

export default class ThisVariable extends ReplaceableInitVariable {
	constructor () {
		super( 'this', null );
	}
}
