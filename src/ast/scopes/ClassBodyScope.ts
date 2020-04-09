import ChildScope from './ChildScope';

export default class ClassBodyScope extends ChildScope {
	findLexicalBoundary() {
		return this;
	}
}
