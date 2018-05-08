if (`truthy`) {
	console.log('kept');
} else {
	console.log('removed');
}

if (``) {
	console.log('removed');
} else {
	console.log('kept');
}

if (`${Math.random() > 0.5 ? 'truthy' : ''}`) {
	console.log('kept 1');
} else {
	console.log('kept 2');
}
