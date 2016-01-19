export var count = 0;

export function incr () {
	return ++count;
}

incr = function () {
	return count++;
};
