import('./dynamic-included').then(result => console.log(result));

const include = false;
if (include) {
	import('./dynamic-removed').then(result => console.log(result));
}
