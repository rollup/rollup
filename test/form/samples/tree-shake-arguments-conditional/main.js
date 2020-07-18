function ignoringArgs() {
	return 'no args';
}

function takingArgs(arg) {
	return arg;
}

const handler = false ? takingArgs : ignoringArgs;

console.log(handler('should be removed'));
