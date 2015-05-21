import { keys } from './utils/object';

export default class Statement {
	constructor ( node, source, module ) {
		this.node = node;
		this.module = module;
		this.source = source;

		this.defines = {};
		this.modifies = {};
		this.dependsOn = {};

		this.isIncluded = false;

		this.leadingComments = []
		this.trailingComment = null;
		this.margin = [ 0, 0 ];
	}
}
