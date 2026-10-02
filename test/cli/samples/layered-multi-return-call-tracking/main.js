const condition = globalThis.condition;

function level0() {
	if (condition) return level1();
	return level1();
}

function level1() {
	if (condition) return level2();
	return level2();
}

function level2() {
	if (condition) return level3();
	return level3();
}

function level3() {
	if (condition) return level4();
	return level4();
}

function level4() {
	if (condition) return level5();
	return level5();
}

function level5() {
	if (condition) return level6();
	return level6();
}

function level6() {
	if (condition) return level7();
	return level7();
}

function level7() {
	if (condition) return level8();
	return level8();
}

function level8() {
	if (condition) return level9();
	return level9();
}

function level9() {
	if (condition) return level10();
	return level10();
}

function level10() {
	if (condition) return level11();
	return level11();
}

function level11() {
	if (condition) return level12();
	return level12();
}

function level12() {
	if (condition) return level13();
	return level13();
}

function level13() {
	if (condition) return level14();
	return level14();
}

function level14() {
	if (condition) return level15();
	return level15();
}

function level15() {
	if (condition) return level16();
	return level16();
}

function level16() {
	if (condition) return level17();
	return level17();
}

function level17() {
	if (condition) return level18();
	return level18();
}

function level18() {
	if (condition) return () => true;
	return () => true;
}

if (level0()()) console.log('retained');