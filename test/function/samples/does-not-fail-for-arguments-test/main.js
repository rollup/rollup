var hasArgsEnumBug = (function() {
	return arguments.propertyIsEnumerable('length');
}());
