var value = 1;

function change () {
	value = 2;
}

function changeAgain () {
	value += 1;
}

change();

if ( true ) {
	changeAgain();
}

export default value;
