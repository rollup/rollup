const createCallback = box => newValue => {
	box[0] = newValue;
	return box[0];
};

const box = [null];
const callback = createCallback(box);
globalFunction(callback);

assert.ok(box[0] ? true : false);
