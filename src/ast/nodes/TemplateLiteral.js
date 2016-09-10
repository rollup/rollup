import Node from '../Node.js';

export default class TemplateLiteral extends Node {
	render ( code ) {
		code.indentExclusionRanges.push([ this.start, this.end ]);
	}
}
