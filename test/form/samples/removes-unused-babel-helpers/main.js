var babelHelpers = {};
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	return typeof obj;
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var jsx = function () {
	var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
	return function createRawReactElement(type, props, key, children) {
		var defaultProps = type && type.defaultProps;
		var childrenLength = arguments.length - 3;

		if (!props && childrenLength !== 0) {
			props = {};
		}

		if (props && defaultProps) {
			for (var propName in defaultProps) {
				if (props[propName] === void 0) {
					props[propName] = defaultProps[propName];
				}
			}
		} else if (!props) {
			props = defaultProps || {};
		}

		if (childrenLength === 1) {
			props.children = children;
		} else if (childrenLength > 1) {
			var childArray = Array(childrenLength);

			for (var i = 0; i < childrenLength; i++) {
				childArray[i] = arguments[i + 3];
			}

			props.children = childArray;
		}

		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type: type,
			key: key === undefined ? null : '' + key,
			ref: null,
			props: props,
			_owner: null
		};
	};
}();

var asyncIterator = function (iterable) {
	if (typeof Symbol === "function") {
		if (Symbol.asyncIterator) {
			var method = iterable[Symbol.asyncIterator];
			if (method != null) return method.call(iterable);
		}

		if (Symbol.iterator) {
			return iterable[Symbol.iterator]();
		}
	}

	throw new TypeError("Object is not async iterable");
};

var asyncGenerator = function () {
	function AwaitValue(value) {
		this.value = value;
	}

	function AsyncGenerator(gen) {
		var front, back;

		function send(key, arg) {
			return new Promise(function (resolve, reject) {
				var request = {
					key: key,
					arg: arg,
					resolve: resolve,
					reject: reject,
					next: null
				};

				if (back) {
					back = back.next = request;
				} else {
					front = back = request;
					resume(key, arg);
				}
			});
		}

		function resume(key, arg) {
			try {
				var result = gen[key](arg);
				var value = result.value;

				if (value instanceof AwaitValue) {
					Promise.resolve(value.value).then(function (arg) {
						resume("next", arg);
					}, function (arg) {
						resume("throw", arg);
					});
				} else {
					settle(result.done ? "return" : "normal", result.value);
				}
			} catch (err) {
				settle("throw", err);
			}
		}

		function settle(type, value) {
			switch (type) {
				case "return":
					front.resolve({
						value: value,
						done: true
					});
					break;

				case "throw":
					front.reject(value);
					break;

				default:
					front.resolve({
						value: value,
						done: false
					});
					break;
			}

			front = front.next;

			if (front) {
				resume(front.key, front.arg);
			} else {
				back = null;
			}
		}

		this._invoke = send;

		if (typeof gen.return !== "function") {
			this.return = undefined;
		}
	}

	if (typeof Symbol === "function" && Symbol.asyncIterator) {
		AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
			return this;
		};
	}

	AsyncGenerator.prototype.next = function (arg) {
		return this._invoke("next", arg);
	};

	AsyncGenerator.prototype.throw = function (arg) {
		return this._invoke("throw", arg);
	};

	AsyncGenerator.prototype.return = function (arg) {
		return this._invoke("return", arg);
	};

	return {
		wrap: function (fn) {
			return function () {
				return new AsyncGenerator(fn.apply(this, arguments));
			};
		},
		await: function (value) {
			return new AwaitValue(value);
		}
	};
}();

var asyncGeneratorDelegate = function (inner, awaitWrap) {
	var iter = {},
		waiting = false;

	function pump(key, value) {
		waiting = true;
		value = new Promise(function (resolve) {
			resolve(inner[key](value));
		});
		return {
			done: false,
			value: awaitWrap(value)
		};
	}



	if (typeof Symbol === "function" && Symbol.iterator) {
		iter[Symbol.iterator] = function () {
			return this;
		};
	}

	iter.next = function (value) {
		if (waiting) {
			waiting = false;
			return value;
		}

		return pump("next", value);
	};

	if (typeof inner.throw === "function") {
		iter.throw = function (value) {
			if (waiting) {
				waiting = false;
				throw value;
			}

			return pump("throw", value);
		};
	}

	if (typeof inner.return === "function") {
		iter.return = function (value) {
			return pump("return", value);
		};
	}

	return iter;
};

var asyncToGenerator = function (fn) {
	return function () {
		var gen = fn.apply(this, arguments);
		return new Promise(function (resolve, reject) {
			function step(key, arg) {
				try {
					var info = gen[key](arg);
					var value = info.value;
				} catch (error) {
					reject(error);
					return;
				}

				if (info.done) {
					resolve(value);
				} else {
					return Promise.resolve(value).then(function (value) {
						step("next", value);
					}, function (err) {
						step("throw", err);
					});
				}
			}

			return step("next");
		});
	};
};

var classCallCheck = function (instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
};

var createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
}();

