export let cond1a = false;
export let cond1b = false;
export let cond2a = false;
export let cond2b = false;
export let log1a = false;
export let log1b = false;
export let log2a = false;
export let log2b = false;

let flag = false;
checkConditional1();
checkConditional2();
checkLogical1();
checkLogical2();
flag = true;
checkConditional1();
checkConditional2();
checkLogical1();
checkLogical2();

function checkConditional1() {
	if (flag ? true : false) cond1a = true;
	else cond1b = true;
}

function checkConditional2() {
	if (!flag ? true : false) cond2a = true;
	else cond2b = true;
}

function checkLogical1() {
	if (flag && true) log1a = true;
	else log1b = true;
}

function checkLogical2() {
	if (!flag && true) log2a = true;
	else log2b = true;
}
