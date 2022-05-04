export function patchEventTarget(callback) {
	var proto = window.EventTarget.prototype;
	var nativeAddEventListener = proto.addEventListener;

	proto.addEventListener = function () {
		return nativeAddEventListener(callback);
	};

	return proto;
}
