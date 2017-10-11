const mutateThis = () => {
	this.x = 1;
};

function Test () {
	mutateThis();
}

const test = new Test();
