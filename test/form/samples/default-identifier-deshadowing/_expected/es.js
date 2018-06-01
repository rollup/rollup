function a() {
	console.log('effect');
  a = someGlobal;
  return a();
}

a();
