import Node from '../Node.js';

export default class ThrowStatement extends Node {
	hasEffects ( scope ) {
		return scope.findLexicalBoundary().isModuleScope; // TODO should this just be `true`? probably...
	}
}
