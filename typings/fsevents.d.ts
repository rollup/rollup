// 'fsevents' (which also has typings included) is an optional dependency installed on macOS,
// and not installed on linux/windows. this will provide (bogus) type information for
// linux/windows, and overwrite (replace) the types coming with the 'fsevents' module on macOS
declare module 'fsevents' {
	export default {};
}
