import Node from '../Node';

export default class ThrowStatement extends Node {
	hasEffects () {
		return true;
	}
}
