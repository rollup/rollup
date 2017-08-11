export var foo = { value: 1 };

function mutate ( obj ) {
	obj.value += 1;
	return obj;
}

export default mutate( foo );
