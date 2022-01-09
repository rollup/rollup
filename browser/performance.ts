const global =
	typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : {};

export default 'performance' in global
	? performance
	: {
			now(): 0 {
				return 0;
			}
	  };
