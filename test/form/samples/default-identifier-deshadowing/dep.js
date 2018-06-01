export default function a() {
	console.log('effect');
  a = someGlobal;
  return a();
}