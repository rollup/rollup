const mutateThis = () => {
	undefined.x = 1;
};

function Test () {
	mutateThis();
}

new Test();