var defineEnumerableProperties = function (obj, descs) {
	for (var key in descs) {
		var desc = descs[key];
		desc.configurable = desc.enumerable = true;
		if ("value" in desc) desc.writable = true;
		Object.defineProperty(obj, key, desc);
	}

	return obj;
};

var defaults = function (obj, defaults) {
	var keys = Object.getOwnPropertyNames(defaults);

	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		var value = Object.getOwnPropertyDescriptor(defaults, key);

		if (value && value.configurable && obj[key] === undefined) {
			Object.defineProperty(obj, key, value);
		}
	}

	return obj;
};

var defineProperty = function (obj, key, value) {
	if (key in obj) {
		Object.defineProperty(obj, key, {
			value: value,
			enumerable: true,
			configurable: true,
			writable: true
		});
	} else {
		obj[key] = value;
	}

	return obj;
};

var _extends = Object.assign || function (target) {
	for (var i = 1; i < arguments.length; i++) {
		var source = arguments[i];

		for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				target[key] = source[key];
			}
		}
	}

	return target;
};

var get = function get(object, property, receiver) {
	if (object === null) object = Function.prototype;
	var desc = Object.getOwnPropertyDescriptor(object, property);

	if (desc === undefined) {
		var parent = Object.getPrototypeOf(object);

		if (parent === null) {
			return undefined;
		} else {
			return get(parent, property, receiver);
		}
	} else if ("value" in desc) {
		return desc.value;
	} else {
		var getter = desc.get;

		if (getter === undefined) {
			return undefined;
		}

		return getter.call(receiver);
	}
};

var inherits = function (subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}

	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: {
			value: subClass,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
	if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var _instanceof = function (left, right) {
	if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
		return right[Symbol.hasInstance](left);
	} else {
		return left instanceof right;
	}
};

var interopRequireDefault = function (obj) {
	return obj && obj.__esModule ? obj : {
		default: obj
	};
};

var interopRequireWildcard = function (obj) {
	if (obj && obj.__esModule) {
		return obj;
	} else {
		var newObj = {};

		if (obj != null) {
			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
			}
		}

		newObj.default = obj;
		return newObj;
	}
};

var newArrowCheck = function (innerThis, boundThis) {
	if (innerThis !== boundThis) {
		throw new TypeError("Cannot instantiate an arrow function");
	}
};

var objectDestructuringEmpty = function (obj) {
	if (obj == null) throw new TypeError("Cannot destructure undefined");
};

var objectWithoutProperties = function (obj, keys) {
	var target = {};

	for (var i in obj) {
		if (keys.indexOf(i) >= 0) continue;
		if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
		target[i] = obj[i];
	}

	return target;
};

var possibleConstructorReturn = function (self, call) {
	if (!self) {
		throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	}

	return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var selfGlobal = typeof global === "undefined" ? self : global;

var set = function set(object, property, value, receiver) {
	var desc = Object.getOwnPropertyDescriptor(object, property);

	if (desc === undefined) {
		var parent = Object.getPrototypeOf(object);

		if (parent !== null) {
			set(parent, property, value, receiver);
		}
	} else if ("value" in desc && desc.writable) {
		desc.value = value;
	} else {
		var setter = desc.set;

		if (setter !== undefined) {
			setter.call(receiver, value);
		}
	}

	return value;
};

var slicedToArray = function () {
	function sliceIterator(arr, i) {
		var _arr = [];
		var _n = true;
		var _d = false;
		var _e = undefined;

		try {
			for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
				_arr.push(_s.value);

				if (i && _arr.length === i) break;
			}
		} catch (err) {
			_d = true;
			_e = err;
		} finally {
			try {
				if (!_n && _i["return"]) _i["return"]();
			} finally {
				if (_d) throw _e;
			}
		}

		return _arr;
	}

	return function (arr, i) {
		if (Array.isArray(arr)) {
			return arr;
		} else if (Symbol.iterator in Object(arr)) {
			return sliceIterator(arr, i);
		} else {
			throw new TypeError("Invalid attempt to destructure non-iterable instance");
		}
	};
}();

var slicedToArrayLoose = function (arr, i) {
	if (Array.isArray(arr)) {
		return arr;
	} else if (Symbol.iterator in Object(arr)) {
		var _arr = [];

		for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
			_arr.push(_step.value);

			if (i && _arr.length === i) break;
		}

		return _arr;
	} else {
		throw new TypeError("Invalid attempt to destructure non-iterable instance");
	}
};

var taggedTemplateLiteral = function (strings, raw) {
	return Object.freeze(Object.defineProperties(strings, {
		raw: {
			value: Object.freeze(raw)
		}
	}));
};

var taggedTemplateLiteralLoose = function (strings, raw) {
	strings.raw = raw;
	return strings;
};

var temporalRef = function (val, name, undef) {
	if (val === undef) {
		throw new ReferenceError(name + " is not defined - temporal dead zone");
	} else {
		return val;
	}
};

var temporalUndefined = {};

var toArray = function (arr) {
	return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

		return arr2;
	} else {
		return Array.from(arr);
	}
};

babelHelpers;
