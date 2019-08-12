function fails(exec) {
	try {
		return !!exec();
	} catch (e) {
		return true;
	}
}

var MAX_UINT32 = 0xffffffff;
var SUPPORTS_Y = !fails(function() {
	RegExp(MAX_UINT32, 'y');
});

if (SUPPORTS_Y) {
	console.log('yes');
} else {
	console.log('no');
}
