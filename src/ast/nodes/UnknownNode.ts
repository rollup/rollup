import Node from '../Node';

export default class UnknownNode extends Node {
	hasEffects () {
		return true;
	}
}
