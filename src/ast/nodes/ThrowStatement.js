import Node from '../Node.js';

export default class ThrowStatement extends Node {
	hasEffects () {
		return true;
	}
}
