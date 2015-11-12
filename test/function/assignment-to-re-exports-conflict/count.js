export var count = 0;

export function conflict () {
	var foo = 0,
			count = 42;
}

export function incr () {
	count += 1;
}
