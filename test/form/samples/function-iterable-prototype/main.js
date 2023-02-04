function AsyncGenerator(gen) {}

AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
	return this;
};
