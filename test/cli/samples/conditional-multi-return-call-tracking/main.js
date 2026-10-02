const condition = globalThis.condition;

function level0() {
	return condition ? level1() : level1();
}

function level1() {
	return condition ? level2() : level2();
}

function level2() {
	return condition ? level3() : level3();
}

function level3() {
	return condition ? level4() : level4();
}

function level4() {
	return condition ? level5() : level5();
}

function level5() {
	return condition ? level6() : level6();
}

function level6() {
	return condition ? level7() : level7();
}

function level7() {
	return condition ? level8() : level8();
}

function level8() {
	return condition ? level9() : level9();
}

function level9() {
	return condition ? level10() : level10();
}

function level10() {
	return condition ? level11() : level11();
}

function level11() {
	return condition ? level12() : level12();
}

function level12() {
	return condition ? level13() : level13();
}

function level13() {
	return condition ? level14() : level14();
}

function level14() {
	return condition ? level15() : level15();
}

function level15() {
	return condition ? level16() : level16();
}

function level16() {
	return condition ? level17() : level17();
}

function level17() {
	return condition ? level18() : level18();
}

function level18() {
	return condition ? () => true : () => true;
}

if (level0()()) console.log('retained');
