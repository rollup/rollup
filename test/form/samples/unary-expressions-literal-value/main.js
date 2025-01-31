void Symbol(1) ? foo() : bar();

!(Symbol(1) || true) ? foo() : bar();

quz() ? foo() : bar();

function quz() {
	return !!(Symbol(1) && false);
}
