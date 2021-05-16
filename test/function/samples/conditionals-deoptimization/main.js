export let first = false;
export let second = false;
export let third = false;
export let fourth = false;

let flag = false;
checkConditional();
checkLogical();
flag = true;
checkConditional();
checkLogical();

function checkConditional() {
	if (flag ? true : false) first = true;
	else second = true;
}

function checkLogical() {
	if (flag && true) third = true;
	else fourth = true;
}
