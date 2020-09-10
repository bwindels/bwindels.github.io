var hydrogenBundle = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
		  path: basedir,
		  exports: {},
		  require: function (path, base) {
	      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
	    }
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};
	var global_1 =
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;
	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;
	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;
	var indexedObject = fails(function () {
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);
	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) {  }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};
	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) {  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});
	var sharedStore = store;

	var functionToString = Function.toString;
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}
	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;
	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.5',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();
	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');
	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;
	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};
	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};
	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}
	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');
	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};
	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0;
	};

	var max = Math.max;
	var min$1 = Math.min;
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      if (value != value) return true;
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};
	var arrayIncludes = {
	  includes: createMethod(true),
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;
	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};
	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;
	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;
	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};
	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};
	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';
	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    redefine(target, key, sourceProperty, options);
	  }
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');
	var EmptyConstructor = function () {  };
	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null;
	  return temp;
	};
	var NullProtoObjectViaIFrame = function () {
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) {  }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};
	hiddenKeys[IE_PROTO] = true;
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;
	var toString$1 = {}.toString;
	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	var getWindowNames = function (it) {
	  try {
	    return nativeGetOwnPropertyNames(it);
	  } catch (error) {
	    return windowNames.slice();
	  }
	};
	var f$5 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]'
	    ? getWindowNames(it)
	    : nativeGetOwnPropertyNames(toIndexedObject(it));
	};
	var objectGetOwnPropertyNamesExternal = {
		f: f$5
	};

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;
	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var f$6 = wellKnownSymbol;
	var wellKnownSymbolWrapped = {
		f: f$6
	};

	var defineProperty = objectDefineProperty.f;
	var defineWellKnownSymbol = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
	    value: wellKnownSymbolWrapped.f(NAME)
	  });
	};

	var defineProperty$1 = objectDefineProperty.f;
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function () {
	    return fn.apply(that, arguments);
	  };
	};

	var SPECIES = wellKnownSymbol('species');
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result;
	        else if (result) switch (TYPE) {
	          case 3: return true;
	          case 5: return value;
	          case 6: return index;
	          case 2: push.call(target, value);
	        } else if (IS_EVERY) return false;
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};
	var arrayIteration = {
	  forEach: createMethod$1(0),
	  map: createMethod$1(1),
	  filter: createMethod$1(2),
	  some: createMethod$1(3),
	  every: createMethod$1(4),
	  find: createMethod$1(5),
	  findIndex: createMethod$1(6)
	};

	var $forEach = arrayIteration.forEach;
	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(SYMBOL);
	var ObjectPrototype = Object[PROTOTYPE$1];
	var $Symbol = global_1.Symbol;
	var $stringify = getBuiltIn('JSON', 'stringify');
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var nativeDefineProperty$1 = objectDefineProperty.f;
	var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry = shared('symbol-to-string-registry');
	var WellKnownSymbolsStore$1 = shared('wks');
	var QObject = global_1.QObject;
	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;
	var setSymbolDescriptor = descriptors && fails(function () {
	  return objectCreate(nativeDefineProperty$1({}, 'a', {
	    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
	  nativeDefineProperty$1(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
	    nativeDefineProperty$1(ObjectPrototype, P, ObjectPrototypeDescriptor);
	  }
	} : nativeDefineProperty$1;
	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
	  setInternalState(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!descriptors) symbol.description = description;
	  return symbol;
	};
	var isSymbol = useSymbolAsUid ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return Object(it) instanceof $Symbol;
	};
	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPrimitive(P, true);
	  anObject(Attributes);
	  if (has(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
	      O[HIDDEN][key] = true;
	    } else {
	      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty$1(O, key, Attributes);
	};
	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach(keys, function (key) {
	    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};
	var $create = function create(O, Properties) {
	  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPrimitive(V, true);
	  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
	  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPrimitive(P, true);
	  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
	  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
	  });
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
	  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
	      result.push(AllSymbols[key]);
	    }
	  });
	  return result;
	};
	if (!nativeSymbol) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var tag = uid(description);
	    var setter = function (value) {
	      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
	    };
	    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };
	  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
	    return getInternalState(this).tag;
	  });
	  redefine($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });
	  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
	  objectDefineProperty.f = $defineProperty;
	  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
	  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;
	  wellKnownSymbolWrapped.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };
	  if (descriptors) {
	    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState(this).description;
	      }
	    });
	    {
	      redefine(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
	    }
	  }
	}
	_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
	  Symbol: $Symbol
	});
	$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
	  defineWellKnownSymbol(name);
	});
	_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
	  'for': function (key) {
	    var string = String(key);
	    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = $Symbol(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  },
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
	    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  },
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});
	_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
	  create: $create,
	  defineProperty: $defineProperty,
	  defineProperties: $defineProperties,
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});
	_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
	  getOwnPropertyNames: $getOwnPropertyNames,
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return objectGetOwnPropertySymbols.f(toObject(it));
	  }
	});
	if ($stringify) {
	  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
	    var symbol = $Symbol();
	    return $stringify([symbol]) != '[null]'
	      || $stringify({ a: symbol }) != '{}'
	      || $stringify(Object(symbol)) != '{}';
	  });
	  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
	    stringify: function stringify(it, replacer, space) {
	      var args = [it];
	      var index = 1;
	      var $replacer;
	      while (arguments.length > index) args.push(arguments[index++]);
	      $replacer = replacer;
	      if (!isObject(replacer) && it === undefined || isSymbol(it)) return;
	      if (!isArray(replacer)) replacer = function (key, value) {
	        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	        if (!isSymbol(value)) return value;
	      };
	      args[1] = replacer;
	      return $stringify.apply(null, args);
	    }
	  });
	}
	if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
	  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
	}
	setToStringTag($Symbol, SYMBOL);
	hiddenKeys[HIDDEN] = true;

	var defineProperty$2 = objectDefineProperty.f;
	var NativeSymbol = global_1.Symbol;
	if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
	  NativeSymbol().description !== undefined
	)) {
	  var EmptyStringDescriptionStore = {};
	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var result = this instanceof SymbolWrapper
	      ? new NativeSymbol(description)
	      : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };
	  copyConstructorProperties(SymbolWrapper, NativeSymbol);
	  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
	  symbolPrototype.constructor = SymbolWrapper;
	  var symbolToString = symbolPrototype.toString;
	  var native = String(NativeSymbol('test')) == 'Symbol(test)';
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  defineProperty$2(symbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = isObject(this) ? this.valueOf() : this;
	      var string = symbolToString.call(symbol);
	      if (has(EmptyStringDescriptionStore, symbol)) return '';
	      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });
	  _export({ global: true, forced: true }, {
	    Symbol: SymbolWrapper
	  });
	}

	defineWellKnownSymbol('asyncIterator');

	defineWellKnownSymbol('hasInstance');

	defineWellKnownSymbol('isConcatSpreadable');

	defineWellKnownSymbol('iterator');

	defineWellKnownSymbol('match');

	defineWellKnownSymbol('replace');

	defineWellKnownSymbol('search');

	defineWellKnownSymbol('species');

	defineWellKnownSymbol('split');

	defineWellKnownSymbol('toPrimitive');

	defineWellKnownSymbol('toStringTag');

	defineWellKnownSymbol('unscopables');

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;
	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}
	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');
	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});
	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');
	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};
	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  concat: function concat(arg) {
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var min$2 = Math.min;
	var arrayCopyWithin = [].copyWithin || function copyWithin(target , start ) {
	  var O = toObject(this);
	  var len = toLength(O.length);
	  var to = toAbsoluteIndex(target, len);
	  var from = toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min$2((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else delete O[to];
	    to += inc;
	    from += inc;
	  } return O;
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	_export({ target: 'Array', proto: true }, {
	  copyWithin: arrayCopyWithin
	});
	addToUnscopables('copyWithin');

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var defineProperty$3 = Object.defineProperty;
	var cache = {};
	var thrower = function (it) { throw it; };
	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;
	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = { length: -1 };
	    if (ACCESSORS) defineProperty$3(O, 1, { enumerable: true, get: thrower });
	    else O[1] = 1;
	    method.call(O, argument0, argument1);
	  });
	};

	var $every = arrayIteration.every;
	var STRICT_METHOD = arrayMethodIsStrict('every');
	var USES_TO_LENGTH = arrayMethodUsesToLength('every');
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
	  every: function every(callbackfn ) {
	    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var arrayFill = function fill(value ) {
	  var O = toObject(this);
	  var length = toLength(O.length);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	_export({ target: 'Array', proto: true }, {
	  fill: arrayFill
	});
	addToUnscopables('fill');

	var $filter = arrayIteration.filter;
	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
	var USES_TO_LENGTH$1 = arrayMethodUsesToLength('filter');
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1 }, {
	  filter: function filter(callbackfn ) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $find = arrayIteration.find;
	var FIND = 'find';
	var SKIPS_HOLES = true;
	var USES_TO_LENGTH$2 = arrayMethodUsesToLength(FIND);
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$2 }, {
	  find: function find(callbackfn ) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	addToUnscopables(FIND);

	var $findIndex = arrayIteration.findIndex;
	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES$1 = true;
	var USES_TO_LENGTH$3 = arrayMethodUsesToLength(FIND_INDEX);
	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES$1 = false; });
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 || !USES_TO_LENGTH$3 }, {
	  findIndex: function findIndex(callbackfn ) {
	    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	addToUnscopables(FIND_INDEX);

	var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
	  var targetIndex = start;
	  var sourceIndex = 0;
	  var mapFn = mapper ? functionBindContext(mapper, thisArg, 3) : false;
	  var element;
	  while (sourceIndex < sourceLen) {
	    if (sourceIndex in source) {
	      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];
	      if (depth > 0 && isArray(element)) {
	        targetIndex = flattenIntoArray(target, original, element, toLength(element.length), targetIndex, depth - 1) - 1;
	      } else {
	        if (targetIndex >= 0x1FFFFFFFFFFFFF) throw TypeError('Exceed the acceptable array length');
	        target[targetIndex] = element;
	      }
	      targetIndex++;
	    }
	    sourceIndex++;
	  }
	  return targetIndex;
	};
	var flattenIntoArray_1 = flattenIntoArray;

	_export({ target: 'Array', proto: true }, {
	  flat: function flat() {
	    var depthArg = arguments.length ? arguments[0] : undefined;
	    var O = toObject(this);
	    var sourceLen = toLength(O.length);
	    var A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger(depthArg));
	    return A;
	  }
	});

	_export({ target: 'Array', proto: true }, {
	  flatMap: function flatMap(callbackfn ) {
	    var O = toObject(this);
	    var sourceLen = toLength(O.length);
	    var A;
	    aFunction$1(callbackfn);
	    A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray_1(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return A;
	  }
	});

	var $forEach$1 = arrayIteration.forEach;
	var STRICT_METHOD$1 = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('forEach');
	var arrayForEach = (!STRICT_METHOD$1 || !USES_TO_LENGTH$4) ? function forEach(callbackfn ) {
	  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterators = {};

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR] === it);
	};

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};
	test[TO_STRING_TAG$1] = 'z';
	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) {  }
	};
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	var ITERATOR$1 = wellKnownSymbol('iterator');
	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$1]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	var arrayFrom = function from(arrayLike ) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;
	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$2] = function () {
	    return this;
	  };
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) {  }
	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$2] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) {  }
	  return ITERATION_SUPPORT;
	};

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  Array.from(iterable);
	});
	_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: arrayFrom
	});

	var $includes = arrayIncludes.includes;
	var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
	_export({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$5 }, {
	  includes: function includes(el ) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	addToUnscopables('includes');

	var $indexOf = arrayIncludes.indexOf;
	var nativeIndexOf = [].indexOf;
	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD$2 = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$6 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
	_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$2 || !USES_TO_LENGTH$6 }, {
	  indexOf: function indexOf(searchElement ) {
	    return NEGATIVE_ZERO
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var correctPrototypeGetter = !fails(function () {
	  function F() {  }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype$1 = Object.prototype;
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype$1 : null;
	};

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;
	var returnThis = function () { return this; };
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;
	if ([].keys) {
	  arrayIterator = [].keys();
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}
	if (IteratorPrototype == undefined) IteratorPrototype = {};
	if ( !has(IteratorPrototype, ITERATOR$3)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR$3, returnThis);
	}
	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
	var returnThis$1 = function () { return this; };
	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) {  }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$4 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';
	var returnThis$2 = function () { return this; };
	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);
	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };
	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$4]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
	        }
	      }
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }
	  if ( IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$4, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }
	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated),
	    index: 0,
	    kind: kind
	  });
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');
	iterators.Arguments = iterators.Array;
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var nativeJoin = [].join;
	var ES3_STRINGS = indexedObject != Object;
	var STRICT_METHOD$3 = arrayMethodIsStrict('join', ',');
	_export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$3 }, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var min$3 = Math.min;
	var nativeLastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD$4 = arrayMethodIsStrict('lastIndexOf');
	var USES_TO_LENGTH$7 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
	var FORCED$1 = NEGATIVE_ZERO$1 || !STRICT_METHOD$4 || !USES_TO_LENGTH$7;
	var arrayLastIndexOf = FORCED$1 ? function lastIndexOf(searchElement ) {
	  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = toLength(O.length);
	  var index = length - 1;
	  if (arguments.length > 1) index = min$3(index, toInteger(arguments[1]));
	  if (index < 0) index = length + index;
	  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
	  return -1;
	} : nativeLastIndexOf;

	_export({ target: 'Array', proto: true, forced: arrayLastIndexOf !== [].lastIndexOf }, {
	  lastIndexOf: arrayLastIndexOf
	});

	var $map = arrayIteration.map;
	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('map');
	var USES_TO_LENGTH$8 = arrayMethodUsesToLength('map');
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$8 }, {
	  map: function map(callbackfn ) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var ISNT_GENERIC = fails(function () {
	  function F() {  }
	  return !(Array.of.call(F) instanceof F);
	});
	_export({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
	  of: function of() {
	    var index = 0;
	    var argumentsLength = arguments.length;
	    var result = new (typeof this == 'function' ? this : Array)(argumentsLength);
	    while (argumentsLength > index) createProperty(result, index, arguments[index++]);
	    result.length = argumentsLength;
	    return result;
	  }
	});

	var createMethod$2 = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aFunction$1(callbackfn);
	    var O = toObject(that);
	    var self = indexedObject(O);
	    var length = toLength(O.length);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw TypeError('Reduce of empty array with no initial value');
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};
	var arrayReduce = {
	  left: createMethod$2(false),
	  right: createMethod$2(true)
	};

	var $reduce = arrayReduce.left;
	var STRICT_METHOD$5 = arrayMethodIsStrict('reduce');
	var USES_TO_LENGTH$9 = arrayMethodUsesToLength('reduce', { 1: 0 });
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$5 || !USES_TO_LENGTH$9 }, {
	  reduce: function reduce(callbackfn ) {
	    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $reduceRight = arrayReduce.right;
	var STRICT_METHOD$6 = arrayMethodIsStrict('reduceRight');
	var USES_TO_LENGTH$a = arrayMethodUsesToLength('reduce', { 1: 0 });
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$6 || !USES_TO_LENGTH$a }, {
	  reduceRight: function reduceRight(callbackfn ) {
	    return $reduceRight(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$b = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });
	var SPECIES$2 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$b }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$2];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var $some = arrayIteration.some;
	var STRICT_METHOD$7 = arrayMethodIsStrict('some');
	var USES_TO_LENGTH$c = arrayMethodUsesToLength('some');
	_export({ target: 'Array', proto: true, forced: !STRICT_METHOD$7 || !USES_TO_LENGTH$c }, {
	  some: function some(callbackfn ) {
	    return $some(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var SPECIES$3 = wellKnownSymbol('species');
	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;
	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineProperty(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	setSpecies('Array');

	var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('splice');
	var USES_TO_LENGTH$d = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });
	var max$2 = Math.max;
	var min$4 = Math.min;
	var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$d }, {
	  splice: function splice(start, deleteCount ) {
	    var O = toObject(this);
	    var len = toLength(O.length);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$4(max$2(toInteger(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
	      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
	    }
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    O.length = len - actualDeleteCount + insertCount;
	    return A;
	  }
	});

	addToUnscopables('flat');

	addToUnscopables('flatMap');

	var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = toInteger(it);
	  var length = toLength(number);
	  if (number !== length) throw RangeError('Wrong length or index');
	  return length;
	};

	var Infinity$1 = 1 / 0;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor$1 = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;
	var pack = function (number, mantissaLength, bytes) {
	  var buffer = new Array(bytes);
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
	  var index = 0;
	  var exponent, mantissa, c;
	  number = abs(number);
	  if (number != number || number === Infinity$1) {
	    mantissa = number != number ? 1 : 0;
	    exponent = eMax;
	  } else {
	    exponent = floor$1(log(number) / LN2);
	    if (number * (c = pow(2, -exponent)) < 1) {
	      exponent--;
	      c *= 2;
	    }
	    if (exponent + eBias >= 1) {
	      number += rt / c;
	    } else {
	      number += rt * pow(2, 1 - eBias);
	    }
	    if (number * c >= 2) {
	      exponent++;
	      c /= 2;
	    }
	    if (exponent + eBias >= eMax) {
	      mantissa = 0;
	      exponent = eMax;
	    } else if (exponent + eBias >= 1) {
	      mantissa = (number * c - 1) * pow(2, mantissaLength);
	      exponent = exponent + eBias;
	    } else {
	      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
	      exponent = 0;
	    }
	  }
	  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;
	  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
	  buffer[--index] |= sign * 128;
	  return buffer;
	};
	var unpack = function (buffer, mantissaLength) {
	  var bytes = buffer.length;
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var nBits = exponentLength - 7;
	  var index = bytes - 1;
	  var sign = buffer[index--];
	  var exponent = sign & 127;
	  var mantissa;
	  sign >>= 7;
	  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;
	  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
	  if (exponent === 0) {
	    exponent = 1 - eBias;
	  } else if (exponent === eMax) {
	    return mantissa ? NaN : sign ? -Infinity$1 : Infinity$1;
	  } else {
	    mantissa = mantissa + pow(2, mantissaLength);
	    exponent = exponent - eBias;
	  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
	};
	var ieee754 = {
	  pack: pack,
	  unpack: unpack
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var defineProperty$4 = objectDefineProperty.f;
	var getInternalState$2 = internalState.get;
	var setInternalState$2 = internalState.set;
	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE$2 = 'prototype';
	var WRONG_LENGTH = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var NativeArrayBuffer = global_1[ARRAY_BUFFER];
	var $ArrayBuffer = NativeArrayBuffer;
	var $DataView = global_1[DATA_VIEW];
	var $DataViewPrototype = $DataView && $DataView[PROTOTYPE$2];
	var ObjectPrototype$2 = Object.prototype;
	var RangeError$1 = global_1.RangeError;
	var packIEEE754 = ieee754.pack;
	var unpackIEEE754 = ieee754.unpack;
	var packInt8 = function (number) {
	  return [number & 0xFF];
	};
	var packInt16 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF];
	};
	var packInt32 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
	};
	var unpackInt32 = function (buffer) {
	  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
	};
	var packFloat32 = function (number) {
	  return packIEEE754(number, 23, 4);
	};
	var packFloat64 = function (number) {
	  return packIEEE754(number, 52, 8);
	};
	var addGetter = function (Constructor, key) {
	  defineProperty$4(Constructor[PROTOTYPE$2], key, { get: function () { return getInternalState$2(this)[key]; } });
	};
	var get$1 = function (view, count, index, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$2(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$2(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = bytes.slice(start, start + count);
	  return isLittleEndian ? pack : pack.reverse();
	};
	var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
	  var intIndex = toIndex(index);
	  var store = getInternalState$2(view);
	  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
	  var bytes = getInternalState$2(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = conversion(+value);
	  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
	};
	if (!arrayBufferNative) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
	    var byteLength = toIndex(length);
	    setInternalState$2(this, {
	      bytes: arrayFill.call(new Array(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!descriptors) this.byteLength = byteLength;
	  };
	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance(this, $DataView, DATA_VIEW);
	    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
	    var bufferLength = getInternalState$2(buffer).byteLength;
	    var offset = toInteger(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
	    setInternalState$2(this, {
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset
	    });
	    if (!descriptors) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };
	  if (descriptors) {
	    addGetter($ArrayBuffer, 'byteLength');
	    addGetter($DataView, 'buffer');
	    addGetter($DataView, 'byteLength');
	    addGetter($DataView, 'byteOffset');
	  }
	  redefineAll($DataView[PROTOTYPE$2], {
	    getInt8: function getInt8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get$1(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset ) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset ) {
	      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset ) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
	    },
	    getUint32: function getUint32(byteOffset ) {
	      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset ) {
	      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
	    },
	    getFloat64: function getFloat64(byteOffset ) {
	      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set$1(this, 1, byteOffset, packInt8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set$1(this, 1, byteOffset, packInt8, value);
	    },
	    setInt16: function setInt16(byteOffset, value ) {
	      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint16: function setUint16(byteOffset, value ) {
	      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setInt32: function setInt32(byteOffset, value ) {
	      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setUint32: function setUint32(byteOffset, value ) {
	      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat32: function setFloat32(byteOffset, value ) {
	      set$1(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
	    },
	    setFloat64: function setFloat64(byteOffset, value ) {
	      set$1(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
	    }
	  });
	} else {
	  if (!fails(function () {
	    NativeArrayBuffer(1);
	  }) || !fails(function () {
	    new NativeArrayBuffer(-1);
	  }) || fails(function () {
	    new NativeArrayBuffer();
	    new NativeArrayBuffer(1.5);
	    new NativeArrayBuffer(NaN);
	    return NativeArrayBuffer.name != ARRAY_BUFFER;
	  })) {
	    $ArrayBuffer = function ArrayBuffer(length) {
	      anInstance(this, $ArrayBuffer);
	      return new NativeArrayBuffer(toIndex(length));
	    };
	    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$2] = NativeArrayBuffer[PROTOTYPE$2];
	    for (var keys$1 = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys$1.length > j;) {
	      if (!((key = keys$1[j++]) in $ArrayBuffer)) {
	        createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer[key]);
	      }
	    }
	    ArrayBufferPrototype.constructor = $ArrayBuffer;
	  }
	  if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype$2) {
	    objectSetPrototypeOf($DataViewPrototype, ObjectPrototype$2);
	  }
	  var testView = new $DataView(new $ArrayBuffer(2));
	  var nativeSetInt8 = $DataViewPrototype.setInt8;
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
	    setInt8: function setInt8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
	    }
	  }, { unsafe: true });
	}
	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);
	var arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer,
	  DataView: $DataView
	};

	var ARRAY_BUFFER$1 = 'ArrayBuffer';
	var ArrayBuffer$1 = arrayBuffer[ARRAY_BUFFER$1];
	var NativeArrayBuffer$1 = global_1[ARRAY_BUFFER$1];
	_export({ global: true, forced: NativeArrayBuffer$1 !== ArrayBuffer$1 }, {
	  ArrayBuffer: ArrayBuffer$1
	});
	setSpecies(ARRAY_BUFFER$1);

	var dateToPrimitive = function (hint) {
	  if (hint !== 'string' && hint !== 'number' && hint !== 'default') {
	    throw TypeError('Incorrect hint');
	  } return toPrimitive(anObject(this), hint !== 'number');
	};

	var TO_PRIMITIVE$1 = wellKnownSymbol('toPrimitive');
	var DatePrototype = Date.prototype;
	if (!(TO_PRIMITIVE$1 in DatePrototype)) {
	  createNonEnumerableProperty(DatePrototype, TO_PRIMITIVE$1, dateToPrimitive);
	}

	var HAS_INSTANCE = wellKnownSymbol('hasInstance');
	var FunctionPrototype = Function.prototype;
	if (!(HAS_INSTANCE in FunctionPrototype)) {
	  objectDefineProperty.f(FunctionPrototype, HAS_INSTANCE, { value: function (O) {
	    if (typeof this != 'function' || !isObject(O)) return false;
	    if (!isObject(this.prototype)) return O instanceof this;
	    while (O = objectGetPrototypeOf(O)) if (this.prototype === O) return true;
	    return false;
	  } });
	}

	var defineProperty$5 = objectDefineProperty.f;
	var FunctionPrototype$1 = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype$1.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name';
	if (descriptors && !(NAME in FunctionPrototype$1)) {
	  defineProperty$5(FunctionPrototype$1, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	setToStringTag(global_1.JSON, 'JSON', true);

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	var defineProperty = objectDefineProperty.f;
	var METADATA = uid('meta');
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + ++id,
	    weakData: {}
	  } });
	};
	var fastKey = function (it, create) {
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, METADATA)) {
	    if (!isExtensible(it)) return 'F';
	    if (!create) return 'E';
	    setMetadata(it);
	  } return it[METADATA].objectID;
	};
	var getWeakData = function (it, create) {
	  if (!has(it, METADATA)) {
	    if (!isExtensible(it)) return true;
	    if (!create) return false;
	    setMetadata(it);
	  } return it[METADATA].weakData;
	};
	var onFreeze = function (it) {
	  if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	  return it;
	};
	var meta = module.exports = {
	  REQUIRED: false,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};
	hiddenKeys[METADATA] = true;
	});

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};
	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;
	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }
	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};
	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    objectSetPrototypeOf &&
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};
	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY,
	      KEY == 'add' ? function add(value) {
	        nativeMethod.call(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY == 'delete' ? function (key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'get' ? function get(key) {
	        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'has' ? function has(key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        nativeMethod.call(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };
	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });
	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }
	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }
	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }
	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, forced: Constructor != NativeConstructor }, exported);
	  setToStringTag(Constructor, CONSTRUCTOR_NAME);
	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);
	  return Constructor;
	};

	var defineProperty$6 = objectDefineProperty.f;
	var fastKey = internalMetadata.fastKey;
	var setInternalState$3 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;
	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$3(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });
	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      if (entry) {
	        entry.value = value;
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;
	        else that.size++;
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };
	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };
	    redefineAll(C.prototype, {
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }
	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;
	        else that.size = 0;
	      },
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      forEach: function forEach(callbackfn ) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });
	    redefineAll(C.prototype, IS_MAP ? {
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$6(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$3(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      while (entry && entry.removed) entry = entry.previous;
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        state.target = undefined;
	        return { value: undefined, done: true };
	      }
	      if (kind == 'keys') return { value: entry.key, done: false };
	      if (kind == 'values') return { value: entry.value, done: false };
	      return { value: [entry.key, entry.value], done: false };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	var es_map = collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var log$1 = Math.log;
	var mathLog1p = Math.log1p || function log1p(x) {
	  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log$1(1 + x);
	};

	var nativeAcosh = Math.acosh;
	var log$2 = Math.log;
	var sqrt = Math.sqrt;
	var LN2$1 = Math.LN2;
	var FORCED$2 = !nativeAcosh
	  || Math.floor(nativeAcosh(Number.MAX_VALUE)) != 710
	  || nativeAcosh(Infinity) != Infinity;
	_export({ target: 'Math', stat: true, forced: FORCED$2 }, {
	  acosh: function acosh(x) {
	    return (x = +x) < 1 ? NaN : x > 94906265.62425156
	      ? log$2(x) + LN2$1
	      : mathLog1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
	  }
	});

	var nativeAsinh = Math.asinh;
	var log$3 = Math.log;
	var sqrt$1 = Math.sqrt;
	function asinh(x) {
	  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log$3(x + sqrt$1(x * x + 1));
	}
	_export({ target: 'Math', stat: true, forced: !(nativeAsinh && 1 / nativeAsinh(0) > 0) }, {
	  asinh: asinh
	});

	var nativeAtanh = Math.atanh;
	var log$4 = Math.log;
	_export({ target: 'Math', stat: true, forced: !(nativeAtanh && 1 / nativeAtanh(-0) < 0) }, {
	  atanh: function atanh(x) {
	    return (x = +x) == 0 ? x : log$4((1 + x) / (1 - x)) / 2;
	  }
	});

	var mathSign = Math.sign || function sign(x) {
	  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
	};

	var abs$1 = Math.abs;
	var pow$1 = Math.pow;
	_export({ target: 'Math', stat: true }, {
	  cbrt: function cbrt(x) {
	    return mathSign(x = +x) * pow$1(abs$1(x), 1 / 3);
	  }
	});

	var floor$2 = Math.floor;
	var log$5 = Math.log;
	var LOG2E = Math.LOG2E;
	_export({ target: 'Math', stat: true }, {
	  clz32: function clz32(x) {
	    return (x >>>= 0) ? 31 - floor$2(log$5(x + 0.5) * LOG2E) : 32;
	  }
	});

	var nativeExpm1 = Math.expm1;
	var exp = Math.exp;
	var mathExpm1 = (!nativeExpm1
	  || nativeExpm1(10) > 22025.465794806719 || nativeExpm1(10) < 22025.4657948067165168
	  || nativeExpm1(-2e-17) != -2e-17
	) ? function expm1(x) {
	  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
	} : nativeExpm1;

	var nativeCosh = Math.cosh;
	var abs$2 = Math.abs;
	var E = Math.E;
	_export({ target: 'Math', stat: true, forced: !nativeCosh || nativeCosh(710) === Infinity }, {
	  cosh: function cosh(x) {
	    var t = mathExpm1(abs$2(x) - 1) + 1;
	    return (t + 1 / (t * E * E)) * (E / 2);
	  }
	});

	_export({ target: 'Math', stat: true, forced: mathExpm1 != Math.expm1 }, { expm1: mathExpm1 });

	var abs$3 = Math.abs;
	var pow$2 = Math.pow;
	var EPSILON = pow$2(2, -52);
	var EPSILON32 = pow$2(2, -23);
	var MAX32 = pow$2(2, 127) * (2 - EPSILON32);
	var MIN32 = pow$2(2, -126);
	var roundTiesToEven = function (n) {
	  return n + 1 / EPSILON - 1 / EPSILON;
	};
	var mathFround = Math.fround || function fround(x) {
	  var $abs = abs$3(x);
	  var $sign = mathSign(x);
	  var a, result;
	  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
	  a = (1 + EPSILON32 / EPSILON) * $abs;
	  result = a - (a - $abs);
	  if (result > MAX32 || result != result) return $sign * Infinity;
	  return $sign * result;
	};

	_export({ target: 'Math', stat: true }, { fround: mathFround });

	var $hypot = Math.hypot;
	var abs$4 = Math.abs;
	var sqrt$2 = Math.sqrt;
	var BUGGY = !!$hypot && $hypot(Infinity, NaN) !== Infinity;
	_export({ target: 'Math', stat: true, forced: BUGGY }, {
	  hypot: function hypot(value1, value2) {
	    var sum = 0;
	    var i = 0;
	    var aLen = arguments.length;
	    var larg = 0;
	    var arg, div;
	    while (i < aLen) {
	      arg = abs$4(arguments[i++]);
	      if (larg < arg) {
	        div = larg / arg;
	        sum = sum * div * div + 1;
	        larg = arg;
	      } else if (arg > 0) {
	        div = arg / larg;
	        sum += div * div;
	      } else sum += arg;
	    }
	    return larg === Infinity ? Infinity : larg * sqrt$2(sum);
	  }
	});

	var nativeImul = Math.imul;
	var FORCED$3 = fails(function () {
	  return nativeImul(0xFFFFFFFF, 5) != -5 || nativeImul.length != 2;
	});
	_export({ target: 'Math', stat: true, forced: FORCED$3 }, {
	  imul: function imul(x, y) {
	    var UINT16 = 0xFFFF;
	    var xn = +x;
	    var yn = +y;
	    var xl = UINT16 & xn;
	    var yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});

	var log$6 = Math.log;
	var LOG10E = Math.LOG10E;
	_export({ target: 'Math', stat: true }, {
	  log10: function log10(x) {
	    return log$6(x) * LOG10E;
	  }
	});

	_export({ target: 'Math', stat: true }, { log1p: mathLog1p });

	var log$7 = Math.log;
	var LN2$2 = Math.LN2;
	_export({ target: 'Math', stat: true }, {
	  log2: function log2(x) {
	    return log$7(x) / LN2$2;
	  }
	});

	_export({ target: 'Math', stat: true }, {
	  sign: mathSign
	});

	var abs$5 = Math.abs;
	var exp$1 = Math.exp;
	var E$1 = Math.E;
	var FORCED$4 = fails(function () {
	  return Math.sinh(-2e-17) != -2e-17;
	});
	_export({ target: 'Math', stat: true, forced: FORCED$4 }, {
	  sinh: function sinh(x) {
	    return abs$5(x = +x) < 1 ? (mathExpm1(x) - mathExpm1(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (E$1 / 2);
	  }
	});

	var exp$2 = Math.exp;
	_export({ target: 'Math', stat: true }, {
	  tanh: function tanh(x) {
	    var a = mathExpm1(x = +x);
	    var b = mathExpm1(-x);
	    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
	  }
	});

	setToStringTag(Math, 'Math', true);

	var ceil$1 = Math.ceil;
	var floor$3 = Math.floor;
	_export({ target: 'Math', stat: true }, {
	  trunc: function trunc(it) {
	    return (it > 0 ? floor$3 : ceil$1)(it);
	  }
	});

	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$');
	var createMethod$3 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};
	var stringTrim = {
	  start: createMethod$3(1),
	  end: createMethod$3(2),
	  trim: createMethod$3(3)
	};

	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$7 = objectDefineProperty.f;
	var trim = stringTrim.trim;
	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN;
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break;
	        case 79: case 111: radix = 8; maxCode = 55; break;
	        default: return +it;
	      }
	      digits = it.slice(2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index);
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};
	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper
	      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
	        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };
	  for (var keys$2 = descriptors ? getOwnPropertyNames$1(NativeNumber) : (
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j$1 = 0, key$1; keys$2.length > j$1; j$1++) {
	    if (has(NativeNumber, key$1 = keys$2[j$1]) && !has(NumberWrapper, key$1)) {
	      defineProperty$7(NumberWrapper, key$1, getOwnPropertyDescriptor$2(NativeNumber, key$1));
	    }
	  }
	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	_export({ target: 'Number', stat: true }, {
	  EPSILON: Math.pow(2, -52)
	});

	var globalIsFinite = global_1.isFinite;
	var numberIsFinite = Number.isFinite || function isFinite(it) {
	  return typeof it == 'number' && globalIsFinite(it);
	};

	_export({ target: 'Number', stat: true }, { isFinite: numberIsFinite });

	var floor$4 = Math.floor;
	var isInteger = function isInteger(it) {
	  return !isObject(it) && isFinite(it) && floor$4(it) === it;
	};

	_export({ target: 'Number', stat: true }, {
	  isInteger: isInteger
	});

	_export({ target: 'Number', stat: true }, {
	  isNaN: function isNaN(number) {
	    return number != number;
	  }
	});

	var abs$6 = Math.abs;
	_export({ target: 'Number', stat: true }, {
	  isSafeInteger: function isSafeInteger(number) {
	    return isInteger(number) && abs$6(number) <= 0x1FFFFFFFFFFFFF;
	  }
	});

	_export({ target: 'Number', stat: true }, {
	  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
	});

	_export({ target: 'Number', stat: true }, {
	  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
	});

	var trim$1 = stringTrim.trim;
	var $parseFloat = global_1.parseFloat;
	var FORCED$5 = 1 / $parseFloat(whitespaces + '-0') !== -Infinity;
	var numberParseFloat = FORCED$5 ? function parseFloat(string) {
	  var trimmedString = trim$1(String(string));
	  var result = $parseFloat(trimmedString);
	  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
	} : $parseFloat;

	_export({ target: 'Number', stat: true, forced: Number.parseFloat != numberParseFloat }, {
	  parseFloat: numberParseFloat
	});

	var trim$2 = stringTrim.trim;
	var $parseInt = global_1.parseInt;
	var hex = /^[+-]?0[Xx]/;
	var FORCED$6 = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22;
	var numberParseInt = FORCED$6 ? function parseInt(string, radix) {
	  var S = trim$2(String(string));
	  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
	} : $parseInt;

	_export({ target: 'Number', stat: true, forced: Number.parseInt != numberParseInt }, {
	  parseInt: numberParseInt
	});

	var thisNumberValue = function (value) {
	  if (typeof value != 'number' && classofRaw(value) != 'Number') {
	    throw TypeError('Incorrect invocation');
	  }
	  return +value;
	};

	var stringRepeat = ''.repeat || function repeat(count) {
	  var str = String(requireObjectCoercible(this));
	  var result = '';
	  var n = toInteger(count);
	  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
	  return result;
	};

	var nativeToFixed = 1.0.toFixed;
	var floor$5 = Math.floor;
	var pow$3 = function (x, n, acc) {
	  return n === 0 ? acc : n % 2 === 1 ? pow$3(x, n - 1, acc * x) : pow$3(x * x, n / 2, acc);
	};
	var log$8 = function (x) {
	  var n = 0;
	  var x2 = x;
	  while (x2 >= 4096) {
	    n += 12;
	    x2 /= 4096;
	  }
	  while (x2 >= 2) {
	    n += 1;
	    x2 /= 2;
	  } return n;
	};
	var FORCED$7 = nativeToFixed && (
	  0.00008.toFixed(3) !== '0.000' ||
	  0.9.toFixed(0) !== '1' ||
	  1.255.toFixed(2) !== '1.25' ||
	  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
	) || !fails(function () {
	  nativeToFixed.call({});
	});
	_export({ target: 'Number', proto: true, forced: FORCED$7 }, {
	  toFixed: function toFixed(fractionDigits) {
	    var number = thisNumberValue(this);
	    var fractDigits = toInteger(fractionDigits);
	    var data = [0, 0, 0, 0, 0, 0];
	    var sign = '';
	    var result = '0';
	    var e, z, j, k;
	    var multiply = function (n, c) {
	      var index = -1;
	      var c2 = c;
	      while (++index < 6) {
	        c2 += n * data[index];
	        data[index] = c2 % 1e7;
	        c2 = floor$5(c2 / 1e7);
	      }
	    };
	    var divide = function (n) {
	      var index = 6;
	      var c = 0;
	      while (--index >= 0) {
	        c += data[index];
	        data[index] = floor$5(c / n);
	        c = (c % n) * 1e7;
	      }
	    };
	    var dataToString = function () {
	      var index = 6;
	      var s = '';
	      while (--index >= 0) {
	        if (s !== '' || index === 0 || data[index] !== 0) {
	          var t = String(data[index]);
	          s = s === '' ? t : s + stringRepeat.call('0', 7 - t.length) + t;
	        }
	      } return s;
	    };
	    if (fractDigits < 0 || fractDigits > 20) throw RangeError('Incorrect fraction digits');
	    if (number != number) return 'NaN';
	    if (number <= -1e21 || number >= 1e21) return String(number);
	    if (number < 0) {
	      sign = '-';
	      number = -number;
	    }
	    if (number > 1e-21) {
	      e = log$8(number * pow$3(2, 69, 1)) - 69;
	      z = e < 0 ? number * pow$3(2, -e, 1) : number / pow$3(2, e, 1);
	      z *= 0x10000000000000;
	      e = 52 - e;
	      if (e > 0) {
	        multiply(0, z);
	        j = fractDigits;
	        while (j >= 7) {
	          multiply(1e7, 0);
	          j -= 7;
	        }
	        multiply(pow$3(10, j, 1), 0);
	        j = e - 1;
	        while (j >= 23) {
	          divide(1 << 23);
	          j -= 23;
	        }
	        divide(1 << j);
	        multiply(1, 1);
	        divide(2);
	        result = dataToString();
	      } else {
	        multiply(0, z);
	        multiply(1 << -e, 0);
	        result = dataToString() + stringRepeat.call('0', fractDigits);
	      }
	    }
	    if (fractDigits > 0) {
	      k = result.length;
	      result = sign + (k <= fractDigits
	        ? '0.' + stringRepeat.call('0', fractDigits - k) + result
	        : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
	    } else {
	      result = sign + result;
	    } return result;
	  }
	});

	var nativeAssign = Object.assign;
	var defineProperty$8 = Object.defineProperty;
	var objectAssign = !nativeAssign || fails(function () {
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$8({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$8(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  var A = {};
	  var B = {};
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) {
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	var objectPrototypeAccessorsForced =  !fails(function () {
	  var key = Math.random();
	  __defineSetter__.call(null, key, function () {  });
	  delete global_1[key];
	});

	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __defineGetter__: function __defineGetter__(P, getter) {
	      objectDefineProperty.f(toObject(this), P, { get: aFunction$1(getter), enumerable: true, configurable: true });
	    }
	  });
	}

	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __defineSetter__: function __defineSetter__(P, setter) {
	      objectDefineProperty.f(toObject(this), P, { set: aFunction$1(setter), enumerable: true, configurable: true });
	    }
	  });
	}

	var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	var createMethod$4 = function (TO_ENTRIES) {
	  return function (it) {
	    var O = toIndexedObject(it);
	    var keys = objectKeys(O);
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) {
	      key = keys[i++];
	      if (!descriptors || propertyIsEnumerable.call(O, key)) {
	        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
	      }
	    }
	    return result;
	  };
	};
	var objectToArray = {
	  entries: createMethod$4(true),
	  values: createMethod$4(false)
	};

	var $entries = objectToArray.entries;
	_export({ target: 'Object', stat: true }, {
	  entries: function entries(O) {
	    return $entries(O);
	  }
	});

	var onFreeze = internalMetadata.onFreeze;
	var nativeFreeze = Object.freeze;
	var FAILS_ON_PRIMITIVES = fails(function () { nativeFreeze(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !freezing }, {
	  freeze: function freeze(it) {
	    return nativeFreeze && isObject(it) ? nativeFreeze(onFreeze(it)) : it;
	  }
	});

	_export({ target: 'Object', stat: true }, {
	  fromEntries: function fromEntries(iterable) {
	    var obj = {};
	    iterate_1(iterable, function (k, v) {
	      createProperty(obj, k, v);
	    }, undefined, true);
	    return obj;
	  }
	});

	var nativeGetOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var FAILS_ON_PRIMITIVES$1 = fails(function () { nativeGetOwnPropertyDescriptor$2(1); });
	var FORCED$8 = !descriptors || FAILS_ON_PRIMITIVES$1;
	_export({ target: 'Object', stat: true, forced: FORCED$8, sham: !descriptors }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
	    return nativeGetOwnPropertyDescriptor$2(toIndexedObject(it), key);
	  }
	});

	_export({ target: 'Object', stat: true, sham: !descriptors }, {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = toIndexedObject(object);
	    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	    var keys = ownKeys(O);
	    var result = {};
	    var index = 0;
	    var key, descriptor;
	    while (keys.length > index) {
	      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
	      if (descriptor !== undefined) createProperty(result, key, descriptor);
	    }
	    return result;
	  }
	});

	var nativeGetOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;
	var FAILS_ON_PRIMITIVES$2 = fails(function () { return !Object.getOwnPropertyNames(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
	  getOwnPropertyNames: nativeGetOwnPropertyNames$2
	});

	var FAILS_ON_PRIMITIVES$3 = fails(function () { objectGetPrototypeOf(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return objectGetPrototypeOf(toObject(it));
	  }
	});

	var sameValue = Object.is || function is(x, y) {
	  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
	};

	_export({ target: 'Object', stat: true }, {
	  is: sameValue
	});

	var nativeIsExtensible = Object.isExtensible;
	var FAILS_ON_PRIMITIVES$4 = fails(function () { nativeIsExtensible(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
	  isExtensible: function isExtensible(it) {
	    return isObject(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
	  }
	});

	var nativeIsFrozen = Object.isFrozen;
	var FAILS_ON_PRIMITIVES$5 = fails(function () { nativeIsFrozen(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5 }, {
	  isFrozen: function isFrozen(it) {
	    return isObject(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
	  }
	});

	var nativeIsSealed = Object.isSealed;
	var FAILS_ON_PRIMITIVES$6 = fails(function () { nativeIsSealed(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$6 }, {
	  isSealed: function isSealed(it) {
	    return isObject(it) ? nativeIsSealed ? nativeIsSealed(it) : false : true;
	  }
	});

	var FAILS_ON_PRIMITIVES$7 = fails(function () { objectKeys(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$7 }, {
	  keys: function keys(it) {
	    return objectKeys(toObject(it));
	  }
	});

	var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __lookupGetter__: function __lookupGetter__(P) {
	      var O = toObject(this);
	      var key = toPrimitive(P, true);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor$3(O, key)) return desc.get;
	      } while (O = objectGetPrototypeOf(O));
	    }
	  });
	}

	var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
	if (descriptors) {
	  _export({ target: 'Object', proto: true, forced: objectPrototypeAccessorsForced }, {
	    __lookupSetter__: function __lookupSetter__(P) {
	      var O = toObject(this);
	      var key = toPrimitive(P, true);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor$4(O, key)) return desc.set;
	      } while (O = objectGetPrototypeOf(O));
	    }
	  });
	}

	var onFreeze$1 = internalMetadata.onFreeze;
	var nativePreventExtensions = Object.preventExtensions;
	var FAILS_ON_PRIMITIVES$8 = fails(function () { nativePreventExtensions(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$8, sham: !freezing }, {
	  preventExtensions: function preventExtensions(it) {
	    return nativePreventExtensions && isObject(it) ? nativePreventExtensions(onFreeze$1(it)) : it;
	  }
	});

	var onFreeze$2 = internalMetadata.onFreeze;
	var nativeSeal = Object.seal;
	var FAILS_ON_PRIMITIVES$9 = fails(function () { nativeSeal(1); });
	_export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$9, sham: !freezing }, {
	  seal: function seal(it) {
	    return nativeSeal && isObject(it) ? nativeSeal(onFreeze$2(it)) : it;
	  }
	});

	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	var $values = objectToArray.values;
	_export({ target: 'Object', stat: true }, {
	  values: function values(O) {
	    return $values(O);
	  }
	});

	var nativePromiseConstructor = global_1.Promise;

	var SPECIES$4 = wellKnownSymbol('species');
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

	var location = global_1.location;
	var set$2 = global_1.setImmediate;
	var clear = global_1.clearImmediate;
	var process$1 = global_1.process;
	var MessageChannel = global_1.MessageChannel;
	var Dispatch = global_1.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function (id) {
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};
	var listener = function (event) {
	  run(event.data);
	};
	var post = function (id) {
	  global_1.postMessage(id + '', location.protocol + '//' + location.host);
	};
	if (!set$2 || !clear) {
	  set$2 = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  if (classofRaw(process$1) == 'process') {
	    defer = function (id) {
	      process$1.nextTick(runner(id));
	    };
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  } else if (MessageChannel && !engineIsIos) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = functionBindContext(port.postMessage, port, 1);
	  } else if (
	    global_1.addEventListener &&
	    typeof postMessage == 'function' &&
	    !global_1.importScripts &&
	    !fails(post) &&
	    location.protocol !== 'file:'
	  ) {
	    defer = post;
	    global_1.addEventListener('message', listener, false);
	  } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
	    defer = function (id) {
	      html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}
	var task = {
	  set: set$2,
	  clear: clear
	};

	var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;
	var macrotask = task.set;
	var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
	var process$2 = global_1.process;
	var Promise$1 = global_1.Promise;
	var IS_NODE = classofRaw(process$2) == 'process';
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor$5(global_1, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;
	var flush, head, last, notify, toggle, node, promise, then;
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process$2.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (error) {
	        if (head) notify();
	        else last = undefined;
	        throw error;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };
	  if (IS_NODE) {
	    notify = function () {
	      process$2.nextTick(flush);
	    };
	  } else if (MutationObserver && !engineIsIos) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  } else if (Promise$1 && Promise$1.resolve) {
	    promise = Promise$1.resolve(undefined);
	    then = promise.then;
	    notify = function () {
	      then.call(promise, flush);
	    };
	  } else {
	    notify = function () {
	      macrotask.call(global_1, flush);
	    };
	  }
	}
	var microtask = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) last.next = task;
	  if (!head) {
	    head = task;
	    notify();
	  } last = task;
	};

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction$1(resolve);
	  this.reject = aFunction$1(reject);
	};
	var f$7 = function (C) {
	  return new PromiseCapability(C);
	};
	var newPromiseCapability = {
		f: f$7
	};

	var promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var hostReportErrors = function (a, b) {
	  var console = global_1.console;
	  if (console && console.error) {
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var task$1 = task.set;
	var SPECIES$5 = wellKnownSymbol('species');
	var PROMISE = 'Promise';
	var getInternalState$3 = internalState.get;
	var setInternalState$4 = internalState.set;
	var getInternalPromiseState = internalState.getterFor(PROMISE);
	var PromiseConstructor = nativePromiseConstructor;
	var TypeError$1 = global_1.TypeError;
	var document$2 = global_1.document;
	var process$3 = global_1.process;
	var $fetch = getBuiltIn('fetch');
	var newPromiseCapability$1 = newPromiseCapability.f;
	var newGenericPromiseCapability = newPromiseCapability$1;
	var IS_NODE$1 = classofRaw(process$3) == 'process';
	var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;
	var FORCED$9 = isForced_1(PROMISE, function () {
	  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
	  if (!GLOBAL_CORE_JS_PROMISE) {
	    if (engineV8Version === 66) return true;
	    if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
	  }
	  if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
	  var promise = PromiseConstructor.resolve(1);
	  var FakePromise = function (exec) {
	    exec(function () {  }, function () {  });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$5] = FakePromise;
	  return !(promise.then(function () {  }) instanceof FakePromise);
	});
	var INCORRECT_ITERATION$1 = FORCED$9 || !checkCorrectnessOfIteration(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () {  });
	});
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify$1 = function (promise, state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  var chain = state.reactions;
	  microtask(function () {
	    var value = state.value;
	    var ok = state.state == FULFILLED;
	    var index = 0;
	    while (chain.length > index) {
	      var reaction = chain[index++];
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
	            state.rejection = HANDLED;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value);
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (error) {
	        if (domain && !exited) domain.exit();
	        reject(error);
	      }
	    }
	    state.reactions = [];
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(promise, state);
	  });
	};
	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document$2.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    global_1.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (handler = global_1['on' + name]) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};
	var onUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE$1) {
	          process$3.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};
	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};
	var onHandleUnhandled = function (promise, state) {
	  task$1.call(global_1, function () {
	    if (IS_NODE$1) {
	      process$3.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};
	var bind = function (fn, promise, state, unwrap) {
	  return function (value) {
	    fn(promise, state, value, unwrap);
	  };
	};
	var internalReject = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify$1(promise, state, true);
	};
	var internalResolve = function (promise, state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          then.call(value,
	            bind(internalResolve, promise, wrapper, state),
	            bind(internalReject, promise, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(promise, wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify$1(promise, state, false);
	    }
	  } catch (error) {
	    internalReject(promise, { done: false }, error, state);
	  }
	};
	if (FORCED$9) {
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromiseConstructor, PROMISE);
	    aFunction$1(executor);
	    Internal.call(this);
	    var state = getInternalState$3(this);
	    try {
	      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
	    } catch (error) {
	      internalReject(this, state, error);
	    }
	  };
	  Internal = function Promise(executor) {
	    setInternalState$4(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: [],
	      rejection: false,
	      state: PENDING,
	      value: undefined
	    });
	  };
	  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
	      state.parent = true;
	      state.reactions.push(reaction);
	      if (state.state != PENDING) notify$1(this, state, false);
	      return reaction.promise;
	    },
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalState$3(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, promise, state);
	    this.reject = bind(internalReject, promise, state);
	  };
	  newPromiseCapability.f = newPromiseCapability$1 = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	  if ( typeof nativePromiseConstructor == 'function') {
	    nativeThen = nativePromiseConstructor.prototype.then;
	    redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
	      var that = this;
	      return new PromiseConstructor(function (resolve, reject) {
	        nativeThen.call(that, resolve, reject);
	      }).then(onFulfilled, onRejected);
	    }, { unsafe: true });
	    if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
	      fetch: function fetch(input ) {
	        return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
	      }
	    });
	  }
	}
	_export({ global: true, wrap: true, forced: FORCED$9 }, {
	  Promise: PromiseConstructor
	});
	setToStringTag(PromiseConstructor, PROMISE, false);
	setSpecies(PROMISE);
	PromiseWrapper = getBuiltIn(PROMISE);
	_export({ target: PROMISE, stat: true, forced: FORCED$9 }, {
	  reject: function reject(r) {
	    var capability = newPromiseCapability$1(this);
	    capability.reject.call(undefined, r);
	    return capability.promise;
	  }
	});
	_export({ target: PROMISE, stat: true, forced:  FORCED$9 }, {
	  resolve: function resolve(x) {
	    return promiseResolve( this, x);
	  }
	});
	_export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate_1(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        $promiseResolve.call(C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  },
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability$1(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aFunction$1(C.resolve);
	      iterate_1(iterable, function (promise) {
	        $promiseResolve.call(C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});

	var NON_GENERIC = !!nativePromiseConstructor && fails(function () {
	  nativePromiseConstructor.prototype['finally'].call({ then: function () {  } }, function () {  });
	});
	_export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
	  'finally': function (onFinally) {
	    var C = speciesConstructor(this, getBuiltIn('Promise'));
	    var isFunction = typeof onFinally == 'function';
	    return this.then(
	      isFunction ? function (x) {
	        return promiseResolve(C, onFinally()).then(function () { return x; });
	      } : onFinally,
	      isFunction ? function (e) {
	        return promiseResolve(C, onFinally()).then(function () { throw e; });
	      } : onFinally
	    );
	  }
	});
	if ( typeof nativePromiseConstructor == 'function' && !nativePromiseConstructor.prototype['finally']) {
	  redefine(nativePromiseConstructor.prototype, 'finally', getBuiltIn('Promise').prototype['finally']);
	}

	var nativeApply = getBuiltIn('Reflect', 'apply');
	var functionApply = Function.apply;
	var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
	  nativeApply(function () {  });
	});
	_export({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
	  apply: function apply(target, thisArgument, argumentsList) {
	    aFunction$1(target);
	    anObject(argumentsList);
	    return nativeApply
	      ? nativeApply(target, thisArgument, argumentsList)
	      : functionApply.call(target, thisArgument, argumentsList);
	  }
	});

	var slice = [].slice;
	var factories = {};
	var construct = function (C, argsLength, args) {
	  if (!(argsLength in factories)) {
	    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
	  } return factories[argsLength](C, args);
	};
	var functionBind = Function.bind || function bind(that ) {
	  var fn = aFunction$1(this);
	  var partArgs = slice.call(arguments, 1);
	  var boundFunction = function bound() {
	    var args = partArgs.concat(slice.call(arguments));
	    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
	  };
	  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
	  return boundFunction;
	};

	var nativeConstruct = getBuiltIn('Reflect', 'construct');
	var NEW_TARGET_BUG = fails(function () {
	  function F() {  }
	  return !(nativeConstruct(function () {  }, [], F) instanceof F);
	});
	var ARGS_BUG = !fails(function () {
	  nativeConstruct(function () {  });
	});
	var FORCED$a = NEW_TARGET_BUG || ARGS_BUG;
	_export({ target: 'Reflect', stat: true, forced: FORCED$a, sham: FORCED$a }, {
	  construct: function construct(Target, args ) {
	    aFunction$1(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aFunction$1(arguments[2]);
	    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
	    if (Target == newTarget) {
	      switch (args.length) {
	        case 0: return new Target();
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      var $args = [null];
	      $args.push.apply($args, args);
	      return new (functionBind.apply(Target, $args))();
	    }
	    var proto = newTarget.prototype;
	    var instance = objectCreate(isObject(proto) ? proto : Object.prototype);
	    var result = Function.apply.call(Target, instance, args);
	    return isObject(result) ? result : instance;
	  }
	});

	var ERROR_INSTEAD_OF_FALSE = fails(function () {
	  Reflect.defineProperty(objectDefineProperty.f({}, 1, { value: 1 }), 1, { value: 2 });
	});
	_export({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !descriptors }, {
	  defineProperty: function defineProperty(target, propertyKey, attributes) {
	    anObject(target);
	    var key = toPrimitive(propertyKey, true);
	    anObject(attributes);
	    try {
	      objectDefineProperty.f(target, key, attributes);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;
	_export({ target: 'Reflect', stat: true }, {
	  deleteProperty: function deleteProperty(target, propertyKey) {
	    var descriptor = getOwnPropertyDescriptor$6(anObject(target), propertyKey);
	    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
	  }
	});

	function get$2(target, propertyKey ) {
	  var receiver = arguments.length < 3 ? target : arguments[2];
	  var descriptor, prototype;
	  if (anObject(target) === receiver) return target[propertyKey];
	  if (descriptor = objectGetOwnPropertyDescriptor.f(target, propertyKey)) return has(descriptor, 'value')
	    ? descriptor.value
	    : descriptor.get === undefined
	      ? undefined
	      : descriptor.get.call(receiver);
	  if (isObject(prototype = objectGetPrototypeOf(target))) return get$2(prototype, propertyKey, receiver);
	}
	_export({ target: 'Reflect', stat: true }, {
	  get: get$2
	});

	_export({ target: 'Reflect', stat: true, sham: !descriptors }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
	    return objectGetOwnPropertyDescriptor.f(anObject(target), propertyKey);
	  }
	});

	_export({ target: 'Reflect', stat: true, sham: !correctPrototypeGetter }, {
	  getPrototypeOf: function getPrototypeOf(target) {
	    return objectGetPrototypeOf(anObject(target));
	  }
	});

	_export({ target: 'Reflect', stat: true }, {
	  has: function has(target, propertyKey) {
	    return propertyKey in target;
	  }
	});

	var objectIsExtensible = Object.isExtensible;
	_export({ target: 'Reflect', stat: true }, {
	  isExtensible: function isExtensible(target) {
	    anObject(target);
	    return objectIsExtensible ? objectIsExtensible(target) : true;
	  }
	});

	_export({ target: 'Reflect', stat: true }, {
	  ownKeys: ownKeys
	});

	_export({ target: 'Reflect', stat: true, sham: !freezing }, {
	  preventExtensions: function preventExtensions(target) {
	    anObject(target);
	    try {
	      var objectPreventExtensions = getBuiltIn('Object', 'preventExtensions');
	      if (objectPreventExtensions) objectPreventExtensions(target);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	function set$3(target, propertyKey, V ) {
	  var receiver = arguments.length < 4 ? target : arguments[3];
	  var ownDescriptor = objectGetOwnPropertyDescriptor.f(anObject(target), propertyKey);
	  var existingDescriptor, prototype;
	  if (!ownDescriptor) {
	    if (isObject(prototype = objectGetPrototypeOf(target))) {
	      return set$3(prototype, propertyKey, V, receiver);
	    }
	    ownDescriptor = createPropertyDescriptor(0);
	  }
	  if (has(ownDescriptor, 'value')) {
	    if (ownDescriptor.writable === false || !isObject(receiver)) return false;
	    if (existingDescriptor = objectGetOwnPropertyDescriptor.f(receiver, propertyKey)) {
	      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
	      existingDescriptor.value = V;
	      objectDefineProperty.f(receiver, propertyKey, existingDescriptor);
	    } else objectDefineProperty.f(receiver, propertyKey, createPropertyDescriptor(0, V));
	    return true;
	  }
	  return ownDescriptor.set === undefined ? false : (ownDescriptor.set.call(receiver, V), true);
	}
	var MS_EDGE_BUG = fails(function () {
	  var object = objectDefineProperty.f({}, 'a', { configurable: true });
	  return Reflect.set(objectGetPrototypeOf(object), 'a', 1, object) !== false;
	});
	_export({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
	  set: set$3
	});

	if (objectSetPrototypeOf) _export({ target: 'Reflect', stat: true }, {
	  setPrototypeOf: function setPrototypeOf(target, proto) {
	    anObject(target);
	    aPossiblePrototype(proto);
	    try {
	      objectSetPrototypeOf(target, proto);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});

	var MATCH = wellKnownSymbol('match');
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	function RE(s, f) {
	  return RegExp(s, f);
	}
	var UNSUPPORTED_Y = fails(function () {
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});
	var BROKEN_CARET = fails(function () {
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});
	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var defineProperty$9 = objectDefineProperty.f;
	var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;
	var setInternalState$5 = internalState.set;
	var MATCH$1 = wellKnownSymbol('match');
	var NativeRegExp = global_1.RegExp;
	var RegExpPrototype = NativeRegExp.prototype;
	var re1 = /a/g;
	var re2 = /a/g;
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;
	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;
	var FORCED$b = descriptors && isForced_1('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$1 || fails(function () {
	  re2[MATCH$1] = false;
	  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
	})));
	if (FORCED$b) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = this instanceof RegExpWrapper;
	    var patternIsRegExp = isRegexp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var sticky;
	    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
	      return pattern;
	    }
	    if (CORRECT_NEW) {
	      if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
	    } else if (pattern instanceof RegExpWrapper) {
	      if (flagsAreUndefined) flags = regexpFlags.call(pattern);
	      pattern = pattern.source;
	    }
	    if (UNSUPPORTED_Y$1) {
	      sticky = !!flags && flags.indexOf('y') > -1;
	      if (sticky) flags = flags.replace(/y/g, '');
	    }
	    var result = inheritIfRequired(
	      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
	      thisIsRegExp ? this : RegExpPrototype,
	      RegExpWrapper
	    );
	    if (UNSUPPORTED_Y$1 && sticky) setInternalState$5(result, { sticky: sticky });
	    return result;
	  };
	  var proxy = function (key) {
	    key in RegExpWrapper || defineProperty$9(RegExpWrapper, key, {
	      configurable: true,
	      get: function () { return NativeRegExp[key]; },
	      set: function (it) { NativeRegExp[key] = it; }
	    });
	  };
	  var keys$3 = getOwnPropertyNames$2(NativeRegExp);
	  var index = 0;
	  while (keys$3.length > index) proxy(keys$3[index++]);
	  RegExpPrototype.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype;
	  redefine(global_1, 'RegExp', RegExpWrapper);
	}
	setSpecies('RegExp');

	var nativeExec = RegExp.prototype.exec;
	var nativeReplace = String.prototype.replace;
	var patchedExec = nativeExec;
	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();
	var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;
	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2;
	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$2 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;
	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }
	      strCopy = String(str).slice(re.lastIndex);
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }
	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;
	    match = nativeExec.call(sticky ? reCopy : re, strCopy);
	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }
	    return match;
	  };
	}
	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	var UNSUPPORTED_Y$3 = regexpStickyHelpers.UNSUPPORTED_Y;
	if (descriptors && (/./g.flags != 'g' || UNSUPPORTED_Y$3)) {
	  objectDefineProperty.f(RegExp.prototype, 'flags', {
	    configurable: true,
	    get: regexpFlags
	  });
	}

	var TO_STRING = 'toString';
	var RegExpPrototype$1 = RegExp.prototype;
	var nativeToString = RegExpPrototype$1[TO_STRING];
	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	var INCORRECT_NAME = nativeToString.name != TO_STRING;
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	var es_set = collection('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var createMethod$5 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};
	var stringMultibyte = {
	  codeAt: createMethod$5(false),
	  charAt: createMethod$5(true)
	};

	var codeAt = stringMultibyte.codeAt;
	_export({ target: 'String', proto: true }, {
	  codePointAt: function codePointAt(pos) {
	    return codeAt(this, pos);
	  }
	});

	var notARegexp = function (it) {
	  if (isRegexp(it)) {
	    throw TypeError("The method doesn't accept regular expressions");
	  } return it;
	};

	var MATCH$2 = wellKnownSymbol('match');
	var correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (e) {
	    try {
	      regexp[MATCH$2] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (f) {  }
	  } return false;
	};

	var getOwnPropertyDescriptor$7 = objectGetOwnPropertyDescriptor.f;
	var nativeEndsWith = ''.endsWith;
	var min$5 = Math.min;
	var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('endsWith');
	var MDN_POLYFILL_BUG =  !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$7(String.prototype, 'endsWith');
	  return descriptor && !descriptor.writable;
	}();
	_export({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
	  endsWith: function endsWith(searchString ) {
	    var that = String(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
	    var len = toLength(that.length);
	    var end = endPosition === undefined ? len : min$5(toLength(endPosition), len);
	    var search = String(searchString);
	    return nativeEndsWith
	      ? nativeEndsWith.call(that, search, end)
	      : that.slice(end - search.length, end) === search;
	  }
	});

	var fromCharCode = String.fromCharCode;
	var nativeFromCodePoint = String.fromCodePoint;
	var INCORRECT_LENGTH = !!nativeFromCodePoint && nativeFromCodePoint.length != 1;
	_export({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
	  fromCodePoint: function fromCodePoint(x) {
	    var elements = [];
	    var length = arguments.length;
	    var i = 0;
	    var code;
	    while (length > i) {
	      code = +arguments[i++];
	      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
	      elements.push(code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00)
	      );
	    } return elements.join('');
	  }
	});

	_export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
	  includes: function includes(searchString ) {
	    return !!~String(requireObjectCoercible(this))
	      .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var charAt = stringMultibyte.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$6 = internalState.set;
	var getInternalState$4 = internalState.getterFor(STRING_ITERATOR);
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$6(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	}, function next() {
	  var state = getInternalState$4(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var SPECIES$6 = wellKnownSymbol('species');
	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();
	var REPLACE = wellKnownSymbol('replace');
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});
	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);
	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });
	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    var execCalled = false;
	    var re = /a/;
	    if (KEY === 'split') {
	      re = {};
	      re.constructor = {};
	      re.constructor[SPECIES$6] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }
	    re.exec = function () { execCalled = true; return null; };
	    re[SYMBOL]('');
	    return !execCalled;
	  });
	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(
	      REPLACE_SUPPORTS_NAMED_GROUPS &&
	      REPLACE_KEEPS_$0 &&
	      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    )) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];
	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }
	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var charAt$1 = stringMultibyte.charAt;
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }
	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }
	  return regexpExec.call(R, S);
	};

	fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = regexp == undefined ? undefined : regexp[MATCH];
	      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	    },
	    function (regexp) {
	      var res = maybeCallNative(nativeMatch, regexp, this);
	      if (res.done) return res.value;
	      var rx = anObject(regexp);
	      var S = String(this);
	      if (!rx.global) return regexpExecAbstract(rx, S);
	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = String(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var ceil$2 = Math.ceil;
	var createMethod$6 = function (IS_END) {
	  return function ($this, maxLength, fillString) {
	    var S = String(requireObjectCoercible($this));
	    var stringLength = S.length;
	    var fillStr = fillString === undefined ? ' ' : String(fillString);
	    var intMaxLength = toLength(maxLength);
	    var fillLen, stringFiller;
	    if (intMaxLength <= stringLength || fillStr == '') return S;
	    fillLen = intMaxLength - stringLength;
	    stringFiller = stringRepeat.call(fillStr, ceil$2(fillLen / fillStr.length));
	    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
	    return IS_END ? S + stringFiller : stringFiller + S;
	  };
	};
	var stringPad = {
	  start: createMethod$6(false),
	  end: createMethod$6(true)
	};

	var stringPadWebkitBug = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(engineUserAgent);

	var $padEnd = stringPad.end;
	_export({ target: 'String', proto: true, forced: stringPadWebkitBug }, {
	  padEnd: function padEnd(maxLength ) {
	    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $padStart = stringPad.start;
	_export({ target: 'String', proto: true, forced: stringPadWebkitBug }, {
	  padStart: function padStart(maxLength ) {
	    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	_export({ target: 'String', stat: true }, {
	  raw: function raw(template) {
	    var rawTemplate = toIndexedObject(template.raw);
	    var literalSegments = toLength(rawTemplate.length);
	    var argumentsLength = arguments.length;
	    var elements = [];
	    var i = 0;
	    while (literalSegments > i) {
	      elements.push(String(rawTemplate[i++]));
	      if (i < argumentsLength) elements.push(String(arguments[i]));
	    } return elements.join('');
	  }
	});

	_export({ target: 'String', proto: true }, {
	  repeat: stringRepeat
	});

	var max$3 = Math.max;
	var min$6 = Math.min;
	var floor$6 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;
	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};
	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';
	  return [
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return replacer !== undefined
	        ? replacer.call(searchValue, O, replaceValue)
	        : nativeReplace.call(String(O), searchValue, replaceValue);
	    },
	    function (regexp, replaceValue) {
	      if (
	        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
	        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
	      ) {
	        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	        if (res.done) return res.value;
	      }
	      var rx = anObject(regexp);
	      var S = String(this);
	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);
	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regexpExecAbstract(rx, S);
	        if (result === null) break;
	        results.push(result);
	        if (!global) break;
	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }
	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];
	        var matched = String(result[0]);
	        var position = max$3(min$6(toInteger(result.index), S.length), 0);
	        var captures = [];
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default:
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$6(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	fixRegexpWellKnownSymbolLogic('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
	  return [
	    function search(regexp) {
	      var O = requireObjectCoercible(this);
	      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
	      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
	    },
	    function (regexp) {
	      var res = maybeCallNative(nativeSearch, regexp, this);
	      if (res.done) return res.value;
	      var rx = anObject(regexp);
	      var S = String(this);
	      var previousLastIndex = rx.lastIndex;
	      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
	      var result = regexpExecAbstract(rx, S);
	      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
	      return result === null ? -1 : result.index;
	    }
	  ];
	});

	var arrayPush = [].push;
	var min$7 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++;
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;
	  return [
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;
	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);
	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$7(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	var getOwnPropertyDescriptor$8 = objectGetOwnPropertyDescriptor.f;
	var nativeStartsWith = ''.startsWith;
	var min$8 = Math.min;
	var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegexpLogic('startsWith');
	var MDN_POLYFILL_BUG$1 =  !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
	  var descriptor = getOwnPropertyDescriptor$8(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}();
	_export({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
	  startsWith: function startsWith(searchString ) {
	    var that = String(requireObjectCoercible(this));
	    notARegexp(searchString);
	    var index = toLength(min$8(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = String(searchString);
	    return nativeStartsWith
	      ? nativeStartsWith.call(that, search, index)
	      : that.slice(index, index + search.length) === search;
	  }
	});

	var non = '\u200B\u0085\u180E';
	var stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim;
	_export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	var $trimEnd = stringTrim.end;
	var FORCED$c = stringTrimForced('trimEnd');
	var trimEnd = FORCED$c ? function trimEnd() {
	  return $trimEnd(this);
	} : ''.trimEnd;
	_export({ target: 'String', proto: true, forced: FORCED$c }, {
	  trimEnd: trimEnd,
	  trimRight: trimEnd
	});

	var $trimStart = stringTrim.start;
	var FORCED$d = stringTrimForced('trimStart');
	var trimStart = FORCED$d ? function trimStart() {
	  return $trimStart(this);
	} : ''.trimStart;
	_export({ target: 'String', proto: true, forced: FORCED$d }, {
	  trimStart: trimStart,
	  trimLeft: trimStart
	});

	var quot = /"/g;
	var createHtml = function (string, tag, attribute, value) {
	  var S = String(requireObjectCoercible(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};

	var stringHtmlForced = function (METHOD_NAME) {
	  return fails(function () {
	    var test = ''[METHOD_NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  });
	};

	_export({ target: 'String', proto: true, forced: stringHtmlForced('anchor') }, {
	  anchor: function anchor(name) {
	    return createHtml(this, 'a', 'name', name);
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('big') }, {
	  big: function big() {
	    return createHtml(this, 'big', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('blink') }, {
	  blink: function blink() {
	    return createHtml(this, 'blink', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('bold') }, {
	  bold: function bold() {
	    return createHtml(this, 'b', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('fixed') }, {
	  fixed: function fixed() {
	    return createHtml(this, 'tt', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('fontcolor') }, {
	  fontcolor: function fontcolor(color) {
	    return createHtml(this, 'font', 'color', color);
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('fontsize') }, {
	  fontsize: function fontsize(size) {
	    return createHtml(this, 'font', 'size', size);
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('italics') }, {
	  italics: function italics() {
	    return createHtml(this, 'i', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('link') }, {
	  link: function link(url) {
	    return createHtml(this, 'a', 'href', url);
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('small') }, {
	  small: function small() {
	    return createHtml(this, 'small', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('strike') }, {
	  strike: function strike() {
	    return createHtml(this, 'strike', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('sub') }, {
	  sub: function sub() {
	    return createHtml(this, 'sub', '', '');
	  }
	});

	_export({ target: 'String', proto: true, forced: stringHtmlForced('sup') }, {
	  sup: function sup() {
	    return createHtml(this, 'sup', '', '');
	  }
	});

	var defineProperty$a = objectDefineProperty.f;
	var Int8Array$1 = global_1.Int8Array;
	var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
	var Uint8ClampedArray = global_1.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
	var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
	var ObjectPrototype$3 = Object.prototype;
	var isPrototypeOf = ObjectPrototype$3.isPrototypeOf;
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferNative && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQIRED = false;
	var NAME$1;
	var TypedArrayConstructorsList = {
	  Int8Array: 1,
	  Uint8Array: 1,
	  Uint8ClampedArray: 1,
	  Int16Array: 2,
	  Uint16Array: 2,
	  Int32Array: 4,
	  Uint32Array: 4,
	  Float32Array: 4,
	  Float64Array: 8
	};
	var isView = function isView(it) {
	  var klass = classof(it);
	  return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
	};
	var isTypedArray = function (it) {
	  return isObject(it) && has(TypedArrayConstructorsList, classof(it));
	};
	var aTypedArray = function (it) {
	  if (isTypedArray(it)) return it;
	  throw TypeError('Target is not a typed array');
	};
	var aTypedArrayConstructor = function (C) {
	  if (objectSetPrototypeOf) {
	    if (isPrototypeOf.call(TypedArray, C)) return C;
	  } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME$1)) {
	    var TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
	      return C;
	    }
	  } throw TypeError('Target is not a typed array constructor');
	};
	var exportTypedArrayMethod = function (KEY, property, forced) {
	  if (!descriptors) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
	      delete TypedArrayConstructor.prototype[KEY];
	    }
	  }
	  if (!TypedArrayPrototype[KEY] || forced) {
	    redefine(TypedArrayPrototype, KEY, forced ? property
	      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
	  }
	};
	var exportTypedArrayStaticMethod = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!descriptors) return;
	  if (objectSetPrototypeOf) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = global_1[ARRAY];
	      if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
	        delete TypedArrayConstructor[KEY];
	      }
	    }
	    if (!TypedArray[KEY] || forced) {
	      try {
	        return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
	      } catch (error) {  }
	    } else return;
	  }
	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = global_1[ARRAY];
	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      redefine(TypedArrayConstructor, KEY, property);
	    }
	  }
	};
	for (NAME$1 in TypedArrayConstructorsList) {
	  if (!global_1[NAME$1]) NATIVE_ARRAY_BUFFER_VIEWS = false;
	}
	if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
	  TypedArray = function TypedArray() {
	    throw TypeError('Incorrect invocation');
	  };
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1], TypedArray);
	  }
	}
	if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$3) {
	  TypedArrayPrototype = TypedArray.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
	    if (global_1[NAME$1]) objectSetPrototypeOf(global_1[NAME$1].prototype, TypedArrayPrototype);
	  }
	}
	if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
	  objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
	}
	if (descriptors && !has(TypedArrayPrototype, TO_STRING_TAG$3)) {
	  TYPED_ARRAY_TAG_REQIRED = true;
	  defineProperty$a(TypedArrayPrototype, TO_STRING_TAG$3, { get: function () {
	    return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
	  } });
	  for (NAME$1 in TypedArrayConstructorsList) if (global_1[NAME$1]) {
	    createNonEnumerableProperty(global_1[NAME$1], TYPED_ARRAY_TAG, NAME$1);
	  }
	}
	var arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
	  aTypedArray: aTypedArray,
	  aTypedArrayConstructor: aTypedArrayConstructor,
	  exportTypedArrayMethod: exportTypedArrayMethod,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
	  isView: isView,
	  isTypedArray: isTypedArray,
	  TypedArray: TypedArray,
	  TypedArrayPrototype: TypedArrayPrototype
	};

	var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var ArrayBuffer$2 = global_1.ArrayBuffer;
	var Int8Array$2 = global_1.Int8Array;
	var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
	  Int8Array$2(1);
	}) || !fails(function () {
	  new Int8Array$2(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array$2();
	  new Int8Array$2(null);
	  new Int8Array$2(1.5);
	  new Int8Array$2(iterable);
	}, true) || fails(function () {
	  return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
	});

	var toPositiveInteger = function (it) {
	  var result = toInteger(it);
	  if (result < 0) throw RangeError("The argument can't be less than 0");
	  return result;
	};

	var toOffset = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw RangeError('Wrong offset');
	  return offset;
	};

	var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;
	var typedArrayFrom = function from(source ) {
	  var O = toObject(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, step, iterator, next;
	  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    O = [];
	    while (!(step = next.call(iterator)).done) {
	      O.push(step.value);
	    }
	  }
	  if (mapping && argumentsLength > 2) {
	    mapfn = functionBindContext(mapfn, arguments[2], 2);
	  }
	  length = toLength(O.length);
	  result = new (aTypedArrayConstructor$1(this))(length);
	  for (i = 0; length > i; i++) {
	    result[i] = mapping ? mapfn(O[i], i) : O[i];
	  }
	  return result;
	};

	var typedArrayConstructor = createCommonjsModule(function (module) {
	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var forEach = arrayIteration.forEach;
	var getInternalState = internalState.get;
	var setInternalState = internalState.set;
	var nativeDefineProperty = objectDefineProperty.f;
	var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var round = Math.round;
	var RangeError = global_1.RangeError;
	var ArrayBuffer = arrayBuffer.ArrayBuffer;
	var DataView = arrayBuffer.DataView;
	var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
	var TypedArray = arrayBufferViewCore.TypedArray;
	var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
	var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
	var isTypedArray = arrayBufferViewCore.isTypedArray;
	var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	var WRONG_LENGTH = 'Wrong length';
	var fromList = function (C, list) {
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	};
	var addGetter = function (it, key) {
	  nativeDefineProperty(it, key, { get: function () {
	    return getInternalState(this)[key];
	  } });
	};
	var isArrayBuffer = function (it) {
	  var klass;
	  return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
	};
	var isTypedArrayIndex = function (target, key) {
	  return isTypedArray(target)
	    && typeof key != 'symbol'
	    && key in target
	    && String(+key) == String(key);
	};
	var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	  return isTypedArrayIndex(target, key = toPrimitive(key, true))
	    ? createPropertyDescriptor(2, target[key])
	    : nativeGetOwnPropertyDescriptor(target, key);
	};
	var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	  if (isTypedArrayIndex(target, key = toPrimitive(key, true))
	    && isObject(descriptor)
	    && has(descriptor, 'value')
	    && !has(descriptor, 'get')
	    && !has(descriptor, 'set')
	    && !descriptor.configurable
	    && (!has(descriptor, 'writable') || descriptor.writable)
	    && (!has(descriptor, 'enumerable') || descriptor.enumerable)
	  ) {
	    target[key] = descriptor.value;
	    return target;
	  } return nativeDefineProperty(target, key, descriptor);
	};
	if (descriptors) {
	  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	    objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
	    objectDefineProperty.f = wrappedDefineProperty;
	    addGetter(TypedArrayPrototype, 'buffer');
	    addGetter(TypedArrayPrototype, 'byteOffset');
	    addGetter(TypedArrayPrototype, 'byteLength');
	    addGetter(TypedArrayPrototype, 'length');
	  }
	  _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	    defineProperty: wrappedDefineProperty
	  });
	  module.exports = function (TYPE, wrapper, CLAMPED) {
	    var BYTES = TYPE.match(/\d+$/)[0] / 8;
	    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + TYPE;
	    var SETTER = 'set' + TYPE;
	    var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
	    var TypedArrayConstructor = NativeTypedArrayConstructor;
	    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
	    var exported = {};
	    var getter = function (that, index) {
	      var data = getInternalState(that);
	      return data.view[GETTER](index * BYTES + data.byteOffset, true);
	    };
	    var setter = function (that, index, value) {
	      var data = getInternalState(that);
	      if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
	      data.view[SETTER](index * BYTES + data.byteOffset, value, true);
	    };
	    var addElement = function (that, index) {
	      nativeDefineProperty(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };
	    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
	        anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
	        var index = 0;
	        var byteOffset = 0;
	        var buffer, byteLength, length;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new ArrayBuffer(byteLength);
	        } else if (isArrayBuffer(data)) {
	          buffer = data;
	          byteOffset = toOffset(offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
	            byteLength = $len - byteOffset;
	            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (isTypedArray(data)) {
	          return fromList(TypedArrayConstructor, data);
	        } else {
	          return typedArrayFrom.call(TypedArrayConstructor, data);
	        }
	        setInternalState(that, {
	          buffer: buffer,
	          byteOffset: byteOffset,
	          byteLength: byteLength,
	          length: length,
	          view: new DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });
	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
	    } else if (typedArrayConstructorsRequireWrappers) {
	      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	        anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
	        return inheritIfRequired(function () {
	          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
	          if (isArrayBuffer(data)) return $length !== undefined
	            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
	            : typedArrayOffset !== undefined
	              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
	              : new NativeTypedArrayConstructor(data);
	          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
	          return typedArrayFrom.call(TypedArrayConstructor, data);
	        }(), dummy, TypedArrayConstructor);
	      });
	      if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
	      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
	        if (!(key in TypedArrayConstructor)) {
	          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
	        }
	      });
	      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
	    }
	    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
	    }
	    if (TYPED_ARRAY_TAG) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	    }
	    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;
	    _export({
	      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
	    }, exported);
	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
	      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
	    }
	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
	    }
	    setSpecies(CONSTRUCTOR_NAME);
	  };
	} else module.exports = function () {  };
	});

	typedArrayConstructor('Float32', function (init) {
	  return function Float32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Float64', function (init) {
	  return function Float64Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Int8', function (init) {
	  return function Int8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Int16', function (init) {
	  return function Int16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Int32', function (init) {
	  return function Int32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Uint8', function (init) {
	  return function Uint8ClampedArray(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	}, true);

	typedArrayConstructor('Uint16', function (init) {
	  return function Uint16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	typedArrayConstructor('Uint32', function (init) {
	  return function Uint32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start ) {
	  return arrayCopyWithin.call(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});

	var $every$1 = arrayIteration.every;
	var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$2('every', function every(callbackfn ) {
	  return $every$1(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$3('fill', function fill(value ) {
	  return arrayFill.apply(aTypedArray$3(this), arguments);
	});

	var $filter$1 = arrayIteration.filter;
	var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$4('filter', function filter(callbackfn ) {
	  var list = $filter$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$2(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	});

	var $find$1 = arrayIteration.find;
	var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$5('find', function find(predicate ) {
	  return $find$1(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $findIndex$1 = arrayIteration.findIndex;
	var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$6('findIndex', function findIndex(predicate ) {
	  return $findIndex$1(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $forEach$2 = arrayIteration.forEach;
	var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$7('forEach', function forEach(callbackfn ) {
	  $forEach$2(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;
	exportTypedArrayStaticMethod$1('from', typedArrayFrom, typedArrayConstructorsRequireWrappers);

	var $includes$1 = arrayIncludes.includes;
	var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$8('includes', function includes(searchElement ) {
	  return $includes$1(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $indexOf$1 = arrayIncludes.indexOf;
	var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$9('indexOf', function indexOf(searchElement ) {
	  return $indexOf$1(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var Uint8Array = global_1.Uint8Array;
	var arrayValues = es_array_iterator.values;
	var arrayKeys = es_array_iterator.keys;
	var arrayEntries = es_array_iterator.entries;
	var aTypedArray$a = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;
	var nativeTypedArrayIterator = Uint8Array && Uint8Array.prototype[ITERATOR$5];
	var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
	  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);
	var typedArrayValues = function values() {
	  return arrayValues.call(aTypedArray$a(this));
	};
	exportTypedArrayMethod$a('entries', function entries() {
	  return arrayEntries.call(aTypedArray$a(this));
	});
	exportTypedArrayMethod$a('keys', function keys() {
	  return arrayKeys.call(aTypedArray$a(this));
	});
	exportTypedArrayMethod$a('values', typedArrayValues, !CORRECT_ITER_NAME);
	exportTypedArrayMethod$a(ITERATOR$5, typedArrayValues, !CORRECT_ITER_NAME);

	var aTypedArray$b = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
	var $join = [].join;
	exportTypedArrayMethod$b('join', function join(separator) {
	  return $join.apply(aTypedArray$b(this), arguments);
	});

	var aTypedArray$c = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement ) {
	  return arrayLastIndexOf.apply(aTypedArray$c(this), arguments);
	});

	var $map$1 = arrayIteration.map;
	var aTypedArray$d = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$d('map', function map(mapfn ) {
	  return $map$1(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (aTypedArrayConstructor$3(speciesConstructor(O, O.constructor)))(length);
	  });
	});

	var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayStaticMethod$2 = arrayBufferViewCore.exportTypedArrayStaticMethod;
	exportTypedArrayStaticMethod$2('of', function of() {
	  var index = 0;
	  var length = arguments.length;
	  var result = new (aTypedArrayConstructor$4(this))(length);
	  while (length > index) result[index] = arguments[index++];
	  return result;
	}, typedArrayConstructorsRequireWrappers);

	var $reduce$1 = arrayReduce.left;
	var aTypedArray$e = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$e('reduce', function reduce(callbackfn ) {
	  return $reduce$1(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var $reduceRight$1 = arrayReduce.right;
	var aTypedArray$f = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn ) {
	  return $reduceRight$1(aTypedArray$f(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$g = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;
	var floor$7 = Math.floor;
	exportTypedArrayMethod$g('reverse', function reverse() {
	  var that = this;
	  var length = aTypedArray$g(that).length;
	  var middle = floor$7(length / 2);
	  var index = 0;
	  var value;
	  while (index < middle) {
	    value = that[index];
	    that[index++] = that[--length];
	    that[length] = value;
	  } return that;
	});

	var aTypedArray$h = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;
	var FORCED$e = fails(function () {
	  new Int8Array(1).set({});
	});
	exportTypedArrayMethod$h('set', function set(arrayLike ) {
	  aTypedArray$h(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var length = this.length;
	  var src = toObject(arrayLike);
	  var len = toLength(src.length);
	  var index = 0;
	  if (len + offset > length) throw RangeError('Wrong length');
	  while (index < len) this[offset + index] = src[index++];
	}, FORCED$e);

	var aTypedArray$i = arrayBufferViewCore.aTypedArray;
	var aTypedArrayConstructor$5 = arrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;
	var $slice = [].slice;
	var FORCED$f = fails(function () {
	  new Int8Array(1).slice();
	});
	exportTypedArrayMethod$i('slice', function slice(start, end) {
	  var list = $slice.call(aTypedArray$i(this), start, end);
	  var C = speciesConstructor(this, this.constructor);
	  var index = 0;
	  var length = list.length;
	  var result = new (aTypedArrayConstructor$5(C))(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	}, FORCED$f);

	var $some$1 = arrayIteration.some;
	var aTypedArray$j = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$j('some', function some(callbackfn ) {
	  return $some$1(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var aTypedArray$k = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
	var $sort = [].sort;
	exportTypedArrayMethod$k('sort', function sort(comparefn) {
	  return $sort.call(aTypedArray$k(this), comparefn);
	});

	var aTypedArray$l = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;
	exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
	  var O = aTypedArray$l(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  return new (speciesConstructor(O, O.constructor))(
	    O.buffer,
	    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
	    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
	  );
	});

	var Int8Array$3 = global_1.Int8Array;
	var aTypedArray$m = arrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;
	var $slice$1 = [].slice;
	var TO_LOCALE_STRING_BUG = !!Int8Array$3 && fails(function () {
	  $toLocaleString.call(new Int8Array$3(1));
	});
	var FORCED$g = fails(function () {
	  return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array$3.prototype.toLocaleString.call([1, 2]);
	});
	exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
	  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
	}, FORCED$g);

	var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;
	var Uint8Array$1 = global_1.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array$1 && Uint8Array$1.prototype || {};
	var arrayToString = [].toString;
	var arrayJoin = [].join;
	if (fails(function () { arrayToString.call({}); })) {
	  arrayToString = function toString() {
	    return arrayJoin.call(this);
	  };
	}
	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;
	exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

	var getWeakData = internalMetadata.getWeakData;
	var setInternalState$7 = internalState.set;
	var internalStateGetterFor$1 = internalState.getterFor;
	var find = arrayIteration.find;
	var findIndex = arrayIteration.findIndex;
	var id$1 = 0;
	var uncaughtFrozenStore = function (store) {
	  return store.frozen || (store.frozen = new UncaughtFrozenStore());
	};
	var UncaughtFrozenStore = function () {
	  this.entries = [];
	};
	var findUncaughtFrozen = function (store, key) {
	  return find(store.entries, function (it) {
	    return it[0] === key;
	  });
	};
	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.entries.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = findIndex(this.entries, function (it) {
	      return it[0] === key;
	    });
	    if (~index) this.entries.splice(index, 1);
	    return !!~index;
	  }
	};
	var collectionWeak = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$7(that, {
	        type: CONSTRUCTOR_NAME,
	        id: id$1++,
	        frozen: undefined
	      });
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });
	    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var data = getWeakData(anObject(key), true);
	      if (data === true) uncaughtFrozenStore(state).set(key, value);
	      else data[state.id] = value;
	      return that;
	    };
	    redefineAll(C.prototype, {
	      'delete': function (key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
	        return data && has(data, state.id) && delete data[state.id];
	      },
	      has: function has$1(key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state).has(key);
	        return data && has(data, state.id);
	      }
	    });
	    redefineAll(C.prototype, IS_MAP ? {
	      get: function get(key) {
	        var state = getInternalState(this);
	        if (isObject(key)) {
	          var data = getWeakData(key);
	          if (data === true) return uncaughtFrozenStore(state).get(key);
	          return data ? data[state.id] : undefined;
	        }
	      },
	      set: function set(key, value) {
	        return define(this, key, value);
	      }
	    } : {
	      add: function add(value) {
	        return define(this, value, true);
	      }
	    });
	    return C;
	  }
	};

	var es_weakMap = createCommonjsModule(function (module) {
	var enforceIternalState = internalState.enforce;
	var IS_IE11 = !global_1.ActiveXObject && 'ActiveXObject' in global_1;
	var isExtensible = Object.isExtensible;
	var InternalWeakMap;
	var wrapper = function (init) {
	  return function WeakMap() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	};
	var $WeakMap = module.exports = collection('WeakMap', wrapper, collectionWeak);
	if (nativeWeakMap && IS_IE11) {
	  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
	  internalMetadata.REQUIRED = true;
	  var WeakMapPrototype = $WeakMap.prototype;
	  var nativeDelete = WeakMapPrototype['delete'];
	  var nativeHas = WeakMapPrototype.has;
	  var nativeGet = WeakMapPrototype.get;
	  var nativeSet = WeakMapPrototype.set;
	  redefineAll(WeakMapPrototype, {
	    'delete': function (key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeDelete.call(this, key) || state.frozen['delete'](key);
	      } return nativeDelete.call(this, key);
	    },
	    has: function has(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) || state.frozen.has(key);
	      } return nativeHas.call(this, key);
	    },
	    get: function get(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
	      } return nativeGet.call(this, key);
	    },
	    set: function set(key, value) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
	      } else nativeSet.call(this, key, value);
	      return this;
	    }
	  });
	}
	});

	collection('WeakSet', function (init) {
	  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionWeak);

	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var ITERATOR$6 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;
	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    if (CollectionPrototype$1[ITERATOR$6] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$6, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$6] = ArrayValues;
	    }
	    if (!CollectionPrototype$1[TO_STRING_TAG$4]) {
	      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$4, COLLECTION_NAME$1);
	    }
	    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var process$4 = global_1.process;
	var isNode = classofRaw(process$4) == 'process';
	_export({ global: true, enumerable: true, noTargetGet: true }, {
	  queueMicrotask: function queueMicrotask(fn) {
	    var domain = isNode && process$4.domain;
	    microtask(domain ? domain.bind(fn) : fn);
	  }
	});

	var ITERATOR$7 = wellKnownSymbol('iterator');
	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$7]
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    || result !== 'a1c3'
	    || new URL('http://x', undefined).host !== 'x';
	});

	var maxInt = 2147483647;
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128;
	var delimiter = '-';
	var regexNonASCII = /[^\0-\u007E]/;
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g;
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$8 = Math.floor;
	var stringFromCharCode = String.fromCharCode;
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      var extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) {
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	};
	var digitToBasic = function (digit) {
	  return digit + 22 + 75 * (digit < 26);
	};
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$8(delta / damp) : delta >> 1;
	  delta += floor$8(delta / numPoints);
	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$8(delta / baseMinusTMin);
	  }
	  return floor$8(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};
	var encode = function (input) {
	  var output = [];
	  input = ucs2decode(input);
	  var inputLength = input.length;
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }
	  var basicLength = output.length;
	  var handledCPCount = basicLength;
	  if (basicLength) {
	    output.push(delimiter);
	  }
	  while (handledCPCount < inputLength) {
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$8((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }
	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue == n) {
	        var q = delta;
	        for (var k = base; ; k += base) {
	          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$8(qMinusT / baseMinusT);
	        }
	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }
	    ++delta;
	    ++n;
	  }
	  return output.join('');
	};
	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }
	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	var $fetch$1 = getBuiltIn('fetch');
	var Headers$1 = getBuiltIn('Headers');
	var ITERATOR$8 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$8 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);
	var plus = /\+/g;
	var sequences = Array(4);
	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};
	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};
	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};
	var find$1 = /[!'()~]|%20/g;
	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};
	var replacer = function (match) {
	  return replace[match];
	};
	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find$1, replacer);
	};
	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};
	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};
	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};
	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$8(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});
	var URLSearchParamsConstructor = function URLSearchParams() {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;
	  setInternalState$8(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () {  },
	    updateSearchParams: updateSearchParams
	  });
	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) throw TypeError('Expected sequence with length 2');
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({ key: key, value: init[key] + '' });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};
	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;
	redefineAll(URLSearchParamsPrototype, {
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);
	      else index++;
	    }
	    state.updateURL();
	  },
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }
	    return result;
	  },
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }
	    return false;
	  },
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) entries.push({ key: key, value: val });
	    state.updateURL();
	  },
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }
	    state.updateURL();
	  },
	  forEach: function forEach(callback ) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });
	redefine(URLSearchParamsPrototype, ITERATOR$8, URLSearchParamsPrototype.entries);
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });
	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});
	if (!nativeUrl && typeof $fetch$1 == 'function' && typeof Headers$1 == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input ) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers$1(init.headers) : new Headers$1();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch$1.apply(this, args);
	    }
	  });
	}
	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	var codeAt$1 = stringMultibyte.codeAt;
	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$9 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$9 = Math.floor;
	var pow$4 = Math.pow;
	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';
	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/;
	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;
	var parseHost = function (url, input) {
	  var result, codePoints, index;
	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result;
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);
	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }
	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};
	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;
	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }
	    numbers.push(number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index == partsLength - 1) {
	      if (number >= pow$4(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = numbers.pop();
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow$4(256, 3 - index);
	  }
	  return ipv4;
	};
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;
	  var char = function () {
	    return input.charAt(pointer);
	  };
	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (char()) {
	    if (pieceIndex == 8) return;
	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }
	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (char()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!DIGIT.test(char())) return;
	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece == 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }
	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;
	  return address;
	};
	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};
	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$9(host / 256);
	    } return result.join('.');
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};
	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});
	var percentEncode = function (char, set) {
	  var code = codeAt$1(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};
	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};
	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};
	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};
	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};
	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0))
	    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
	};
	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
	    string.length == 2 ||
	    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};
	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;
	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};
	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};
	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};
	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;
	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }
	  input = input.replace(TAB_AND_NEW_LINE, '');
	  codePoints = arrayFrom(input);
	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];
	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;
	        break;
	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (
	            (isSpecial(url) != has(specialSchemes, buffer)) ||
	            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
	            (url.scheme == 'file' && !url.host)
	          )) return;
	          url.scheme = buffer;
	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }
	          buffer = '';
	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;
	        break;
	      case NO_SCHEME:
	        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }
	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;
	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        } break;
	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }
	      case RELATIVE:
	        url.scheme = base.scheme;
	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        } break;
	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        } break;
	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;
	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        } break;
	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);
	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];
	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }
	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;
	            else url.username += encodedCodePoints;
	          }
	          buffer = '';
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;
	        break;
	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;
	          else if (char == ']') seenBracket = false;
	          buffer += char;
	        } break;
	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url)) ||
	          stateOverride
	        ) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
	            buffer = '';
	          }
	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;
	        break;
	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;
	        else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }
	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        } break;
	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }
	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
	          else url.host = base.host;
	        }
	        state = PATH;
	        continue;
	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          } continue;
	        } else buffer += char;
	        break;
	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        } break;
	      case PATH:
	        if (
	          char == EOF || char == '/' ||
	          (char == '\\' && isSpecial(url)) ||
	          (!stateOverride && (char == '?' || char == '#'))
	        ) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':';
	            }
	            url.path.push(buffer);
	          }
	          buffer = '';
	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }
	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        } break;
	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;
	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';
	          else if (char == '#') url.query += '%23';
	          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;
	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }
	    pointer++;
	  }
	};
	var URLConstructor = function URL(url ) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$9(that, { type: 'URL' });
	  var baseState, failure;
	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
	    else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }
	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);
	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };
	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};
	var URLPrototype = URLConstructor.prototype;
	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';
	  if (host !== null) {
	    output += '//';
	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }
	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';
	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};
	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};
	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};
	var getUsername = function () {
	  return getInternalURLState(this).username;
	};
	var getPassword = function () {
	  return getInternalURLState(this).password;
	};
	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? ''
	    : port === null ? serializeHost(host)
	    : serializeHost(host) + ':' + port;
	};
	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};
	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};
	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};
	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};
	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};
	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};
	var accessorDescriptor = function (getter, setter) {
	  return { get: getter, set: setter, configurable: true, enumerable: true };
	};
	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    origin: accessorDescriptor(getOrigin),
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;
	      else parseURL(url, port, PORT);
	    }),
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);
	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    searchParams: accessorDescriptor(getSearchParams),
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);
	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }
	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	}
	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, { enumerable: true });
	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, { enumerable: true });
	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  });
	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}
	setToStringTag(URLConstructor, 'URL');
	_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
	  URL: URLConstructor
	});

	_export({ target: 'URL', proto: true, enumerable: true }, {
	  toJSON: function toJSON() {
	    return URL.prototype.toString.call(this);
	  }
	});

	var runtime_1 = createCommonjsModule(function (module) {
	var runtime = (function (exports) {
	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined$1;
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	  function define(obj, key, value) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	    return obj[key];
	  }
	  try {
	    define({}, "");
	  } catch (err) {
	    define = function(obj, key, value) {
	      return obj[key] = value;
	    };
	  }
	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);
	    generator._invoke = makeInvokeMethod(innerFn, self, context);
	    return generator;
	  }
	  exports.wrap = wrap;
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }
	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";
	  var ContinueSentinel = {};
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };
	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    IteratorPrototype = NativeIteratorPrototype;
	  }
	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunction.displayName = define(
	    GeneratorFunctionPrototype,
	    toStringTagSymbol,
	    "GeneratorFunction"
	  );
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      define(prototype, method, function(arg) {
	        return this._invoke(method, arg);
	      });
	    });
	  }
	  exports.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };
	  exports.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      define(genFun, toStringTagSymbol, "GeneratorFunction");
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };
	  exports.awrap = function(arg) {
	    return { __await: arg };
	  };
	  function AsyncIterator(generator, PromiseImpl) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return PromiseImpl.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }
	        return PromiseImpl.resolve(value).then(function(unwrapped) {
	          result.value = unwrapped;
	          resolve(result);
	        }, function(error) {
	          return invoke("throw", error, resolve, reject);
	        });
	      }
	    }
	    var previousPromise;
	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new PromiseImpl(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }
	      return previousPromise =
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }
	    this._invoke = enqueue;
	  }
	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  exports.AsyncIterator = AsyncIterator;
	  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
	    if (PromiseImpl === void 0) PromiseImpl = Promise;
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList),
	      PromiseImpl
	    );
	    return exports.isGeneratorFunction(outerFn)
	      ? iter
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };
	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;
	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }
	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }
	        return doneResult();
	      }
	      context.method = method;
	      context.arg = arg;
	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }
	        if (context.method === "next") {
	          context.sent = context._sent = context.arg;
	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }
	          context.dispatchException(context.arg);
	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }
	        state = GenStateExecuting;
	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;
	          if (record.arg === ContinueSentinel) {
	            continue;
	          }
	          return {
	            value: record.arg,
	            done: context.done
	          };
	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined$1) {
	      context.delegate = null;
	      if (context.method === "throw") {
	        if (delegate.iterator["return"]) {
	          context.method = "return";
	          context.arg = undefined$1;
	          maybeInvokeDelegate(delegate, context);
	          if (context.method === "throw") {
	            return ContinueSentinel;
	          }
	        }
	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }
	      return ContinueSentinel;
	    }
	    var record = tryCatch(method, delegate.iterator, context.arg);
	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }
	    var info = record.arg;
	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }
	    if (info.done) {
	      context[delegate.resultName] = info.value;
	      context.next = delegate.nextLoc;
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined$1;
	      }
	    } else {
	      return info;
	    }
	    context.delegate = null;
	    return ContinueSentinel;
	  }
	  defineIteratorMethods(Gp);
	  define(Gp, toStringTagSymbol, "Generator");
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };
	  Gp.toString = function() {
	    return "[object Generator]";
	  };
	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };
	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }
	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }
	    this.tryEntries.push(entry);
	  }
	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }
	  function Context(tryLocsList) {
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }
	  exports.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }
	      next.done = true;
	      return next;
	    };
	  };
	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }
	      if (typeof iterable.next === "function") {
	        return iterable;
	      }
	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }
	          next.value = undefined$1;
	          next.done = true;
	          return next;
	        };
	        return next.next = next;
	      }
	    }
	    return { next: doneResult };
	  }
	  exports.values = values;
	  function doneResult() {
	    return { value: undefined$1, done: true };
	  }
	  Context.prototype = {
	    constructor: Context,
	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      this.sent = this._sent = undefined$1;
	      this.done = false;
	      this.delegate = null;
	      this.method = "next";
	      this.arg = undefined$1;
	      this.tryEntries.forEach(resetTryEntry);
	      if (!skipTempReset) {
	        for (var name in this) {
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined$1;
	          }
	        }
	      }
	    },
	    stop: function() {
	      this.done = true;
	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }
	      return this.rval;
	    },
	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }
	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;
	        if (caught) {
	          context.method = "next";
	          context.arg = undefined$1;
	        }
	        return !! caught;
	      }
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;
	        if (entry.tryLoc === "root") {
	          return handle("end");
	        }
	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");
	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }
	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }
	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },
	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }
	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        finallyEntry = null;
	      }
	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;
	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }
	      return this.complete(record);
	    },
	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }
	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }
	      return ContinueSentinel;
	    },
	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },
	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }
	      throw new Error("illegal catch attempt");
	    },
	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };
	      if (this.method === "next") {
	        this.arg = undefined$1;
	      }
	      return ContinueSentinel;
	    }
	  };
	  return exports;
	}(
	   module.exports 
	));
	try {
	  regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
	  Function("r", "regeneratorRuntime = r")(runtime);
	}
	});

	Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector),window.Element&&!Element.prototype.closest&&(Element.prototype.closest=function(e){var t=this;do{if(t.matches(e))return t;t=t.parentElement||t.parentNode;}while(null!==t&&1===t.nodeType);return null});

	if (!Element.prototype.remove) {
	  Element.prototype.remove = function remove() {
	    this.parentNode.removeChild(this);
	  };
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
	    Promise.resolve(value).then(_next, _throw);
	  }
	}

	function _asyncToGenerator(fn) {
	  return function () {
	    var self = this,
	        args = arguments;
	    return new Promise(function (resolve, reject) {
	      var gen = fn.apply(self, args);

	      function _next(value) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
	      }

	      function _throw(err) {
	        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
	      }

	      _next(undefined);
	    });
	  };
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
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
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _isNativeReflectConstruct() {
	  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
	  if (Reflect.construct.sham) return false;
	  if (typeof Proxy === "function") return true;

	  try {
	    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
	    return true;
	  } catch (e) {
	    return false;
	  }
	}

	function _construct(Parent, args, Class) {
	  if (_isNativeReflectConstruct()) {
	    _construct = Reflect.construct;
	  } else {
	    _construct = function _construct(Parent, args, Class) {
	      var a = [null];
	      a.push.apply(a, args);
	      var Constructor = Function.bind.apply(Parent, a);
	      var instance = new Constructor();
	      if (Class) _setPrototypeOf(instance, Class.prototype);
	      return instance;
	    };
	  }

	  return _construct.apply(null, arguments);
	}

	function _isNativeFunction(fn) {
	  return Function.toString.call(fn).indexOf("[native code]") !== -1;
	}

	function _wrapNativeSuper(Class) {
	  var _cache = typeof Map === "function" ? new Map() : undefined;

	  _wrapNativeSuper = function _wrapNativeSuper(Class) {
	    if (Class === null || !_isNativeFunction(Class)) return Class;

	    if (typeof Class !== "function") {
	      throw new TypeError("Super expression must either be null or a function");
	    }

	    if (typeof _cache !== "undefined") {
	      if (_cache.has(Class)) return _cache.get(Class);

	      _cache.set(Class, Wrapper);
	    }

	    function Wrapper() {
	      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
	    }

	    Wrapper.prototype = Object.create(Class.prototype, {
	      constructor: {
	        value: Wrapper,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    return _setPrototypeOf(Wrapper, Class);
	  };

	  return _wrapNativeSuper(Class);
	}

	function _objectWithoutPropertiesLoose(source, excluded) {
	  if (source == null) return {};
	  var target = {};
	  var sourceKeys = Object.keys(source);
	  var key, i;

	  for (i = 0; i < sourceKeys.length; i++) {
	    key = sourceKeys[i];
	    if (excluded.indexOf(key) >= 0) continue;
	    target[key] = source[key];
	  }

	  return target;
	}

	function _objectWithoutProperties(source, excluded) {
	  if (source == null) return {};

	  var target = _objectWithoutPropertiesLoose(source, excluded);

	  var key, i;

	  if (Object.getOwnPropertySymbols) {
	    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

	    for (i = 0; i < sourceSymbolKeys.length; i++) {
	      key = sourceSymbolKeys[i];
	      if (excluded.indexOf(key) >= 0) continue;
	      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
	      target[key] = source[key];
	    }
	  }

	  return target;
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (typeof call === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _createSuper(Derived) {
	  var hasNativeReflectConstruct = _isNativeReflectConstruct();

	  return function _createSuperInternal() {
	    var Super = _getPrototypeOf(Derived),
	        result;

	    if (hasNativeReflectConstruct) {
	      var NewTarget = _getPrototypeOf(this).constructor;

	      result = Reflect.construct(Super, arguments, NewTarget);
	    } else {
	      result = Super.apply(this, arguments);
	    }

	    return _possibleConstructorReturn(this, result);
	  };
	}

	function _superPropBase(object, property) {
	  while (!Object.prototype.hasOwnProperty.call(object, property)) {
	    object = _getPrototypeOf(object);
	    if (object === null) break;
	  }

	  return object;
	}

	function _get(target, property, receiver) {
	  if (typeof Reflect !== "undefined" && Reflect.get) {
	    _get = Reflect.get;
	  } else {
	    _get = function _get(target, property, receiver) {
	      var base = _superPropBase(target, property);

	      if (!base) return;
	      var desc = Object.getOwnPropertyDescriptor(base, property);

	      if (desc.get) {
	        return desc.get.call(receiver);
	      }

	      return desc.value;
	    };
	  }

	  return _get(target, property, receiver || target);
	}

	function _taggedTemplateLiteral(strings, raw) {
	  if (!raw) {
	    raw = strings.slice(0);
	  }

	  return Object.freeze(Object.defineProperties(strings, {
	    raw: {
	      value: Object.freeze(raw)
	    }
	  }));
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
	}

	function _iterableToArrayLimit(arr, i) {
	  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
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
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
	  var it;

	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
	      if (it) o = it;
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	var AbortError = function (_Error) {
	  _inherits(AbortError, _Error);
	  var _super = _createSuper(AbortError);
	  function AbortError() {
	    _classCallCheck(this, AbortError);
	    return _super.apply(this, arguments);
	  }
	  _createClass(AbortError, [{
	    key: "name",
	    get: function get() {
	      return "AbortError";
	    }
	  }]);
	  return AbortError;
	}( _wrapNativeSuper(Error));

	var WrappedError = function (_Error) {
	  _inherits(WrappedError, _Error);
	  var _super = _createSuper(WrappedError);
	  function WrappedError(message, cause) {
	    var _this;
	    _classCallCheck(this, WrappedError);
	    _this = _super.call(this, "".concat(message, ": ").concat(cause.message));
	    _this.cause = cause;
	    return _this;
	  }
	  _createClass(WrappedError, [{
	    key: "name",
	    get: function get() {
	      return "WrappedError";
	    }
	  }]);
	  return WrappedError;
	}( _wrapNativeSuper(Error));
	var HomeServerError = function (_Error2) {
	  _inherits(HomeServerError, _Error2);
	  var _super2 = _createSuper(HomeServerError);
	  function HomeServerError(method, url, body, status) {
	    var _this2;
	    _classCallCheck(this, HomeServerError);
	    _this2 = _super2.call(this, "".concat(body ? body.error : status, " on ").concat(method, " ").concat(url));
	    _this2.errcode = body ? body.errcode : null;
	    _this2.retry_after_ms = body ? body.retry_after_ms : 0;
	    _this2.statusCode = status;
	    return _this2;
	  }
	  _createClass(HomeServerError, [{
	    key: "name",
	    get: function get() {
	      return "HomeServerError";
	    }
	  }]);
	  return HomeServerError;
	}( _wrapNativeSuper(Error));
	var ConnectionError = function (_Error3) {
	  _inherits(ConnectionError, _Error3);
	  var _super3 = _createSuper(ConnectionError);
	  function ConnectionError(message, isTimeout) {
	    var _this3;
	    _classCallCheck(this, ConnectionError);
	    _this3 = _super3.call(this, message || "ConnectionError");
	    _this3.isTimeout = isTimeout;
	    return _this3;
	  }
	  _createClass(ConnectionError, [{
	    key: "name",
	    get: function get() {
	      return "ConnectionError";
	    }
	  }]);
	  return ConnectionError;
	}( _wrapNativeSuper(Error));

	function abortOnTimeout(createTimeout, timeoutAmount, requestResult, responsePromise) {
	  var timeout = createTimeout(timeoutAmount);
	  var timedOut = false;
	  timeout.elapsed().then(function () {
	    timedOut = true;
	    requestResult.abort();
	  }, function () {}
	  );
	  return responsePromise.then(function (response) {
	    timeout.abort();
	    return response;
	  }, function (err) {
	    timeout.abort();
	    if (err instanceof AbortError && timedOut) {
	      throw new ConnectionError("Request timed out after ".concat(timeoutAmount, "ms"), true);
	    } else {
	      throw err;
	    }
	  });
	}

	var RequestResult = function () {
	  function RequestResult(promise, controller) {
	    var _this = this;
	    _classCallCheck(this, RequestResult);
	    if (!controller) {
	      var abortPromise = new Promise(function (_, reject) {
	        _this._controller = {
	          abort: function abort() {
	            var err = new Error("fetch request aborted");
	            err.name = "AbortError";
	            reject(err);
	          }
	        };
	      });
	      this.promise = Promise.race([promise, abortPromise]);
	    } else {
	      this.promise = promise;
	      this._controller = controller;
	    }
	  }
	  _createClass(RequestResult, [{
	    key: "abort",
	    value: function abort() {
	      this._controller.abort();
	    }
	  }, {
	    key: "response",
	    value: function response() {
	      return this.promise;
	    }
	  }]);
	  return RequestResult;
	}();
	function createFetchRequest(createTimeout) {
	  return function fetchRequest(url, options) {
	    var controller = typeof AbortController === "function" ? new AbortController() : null;
	    if (controller) {
	      options = Object.assign(options, {
	        signal: controller.signal
	      });
	    }
	    options = Object.assign(options, {
	      mode: "cors",
	      credentials: "omit",
	      referrer: "no-referrer",
	      cache: "no-cache"
	    });
	    if (options.headers) {
	      var headers = new Headers();
	      var _iterator = _createForOfIteratorHelper(options.headers.entries()),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              name = _step$value[0],
	              value = _step$value[1];
	          headers.append(name, value);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      options.headers = headers;
	    }
	    var promise = fetch(url, options).then( function () {
	      var _ref = _asyncToGenerator( regeneratorRuntime.mark(function _callee(response) {
	        var status, body;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                status = response.status;
	                _context.next = 3;
	                return response.json();
	              case 3:
	                body = _context.sent;
	                return _context.abrupt("return", {
	                  status: status,
	                  body: body
	                });
	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));
	      return function (_x) {
	        return _ref.apply(this, arguments);
	      };
	    }(), function (err) {
	      if (err.name === "AbortError") {
	        throw new AbortError();
	      } else if (err instanceof TypeError) {
	        throw new ConnectionError("".concat(options.method, " ").concat(url, ": ").concat(err.message));
	      }
	      throw err;
	    });
	    var result = new RequestResult(promise, controller);
	    if (options.timeout) {
	      result.promise = abortOnTimeout(createTimeout, options.timeout, result, result.promise);
	    }
	    return result;
	  };
	}

	var RequestResult$1 = function () {
	  function RequestResult(promise, xhr) {
	    _classCallCheck(this, RequestResult);
	    this._promise = promise;
	    this._xhr = xhr;
	  }
	  _createClass(RequestResult, [{
	    key: "abort",
	    value: function abort() {
	      this._xhr.abort();
	    }
	  }, {
	    key: "response",
	    value: function response() {
	      return this._promise;
	    }
	  }]);
	  return RequestResult;
	}();
	function send(url, options) {
	  var xhr = new XMLHttpRequest();
	  xhr.open(options.method, url);
	  if (options.headers) {
	    var _iterator = _createForOfIteratorHelper(options.headers.entries()),
	        _step;
	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var _step$value = _slicedToArray(_step.value, 2),
	            name = _step$value[0],
	            value = _step$value[1];
	        xhr.setRequestHeader(name, value);
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  }
	  if (options.timeout) {
	    xhr.timeout = options.timeout;
	  }
	  xhr.send(options.body || null);
	  return xhr;
	}
	function xhrAsPromise(xhr, method, url) {
	  return new Promise(function (resolve, reject) {
	    xhr.addEventListener("load", function () {
	      return resolve(xhr);
	    });
	    xhr.addEventListener("abort", function () {
	      return reject(new AbortError());
	    });
	    xhr.addEventListener("error", function () {
	      return reject(new ConnectionError("Error ".concat(method, " ").concat(url)));
	    });
	    xhr.addEventListener("timeout", function () {
	      return reject(new ConnectionError("Timeout ".concat(method, " ").concat(url), true));
	    });
	  });
	}
	function _addCacheBuster(urlStr) {
	  var random = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Math.random;
	  if (urlStr.includes("?")) {
	    urlStr = urlStr + "&";
	  } else {
	    urlStr = urlStr + "?";
	  }
	  return urlStr + "_cacheBuster=".concat(Math.ceil(random() * Number.MAX_SAFE_INTEGER));
	}
	function xhrRequest(url, options) {
	  url = _addCacheBuster(url);
	  var xhr = send(url, options);
	  var promise = xhrAsPromise(xhr, options.method, url).then(function (xhr) {
	    var status = xhr.status;
	    var body = xhr.responseText;
	    if (xhr.getResponseHeader("Content-Type") === "application/json") {
	      body = JSON.parse(body);
	    }
	    return {
	      status: status,
	      body: body
	    };
	  });
	  return new RequestResult$1(promise, xhr);
	}

	function createEnum() {
	  var obj = {};
	  for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
	    values[_key] = arguments[_key];
	  }
	  for (var _i = 0, _values = values; _i < _values.length; _i++) {
	    var value = _values[_i];
	    obj[value] = value;
	  }
	  return Object.freeze(obj);
	}

	var BaseObservable = function () {
	  function BaseObservable() {
	    _classCallCheck(this, BaseObservable);
	    this._handlers = new Set();
	  }
	  _createClass(BaseObservable, [{
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {}
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {}
	  }, {
	    key: "subscribe",
	    value: function subscribe(handler) {
	      var _this = this;
	      this._handlers.add(handler);
	      if (this._handlers.size === 1) {
	        this.onSubscribeFirst();
	      }
	      return function () {
	        return _this.unsubscribe(handler);
	      };
	    }
	  }, {
	    key: "unsubscribe",
	    value: function unsubscribe(handler) {
	      if (handler) {
	        this._handlers.delete(handler);
	        if (this._handlers.size === 0) {
	          this.onUnsubscribeLast();
	        }
	        handler = null;
	      }
	      return null;
	    }
	  }]);
	  return BaseObservable;
	}();

	var BaseObservableValue = function (_BaseObservable) {
	  _inherits(BaseObservableValue, _BaseObservable);
	  var _super = _createSuper(BaseObservableValue);
	  function BaseObservableValue() {
	    _classCallCheck(this, BaseObservableValue);
	    return _super.apply(this, arguments);
	  }
	  _createClass(BaseObservableValue, [{
	    key: "emit",
	    value: function emit(argument) {
	      var _iterator = _createForOfIteratorHelper(this._handlers),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var h = _step.value;
	          h(argument);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }]);
	  return BaseObservableValue;
	}(BaseObservable);
	var WaitForHandle = function () {
	  function WaitForHandle(observable, predicate) {
	    var _this = this;
	    _classCallCheck(this, WaitForHandle);
	    this._promise = new Promise(function (resolve, reject) {
	      _this._reject = reject;
	      _this._subscription = observable.subscribe(function (v) {
	        if (predicate(v)) {
	          _this._reject = null;
	          resolve(v);
	          _this.dispose();
	        }
	      });
	    });
	  }
	  _createClass(WaitForHandle, [{
	    key: "dispose",
	    value: function dispose() {
	      if (this._subscription) {
	        this._subscription();
	        this._subscription = null;
	      }
	      if (this._reject) {
	        this._reject(new AbortError());
	        this._reject = null;
	      }
	    }
	  }, {
	    key: "promise",
	    get: function get() {
	      return this._promise;
	    }
	  }]);
	  return WaitForHandle;
	}();
	var ResolvedWaitForHandle = function () {
	  function ResolvedWaitForHandle(promise) {
	    _classCallCheck(this, ResolvedWaitForHandle);
	    this.promise = promise;
	  }
	  _createClass(ResolvedWaitForHandle, [{
	    key: "dispose",
	    value: function dispose() {}
	  }]);
	  return ResolvedWaitForHandle;
	}();
	var ObservableValue = function (_BaseObservableValue) {
	  _inherits(ObservableValue, _BaseObservableValue);
	  var _super2 = _createSuper(ObservableValue);
	  function ObservableValue(initialValue) {
	    var _this2;
	    _classCallCheck(this, ObservableValue);
	    _this2 = _super2.call(this);
	    _this2._value = initialValue;
	    return _this2;
	  }
	  _createClass(ObservableValue, [{
	    key: "get",
	    value: function get() {
	      return this._value;
	    }
	  }, {
	    key: "set",
	    value: function set(value) {
	      if (value !== this._value) {
	        this._value = value;
	        this.emit(this._value);
	      }
	    }
	  }, {
	    key: "waitFor",
	    value: function waitFor(predicate) {
	      if (predicate(this.get())) {
	        return new ResolvedWaitForHandle(Promise.resolve(this.get()));
	      } else {
	        return new WaitForHandle(this, predicate);
	      }
	    }
	  }]);
	  return ObservableValue;
	}(BaseObservableValue);

	var RequestWrapper = function () {
	  function RequestWrapper(method, url, requestResult) {
	    _classCallCheck(this, RequestWrapper);
	    this._requestResult = requestResult;
	    this._promise = requestResult.response().then(function (response) {
	      if (response.status >= 200 && response.status < 300) {
	        return response.body;
	      } else {
	        switch (response.status) {
	          default:
	            throw new HomeServerError(method, url, response.body, response.status);
	        }
	      }
	    });
	  }
	  _createClass(RequestWrapper, [{
	    key: "abort",
	    value: function abort() {
	      return this._requestResult.abort();
	    }
	  }, {
	    key: "response",
	    value: function response() {
	      return this._promise;
	    }
	  }]);
	  return RequestWrapper;
	}();
	function encodeQueryParams(queryParams) {
	  return Object.entries(queryParams || {}).filter(function (_ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        value = _ref2[1];
	    return value !== undefined;
	  }).map(function (_ref3) {
	    var _ref4 = _slicedToArray(_ref3, 2),
	        name = _ref4[0],
	        value = _ref4[1];
	    if (_typeof(value) === "object") {
	      value = JSON.stringify(value);
	    }
	    return "".concat(encodeURIComponent(name), "=").concat(encodeURIComponent(value));
	  }).join("&");
	}
	var HomeServerApi = function () {
	  function HomeServerApi(_ref5) {
	    var homeServer = _ref5.homeServer,
	        accessToken = _ref5.accessToken,
	        request = _ref5.request,
	        createTimeout = _ref5.createTimeout,
	        reconnector = _ref5.reconnector;
	    _classCallCheck(this, HomeServerApi);
	    this._homeserver = homeServer;
	    this._accessToken = accessToken;
	    this._requestFn = request;
	    this._createTimeout = createTimeout;
	    this._reconnector = reconnector;
	    this._mediaRepository = new MediaRepository(homeServer);
	  }
	  _createClass(HomeServerApi, [{
	    key: "_url",
	    value: function _url(csPath) {
	      return "".concat(this._homeserver, "/_matrix/client/r0").concat(csPath);
	    }
	  }, {
	    key: "_request",
	    value: function _request(method, url, queryParams, body, options) {
	      var _this = this;
	      var queryString = encodeQueryParams(queryParams);
	      url = "".concat(url, "?").concat(queryString);
	      var bodyString;
	      var headers = new Map();
	      if (this._accessToken) {
	        headers.set("Authorization", "Bearer ".concat(this._accessToken));
	      }
	      headers.set("Accept", "application/json");
	      if (body) {
	        headers.set("Content-Type", "application/json");
	        bodyString = JSON.stringify(body);
	      }
	      var requestResult = this._requestFn(url, {
	        method: method,
	        headers: headers,
	        body: bodyString,
	        timeout: options && options.timeout
	      });
	      var wrapper = new RequestWrapper(method, url, requestResult);
	      if (this._reconnector) {
	        wrapper.response().catch(function (err) {
	          if (err.name === "ConnectionError") {
	            _this._reconnector.onRequestFailed(_this);
	          }
	        });
	      }
	      return wrapper;
	    }
	  }, {
	    key: "_post",
	    value: function _post(csPath, queryParams, body, options) {
	      return this._request("POST", this._url(csPath), queryParams, body, options);
	    }
	  }, {
	    key: "_put",
	    value: function _put(csPath, queryParams, body, options) {
	      return this._request("PUT", this._url(csPath), queryParams, body, options);
	    }
	  }, {
	    key: "_get",
	    value: function _get(csPath, queryParams, body, options) {
	      return this._request("GET", this._url(csPath), queryParams, body, options);
	    }
	  }, {
	    key: "sync",
	    value: function sync(since, filter, timeout) {
	      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      return this._get("/sync", {
	        since: since,
	        timeout: timeout,
	        filter: filter
	      }, null, options);
	    }
	  }, {
	    key: "messages",
	    value: function messages(roomId, params) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	      return this._get("/rooms/".concat(encodeURIComponent(roomId), "/messages"), params, null, options);
	    }
	  }, {
	    key: "members",
	    value: function members(roomId, params) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	      return this._get("/rooms/".concat(encodeURIComponent(roomId), "/members"), params, null, options);
	    }
	  }, {
	    key: "send",
	    value: function send(roomId, eventType, txnId, content) {
	      var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	      return this._put("/rooms/".concat(encodeURIComponent(roomId), "/send/").concat(encodeURIComponent(eventType), "/").concat(encodeURIComponent(txnId)), {}, content, options);
	    }
	  }, {
	    key: "receipt",
	    value: function receipt(roomId, receiptType, eventId) {
	      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      return this._post("/rooms/".concat(encodeURIComponent(roomId), "/receipt/").concat(encodeURIComponent(receiptType), "/").concat(encodeURIComponent(eventId)), {}, {}, options);
	    }
	  }, {
	    key: "passwordLogin",
	    value: function passwordLogin(username, password, initialDeviceDisplayName) {
	      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      return this._post("/login", null, {
	        "type": "m.login.password",
	        "identifier": {
	          "type": "m.id.user",
	          "user": username
	        },
	        "password": password,
	        "initial_device_display_name": initialDeviceDisplayName
	      }, options);
	    }
	  }, {
	    key: "createFilter",
	    value: function createFilter(userId, filter) {
	      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	      return this._post("/user/".concat(encodeURIComponent(userId), "/filter"), null, filter, options);
	    }
	  }, {
	    key: "versions",
	    value: function versions() {
	      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	      return this._request("GET", "".concat(this._homeserver, "/_matrix/client/versions"), null, null, options);
	    }
	  }, {
	    key: "uploadKeys",
	    value: function uploadKeys(payload) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      return this._post("/keys/upload", null, payload, options);
	    }
	  }, {
	    key: "queryKeys",
	    value: function queryKeys(queryRequest) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      return this._post("/keys/query", null, queryRequest, options);
	    }
	  }, {
	    key: "claimKeys",
	    value: function claimKeys(payload) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      return this._post("/keys/claim", null, payload, options);
	    }
	  }, {
	    key: "sendToDevice",
	    value: function sendToDevice(type, payload, txnId) {
	      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      return this._put("/sendToDevice/".concat(encodeURIComponent(type), "/").concat(encodeURIComponent(txnId)), null, payload, options);
	    }
	  }, {
	    key: "mediaRepository",
	    get: function get() {
	      return this._mediaRepository;
	    }
	  }]);
	  return HomeServerApi;
	}();
	var MediaRepository = function () {
	  function MediaRepository(homeserver) {
	    _classCallCheck(this, MediaRepository);
	    this._homeserver = homeserver;
	  }
	  _createClass(MediaRepository, [{
	    key: "mxcUrlThumbnail",
	    value: function mxcUrlThumbnail(url, width, height, method) {
	      var parts = this._parseMxcUrl(url);
	      if (parts) {
	        var _parts = _slicedToArray(parts, 2),
	            serverName = _parts[0],
	            mediaId = _parts[1];
	        var httpUrl = "".concat(this._homeserver, "/_matrix/media/r0/thumbnail/").concat(encodeURIComponent(serverName), "/").concat(encodeURIComponent(mediaId));
	        return httpUrl + "?" + encodeQueryParams({
	          width: width,
	          height: height,
	          method: method
	        });
	      }
	      return null;
	    }
	  }, {
	    key: "mxcUrl",
	    value: function mxcUrl(url) {
	      var parts = this._parseMxcUrl(url);
	      if (parts) {
	        var _parts2 = _slicedToArray(parts, 2),
	            serverName = _parts2[0],
	            mediaId = _parts2[1];
	        return "".concat(this._homeserver, "/_matrix/media/r0/download/").concat(encodeURIComponent(serverName), "/").concat(encodeURIComponent(mediaId));
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: "_parseMxcUrl",
	    value: function _parseMxcUrl(url) {
	      var prefix = "mxc://";
	      if (url.startsWith(prefix)) {
	        return url.substr(prefix.length).split("/", 2);
	      } else {
	        return null;
	      }
	    }
	  }]);
	  return MediaRepository;
	}();

	var Timeout = function () {
	  function Timeout(elapsed, ms) {
	    _classCallCheck(this, Timeout);
	    this._reject = null;
	    this._handle = null;
	    var timeoutValue = elapsed.get() + ms;
	    this._waitHandle = elapsed.waitFor(function (t) {
	      return t >= timeoutValue;
	    });
	  }
	  _createClass(Timeout, [{
	    key: "elapsed",
	    value: function elapsed() {
	      return this._waitHandle.promise;
	    }
	  }, {
	    key: "abort",
	    value: function abort() {
	      this._waitHandle.dispose();
	    }
	  }]);
	  return Timeout;
	}();
	var Interval = function () {
	  function Interval(elapsed, ms, callback) {
	    _classCallCheck(this, Interval);
	    this._start = elapsed.get();
	    this._last = this._start;
	    this._interval = ms;
	    this._callback = callback;
	    this._subscription = elapsed.subscribe(this._update.bind(this));
	  }
	  _createClass(Interval, [{
	    key: "_update",
	    value: function _update(elapsed) {
	      var prevAmount = Math.floor((this._last - this._start) / this._interval);
	      var newAmount = Math.floor((elapsed - this._start) / this._interval);
	      var amountDiff = Math.max(0, newAmount - prevAmount);
	      this._last = elapsed;
	      for (var i = 0; i < amountDiff; ++i) {
	        this._callback();
	      }
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this._subscription) {
	        this._subscription();
	        this._subscription = null;
	      }
	    }
	  }]);
	  return Interval;
	}();
	var TimeMeasure = function () {
	  function TimeMeasure(elapsed) {
	    _classCallCheck(this, TimeMeasure);
	    this._elapsed = elapsed;
	    this._start = elapsed.get();
	  }
	  _createClass(TimeMeasure, [{
	    key: "measure",
	    value: function measure() {
	      return this._elapsed.get() - this._start;
	    }
	  }]);
	  return TimeMeasure;
	}();
	var Clock = function () {
	  function Clock() {
	    var baseTimestamp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	    _classCallCheck(this, Clock);
	    this._baseTimestamp = baseTimestamp;
	    this._elapsed = new ObservableValue(0);
	    this.createMeasure = this.createMeasure.bind(this);
	    this.createTimeout = this.createTimeout.bind(this);
	    this.now = this.now.bind(this);
	  }
	  _createClass(Clock, [{
	    key: "createMeasure",
	    value: function createMeasure() {
	      return new TimeMeasure(this._elapsed);
	    }
	  }, {
	    key: "createTimeout",
	    value: function createTimeout(ms) {
	      return new Timeout(this._elapsed, ms);
	    }
	  }, {
	    key: "createInterval",
	    value: function createInterval(callback, ms) {
	      return new Interval(this._elapsed, ms, callback);
	    }
	  }, {
	    key: "now",
	    value: function now() {
	      return this._baseTimestamp + this.elapsed;
	    }
	  }, {
	    key: "elapse",
	    value: function elapse(ms) {
	      this._elapsed.set(this._elapsed.get() + Math.max(0, ms));
	    }
	  }, {
	    key: "elapsed",
	    get: function get() {
	      return this._elapsed.get();
	    }
	  }]);
	  return Clock;
	}();

	var ExponentialRetryDelay = function () {
	  function ExponentialRetryDelay(createTimeout) {
	    _classCallCheck(this, ExponentialRetryDelay);
	    var start = 2000;
	    this._start = start;
	    this._current = start;
	    this._createTimeout = createTimeout;
	    this._max = 60 * 5 * 1000;
	    this._timeout = null;
	  }
	  _createClass(ExponentialRetryDelay, [{
	    key: "waitForRetry",
	    value: function () {
	      var _waitForRetry = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        var next;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._timeout = this._createTimeout(this._current);
	                _context.prev = 1;
	                _context.next = 4;
	                return this._timeout.elapsed();
	              case 4:
	                next = 2 * this._current;
	                this._current = Math.min(this._max, next);
	                _context.next = 12;
	                break;
	              case 8:
	                _context.prev = 8;
	                _context.t0 = _context["catch"](1);
	                if (_context.t0 instanceof AbortError) {
	                  _context.next = 12;
	                  break;
	                }
	                throw _context.t0;
	              case 12:
	                _context.prev = 12;
	                this._timeout = null;
	                return _context.finish(12);
	              case 15:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[1, 8, 12, 15]]);
	      }));
	      function waitForRetry() {
	        return _waitForRetry.apply(this, arguments);
	      }
	      return waitForRetry;
	    }()
	  }, {
	    key: "abort",
	    value: function abort() {
	      if (this._timeout) {
	        this._timeout.abort();
	      }
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this._current = this._start;
	      this.abort();
	    }
	  }, {
	    key: "nextValue",
	    get: function get() {
	      return this._current;
	    }
	  }]);
	  return ExponentialRetryDelay;
	}();

	var ConnectionStatus = createEnum("Waiting", "Reconnecting", "Online");
	var Reconnector = function () {
	  function Reconnector(_ref) {
	    var retryDelay = _ref.retryDelay,
	        createMeasure = _ref.createMeasure,
	        onlineStatus = _ref.onlineStatus;
	    _classCallCheck(this, Reconnector);
	    this._onlineStatus = onlineStatus;
	    this._retryDelay = retryDelay;
	    this._createTimeMeasure = createMeasure;
	    this._state = new ObservableValue(ConnectionStatus.Online);
	    this._isReconnecting = false;
	    this._versionsResponse = null;
	  }
	  _createClass(Reconnector, [{
	    key: "onRequestFailed",
	    value: function () {
	      var _onRequestFailed = _asyncToGenerator( regeneratorRuntime.mark(function _callee(hsApi) {
	        var _this = this;
	        var onlineStatusSubscription;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (this._isReconnecting) {
	                  _context.next = 15;
	                  break;
	                }
	                this._isReconnecting = true;
	                onlineStatusSubscription = this._onlineStatus && this._onlineStatus.subscribe(function (online) {
	                  if (online) {
	                    _this.tryNow();
	                  }
	                });
	                _context.prev = 3;
	                _context.next = 6;
	                return this._reconnectLoop(hsApi);
	              case 6:
	                _context.next = 11;
	                break;
	              case 8:
	                _context.prev = 8;
	                _context.t0 = _context["catch"](3);
	                console.error(_context.t0);
	              case 11:
	                _context.prev = 11;
	                if (onlineStatusSubscription) {
	                  onlineStatusSubscription();
	                }
	                this._isReconnecting = false;
	                return _context.finish(11);
	              case 15:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[3, 8, 11, 15]]);
	      }));
	      function onRequestFailed(_x) {
	        return _onRequestFailed.apply(this, arguments);
	      }
	      return onRequestFailed;
	    }()
	  }, {
	    key: "tryNow",
	    value: function tryNow() {
	      if (this._retryDelay) {
	        this._retryDelay.abort();
	      }
	    }
	  }, {
	    key: "_setState",
	    value: function _setState(state) {
	      if (state !== this._state.get()) {
	        if (state === ConnectionStatus.Waiting) {
	          this._stateSince = this._createTimeMeasure();
	        } else {
	          this._stateSince = null;
	        }
	        this._state.set(state);
	      }
	    }
	  }, {
	    key: "_reconnectLoop",
	    value: function () {
	      var _reconnectLoop2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(hsApi) {
	        var versionsRequest;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                this._versionsResponse = null;
	                this._retryDelay.reset();
	              case 2:
	                if (this._versionsResponse) {
	                  _context2.next = 23;
	                  break;
	                }
	                _context2.prev = 3;
	                this._setState(ConnectionStatus.Reconnecting);
	                versionsRequest = hsApi.versions({
	                  timeout: 30000
	                });
	                _context2.next = 8;
	                return versionsRequest.response();
	              case 8:
	                this._versionsResponse = _context2.sent;
	                this._setState(ConnectionStatus.Online);
	                _context2.next = 21;
	                break;
	              case 12:
	                _context2.prev = 12;
	                _context2.t0 = _context2["catch"](3);
	                if (!(_context2.t0.name === "ConnectionError")) {
	                  _context2.next = 20;
	                  break;
	                }
	                this._setState(ConnectionStatus.Waiting);
	                _context2.next = 18;
	                return this._retryDelay.waitForRetry();
	              case 18:
	                _context2.next = 21;
	                break;
	              case 20:
	                throw _context2.t0;
	              case 21:
	                _context2.next = 2;
	                break;
	              case 23:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[3, 12]]);
	      }));
	      function _reconnectLoop(_x2) {
	        return _reconnectLoop2.apply(this, arguments);
	      }
	      return _reconnectLoop;
	    }()
	  }, {
	    key: "lastVersionsResponse",
	    get: function get() {
	      return this._versionsResponse;
	    }
	  }, {
	    key: "connectionStatus",
	    get: function get() {
	      return this._state;
	    }
	  }, {
	    key: "retryIn",
	    get: function get() {
	      if (this._state.get() === ConnectionStatus.Waiting) {
	        return this._retryDelay.nextValue - this._stateSince.measure();
	      }
	      return 0;
	    }
	  }]);
	  return Reconnector;
	}();

	var INCREMENTAL_TIMEOUT = 30000;
	var SyncStatus = createEnum("InitialSync", "CatchupSync", "Syncing", "Stopped");
	function timelineIsEmpty(roomResponse) {
	  try {
	    var _roomResponse$timelin;
	    var events = roomResponse === null || roomResponse === void 0 ? void 0 : (_roomResponse$timelin = roomResponse.timeline) === null || _roomResponse$timelin === void 0 ? void 0 : _roomResponse$timelin.events;
	    return Array.isArray(events) && events.length === 0;
	  } catch (err) {
	    return true;
	  }
	}
	var Sync = function () {
	  function Sync(_ref) {
	    var hsApi = _ref.hsApi,
	        session = _ref.session,
	        storage = _ref.storage;
	    _classCallCheck(this, Sync);
	    this._hsApi = hsApi;
	    this._session = session;
	    this._storage = storage;
	    this._currentRequest = null;
	    this._status = new ObservableValue(SyncStatus.Stopped);
	    this._error = null;
	  }
	  _createClass(Sync, [{
	    key: "start",
	    value: function start() {
	      if (this._status.get() !== SyncStatus.Stopped) {
	        return;
	      }
	      var syncToken = this._session.syncToken;
	      if (syncToken) {
	        this._status.set(SyncStatus.CatchupSync);
	      } else {
	        this._status.set(SyncStatus.InitialSync);
	      }
	      this._syncLoop(syncToken);
	    }
	  }, {
	    key: "_syncLoop",
	    value: function () {
	      var _syncLoop2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(syncToken) {
	        var afterSyncCompletedPromise, roomStates, timeout, syncResult;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                afterSyncCompletedPromise = Promise.resolve();
	              case 1:
	                if (!(this._status.get() !== SyncStatus.Stopped)) {
	                  _context.next = 20;
	                  break;
	                }
	                roomStates = void 0;
	                _context.prev = 3;
	                console.log("starting sync request with since ".concat(syncToken, " ..."));
	                timeout = syncToken ? INCREMENTAL_TIMEOUT : undefined;
	                _context.next = 8;
	                return this._syncRequest(syncToken, timeout, afterSyncCompletedPromise);
	              case 8:
	                syncResult = _context.sent;
	                syncToken = syncResult.syncToken;
	                roomStates = syncResult.roomStates;
	                this._status.set(SyncStatus.Syncing);
	                _context.next = 17;
	                break;
	              case 14:
	                _context.prev = 14;
	                _context.t0 = _context["catch"](3);
	                if (!(_context.t0 instanceof AbortError)) {
	                  this._error = _context.t0;
	                  this._status.set(SyncStatus.Stopped);
	                }
	              case 17:
	                if (!this._error) {
	                  afterSyncCompletedPromise = this._runAfterSyncCompleted(roomStates);
	                }
	                _context.next = 1;
	                break;
	              case 20:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[3, 14]]);
	      }));
	      function _syncLoop(_x) {
	        return _syncLoop2.apply(this, arguments);
	      }
	      return _syncLoop;
	    }()
	  }, {
	    key: "_runAfterSyncCompleted",
	    value: function () {
	      var _runAfterSyncCompleted2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(roomStates) {
	        var _this = this;
	        var sessionPromise, roomsNeedingAfterSyncCompleted, roomsPromises;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                sessionPromise = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
	                    while (1) {
	                      switch (_context2.prev = _context2.next) {
	                        case 0:
	                          _context2.prev = 0;
	                          _context2.next = 3;
	                          return _this._session.afterSyncCompleted();
	                        case 3:
	                          _context2.next = 8;
	                          break;
	                        case 5:
	                          _context2.prev = 5;
	                          _context2.t0 = _context2["catch"](0);
	                          console.error("error during session afterSyncCompleted, continuing", _context2.t0.stack);
	                        case 8:
	                        case "end":
	                          return _context2.stop();
	                      }
	                    }
	                  }, _callee2, null, [[0, 5]]);
	                }))();
	                roomsNeedingAfterSyncCompleted = roomStates.filter(function (rs) {
	                  return rs.room.needsAfterSyncCompleted(rs.changes);
	                });
	                roomsPromises = roomsNeedingAfterSyncCompleted.map( function () {
	                  var _ref3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(rs) {
	                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	                      while (1) {
	                        switch (_context3.prev = _context3.next) {
	                          case 0:
	                            _context3.prev = 0;
	                            _context3.next = 3;
	                            return rs.room.afterSyncCompleted(rs.changes);
	                          case 3:
	                            _context3.next = 8;
	                            break;
	                          case 5:
	                            _context3.prev = 5;
	                            _context3.t0 = _context3["catch"](0);
	                            console.error("error during room ".concat(rs.room.id, " afterSyncCompleted, continuing"), _context3.t0.stack);
	                          case 8:
	                          case "end":
	                            return _context3.stop();
	                        }
	                      }
	                    }, _callee3, null, [[0, 5]]);
	                  }));
	                  return function (_x3) {
	                    return _ref3.apply(this, arguments);
	                  };
	                }());
	                _context4.next = 5;
	                return Promise.all(roomsPromises.concat(sessionPromise));
	              case 5:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4);
	      }));
	      function _runAfterSyncCompleted(_x2) {
	        return _runAfterSyncCompleted2.apply(this, arguments);
	      }
	      return _runAfterSyncCompleted;
	    }()
	  }, {
	    key: "_syncRequest",
	    value: function () {
	      var _syncRequest2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(syncToken, timeout, prevAfterSyncCompletedPromise) {
	        var syncFilterId, totalRequestTimeout, response, isInitialSync, roomStates, sessionChanges, syncTxn, _iterator, _step, rs;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                syncFilterId = this._session.syncFilterId;
	                if (!(typeof syncFilterId !== "string")) {
	                  _context6.next = 6;
	                  break;
	                }
	                this._currentRequest = this._hsApi.createFilter(this._session.user.id, {
	                  room: {
	                    state: {
	                      lazy_load_members: true
	                    }
	                  }
	                });
	                _context6.next = 5;
	                return this._currentRequest.response();
	              case 5:
	                syncFilterId = _context6.sent.filter_id;
	              case 6:
	                totalRequestTimeout = timeout + 80 * 1000;
	                this._currentRequest = this._hsApi.sync(syncToken, syncFilterId, timeout, {
	                  timeout: totalRequestTimeout
	                });
	                _context6.next = 10;
	                return this._currentRequest.response();
	              case 10:
	                response = _context6.sent;
	                _context6.next = 13;
	                return prevAfterSyncCompletedPromise;
	              case 13:
	                isInitialSync = !syncToken;
	                syncToken = response.next_batch;
	                roomStates = this._parseRoomsResponse(response.rooms, isInitialSync);
	                _context6.next = 18;
	                return this._prepareRooms(roomStates);
	              case 18:
	                _context6.next = 20;
	                return this._openSyncTxn();
	              case 20:
	                syncTxn = _context6.sent;
	                _context6.prev = 21;
	                _context6.next = 24;
	                return Promise.all(roomStates.map( function () {
	                  var _ref4 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(rs) {
	                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
	                      while (1) {
	                        switch (_context5.prev = _context5.next) {
	                          case 0:
	                            console.log(" * applying sync response to room ".concat(rs.room.id, " ..."));
	                            _context5.next = 3;
	                            return rs.room.writeSync(rs.roomResponse, rs.membership, isInitialSync, rs.preparation, syncTxn);
	                          case 3:
	                            rs.changes = _context5.sent;
	                          case 4:
	                          case "end":
	                            return _context5.stop();
	                        }
	                      }
	                    }, _callee5);
	                  }));
	                  return function (_x7) {
	                    return _ref4.apply(this, arguments);
	                  };
	                }()));
	              case 24:
	                _context6.next = 26;
	                return this._session.writeSync(response, syncFilterId, syncTxn);
	              case 26:
	                sessionChanges = _context6.sent;
	                _context6.next = 35;
	                break;
	              case 29:
	                _context6.prev = 29;
	                _context6.t0 = _context6["catch"](21);
	                console.warn("aborting syncTxn because of error");
	                console.error(_context6.t0);
	                syncTxn.abort();
	                throw _context6.t0;
	              case 35:
	                _context6.prev = 35;
	                _context6.next = 38;
	                return syncTxn.complete();
	              case 38:
	                console.info("syncTxn committed!!");
	                _context6.next = 45;
	                break;
	              case 41:
	                _context6.prev = 41;
	                _context6.t1 = _context6["catch"](35);
	                console.error("unable to commit sync tranaction");
	                throw _context6.t1;
	              case 45:
	                this._session.afterSync(sessionChanges);
	                _iterator = _createForOfIteratorHelper(roomStates);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    rs = _step.value;
	                    rs.room.afterSync(rs.changes);
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	                return _context6.abrupt("return", {
	                  syncToken: syncToken,
	                  roomStates: roomStates
	                });
	              case 49:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this, [[21, 29], [35, 41]]);
	      }));
	      function _syncRequest(_x4, _x5, _x6) {
	        return _syncRequest2.apply(this, arguments);
	      }
	      return _syncRequest;
	    }()
	  }, {
	    key: "_openPrepareSyncTxn",
	    value: function () {
	      var _openPrepareSyncTxn2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee7() {
	        var storeNames;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                storeNames = this._storage.storeNames;
	                _context7.next = 3;
	                return this._storage.readTxn([storeNames.inboundGroupSessions]);
	              case 3:
	                return _context7.abrupt("return", _context7.sent);
	              case 4:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));
	      function _openPrepareSyncTxn() {
	        return _openPrepareSyncTxn2.apply(this, arguments);
	      }
	      return _openPrepareSyncTxn;
	    }()
	  }, {
	    key: "_prepareRooms",
	    value: function () {
	      var _prepareRooms2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee10(roomStates) {
	        var prepareRoomStates, prepareTxn;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                prepareRoomStates = roomStates.filter(function (rs) {
	                  return rs.room.needsPrepareSync;
	                });
	                if (!prepareRoomStates.length) {
	                  _context10.next = 9;
	                  break;
	                }
	                _context10.next = 4;
	                return this._openPrepareSyncTxn();
	              case 4:
	                prepareTxn = _context10.sent;
	                _context10.next = 7;
	                return Promise.all(prepareRoomStates.map( function () {
	                  var _ref5 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(rs) {
	                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
	                      while (1) {
	                        switch (_context8.prev = _context8.next) {
	                          case 0:
	                            _context8.next = 2;
	                            return rs.room.prepareSync(rs.roomResponse, prepareTxn);
	                          case 2:
	                            rs.preparation = _context8.sent;
	                          case 3:
	                          case "end":
	                            return _context8.stop();
	                        }
	                      }
	                    }, _callee8);
	                  }));
	                  return function (_x9) {
	                    return _ref5.apply(this, arguments);
	                  };
	                }()));
	              case 7:
	                _context10.next = 9;
	                return Promise.all(prepareRoomStates.map( function () {
	                  var _ref6 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(rs) {
	                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
	                      while (1) {
	                        switch (_context9.prev = _context9.next) {
	                          case 0:
	                            _context9.next = 2;
	                            return rs.room.afterPrepareSync(rs.preparation);
	                          case 2:
	                            rs.preparation = _context9.sent;
	                          case 3:
	                          case "end":
	                            return _context9.stop();
	                        }
	                      }
	                    }, _callee9);
	                  }));
	                  return function (_x10) {
	                    return _ref6.apply(this, arguments);
	                  };
	                }()));
	              case 9:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this);
	      }));
	      function _prepareRooms(_x8) {
	        return _prepareRooms2.apply(this, arguments);
	      }
	      return _prepareRooms;
	    }()
	  }, {
	    key: "_openSyncTxn",
	    value: function () {
	      var _openSyncTxn2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee11() {
	        var storeNames;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                storeNames = this._storage.storeNames;
	                _context11.next = 3;
	                return this._storage.readWriteTxn([storeNames.session, storeNames.roomSummary, storeNames.roomState, storeNames.roomMembers, storeNames.timelineEvents, storeNames.timelineFragments, storeNames.pendingEvents, storeNames.userIdentities, storeNames.groupSessionDecryptions, storeNames.deviceIdentities,
	                storeNames.outboundGroupSessions]);
	              case 3:
	                return _context11.abrupt("return", _context11.sent);
	              case 4:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));
	      function _openSyncTxn() {
	        return _openSyncTxn2.apply(this, arguments);
	      }
	      return _openSyncTxn;
	    }()
	  }, {
	    key: "_parseRoomsResponse",
	    value: function _parseRoomsResponse(roomsSection, isInitialSync) {
	      var roomStates = [];
	      if (roomsSection) {
	        var allMemberships = ["join"];
	        for (var _i = 0, _allMemberships = allMemberships; _i < _allMemberships.length; _i++) {
	          var membership = _allMemberships[_i];
	          var membershipSection = roomsSection[membership];
	          if (membershipSection) {
	            for (var _i2 = 0, _Object$entries = Object.entries(membershipSection); _i2 < _Object$entries.length; _i2++) {
	              var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
	                  roomId = _Object$entries$_i[0],
	                  roomResponse = _Object$entries$_i[1];
	              if (isInitialSync && timelineIsEmpty(roomResponse)) {
	                return;
	              }
	              var room = this._session.rooms.get(roomId);
	              if (!room) {
	                room = this._session.createRoom(roomId);
	              }
	              roomStates.push(new RoomSyncProcessState(room, roomResponse, membership));
	            }
	          }
	        }
	      }
	      return roomStates;
	    }
	  }, {
	    key: "stop",
	    value: function stop() {
	      if (this._status.get() === SyncStatus.Stopped) {
	        return;
	      }
	      this._status.set(SyncStatus.Stopped);
	      if (this._currentRequest) {
	        this._currentRequest.abort();
	        this._currentRequest = null;
	      }
	    }
	  }, {
	    key: "status",
	    get: function get() {
	      return this._status;
	    }
	  }, {
	    key: "error",
	    get: function get() {
	      return this._error;
	    }
	  }]);
	  return Sync;
	}();
	var RoomSyncProcessState = function RoomSyncProcessState(room, roomResponse, membership) {
	  _classCallCheck(this, RoomSyncProcessState);
	  this.room = room;
	  this.roomResponse = roomResponse;
	  this.membership = membership;
	  this.preparation = null;
	  this.changes = null;
	};

	var EventEmitter = function () {
	  function EventEmitter() {
	    _classCallCheck(this, EventEmitter);
	    this._handlersByName = {};
	  }
	  _createClass(EventEmitter, [{
	    key: "emit",
	    value: function emit(name) {
	      var handlers = this._handlersByName[name];
	      if (handlers) {
	        for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          values[_key - 1] = arguments[_key];
	        }
	        var _iterator = _createForOfIteratorHelper(handlers),
	            _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var h = _step.value;
	            h.apply(void 0, values);
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	      }
	    }
	  }, {
	    key: "disposableOn",
	    value: function disposableOn(name, callback) {
	      var _this = this;
	      this.on(name, callback);
	      return function () {
	        _this.off(name, callback);
	      };
	    }
	  }, {
	    key: "on",
	    value: function on(name, callback) {
	      var handlers = this._handlersByName[name];
	      if (!handlers) {
	        this.onFirstSubscriptionAdded(name);
	        this._handlersByName[name] = handlers = new Set();
	      }
	      handlers.add(callback);
	    }
	  }, {
	    key: "off",
	    value: function off(name, callback) {
	      var handlers = this._handlersByName[name];
	      if (handlers) {
	        handlers.delete(callback);
	        if (handlers.length === 0) {
	          delete this._handlersByName[name];
	          this.onLastSubscriptionRemoved(name);
	        }
	      }
	    }
	  }, {
	    key: "onFirstSubscriptionAdded",
	    value: function onFirstSubscriptionAdded(name) {}
	  }, {
	    key: "onLastSubscriptionRemoved",
	    value: function onLastSubscriptionRemoved(name) {}
	  }]);
	  return EventEmitter;
	}();

	var escaped = /[\\\"\x00-\x1F]/g;
	var escapes = {};
	for (var i = 0; i < 0x20; ++i) {
	  escapes[String.fromCharCode(i)] = "\\U" + ('0000' + i.toString(16)).slice(-4).toUpperCase();
	}
	escapes['\b'] = '\\b';
	escapes['\t'] = '\\t';
	escapes['\n'] = '\\n';
	escapes['\f'] = '\\f';
	escapes['\r'] = '\\r';
	escapes['\"'] = '\\\"';
	escapes['\\'] = '\\\\';
	function escapeString(value) {
	  escaped.lastIndex = 0;
	  return value.replace(escaped, function (c) {
	    return escapes[c];
	  });
	}
	function stringify(value) {
	  switch (_typeof(value)) {
	    case 'string':
	      return '"' + escapeString(value) + '"';
	    case 'number':
	      return isFinite(value) ? value : 'null';
	    case 'boolean':
	      return value;
	    case 'object':
	      if (value === null) {
	        return 'null';
	      }
	      if (Array.isArray(value)) {
	        return stringifyArray(value);
	      }
	      return stringifyObject(value);
	    default:
	      throw new Error('Cannot stringify: ' + _typeof(value));
	  }
	}
	function stringifyArray(array) {
	  var sep = '[';
	  var result = '';
	  for (var i = 0; i < array.length; ++i) {
	    result += sep;
	    sep = ',';
	    result += stringify(array[i]);
	  }
	  if (sep != ',') {
	    return '[]';
	  } else {
	    return result + ']';
	  }
	}
	function stringifyObject(object) {
	  var sep = '{';
	  var result = '';
	  var keys = Object.keys(object);
	  keys.sort();
	  for (var i = 0; i < keys.length; ++i) {
	    var key = keys[i];
	    result += sep + '"' + escapeString(key) + '":';
	    sep = ',';
	    result += stringify(object[key]);
	  }
	  if (sep != ',') {
	    return '{}';
	  } else {
	    return result + '}';
	  }
	}
	var anotherJson = {
	  stringify: stringify
	};

	var DecryptionSource = createEnum(["Sync", "Timeline", "Retry"]);
	var SESSION_KEY_PREFIX = "e2ee:";
	var OLM_ALGORITHM = "m.olm.v1.curve25519-aes-sha2";
	var MEGOLM_ALGORITHM = "m.megolm.v1.aes-sha2";
	var DecryptionError = function (_Error) {
	  _inherits(DecryptionError, _Error);
	  var _super = _createSuper(DecryptionError);
	  function DecryptionError(code, event) {
	    var _this;
	    var detailsObj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	    _classCallCheck(this, DecryptionError);
	    _this = _super.call(this, "Decryption error ".concat(code).concat(detailsObj ? ": " + JSON.stringify(detailsObj) : ""));
	    _this.code = code;
	    _this.event = event;
	    _this.details = detailsObj;
	    return _this;
	  }
	  return DecryptionError;
	}( _wrapNativeSuper(Error));
	var SIGNATURE_ALGORITHM = "ed25519";
	function verifyEd25519Signature(olmUtil, userId, deviceOrKeyId, ed25519Key, value) {
	  var _value$signatures, _value$signatures$use;
	  var clone = Object.assign({}, value);
	  delete clone.unsigned;
	  delete clone.signatures;
	  var canonicalJson = anotherJson.stringify(clone);
	  var signature = value === null || value === void 0 ? void 0 : (_value$signatures = value.signatures) === null || _value$signatures === void 0 ? void 0 : (_value$signatures$use = _value$signatures[userId]) === null || _value$signatures$use === void 0 ? void 0 : _value$signatures$use["".concat(SIGNATURE_ALGORITHM, ":").concat(deviceOrKeyId)];
	  try {
	    if (!signature) {
	      throw new Error("no signature");
	    }
	    olmUtil.ed25519_verify(ed25519Key, canonicalJson, signature);
	    return true;
	  } catch (err) {
	    console.warn("Invalid signature, ignoring.", ed25519Key, canonicalJson, signature, err);
	    return false;
	  }
	}

	function applySyncResponse(data, roomResponse, membership, isInitialSync, isTimelineOpen, ownUserId) {
	  if (roomResponse.summary) {
	    data = updateSummary(data, roomResponse.summary);
	  }
	  if (membership !== data.membership) {
	    data = data.cloneIfNeeded();
	    data.membership = membership;
	  }
	  if (roomResponse.account_data) {
	    data = roomResponse.account_data.events.reduce(processRoomAccountData, data);
	  }
	  if (roomResponse.state) {
	    data = roomResponse.state.events.reduce(processStateEvent, data);
	  }
	  var timeline = roomResponse.timeline;
	  if (timeline && Array.isArray(timeline.events)) {
	    data = timeline.events.reduce(function (data, event) {
	      if (typeof event.state_key === "string") {
	        return processStateEvent(data, event);
	      } else {
	        return processTimelineEvent(data, event, isInitialSync, isTimelineOpen, ownUserId);
	      }
	    }, data);
	  }
	  var unreadNotifications = roomResponse.unread_notifications;
	  if (unreadNotifications) {
	    data = data.cloneIfNeeded();
	    data.highlightCount = unreadNotifications.highlight_count || 0;
	    data.notificationCount = unreadNotifications.notification_count;
	  }
	  return data;
	}
	function processRoomAccountData(data, event) {
	  if ((event === null || event === void 0 ? void 0 : event.type) === "m.tag") {
	    var _event$content;
	    var tags = event === null || event === void 0 ? void 0 : (_event$content = event.content) === null || _event$content === void 0 ? void 0 : _event$content.tags;
	    if (!tags || Array.isArray(tags) || _typeof(tags) !== "object") {
	      tags = null;
	    }
	    data = data.cloneIfNeeded();
	    data.tags = tags;
	  }
	  return data;
	}
	function processStateEvent(data, event) {
	  if (event.type === "m.room.encryption") {
	    var _event$content2;
	    var algorithm = (_event$content2 = event.content) === null || _event$content2 === void 0 ? void 0 : _event$content2.algorithm;
	    if (!data.encryption && algorithm === MEGOLM_ALGORITHM) {
	      data = data.cloneIfNeeded();
	      data.encryption = event.content;
	    }
	  } else if (event.type === "m.room.name") {
	    var _event$content3;
	    var newName = (_event$content3 = event.content) === null || _event$content3 === void 0 ? void 0 : _event$content3.name;
	    if (newName !== data.name) {
	      data = data.cloneIfNeeded();
	      data.name = newName;
	    }
	  } else if (event.type === "m.room.avatar") {
	    var _event$content4;
	    var newUrl = (_event$content4 = event.content) === null || _event$content4 === void 0 ? void 0 : _event$content4.url;
	    if (newUrl !== data.avatarUrl) {
	      data = data.cloneIfNeeded();
	      data.avatarUrl = newUrl;
	    }
	  } else if (event.type === "m.room.canonical_alias") {
	    var content = event.content;
	    data = data.cloneIfNeeded();
	    data.canonicalAlias = content.alias;
	  }
	  return data;
	}
	function processTimelineEvent(data, event, isInitialSync, isTimelineOpen, ownUserId) {
	  if (event.type === "m.room.message") {
	    data = data.cloneIfNeeded();
	    data.lastMessageTimestamp = event.origin_server_ts;
	    if (!isInitialSync && event.sender !== ownUserId && !isTimelineOpen) {
	      data.isUnread = true;
	    }
	    var content = event.content;
	    var body = content === null || content === void 0 ? void 0 : content.body;
	    var msgtype = content === null || content === void 0 ? void 0 : content.msgtype;
	    if (msgtype === "m.text") {
	      data.lastMessageBody = body;
	    }
	  }
	  return data;
	}
	function updateSummary(data, summary) {
	  var heroes = summary["m.heroes"];
	  var joinCount = summary["m.joined_member_count"];
	  var inviteCount = summary["m.invited_member_count"];
	  if (heroes && Array.isArray(heroes)) {
	    data = data.cloneIfNeeded();
	    data.heroes = heroes;
	  }
	  if (Number.isInteger(inviteCount)) {
	    data = data.cloneIfNeeded();
	    data.inviteCount = inviteCount;
	  }
	  if (Number.isInteger(joinCount)) {
	    data = data.cloneIfNeeded();
	    data.joinCount = joinCount;
	  }
	  return data;
	}
	var SummaryData = function () {
	  function SummaryData(copy, roomId) {
	    _classCallCheck(this, SummaryData);
	    this.roomId = copy ? copy.roomId : roomId;
	    this.name = copy ? copy.name : null;
	    this.lastMessageBody = copy ? copy.lastMessageBody : null;
	    this.lastMessageTimestamp = copy ? copy.lastMessageTimestamp : null;
	    this.isUnread = copy ? copy.isUnread : false;
	    this.encryption = copy ? copy.encryption : null;
	    this.isDirectMessage = copy ? copy.isDirectMessage : false;
	    this.membership = copy ? copy.membership : null;
	    this.inviteCount = copy ? copy.inviteCount : 0;
	    this.joinCount = copy ? copy.joinCount : 0;
	    this.heroes = copy ? copy.heroes : null;
	    this.canonicalAlias = copy ? copy.canonicalAlias : null;
	    this.hasFetchedMembers = copy ? copy.hasFetchedMembers : false;
	    this.isTrackingMembers = copy ? copy.isTrackingMembers : false;
	    this.avatarUrl = copy ? copy.avatarUrl : null;
	    this.notificationCount = copy ? copy.notificationCount : 0;
	    this.highlightCount = copy ? copy.highlightCount : 0;
	    this.tags = copy ? copy.tags : null;
	    this.cloned = copy ? true : false;
	  }
	  _createClass(SummaryData, [{
	    key: "cloneIfNeeded",
	    value: function cloneIfNeeded() {
	      if (this.cloned) {
	        return this;
	      } else {
	        return new SummaryData(this);
	      }
	    }
	  }, {
	    key: "serialize",
	    value: function serialize() {
	      var cloned = this.cloned,
	          serializedProps = _objectWithoutProperties(this, ["cloned"]);
	      return serializedProps;
	    }
	  }]);
	  return SummaryData;
	}();
	function needsHeroes(data) {
	  return !data.name && !data.canonicalAlias && data.heroes && data.heroes.length > 0;
	}
	var RoomSummary = function () {
	  function RoomSummary(roomId, ownUserId) {
	    _classCallCheck(this, RoomSummary);
	    this._ownUserId = ownUserId;
	    this._data = new SummaryData(null, roomId);
	  }
	  _createClass(RoomSummary, [{
	    key: "writeClearUnread",
	    value: function writeClearUnread(txn) {
	      var data = new SummaryData(this._data);
	      data.isUnread = false;
	      data.notificationCount = 0;
	      data.highlightCount = 0;
	      txn.roomSummary.set(data.serialize());
	      return data;
	    }
	  }, {
	    key: "writeHasFetchedMembers",
	    value: function writeHasFetchedMembers(value, txn) {
	      var data = new SummaryData(this._data);
	      data.hasFetchedMembers = value;
	      txn.roomSummary.set(data.serialize());
	      return data;
	    }
	  }, {
	    key: "writeIsTrackingMembers",
	    value: function writeIsTrackingMembers(value, txn) {
	      var data = new SummaryData(this._data);
	      data.isTrackingMembers = value;
	      txn.roomSummary.set(data.serialize());
	      return data;
	    }
	  }, {
	    key: "writeSync",
	    value: function writeSync(roomResponse, membership, isInitialSync, isTimelineOpen, txn) {
	      this._data.cloned = false;
	      var data = applySyncResponse(this._data, roomResponse, membership, isInitialSync, isTimelineOpen, this._ownUserId);
	      if (data !== this._data) {
	        txn.roomSummary.set(data.serialize());
	        return data;
	      }
	    }
	  }, {
	    key: "applyChanges",
	    value: function applyChanges(data) {
	      this._data = data;
	    }
	  }, {
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee(summary) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._data = new SummaryData(summary);
	              case 1:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function load(_x) {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "name",
	    get: function get() {
	      if (this._data.name) {
	        return this._data.name;
	      }
	      if (this._data.canonicalAlias) {
	        return this._data.canonicalAlias;
	      }
	      return null;
	    }
	  }, {
	    key: "heroes",
	    get: function get() {
	      return this._data.heroes;
	    }
	  }, {
	    key: "encryption",
	    get: function get() {
	      return this._data.encryption;
	    }
	  }, {
	    key: "needsHeroes",
	    get: function get() {
	      return needsHeroes(this._data);
	    }
	  }, {
	    key: "isUnread",
	    get: function get() {
	      return this._data.isUnread;
	    }
	  }, {
	    key: "notificationCount",
	    get: function get() {
	      return this._data.notificationCount;
	    }
	  }, {
	    key: "highlightCount",
	    get: function get() {
	      return this._data.highlightCount;
	    }
	  }, {
	    key: "lastMessage",
	    get: function get() {
	      return this._data.lastMessageBody;
	    }
	  }, {
	    key: "lastMessageTimestamp",
	    get: function get() {
	      return this._data.lastMessageTimestamp;
	    }
	  }, {
	    key: "inviteCount",
	    get: function get() {
	      return this._data.inviteCount;
	    }
	  }, {
	    key: "joinCount",
	    get: function get() {
	      return this._data.joinCount;
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      return this._data.avatarUrl;
	    }
	  }, {
	    key: "hasFetchedMembers",
	    get: function get() {
	      return this._data.hasFetchedMembers;
	    }
	  }, {
	    key: "isTrackingMembers",
	    get: function get() {
	      return this._data.isTrackingMembers;
	    }
	  }, {
	    key: "tags",
	    get: function get() {
	      return this._data.tags;
	    }
	  }]);
	  return RoomSummary;
	}();

	var WebPlatform = {
	  get minStorageKey() {
	    return 0;
	  },
	  get middleStorageKey() {
	    return 0x7FFFFFFF;
	  },
	  get maxStorageKey() {
	    return 0xFFFFFFFF;
	  },
	  delay: function delay(ms) {
	    return new Promise(function (resolve) {
	      return setTimeout(resolve, ms);
	    });
	  }
	};

	var EventKey = function () {
	  function EventKey(fragmentId, eventIndex) {
	    _classCallCheck(this, EventKey);
	    this.fragmentId = fragmentId;
	    this.eventIndex = eventIndex;
	  }
	  _createClass(EventKey, [{
	    key: "nextFragmentKey",
	    value: function nextFragmentKey() {
	      return new EventKey(this.fragmentId + 1, WebPlatform.middleStorageKey);
	    }
	  }, {
	    key: "nextKeyForDirection",
	    value: function nextKeyForDirection(direction) {
	      if (direction.isForward) {
	        return this.nextKey();
	      } else {
	        return this.previousKey();
	      }
	    }
	  }, {
	    key: "previousKey",
	    value: function previousKey() {
	      return new EventKey(this.fragmentId, this.eventIndex - 1);
	    }
	  }, {
	    key: "nextKey",
	    value: function nextKey() {
	      return new EventKey(this.fragmentId, this.eventIndex + 1);
	    }
	  }, {
	    key: "toString",
	    value: function toString() {
	      return "[".concat(this.fragmentId, "/").concat(this.eventIndex, "]");
	    }
	  }], [{
	    key: "defaultFragmentKey",
	    value: function defaultFragmentKey(fragmentId) {
	      return new EventKey(fragmentId, WebPlatform.middleStorageKey);
	    }
	  }, {
	    key: "maxKey",
	    get: function get() {
	      return new EventKey(WebPlatform.maxStorageKey, WebPlatform.maxStorageKey);
	    }
	  }, {
	    key: "minKey",
	    get: function get() {
	      return new EventKey(WebPlatform.minStorageKey, WebPlatform.minStorageKey);
	    }
	  }, {
	    key: "defaultLiveKey",
	    get: function get() {
	      return EventKey.defaultFragmentKey(WebPlatform.minStorageKey);
	    }
	  }]);
	  return EventKey;
	}();

	var PENDING_FRAGMENT_ID = Number.MAX_SAFE_INTEGER;
	var BaseEntry = function () {
	  function BaseEntry(fragmentIdComparer) {
	    _classCallCheck(this, BaseEntry);
	    this._fragmentIdComparer = fragmentIdComparer;
	  }
	  _createClass(BaseEntry, [{
	    key: "compare",
	    value: function compare(otherEntry) {
	      if (this.fragmentId === otherEntry.fragmentId) {
	        return this.entryIndex - otherEntry.entryIndex;
	      } else if (this.fragmentId === PENDING_FRAGMENT_ID) {
	        return 1;
	      } else if (otherEntry.fragmentId === PENDING_FRAGMENT_ID) {
	        return -1;
	      } else {
	        return this._fragmentIdComparer.compare(this.fragmentId, otherEntry.fragmentId);
	      }
	    }
	  }, {
	    key: "asEventKey",
	    value: function asEventKey() {
	      return new EventKey(this.fragmentId, this.entryIndex);
	    }
	  }, {
	    key: "fragmentId",
	    get: function get() {
	      throw new Error("unimplemented");
	    }
	  }, {
	    key: "entryIndex",
	    get: function get() {
	      throw new Error("unimplemented");
	    }
	  }]);
	  return BaseEntry;
	}();

	function getPrevContentFromStateEvent(event) {
	  var _event$unsigned;
	  return ((_event$unsigned = event.unsigned) === null || _event$unsigned === void 0 ? void 0 : _event$unsigned.prev_content) || event.prev_content;
	}

	var EventEntry = function (_BaseEntry) {
	  _inherits(EventEntry, _BaseEntry);
	  var _super = _createSuper(EventEntry);
	  function EventEntry(eventEntry, fragmentIdComparer) {
	    var _this;
	    _classCallCheck(this, EventEntry);
	    _this = _super.call(this, fragmentIdComparer);
	    _this._eventEntry = eventEntry;
	    _this._decryptionError = null;
	    _this._decryptionResult = null;
	    return _this;
	  }
	  _createClass(EventEntry, [{
	    key: "setDecryptionResult",
	    value: function setDecryptionResult(result) {
	      this._decryptionResult = result;
	    }
	  }, {
	    key: "setDecryptionError",
	    value: function setDecryptionError(err) {
	      this._decryptionError = err;
	    }
	  }, {
	    key: "event",
	    get: function get() {
	      return this._eventEntry.event;
	    }
	  }, {
	    key: "fragmentId",
	    get: function get() {
	      return this._eventEntry.fragmentId;
	    }
	  }, {
	    key: "entryIndex",
	    get: function get() {
	      return this._eventEntry.eventIndex;
	    }
	  }, {
	    key: "content",
	    get: function get() {
	      var _this$_decryptionResu, _this$_decryptionResu2;
	      return ((_this$_decryptionResu = this._decryptionResult) === null || _this$_decryptionResu === void 0 ? void 0 : (_this$_decryptionResu2 = _this$_decryptionResu.event) === null || _this$_decryptionResu2 === void 0 ? void 0 : _this$_decryptionResu2.content) || this._eventEntry.event.content;
	    }
	  }, {
	    key: "prevContent",
	    get: function get() {
	      return getPrevContentFromStateEvent(this._eventEntry.event);
	    }
	  }, {
	    key: "eventType",
	    get: function get() {
	      var _this$_decryptionResu3, _this$_decryptionResu4;
	      return ((_this$_decryptionResu3 = this._decryptionResult) === null || _this$_decryptionResu3 === void 0 ? void 0 : (_this$_decryptionResu4 = _this$_decryptionResu3.event) === null || _this$_decryptionResu4 === void 0 ? void 0 : _this$_decryptionResu4.type) || this._eventEntry.event.type;
	    }
	  }, {
	    key: "stateKey",
	    get: function get() {
	      return this._eventEntry.event.state_key;
	    }
	  }, {
	    key: "sender",
	    get: function get() {
	      return this._eventEntry.event.sender;
	    }
	  }, {
	    key: "displayName",
	    get: function get() {
	      return this._eventEntry.displayName;
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      return this._eventEntry.avatarUrl;
	    }
	  }, {
	    key: "timestamp",
	    get: function get() {
	      return this._eventEntry.event.origin_server_ts;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._eventEntry.event.event_id;
	    }
	  }, {
	    key: "isEncrypted",
	    get: function get() {
	      return this._eventEntry.event.type === "m.room.encrypted";
	    }
	  }, {
	    key: "isVerified",
	    get: function get() {
	      var _this$_decryptionResu5;
	      return this.isEncrypted && ((_this$_decryptionResu5 = this._decryptionResult) === null || _this$_decryptionResu5 === void 0 ? void 0 : _this$_decryptionResu5.isVerified);
	    }
	  }, {
	    key: "isUnverified",
	    get: function get() {
	      var _this$_decryptionResu6;
	      return this.isEncrypted && ((_this$_decryptionResu6 = this._decryptionResult) === null || _this$_decryptionResu6 === void 0 ? void 0 : _this$_decryptionResu6.isUnverified);
	    }
	  }]);
	  return EventEntry;
	}(BaseEntry);

	var Direction = function () {
	  function Direction(isForward) {
	    _classCallCheck(this, Direction);
	    this._isForward = isForward;
	  }
	  _createClass(Direction, [{
	    key: "asApiString",
	    value: function asApiString() {
	      return this.isForward ? "f" : "b";
	    }
	  }, {
	    key: "reverse",
	    value: function reverse() {
	      return this.isForward ? Direction.Backward : Direction.Forward;
	    }
	  }, {
	    key: "isForward",
	    get: function get() {
	      return this._isForward;
	    }
	  }, {
	    key: "isBackward",
	    get: function get() {
	      return !this.isForward;
	    }
	  }], [{
	    key: "Forward",
	    get: function get() {
	      return _forward;
	    }
	  }, {
	    key: "Backward",
	    get: function get() {
	      return _backward;
	    }
	  }]);
	  return Direction;
	}();
	var _forward = Object.freeze(new Direction(true));
	var _backward = Object.freeze(new Direction(false));

	function isValidFragmentId(id) {
	  return typeof id === "number";
	}

	var FragmentBoundaryEntry = function (_BaseEntry) {
	  _inherits(FragmentBoundaryEntry, _BaseEntry);
	  var _super = _createSuper(FragmentBoundaryEntry);
	  function FragmentBoundaryEntry(fragment, isFragmentStart, fragmentIdComparer) {
	    var _this;
	    _classCallCheck(this, FragmentBoundaryEntry);
	    _this = _super.call(this, fragmentIdComparer);
	    _this._fragment = fragment;
	    _this._isFragmentStart = isFragmentStart;
	    return _this;
	  }
	  _createClass(FragmentBoundaryEntry, [{
	    key: "withUpdatedFragment",
	    value: function withUpdatedFragment(fragment) {
	      return new FragmentBoundaryEntry(fragment, this._isFragmentStart, this._fragmentIdComparer);
	    }
	  }, {
	    key: "createNeighbourEntry",
	    value: function createNeighbourEntry(neighbour) {
	      return new FragmentBoundaryEntry(neighbour, !this._isFragmentStart, this._fragmentIdComparer);
	    }
	  }, {
	    key: "started",
	    get: function get() {
	      return this._isFragmentStart;
	    }
	  }, {
	    key: "hasEnded",
	    get: function get() {
	      return !this.started;
	    }
	  }, {
	    key: "fragment",
	    get: function get() {
	      return this._fragment;
	    }
	  }, {
	    key: "fragmentId",
	    get: function get() {
	      return this._fragment.id;
	    }
	  }, {
	    key: "entryIndex",
	    get: function get() {
	      if (this.started) {
	        return WebPlatform.minStorageKey;
	      } else {
	        return WebPlatform.maxStorageKey;
	      }
	    }
	  }, {
	    key: "isGap",
	    get: function get() {
	      return !!this.token && !this.edgeReached;
	    }
	  }, {
	    key: "token",
	    get: function get() {
	      if (this.started) {
	        return this.fragment.previousToken;
	      } else {
	        return this.fragment.nextToken;
	      }
	    },
	    set: function set(token) {
	      if (this.started) {
	        this.fragment.previousToken = token;
	      } else {
	        this.fragment.nextToken = token;
	      }
	    }
	  }, {
	    key: "edgeReached",
	    get: function get() {
	      if (this.started) {
	        return this.fragment.startReached;
	      } else {
	        return this.fragment.endReached;
	      }
	    },
	    set: function set(reached) {
	      if (this.started) {
	        this.fragment.startReached = reached;
	      } else {
	        this.fragment.endReached = reached;
	      }
	    }
	  }, {
	    key: "linkedFragmentId",
	    get: function get() {
	      if (this.started) {
	        return this.fragment.previousId;
	      } else {
	        return this.fragment.nextId;
	      }
	    },
	    set: function set(id) {
	      if (this.started) {
	        this.fragment.previousId = id;
	      } else {
	        this.fragment.nextId = id;
	      }
	    }
	  }, {
	    key: "hasLinkedFragment",
	    get: function get() {
	      return isValidFragmentId(this.linkedFragmentId);
	    }
	  }, {
	    key: "direction",
	    get: function get() {
	      if (this.started) {
	        return Direction.Backward;
	      } else {
	        return Direction.Forward;
	      }
	    }
	  }], [{
	    key: "start",
	    value: function start(fragment, fragmentIdComparer) {
	      return new FragmentBoundaryEntry(fragment, true, fragmentIdComparer);
	    }
	  }, {
	    key: "end",
	    value: function end(fragment, fragmentIdComparer) {
	      return new FragmentBoundaryEntry(fragment, false, fragmentIdComparer);
	    }
	  }]);
	  return FragmentBoundaryEntry;
	}(BaseEntry);

	function createEventEntry(key, roomId, event) {
	  return {
	    fragmentId: key.fragmentId,
	    eventIndex: key.eventIndex,
	    roomId: roomId,
	    event: event
	  };
	}
	function directionalAppend(array, value, direction) {
	  if (direction.isForward) {
	    array.push(value);
	  } else {
	    array.unshift(value);
	  }
	}
	function directionalConcat(array, otherArray, direction) {
	  if (direction.isForward) {
	    return array.concat(otherArray);
	  } else {
	    return otherArray.concat(array);
	  }
	}

	var EVENT_TYPE = "m.room.member";
	var RoomMember = function () {
	  function RoomMember(data) {
	    _classCallCheck(this, RoomMember);
	    this._data = data;
	  }
	  _createClass(RoomMember, [{
	    key: "serialize",
	    value: function serialize() {
	      return this._data;
	    }
	  }, {
	    key: "needsRoomKey",
	    get: function get() {
	      return this._data.needsRoomKey;
	    },
	    set: function set(value) {
	      this._data.needsRoomKey = !!value;
	    }
	  }, {
	    key: "membership",
	    get: function get() {
	      return this._data.membership;
	    }
	  }, {
	    key: "displayName",
	    get: function get() {
	      return this._data.displayName;
	    }
	  }, {
	    key: "name",
	    get: function get() {
	      return this._data.displayName || this._data.userId;
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      return this._data.avatarUrl;
	    }
	  }, {
	    key: "roomId",
	    get: function get() {
	      return this._data.roomId;
	    }
	  }, {
	    key: "userId",
	    get: function get() {
	      return this._data.userId;
	    }
	  }], [{
	    key: "fromMemberEvent",
	    value: function fromMemberEvent(roomId, memberEvent) {
	      var userId = memberEvent && memberEvent.state_key;
	      if (typeof userId !== "string") {
	        return;
	      }
	      var content = memberEvent.content;
	      var prevContent = getPrevContentFromStateEvent(memberEvent);
	      var membership = content === null || content === void 0 ? void 0 : content.membership;
	      var displayName = (content === null || content === void 0 ? void 0 : content.displayname) || (prevContent === null || prevContent === void 0 ? void 0 : prevContent.displayname);
	      var avatarUrl = (content === null || content === void 0 ? void 0 : content.avatar_url) || (prevContent === null || prevContent === void 0 ? void 0 : prevContent.avatar_url);
	      return this._validateAndCreateMember(roomId, userId, membership, displayName, avatarUrl);
	    }
	  }, {
	    key: "fromReplacingMemberEvent",
	    value: function fromReplacingMemberEvent(roomId, memberEvent) {
	      var userId = memberEvent && memberEvent.state_key;
	      if (typeof userId !== "string") {
	        return;
	      }
	      var content = getPrevContentFromStateEvent(memberEvent);
	      return this._validateAndCreateMember(roomId, userId, content === null || content === void 0 ? void 0 : content.membership, content === null || content === void 0 ? void 0 : content.displayname, content === null || content === void 0 ? void 0 : content.avatar_url);
	    }
	  }, {
	    key: "_validateAndCreateMember",
	    value: function _validateAndCreateMember(roomId, userId, membership, displayName, avatarUrl) {
	      if (typeof membership !== "string") {
	        return;
	      }
	      return new RoomMember({
	        roomId: roomId,
	        userId: userId,
	        membership: membership,
	        avatarUrl: avatarUrl,
	        displayName: displayName
	      });
	    }
	  }]);
	  return RoomMember;
	}();
	var MemberChange = function () {
	  function MemberChange(roomId, memberEvent) {
	    _classCallCheck(this, MemberChange);
	    this._roomId = roomId;
	    this._memberEvent = memberEvent;
	    this._member = null;
	  }
	  _createClass(MemberChange, [{
	    key: "member",
	    get: function get() {
	      if (!this._member) {
	        this._member = RoomMember.fromMemberEvent(this._roomId, this._memberEvent);
	      }
	      return this._member;
	    }
	  }, {
	    key: "roomId",
	    get: function get() {
	      return this._roomId;
	    }
	  }, {
	    key: "userId",
	    get: function get() {
	      return this._memberEvent.state_key;
	    }
	  }, {
	    key: "previousMembership",
	    get: function get() {
	      var _getPrevContentFromSt;
	      return (_getPrevContentFromSt = getPrevContentFromStateEvent(this._memberEvent)) === null || _getPrevContentFromSt === void 0 ? void 0 : _getPrevContentFromSt.membership;
	    }
	  }, {
	    key: "membership",
	    get: function get() {
	      var _this$_memberEvent$co;
	      return (_this$_memberEvent$co = this._memberEvent.content) === null || _this$_memberEvent$co === void 0 ? void 0 : _this$_memberEvent$co.membership;
	    }
	  }, {
	    key: "hasLeft",
	    get: function get() {
	      return this.previousMembership === "join" && this.membership !== "join";
	    }
	  }, {
	    key: "hasJoined",
	    get: function get() {
	      return this.previousMembership !== "join" && this.membership === "join";
	    }
	  }]);
	  return MemberChange;
	}();

	function deduplicateEvents(events) {
	  var eventIds = new Set();
	  return events.filter(function (e) {
	    if (eventIds.has(e.event_id)) {
	      return false;
	    } else {
	      eventIds.add(e.event_id);
	      return true;
	    }
	  });
	}
	var SyncWriter = function () {
	  function SyncWriter(_ref) {
	    var roomId = _ref.roomId,
	        fragmentIdComparer = _ref.fragmentIdComparer;
	    _classCallCheck(this, SyncWriter);
	    this._roomId = roomId;
	    this._fragmentIdComparer = fragmentIdComparer;
	    this._lastLiveKey = null;
	  }
	  _createClass(SyncWriter, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee(txn) {
	        var liveFragment, _yield$txn$timelineEv, _yield$txn$timelineEv2, lastEvent;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return txn.timelineFragments.liveFragment(this._roomId);
	              case 2:
	                liveFragment = _context.sent;
	                if (!liveFragment) {
	                  _context.next = 10;
	                  break;
	                }
	                _context.next = 6;
	                return txn.timelineEvents.lastEvents(this._roomId, liveFragment.id, 1);
	              case 6:
	                _yield$txn$timelineEv = _context.sent;
	                _yield$txn$timelineEv2 = _slicedToArray(_yield$txn$timelineEv, 1);
	                lastEvent = _yield$txn$timelineEv2[0];
	                this._lastLiveKey = new EventKey(liveFragment.id, lastEvent.eventIndex);
	              case 10:
	                console.log("room persister load", this._roomId, this._lastLiveKey && this._lastLiveKey.toString());
	              case 11:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function load(_x) {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "_createLiveFragment",
	    value: function () {
	      var _createLiveFragment2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(txn, previousToken) {
	        var liveFragment, fragment;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return txn.timelineFragments.liveFragment(this._roomId);
	              case 2:
	                liveFragment = _context2.sent;
	                if (liveFragment) {
	                  _context2.next = 11;
	                  break;
	                }
	                if (!previousToken) {
	                  previousToken = null;
	                }
	                fragment = {
	                  roomId: this._roomId,
	                  id: EventKey.defaultLiveKey.fragmentId,
	                  previousId: null,
	                  nextId: null,
	                  previousToken: previousToken,
	                  nextToken: null
	                };
	                txn.timelineFragments.add(fragment);
	                this._fragmentIdComparer.add(fragment);
	                return _context2.abrupt("return", fragment);
	              case 11:
	                return _context2.abrupt("return", liveFragment);
	              case 12:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function _createLiveFragment(_x2, _x3) {
	        return _createLiveFragment2.apply(this, arguments);
	      }
	      return _createLiveFragment;
	    }()
	  }, {
	    key: "_replaceLiveFragment",
	    value: function () {
	      var _replaceLiveFragment2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(oldFragmentId, newFragmentId, previousToken, txn) {
	        var oldFragment, newFragment;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return txn.timelineFragments.get(this._roomId, oldFragmentId);
	              case 2:
	                oldFragment = _context3.sent;
	                if (oldFragment) {
	                  _context3.next = 5;
	                  break;
	                }
	                throw new Error("old live fragment doesn't exist: ".concat(oldFragmentId));
	              case 5:
	                oldFragment.nextId = newFragmentId;
	                txn.timelineFragments.update(oldFragment);
	                newFragment = {
	                  roomId: this._roomId,
	                  id: newFragmentId,
	                  previousId: oldFragmentId,
	                  nextId: null,
	                  previousToken: previousToken,
	                  nextToken: null
	                };
	                txn.timelineFragments.add(newFragment);
	                this._fragmentIdComparer.append(newFragmentId, oldFragmentId);
	                return _context3.abrupt("return", {
	                  oldFragment: oldFragment,
	                  newFragment: newFragment
	                });
	              case 11:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function _replaceLiveFragment(_x4, _x5, _x6, _x7) {
	        return _replaceLiveFragment2.apply(this, arguments);
	      }
	      return _replaceLiveFragment;
	    }()
	  }, {
	    key: "_writeMember",
	    value: function () {
	      var _writeMember2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(event, trackNewlyJoined, txn) {
	        var userId, memberChange, member, existingMemberData;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                userId = event.state_key;
	                if (!userId) {
	                  _context4.next = 12;
	                  break;
	                }
	                memberChange = new MemberChange(this._roomId, event);
	                member = memberChange.member;
	                if (!member) {
	                  _context4.next = 12;
	                  break;
	                }
	                if (!trackNewlyJoined) {
	                  _context4.next = 10;
	                  break;
	                }
	                _context4.next = 8;
	                return txn.roomMembers.get(this._roomId, userId);
	              case 8:
	                existingMemberData = _context4.sent;
	                member.needsRoomKey = (existingMemberData === null || existingMemberData === void 0 ? void 0 : existingMemberData.needsRoomKey) || memberChange.hasJoined;
	              case 10:
	                txn.roomMembers.set(member.serialize());
	                return _context4.abrupt("return", memberChange);
	              case 12:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function _writeMember(_x8, _x9, _x10) {
	        return _writeMember2.apply(this, arguments);
	      }
	      return _writeMember;
	    }()
	  }, {
	    key: "_writeStateEvent",
	    value: function () {
	      var _writeStateEvent2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(event, trackNewlyJoined, txn) {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!(event.type === EVENT_TYPE)) {
	                  _context5.next = 6;
	                  break;
	                }
	                _context5.next = 3;
	                return this._writeMember(event, trackNewlyJoined, txn);
	              case 3:
	                return _context5.abrupt("return", _context5.sent);
	              case 6:
	                txn.roomState.set(this._roomId, event);
	              case 7:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function _writeStateEvent(_x11, _x12, _x13) {
	        return _writeStateEvent2.apply(this, arguments);
	      }
	      return _writeStateEvent;
	    }()
	  }, {
	    key: "_writeStateEvents",
	    value: function () {
	      var _writeStateEvents2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(roomResponse, trackNewlyJoined, txn) {
	        var _this = this;
	        var memberChanges, state;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                memberChanges = new Map();
	                state = roomResponse.state;
	                if (!Array.isArray(state === null || state === void 0 ? void 0 : state.events)) {
	                  _context7.next = 5;
	                  break;
	                }
	                _context7.next = 5;
	                return Promise.all(state.events.map( function () {
	                  var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(event) {
	                    var memberChange;
	                    return regeneratorRuntime.wrap(function _callee6$(_context6) {
	                      while (1) {
	                        switch (_context6.prev = _context6.next) {
	                          case 0:
	                            _context6.next = 2;
	                            return _this._writeStateEvent(event, trackNewlyJoined, txn);
	                          case 2:
	                            memberChange = _context6.sent;
	                            if (memberChange) {
	                              memberChanges.set(memberChange.userId, memberChange);
	                            }
	                          case 4:
	                          case "end":
	                            return _context6.stop();
	                        }
	                      }
	                    }, _callee6);
	                  }));
	                  return function (_x17) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }()));
	              case 5:
	                return _context7.abrupt("return", memberChanges);
	              case 6:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7);
	      }));
	      function _writeStateEvents(_x14, _x15, _x16) {
	        return _writeStateEvents2.apply(this, arguments);
	      }
	      return _writeStateEvents;
	    }()
	  }, {
	    key: "_writeTimeline",
	    value: function () {
	      var _writeTimeline2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(entries, timeline, currentKey, trackNewlyJoined, txn) {
	        var _this2 = this;
	        var memberChanges, events, _iterator, _step, event, entry, memberData;
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                memberChanges = new Map();
	                if (!Array.isArray(timeline.events)) {
	                  _context9.next = 28;
	                  break;
	                }
	                events = deduplicateEvents(timeline.events);
	                _iterator = _createForOfIteratorHelper(events);
	                _context9.prev = 4;
	                _iterator.s();
	              case 6:
	                if ((_step = _iterator.n()).done) {
	                  _context9.next = 18;
	                  break;
	                }
	                event = _step.value;
	                currentKey = currentKey.nextKey();
	                entry = createEventEntry(currentKey, this._roomId, event);
	                _context9.next = 12;
	                return this._findMemberData(event.sender, events, txn);
	              case 12:
	                memberData = _context9.sent;
	                if (memberData) {
	                  entry.displayName = memberData.displayName;
	                  entry.avatarUrl = memberData.avatarUrl;
	                }
	                txn.timelineEvents.insert(entry);
	                entries.push(new EventEntry(entry, this._fragmentIdComparer));
	              case 16:
	                _context9.next = 6;
	                break;
	              case 18:
	                _context9.next = 23;
	                break;
	              case 20:
	                _context9.prev = 20;
	                _context9.t0 = _context9["catch"](4);
	                _iterator.e(_context9.t0);
	              case 23:
	                _context9.prev = 23;
	                _iterator.f();
	                return _context9.finish(23);
	              case 26:
	                _context9.next = 28;
	                return Promise.all(events.filter(function (event) {
	                  return typeof event.state_key === "string";
	                }).map( function () {
	                  var _ref3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(stateEvent) {
	                    var memberChange;
	                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
	                      while (1) {
	                        switch (_context8.prev = _context8.next) {
	                          case 0:
	                            _context8.next = 2;
	                            return _this2._writeStateEvent(stateEvent, trackNewlyJoined, txn);
	                          case 2:
	                            memberChange = _context8.sent;
	                            if (memberChange) {
	                              memberChanges.set(memberChange.userId, memberChange);
	                            }
	                          case 4:
	                          case "end":
	                            return _context8.stop();
	                        }
	                      }
	                    }, _callee8);
	                  }));
	                  return function (_x23) {
	                    return _ref3.apply(this, arguments);
	                  };
	                }()));
	              case 28:
	                return _context9.abrupt("return", {
	                  currentKey: currentKey,
	                  memberChanges: memberChanges
	                });
	              case 29:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this, [[4, 20, 23, 26]]);
	      }));
	      function _writeTimeline(_x18, _x19, _x20, _x21, _x22) {
	        return _writeTimeline2.apply(this, arguments);
	      }
	      return _writeTimeline;
	    }()
	  }, {
	    key: "_findMemberData",
	    value: function () {
	      var _findMemberData2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee10(userId, events, txn) {
	        var memberData, memberEvent, _RoomMember$fromMembe;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                _context10.next = 2;
	                return txn.roomMembers.get(this._roomId, userId);
	              case 2:
	                memberData = _context10.sent;
	                if (!memberData) {
	                  _context10.next = 7;
	                  break;
	                }
	                return _context10.abrupt("return", memberData);
	              case 7:
	                memberEvent = events.find(function (e) {
	                  return e.type === EVENT_TYPE && e.state_key === userId;
	                });
	                if (!memberEvent) {
	                  _context10.next = 10;
	                  break;
	                }
	                return _context10.abrupt("return", (_RoomMember$fromMembe = RoomMember.fromMemberEvent(this._roomId, memberEvent)) === null || _RoomMember$fromMembe === void 0 ? void 0 : _RoomMember$fromMembe.serialize());
	              case 10:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this);
	      }));
	      function _findMemberData(_x24, _x25, _x26) {
	        return _findMemberData2.apply(this, arguments);
	      }
	      return _findMemberData;
	    }()
	  }, {
	    key: "writeSync",
	    value: function () {
	      var _writeSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee11(roomResponse, trackNewlyJoined, txn) {
	        var entries, timeline, currentKey, liveFragment, oldFragmentId, _yield$this$_replaceL, oldFragment, newFragment, memberChanges, timelineResult, _iterator2, _step2, _step2$value, userId, memberChange;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                entries = [];
	                timeline = roomResponse.timeline;
	                currentKey = this._lastLiveKey;
	                if (currentKey) {
	                  _context11.next = 11;
	                  break;
	                }
	                _context11.next = 6;
	                return this._createLiveFragment(txn, timeline.prev_batch);
	              case 6:
	                liveFragment = _context11.sent;
	                currentKey = new EventKey(liveFragment.id, EventKey.defaultLiveKey.eventIndex);
	                entries.push(FragmentBoundaryEntry.start(liveFragment, this._fragmentIdComparer));
	                _context11.next = 21;
	                break;
	              case 11:
	                if (!timeline.limited) {
	                  _context11.next = 21;
	                  break;
	                }
	                oldFragmentId = currentKey.fragmentId;
	                currentKey = currentKey.nextFragmentKey();
	                _context11.next = 16;
	                return this._replaceLiveFragment(oldFragmentId, currentKey.fragmentId, timeline.prev_batch, txn);
	              case 16:
	                _yield$this$_replaceL = _context11.sent;
	                oldFragment = _yield$this$_replaceL.oldFragment;
	                newFragment = _yield$this$_replaceL.newFragment;
	                entries.push(FragmentBoundaryEntry.end(oldFragment, this._fragmentIdComparer));
	                entries.push(FragmentBoundaryEntry.start(newFragment, this._fragmentIdComparer));
	              case 21:
	                _context11.next = 23;
	                return this._writeStateEvents(roomResponse, trackNewlyJoined, txn);
	              case 23:
	                memberChanges = _context11.sent;
	                _context11.next = 26;
	                return this._writeTimeline(entries, timeline, currentKey, trackNewlyJoined, txn);
	              case 26:
	                timelineResult = _context11.sent;
	                currentKey = timelineResult.currentKey;
	                _iterator2 = _createForOfIteratorHelper(timelineResult.memberChanges.entries());
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    _step2$value = _slicedToArray(_step2.value, 2), userId = _step2$value[0], memberChange = _step2$value[1];
	                    memberChanges.set(userId, memberChange);
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	                return _context11.abrupt("return", {
	                  entries: entries,
	                  newLiveKey: currentKey,
	                  memberChanges: memberChanges
	                });
	              case 31:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));
	      function writeSync(_x27, _x28, _x29) {
	        return _writeSync.apply(this, arguments);
	      }
	      return writeSync;
	    }()
	  }, {
	    key: "afterSync",
	    value: function afterSync(newLiveKey) {
	      this._lastLiveKey = newLiveKey;
	    }
	  }, {
	    key: "lastMessageKey",
	    get: function get() {
	      return this._lastLiveKey;
	    }
	  }]);
	  return SyncWriter;
	}();

	var GapWriter = function () {
	  function GapWriter(_ref) {
	    var roomId = _ref.roomId,
	        storage = _ref.storage,
	        fragmentIdComparer = _ref.fragmentIdComparer;
	    _classCallCheck(this, GapWriter);
	    this._roomId = roomId;
	    this._storage = storage;
	    this._fragmentIdComparer = fragmentIdComparer;
	  }
	  _createClass(GapWriter, [{
	    key: "_findOverlappingEvents",
	    value: function () {
	      var _findOverlappingEvents2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(fragmentEntry, events, txn) {
	        var _this = this;
	        var expectedOverlappingEventId, remainingEvents, nonOverlappingEvents, neighbourFragmentEntry, _loop;
	        return regeneratorRuntime.wrap(function _callee$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!fragmentEntry.hasLinkedFragment) {
	                  _context2.next = 4;
	                  break;
	                }
	                _context2.next = 3;
	                return this._findExpectedOverlappingEventId(fragmentEntry, txn);
	              case 3:
	                expectedOverlappingEventId = _context2.sent;
	              case 4:
	                remainingEvents = events;
	                nonOverlappingEvents = [];
	                _loop = regeneratorRuntime.mark(function _loop() {
	                  var eventIds, duplicateEventId, duplicateEventIndex, neighbourEvent, neighbourFragment;
	                  return regeneratorRuntime.wrap(function _loop$(_context) {
	                    while (1) {
	                      switch (_context.prev = _context.next) {
	                        case 0:
	                          eventIds = remainingEvents.map(function (e) {
	                            return e.event_id;
	                          });
	                          _context.next = 3;
	                          return txn.timelineEvents.findFirstOccurringEventId(_this._roomId, eventIds);
	                        case 3:
	                          duplicateEventId = _context.sent;
	                          if (!duplicateEventId) {
	                            _context.next = 23;
	                            break;
	                          }
	                          duplicateEventIndex = remainingEvents.findIndex(function (e) {
	                            return e.event_id === duplicateEventId;
	                          });
	                          if (!(duplicateEventIndex === -1)) {
	                            _context.next = 8;
	                            break;
	                          }
	                          throw new Error("findFirstOccurringEventId returned ".concat(duplicateEventIndex, " which wasn't ") + "in [".concat(eventIds.join(","), "] in ").concat(_this._roomId));
	                        case 8:
	                          nonOverlappingEvents.push.apply(nonOverlappingEvents, _toConsumableArray(remainingEvents.slice(0, duplicateEventIndex)));
	                          if (!(!expectedOverlappingEventId || duplicateEventId === expectedOverlappingEventId)) {
	                            _context.next = 20;
	                            break;
	                          }
	                          _context.next = 12;
	                          return txn.timelineEvents.getByEventId(_this._roomId, duplicateEventId);
	                        case 12:
	                          neighbourEvent = _context.sent;
	                          _context.next = 15;
	                          return txn.timelineFragments.get(_this._roomId, neighbourEvent.fragmentId);
	                        case 15:
	                          neighbourFragment = _context.sent;
	                          neighbourFragmentEntry = fragmentEntry.createNeighbourEntry(neighbourFragment);
	                          remainingEvents = null;
	                          _context.next = 21;
	                          break;
	                        case 20:
	                          remainingEvents = remainingEvents.slice(duplicateEventIndex + 1);
	                        case 21:
	                          _context.next = 25;
	                          break;
	                        case 23:
	                          nonOverlappingEvents.push.apply(nonOverlappingEvents, _toConsumableArray(remainingEvents));
	                          remainingEvents = null;
	                        case 25:
	                        case "end":
	                          return _context.stop();
	                      }
	                    }
	                  }, _loop);
	                });
	              case 7:
	                if (!(remainingEvents && remainingEvents.length)) {
	                  _context2.next = 11;
	                  break;
	                }
	                return _context2.delegateYield(_loop(), "t0", 9);
	              case 9:
	                _context2.next = 7;
	                break;
	              case 11:
	                return _context2.abrupt("return", {
	                  nonOverlappingEvents: nonOverlappingEvents,
	                  neighbourFragmentEntry: neighbourFragmentEntry
	                });
	              case 12:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function _findOverlappingEvents(_x, _x2, _x3) {
	        return _findOverlappingEvents2.apply(this, arguments);
	      }
	      return _findOverlappingEvents;
	    }()
	  }, {
	    key: "_findExpectedOverlappingEventId",
	    value: function () {
	      var _findExpectedOverlappingEventId2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(fragmentEntry, txn) {
	        var eventEntry;
	        return regeneratorRuntime.wrap(function _callee2$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this._findFragmentEdgeEvent(fragmentEntry.linkedFragmentId,
	                fragmentEntry.direction.reverse(), txn);
	              case 2:
	                eventEntry = _context3.sent;
	                if (!eventEntry) {
	                  _context3.next = 5;
	                  break;
	                }
	                return _context3.abrupt("return", eventEntry.event.event_id);
	              case 5:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function _findExpectedOverlappingEventId(_x4, _x5) {
	        return _findExpectedOverlappingEventId2.apply(this, arguments);
	      }
	      return _findExpectedOverlappingEventId;
	    }()
	  }, {
	    key: "_findFragmentEdgeEventKey",
	    value: function () {
	      var _findFragmentEdgeEventKey2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(fragmentEntry, txn) {
	        var fragmentId, direction, event;
	        return regeneratorRuntime.wrap(function _callee3$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                fragmentId = fragmentEntry.fragmentId, direction = fragmentEntry.direction;
	                _context4.next = 3;
	                return this._findFragmentEdgeEvent(fragmentId, direction, txn);
	              case 3:
	                event = _context4.sent;
	                if (!event) {
	                  _context4.next = 8;
	                  break;
	                }
	                return _context4.abrupt("return", new EventKey(event.fragmentId, event.eventIndex));
	              case 8:
	                return _context4.abrupt("return", EventKey.defaultFragmentKey(fragmentEntry.fragmentId));
	              case 9:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function _findFragmentEdgeEventKey(_x6, _x7) {
	        return _findFragmentEdgeEventKey2.apply(this, arguments);
	      }
	      return _findFragmentEdgeEventKey;
	    }()
	  }, {
	    key: "_findFragmentEdgeEvent",
	    value: function () {
	      var _findFragmentEdgeEvent2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(fragmentId, direction, txn) {
	        var _yield$txn$timelineEv, _yield$txn$timelineEv2, firstEvent, _yield$txn$timelineEv3, _yield$txn$timelineEv4, lastEvent;
	        return regeneratorRuntime.wrap(function _callee4$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!direction.isBackward) {
	                  _context5.next = 9;
	                  break;
	                }
	                _context5.next = 3;
	                return txn.timelineEvents.firstEvents(this._roomId, fragmentId, 1);
	              case 3:
	                _yield$txn$timelineEv = _context5.sent;
	                _yield$txn$timelineEv2 = _slicedToArray(_yield$txn$timelineEv, 1);
	                firstEvent = _yield$txn$timelineEv2[0];
	                return _context5.abrupt("return", firstEvent);
	              case 9:
	                _context5.next = 11;
	                return txn.timelineEvents.lastEvents(this._roomId, fragmentId, 1);
	              case 11:
	                _yield$txn$timelineEv3 = _context5.sent;
	                _yield$txn$timelineEv4 = _slicedToArray(_yield$txn$timelineEv3, 1);
	                lastEvent = _yield$txn$timelineEv4[0];
	                return _context5.abrupt("return", lastEvent);
	              case 15:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function _findFragmentEdgeEvent(_x8, _x9, _x10) {
	        return _findFragmentEdgeEvent2.apply(this, arguments);
	      }
	      return _findFragmentEdgeEvent;
	    }()
	  }, {
	    key: "_storeEvents",
	    value: function _storeEvents(events, startKey, direction, state, txn) {
	      var entries = [];
	      var key = startKey;
	      for (var i = 0; i < events.length; ++i) {
	        var event = events[i];
	        key = key.nextKeyForDirection(direction);
	        var eventStorageEntry = createEventEntry(key, this._roomId, event);
	        var memberData = this._findMemberData(event.sender, state, events, i, direction);
	        if (memberData) {
	          eventStorageEntry.displayName = memberData === null || memberData === void 0 ? void 0 : memberData.displayName;
	          eventStorageEntry.avatarUrl = memberData === null || memberData === void 0 ? void 0 : memberData.avatarUrl;
	        }
	        txn.timelineEvents.insert(eventStorageEntry);
	        var eventEntry = new EventEntry(eventStorageEntry, this._fragmentIdComparer);
	        directionalAppend(entries, eventEntry, direction);
	      }
	      return entries;
	    }
	  }, {
	    key: "_findMemberData",
	    value: function _findMemberData(userId, state, events, index, direction) {
	      function isOurUser(event) {
	        return event.type === EVENT_TYPE && event.state_key === userId;
	      }
	      var inc = direction.isBackward ? 1 : -1;
	      for (var i = index + inc; i >= 0 && i < events.length; i += inc) {
	        var event = events[i];
	        if (isOurUser(event)) {
	          var _RoomMember$fromMembe;
	          return (_RoomMember$fromMembe = RoomMember.fromMemberEvent(this._roomId, event)) === null || _RoomMember$fromMembe === void 0 ? void 0 : _RoomMember$fromMembe.serialize();
	        }
	      }
	      for (var _i = index; _i >= 0 && _i < events.length; _i -= inc) {
	        var _event = events[_i];
	        if (isOurUser(_event)) {
	          var _RoomMember$fromRepla;
	          return (_RoomMember$fromRepla = RoomMember.fromReplacingMemberEvent(this._roomId, _event)) === null || _RoomMember$fromRepla === void 0 ? void 0 : _RoomMember$fromRepla.serialize();
	        }
	      }
	      var stateMemberEvent = state === null || state === void 0 ? void 0 : state.find(isOurUser);
	      if (stateMemberEvent) {
	        var _RoomMember$fromMembe2;
	        return (_RoomMember$fromMembe2 = RoomMember.fromMemberEvent(this._roomId, stateMemberEvent)) === null || _RoomMember$fromMembe2 === void 0 ? void 0 : _RoomMember$fromMembe2.serialize();
	      }
	    }
	  }, {
	    key: "_updateFragments",
	    value: function () {
	      var _updateFragments2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(fragmentEntry, neighbourFragmentEntry, end, entries, txn) {
	        var direction, changedFragments;
	        return regeneratorRuntime.wrap(function _callee5$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                direction = fragmentEntry.direction;
	                changedFragments = [];
	                directionalAppend(entries, fragmentEntry, direction);
	                if (!neighbourFragmentEntry) {
	                  _context6.next = 24;
	                  break;
	                }
	                if (fragmentEntry.hasLinkedFragment) {
	                  _context6.next = 8;
	                  break;
	                }
	                fragmentEntry.linkedFragmentId = neighbourFragmentEntry.fragmentId;
	                _context6.next = 10;
	                break;
	              case 8:
	                if (!(fragmentEntry.linkedFragmentId !== neighbourFragmentEntry.fragmentId)) {
	                  _context6.next = 10;
	                  break;
	                }
	                throw new Error("Prevented changing fragment ".concat(fragmentEntry.fragmentId, " ") + "".concat(fragmentEntry.direction.asApiString(), " link from ").concat(fragmentEntry.linkedFragmentId, " ") + "to ".concat(neighbourFragmentEntry.fragmentId, " in ").concat(this._roomId));
	              case 10:
	                if (neighbourFragmentEntry.hasLinkedFragment) {
	                  _context6.next = 14;
	                  break;
	                }
	                neighbourFragmentEntry.linkedFragmentId = fragmentEntry.fragmentId;
	                _context6.next = 16;
	                break;
	              case 14:
	                if (!(neighbourFragmentEntry.linkedFragmentId !== fragmentEntry.fragmentId)) {
	                  _context6.next = 16;
	                  break;
	                }
	                throw new Error("Prevented changing fragment ".concat(neighbourFragmentEntry.fragmentId, " ") + "".concat(neighbourFragmentEntry.direction.asApiString(), " link from ").concat(neighbourFragmentEntry.linkedFragmentId, " ") + "to ".concat(fragmentEntry.fragmentId, " in ").concat(this._roomId));
	              case 16:
	                neighbourFragmentEntry.token = null;
	                fragmentEntry.token = null;
	                txn.timelineFragments.update(neighbourFragmentEntry.fragment);
	                directionalAppend(entries, neighbourFragmentEntry, direction);
	                changedFragments.push(fragmentEntry.fragment);
	                changedFragments.push(neighbourFragmentEntry.fragment);
	                _context6.next = 25;
	                break;
	              case 24:
	                fragmentEntry.token = end;
	              case 25:
	                txn.timelineFragments.update(fragmentEntry.fragment);
	                return _context6.abrupt("return", changedFragments);
	              case 27:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function _updateFragments(_x11, _x12, _x13, _x14, _x15) {
	        return _updateFragments2.apply(this, arguments);
	      }
	      return _updateFragments;
	    }()
	  }, {
	    key: "writeFragmentFill",
	    value: function () {
	      var _writeFragmentFill = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(fragmentEntry, response, txn) {
	        var _fragmentEntry, fragmentId, direction, chunk, start, end, state, entries, fragment, lastKey, _yield$this$_findOver, nonOverlappingEvents, neighbourFragmentEntry, fragments;
	        return regeneratorRuntime.wrap(function _callee6$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                _fragmentEntry = fragmentEntry, fragmentId = _fragmentEntry.fragmentId, direction = _fragmentEntry.direction;
	                chunk = response.chunk, start = response.start, end = response.end, state = response.state;
	                if (Array.isArray(chunk)) {
	                  _context7.next = 4;
	                  break;
	                }
	                throw new Error("Invalid chunk in response");
	              case 4:
	                if (!(typeof end !== "string")) {
	                  _context7.next = 6;
	                  break;
	                }
	                throw new Error("Invalid end token in response");
	              case 6:
	                _context7.next = 8;
	                return txn.timelineFragments.get(this._roomId, fragmentId);
	              case 8:
	                fragment = _context7.sent;
	                if (fragment) {
	                  _context7.next = 11;
	                  break;
	                }
	                throw new Error("Unknown fragment: ".concat(fragmentId));
	              case 11:
	                fragmentEntry = fragmentEntry.withUpdatedFragment(fragment);
	                if (!(fragmentEntry.token !== start)) {
	                  _context7.next = 14;
	                  break;
	                }
	                throw new Error("start is not equal to prev_batch or next_batch");
	              case 14:
	                if (!(chunk.length === 0)) {
	                  _context7.next = 19;
	                  break;
	                }
	                fragmentEntry.edgeReached = true;
	                _context7.next = 18;
	                return txn.timelineFragments.update(fragmentEntry.fragment);
	              case 18:
	                return _context7.abrupt("return", {
	                  entries: [fragmentEntry],
	                  fragments: []
	                });
	              case 19:
	                _context7.next = 21;
	                return this._findFragmentEdgeEventKey(fragmentEntry, txn);
	              case 21:
	                lastKey = _context7.sent;
	                _context7.next = 24;
	                return this._findOverlappingEvents(fragmentEntry, chunk, txn);
	              case 24:
	                _yield$this$_findOver = _context7.sent;
	                nonOverlappingEvents = _yield$this$_findOver.nonOverlappingEvents;
	                neighbourFragmentEntry = _yield$this$_findOver.neighbourFragmentEntry;
	                entries = this._storeEvents(nonOverlappingEvents, lastKey, direction, state, txn);
	                _context7.next = 30;
	                return this._updateFragments(fragmentEntry, neighbourFragmentEntry, end, entries, txn);
	              case 30:
	                fragments = _context7.sent;
	                return _context7.abrupt("return", {
	                  entries: entries,
	                  fragments: fragments
	                });
	              case 32:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function writeFragmentFill(_x16, _x17, _x18) {
	        return _writeFragmentFill.apply(this, arguments);
	      }
	      return writeFragmentFill;
	    }()
	  }]);
	  return GapWriter;
	}();

	var BaseObservableList = function (_BaseObservable) {
	  _inherits(BaseObservableList, _BaseObservable);
	  var _super = _createSuper(BaseObservableList);
	  function BaseObservableList() {
	    _classCallCheck(this, BaseObservableList);
	    return _super.apply(this, arguments);
	  }
	  _createClass(BaseObservableList, [{
	    key: "emitReset",
	    value: function emitReset() {
	      var _iterator = _createForOfIteratorHelper(this._handlers),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var h = _step.value;
	          h.onReset(this);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "emitAdd",
	    value: function emitAdd(index, value) {
	      var _iterator2 = _createForOfIteratorHelper(this._handlers),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var h = _step2.value;
	          h.onAdd(index, value, this);
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "emitUpdate",
	    value: function emitUpdate(index, value, params) {
	      var _iterator3 = _createForOfIteratorHelper(this._handlers),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var h = _step3.value;
	          h.onUpdate(index, value, params, this);
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "emitRemove",
	    value: function emitRemove(index, value) {
	      var _iterator4 = _createForOfIteratorHelper(this._handlers),
	          _step4;
	      try {
	        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	          var h = _step4.value;
	          h.onRemove(index, value, this);
	        }
	      } catch (err) {
	        _iterator4.e(err);
	      } finally {
	        _iterator4.f();
	      }
	    }
	  }, {
	    key: "emitMove",
	    value: function emitMove(fromIdx, toIdx, value) {
	      var _iterator5 = _createForOfIteratorHelper(this._handlers),
	          _step5;
	      try {
	        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	          var h = _step5.value;
	          h.onMove(fromIdx, toIdx, value, this);
	        }
	      } catch (err) {
	        _iterator5.e(err);
	      } finally {
	        _iterator5.f();
	      }
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      throw new Error("unimplemented");
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      throw new Error("unimplemented");
	    }
	  }]);
	  return BaseObservableList;
	}(BaseObservable);

	function sortedIndex(array, value, comparator) {
	  var low = 0;
	  var high = array.length;
	  while (low < high) {
	    var mid = low + high >>> 1;
	    var cmpResult = comparator(value, array[mid]);
	    if (cmpResult > 0) {
	      low = mid + 1;
	    } else if (cmpResult < 0) {
	      high = mid;
	    } else {
	      low = high = mid;
	    }
	  }
	  return high;
	}

	var BaseObservableMap = function (_BaseObservable) {
	  _inherits(BaseObservableMap, _BaseObservable);
	  var _super = _createSuper(BaseObservableMap);
	  function BaseObservableMap() {
	    _classCallCheck(this, BaseObservableMap);
	    return _super.apply(this, arguments);
	  }
	  _createClass(BaseObservableMap, [{
	    key: "emitReset",
	    value: function emitReset() {
	      var _iterator = _createForOfIteratorHelper(this._handlers),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var h = _step.value;
	          h.onReset();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "emitAdd",
	    value: function emitAdd(key, value) {
	      var _iterator2 = _createForOfIteratorHelper(this._handlers),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var h = _step2.value;
	          h.onAdd(key, value);
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "emitUpdate",
	    value: function emitUpdate(key, value) {
	      for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	        params[_key - 2] = arguments[_key];
	      }
	      var _iterator3 = _createForOfIteratorHelper(this._handlers),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var h = _step3.value;
	          h.onUpdate.apply(h, [key, value].concat(params));
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "emitRemove",
	    value: function emitRemove(key, value) {
	      var _iterator4 = _createForOfIteratorHelper(this._handlers),
	          _step4;
	      try {
	        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	          var h = _step4.value;
	          h.onRemove(key, value);
	        }
	      } catch (err) {
	        _iterator4.e(err);
	      } finally {
	        _iterator4.f();
	      }
	    }
	  }]);
	  return BaseObservableMap;
	}(BaseObservable);

	var ObservableMap = function (_BaseObservableMap) {
	  _inherits(ObservableMap, _BaseObservableMap);
	  var _super = _createSuper(ObservableMap);
	  function ObservableMap(initialValues) {
	    var _this;
	    _classCallCheck(this, ObservableMap);
	    _this = _super.call(this);
	    _this._values = new Map(initialValues);
	    return _this;
	  }
	  _createClass(ObservableMap, [{
	    key: "update",
	    value: function update(key, params) {
	      var value = this._values.get(key);
	      if (value !== undefined) {
	        this._values.set(key, value);
	        this.emitUpdate(key, value, params);
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "add",
	    value: function add(key, value) {
	      if (!this._values.has(key)) {
	        this._values.set(key, value);
	        this.emitAdd(key, value);
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "remove",
	    value: function remove(key) {
	      var value = this._values.get(key);
	      if (value !== undefined) {
	        this._values.delete(key);
	        this.emitRemove(key, value);
	        return true;
	      } else {
	        return false;
	      }
	    }
	  }, {
	    key: "reset",
	    value: function reset() {
	      this._values.clear();
	      this.emitReset();
	    }
	  }, {
	    key: "get",
	    value: function get(key) {
	      return this._values.get(key);
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._values.entries();
	    }
	  }, {
	    key: "values",
	    value: function values() {
	      return this._values.values();
	    }
	  }, {
	    key: "size",
	    get: function get() {
	      return this._values.size;
	    }
	  }]);
	  return ObservableMap;
	}(BaseObservableMap);

	var SortedMapList = function (_BaseObservableList) {
	  _inherits(SortedMapList, _BaseObservableList);
	  var _super = _createSuper(SortedMapList);
	  function SortedMapList(sourceMap, comparator) {
	    var _this;
	    _classCallCheck(this, SortedMapList);
	    _this = _super.call(this);
	    _this._sourceMap = sourceMap;
	    _this._comparator = function (a, b) {
	      return comparator(a.value, b.value);
	    };
	    _this._sortedPairs = null;
	    _this._mapSubscription = null;
	    return _this;
	  }
	  _createClass(SortedMapList, [{
	    key: "onAdd",
	    value: function onAdd(key, value) {
	      var pair = {
	        key: key,
	        value: value
	      };
	      var idx = sortedIndex(this._sortedPairs, pair, this._comparator);
	      this._sortedPairs.splice(idx, 0, pair);
	      this.emitAdd(idx, value);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(key, value) {
	      var pair = {
	        key: key,
	        value: value
	      };
	      var idx = sortedIndex(this._sortedPairs, pair, this._comparator);
	      this._sortedPairs.splice(idx, 1);
	      this.emitRemove(idx, value);
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(key, value, params) {
	      var oldIdx = this._sortedPairs.findIndex(function (p) {
	        return p.key === key;
	      });
	      this._sortedPairs.splice(oldIdx, 1);
	      var pair = {
	        key: key,
	        value: value
	      };
	      var newIdx = sortedIndex(this._sortedPairs, pair, this._comparator);
	      this._sortedPairs.splice(newIdx, 0, pair);
	      if (oldIdx !== newIdx) {
	        this.emitMove(oldIdx, newIdx, value);
	      }
	      this.emitUpdate(newIdx, value, params);
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this._sortedPairs = [];
	      this.emitReset();
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      this._mapSubscription = this._sourceMap.subscribe(this);
	      this._sortedPairs = new Array(this._sourceMap.size);
	      var i = 0;
	      var _iterator = _createForOfIteratorHelper(this._sourceMap),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              key = _step$value[0],
	              value = _step$value[1];
	          this._sortedPairs[i] = {
	            key: key,
	            value: value
	          };
	          ++i;
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      this._sortedPairs.sort(this._comparator);
	      _get(_getPrototypeOf(SortedMapList.prototype), "onSubscribeFirst", this).call(this);
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      _get(_getPrototypeOf(SortedMapList.prototype), "onUnsubscribeLast", this).call(this);
	      this._sortedPairs = null;
	      this._mapSubscription = this._mapSubscription();
	    }
	  }, {
	    key: "get",
	    value: function get(index) {
	      return this._sortedPairs[index].value;
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      var it = this._sortedPairs.values();
	      return {
	        next: function next() {
	          var v = it.next();
	          if (v.value) {
	            v.value = v.value.value;
	          }
	          return v;
	        }
	      };
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this._sourceMap.size;
	    }
	  }]);
	  return SortedMapList;
	}(BaseObservableList);

	var FilteredMap = function (_BaseObservableMap) {
	  _inherits(FilteredMap, _BaseObservableMap);
	  var _super = _createSuper(FilteredMap);
	  function FilteredMap(source, mapper, updater) {
	    var _this;
	    _classCallCheck(this, FilteredMap);
	    _this = _super.call(this);
	    _this._source = source;
	    _this._mapper = mapper;
	    _this._updater = updater;
	    _this._mappedValues = new Map();
	    return _this;
	  }
	  _createClass(FilteredMap, [{
	    key: "onAdd",
	    value: function onAdd(key, value) {
	      var mappedValue = this._mapper(value);
	      this._mappedValues.set(key, mappedValue);
	      this.emitAdd(key, mappedValue);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(key, _value) {
	      var mappedValue = this._mappedValues.get(key);
	      if (this._mappedValues.delete(key)) {
	        this.emitRemove(key, mappedValue);
	      }
	    }
	  }, {
	    key: "onChange",
	    value: function onChange(key, value, params) {
	      var mappedValue = this._mappedValues.get(key);
	      if (mappedValue !== undefined) {
	        var newParams = this._updater(value, params);
	        if (newParams !== undefined) {
	          this.emitChange(key, mappedValue, newParams);
	        }
	      }
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      var _iterator = _createForOfIteratorHelper(this._source),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              key = _step$value[0],
	              value = _step$value[1];
	          var mappedValue = this._mapper(value);
	          this._mappedValues.set(key, mappedValue);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      _get(_getPrototypeOf(FilteredMap.prototype), "onSubscribeFirst", this).call(this);
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      _get(_getPrototypeOf(FilteredMap.prototype), "onUnsubscribeLast", this).call(this);
	      this._mappedValues.clear();
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this._mappedValues.clear();
	      this.emitReset();
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._mappedValues.entries()[Symbol.iterator];
	    }
	  }]);
	  return FilteredMap;
	}(BaseObservableMap);

	var MappedMap = function (_BaseObservableMap) {
	  _inherits(MappedMap, _BaseObservableMap);
	  var _super = _createSuper(MappedMap);
	  function MappedMap(source, mapper) {
	    var _this;
	    _classCallCheck(this, MappedMap);
	    _this = _super.call(this);
	    _this._source = source;
	    _this._mapper = mapper;
	    _this._mappedValues = new Map();
	    return _this;
	  }
	  _createClass(MappedMap, [{
	    key: "_emitSpontaneousUpdate",
	    value: function _emitSpontaneousUpdate(key, params) {
	      var value = this._mappedValues.get(key);
	      if (value) {
	        this.emitUpdate(key, value, params);
	      }
	    }
	  }, {
	    key: "onAdd",
	    value: function onAdd(key, value) {
	      var emitSpontaneousUpdate = this._emitSpontaneousUpdate.bind(this, key);
	      var mappedValue = this._mapper(value, emitSpontaneousUpdate);
	      this._mappedValues.set(key, mappedValue);
	      this.emitAdd(key, mappedValue);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(key, _value) {
	      var mappedValue = this._mappedValues.get(key);
	      if (this._mappedValues.delete(key)) {
	        this.emitRemove(key, mappedValue);
	      }
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(key, value, params) {
	      var mappedValue = this._mappedValues.get(key);
	      if (mappedValue !== undefined) {
	        this.emitUpdate(key, mappedValue, params);
	      }
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      this._subscription = this._source.subscribe(this);
	      var _iterator = _createForOfIteratorHelper(this._source),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              key = _step$value[0],
	              value = _step$value[1];
	          var emitSpontaneousUpdate = this._emitSpontaneousUpdate.bind(this, key);
	          var mappedValue = this._mapper(value, emitSpontaneousUpdate);
	          this._mappedValues.set(key, mappedValue);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      _get(_getPrototypeOf(MappedMap.prototype), "onSubscribeFirst", this).call(this);
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      this._subscription = this._subscription();
	      this._mappedValues.clear();
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this._mappedValues.clear();
	      this.emitReset();
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._mappedValues.entries();
	    }
	  }, {
	    key: "size",
	    get: function get() {
	      return this._mappedValues.size;
	    }
	  }]);
	  return MappedMap;
	}(BaseObservableMap);

	var ObservableArray = function (_BaseObservableList) {
	  _inherits(ObservableArray, _BaseObservableList);
	  var _super = _createSuper(ObservableArray);
	  function ObservableArray() {
	    var _this;
	    var initialValues = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	    _classCallCheck(this, ObservableArray);
	    _this = _super.call(this);
	    _this._items = initialValues;
	    return _this;
	  }
	  _createClass(ObservableArray, [{
	    key: "append",
	    value: function append(item) {
	      this._items.push(item);
	      this.emitAdd(this._items.length - 1, item);
	    }
	  }, {
	    key: "insertMany",
	    value: function insertMany(idx, items) {
	      var _iterator = _createForOfIteratorHelper(items),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var item = _step.value;
	          this.insert(idx, item);
	          idx += 1;
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "insert",
	    value: function insert(idx, item) {
	      this._items.splice(idx, 0, item);
	      this.emitAdd(idx, item);
	    }
	  }, {
	    key: "at",
	    value: function at(idx) {
	      if (this._items && idx >= 0 && idx < this._items.length) {
	        return this._items[idx];
	      }
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._items.values();
	    }
	  }, {
	    key: "array",
	    get: function get() {
	      return this._items;
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this._items.length;
	    }
	  }]);
	  return ObservableArray;
	}(BaseObservableList);

	var SortedArray = function (_BaseObservableList) {
	  _inherits(SortedArray, _BaseObservableList);
	  var _super = _createSuper(SortedArray);
	  function SortedArray(comparator) {
	    var _this;
	    _classCallCheck(this, SortedArray);
	    _this = _super.call(this);
	    _this._comparator = comparator;
	    _this._items = [];
	    return _this;
	  }
	  _createClass(SortedArray, [{
	    key: "setManyUnsorted",
	    value: function setManyUnsorted(items) {
	      this.setManySorted(items);
	    }
	  }, {
	    key: "setManySorted",
	    value: function setManySorted(items) {
	      var _iterator = _createForOfIteratorHelper(items),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var item = _step.value;
	          this.set(item);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "replace",
	    value: function replace(item) {
	      var idx = this.indexOf(item);
	      if (idx !== -1) {
	        this._items[idx] = item;
	      }
	    }
	  }, {
	    key: "indexOf",
	    value: function indexOf(item) {
	      var idx = sortedIndex(this._items, item, this._comparator);
	      if (idx < this._items.length && this._comparator(this._items[idx], item) === 0) {
	        return idx;
	      } else {
	        return -1;
	      }
	    }
	  }, {
	    key: "set",
	    value: function set(item) {
	      var updateParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var idx = sortedIndex(this._items, item, this._comparator);
	      if (idx >= this._items.length || this._comparator(this._items[idx], item) !== 0) {
	        this._items.splice(idx, 0, item);
	        this.emitAdd(idx, item);
	      } else {
	        this._items[idx] = item;
	        this.emitUpdate(idx, item, updateParams);
	      }
	    }
	  }, {
	    key: "get",
	    value: function get(idx) {
	      return this._items[idx];
	    }
	  }, {
	    key: "remove",
	    value: function remove(idx) {
	      var item = this._items[idx];
	      this._items.splice(idx, 1);
	      this.emitRemove(idx, item);
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._items.values();
	    }
	  }, {
	    key: "array",
	    get: function get() {
	      return this._items;
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this._items.length;
	    }
	  }]);
	  return SortedArray;
	}(BaseObservableList);

	var MappedList = function (_BaseObservableList) {
	  _inherits(MappedList, _BaseObservableList);
	  var _super = _createSuper(MappedList);
	  function MappedList(sourceList, mapper, updater) {
	    var _this;
	    _classCallCheck(this, MappedList);
	    _this = _super.call(this);
	    _this._sourceList = sourceList;
	    _this._mapper = mapper;
	    _this._updater = updater;
	    _this._sourceUnsubscribe = null;
	    _this._mappedValues = null;
	    return _this;
	  }
	  _createClass(MappedList, [{
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      this._sourceUnsubscribe = this._sourceList.subscribe(this);
	      this._mappedValues = [];
	      var _iterator = _createForOfIteratorHelper(this._sourceList),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var item = _step.value;
	          this._mappedValues.push(this._mapper(item));
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this._mappedValues = [];
	      this.emitReset();
	    }
	  }, {
	    key: "onAdd",
	    value: function onAdd(index, value) {
	      var mappedValue = this._mapper(value);
	      this._mappedValues.splice(index, 0, mappedValue);
	      this.emitAdd(index, mappedValue);
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(index, value, params) {
	      var mappedValue = this._mappedValues[index];
	      if (this._updater) {
	        this._updater(mappedValue, params, value);
	      }
	      this.emitUpdate(index, mappedValue, params);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(index) {
	      var mappedValue = this._mappedValues[index];
	      this._mappedValues.splice(index, 1);
	      this.emitRemove(index, mappedValue);
	    }
	  }, {
	    key: "onMove",
	    value: function onMove(fromIdx, toIdx) {
	      var mappedValue = this._mappedValues[fromIdx];
	      this._mappedValues.splice(fromIdx, 1);
	      this._mappedValues.splice(toIdx, 0, mappedValue);
	      this.emitMove(fromIdx, toIdx, mappedValue);
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      this._sourceUnsubscribe();
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._mappedValues.values();
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this._mappedValues.length;
	    }
	  }]);
	  return MappedList;
	}(BaseObservableList);

	var ConcatList = function (_BaseObservableList) {
	  _inherits(ConcatList, _BaseObservableList);
	  var _super = _createSuper(ConcatList);
	  function ConcatList() {
	    var _this;
	    _classCallCheck(this, ConcatList);
	    _this = _super.call(this);
	    for (var _len = arguments.length, sourceLists = new Array(_len), _key = 0; _key < _len; _key++) {
	      sourceLists[_key] = arguments[_key];
	    }
	    _this._sourceLists = sourceLists;
	    _this._sourceUnsubscribes = null;
	    return _this;
	  }
	  _createClass(ConcatList, [{
	    key: "_offsetForSource",
	    value: function _offsetForSource(sourceList) {
	      var listIdx = this._sourceLists.indexOf(sourceList);
	      var offset = 0;
	      for (var i = 0; i < listIdx; ++i) {
	        offset += this._sourceLists[i].length;
	      }
	      return offset;
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      this._sourceUnsubscribes = [];
	      var _iterator = _createForOfIteratorHelper(this._sourceLists),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var sourceList = _step.value;
	          this._sourceUnsubscribes.push(sourceList.subscribe(this));
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      var _iterator2 = _createForOfIteratorHelper(this._sourceUnsubscribes),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var sourceUnsubscribe = _step2.value;
	          sourceUnsubscribe();
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this.emitReset();
	      var idx = 0;
	      var _iterator3 = _createForOfIteratorHelper(this),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var item = _step3.value;
	          this.emitAdd(idx, item);
	          idx += 1;
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "onAdd",
	    value: function onAdd(index, value, sourceList) {
	      this.emitAdd(this._offsetForSource(sourceList) + index, value);
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(index, value, params, sourceList) {
	      this.emitUpdate(this._offsetForSource(sourceList) + index, value, params);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(index, value, sourceList) {
	      this.emitRemove(this._offsetForSource(sourceList) + index, value);
	    }
	  }, {
	    key: "onMove",
	    value: function onMove(fromIdx, toIdx, value, sourceList) {
	      var offset = this._offsetForSource(sourceList);
	      this.emitMove(offset + fromIdx, offset + toIdx, value);
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      var _this2 = this;
	      var sourceListIdx = 0;
	      var it = this._sourceLists[0][Symbol.iterator]();
	      return {
	        next: function next() {
	          var result = it.next();
	          while (result.done) {
	            sourceListIdx += 1;
	            if (sourceListIdx >= _this2._sourceLists.length) {
	              return result;
	            }
	            it = _this2._sourceLists[sourceListIdx][Symbol.iterator]();
	            result = it.next();
	          }
	          return result;
	        }
	      };
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      var len = 0;
	      for (var i = 0; i < this._sourceLists.length; ++i) {
	        len += this._sourceLists[i].length;
	      }
	      return len;
	    }
	  }]);
	  return ConcatList;
	}(BaseObservableList);

	Object.assign(BaseObservableMap.prototype, {
	  sortValues: function sortValues(comparator) {
	    return new SortedMapList(this, comparator);
	  },
	  mapValues: function mapValues(mapper) {
	    return new MappedMap(this, mapper);
	  },
	  filterValues: function filterValues(filter) {
	    return new FilteredMap(this, filter);
	  }
	});

	function disposeValue(value) {
	  if (typeof value === "function") {
	    value();
	  } else {
	    value.dispose();
	  }
	}
	var Disposables = function () {
	  function Disposables() {
	    _classCallCheck(this, Disposables);
	    this._disposables = [];
	  }
	  _createClass(Disposables, [{
	    key: "track",
	    value: function track(disposable) {
	      if (this.isDisposed) {
	        throw new Error("Already disposed, check isDisposed after await if needed");
	      }
	      this._disposables.push(disposable);
	      return disposable;
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this._disposables) {
	        var _iterator = _createForOfIteratorHelper(this._disposables),
	            _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var d = _step.value;
	            disposeValue(d);
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	        this._disposables = null;
	      }
	    }
	  }, {
	    key: "disposeTracked",
	    value: function disposeTracked(value) {
	      if (value === undefined || value === null || this.isDisposed) {
	        return null;
	      }
	      var idx = this._disposables.indexOf(value);
	      if (idx !== -1) {
	        var _this$_disposables$sp = this._disposables.splice(idx, 1),
	            _this$_disposables$sp2 = _slicedToArray(_this$_disposables$sp, 1),
	            foundValue = _this$_disposables$sp2[0];
	        disposeValue(foundValue);
	      } else {
	        console.warn("disposable not found, did it leak?", value);
	      }
	      return null;
	    }
	  }, {
	    key: "isDisposed",
	    get: function get() {
	      return this._disposables === null;
	    }
	  }]);
	  return Disposables;
	}();

	var ReaderRequest = function () {
	  function ReaderRequest(fn) {
	    _classCallCheck(this, ReaderRequest);
	    this.decryptRequest = null;
	    this._promise = fn(this);
	  }
	  _createClass(ReaderRequest, [{
	    key: "complete",
	    value: function complete() {
	      return this._promise;
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this.decryptRequest) {
	        this.decryptRequest.dispose();
	        this.decryptRequest = null;
	      }
	    }
	  }]);
	  return ReaderRequest;
	}();
	var TimelineReader = function () {
	  function TimelineReader(_ref) {
	    var roomId = _ref.roomId,
	        storage = _ref.storage,
	        fragmentIdComparer = _ref.fragmentIdComparer;
	    _classCallCheck(this, TimelineReader);
	    this._roomId = roomId;
	    this._storage = storage;
	    this._fragmentIdComparer = fragmentIdComparer;
	    this._decryptEntries = null;
	  }
	  _createClass(TimelineReader, [{
	    key: "enableEncryption",
	    value: function enableEncryption(decryptEntries) {
	      this._decryptEntries = decryptEntries;
	    }
	  }, {
	    key: "_openTxn",
	    value: function _openTxn() {
	      var stores = [this._storage.storeNames.timelineEvents, this._storage.storeNames.timelineFragments];
	      if (this._decryptEntries) {
	        stores.push(this._storage.storeNames.inboundGroupSessions);
	      }
	      return this._storage.readTxn(stores);
	    }
	  }, {
	    key: "readFrom",
	    value: function readFrom(eventKey, direction, amount) {
	      var _this = this;
	      return new ReaderRequest( function () {
	        var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(r) {
	          var txn;
	          return regeneratorRuntime.wrap(function _callee$(_context) {
	            while (1) {
	              switch (_context.prev = _context.next) {
	                case 0:
	                  _context.next = 2;
	                  return _this._openTxn();
	                case 2:
	                  txn = _context.sent;
	                  _context.next = 5;
	                  return _this._readFrom(eventKey, direction, amount, r, txn);
	                case 5:
	                  return _context.abrupt("return", _context.sent);
	                case 6:
	                case "end":
	                  return _context.stop();
	              }
	            }
	          }, _callee);
	        }));
	        return function (_x) {
	          return _ref2.apply(this, arguments);
	        };
	      }());
	    }
	  }, {
	    key: "readFromEnd",
	    value: function readFromEnd(amount) {
	      var _this2 = this;
	      return new ReaderRequest( function () {
	        var _ref3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(r) {
	          var txn, liveFragment, entries, liveFragmentEntry, eventKey;
	          return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	              switch (_context2.prev = _context2.next) {
	                case 0:
	                  _context2.next = 2;
	                  return _this2._openTxn();
	                case 2:
	                  txn = _context2.sent;
	                  _context2.next = 5;
	                  return txn.timelineFragments.liveFragment(_this2._roomId);
	                case 5:
	                  liveFragment = _context2.sent;
	                  if (liveFragment) {
	                    _context2.next = 10;
	                    break;
	                  }
	                  entries = [];
	                  _context2.next = 17;
	                  break;
	                case 10:
	                  _this2._fragmentIdComparer.add(liveFragment);
	                  liveFragmentEntry = FragmentBoundaryEntry.end(liveFragment, _this2._fragmentIdComparer);
	                  eventKey = liveFragmentEntry.asEventKey();
	                  _context2.next = 15;
	                  return _this2._readFrom(eventKey, Direction.Backward, amount, r, txn);
	                case 15:
	                  entries = _context2.sent;
	                  entries.unshift(liveFragmentEntry);
	                case 17:
	                  return _context2.abrupt("return", entries);
	                case 18:
	                case "end":
	                  return _context2.stop();
	              }
	            }
	          }, _callee2);
	        }));
	        return function (_x2) {
	          return _ref3.apply(this, arguments);
	        };
	      }());
	    }
	  }, {
	    key: "_readFrom",
	    value: function () {
	      var _readFrom2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(eventKey, direction, amount, r, txn) {
	        var _this3 = this;
	        var entries, timelineStore, fragmentStore, eventsWithinFragment, eventEntries, fragment, fragmentEntry, nextFragment, nextFragmentEntry;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                entries = [];
	                timelineStore = txn.timelineEvents;
	                fragmentStore = txn.timelineFragments;
	              case 3:
	                if (!(entries.length < amount && eventKey)) {
	                  _context3.next = 35;
	                  break;
	                }
	                eventsWithinFragment = void 0;
	                if (!direction.isForward) {
	                  _context3.next = 11;
	                  break;
	                }
	                _context3.next = 8;
	                return timelineStore.eventsAfter(this._roomId, eventKey, amount);
	              case 8:
	                eventsWithinFragment = _context3.sent;
	                _context3.next = 14;
	                break;
	              case 11:
	                _context3.next = 13;
	                return timelineStore.eventsBefore(this._roomId, eventKey, amount);
	              case 13:
	                eventsWithinFragment = _context3.sent;
	              case 14:
	                eventEntries = eventsWithinFragment.map(function (e) {
	                  return new EventEntry(e, _this3._fragmentIdComparer);
	                });
	                entries = directionalConcat(entries, eventEntries, direction);
	                if (!(entries.length < amount)) {
	                  _context3.next = 33;
	                  break;
	                }
	                _context3.next = 19;
	                return fragmentStore.get(this._roomId, eventKey.fragmentId);
	              case 19:
	                fragment = _context3.sent;
	                fragmentEntry = new FragmentBoundaryEntry(fragment, direction.isBackward, this._fragmentIdComparer);
	                directionalAppend(entries, fragmentEntry, direction);
	                if (!(!fragmentEntry.token && fragmentEntry.hasLinkedFragment)) {
	                  _context3.next = 32;
	                  break;
	                }
	                _context3.next = 25;
	                return fragmentStore.get(this._roomId, fragmentEntry.linkedFragmentId);
	              case 25:
	                nextFragment = _context3.sent;
	                this._fragmentIdComparer.add(nextFragment);
	                nextFragmentEntry = new FragmentBoundaryEntry(nextFragment, direction.isForward, this._fragmentIdComparer);
	                directionalAppend(entries, nextFragmentEntry, direction);
	                eventKey = nextFragmentEntry.asEventKey();
	                _context3.next = 33;
	                break;
	              case 32:
	                eventKey = null;
	              case 33:
	                _context3.next = 3;
	                break;
	              case 35:
	                if (!this._decryptEntries) {
	                  _context3.next = 43;
	                  break;
	                }
	                r.decryptRequest = this._decryptEntries(entries, txn);
	                _context3.prev = 37;
	                _context3.next = 40;
	                return r.decryptRequest.complete();
	              case 40:
	                _context3.prev = 40;
	                r.decryptRequest = null;
	                return _context3.finish(40);
	              case 43:
	                return _context3.abrupt("return", entries);
	              case 44:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[37,, 40, 43]]);
	      }));
	      function _readFrom(_x3, _x4, _x5, _x6, _x7) {
	        return _readFrom2.apply(this, arguments);
	      }
	      return _readFrom;
	    }()
	  }]);
	  return TimelineReader;
	}();

	var PendingEventEntry = function (_BaseEntry) {
	  _inherits(PendingEventEntry, _BaseEntry);
	  var _super = _createSuper(PendingEventEntry);
	  function PendingEventEntry(_ref) {
	    var _this;
	    var pendingEvent = _ref.pendingEvent,
	        user = _ref.user;
	    _classCallCheck(this, PendingEventEntry);
	    _this = _super.call(this, null);
	    _this._pendingEvent = pendingEvent;
	    _this._user = user;
	    return _this;
	  }
	  _createClass(PendingEventEntry, [{
	    key: "notifyUpdate",
	    value: function notifyUpdate() {}
	  }, {
	    key: "fragmentId",
	    get: function get() {
	      return PENDING_FRAGMENT_ID;
	    }
	  }, {
	    key: "entryIndex",
	    get: function get() {
	      return this._pendingEvent.queueIndex;
	    }
	  }, {
	    key: "content",
	    get: function get() {
	      return this._pendingEvent.content;
	    }
	  }, {
	    key: "event",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "eventType",
	    get: function get() {
	      return this._pendingEvent.eventType;
	    }
	  }, {
	    key: "stateKey",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "sender",
	    get: function get() {
	      return this._user.id;
	    }
	  }, {
	    key: "timestamp",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "isPending",
	    get: function get() {
	      return true;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._pendingEvent.txnId;
	    }
	  }]);
	  return PendingEventEntry;
	}(BaseEntry);

	var Timeline = function () {
	  function Timeline(_ref) {
	    var roomId = _ref.roomId,
	        storage = _ref.storage,
	        closeCallback = _ref.closeCallback,
	        fragmentIdComparer = _ref.fragmentIdComparer,
	        pendingEvents = _ref.pendingEvents,
	        user = _ref.user;
	    _classCallCheck(this, Timeline);
	    this._roomId = roomId;
	    this._storage = storage;
	    this._closeCallback = closeCallback;
	    this._fragmentIdComparer = fragmentIdComparer;
	    this._disposables = new Disposables();
	    this._remoteEntries = new SortedArray(function (a, b) {
	      return a.compare(b);
	    });
	    this._timelineReader = new TimelineReader({
	      roomId: this._roomId,
	      storage: this._storage,
	      fragmentIdComparer: this._fragmentIdComparer
	    });
	    this._readerRequest = null;
	    var localEntries = new MappedList(pendingEvents, function (pe) {
	      return new PendingEventEntry({
	        pendingEvent: pe,
	        user: user
	      });
	    }, function (pee, params) {
	      pee.notifyUpdate(params);
	    });
	    this._allEntries = new ConcatList(this._remoteEntries, localEntries);
	  }
	  _createClass(Timeline, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        var readerRequest, entries;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                readerRequest = this._disposables.track(this._timelineReader.readFromEnd(30));
	                _context.prev = 1;
	                _context.next = 4;
	                return readerRequest.complete();
	              case 4:
	                entries = _context.sent;
	                this._remoteEntries.setManySorted(entries);
	              case 6:
	                _context.prev = 6;
	                this._disposables.disposeTracked(readerRequest);
	                return _context.finish(6);
	              case 9:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[1,, 6, 9]]);
	      }));
	      function load() {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "replaceEntries",
	    value: function replaceEntries(entries) {
	      var _iterator = _createForOfIteratorHelper(entries),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var entry = _step.value;
	          this._remoteEntries.replace(entry);
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "appendLiveEntries",
	    value: function appendLiveEntries(newEntries) {
	      this._remoteEntries.setManySorted(newEntries);
	    }
	  }, {
	    key: "addGapEntries",
	    value: function addGapEntries(newEntries) {
	      this._remoteEntries.setManySorted(newEntries);
	    }
	  }, {
	    key: "loadAtTop",
	    value: function () {
	      var _loadAtTop = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(amount) {
	        var firstEventEntry, readerRequest, entries;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                firstEventEntry = this._remoteEntries.array.find(function (e) {
	                  return !!e.eventType;
	                });
	                if (firstEventEntry) {
	                  _context2.next = 3;
	                  break;
	                }
	                return _context2.abrupt("return");
	              case 3:
	                readerRequest = this._disposables.track(this._timelineReader.readFrom(firstEventEntry.asEventKey(), Direction.Backward, amount));
	                _context2.prev = 4;
	                _context2.next = 7;
	                return readerRequest.complete();
	              case 7:
	                entries = _context2.sent;
	                this._remoteEntries.setManySorted(entries);
	              case 9:
	                _context2.prev = 9;
	                this._disposables.disposeTracked(readerRequest);
	                return _context2.finish(9);
	              case 12:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[4,, 9, 12]]);
	      }));
	      function loadAtTop(_x) {
	        return _loadAtTop.apply(this, arguments);
	      }
	      return loadAtTop;
	    }()
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this._closeCallback) {
	        this._disposables.dispose();
	        this._closeCallback();
	        this._closeCallback = null;
	      }
	    }
	  }, {
	    key: "enableEncryption",
	    value: function enableEncryption(decryptEntries) {
	      this._timelineReader.enableEncryption(decryptEntries);
	    }
	  }, {
	    key: "entries",
	    get: function get() {
	      return this._allEntries;
	    }
	  }]);
	  return Timeline;
	}();

	function findBackwardSiblingFragments(current, byId) {
	  var sortedSiblings = [];
	  while (isValidFragmentId(current.previousId)) {
	    var previous = byId.get(current.previousId);
	    if (!previous) {
	      break;
	    }
	    if (previous.nextId !== current.id) {
	      throw new Error("Previous fragment ".concat(previous.id, " doesn't point back to ").concat(current.id));
	    }
	    byId.delete(current.previousId);
	    sortedSiblings.unshift(previous);
	    current = previous;
	  }
	  return sortedSiblings;
	}
	function findForwardSiblingFragments(current, byId) {
	  var sortedSiblings = [];
	  while (isValidFragmentId(current.nextId)) {
	    var next = byId.get(current.nextId);
	    if (!next) {
	      break;
	    }
	    if (next.previousId !== current.id) {
	      throw new Error("Next fragment ".concat(next.id, " doesn't point back to ").concat(current.id));
	    }
	    byId.delete(current.nextId);
	    sortedSiblings.push(next);
	    current = next;
	  }
	  return sortedSiblings;
	}
	function createIslands(fragments) {
	  var byId = new Map();
	  var _iterator = _createForOfIteratorHelper(fragments),
	      _step;
	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var f = _step.value;
	      byId.set(f.id, f);
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }
	  var islands = [];
	  while (byId.size) {
	    var current = byId.values().next().value;
	    byId.delete(current.id);
	    var previousSiblings = findBackwardSiblingFragments(current, byId);
	    var nextSiblings = findForwardSiblingFragments(current, byId);
	    var island = previousSiblings.concat(current, nextSiblings);
	    islands.push(island);
	  }
	  return islands.map(function (a) {
	    return new Island(a);
	  });
	}
	var Fragment = function Fragment(id, previousId, nextId) {
	  _classCallCheck(this, Fragment);
	  this.id = id;
	  this.previousId = previousId;
	  this.nextId = nextId;
	};
	var Island = function () {
	  function Island(sortedFragments) {
	    var _this = this;
	    _classCallCheck(this, Island);
	    this._idToSortIndex = new Map();
	    sortedFragments.forEach(function (f, i) {
	      _this._idToSortIndex.set(f.id, i);
	    });
	  }
	  _createClass(Island, [{
	    key: "compare",
	    value: function compare(idA, idB) {
	      var sortIndexA = this._idToSortIndex.get(idA);
	      if (sortIndexA === undefined) {
	        throw new Error("first id ".concat(idA, " isn't part of this island"));
	      }
	      var sortIndexB = this._idToSortIndex.get(idB);
	      if (sortIndexB === undefined) {
	        throw new Error("second id ".concat(idB, " isn't part of this island"));
	      }
	      return sortIndexA - sortIndexB;
	    }
	  }, {
	    key: "fragmentIds",
	    get: function get() {
	      return this._idToSortIndex.keys();
	    }
	  }]);
	  return Island;
	}();
	var FragmentIdComparer = function () {
	  function FragmentIdComparer(fragments) {
	    _classCallCheck(this, FragmentIdComparer);
	    this._fragmentsById = fragments.reduce(function (map, f) {
	      map.set(f.id, f);
	      return map;
	    }, new Map());
	    this.rebuild(fragments);
	  }
	  _createClass(FragmentIdComparer, [{
	    key: "_getIsland",
	    value: function _getIsland(id) {
	      var island = this._idToIsland.get(id);
	      if (island === undefined) {
	        throw new Error("Unknown fragment id ".concat(id));
	      }
	      return island;
	    }
	  }, {
	    key: "compare",
	    value: function compare(idA, idB) {
	      if (idA === idB) {
	        return 0;
	      }
	      var islandA = this._getIsland(idA);
	      var islandB = this._getIsland(idB);
	      if (islandA !== islandB) {
	        throw new Error("".concat(idA, " and ").concat(idB, " are on different islands, can't tell order"));
	      }
	      return islandA.compare(idA, idB);
	    }
	  }, {
	    key: "rebuild",
	    value: function rebuild(fragments) {
	      var islands = createIslands(fragments);
	      this._idToIsland = new Map();
	      var _iterator2 = _createForOfIteratorHelper(islands),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var island = _step2.value;
	          var _iterator3 = _createForOfIteratorHelper(island.fragmentIds),
	              _step3;
	          try {
	            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	              var id = _step3.value;
	              this._idToIsland.set(id, island);
	            }
	          } catch (err) {
	            _iterator3.e(err);
	          } finally {
	            _iterator3.f();
	          }
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "add",
	    value: function add(fragment) {
	      var copy = new Fragment(fragment.id, fragment.previousId, fragment.nextId);
	      this._fragmentsById.set(fragment.id, copy);
	      this.rebuild(this._fragmentsById.values());
	    }
	  }, {
	    key: "append",
	    value: function append(id, previousId) {
	      var fragment = new Fragment(id, previousId, null);
	      var prevFragment = this._fragmentsById.get(previousId);
	      if (prevFragment) {
	        prevFragment.nextId = id;
	      }
	      this._fragmentsById.set(id, fragment);
	      this.rebuild(this._fragmentsById.values());
	    }
	  }, {
	    key: "prepend",
	    value: function prepend(id, nextId) {
	      var fragment = new Fragment(id, null, nextId);
	      var nextFragment = this._fragmentsById.get(nextId);
	      if (nextFragment) {
	        nextFragment.previousId = id;
	      }
	      this._fragmentsById.set(id, fragment);
	      this.rebuild(this._fragmentsById.values());
	    }
	  }]);
	  return FragmentIdComparer;
	}();

	var PendingEvent = function () {
	  function PendingEvent(data) {
	    _classCallCheck(this, PendingEvent);
	    this._data = data;
	  }
	  _createClass(PendingEvent, [{
	    key: "setEncrypted",
	    value: function setEncrypted(type, content) {
	      this._data.eventType = type;
	      this._data.content = content;
	      this._data.needsEncryption = false;
	    }
	  }, {
	    key: "roomId",
	    get: function get() {
	      return this._data.roomId;
	    }
	  }, {
	    key: "queueIndex",
	    get: function get() {
	      return this._data.queueIndex;
	    }
	  }, {
	    key: "eventType",
	    get: function get() {
	      return this._data.eventType;
	    }
	  }, {
	    key: "txnId",
	    get: function get() {
	      return this._data.txnId;
	    }
	  }, {
	    key: "remoteId",
	    get: function get() {
	      return this._data.remoteId;
	    },
	    set: function set(value) {
	      this._data.remoteId = value;
	    }
	  }, {
	    key: "content",
	    get: function get() {
	      return this._data.content;
	    }
	  }, {
	    key: "needsEncryption",
	    get: function get() {
	      return this._data.needsEncryption;
	    }
	  }, {
	    key: "data",
	    get: function get() {
	      return this._data;
	    }
	  }]);
	  return PendingEvent;
	}();

	function makeTxnId() {
	  var n = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
	  var str = n.toString(16);
	  return "t" + "0".repeat(14 - str.length) + str;
	}

	var SendQueue = function () {
	  function SendQueue(_ref) {
	    var roomId = _ref.roomId,
	        storage = _ref.storage,
	        sendScheduler = _ref.sendScheduler,
	        pendingEvents = _ref.pendingEvents;
	    _classCallCheck(this, SendQueue);
	    pendingEvents = pendingEvents || [];
	    this._roomId = roomId;
	    this._storage = storage;
	    this._sendScheduler = sendScheduler;
	    this._pendingEvents = new SortedArray(function (a, b) {
	      return a.queueIndex - b.queueIndex;
	    });
	    if (pendingEvents.length) {
	      console.info("SendQueue for room ".concat(roomId, " has ").concat(pendingEvents.length, " pending events"), pendingEvents);
	    }
	    this._pendingEvents.setManyUnsorted(pendingEvents.map(function (data) {
	      return new PendingEvent(data);
	    }));
	    this._isSending = false;
	    this._offline = false;
	    this._amountSent = 0;
	    this._roomEncryption = null;
	  }
	  _createClass(SendQueue, [{
	    key: "enableEncryption",
	    value: function enableEncryption(roomEncryption) {
	      this._roomEncryption = roomEncryption;
	    }
	  }, {
	    key: "_sendLoop",
	    value: function () {
	      var _sendLoop2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var _this = this;
	        var _loop, _ret;
	        return regeneratorRuntime.wrap(function _callee2$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                this._isSending = true;
	                _context3.prev = 1;
	                console.log("start sending", this._amountSent, "<", this._pendingEvents.length);
	                _loop = regeneratorRuntime.mark(function _loop() {
	                  var pendingEvent, _yield$_this$_sendSch, type, content, response;
	                  return regeneratorRuntime.wrap(function _loop$(_context2) {
	                    while (1) {
	                      switch (_context2.prev = _context2.next) {
	                        case 0:
	                          pendingEvent = _this._pendingEvents.get(_this._amountSent);
	                          console.log("trying to send", pendingEvent.content.body);
	                          if (!pendingEvent.remoteId) {
	                            _context2.next = 4;
	                            break;
	                          }
	                          return _context2.abrupt("return", "continue");
	                        case 4:
	                          if (!pendingEvent.needsEncryption) {
	                            _context2.next = 13;
	                            break;
	                          }
	                          _context2.next = 7;
	                          return _this._sendScheduler.request( function () {
	                            var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(hsApi) {
	                              return regeneratorRuntime.wrap(function _callee$(_context) {
	                                while (1) {
	                                  switch (_context.prev = _context.next) {
	                                    case 0:
	                                      _context.next = 2;
	                                      return _this._roomEncryption.encrypt(pendingEvent.eventType, pendingEvent.content, hsApi);
	                                    case 2:
	                                      return _context.abrupt("return", _context.sent);
	                                    case 3:
	                                    case "end":
	                                      return _context.stop();
	                                  }
	                                }
	                              }, _callee);
	                            }));
	                            return function (_x) {
	                              return _ref2.apply(this, arguments);
	                            };
	                          }());
	                        case 7:
	                          _yield$_this$_sendSch = _context2.sent;
	                          type = _yield$_this$_sendSch.type;
	                          content = _yield$_this$_sendSch.content;
	                          pendingEvent.setEncrypted(type, content);
	                          _context2.next = 13;
	                          return _this._tryUpdateEvent(pendingEvent);
	                        case 13:
	                          console.log("really sending now");
	                          _context2.next = 16;
	                          return _this._sendScheduler.request(function (hsApi) {
	                            console.log("got sendScheduler slot");
	                            return hsApi.send(pendingEvent.roomId, pendingEvent.eventType, pendingEvent.txnId, pendingEvent.content).response();
	                          });
	                        case 16:
	                          response = _context2.sent;
	                          pendingEvent.remoteId = response.event_id;
	                          console.log("writing remoteId now");
	                          _context2.next = 21;
	                          return _this._tryUpdateEvent(pendingEvent);
	                        case 21:
	                          console.log("keep sending?", _this._amountSent, "<", _this._pendingEvents.length);
	                          _this._amountSent += 1;
	                        case 23:
	                        case "end":
	                          return _context2.stop();
	                      }
	                    }
	                  }, _loop);
	                });
	              case 4:
	                if (!(this._amountSent < this._pendingEvents.length)) {
	                  _context3.next = 11;
	                  break;
	                }
	                return _context3.delegateYield(_loop(), "t0", 6);
	              case 6:
	                _ret = _context3.t0;
	                if (!(_ret === "continue")) {
	                  _context3.next = 9;
	                  break;
	                }
	                return _context3.abrupt("continue", 4);
	              case 9:
	                _context3.next = 4;
	                break;
	              case 11:
	                _context3.next = 16;
	                break;
	              case 13:
	                _context3.prev = 13;
	                _context3.t1 = _context3["catch"](1);
	                if (_context3.t1 instanceof ConnectionError) {
	                  this._offline = true;
	                }
	              case 16:
	                _context3.prev = 16;
	                this._isSending = false;
	                return _context3.finish(16);
	              case 19:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee2, this, [[1, 13, 16, 19]]);
	      }));
	      function _sendLoop() {
	        return _sendLoop2.apply(this, arguments);
	      }
	      return _sendLoop;
	    }()
	  }, {
	    key: "removeRemoteEchos",
	    value: function removeRemoteEchos(events, txn) {
	      var _this2 = this;
	      var removed = [];
	      var _iterator = _createForOfIteratorHelper(events),
	          _step;
	      try {
	        var _loop2 = function _loop2() {
	          var event = _step.value;
	          var txnId = event.unsigned && event.unsigned.transaction_id;
	          var idx = void 0;
	          if (txnId) {
	            idx = _this2._pendingEvents.array.findIndex(function (pe) {
	              return pe.txnId === txnId;
	            });
	          } else {
	            idx = _this2._pendingEvents.array.findIndex(function (pe) {
	              return pe.remoteId === event.event_id;
	            });
	          }
	          if (idx !== -1) {
	            var pendingEvent = _this2._pendingEvents.get(idx);
	            txn.pendingEvents.remove(pendingEvent.roomId, pendingEvent.queueIndex);
	            removed.push(pendingEvent);
	          }
	        };
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          _loop2();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      return removed;
	    }
	  }, {
	    key: "emitRemovals",
	    value: function emitRemovals(pendingEvents) {
	      var _iterator2 = _createForOfIteratorHelper(pendingEvents),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var pendingEvent = _step2.value;
	          var idx = this._pendingEvents.array.indexOf(pendingEvent);
	          if (idx !== -1) {
	            this._amountSent -= 1;
	            this._pendingEvents.remove(idx);
	          }
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "resumeSending",
	    value: function resumeSending() {
	      this._offline = false;
	      if (!this._isSending) {
	        this._sendLoop();
	      }
	    }
	  }, {
	    key: "enqueueEvent",
	    value: function () {
	      var _enqueueEvent = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(eventType, content) {
	        var pendingEvent;
	        return regeneratorRuntime.wrap(function _callee3$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this._createAndStoreEvent(eventType, content);
	              case 2:
	                pendingEvent = _context4.sent;
	                this._pendingEvents.set(pendingEvent);
	                console.log("added to _pendingEvents set", this._pendingEvents.length);
	                if (!this._isSending && !this._offline) {
	                  this._sendLoop();
	                }
	              case 6:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function enqueueEvent(_x2, _x3) {
	        return _enqueueEvent.apply(this, arguments);
	      }
	      return enqueueEvent;
	    }()
	  }, {
	    key: "_tryUpdateEvent",
	    value: function () {
	      var _tryUpdateEvent2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(pendingEvent) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee4$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return this._storage.readWriteTxn([this._storage.storeNames.pendingEvents]);
	              case 2:
	                txn = _context5.sent;
	                console.log("_tryUpdateEvent: got txn");
	                _context5.prev = 4;
	                console.log("_tryUpdateEvent: before exists");
	                _context5.next = 8;
	                return txn.pendingEvents.exists(pendingEvent.roomId, pendingEvent.queueIndex);
	              case 8:
	                if (!_context5.sent) {
	                  _context5.next = 11;
	                  break;
	                }
	                console.log("_tryUpdateEvent: inside if exists");
	                txn.pendingEvents.update(pendingEvent.data);
	              case 11:
	                console.log("_tryUpdateEvent: after exists");
	                _context5.next = 19;
	                break;
	              case 14:
	                _context5.prev = 14;
	                _context5.t0 = _context5["catch"](4);
	                txn.abort();
	                console.log("_tryUpdateEvent: error", _context5.t0);
	                throw _context5.t0;
	              case 19:
	                console.log("_tryUpdateEvent: try complete");
	                _context5.next = 22;
	                return txn.complete();
	              case 22:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee4, this, [[4, 14]]);
	      }));
	      function _tryUpdateEvent(_x4) {
	        return _tryUpdateEvent2.apply(this, arguments);
	      }
	      return _tryUpdateEvent;
	    }()
	  }, {
	    key: "_createAndStoreEvent",
	    value: function () {
	      var _createAndStoreEvent2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(eventType, content) {
	        var txn, pendingEvent, pendingEventsStore, maxQueueIndex, queueIndex;
	        return regeneratorRuntime.wrap(function _callee5$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                console.log("_createAndStoreEvent");
	                _context6.next = 3;
	                return this._storage.readWriteTxn([this._storage.storeNames.pendingEvents]);
	              case 3:
	                txn = _context6.sent;
	                _context6.prev = 4;
	                pendingEventsStore = txn.pendingEvents;
	                console.log("_createAndStoreEvent getting maxQueueIndex");
	                _context6.next = 9;
	                return pendingEventsStore.getMaxQueueIndex(this._roomId);
	              case 9:
	                _context6.t0 = _context6.sent;
	                if (_context6.t0) {
	                  _context6.next = 12;
	                  break;
	                }
	                _context6.t0 = 0;
	              case 12:
	                maxQueueIndex = _context6.t0;
	                console.log("_createAndStoreEvent got maxQueueIndex", maxQueueIndex);
	                queueIndex = maxQueueIndex + 1;
	                pendingEvent = new PendingEvent({
	                  roomId: this._roomId,
	                  queueIndex: queueIndex,
	                  eventType: eventType,
	                  content: content,
	                  txnId: makeTxnId(),
	                  needsEncryption: !!this._roomEncryption
	                });
	                console.log("_createAndStoreEvent: adding to pendingEventsStore");
	                pendingEventsStore.add(pendingEvent.data);
	                _context6.next = 24;
	                break;
	              case 20:
	                _context6.prev = 20;
	                _context6.t1 = _context6["catch"](4);
	                txn.abort();
	                throw _context6.t1;
	              case 24:
	                _context6.next = 26;
	                return txn.complete();
	              case 26:
	                return _context6.abrupt("return", pendingEvent);
	              case 27:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee5, this, [[4, 20]]);
	      }));
	      function _createAndStoreEvent(_x5, _x6) {
	        return _createAndStoreEvent2.apply(this, arguments);
	      }
	      return _createAndStoreEvent;
	    }()
	  }, {
	    key: "pendingEvents",
	    get: function get() {
	      return this._pendingEvents;
	    }
	  }]);
	  return SendQueue;
	}();

	function loadMembers(_x) {
	  return _loadMembers.apply(this, arguments);
	}
	function _loadMembers() {
	  _loadMembers = _asyncToGenerator( regeneratorRuntime.mark(function _callee(_ref) {
	    var roomId, storage, txn, memberDatas;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            roomId = _ref.roomId, storage = _ref.storage;
	            _context.next = 3;
	            return storage.readTxn([storage.storeNames.roomMembers]);
	          case 3:
	            txn = _context.sent;
	            _context.next = 6;
	            return txn.roomMembers.getAll(roomId);
	          case 6:
	            memberDatas = _context.sent;
	            return _context.abrupt("return", memberDatas.map(function (d) {
	              return new RoomMember(d);
	            }));
	          case 8:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _loadMembers.apply(this, arguments);
	}
	function fetchMembers(_x2) {
	  return _fetchMembers.apply(this, arguments);
	}
	function _fetchMembers() {
	  _fetchMembers = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(_ref2) {
	    var summary, syncToken, roomId, hsApi, storage, setChangedMembersMap, changedMembersDuringSync, memberResponse, txn, summaryChanges, members, roomMembers, memberEvents;
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            summary = _ref2.summary, syncToken = _ref2.syncToken, roomId = _ref2.roomId, hsApi = _ref2.hsApi, storage = _ref2.storage, setChangedMembersMap = _ref2.setChangedMembersMap;
	            changedMembersDuringSync = new Map();
	            setChangedMembersMap(changedMembersDuringSync);
	            _context3.next = 5;
	            return hsApi.members(roomId, {
	              at: syncToken
	            }).response();
	          case 5:
	            memberResponse = _context3.sent;
	            _context3.next = 8;
	            return storage.readWriteTxn([storage.storeNames.roomSummary, storage.storeNames.roomMembers]);
	          case 8:
	            txn = _context3.sent;
	            _context3.prev = 9;
	            summaryChanges = summary.writeHasFetchedMembers(true, txn);
	            roomMembers = txn.roomMembers;
	            memberEvents = memberResponse.chunk;
	            if (Array.isArray(memberEvents)) {
	              _context3.next = 15;
	              break;
	            }
	            throw new Error("malformed");
	          case 15:
	            _context3.next = 17;
	            return Promise.all(memberEvents.map( function () {
	              var _ref3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(memberEvent) {
	                var userId, changedMember, member;
	                return regeneratorRuntime.wrap(function _callee2$(_context2) {
	                  while (1) {
	                    switch (_context2.prev = _context2.next) {
	                      case 0:
	                        userId = memberEvent === null || memberEvent === void 0 ? void 0 : memberEvent.state_key;
	                        if (userId) {
	                          _context2.next = 3;
	                          break;
	                        }
	                        throw new Error("malformed");
	                      case 3:
	                        changedMember = changedMembersDuringSync.get(userId);
	                        if (!changedMember) {
	                          _context2.next = 8;
	                          break;
	                        }
	                        return _context2.abrupt("return", changedMember);
	                      case 8:
	                        member = RoomMember.fromMemberEvent(roomId, memberEvent);
	                        if (member) {
	                          roomMembers.set(member.serialize());
	                        }
	                        return _context2.abrupt("return", member);
	                      case 11:
	                      case "end":
	                        return _context2.stop();
	                    }
	                  }
	                }, _callee2);
	              }));
	              return function (_x4) {
	                return _ref3.apply(this, arguments);
	              };
	            }()));
	          case 17:
	            members = _context3.sent;
	            _context3.next = 24;
	            break;
	          case 20:
	            _context3.prev = 20;
	            _context3.t0 = _context3["catch"](9);
	            txn.abort();
	            throw _context3.t0;
	          case 24:
	            _context3.prev = 24;
	            setChangedMembersMap(null);
	            return _context3.finish(24);
	          case 27:
	            _context3.next = 29;
	            return txn.complete();
	          case 29:
	            summary.applyChanges(summaryChanges);
	            return _context3.abrupt("return", members);
	          case 31:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3, null, [[9, 20, 24, 27]]);
	  }));
	  return _fetchMembers.apply(this, arguments);
	}
	function fetchOrLoadMembers(_x3) {
	  return _fetchOrLoadMembers.apply(this, arguments);
	}
	function _fetchOrLoadMembers() {
	  _fetchOrLoadMembers = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(options) {
	    var summary;
	    return regeneratorRuntime.wrap(function _callee4$(_context4) {
	      while (1) {
	        switch (_context4.prev = _context4.next) {
	          case 0:
	            summary = options.summary;
	            if (summary.hasFetchedMembers) {
	              _context4.next = 5;
	              break;
	            }
	            return _context4.abrupt("return", fetchMembers(options));
	          case 5:
	            return _context4.abrupt("return", loadMembers(options));
	          case 6:
	          case "end":
	            return _context4.stop();
	        }
	      }
	    }, _callee4);
	  }));
	  return _fetchOrLoadMembers.apply(this, arguments);
	}

	var MemberList = function () {
	  function MemberList(_ref) {
	    var members = _ref.members,
	        closeCallback = _ref.closeCallback;
	    _classCallCheck(this, MemberList);
	    this._members = new ObservableMap();
	    var _iterator = _createForOfIteratorHelper(members),
	        _step;
	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var member = _step.value;
	        this._members.add(member.userId, member);
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	    this._closeCallback = closeCallback;
	    this._retentionCount = 1;
	  }
	  _createClass(MemberList, [{
	    key: "afterSync",
	    value: function afterSync(memberChanges) {
	      var _iterator2 = _createForOfIteratorHelper(memberChanges.entries()),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var _step2$value = _slicedToArray(_step2.value, 2),
	              userId = _step2$value[0],
	              memberChange = _step2$value[1];
	          this._members.add(userId, memberChange.member);
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "retain",
	    value: function retain() {
	      this._retentionCount += 1;
	    }
	  }, {
	    key: "release",
	    value: function release() {
	      this._retentionCount -= 1;
	      if (this._retentionCount === 0) {
	        this._closeCallback();
	      }
	    }
	  }, {
	    key: "members",
	    get: function get() {
	      return this._members;
	    }
	  }]);
	  return MemberList;
	}();

	function calculateRoomName(sortedMembers, summary) {
	  var countWithoutMe = summary.joinCount + summary.inviteCount - 1;
	  if (sortedMembers.length >= countWithoutMe) {
	    if (sortedMembers.length > 1) {
	      var lastMember = sortedMembers[sortedMembers.length - 1];
	      var firstMembers = sortedMembers.slice(0, sortedMembers.length - 1);
	      return firstMembers.map(function (m) {
	        return m.name;
	      }).join(", ") + " and " + lastMember.name;
	    } else {
	      return sortedMembers[0].name;
	    }
	  } else if (sortedMembers.length < countWithoutMe) {
	    return sortedMembers.map(function (m) {
	      return m.name;
	    }).join(", ") + " and ".concat(countWithoutMe, " others");
	  } else {
	    return null;
	  }
	}
	var Heroes = function () {
	  function Heroes(roomId) {
	    _classCallCheck(this, Heroes);
	    this._roomId = roomId;
	    this._members = new Map();
	  }
	  _createClass(Heroes, [{
	    key: "calculateChanges",
	    value: function () {
	      var _calculateChanges = _asyncToGenerator( regeneratorRuntime.mark(function _callee(newHeroes, memberChanges, txn) {
	        var updatedHeroMembers, removedUserIds, _iterator, _step, existingUserId, _iterator2, _step2, _step2$value, userId, memberChange, _iterator3, _step3, _userId, memberData, member;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                updatedHeroMembers = new Map();
	                removedUserIds = [];
	                _iterator = _createForOfIteratorHelper(this._members.keys());
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    existingUserId = _step.value;
	                    if (newHeroes.indexOf(existingUserId) === -1) {
	                      removedUserIds.push(existingUserId);
	                    }
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	                _iterator2 = _createForOfIteratorHelper(memberChanges.entries());
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    _step2$value = _slicedToArray(_step2.value, 2), userId = _step2$value[0], memberChange = _step2$value[1];
	                    if (this._members.has(userId) || newHeroes.indexOf(userId) !== -1) {
	                      updatedHeroMembers.set(userId, memberChange.member);
	                    }
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	                _iterator3 = _createForOfIteratorHelper(newHeroes);
	                _context.prev = 7;
	                _iterator3.s();
	              case 9:
	                if ((_step3 = _iterator3.n()).done) {
	                  _context.next = 18;
	                  break;
	                }
	                _userId = _step3.value;
	                if (!(!this._members.has(_userId) && !updatedHeroMembers.has(_userId))) {
	                  _context.next = 16;
	                  break;
	                }
	                _context.next = 14;
	                return txn.roomMembers.get(this._roomId, _userId);
	              case 14:
	                memberData = _context.sent;
	                if (memberData) {
	                  member = new RoomMember(memberData);
	                  updatedHeroMembers.set(member.userId, member);
	                }
	              case 16:
	                _context.next = 9;
	                break;
	              case 18:
	                _context.next = 23;
	                break;
	              case 20:
	                _context.prev = 20;
	                _context.t0 = _context["catch"](7);
	                _iterator3.e(_context.t0);
	              case 23:
	                _context.prev = 23;
	                _iterator3.f();
	                return _context.finish(23);
	              case 26:
	                return _context.abrupt("return", {
	                  updatedHeroMembers: updatedHeroMembers.values(),
	                  removedUserIds: removedUserIds
	                });
	              case 27:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[7, 20, 23, 26]]);
	      }));
	      function calculateChanges(_x, _x2, _x3) {
	        return _calculateChanges.apply(this, arguments);
	      }
	      return calculateChanges;
	    }()
	  }, {
	    key: "applyChanges",
	    value: function applyChanges(_ref, summary) {
	      var updatedHeroMembers = _ref.updatedHeroMembers,
	          removedUserIds = _ref.removedUserIds;
	      var _iterator4 = _createForOfIteratorHelper(removedUserIds),
	          _step4;
	      try {
	        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	          var userId = _step4.value;
	          this._members.delete(userId);
	        }
	      } catch (err) {
	        _iterator4.e(err);
	      } finally {
	        _iterator4.f();
	      }
	      var _iterator5 = _createForOfIteratorHelper(updatedHeroMembers),
	          _step5;
	      try {
	        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	          var member = _step5.value;
	          this._members.set(member.userId, member);
	        }
	      } catch (err) {
	        _iterator5.e(err);
	      } finally {
	        _iterator5.f();
	      }
	      var sortedMembers = Array.from(this._members.values()).sort(function (a, b) {
	        return a.name.localeCompare(b.name);
	      });
	      this._roomName = calculateRoomName(sortedMembers, summary);
	    }
	  }, {
	    key: "roomName",
	    get: function get() {
	      return this._roomName;
	    }
	  }, {
	    key: "roomAvatarUrl",
	    get: function get() {
	      if (this._members.size === 1) {
	        var _iterator6 = _createForOfIteratorHelper(this._members.values()),
	            _step6;
	        try {
	          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
	            var member = _step6.value;
	            return member.avatarUrl;
	          }
	        } catch (err) {
	          _iterator6.e(err);
	        } finally {
	          _iterator6.f();
	        }
	      }
	      return null;
	    }
	  }]);
	  return Heroes;
	}();

	var EVENT_ENCRYPTED_TYPE = "m.room.encrypted";
	var Room = function (_EventEmitter) {
	  _inherits(Room, _EventEmitter);
	  var _super = _createSuper(Room);
	  function Room(_ref) {
	    var _this;
	    var roomId = _ref.roomId,
	        storage = _ref.storage,
	        hsApi = _ref.hsApi,
	        emitCollectionChange = _ref.emitCollectionChange,
	        sendScheduler = _ref.sendScheduler,
	        pendingEvents = _ref.pendingEvents,
	        user = _ref.user,
	        createRoomEncryption = _ref.createRoomEncryption,
	        getSyncToken = _ref.getSyncToken;
	    _classCallCheck(this, Room);
	    _this = _super.call(this);
	    _this._roomId = roomId;
	    _this._storage = storage;
	    _this._hsApi = hsApi;
	    _this._summary = new RoomSummary(roomId, user.id);
	    _this._fragmentIdComparer = new FragmentIdComparer([]);
	    _this._syncWriter = new SyncWriter({
	      roomId: roomId,
	      fragmentIdComparer: _this._fragmentIdComparer
	    });
	    _this._emitCollectionChange = emitCollectionChange;
	    _this._sendQueue = new SendQueue({
	      roomId: roomId,
	      storage: storage,
	      sendScheduler: sendScheduler,
	      pendingEvents: pendingEvents
	    });
	    _this._timeline = null;
	    _this._user = user;
	    _this._changedMembersDuringSync = null;
	    _this._memberList = null;
	    _this._createRoomEncryption = createRoomEncryption;
	    _this._roomEncryption = null;
	    _this._getSyncToken = getSyncToken;
	    return _this;
	  }
	  _createClass(Room, [{
	    key: "notifyRoomKeys",
	    value: function () {
	      var _notifyRoomKeys = _asyncToGenerator( regeneratorRuntime.mark(function _callee(roomKeys) {
	        var retryEventIds, retryEntries, txn, _iterator, _step, eventId, storageEntry, decryptRequest;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!this._roomEncryption) {
	                  _context.next = 30;
	                  break;
	                }
	                retryEventIds = this._roomEncryption.applyRoomKeys(roomKeys);
	                if (!retryEventIds.length) {
	                  _context.next = 30;
	                  break;
	                }
	                retryEntries = [];
	                _context.next = 6;
	                return this._storage.readTxn([this._storage.storeNames.timelineEvents, this._storage.storeNames.inboundGroupSessions]);
	              case 6:
	                txn = _context.sent;
	                _iterator = _createForOfIteratorHelper(retryEventIds);
	                _context.prev = 8;
	                _iterator.s();
	              case 10:
	                if ((_step = _iterator.n()).done) {
	                  _context.next = 18;
	                  break;
	                }
	                eventId = _step.value;
	                _context.next = 14;
	                return txn.timelineEvents.getByEventId(this._roomId, eventId);
	              case 14:
	                storageEntry = _context.sent;
	                if (storageEntry) {
	                  retryEntries.push(new EventEntry(storageEntry, this._fragmentIdComparer));
	                }
	              case 16:
	                _context.next = 10;
	                break;
	              case 18:
	                _context.next = 23;
	                break;
	              case 20:
	                _context.prev = 20;
	                _context.t0 = _context["catch"](8);
	                _iterator.e(_context.t0);
	              case 23:
	                _context.prev = 23;
	                _iterator.f();
	                return _context.finish(23);
	              case 26:
	                decryptRequest = this._decryptEntries(DecryptionSource.Retry, retryEntries, txn);
	                _context.next = 29;
	                return decryptRequest.complete();
	              case 29:
	                if (this._timeline) {
	                  this._timeline.replaceEntries(retryEntries);
	                }
	              case 30:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[8, 20, 23, 26]]);
	      }));
	      function notifyRoomKeys(_x) {
	        return _notifyRoomKeys.apply(this, arguments);
	      }
	      return notifyRoomKeys;
	    }()
	  }, {
	    key: "_enableEncryption",
	    value: function _enableEncryption(encryptionParams) {
	      this._roomEncryption = this._createRoomEncryption(this, encryptionParams);
	      if (this._roomEncryption) {
	        this._sendQueue.enableEncryption(this._roomEncryption);
	        if (this._timeline) {
	          this._timeline.enableEncryption(this._decryptEntries.bind(this, DecryptionSource.Timeline));
	        }
	      }
	    }
	  }, {
	    key: "_decryptEntries",
	    value: function _decryptEntries(source, entries) {
	      var _this2 = this;
	      var inboundSessionTxn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	      var request = new DecryptionRequest( function () {
	        var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(r) {
	          var events, isTimelineOpen, changes, stores, writeTxn, decryption;
	          return regeneratorRuntime.wrap(function _callee2$(_context2) {
	            while (1) {
	              switch (_context2.prev = _context2.next) {
	                case 0:
	                  if (inboundSessionTxn) {
	                    _context2.next = 4;
	                    break;
	                  }
	                  _context2.next = 3;
	                  return _this2._storage.readTxn([_this2._storage.storeNames.inboundGroupSessions]);
	                case 3:
	                  inboundSessionTxn = _context2.sent;
	                case 4:
	                  if (!r.cancelled) {
	                    _context2.next = 6;
	                    break;
	                  }
	                  return _context2.abrupt("return");
	                case 6:
	                  events = entries.filter(function (entry) {
	                    return entry.eventType === EVENT_ENCRYPTED_TYPE;
	                  }).map(function (entry) {
	                    return entry.event;
	                  });
	                  isTimelineOpen = _this2._isTimelineOpen;
	                  _context2.next = 10;
	                  return _this2._roomEncryption.prepareDecryptAll(events, source, isTimelineOpen, inboundSessionTxn);
	                case 10:
	                  r.preparation = _context2.sent;
	                  if (!r.cancelled) {
	                    _context2.next = 13;
	                    break;
	                  }
	                  return _context2.abrupt("return");
	                case 13:
	                  _context2.next = 15;
	                  return r.preparation.decrypt();
	                case 15:
	                  changes = _context2.sent;
	                  r.preparation = null;
	                  if (!r.cancelled) {
	                    _context2.next = 19;
	                    break;
	                  }
	                  return _context2.abrupt("return");
	                case 19:
	                  stores = [_this2._storage.storeNames.groupSessionDecryptions];
	                  if (isTimelineOpen) {
	                    stores.push(_this2._storage.storeNames.deviceIdentities);
	                  }
	                  _context2.next = 23;
	                  return _this2._storage.readWriteTxn(stores);
	                case 23:
	                  writeTxn = _context2.sent;
	                  _context2.prev = 24;
	                  _context2.next = 27;
	                  return changes.write(writeTxn);
	                case 27:
	                  decryption = _context2.sent;
	                  _context2.next = 34;
	                  break;
	                case 30:
	                  _context2.prev = 30;
	                  _context2.t0 = _context2["catch"](24);
	                  writeTxn.abort();
	                  throw _context2.t0;
	                case 34:
	                  _context2.next = 36;
	                  return writeTxn.complete();
	                case 36:
	                  decryption.applyToEntries(entries);
	                case 37:
	                case "end":
	                  return _context2.stop();
	              }
	            }
	          }, _callee2, null, [[24, 30]]);
	        }));
	        return function (_x2) {
	          return _ref2.apply(this, arguments);
	        };
	      }());
	      return request;
	    }
	  }, {
	    key: "prepareSync",
	    value: function () {
	      var _prepareSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomResponse, txn) {
	        var _roomResponse$timelin, events, eventsToDecrypt, preparation;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (!this._roomEncryption) {
	                  _context3.next = 8;
	                  break;
	                }
	                events = roomResponse === null || roomResponse === void 0 ? void 0 : (_roomResponse$timelin = roomResponse.timeline) === null || _roomResponse$timelin === void 0 ? void 0 : _roomResponse$timelin.events;
	                if (!Array.isArray(events)) {
	                  _context3.next = 8;
	                  break;
	                }
	                eventsToDecrypt = events.filter(function (event) {
	                  return (event === null || event === void 0 ? void 0 : event.type) === EVENT_ENCRYPTED_TYPE;
	                });
	                _context3.next = 6;
	                return this._roomEncryption.prepareDecryptAll(eventsToDecrypt, DecryptionSource.Sync, this._isTimelineOpen, txn);
	              case 6:
	                preparation = _context3.sent;
	                return _context3.abrupt("return", preparation);
	              case 8:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function prepareSync(_x3, _x4) {
	        return _prepareSync.apply(this, arguments);
	      }
	      return prepareSync;
	    }()
	  }, {
	    key: "afterPrepareSync",
	    value: function () {
	      var _afterPrepareSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(preparation) {
	        var decryptChanges;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                if (!preparation) {
	                  _context4.next = 5;
	                  break;
	                }
	                _context4.next = 3;
	                return preparation.decrypt();
	              case 3:
	                decryptChanges = _context4.sent;
	                return _context4.abrupt("return", decryptChanges);
	              case 5:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4);
	      }));
	      function afterPrepareSync(_x5) {
	        return _afterPrepareSync.apply(this, arguments);
	      }
	      return afterPrepareSync;
	    }()
	  }, {
	    key: "writeSync",
	    value: function () {
	      var _writeSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(roomResponse, membership, isInitialSync, decryptChanges, txn) {
	        var decryption, _yield$this$_syncWrit, entries, newLiveKey, memberChanges, summaryChanges, heroChanges, removedPendingEvents;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!(this._roomEncryption && decryptChanges)) {
	                  _context5.next = 4;
	                  break;
	                }
	                _context5.next = 3;
	                return decryptChanges.write(txn);
	              case 3:
	                decryption = _context5.sent;
	              case 4:
	                _context5.next = 6;
	                return this._syncWriter.writeSync(roomResponse, this.isTrackingMembers, txn);
	              case 6:
	                _yield$this$_syncWrit = _context5.sent;
	                entries = _yield$this$_syncWrit.entries;
	                newLiveKey = _yield$this$_syncWrit.newLiveKey;
	                memberChanges = _yield$this$_syncWrit.memberChanges;
	                if (decryption) {
	                  decryption.applyToEntries(entries);
	                }
	                if (!(this._roomEncryption && this.isTrackingMembers && (memberChanges === null || memberChanges === void 0 ? void 0 : memberChanges.size))) {
	                  _context5.next = 14;
	                  break;
	                }
	                _context5.next = 14;
	                return this._roomEncryption.writeMemberChanges(memberChanges, txn);
	              case 14:
	                summaryChanges = this._summary.writeSync(roomResponse, membership, isInitialSync, this._isTimelineOpen, txn);
	                if (!needsHeroes(summaryChanges)) {
	                  _context5.next = 20;
	                  break;
	                }
	                if (!this._heroes) {
	                  this._heroes = new Heroes(this._roomId);
	                }
	                _context5.next = 19;
	                return this._heroes.calculateChanges(summaryChanges.heroes, memberChanges, txn);
	              case 19:
	                heroChanges = _context5.sent;
	              case 20:
	                if (roomResponse.timeline && roomResponse.timeline.events) {
	                  removedPendingEvents = this._sendQueue.removeRemoteEchos(roomResponse.timeline.events, txn);
	                }
	                return _context5.abrupt("return", {
	                  summaryChanges: summaryChanges,
	                  newTimelineEntries: entries,
	                  newLiveKey: newLiveKey,
	                  removedPendingEvents: removedPendingEvents,
	                  memberChanges: memberChanges,
	                  heroChanges: heroChanges
	                });
	              case 22:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function writeSync(_x6, _x7, _x8, _x9, _x10) {
	        return _writeSync.apply(this, arguments);
	      }
	      return writeSync;
	    }()
	  }, {
	    key: "afterSync",
	    value: function afterSync(_ref3) {
	      var summaryChanges = _ref3.summaryChanges,
	          newTimelineEntries = _ref3.newTimelineEntries,
	          newLiveKey = _ref3.newLiveKey,
	          removedPendingEvents = _ref3.removedPendingEvents,
	          memberChanges = _ref3.memberChanges,
	          heroChanges = _ref3.heroChanges;
	      this._syncWriter.afterSync(newLiveKey);
	      if (!this._summary.encryption && summaryChanges.encryption && !this._roomEncryption) {
	        this._enableEncryption(summaryChanges.encryption);
	      }
	      if (memberChanges.size) {
	        if (this._changedMembersDuringSync) {
	          var _iterator2 = _createForOfIteratorHelper(memberChanges.entries()),
	              _step2;
	          try {
	            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	              var _step2$value = _slicedToArray(_step2.value, 2),
	                  userId = _step2$value[0],
	                  memberChange = _step2$value[1];
	              this._changedMembersDuringSync.set(userId, memberChange.member);
	            }
	          } catch (err) {
	            _iterator2.e(err);
	          } finally {
	            _iterator2.f();
	          }
	        }
	        if (this._memberList) {
	          this._memberList.afterSync(memberChanges);
	        }
	      }
	      var emitChange = false;
	      if (summaryChanges) {
	        this._summary.applyChanges(summaryChanges);
	        if (!this._summary.needsHeroes) {
	          this._heroes = null;
	        }
	        emitChange = true;
	      }
	      if (this._heroes && heroChanges) {
	        var oldName = this.name;
	        this._heroes.applyChanges(heroChanges, this._summary);
	        if (oldName !== this.name) {
	          emitChange = true;
	        }
	      }
	      if (emitChange) {
	        this.emit("change");
	        this._emitCollectionChange(this);
	      }
	      if (this._timeline) {
	        this._timeline.appendLiveEntries(newTimelineEntries);
	      }
	      if (removedPendingEvents) {
	        this._sendQueue.emitRemovals(removedPendingEvents);
	      }
	    }
	  }, {
	    key: "needsAfterSyncCompleted",
	    value: function needsAfterSyncCompleted(_ref4) {
	      var _this$_roomEncryption;
	      var memberChanges = _ref4.memberChanges;
	      return (_this$_roomEncryption = this._roomEncryption) === null || _this$_roomEncryption === void 0 ? void 0 : _this$_roomEncryption.needsToShareKeys(memberChanges);
	    }
	  }, {
	    key: "afterSyncCompleted",
	    value: function () {
	      var _afterSyncCompleted = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(_ref5) {
	        var memberChanges;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                memberChanges = _ref5.memberChanges;
	                if (!this._roomEncryption) {
	                  _context6.next = 4;
	                  break;
	                }
	                _context6.next = 4;
	                return this._roomEncryption.shareRoomKeyForMemberChanges(memberChanges, this._hsApi);
	              case 4:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function afterSyncCompleted(_x11) {
	        return _afterSyncCompleted.apply(this, arguments);
	      }
	      return afterSyncCompleted;
	    }()
	  }, {
	    key: "start",
	    value: function () {
	      var _start = _asyncToGenerator( regeneratorRuntime.mark(function _callee7() {
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                if (!this._roomEncryption) {
	                  _context7.next = 9;
	                  break;
	                }
	                _context7.prev = 1;
	                _context7.next = 4;
	                return this._roomEncryption.shareRoomKeyToPendingMembers(this._hsApi);
	              case 4:
	                _context7.next = 9;
	                break;
	              case 6:
	                _context7.prev = 6;
	                _context7.t0 = _context7["catch"](1);
	                console.error("could not send out pending room keys for room ".concat(this.id), _context7.t0.stack);
	              case 9:
	                this._sendQueue.resumeSending();
	              case 10:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this, [[1, 6]]);
	      }));
	      function start() {
	        return _start.apply(this, arguments);
	      }
	      return start;
	    }()
	  }, {
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(summary, txn) {
	        var changes;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                _context8.prev = 0;
	                this._summary.load(summary);
	                if (this._summary.encryption) {
	                  this._enableEncryption(this._summary.encryption);
	                }
	                if (!this._summary.needsHeroes) {
	                  _context8.next = 9;
	                  break;
	                }
	                this._heroes = new Heroes(this._roomId);
	                _context8.next = 7;
	                return this._heroes.calculateChanges(this._summary.heroes, [], txn);
	              case 7:
	                changes = _context8.sent;
	                this._heroes.applyChanges(changes, this._summary);
	              case 9:
	                return _context8.abrupt("return", this._syncWriter.load(txn));
	              case 12:
	                _context8.prev = 12;
	                _context8.t0 = _context8["catch"](0);
	                throw new WrappedError("Could not load room ".concat(this._roomId), _context8.t0);
	              case 15:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this, [[0, 12]]);
	      }));
	      function load(_x12, _x13) {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "sendEvent",
	    value: function sendEvent(eventType, content) {
	      return this._sendQueue.enqueueEvent(eventType, content);
	    }
	  }, {
	    key: "loadMemberList",
	    value: function () {
	      var _loadMemberList = _asyncToGenerator( regeneratorRuntime.mark(function _callee9() {
	        var _this3 = this;
	        var members;
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                if (!this._memberList) {
	                  _context9.next = 5;
	                  break;
	                }
	                this._memberList.retain();
	                return _context9.abrupt("return", this._memberList);
	              case 5:
	                _context9.next = 7;
	                return fetchOrLoadMembers({
	                  summary: this._summary,
	                  roomId: this._roomId,
	                  hsApi: this._hsApi,
	                  storage: this._storage,
	                  syncToken: this._getSyncToken(),
	                  setChangedMembersMap: function setChangedMembersMap(map) {
	                    return _this3._changedMembersDuringSync = map;
	                  }
	                });
	              case 7:
	                members = _context9.sent;
	                this._memberList = new MemberList({
	                  members: members,
	                  closeCallback: function closeCallback() {
	                    _this3._memberList = null;
	                  }
	                });
	                return _context9.abrupt("return", this._memberList);
	              case 10:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this);
	      }));
	      function loadMemberList() {
	        return _loadMemberList.apply(this, arguments);
	      }
	      return loadMemberList;
	    }()
	  }, {
	    key: "fillGap",
	    value: function () {
	      var _fillGap = _asyncToGenerator( regeneratorRuntime.mark(function _callee10(fragmentEntry, amount) {
	        var response, txn, removedPendingEvents, gapResult, gapWriter, decryptRequest, _iterator3, _step3, fragment;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                if (!fragmentEntry.edgeReached) {
	                  _context10.next = 2;
	                  break;
	                }
	                return _context10.abrupt("return");
	              case 2:
	                _context10.next = 4;
	                return this._hsApi.messages(this._roomId, {
	                  from: fragmentEntry.token,
	                  dir: fragmentEntry.direction.asApiString(),
	                  limit: amount,
	                  filter: {
	                    lazy_load_members: true,
	                    include_redundant_members: true
	                  }
	                }).response();
	              case 4:
	                response = _context10.sent;
	                _context10.next = 7;
	                return this._storage.readWriteTxn([this._storage.storeNames.pendingEvents, this._storage.storeNames.timelineEvents, this._storage.storeNames.timelineFragments]);
	              case 7:
	                txn = _context10.sent;
	                _context10.prev = 8;
	                removedPendingEvents = this._sendQueue.removeRemoteEchos(response.chunk, txn);
	                gapWriter = new GapWriter({
	                  roomId: this._roomId,
	                  storage: this._storage,
	                  fragmentIdComparer: this._fragmentIdComparer
	                });
	                _context10.next = 13;
	                return gapWriter.writeFragmentFill(fragmentEntry, response, txn);
	              case 13:
	                gapResult = _context10.sent;
	                _context10.next = 20;
	                break;
	              case 16:
	                _context10.prev = 16;
	                _context10.t0 = _context10["catch"](8);
	                txn.abort();
	                throw _context10.t0;
	              case 20:
	                _context10.next = 22;
	                return txn.complete();
	              case 22:
	                if (!this._roomEncryption) {
	                  _context10.next = 26;
	                  break;
	                }
	                decryptRequest = this._decryptEntries(DecryptionSource.Timeline, gapResult.entries);
	                _context10.next = 26;
	                return decryptRequest.complete();
	              case 26:
	                _iterator3 = _createForOfIteratorHelper(gapResult.fragments);
	                try {
	                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	                    fragment = _step3.value;
	                    this._fragmentIdComparer.add(fragment);
	                  }
	                } catch (err) {
	                  _iterator3.e(err);
	                } finally {
	                  _iterator3.f();
	                }
	                if (removedPendingEvents) {
	                  this._sendQueue.emitRemovals(removedPendingEvents);
	                }
	                if (this._timeline) {
	                  this._timeline.addGapEntries(gapResult.entries);
	                }
	              case 30:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this, [[8, 16]]);
	      }));
	      function fillGap(_x14, _x15) {
	        return _fillGap.apply(this, arguments);
	      }
	      return fillGap;
	    }()
	  }, {
	    key: "_getLastEventId",
	    value: function () {
	      var _getLastEventId2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee11() {
	        var lastKey, _eventEntry$event, txn, eventEntry;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                lastKey = this._syncWriter.lastMessageKey;
	                if (!lastKey) {
	                  _context11.next = 9;
	                  break;
	                }
	                _context11.next = 4;
	                return this._storage.readTxn([this._storage.storeNames.timelineEvents]);
	              case 4:
	                txn = _context11.sent;
	                _context11.next = 7;
	                return txn.timelineEvents.get(this._roomId, lastKey);
	              case 7:
	                eventEntry = _context11.sent;
	                return _context11.abrupt("return", eventEntry === null || eventEntry === void 0 ? void 0 : (_eventEntry$event = eventEntry.event) === null || _eventEntry$event === void 0 ? void 0 : _eventEntry$event.event_id);
	              case 9:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));
	      function _getLastEventId() {
	        return _getLastEventId2.apply(this, arguments);
	      }
	      return _getLastEventId;
	    }()
	  }, {
	    key: "clearUnread",
	    value: function () {
	      var _clearUnread = _asyncToGenerator( regeneratorRuntime.mark(function _callee12() {
	        var txn, data, lastEventId;
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                if (!(this.isUnread || this.notificationCount)) {
	                  _context12.next = 30;
	                  break;
	                }
	                _context12.next = 3;
	                return this._storage.readWriteTxn([this._storage.storeNames.roomSummary]);
	              case 3:
	                txn = _context12.sent;
	                _context12.prev = 4;
	                data = this._summary.writeClearUnread(txn);
	                _context12.next = 12;
	                break;
	              case 8:
	                _context12.prev = 8;
	                _context12.t0 = _context12["catch"](4);
	                txn.abort();
	                throw _context12.t0;
	              case 12:
	                _context12.next = 14;
	                return txn.complete();
	              case 14:
	                this._summary.applyChanges(data);
	                this.emit("change");
	                this._emitCollectionChange(this);
	                _context12.prev = 17;
	                _context12.next = 20;
	                return this._getLastEventId();
	              case 20:
	                lastEventId = _context12.sent;
	                if (!lastEventId) {
	                  _context12.next = 24;
	                  break;
	                }
	                _context12.next = 24;
	                return this._hsApi.receipt(this._roomId, "m.read", lastEventId);
	              case 24:
	                _context12.next = 30;
	                break;
	              case 26:
	                _context12.prev = 26;
	                _context12.t1 = _context12["catch"](17);
	                if (!(_context12.t1.name !== "ConnectionError")) {
	                  _context12.next = 30;
	                  break;
	                }
	                throw _context12.t1;
	              case 30:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12, this, [[4, 8], [17, 26]]);
	      }));
	      function clearUnread() {
	        return _clearUnread.apply(this, arguments);
	      }
	      return clearUnread;
	    }()
	  }, {
	    key: "openTimeline",
	    value: function openTimeline() {
	      var _this4 = this;
	      if (this._timeline) {
	        throw new Error("not dealing with load race here for now");
	      }
	      console.log("opening the timeline for ".concat(this._roomId));
	      this._timeline = new Timeline({
	        roomId: this.id,
	        storage: this._storage,
	        fragmentIdComparer: this._fragmentIdComparer,
	        pendingEvents: this._sendQueue.pendingEvents,
	        closeCallback: function closeCallback() {
	          console.log("closing the timeline for ".concat(_this4._roomId));
	          _this4._timeline = null;
	          if (_this4._roomEncryption) {
	            _this4._roomEncryption.notifyTimelineClosed();
	          }
	        },
	        user: this._user
	      });
	      if (this._roomEncryption) {
	        this._timeline.enableEncryption(this._decryptEntries.bind(this, DecryptionSource.Timeline));
	      }
	      return this._timeline;
	    }
	  }, {
	    key: "writeIsTrackingMembers",
	    value: function writeIsTrackingMembers(value, txn) {
	      return this._summary.writeIsTrackingMembers(value, txn);
	    }
	  }, {
	    key: "applyIsTrackingMembersChanges",
	    value: function applyIsTrackingMembersChanges(changes) {
	      this._summary.applyChanges(changes);
	    }
	  }, {
	    key: "needsPrepareSync",
	    get: function get() {
	      return !!this._roomEncryption;
	    }
	  }, {
	    key: "name",
	    get: function get() {
	      if (this._heroes) {
	        return this._heroes.roomName;
	      }
	      return this._summary.name;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._roomId;
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      if (this._summary.avatarUrl) {
	        return this._summary.avatarUrl;
	      } else if (this._heroes) {
	        return this._heroes.roomAvatarUrl;
	      }
	      return null;
	    }
	  }, {
	    key: "lastMessageTimestamp",
	    get: function get() {
	      return this._summary.lastMessageTimestamp;
	    }
	  }, {
	    key: "isUnread",
	    get: function get() {
	      return this._summary.isUnread;
	    }
	  }, {
	    key: "notificationCount",
	    get: function get() {
	      return this._summary.notificationCount;
	    }
	  }, {
	    key: "highlightCount",
	    get: function get() {
	      return this._summary.highlightCount;
	    }
	  }, {
	    key: "isLowPriority",
	    get: function get() {
	      var tags = this._summary.tags;
	      return !!(tags && tags['m.lowpriority']);
	    }
	  }, {
	    key: "isEncrypted",
	    get: function get() {
	      return !!this._summary.encryption;
	    }
	  }, {
	    key: "isTrackingMembers",
	    get: function get() {
	      return this._summary.isTrackingMembers;
	    }
	  }, {
	    key: "_isTimelineOpen",
	    get: function get() {
	      return !!this._timeline;
	    }
	  }, {
	    key: "mediaRepository",
	    get: function get() {
	      return this._hsApi.mediaRepository;
	    }
	  }]);
	  return Room;
	}(EventEmitter);
	var DecryptionRequest = function () {
	  function DecryptionRequest(decryptFn) {
	    _classCallCheck(this, DecryptionRequest);
	    this._cancelled = false;
	    this.preparation = null;
	    this._promise = decryptFn(this);
	  }
	  _createClass(DecryptionRequest, [{
	    key: "complete",
	    value: function complete() {
	      return this._promise;
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      this._cancelled = true;
	      if (this.preparation) {
	        this.preparation.dispose();
	      }
	    }
	  }, {
	    key: "cancelled",
	    get: function get() {
	      return this._cancelled;
	    }
	  }]);
	  return DecryptionRequest;
	}();

	var RateLimitingBackoff = function () {
	  function RateLimitingBackoff() {
	    _classCallCheck(this, RateLimitingBackoff);
	    this._remainingRateLimitedRequest = 0;
	  }
	  _createClass(RateLimitingBackoff, [{
	    key: "waitAfterLimitExceeded",
	    value: function () {
	      var _waitAfterLimitExceeded = _asyncToGenerator( regeneratorRuntime.mark(function _callee(retryAfterMs) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!retryAfterMs) {
	                  retryAfterMs = 5000;
	                }
	                _context.next = 3;
	                return WebPlatform.delay(retryAfterMs);
	              case 3:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));
	      function waitAfterLimitExceeded(_x) {
	        return _waitAfterLimitExceeded.apply(this, arguments);
	      }
	      return waitAfterLimitExceeded;
	    }()
	  }, {
	    key: "waitForNextSend",
	    value: function () {
	      var _waitForNextSend = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function waitForNextSend() {
	        return _waitForNextSend.apply(this, arguments);
	      }
	      return waitForNextSend;
	    }()
	  }]);
	  return RateLimitingBackoff;
	}();
	var SendScheduler = function () {
	  function SendScheduler(_ref) {
	    var hsApi = _ref.hsApi,
	        backoff = _ref.backoff;
	    _classCallCheck(this, SendScheduler);
	    this._hsApi = hsApi;
	    this._sendRequests = [];
	    this._sendScheduled = false;
	    this._stopped = false;
	    this._waitTime = 0;
	    this._backoff = backoff;
	  }
	  _createClass(SendScheduler, [{
	    key: "stop",
	    value: function stop() {
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      this._stopped = false;
	    }
	  }, {
	    key: "request",
	    value: function request(sendCallback) {
	      var request;
	      var promise = new Promise(function (resolve, reject) {
	        return request = {
	          resolve: resolve,
	          reject: reject,
	          sendCallback: sendCallback
	        };
	      });
	      this._sendRequests.push(request);
	      if (!this._sendScheduled && !this._stopped) {
	        this._sendLoop();
	      }
	      return promise;
	    }
	  }, {
	    key: "_sendLoop",
	    value: function () {
	      var _sendLoop2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3() {
	        var request, result, _iterator, _step, r;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (!this._sendRequests.length) {
	                  _context3.next = 18;
	                  break;
	                }
	                request = this._sendRequests.shift();
	                result = void 0;
	                _context3.prev = 3;
	                _context3.next = 6;
	                return this._doSend(request.sendCallback);
	              case 6:
	                result = _context3.sent;
	                _context3.next = 15;
	                break;
	              case 9:
	                _context3.prev = 9;
	                _context3.t0 = _context3["catch"](3);
	                if (_context3.t0 instanceof ConnectionError) {
	                  this._stopped = true;
	                  _iterator = _createForOfIteratorHelper(this._sendRequests);
	                  try {
	                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                      r = _step.value;
	                      r.reject(_context3.t0);
	                    }
	                  } catch (err) {
	                    _iterator.e(_context3.t0);
	                  } finally {
	                    _iterator.f();
	                  }
	                  this._sendRequests = [];
	                }
	                console.error("error for request", _context3.t0);
	                request.reject(_context3.t0);
	                return _context3.abrupt("break", 18);
	              case 15:
	                request.resolve(result);
	                _context3.next = 0;
	                break;
	              case 18:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[3, 9]]);
	      }));
	      function _sendLoop() {
	        return _sendLoop2.apply(this, arguments);
	      }
	      return _sendLoop;
	    }()
	  }, {
	    key: "_doSend",
	    value: function () {
	      var _doSend2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(sendCallback) {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                this._sendScheduled = false;
	                _context4.next = 3;
	                return this._backoff.waitForNextSend();
	              case 3:
	                _context4.prev = 4;
	                _context4.next = 7;
	                return sendCallback(this._hsApi);
	              case 7:
	                return _context4.abrupt("return", _context4.sent);
	              case 10:
	                _context4.prev = 10;
	                _context4.t0 = _context4["catch"](4);
	                if (!(_context4.t0 instanceof HomeServerError && _context4.t0.errcode === "M_LIMIT_EXCEEDED")) {
	                  _context4.next = 17;
	                  break;
	                }
	                _context4.next = 15;
	                return this._backoff.waitAfterLimitExceeded(_context4.t0.retry_after_ms);
	              case 15:
	                _context4.next = 18;
	                break;
	              case 17:
	                throw _context4.t0;
	              case 18:
	                _context4.next = 3;
	                break;
	              case 20:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this, [[4, 10]]);
	      }));
	      function _doSend(_x2) {
	        return _doSend2.apply(this, arguments);
	      }
	      return _doSend;
	    }()
	  }, {
	    key: "isStarted",
	    get: function get() {
	      return !this._stopped;
	    }
	  }]);
	  return SendScheduler;
	}();

	var User = function () {
	  function User(userId) {
	    _classCallCheck(this, User);
	    this._userId = userId;
	  }
	  _createClass(User, [{
	    key: "id",
	    get: function get() {
	      return this._userId;
	    }
	  }]);
	  return User;
	}();

	function groupBy(array, groupFn) {
	  return groupByWithCreator(array, groupFn, function () {
	    return [];
	  }, function (array, value) {
	    return array.push(value);
	  });
	}
	function groupByWithCreator(array, groupFn, createCollectionFn, addCollectionFn) {
	  return array.reduce(function (map, value) {
	    var key = groupFn(value);
	    var collection = map.get(key);
	    if (!collection) {
	      collection = createCollectionFn();
	      map.set(key, collection);
	    }
	    addCollectionFn(collection, value);
	    return map;
	  }, new Map());
	}

	var PENDING_ENCRYPTED_EVENTS = "pendingEncryptedDeviceEvents";
	var DeviceMessageHandler = function () {
	  function DeviceMessageHandler(_ref) {
	    var storage = _ref.storage;
	    _classCallCheck(this, DeviceMessageHandler);
	    this._storage = storage;
	    this._olmDecryption = null;
	    this._megolmDecryption = null;
	  }
	  _createClass(DeviceMessageHandler, [{
	    key: "enableEncryption",
	    value: function enableEncryption(_ref2) {
	      var olmDecryption = _ref2.olmDecryption,
	          megolmDecryption = _ref2.megolmDecryption;
	      this._olmDecryption = olmDecryption;
	      this._megolmDecryption = megolmDecryption;
	    }
	  }, {
	    key: "writeSync",
	    value: function () {
	      var _writeSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee(toDeviceEvents, txn) {
	        var encryptedEvents, pendingEvents;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                encryptedEvents = toDeviceEvents.filter(function (e) {
	                  return e.type === "m.room.encrypted";
	                });
	                _context.next = 3;
	                return this._getPendingEvents(txn);
	              case 3:
	                pendingEvents = _context.sent;
	                pendingEvents = pendingEvents.concat(encryptedEvents);
	                txn.session.set(PENDING_ENCRYPTED_EVENTS, pendingEvents);
	              case 6:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function writeSync(_x, _x2) {
	        return _writeSync.apply(this, arguments);
	      }
	      return writeSync;
	    }()
	  }, {
	    key: "_writeDecryptedEvents",
	    value: function () {
	      var _writeDecryptedEvents2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(olmResults, txn) {
	        var megOlmRoomKeysResults, roomKeys;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                megOlmRoomKeysResults = olmResults.filter(function (r) {
	                  var _r$event, _r$event$content;
	                  return ((_r$event = r.event) === null || _r$event === void 0 ? void 0 : _r$event.type) === "m.room_key" && ((_r$event$content = r.event.content) === null || _r$event$content === void 0 ? void 0 : _r$event$content.algorithm) === MEGOLM_ALGORITHM;
	                });
	                if (!megOlmRoomKeysResults.length) {
	                  _context2.next = 6;
	                  break;
	                }
	                console.log("new room keys", megOlmRoomKeysResults);
	                _context2.next = 5;
	                return this._megolmDecryption.addRoomKeys(megOlmRoomKeysResults, txn);
	              case 5:
	                roomKeys = _context2.sent;
	              case 6:
	                return _context2.abrupt("return", {
	                  roomKeys: roomKeys
	                });
	              case 7:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function _writeDecryptedEvents(_x3, _x4) {
	        return _writeDecryptedEvents2.apply(this, arguments);
	      }
	      return _writeDecryptedEvents;
	    }()
	  }, {
	    key: "_applyDecryptChanges",
	    value: function _applyDecryptChanges(rooms, _ref3) {
	      var roomKeys = _ref3.roomKeys;
	      if (roomKeys && roomKeys.length) {
	        var roomKeysByRoom = groupBy(roomKeys, function (s) {
	          return s.roomId;
	        });
	        var _iterator = _createForOfIteratorHelper(roomKeysByRoom),
	            _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var _step$value = _slicedToArray(_step.value, 2),
	                roomId = _step$value[0],
	                _roomKeys = _step$value[1];
	            var room = rooms.get(roomId);
	            room === null || room === void 0 ? void 0 : room.notifyRoomKeys(_roomKeys);
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	      }
	    }
	  }, {
	    key: "decryptPending",
	    value: function () {
	      var _decryptPending = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(rooms) {
	        var readTxn, pendingEvents, olmEvents, decryptChanges, _iterator2, _step2, _err, txn, changes;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (this._olmDecryption) {
	                  _context3.next = 2;
	                  break;
	                }
	                return _context3.abrupt("return");
	              case 2:
	                _context3.next = 4;
	                return this._storage.readTxn([this._storage.storeNames.session]);
	              case 4:
	                readTxn = _context3.sent;
	                _context3.next = 7;
	                return this._getPendingEvents(readTxn);
	              case 7:
	                pendingEvents = _context3.sent;
	                if (!(pendingEvents.length === 0)) {
	                  _context3.next = 10;
	                  break;
	                }
	                return _context3.abrupt("return");
	              case 10:
	                olmEvents = pendingEvents.filter(function (e) {
	                  var _e$content;
	                  return ((_e$content = e.content) === null || _e$content === void 0 ? void 0 : _e$content.algorithm) === OLM_ALGORITHM;
	                });
	                _context3.next = 13;
	                return this._olmDecryption.decryptAll(olmEvents);
	              case 13:
	                decryptChanges = _context3.sent;
	                _iterator2 = _createForOfIteratorHelper(decryptChanges.errors);
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    _err = _step2.value;
	                    console.warn("decryption failed for event", _err, _err.event);
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	                _context3.next = 18;
	                return this._storage.readWriteTxn([
	                this._storage.storeNames.session, this._storage.storeNames.olmSessions, this._storage.storeNames.inboundGroupSessions]);
	              case 18:
	                txn = _context3.sent;
	                _context3.prev = 19;
	                _context3.next = 22;
	                return this._writeDecryptedEvents(decryptChanges.results, txn);
	              case 22:
	                changes = _context3.sent;
	                decryptChanges.write(txn);
	                txn.session.remove(PENDING_ENCRYPTED_EVENTS);
	                _context3.next = 31;
	                break;
	              case 27:
	                _context3.prev = 27;
	                _context3.t0 = _context3["catch"](19);
	                txn.abort();
	                throw _context3.t0;
	              case 31:
	                _context3.next = 33;
	                return txn.complete();
	              case 33:
	                this._applyDecryptChanges(rooms, changes);
	              case 34:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[19, 27]]);
	      }));
	      function decryptPending(_x5) {
	        return _decryptPending.apply(this, arguments);
	      }
	      return decryptPending;
	    }()
	  }, {
	    key: "_getPendingEvents",
	    value: function () {
	      var _getPendingEvents2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(txn) {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return txn.session.get(PENDING_ENCRYPTED_EVENTS);
	              case 2:
	                _context4.t0 = _context4.sent;
	                if (_context4.t0) {
	                  _context4.next = 5;
	                  break;
	                }
	                _context4.t0 = [];
	              case 5:
	                return _context4.abrupt("return", _context4.t0);
	              case 6:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4);
	      }));
	      function _getPendingEvents(_x6) {
	        return _getPendingEvents2.apply(this, arguments);
	      }
	      return _getPendingEvents;
	    }()
	  }]);
	  return DeviceMessageHandler;
	}();

	var ACCOUNT_SESSION_KEY = SESSION_KEY_PREFIX + "olmAccount";
	var DEVICE_KEY_FLAG_SESSION_KEY = SESSION_KEY_PREFIX + "areDeviceKeysUploaded";
	var SERVER_OTK_COUNT_SESSION_KEY = SESSION_KEY_PREFIX + "serverOTKCount";
	var Account = function () {
	  _createClass(Account, null, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee(_ref) {
	        var olm, pickleKey, hsApi, userId, deviceId, txn, pickledAccount, account, areDeviceKeysUploaded, serverOTKCount;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                olm = _ref.olm, pickleKey = _ref.pickleKey, hsApi = _ref.hsApi, userId = _ref.userId, deviceId = _ref.deviceId, txn = _ref.txn;
	                _context.next = 3;
	                return txn.session.get(ACCOUNT_SESSION_KEY);
	              case 3:
	                pickledAccount = _context.sent;
	                if (!pickledAccount) {
	                  _context.next = 14;
	                  break;
	                }
	                account = new olm.Account();
	                _context.next = 8;
	                return txn.session.get(DEVICE_KEY_FLAG_SESSION_KEY);
	              case 8:
	                areDeviceKeysUploaded = _context.sent;
	                account.unpickle(pickleKey, pickledAccount);
	                _context.next = 12;
	                return txn.session.get(SERVER_OTK_COUNT_SESSION_KEY);
	              case 12:
	                serverOTKCount = _context.sent;
	                return _context.abrupt("return", new Account({
	                  pickleKey: pickleKey,
	                  hsApi: hsApi,
	                  account: account,
	                  userId: userId,
	                  deviceId: deviceId,
	                  areDeviceKeysUploaded: areDeviceKeysUploaded,
	                  serverOTKCount: serverOTKCount,
	                  olm: olm
	                }));
	              case 14:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));
	      function load(_x) {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "create",
	    value: function () {
	      var _create = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(_ref2) {
	        var olm, pickleKey, hsApi, userId, deviceId, txn, account, pickledAccount, areDeviceKeysUploaded;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                olm = _ref2.olm, pickleKey = _ref2.pickleKey, hsApi = _ref2.hsApi, userId = _ref2.userId, deviceId = _ref2.deviceId, txn = _ref2.txn;
	                account = new olm.Account();
	                account.create();
	                account.generate_one_time_keys(account.max_number_of_one_time_keys());
	                pickledAccount = account.pickle(pickleKey);
	                areDeviceKeysUploaded = false;
	                _context2.next = 8;
	                return txn.session.add(ACCOUNT_SESSION_KEY, pickledAccount);
	              case 8:
	                _context2.next = 10;
	                return txn.session.add(DEVICE_KEY_FLAG_SESSION_KEY, areDeviceKeysUploaded);
	              case 10:
	                _context2.next = 12;
	                return txn.session.add(SERVER_OTK_COUNT_SESSION_KEY, 0);
	              case 12:
	                return _context2.abrupt("return", new Account({
	                  pickleKey: pickleKey,
	                  hsApi: hsApi,
	                  account: account,
	                  userId: userId,
	                  deviceId: deviceId,
	                  areDeviceKeysUploaded: areDeviceKeysUploaded,
	                  serverOTKCount: 0,
	                  olm: olm
	                }));
	              case 13:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function create(_x2) {
	        return _create.apply(this, arguments);
	      }
	      return create;
	    }()
	  }]);
	  function Account(_ref3) {
	    var pickleKey = _ref3.pickleKey,
	        hsApi = _ref3.hsApi,
	        account = _ref3.account,
	        userId = _ref3.userId,
	        deviceId = _ref3.deviceId,
	        areDeviceKeysUploaded = _ref3.areDeviceKeysUploaded,
	        serverOTKCount = _ref3.serverOTKCount,
	        olm = _ref3.olm;
	    _classCallCheck(this, Account);
	    this._olm = olm;
	    this._pickleKey = pickleKey;
	    this._hsApi = hsApi;
	    this._account = account;
	    this._userId = userId;
	    this._deviceId = deviceId;
	    this._areDeviceKeysUploaded = areDeviceKeysUploaded;
	    this._serverOTKCount = serverOTKCount;
	    this._identityKeys = JSON.parse(this._account.identity_keys());
	  }
	  _createClass(Account, [{
	    key: "uploadKeys",
	    value: function () {
	      var _uploadKeys = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(storage) {
	        var _this = this;
	        var oneTimeKeys, oneTimeKeysEntries, _response$one_time_ke, payload, identityKeys, response;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                oneTimeKeys = JSON.parse(this._account.one_time_keys());
	                oneTimeKeysEntries = Object.entries(oneTimeKeys.curve25519);
	                if (!(oneTimeKeysEntries.length || !this._areDeviceKeysUploaded)) {
	                  _context3.next = 12;
	                  break;
	                }
	                payload = {};
	                if (!this._areDeviceKeysUploaded) {
	                  identityKeys = JSON.parse(this._account.identity_keys());
	                  payload.device_keys = this._deviceKeysPayload(identityKeys);
	                }
	                if (oneTimeKeysEntries.length) {
	                  payload.one_time_keys = this._oneTimeKeysPayload(oneTimeKeysEntries);
	                }
	                _context3.next = 8;
	                return this._hsApi.uploadKeys(payload).response();
	              case 8:
	                response = _context3.sent;
	                this._serverOTKCount = response === null || response === void 0 ? void 0 : (_response$one_time_ke = response.one_time_key_counts) === null || _response$one_time_ke === void 0 ? void 0 : _response$one_time_ke.signed_curve25519;
	                _context3.next = 12;
	                return this._updateSessionStorage(storage, function (sessionStore) {
	                  if (oneTimeKeysEntries.length) {
	                    _this._account.mark_keys_as_published();
	                    sessionStore.set(ACCOUNT_SESSION_KEY, _this._account.pickle(_this._pickleKey));
	                    sessionStore.set(SERVER_OTK_COUNT_SESSION_KEY, _this._serverOTKCount);
	                  }
	                  if (!_this._areDeviceKeysUploaded) {
	                    _this._areDeviceKeysUploaded = true;
	                    sessionStore.set(DEVICE_KEY_FLAG_SESSION_KEY, _this._areDeviceKeysUploaded);
	                  }
	                });
	              case 12:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function uploadKeys(_x3) {
	        return _uploadKeys.apply(this, arguments);
	      }
	      return uploadKeys;
	    }()
	  }, {
	    key: "generateOTKsIfNeeded",
	    value: function () {
	      var _generateOTKsIfNeeded = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(storage) {
	        var _this2 = this;
	        var maxOTKs, limit, oneTimeKeys, oneTimeKeysEntries, unpublishedOTKCount, totalOTKCount;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                maxOTKs = this._account.max_number_of_one_time_keys();
	                limit = maxOTKs / 2;
	                if (!(this._serverOTKCount < limit)) {
	                  _context4.next = 11;
	                  break;
	                }
	                oneTimeKeys = JSON.parse(this._account.one_time_keys());
	                oneTimeKeysEntries = Object.entries(oneTimeKeys.curve25519);
	                unpublishedOTKCount = oneTimeKeysEntries.length;
	                totalOTKCount = this._serverOTKCount + unpublishedOTKCount;
	                if (!(totalOTKCount < limit)) {
	                  _context4.next = 11;
	                  break;
	                }
	                _context4.next = 10;
	                return this._updateSessionStorage(storage, function (sessionStore) {
	                  var newKeyCount = maxOTKs - totalOTKCount;
	                  _this2._account.generate_one_time_keys(newKeyCount);
	                  sessionStore.set(ACCOUNT_SESSION_KEY, _this2._account.pickle(_this2._pickleKey));
	                });
	              case 10:
	                return _context4.abrupt("return", true);
	              case 11:
	                return _context4.abrupt("return", false);
	              case 12:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function generateOTKsIfNeeded(_x4) {
	        return _generateOTKsIfNeeded.apply(this, arguments);
	      }
	      return generateOTKsIfNeeded;
	    }()
	  }, {
	    key: "createInboundOlmSession",
	    value: function createInboundOlmSession(senderKey, body) {
	      var newSession = new this._olm.Session();
	      try {
	        newSession.create_inbound_from(this._account, senderKey, body);
	        return newSession;
	      } catch (err) {
	        newSession.free();
	        throw err;
	      }
	    }
	  }, {
	    key: "createOutboundOlmSession",
	    value: function createOutboundOlmSession(theirIdentityKey, theirOneTimeKey) {
	      var newSession = new this._olm.Session();
	      try {
	        newSession.create_outbound(this._account, theirIdentityKey, theirOneTimeKey);
	        return newSession;
	      } catch (err) {
	        newSession.free();
	        throw err;
	      }
	    }
	  }, {
	    key: "writeRemoveOneTimeKey",
	    value: function writeRemoveOneTimeKey(session, txn) {
	      this._account.remove_one_time_keys(session);
	      txn.session.set(ACCOUNT_SESSION_KEY, this._account.pickle(this._pickleKey));
	    }
	  }, {
	    key: "writeSync",
	    value: function writeSync(deviceOneTimeKeysCount, txn) {
	      var otkCount = deviceOneTimeKeysCount.signed_curve25519;
	      if (Number.isSafeInteger(otkCount) && otkCount !== this._serverOTKCount) {
	        txn.session.set(SERVER_OTK_COUNT_SESSION_KEY, otkCount);
	        return otkCount;
	      }
	    }
	  }, {
	    key: "afterSync",
	    value: function afterSync(otkCount) {
	      if (Number.isSafeInteger(otkCount)) {
	        this._serverOTKCount = otkCount;
	      }
	    }
	  }, {
	    key: "_deviceKeysPayload",
	    value: function _deviceKeysPayload(identityKeys) {
	      var obj = {
	        user_id: this._userId,
	        device_id: this._deviceId,
	        algorithms: [OLM_ALGORITHM, MEGOLM_ALGORITHM],
	        keys: {}
	      };
	      for (var _i = 0, _Object$entries = Object.entries(identityKeys); _i < _Object$entries.length; _i++) {
	        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
	            algorithm = _Object$entries$_i[0],
	            pubKey = _Object$entries$_i[1];
	        obj.keys["".concat(algorithm, ":").concat(this._deviceId)] = pubKey;
	      }
	      this.signObject(obj);
	      return obj;
	    }
	  }, {
	    key: "_oneTimeKeysPayload",
	    value: function _oneTimeKeysPayload(oneTimeKeysEntries) {
	      var obj = {};
	      var _iterator = _createForOfIteratorHelper(oneTimeKeysEntries),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              keyId = _step$value[0],
	              pubKey = _step$value[1];
	          var keyObj = {
	            key: pubKey
	          };
	          this.signObject(keyObj);
	          obj["signed_curve25519:".concat(keyId)] = keyObj;
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      return obj;
	    }
	  }, {
	    key: "_updateSessionStorage",
	    value: function () {
	      var _updateSessionStorage2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(storage, callback) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return storage.readWriteTxn([storage.storeNames.session]);
	              case 2:
	                txn = _context5.sent;
	                _context5.prev = 3;
	                _context5.next = 6;
	                return callback(txn.session);
	              case 6:
	                _context5.next = 12;
	                break;
	              case 8:
	                _context5.prev = 8;
	                _context5.t0 = _context5["catch"](3);
	                txn.abort();
	                throw _context5.t0;
	              case 12:
	                _context5.next = 14;
	                return txn.complete();
	              case 14:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, null, [[3, 8]]);
	      }));
	      function _updateSessionStorage(_x5, _x6) {
	        return _updateSessionStorage2.apply(this, arguments);
	      }
	      return _updateSessionStorage;
	    }()
	  }, {
	    key: "signObject",
	    value: function signObject(obj) {
	      var sigs = obj.signatures || {};
	      var unsigned = obj.unsigned;
	      delete obj.signatures;
	      delete obj.unsigned;
	      sigs[this._userId] = sigs[this._userId] || {};
	      sigs[this._userId]["ed25519:" + this._deviceId] = this._account.sign(anotherJson.stringify(obj));
	      obj.signatures = sigs;
	      if (unsigned !== undefined) {
	        obj.unsigned = unsigned;
	      }
	    }
	  }, {
	    key: "identityKeys",
	    get: function get() {
	      return this._identityKeys;
	    }
	  }]);
	  return Account;
	}();

	function createSessionEntry(olmSession, senderKey, timestamp, pickleKey) {
	  return {
	    session: olmSession.pickle(pickleKey),
	    sessionId: olmSession.session_id(),
	    senderKey: senderKey,
	    lastUsed: timestamp
	  };
	}
	var Session = function () {
	  function Session(data, pickleKey, olm) {
	    var isNew = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
	    _classCallCheck(this, Session);
	    this.data = data;
	    this._olm = olm;
	    this._pickleKey = pickleKey;
	    this.isNew = isNew;
	    this.isModified = isNew;
	  }
	  _createClass(Session, [{
	    key: "load",
	    value: function load() {
	      var session = new this._olm.Session();
	      session.unpickle(this._pickleKey, this.data.session);
	      return session;
	    }
	  }, {
	    key: "unload",
	    value: function unload(olmSession) {
	      olmSession.free();
	    }
	  }, {
	    key: "save",
	    value: function save(olmSession) {
	      this.data.session = olmSession.pickle(this._pickleKey);
	      this.isModified = true;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this.data.sessionId;
	    }
	  }], [{
	    key: "create",
	    value: function create(senderKey, olmSession, olm, pickleKey, timestamp) {
	      var data = createSessionEntry(olmSession, senderKey, timestamp, pickleKey);
	      return new Session(data, pickleKey, olm, true);
	    }
	  }]);
	  return Session;
	}();

	var DecryptionResult = function () {
	  function DecryptionResult(event, senderCurve25519Key, claimedKeys) {
	    _classCallCheck(this, DecryptionResult);
	    this.event = event;
	    this.senderCurve25519Key = senderCurve25519Key;
	    this.claimedEd25519Key = claimedKeys.ed25519;
	    this._device = null;
	    this._roomTracked = true;
	  }
	  _createClass(DecryptionResult, [{
	    key: "setDevice",
	    value: function setDevice(device) {
	      this._device = device;
	    }
	  }, {
	    key: "setRoomNotTrackedYet",
	    value: function setRoomNotTrackedYet() {
	      this._roomTracked = false;
	    }
	  }, {
	    key: "isVerified",
	    get: function get() {
	      if (this._device) {
	        var comesFromDevice = this._device.ed25519Key === this.claimedEd25519Key;
	        return comesFromDevice;
	      }
	      return false;
	    }
	  }, {
	    key: "isUnverified",
	    get: function get() {
	      if (this._device) {
	        return !this.isVerified;
	      } else if (this.isVerificationUnknown) {
	        return false;
	      } else {
	        return true;
	      }
	    }
	  }, {
	    key: "isVerificationUnknown",
	    get: function get() {
	      return !this._device && !this._roomTracked;
	    }
	  }]);
	  return DecryptionResult;
	}();

	var SESSION_LIMIT_PER_SENDER_KEY = 4;
	function isPreKeyMessage(message) {
	  return message.type === 0;
	}
	function sortSessions(sessions) {
	  sessions.sort(function (a, b) {
	    return b.data.lastUsed - a.data.lastUsed;
	  });
	}
	var Decryption = function () {
	  function Decryption(_ref) {
	    var account = _ref.account,
	        pickleKey = _ref.pickleKey,
	        now = _ref.now,
	        ownUserId = _ref.ownUserId,
	        storage = _ref.storage,
	        olm = _ref.olm,
	        senderKeyLock = _ref.senderKeyLock;
	    _classCallCheck(this, Decryption);
	    this._account = account;
	    this._pickleKey = pickleKey;
	    this._now = now;
	    this._ownUserId = ownUserId;
	    this._storage = storage;
	    this._olm = olm;
	    this._senderKeyLock = senderKeyLock;
	  }
	  _createClass(Decryption, [{
	    key: "decryptAll",
	    value: function () {
	      var _decryptAll = _asyncToGenerator( regeneratorRuntime.mark(function _callee(events) {
	        var _this = this;
	        var eventsPerSenderKey, timestamp, locks, readSessionsTxn, senderKeyOperations, results, errors, senderKeyDecryptions, _iterator, _step, lock;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                eventsPerSenderKey = groupBy(events, function (event) {
	                  var _event$content;
	                  return (_event$content = event.content) === null || _event$content === void 0 ? void 0 : _event$content["sender_key"];
	                });
	                timestamp = this._now();
	                _context.next = 4;
	                return Promise.all(Array.from(eventsPerSenderKey.keys()).map(function (senderKey) {
	                  return _this._senderKeyLock.takeLock(senderKey);
	                }));
	              case 4:
	                locks = _context.sent;
	                _context.prev = 5;
	                _context.next = 8;
	                return this._storage.readTxn([this._storage.storeNames.olmSessions]);
	              case 8:
	                readSessionsTxn = _context.sent;
	                _context.next = 11;
	                return Promise.all(Array.from(eventsPerSenderKey.entries()).map(function (_ref2) {
	                  var _ref3 = _slicedToArray(_ref2, 2),
	                      senderKey = _ref3[0],
	                      events = _ref3[1];
	                  return _this._decryptAllForSenderKey(senderKey, events, timestamp, readSessionsTxn);
	                }));
	              case 11:
	                senderKeyOperations = _context.sent;
	                results = senderKeyOperations.reduce(function (all, r) {
	                  return all.concat(r.results);
	                }, []);
	                errors = senderKeyOperations.reduce(function (all, r) {
	                  return all.concat(r.errors);
	                }, []);
	                senderKeyDecryptions = senderKeyOperations.map(function (r) {
	                  return r.senderKeyDecryption;
	                });
	                return _context.abrupt("return", new DecryptionChanges(senderKeyDecryptions, results, errors, this._account, locks));
	              case 18:
	                _context.prev = 18;
	                _context.t0 = _context["catch"](5);
	                _iterator = _createForOfIteratorHelper(locks);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    lock = _step.value;
	                    lock.release();
	                  }
	                } catch (err) {
	                  _iterator.e(_context.t0);
	                } finally {
	                  _iterator.f();
	                }
	                throw _context.t0;
	              case 23:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[5, 18]]);
	      }));
	      function decryptAll(_x) {
	        return _decryptAll.apply(this, arguments);
	      }
	      return decryptAll;
	    }()
	  }, {
	    key: "_decryptAllForSenderKey",
	    value: function () {
	      var _decryptAllForSenderKey2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(senderKey, events, timestamp, readSessionsTxn) {
	        var sessions, senderKeyDecryption, results, errors, _iterator2, _step2, event, result;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return this._getSessions(senderKey, readSessionsTxn);
	              case 2:
	                sessions = _context2.sent;
	                senderKeyDecryption = new SenderKeyDecryption(senderKey, sessions, this._olm, timestamp);
	                results = [];
	                errors = [];
	                _iterator2 = _createForOfIteratorHelper(events);
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    event = _step2.value;
	                    try {
	                      result = this._decryptForSenderKey(senderKeyDecryption, event, timestamp);
	                      results.push(result);
	                    } catch (err) {
	                      errors.push(err);
	                    }
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	                return _context2.abrupt("return", {
	                  results: results,
	                  errors: errors,
	                  senderKeyDecryption: senderKeyDecryption
	                });
	              case 9:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function _decryptAllForSenderKey(_x2, _x3, _x4, _x5) {
	        return _decryptAllForSenderKey2.apply(this, arguments);
	      }
	      return _decryptAllForSenderKey;
	    }()
	  }, {
	    key: "_decryptForSenderKey",
	    value: function _decryptForSenderKey(senderKeyDecryption, event, timestamp) {
	      var senderKey = senderKeyDecryption.senderKey;
	      var message = this._getMessageAndValidateEvent(event);
	      var plaintext;
	      try {
	        plaintext = senderKeyDecryption.decrypt(message);
	      } catch (err) {
	        throw new DecryptionError("OLM_BAD_ENCRYPTED_MESSAGE", event, {
	          senderKey: senderKey,
	          error: err.message
	        });
	      }
	      if (typeof plaintext !== "string" && isPreKeyMessage(message)) {
	        var createResult = this._createSessionAndDecrypt(senderKey, message, timestamp);
	        senderKeyDecryption.addNewSession(createResult.session);
	        plaintext = createResult.plaintext;
	      }
	      if (typeof plaintext === "string") {
	        var payload;
	        try {
	          payload = JSON.parse(plaintext);
	        } catch (err) {
	          throw new DecryptionError("PLAINTEXT_NOT_JSON", event, {
	            plaintext: plaintext,
	            err: err
	          });
	        }
	        this._validatePayload(payload, event);
	        return new DecryptionResult(payload, senderKey, payload.keys);
	      } else {
	        throw new DecryptionError("OLM_NO_MATCHING_SESSION", event, {
	          knownSessionIds: senderKeyDecryption.sessions.map(function (s) {
	            return s.id;
	          })
	        });
	      }
	    }
	  }, {
	    key: "_createSessionAndDecrypt",
	    value: function _createSessionAndDecrypt(senderKey, message, timestamp) {
	      var plaintext;
	      var olmSession = this._account.createInboundOlmSession(senderKey, message.body);
	      try {
	        plaintext = olmSession.decrypt(message.type, message.body);
	        var session = Session.create(senderKey, olmSession, this._olm, this._pickleKey, timestamp);
	        session.unload(olmSession);
	        return {
	          session: session,
	          plaintext: plaintext
	        };
	      } catch (err) {
	        olmSession.free();
	        throw err;
	      }
	    }
	  }, {
	    key: "_getMessageAndValidateEvent",
	    value: function _getMessageAndValidateEvent(event) {
	      var _event$content2;
	      var ciphertext = (_event$content2 = event.content) === null || _event$content2 === void 0 ? void 0 : _event$content2.ciphertext;
	      if (!ciphertext) {
	        throw new DecryptionError("OLM_MISSING_CIPHERTEXT", event);
	      }
	      var message = ciphertext === null || ciphertext === void 0 ? void 0 : ciphertext[this._account.identityKeys.curve25519];
	      if (!message) {
	        throw new DecryptionError("OLM_NOT_INCLUDED_IN_RECIPIENTS", event);
	      }
	      return message;
	    }
	  }, {
	    key: "_getSessions",
	    value: function () {
	      var _getSessions2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(senderKey, txn) {
	        var _this2 = this;
	        var sessionEntries, sessions;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return txn.olmSessions.getAll(senderKey);
	              case 2:
	                sessionEntries = _context3.sent;
	                sessions = sessionEntries.map(function (s) {
	                  return new Session(s, _this2._pickleKey, _this2._olm);
	                });
	                sortSessions(sessions);
	                return _context3.abrupt("return", sessions);
	              case 6:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3);
	      }));
	      function _getSessions(_x6, _x7) {
	        return _getSessions2.apply(this, arguments);
	      }
	      return _getSessions;
	    }()
	  }, {
	    key: "_validatePayload",
	    value: function _validatePayload(payload, event) {
	      var _payload$recipient_ke, _payload$keys;
	      if (payload.sender !== event.sender) {
	        throw new DecryptionError("OLM_FORWARDED_MESSAGE", event, {
	          sentBy: event.sender,
	          encryptedBy: payload.sender
	        });
	      }
	      if (payload.recipient !== this._ownUserId) {
	        throw new DecryptionError("OLM_BAD_RECIPIENT", event, {
	          recipient: payload.recipient
	        });
	      }
	      if (((_payload$recipient_ke = payload.recipient_keys) === null || _payload$recipient_ke === void 0 ? void 0 : _payload$recipient_ke.ed25519) !== this._account.identityKeys.ed25519) {
	        var _payload$recipient_ke2;
	        throw new DecryptionError("OLM_BAD_RECIPIENT_KEY", event, {
	          key: (_payload$recipient_ke2 = payload.recipient_keys) === null || _payload$recipient_ke2 === void 0 ? void 0 : _payload$recipient_ke2.ed25519
	        });
	      }
	      if (!payload.type) {
	        throw new DecryptionError("missing type on payload", event, {
	          payload: payload
	        });
	      }
	      if (typeof ((_payload$keys = payload.keys) === null || _payload$keys === void 0 ? void 0 : _payload$keys.ed25519) !== "string") {
	        throw new DecryptionError("Missing or invalid claimed ed25519 key on payload", event, {
	          payload: payload
	        });
	      }
	    }
	  }]);
	  return Decryption;
	}();
	var SenderKeyDecryption = function () {
	  function SenderKeyDecryption(senderKey, sessions, olm, timestamp) {
	    _classCallCheck(this, SenderKeyDecryption);
	    this.senderKey = senderKey;
	    this.sessions = sessions;
	    this._olm = olm;
	    this._timestamp = timestamp;
	  }
	  _createClass(SenderKeyDecryption, [{
	    key: "addNewSession",
	    value: function addNewSession(session) {
	      this.sessions.unshift(session);
	    }
	  }, {
	    key: "decrypt",
	    value: function decrypt(message) {
	      var _iterator3 = _createForOfIteratorHelper(this.sessions),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var session = _step3.value;
	          var plaintext = this._decryptWithSession(session, message);
	          if (typeof plaintext === "string") {
	            sortSessions(this.sessions);
	            return plaintext;
	          }
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "getModifiedSessions",
	    value: function getModifiedSessions() {
	      return this.sessions.filter(function (session) {
	        return session.isModified;
	      });
	    }
	  }, {
	    key: "_decryptWithSession",
	    value: function _decryptWithSession(session, message) {
	      var olmSession = session.load();
	      try {
	        if (isPreKeyMessage(message) && !olmSession.matches_inbound(message.body)) {
	          return;
	        }
	        try {
	          var plaintext = olmSession.decrypt(message.type, message.body);
	          session.save(olmSession);
	          session.lastUsed = this._timestamp;
	          return plaintext;
	        } catch (err) {
	          if (isPreKeyMessage(message)) {
	            throw new Error("Error decrypting prekey message with existing session id ".concat(session.id, ": ").concat(err.message));
	          }
	          return;
	        }
	      } finally {
	        session.unload(olmSession);
	      }
	    }
	  }, {
	    key: "hasNewSessions",
	    get: function get() {
	      return this.sessions.some(function (session) {
	        return session.isNew;
	      });
	    }
	  }]);
	  return SenderKeyDecryption;
	}();
	var DecryptionChanges = function () {
	  function DecryptionChanges(senderKeyDecryptions, results, errors, account, locks) {
	    _classCallCheck(this, DecryptionChanges);
	    this._senderKeyDecryptions = senderKeyDecryptions;
	    this._account = account;
	    this.results = results;
	    this.errors = errors;
	    this._locks = locks;
	  }
	  _createClass(DecryptionChanges, [{
	    key: "write",
	    value: function write(txn) {
	      try {
	        var _iterator4 = _createForOfIteratorHelper(this._senderKeyDecryptions),
	            _step4;
	        try {
	          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	            var senderKeyDecryption = _step4.value;
	            var _iterator5 = _createForOfIteratorHelper(senderKeyDecryption.getModifiedSessions()),
	                _step5;
	            try {
	              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	                var _session = _step5.value;
	                txn.olmSessions.set(_session.data);
	                if (_session.isNew) {
	                  var olmSession = _session.load();
	                  try {
	                    this._account.writeRemoveOneTimeKey(olmSession, txn);
	                  } finally {
	                    _session.unload(olmSession);
	                  }
	                }
	              }
	            } catch (err) {
	              _iterator5.e(err);
	            } finally {
	              _iterator5.f();
	            }
	            if (senderKeyDecryption.sessions.length > SESSION_LIMIT_PER_SENDER_KEY) {
	              var senderKey = senderKeyDecryption.senderKey,
	                  sessions = senderKeyDecryption.sessions;
	              for (var i = sessions.length - 1; i >= SESSION_LIMIT_PER_SENDER_KEY; i -= 1) {
	                var session = sessions[i];
	                txn.olmSessions.remove(senderKey, session.id);
	              }
	            }
	          }
	        } catch (err) {
	          _iterator4.e(err);
	        } finally {
	          _iterator4.f();
	        }
	      } finally {
	        var _iterator6 = _createForOfIteratorHelper(this._locks),
	            _step6;
	        try {
	          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
	            var lock = _step6.value;
	            lock.release();
	          }
	        } catch (err) {
	          _iterator6.e(err);
	        } finally {
	          _iterator6.f();
	        }
	      }
	    }
	  }, {
	    key: "hasNewSessions",
	    get: function get() {
	      return this._senderKeyDecryptions.some(function (skd) {
	        return skd.hasNewSessions;
	      });
	    }
	  }]);
	  return DecryptionChanges;
	}();

	function findFirstSessionId(sessionIds) {
	  return sessionIds.reduce(function (first, sessionId) {
	    if (!first || sessionId < first) {
	      return sessionId;
	    } else {
	      return first;
	    }
	  }, null);
	}
	var OTK_ALGORITHM = "signed_curve25519";
	var MAX_BATCH_SIZE = 50;
	var Encryption = function () {
	  function Encryption(_ref) {
	    var account = _ref.account,
	        olm = _ref.olm,
	        olmUtil = _ref.olmUtil,
	        ownUserId = _ref.ownUserId,
	        storage = _ref.storage,
	        now = _ref.now,
	        pickleKey = _ref.pickleKey,
	        senderKeyLock = _ref.senderKeyLock;
	    _classCallCheck(this, Encryption);
	    this._account = account;
	    this._olm = olm;
	    this._olmUtil = olmUtil;
	    this._ownUserId = ownUserId;
	    this._storage = storage;
	    this._now = now;
	    this._pickleKey = pickleKey;
	    this._senderKeyLock = senderKeyLock;
	  }
	  _createClass(Encryption, [{
	    key: "encrypt",
	    value: function () {
	      var _encrypt = _asyncToGenerator( regeneratorRuntime.mark(function _callee(type, content, devices, hsApi) {
	        var messages, i, batchDevices, batchMessages;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                messages = [];
	                i = 0;
	              case 2:
	                if (!(i < devices.length)) {
	                  _context.next = 11;
	                  break;
	                }
	                batchDevices = devices.slice(i, i + MAX_BATCH_SIZE);
	                _context.next = 6;
	                return this._encryptForMaxDevices(type, content, batchDevices, hsApi);
	              case 6:
	                batchMessages = _context.sent;
	                messages = messages.concat(batchMessages);
	              case 8:
	                i += MAX_BATCH_SIZE;
	                _context.next = 2;
	                break;
	              case 11:
	                return _context.abrupt("return", messages);
	              case 12:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function encrypt(_x, _x2, _x3, _x4) {
	        return _encrypt.apply(this, arguments);
	      }
	      return encrypt;
	    }()
	  }, {
	    key: "_encryptForMaxDevices",
	    value: function () {
	      var _encryptForMaxDevices2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(type, content, devices, hsApi) {
	        var _this = this;
	        var locks, _yield$this$_findExis, devicesWithoutSession, existingEncryptionTargets, timestamp, encryptionTargets, newEncryptionTargets, messages, _iterator, _step, target, _iterator2, _step2, lock;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return Promise.all(devices.map(function (device) {
	                  return _this._senderKeyLock.takeLock(device.curve25519Key);
	                }));
	              case 2:
	                locks = _context2.sent;
	                _context2.prev = 3;
	                _context2.next = 6;
	                return this._findExistingSessions(devices);
	              case 6:
	                _yield$this$_findExis = _context2.sent;
	                devicesWithoutSession = _yield$this$_findExis.devicesWithoutSession;
	                existingEncryptionTargets = _yield$this$_findExis.existingEncryptionTargets;
	                timestamp = this._now();
	                encryptionTargets = [];
	                _context2.prev = 11;
	                if (!devicesWithoutSession.length) {
	                  _context2.next = 17;
	                  break;
	                }
	                _context2.next = 15;
	                return this._createNewSessions(devicesWithoutSession, hsApi, timestamp);
	              case 15:
	                newEncryptionTargets = _context2.sent;
	                encryptionTargets = encryptionTargets.concat(newEncryptionTargets);
	              case 17:
	                _context2.next = 19;
	                return this._loadSessions(existingEncryptionTargets);
	              case 19:
	                encryptionTargets = encryptionTargets.concat(existingEncryptionTargets);
	                messages = encryptionTargets.map(function (target) {
	                  var encryptedContent = _this._encryptForDevice(type, content, target);
	                  return new EncryptedMessage(encryptedContent, target.device);
	                });
	                _context2.next = 23;
	                return this._storeSessions(encryptionTargets, timestamp);
	              case 23:
	                return _context2.abrupt("return", messages);
	              case 24:
	                _context2.prev = 24;
	                _iterator = _createForOfIteratorHelper(encryptionTargets);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    target = _step.value;
	                    target.dispose();
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	                return _context2.finish(24);
	              case 28:
	                _context2.prev = 28;
	                _iterator2 = _createForOfIteratorHelper(locks);
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    lock = _step2.value;
	                    lock.release();
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	                return _context2.finish(28);
	              case 32:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[3,, 28, 32], [11,, 24, 28]]);
	      }));
	      function _encryptForMaxDevices(_x5, _x6, _x7, _x8) {
	        return _encryptForMaxDevices2.apply(this, arguments);
	      }
	      return _encryptForMaxDevices;
	    }()
	  }, {
	    key: "_findExistingSessions",
	    value: function () {
	      var _findExistingSessions2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(devices) {
	        var txn, sessionIdsForDevice, devicesWithoutSession, existingEncryptionTargets;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.olmSessions]);
	              case 2:
	                txn = _context4.sent;
	                _context4.next = 5;
	                return Promise.all(devices.map( function () {
	                  var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(device) {
	                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	                      while (1) {
	                        switch (_context3.prev = _context3.next) {
	                          case 0:
	                            _context3.next = 2;
	                            return txn.olmSessions.getSessionIds(device.curve25519Key);
	                          case 2:
	                            return _context3.abrupt("return", _context3.sent);
	                          case 3:
	                          case "end":
	                            return _context3.stop();
	                        }
	                      }
	                    }, _callee3);
	                  }));
	                  return function (_x10) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }()));
	              case 5:
	                sessionIdsForDevice = _context4.sent;
	                devicesWithoutSession = devices.filter(function (_, i) {
	                  var sessionIds = sessionIdsForDevice[i];
	                  return !(sessionIds === null || sessionIds === void 0 ? void 0 : sessionIds.length);
	                });
	                existingEncryptionTargets = devices.map(function (device, i) {
	                  var sessionIds = sessionIdsForDevice[i];
	                  if ((sessionIds === null || sessionIds === void 0 ? void 0 : sessionIds.length) > 0) {
	                    var sessionId = findFirstSessionId(sessionIds);
	                    return EncryptionTarget.fromSessionId(device, sessionId);
	                  }
	                }).filter(function (target) {
	                  return !!target;
	                });
	                return _context4.abrupt("return", {
	                  devicesWithoutSession: devicesWithoutSession,
	                  existingEncryptionTargets: existingEncryptionTargets
	                });
	              case 9:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function _findExistingSessions(_x9) {
	        return _findExistingSessions2.apply(this, arguments);
	      }
	      return _findExistingSessions;
	    }()
	  }, {
	    key: "_encryptForDevice",
	    value: function _encryptForDevice(type, content, target) {
	      var session = target.session,
	          device = target.device;
	      var plaintext = JSON.stringify(this._buildPlainTextMessageForDevice(type, content, device));
	      var message = session.encrypt(plaintext);
	      var encryptedContent = {
	        algorithm: OLM_ALGORITHM,
	        sender_key: this._account.identityKeys.curve25519,
	        ciphertext: _defineProperty({}, device.curve25519Key, message)
	      };
	      return encryptedContent;
	    }
	  }, {
	    key: "_buildPlainTextMessageForDevice",
	    value: function _buildPlainTextMessageForDevice(type, content, device) {
	      return {
	        keys: {
	          "ed25519": this._account.identityKeys.ed25519
	        },
	        recipient_keys: {
	          "ed25519": device.ed25519Key
	        },
	        recipient: device.userId,
	        sender: this._ownUserId,
	        content: content,
	        type: type
	      };
	    }
	  }, {
	    key: "_createNewSessions",
	    value: function () {
	      var _createNewSessions2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(devicesWithoutSession, hsApi, timestamp) {
	        var newEncryptionTargets, _iterator3, _step3, target, device, oneTimeKey, _iterator4, _step4, _target;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return this._claimOneTimeKeys(hsApi, devicesWithoutSession);
	              case 2:
	                newEncryptionTargets = _context5.sent;
	                _context5.prev = 3;
	                _iterator3 = _createForOfIteratorHelper(newEncryptionTargets);
	                try {
	                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	                    target = _step3.value;
	                    device = target.device, oneTimeKey = target.oneTimeKey;
	                    target.session = this._account.createOutboundOlmSession(device.curve25519Key, oneTimeKey);
	                  }
	                } catch (err) {
	                  _iterator3.e(err);
	                } finally {
	                  _iterator3.f();
	                }
	                this._storeSessions(newEncryptionTargets, timestamp);
	                _context5.next = 14;
	                break;
	              case 9:
	                _context5.prev = 9;
	                _context5.t0 = _context5["catch"](3);
	                _iterator4 = _createForOfIteratorHelper(newEncryptionTargets);
	                try {
	                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	                    _target = _step4.value;
	                    _target.dispose();
	                  }
	                } catch (err) {
	                  _iterator4.e(_context5.t0);
	                } finally {
	                  _iterator4.f();
	                }
	                throw _context5.t0;
	              case 14:
	                return _context5.abrupt("return", newEncryptionTargets);
	              case 15:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this, [[3, 9]]);
	      }));
	      function _createNewSessions(_x11, _x12, _x13) {
	        return _createNewSessions2.apply(this, arguments);
	      }
	      return _createNewSessions;
	    }()
	  }, {
	    key: "_claimOneTimeKeys",
	    value: function () {
	      var _claimOneTimeKeys2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(hsApi, deviceIdentities) {
	        var devicesByUser, oneTimeKeys, claimResponse, userKeyMap;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                devicesByUser = groupByWithCreator(deviceIdentities, function (device) {
	                  return device.userId;
	                }, function () {
	                  return new Map();
	                }, function (deviceMap, device) {
	                  return deviceMap.set(device.deviceId, device);
	                });
	                oneTimeKeys = Array.from(devicesByUser.entries()).reduce(function (usersObj, _ref3) {
	                  var _ref4 = _slicedToArray(_ref3, 2),
	                      userId = _ref4[0],
	                      deviceMap = _ref4[1];
	                  usersObj[userId] = Array.from(deviceMap.values()).reduce(function (devicesObj, device) {
	                    devicesObj[device.deviceId] = OTK_ALGORITHM;
	                    return devicesObj;
	                  }, {});
	                  return usersObj;
	                }, {});
	                _context6.next = 4;
	                return hsApi.claimKeys({
	                  timeout: 10000,
	                  one_time_keys: oneTimeKeys
	                }).response();
	              case 4:
	                claimResponse = _context6.sent;
	                if (Object.keys(claimResponse.failures).length) {
	                  console.warn("failures for claiming one time keys", oneTimeKeys, claimResponse.failures);
	                }
	                userKeyMap = claimResponse === null || claimResponse === void 0 ? void 0 : claimResponse["one_time_keys"];
	                return _context6.abrupt("return", this._verifyAndCreateOTKTargets(userKeyMap, devicesByUser));
	              case 8:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function _claimOneTimeKeys(_x14, _x15) {
	        return _claimOneTimeKeys2.apply(this, arguments);
	      }
	      return _claimOneTimeKeys;
	    }()
	  }, {
	    key: "_verifyAndCreateOTKTargets",
	    value: function _verifyAndCreateOTKTargets(userKeyMap, devicesByUser) {
	      var verifiedEncryptionTargets = [];
	      for (var _i = 0, _Object$entries = Object.entries(userKeyMap); _i < _Object$entries.length; _i++) {
	        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
	            userId = _Object$entries$_i[0],
	            userSection = _Object$entries$_i[1];
	        for (var _i2 = 0, _Object$entries2 = Object.entries(userSection); _i2 < _Object$entries2.length; _i2++) {
	          var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
	              deviceId = _Object$entries2$_i[0],
	              deviceSection = _Object$entries2$_i[1];
	          var _Object$entries$ = _slicedToArray(Object.entries(deviceSection)[0], 2),
	              firstPropName = _Object$entries$[0],
	              keySection = _Object$entries$[1];
	          var _firstPropName$split = firstPropName.split(":"),
	              _firstPropName$split2 = _slicedToArray(_firstPropName$split, 1),
	              keyAlgorithm = _firstPropName$split2[0];
	          if (keyAlgorithm === OTK_ALGORITHM) {
	            var _devicesByUser$get;
	            var device = (_devicesByUser$get = devicesByUser.get(userId)) === null || _devicesByUser$get === void 0 ? void 0 : _devicesByUser$get.get(deviceId);
	            if (device) {
	              var isValidSignature = verifyEd25519Signature(this._olmUtil, userId, deviceId, device.ed25519Key, keySection);
	              if (isValidSignature) {
	                var target = EncryptionTarget.fromOTK(device, keySection.key);
	                verifiedEncryptionTargets.push(target);
	              }
	            }
	          }
	        }
	      }
	      return verifiedEncryptionTargets;
	    }
	  }, {
	    key: "_loadSessions",
	    value: function () {
	      var _loadSessions2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(encryptionTargets) {
	        var _this2 = this;
	        var txn, failed, _iterator5, _step5, target;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                _context8.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.olmSessions]);
	              case 2:
	                txn = _context8.sent;
	                failed = false;
	                _context8.prev = 4;
	                _context8.next = 7;
	                return Promise.all(encryptionTargets.map( function () {
	                  var _ref5 = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(encryptionTarget) {
	                    var sessionEntry, olmSession;
	                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
	                      while (1) {
	                        switch (_context7.prev = _context7.next) {
	                          case 0:
	                            _context7.next = 2;
	                            return txn.olmSessions.get(encryptionTarget.device.curve25519Key, encryptionTarget.sessionId);
	                          case 2:
	                            sessionEntry = _context7.sent;
	                            if (sessionEntry && !failed) {
	                              olmSession = new _this2._olm.Session();
	                              olmSession.unpickle(_this2._pickleKey, sessionEntry.session);
	                              encryptionTarget.session = olmSession;
	                            }
	                          case 4:
	                          case "end":
	                            return _context7.stop();
	                        }
	                      }
	                    }, _callee7);
	                  }));
	                  return function (_x17) {
	                    return _ref5.apply(this, arguments);
	                  };
	                }()));
	              case 7:
	                _context8.next = 15;
	                break;
	              case 9:
	                _context8.prev = 9;
	                _context8.t0 = _context8["catch"](4);
	                failed = true;
	                _iterator5 = _createForOfIteratorHelper(encryptionTargets);
	                try {
	                  for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	                    target = _step5.value;
	                    target.dispose();
	                  }
	                } catch (err) {
	                  _iterator5.e(_context8.t0);
	                } finally {
	                  _iterator5.f();
	                }
	                throw _context8.t0;
	              case 15:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this, [[4, 9]]);
	      }));
	      function _loadSessions(_x16) {
	        return _loadSessions2.apply(this, arguments);
	      }
	      return _loadSessions;
	    }()
	  }, {
	    key: "_storeSessions",
	    value: function () {
	      var _storeSessions2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(encryptionTargets, timestamp) {
	        var txn, _iterator6, _step6, target, sessionEntry;
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                _context9.next = 2;
	                return this._storage.readWriteTxn([this._storage.storeNames.olmSessions]);
	              case 2:
	                txn = _context9.sent;
	                _context9.prev = 3;
	                _iterator6 = _createForOfIteratorHelper(encryptionTargets);
	                try {
	                  for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
	                    target = _step6.value;
	                    sessionEntry = createSessionEntry(target.session, target.device.curve25519Key, timestamp, this._pickleKey);
	                    txn.olmSessions.set(sessionEntry);
	                  }
	                } catch (err) {
	                  _iterator6.e(err);
	                } finally {
	                  _iterator6.f();
	                }
	                _context9.next = 12;
	                break;
	              case 8:
	                _context9.prev = 8;
	                _context9.t0 = _context9["catch"](3);
	                txn.abort();
	                throw _context9.t0;
	              case 12:
	                _context9.next = 14;
	                return txn.complete();
	              case 14:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this, [[3, 8]]);
	      }));
	      function _storeSessions(_x18, _x19) {
	        return _storeSessions2.apply(this, arguments);
	      }
	      return _storeSessions;
	    }()
	  }]);
	  return Encryption;
	}();
	var EncryptionTarget = function () {
	  function EncryptionTarget(device, oneTimeKey, sessionId) {
	    _classCallCheck(this, EncryptionTarget);
	    this.device = device;
	    this.oneTimeKey = oneTimeKey;
	    this.sessionId = sessionId;
	    this.session = null;
	  }
	  _createClass(EncryptionTarget, [{
	    key: "dispose",
	    value: function dispose() {
	      if (this.session) {
	        this.session.free();
	      }
	    }
	  }], [{
	    key: "fromOTK",
	    value: function fromOTK(device, oneTimeKey) {
	      return new EncryptionTarget(device, oneTimeKey, null);
	    }
	  }, {
	    key: "fromSessionId",
	    value: function fromSessionId(device, sessionId) {
	      return new EncryptionTarget(device, null, sessionId);
	    }
	  }]);
	  return EncryptionTarget;
	}();
	var EncryptedMessage = function EncryptedMessage(content, device) {
	  _classCallCheck(this, EncryptedMessage);
	  this.content = content;
	  this.device = device;
	};

	var SessionInfo = function () {
	  function SessionInfo(roomId, senderKey, session, claimedKeys) {
	    _classCallCheck(this, SessionInfo);
	    this.roomId = roomId;
	    this.senderKey = senderKey;
	    this.session = session;
	    this.claimedKeys = claimedKeys;
	    this._refCounter = 0;
	  }
	  _createClass(SessionInfo, [{
	    key: "retain",
	    value: function retain() {
	      this._refCounter += 1;
	    }
	  }, {
	    key: "release",
	    value: function release() {
	      this._refCounter -= 1;
	      if (this._refCounter <= 0) {
	        this.dispose();
	      }
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      this.session.free();
	    }
	  }]);
	  return SessionInfo;
	}();

	var DecryptionChanges$1 = function () {
	  function DecryptionChanges(roomId, results, errors, replayEntries) {
	    _classCallCheck(this, DecryptionChanges);
	    this._roomId = roomId;
	    this._results = results;
	    this._errors = errors;
	    this._replayEntries = replayEntries;
	  }
	  _createClass(DecryptionChanges, [{
	    key: "write",
	    value: function () {
	      var _write = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(txn) {
	        var _this = this;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return Promise.all(this._replayEntries.map( function () {
	                  var _ref = _asyncToGenerator( regeneratorRuntime.mark(function _callee(replayEntry) {
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                      while (1) {
	                        switch (_context.prev = _context.next) {
	                          case 0:
	                            try {
	                              _this._handleReplayAttack(_this._roomId, replayEntry, txn);
	                            } catch (err) {
	                              _this._errors.set(replayEntry.eventId, err);
	                            }
	                          case 1:
	                          case "end":
	                            return _context.stop();
	                        }
	                      }
	                    }, _callee);
	                  }));
	                  return function (_x2) {
	                    return _ref.apply(this, arguments);
	                  };
	                }()));
	              case 2:
	                return _context2.abrupt("return", {
	                  results: this._results,
	                  errors: this._errors
	                });
	              case 3:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function write(_x) {
	        return _write.apply(this, arguments);
	      }
	      return write;
	    }()
	  }, {
	    key: "_handleReplayAttack",
	    value: function () {
	      var _handleReplayAttack2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomId, replayEntry, txn) {
	        var messageIndex, sessionId, eventId, timestamp, decryption, decryptedEventIsBad, badEventId;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                messageIndex = replayEntry.messageIndex, sessionId = replayEntry.sessionId, eventId = replayEntry.eventId, timestamp = replayEntry.timestamp;
	                _context3.next = 3;
	                return txn.groupSessionDecryptions.get(roomId, sessionId, messageIndex);
	              case 3:
	                decryption = _context3.sent;
	                if (!(decryption && decryption.eventId !== eventId)) {
	                  _context3.next = 9;
	                  break;
	                }
	                decryptedEventIsBad = decryption.timestamp < timestamp;
	                badEventId = decryptedEventIsBad ? eventId : decryption.eventId;
	                this._results.delete(eventId);
	                throw new DecryptionError("MEGOLM_REPLAYED_INDEX", event, {
	                  messageIndex: messageIndex,
	                  badEventId: badEventId,
	                  otherEventId: decryption.eventId
	                });
	              case 9:
	                if (!decryption) {
	                  txn.groupSessionDecryptions.set({
	                    roomId: roomId,
	                    sessionId: sessionId,
	                    messageIndex: messageIndex,
	                    eventId: eventId,
	                    timestamp: timestamp
	                  });
	                }
	              case 10:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function _handleReplayAttack(_x3, _x4, _x5) {
	        return _handleReplayAttack2.apply(this, arguments);
	      }
	      return _handleReplayAttack;
	    }()
	  }]);
	  return DecryptionChanges;
	}();

	function mergeMap(src, dst) {
	  if (src) {
	    var _iterator = _createForOfIteratorHelper(src.entries()),
	        _step;
	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var _step$value = _slicedToArray(_step.value, 2),
	            key = _step$value[0],
	            value = _step$value[1];
	        dst.set(key, value);
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  }
	}

	var DecryptionPreparation = function () {
	  function DecryptionPreparation(roomId, sessionDecryptions, errors) {
	    _classCallCheck(this, DecryptionPreparation);
	    this._roomId = roomId;
	    this._sessionDecryptions = sessionDecryptions;
	    this._initialErrors = errors;
	  }
	  _createClass(DecryptionPreparation, [{
	    key: "decrypt",
	    value: function () {
	      var _decrypt = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var errors, results, replayEntries;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.prev = 0;
	                errors = this._initialErrors;
	                results = new Map();
	                replayEntries = [];
	                _context2.next = 6;
	                return Promise.all(this._sessionDecryptions.map( function () {
	                  var _ref = _asyncToGenerator( regeneratorRuntime.mark(function _callee(sessionDecryption) {
	                    var sessionResult;
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                      while (1) {
	                        switch (_context.prev = _context.next) {
	                          case 0:
	                            _context.next = 2;
	                            return sessionDecryption.decryptAll();
	                          case 2:
	                            sessionResult = _context.sent;
	                            mergeMap(sessionResult.errors, errors);
	                            mergeMap(sessionResult.results, results);
	                            replayEntries.push.apply(replayEntries, _toConsumableArray(sessionResult.replayEntries));
	                          case 6:
	                          case "end":
	                            return _context.stop();
	                        }
	                      }
	                    }, _callee);
	                  }));
	                  return function (_x) {
	                    return _ref.apply(this, arguments);
	                  };
	                }()));
	              case 6:
	                return _context2.abrupt("return", new DecryptionChanges$1(this._roomId, results, errors, replayEntries));
	              case 7:
	                _context2.prev = 7;
	                this.dispose();
	                return _context2.finish(7);
	              case 10:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[0,, 7, 10]]);
	      }));
	      function decrypt() {
	        return _decrypt.apply(this, arguments);
	      }
	      return decrypt;
	    }()
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      var _iterator = _createForOfIteratorHelper(this._sessionDecryptions),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var sd = _step.value;
	          sd.dispose();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }]);
	  return DecryptionPreparation;
	}();

	var ReplayDetectionEntry = function ReplayDetectionEntry(sessionId, messageIndex, event) {
	  _classCallCheck(this, ReplayDetectionEntry);
	  this.sessionId = sessionId;
	  this.messageIndex = messageIndex;
	  this.eventId = event.event_id;
	  this.timestamp = event.origin_server_ts;
	};

	var SessionDecryption = function () {
	  function SessionDecryption(sessionInfo, events, decryptor) {
	    _classCallCheck(this, SessionDecryption);
	    sessionInfo.retain();
	    this._sessionInfo = sessionInfo;
	    this._events = events;
	    this._decryptor = decryptor;
	    this._decryptionRequests = decryptor ? [] : null;
	  }
	  _createClass(SessionDecryption, [{
	    key: "decryptAll",
	    value: function () {
	      var _decryptAll = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var _this = this;
	        var replayEntries, results, errors, roomId;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                replayEntries = [];
	                results = new Map();
	                roomId = this._sessionInfo.roomId;
	                _context2.next = 5;
	                return Promise.all(this._events.map( function () {
	                  var _ref = _asyncToGenerator( regeneratorRuntime.mark(function _callee(event) {
	                    var session, ciphertext, decryptionResult, request, plaintext, messageIndex, payload, result;
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                      while (1) {
	                        switch (_context.prev = _context.next) {
	                          case 0:
	                            _context.prev = 0;
	                            session = _this._sessionInfo.session;
	                            ciphertext = event.content.ciphertext;
	                            if (!_this._decryptor) {
	                              _context.next = 11;
	                              break;
	                            }
	                            request = _this._decryptor.decrypt(session, ciphertext);
	                            _this._decryptionRequests.push(request);
	                            _context.next = 8;
	                            return request.response();
	                          case 8:
	                            decryptionResult = _context.sent;
	                            _context.next = 12;
	                            break;
	                          case 11:
	                            decryptionResult = session.decrypt(ciphertext);
	                          case 12:
	                            plaintext = decryptionResult.plaintext;
	                            messageIndex = decryptionResult.message_index;
	                            _context.prev = 14;
	                            payload = JSON.parse(plaintext);
	                            _context.next = 21;
	                            break;
	                          case 18:
	                            _context.prev = 18;
	                            _context.t0 = _context["catch"](14);
	                            throw new DecryptionError("PLAINTEXT_NOT_JSON", event, {
	                              plaintext: plaintext,
	                              err: _context.t0
	                            });
	                          case 21:
	                            if (!(payload.room_id !== roomId)) {
	                              _context.next = 23;
	                              break;
	                            }
	                            throw new DecryptionError("MEGOLM_WRONG_ROOM", event, {
	                              encryptedRoomId: payload.room_id,
	                              eventRoomId: roomId
	                            });
	                          case 23:
	                            replayEntries.push(new ReplayDetectionEntry(session.session_id(), messageIndex, event));
	                            result = new DecryptionResult(payload, _this._sessionInfo.senderKey, _this._sessionInfo.claimedKeys);
	                            results.set(event.event_id, result);
	                            _context.next = 34;
	                            break;
	                          case 28:
	                            _context.prev = 28;
	                            _context.t1 = _context["catch"](0);
	                            if (!(_context.t1.name === "AbortError")) {
	                              _context.next = 32;
	                              break;
	                            }
	                            return _context.abrupt("return");
	                          case 32:
	                            if (!errors) {
	                              errors = new Map();
	                            }
	                            errors.set(event.event_id, _context.t1);
	                          case 34:
	                          case "end":
	                            return _context.stop();
	                        }
	                      }
	                    }, _callee, null, [[0, 28], [14, 18]]);
	                  }));
	                  return function (_x) {
	                    return _ref.apply(this, arguments);
	                  };
	                }()));
	              case 5:
	                return _context2.abrupt("return", {
	                  results: results,
	                  errors: errors,
	                  replayEntries: replayEntries
	                });
	              case 6:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function decryptAll() {
	        return _decryptAll.apply(this, arguments);
	      }
	      return decryptAll;
	    }()
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this._decryptionRequests) {
	        var _iterator = _createForOfIteratorHelper(this._decryptionRequests),
	            _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var r = _step.value;
	            r.abort();
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	      }
	      this._sessionInfo.release();
	    }
	  }]);
	  return SessionDecryption;
	}();

	var CACHE_MAX_SIZE = 10;
	var SessionCache = function () {
	  function SessionCache() {
	    _classCallCheck(this, SessionCache);
	    this._sessions = [];
	  }
	  _createClass(SessionCache, [{
	    key: "get",
	    value: function get(roomId, senderKey, sessionId) {
	      var idx = this._sessions.findIndex(function (s) {
	        return s.roomId === roomId && s.senderKey === senderKey && sessionId === s.session.session_id();
	      });
	      if (idx !== -1) {
	        var sessionInfo = this._sessions[idx];
	        if (idx > 0) {
	          this._sessions.splice(idx, 1);
	          this._sessions.unshift(sessionInfo);
	        }
	        return sessionInfo;
	      }
	    }
	  }, {
	    key: "add",
	    value: function add(sessionInfo) {
	      sessionInfo.retain();
	      this._sessions.unshift(sessionInfo);
	      if (this._sessions.length > CACHE_MAX_SIZE) {
	        for (var i = CACHE_MAX_SIZE; i < this._sessions.length; i += 1) {
	          this._sessions[i].release();
	        }
	        this._sessions = this._sessions.slice(0, CACHE_MAX_SIZE);
	      }
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      var _iterator = _createForOfIteratorHelper(this._sessions),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var sessionInfo = _step.value;
	          sessionInfo.release();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }]);
	  return SessionCache;
	}();

	var DecryptionWorker = function () {
	  function DecryptionWorker(workerPool) {
	    _classCallCheck(this, DecryptionWorker);
	    this._workerPool = workerPool;
	  }
	  _createClass(DecryptionWorker, [{
	    key: "decrypt",
	    value: function decrypt(session, ciphertext) {
	      var sessionKey = session.export_session(session.first_known_index());
	      return this._workerPool.send({
	        type: "megolm_decrypt",
	        ciphertext: ciphertext,
	        sessionKey: sessionKey
	      });
	    }
	  }]);
	  return DecryptionWorker;
	}();

	function getSenderKey(event) {
	  var _event$content;
	  return (_event$content = event.content) === null || _event$content === void 0 ? void 0 : _event$content["sender_key"];
	}
	function getSessionId(event) {
	  var _event$content2;
	  return (_event$content2 = event.content) === null || _event$content2 === void 0 ? void 0 : _event$content2["session_id"];
	}
	function getCiphertext(event) {
	  var _event$content3;
	  return (_event$content3 = event.content) === null || _event$content3 === void 0 ? void 0 : _event$content3.ciphertext;
	}
	var Decryption$1 = function () {
	  function Decryption(_ref) {
	    var pickleKey = _ref.pickleKey,
	        olm = _ref.olm,
	        workerPool = _ref.workerPool;
	    _classCallCheck(this, Decryption);
	    this._pickleKey = pickleKey;
	    this._olm = olm;
	    this._decryptor = workerPool ? new DecryptionWorker(workerPool) : null;
	  }
	  _createClass(Decryption, [{
	    key: "createSessionCache",
	    value: function createSessionCache(fallback) {
	      return new SessionCache(fallback);
	    }
	  }, {
	    key: "prepareDecryptAll",
	    value: function () {
	      var _prepareDecryptAll = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(roomId, events, sessionCache, txn) {
	        var _this = this;
	        var errors, validEvents, _iterator, _step, event, isValid, eventsBySession, sessionDecryptions;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                errors = new Map();
	                validEvents = [];
	                _iterator = _createForOfIteratorHelper(events);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    event = _step.value;
	                    isValid = typeof getSenderKey(event) === "string" && typeof getSessionId(event) === "string" && typeof getCiphertext(event) === "string";
	                    if (isValid) {
	                      validEvents.push(event);
	                    } else {
	                      errors.set(event.event_id, new DecryptionError("MEGOLM_INVALID_EVENT", event));
	                    }
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	                eventsBySession = groupBy(validEvents, function (event) {
	                  return "".concat(getSenderKey(event), "|").concat(getSessionId(event));
	                });
	                sessionDecryptions = [];
	                _context2.next = 8;
	                return Promise.all(Array.from(eventsBySession.values()).map( function () {
	                  var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(eventsForSession) {
	                    var first, senderKey, sessionId, sessionInfo, _iterator2, _step2, event;
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                      while (1) {
	                        switch (_context.prev = _context.next) {
	                          case 0:
	                            first = eventsForSession[0];
	                            senderKey = getSenderKey(first);
	                            sessionId = getSessionId(first);
	                            _context.next = 5;
	                            return _this._getSessionInfo(roomId, senderKey, sessionId, sessionCache, txn);
	                          case 5:
	                            sessionInfo = _context.sent;
	                            if (!sessionInfo) {
	                              _iterator2 = _createForOfIteratorHelper(eventsForSession);
	                              try {
	                                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                                  event = _step2.value;
	                                  errors.set(event.event_id, new DecryptionError("MEGOLM_NO_SESSION", event));
	                                }
	                              } catch (err) {
	                                _iterator2.e(err);
	                              } finally {
	                                _iterator2.f();
	                              }
	                            } else {
	                              sessionDecryptions.push(new SessionDecryption(sessionInfo, eventsForSession, _this._decryptor));
	                            }
	                          case 7:
	                          case "end":
	                            return _context.stop();
	                        }
	                      }
	                    }, _callee);
	                  }));
	                  return function (_x5) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }()));
	              case 8:
	                return _context2.abrupt("return", new DecryptionPreparation(roomId, sessionDecryptions, errors));
	              case 9:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function prepareDecryptAll(_x, _x2, _x3, _x4) {
	        return _prepareDecryptAll.apply(this, arguments);
	      }
	      return prepareDecryptAll;
	    }()
	  }, {
	    key: "_getSessionInfo",
	    value: function () {
	      var _getSessionInfo2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomId, senderKey, sessionId, sessionCache, txn) {
	        var sessionInfo, sessionEntry, session;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                sessionInfo = sessionCache.get(roomId, senderKey, sessionId);
	                if (sessionInfo) {
	                  _context3.next = 17;
	                  break;
	                }
	                _context3.next = 4;
	                return txn.inboundGroupSessions.get(roomId, senderKey, sessionId);
	              case 4:
	                sessionEntry = _context3.sent;
	                if (!sessionEntry) {
	                  _context3.next = 17;
	                  break;
	                }
	                session = new this._olm.InboundGroupSession();
	                _context3.prev = 7;
	                session.unpickle(this._pickleKey, sessionEntry.session);
	                sessionInfo = new SessionInfo(roomId, senderKey, session, sessionEntry.claimedKeys);
	                _context3.next = 16;
	                break;
	              case 12:
	                _context3.prev = 12;
	                _context3.t0 = _context3["catch"](7);
	                session.free();
	                throw _context3.t0;
	              case 16:
	                sessionCache.add(sessionInfo);
	              case 17:
	                return _context3.abrupt("return", sessionInfo);
	              case 18:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[7, 12]]);
	      }));
	      function _getSessionInfo(_x6, _x7, _x8, _x9, _x10) {
	        return _getSessionInfo2.apply(this, arguments);
	      }
	      return _getSessionInfo;
	    }()
	  }, {
	    key: "addRoomKeys",
	    value: function () {
	      var _addRoomKeys = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(decryptionResults, txn) {
	        var newSessions, _iterator3, _step3, _event$content4, _event$content5, _event$content6, _step3$value, senderKey, event, claimedEd25519Key, roomId, sessionId, sessionKey, hasSession, session, sessionEntry;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                newSessions = [];
	                _iterator3 = _createForOfIteratorHelper(decryptionResults);
	                _context4.prev = 2;
	                _iterator3.s();
	              case 4:
	                if ((_step3 = _iterator3.n()).done) {
	                  _context4.next = 17;
	                  break;
	                }
	                _step3$value = _step3.value, senderKey = _step3$value.senderCurve25519Key, event = _step3$value.event, claimedEd25519Key = _step3$value.claimedEd25519Key;
	                roomId = (_event$content4 = event.content) === null || _event$content4 === void 0 ? void 0 : _event$content4["room_id"];
	                sessionId = (_event$content5 = event.content) === null || _event$content5 === void 0 ? void 0 : _event$content5["session_id"];
	                sessionKey = (_event$content6 = event.content) === null || _event$content6 === void 0 ? void 0 : _event$content6["session_key"];
	                if (!(typeof roomId !== "string" || typeof sessionId !== "string" || typeof senderKey !== "string" || typeof sessionKey !== "string")) {
	                  _context4.next = 11;
	                  break;
	                }
	                return _context4.abrupt("return");
	              case 11:
	                _context4.next = 13;
	                return txn.inboundGroupSessions.has(roomId, senderKey, sessionId);
	              case 13:
	                hasSession = _context4.sent;
	                if (!hasSession) {
	                  session = new this._olm.InboundGroupSession();
	                  try {
	                    session.create(sessionKey);
	                    sessionEntry = {
	                      roomId: roomId,
	                      senderKey: senderKey,
	                      sessionId: sessionId,
	                      session: session.pickle(this._pickleKey),
	                      claimedKeys: {
	                        ed25519: claimedEd25519Key
	                      }
	                    };
	                    txn.inboundGroupSessions.set(sessionEntry);
	                    newSessions.push(sessionEntry);
	                  } finally {
	                    session.free();
	                  }
	                }
	              case 15:
	                _context4.next = 4;
	                break;
	              case 17:
	                _context4.next = 22;
	                break;
	              case 19:
	                _context4.prev = 19;
	                _context4.t0 = _context4["catch"](2);
	                _iterator3.e(_context4.t0);
	              case 22:
	                _context4.prev = 22;
	                _iterator3.f();
	                return _context4.finish(22);
	              case 25:
	                return _context4.abrupt("return", newSessions);
	              case 26:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this, [[2, 19, 22, 25]]);
	      }));
	      function addRoomKeys(_x11, _x12) {
	        return _addRoomKeys.apply(this, arguments);
	      }
	      return addRoomKeys;
	    }()
	  }]);
	  return Decryption;
	}();

	var Encryption$1 = function () {
	  function Encryption(_ref) {
	    var pickleKey = _ref.pickleKey,
	        olm = _ref.olm,
	        account = _ref.account,
	        storage = _ref.storage,
	        now = _ref.now,
	        ownDeviceId = _ref.ownDeviceId;
	    _classCallCheck(this, Encryption);
	    this._pickleKey = pickleKey;
	    this._olm = olm;
	    this._account = account;
	    this._storage = storage;
	    this._now = now;
	    this._ownDeviceId = ownDeviceId;
	  }
	  _createClass(Encryption, [{
	    key: "discardOutboundSession",
	    value: function discardOutboundSession(roomId, txn) {
	      txn.outboundGroupSessions.remove(roomId);
	    }
	  }, {
	    key: "createRoomKeyMessage",
	    value: function () {
	      var _createRoomKeyMessage2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(roomId, txn) {
	        var sessionEntry, session;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return txn.outboundGroupSessions.get(roomId);
	              case 2:
	                sessionEntry = _context.sent;
	                if (!sessionEntry) {
	                  _context.next = 11;
	                  break;
	                }
	                session = new this._olm.OutboundGroupSession();
	                _context.prev = 5;
	                session.unpickle(this._pickleKey, sessionEntry.session);
	                return _context.abrupt("return", this._createRoomKeyMessage(session, roomId));
	              case 8:
	                _context.prev = 8;
	                session.free();
	                return _context.finish(8);
	              case 11:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[5,, 8, 11]]);
	      }));
	      function createRoomKeyMessage(_x, _x2) {
	        return _createRoomKeyMessage2.apply(this, arguments);
	      }
	      return createRoomKeyMessage;
	    }()
	  }, {
	    key: "encrypt",
	    value: function () {
	      var _encrypt = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(roomId, type, content, encryptionParams) {
	        var session, txn, roomKeyMessage, encryptedContent, sessionEntry;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                session = new this._olm.OutboundGroupSession();
	                _context2.prev = 1;
	                _context2.next = 4;
	                return this._storage.readWriteTxn([this._storage.storeNames.inboundGroupSessions, this._storage.storeNames.outboundGroupSessions]);
	              case 4:
	                txn = _context2.sent;
	                _context2.prev = 5;
	                _context2.next = 8;
	                return txn.outboundGroupSessions.get(roomId);
	              case 8:
	                sessionEntry = _context2.sent;
	                if (sessionEntry) {
	                  session.unpickle(this._pickleKey, sessionEntry.session);
	                }
	                if (!sessionEntry || this._needsToRotate(session, sessionEntry.createdAt, encryptionParams)) {
	                  if (sessionEntry) {
	                    session.free();
	                    session = new this._olm.OutboundGroupSession();
	                  }
	                  session.create();
	                  roomKeyMessage = this._createRoomKeyMessage(session, roomId);
	                  this._storeAsInboundSession(session, roomId, txn);
	                }
	                encryptedContent = this._encryptContent(roomId, session, type, content);
	                txn.outboundGroupSessions.set({
	                  roomId: roomId,
	                  session: session.pickle(this._pickleKey),
	                  createdAt: (sessionEntry === null || sessionEntry === void 0 ? void 0 : sessionEntry.createdAt) || this._now()
	                });
	                _context2.next = 19;
	                break;
	              case 15:
	                _context2.prev = 15;
	                _context2.t0 = _context2["catch"](5);
	                txn.abort();
	                throw _context2.t0;
	              case 19:
	                _context2.next = 21;
	                return txn.complete();
	              case 21:
	                return _context2.abrupt("return", new EncryptionResult(encryptedContent, roomKeyMessage));
	              case 22:
	                _context2.prev = 22;
	                if (session) {
	                  session.free();
	                }
	                return _context2.finish(22);
	              case 25:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[1,, 22, 25], [5, 15]]);
	      }));
	      function encrypt(_x3, _x4, _x5, _x6) {
	        return _encrypt.apply(this, arguments);
	      }
	      return encrypt;
	    }()
	  }, {
	    key: "_needsToRotate",
	    value: function _needsToRotate(session, createdAt, encryptionParams) {
	      var rotationPeriodMs = 604800000;
	      if (Number.isSafeInteger(encryptionParams === null || encryptionParams === void 0 ? void 0 : encryptionParams.rotation_period_ms)) {
	        rotationPeriodMs = encryptionParams === null || encryptionParams === void 0 ? void 0 : encryptionParams.rotation_period_ms;
	      }
	      var rotationPeriodMsgs = 100;
	      if (Number.isSafeInteger(encryptionParams === null || encryptionParams === void 0 ? void 0 : encryptionParams.rotation_period_msgs)) {
	        rotationPeriodMsgs = encryptionParams === null || encryptionParams === void 0 ? void 0 : encryptionParams.rotation_period_msgs;
	      }
	      if (this._now() > createdAt + rotationPeriodMs) {
	        return true;
	      }
	      if (session.message_index() >= rotationPeriodMsgs) {
	        return true;
	      }
	    }
	  }, {
	    key: "_encryptContent",
	    value: function _encryptContent(roomId, session, type, content) {
	      var plaintext = JSON.stringify({
	        room_id: roomId,
	        type: type,
	        content: content
	      });
	      var ciphertext = session.encrypt(plaintext);
	      var encryptedContent = {
	        algorithm: MEGOLM_ALGORITHM,
	        sender_key: this._account.identityKeys.curve25519,
	        ciphertext: ciphertext,
	        session_id: session.session_id(),
	        device_id: this._ownDeviceId
	      };
	      return encryptedContent;
	    }
	  }, {
	    key: "_createRoomKeyMessage",
	    value: function _createRoomKeyMessage(session, roomId) {
	      return {
	        room_id: roomId,
	        session_id: session.session_id(),
	        session_key: session.session_key(),
	        algorithm: MEGOLM_ALGORITHM,
	        chain_index: session.message_index()
	      };
	    }
	  }, {
	    key: "_storeAsInboundSession",
	    value: function _storeAsInboundSession(outboundSession, roomId, txn) {
	      var identityKeys = this._account.identityKeys;
	      var claimedKeys = {
	        ed25519: identityKeys.ed25519
	      };
	      var session = new this._olm.InboundGroupSession();
	      try {
	        session.create(outboundSession.session_key());
	        var sessionEntry = {
	          roomId: roomId,
	          senderKey: identityKeys.curve25519,
	          sessionId: session.session_id(),
	          session: session.pickle(this._pickleKey),
	          claimedKeys: claimedKeys
	        };
	        txn.inboundGroupSessions.set(sessionEntry);
	        return sessionEntry;
	      } finally {
	        session.free();
	      }
	    }
	  }]);
	  return Encryption;
	}();
	var EncryptionResult = function EncryptionResult(content, roomKeyMessage) {
	  _classCallCheck(this, EncryptionResult);
	  this.content = content;
	  this.roomKeyMessage = roomKeyMessage;
	};

	var ENCRYPTED_TYPE = "m.room.encrypted";
	var RoomEncryption = function () {
	  function RoomEncryption(_ref) {
	    var room = _ref.room,
	        deviceTracker = _ref.deviceTracker,
	        olmEncryption = _ref.olmEncryption,
	        megolmEncryption = _ref.megolmEncryption,
	        megolmDecryption = _ref.megolmDecryption,
	        encryptionParams = _ref.encryptionParams,
	        storage = _ref.storage;
	    _classCallCheck(this, RoomEncryption);
	    this._room = room;
	    this._deviceTracker = deviceTracker;
	    this._olmEncryption = olmEncryption;
	    this._megolmEncryption = megolmEncryption;
	    this._megolmDecryption = megolmDecryption;
	    this._encryptionParams = encryptionParams;
	    this._megolmBackfillCache = this._megolmDecryption.createSessionCache();
	    this._megolmSyncCache = this._megolmDecryption.createSessionCache();
	    this._eventIdsByMissingSession = new Map();
	    this._senderDeviceCache = new Map();
	    this._storage = storage;
	  }
	  _createClass(RoomEncryption, [{
	    key: "notifyTimelineClosed",
	    value: function notifyTimelineClosed() {
	      this._megolmBackfillCache.dispose();
	      this._megolmBackfillCache = this._megolmDecryption.createSessionCache();
	      this._senderDeviceCache = new Map();
	    }
	  }, {
	    key: "writeMemberChanges",
	    value: function () {
	      var _writeMemberChanges = _asyncToGenerator( regeneratorRuntime.mark(function _callee(memberChanges, txn) {
	        var _iterator, _step, m;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _iterator = _createForOfIteratorHelper(memberChanges.values());
	                _context.prev = 1;
	                _iterator.s();
	              case 3:
	                if ((_step = _iterator.n()).done) {
	                  _context.next = 10;
	                  break;
	                }
	                m = _step.value;
	                if (!m.hasLeft) {
	                  _context.next = 8;
	                  break;
	                }
	                this._megolmEncryption.discardOutboundSession(this._room.id, txn);
	                return _context.abrupt("break", 10);
	              case 8:
	                _context.next = 3;
	                break;
	              case 10:
	                _context.next = 15;
	                break;
	              case 12:
	                _context.prev = 12;
	                _context.t0 = _context["catch"](1);
	                _iterator.e(_context.t0);
	              case 15:
	                _context.prev = 15;
	                _iterator.f();
	                return _context.finish(15);
	              case 18:
	                _context.next = 20;
	                return this._deviceTracker.writeMemberChanges(this._room, memberChanges, txn);
	              case 20:
	                return _context.abrupt("return", _context.sent);
	              case 21:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[1, 12, 15, 18]]);
	      }));
	      function writeMemberChanges(_x, _x2) {
	        return _writeMemberChanges.apply(this, arguments);
	      }
	      return writeMemberChanges;
	    }()
	  }, {
	    key: "prepareDecryptAll",
	    value: function () {
	      var _prepareDecryptAll = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(events, source, isTimelineOpen, txn) {
	        var errors, validEvents, _iterator2, _step2, _event$unsigned, _event$content, event, _event$content2, customCache, sessionCache, preparation;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                errors = [];
	                validEvents = [];
	                _iterator2 = _createForOfIteratorHelper(events);
	                _context2.prev = 3;
	                _iterator2.s();
	              case 5:
	                if ((_step2 = _iterator2.n()).done) {
	                  _context2.next = 13;
	                  break;
	                }
	                event = _step2.value;
	                if (!(event.redacted_because || ((_event$unsigned = event.unsigned) === null || _event$unsigned === void 0 ? void 0 : _event$unsigned.redacted_because))) {
	                  _context2.next = 9;
	                  break;
	                }
	                return _context2.abrupt("continue", 11);
	              case 9:
	                if (((_event$content = event.content) === null || _event$content === void 0 ? void 0 : _event$content.algorithm) !== MEGOLM_ALGORITHM) {
	                  errors.set(event.event_id, new Error("Unsupported algorithm: " + ((_event$content2 = event.content) === null || _event$content2 === void 0 ? void 0 : _event$content2.algorithm)));
	                }
	                validEvents.push(event);
	              case 11:
	                _context2.next = 5;
	                break;
	              case 13:
	                _context2.next = 18;
	                break;
	              case 15:
	                _context2.prev = 15;
	                _context2.t0 = _context2["catch"](3);
	                _iterator2.e(_context2.t0);
	              case 18:
	                _context2.prev = 18;
	                _iterator2.f();
	                return _context2.finish(18);
	              case 21:
	                if (!(source === DecryptionSource.Sync)) {
	                  _context2.next = 25;
	                  break;
	                }
	                sessionCache = this._megolmSyncCache;
	                _context2.next = 35;
	                break;
	              case 25:
	                if (!(source === DecryptionSource.Timeline)) {
	                  _context2.next = 29;
	                  break;
	                }
	                sessionCache = this._megolmBackfillCache;
	                _context2.next = 35;
	                break;
	              case 29:
	                if (!(source === DecryptionSource.Retry)) {
	                  _context2.next = 34;
	                  break;
	                }
	                customCache = this._megolmEncryption.createSessionCache();
	                sessionCache = customCache;
	                _context2.next = 35;
	                break;
	              case 34:
	                throw new Error("Unknown source: " + source);
	              case 35:
	                _context2.next = 37;
	                return this._megolmDecryption.prepareDecryptAll(this._room.id, validEvents, sessionCache, txn);
	              case 37:
	                preparation = _context2.sent;
	                if (customCache) {
	                  customCache.dispose();
	                }
	                return _context2.abrupt("return", new DecryptionPreparation$1(preparation, errors, {
	                  isTimelineOpen: isTimelineOpen
	                }, this));
	              case 40:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[3, 15, 18, 21]]);
	      }));
	      function prepareDecryptAll(_x3, _x4, _x5, _x6) {
	        return _prepareDecryptAll.apply(this, arguments);
	      }
	      return prepareDecryptAll;
	    }()
	  }, {
	    key: "_processDecryptionResults",
	    value: function () {
	      var _processDecryptionResults2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(results, errors, flags, txn) {
	        var _iterator3, _step3, error, _iterator4, _step4, result;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _iterator3 = _createForOfIteratorHelper(errors.values());
	                try {
	                  for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	                    error = _step3.value;
	                    if (error.code === "MEGOLM_NO_SESSION") {
	                      this._addMissingSessionEvent(error.event);
	                    }
	                  }
	                } catch (err) {
	                  _iterator3.e(err);
	                } finally {
	                  _iterator3.f();
	                }
	                if (!flags.isTimelineOpen) {
	                  _context3.next = 20;
	                  break;
	                }
	                _iterator4 = _createForOfIteratorHelper(results.values());
	                _context3.prev = 4;
	                _iterator4.s();
	              case 6:
	                if ((_step4 = _iterator4.n()).done) {
	                  _context3.next = 12;
	                  break;
	                }
	                result = _step4.value;
	                _context3.next = 10;
	                return this._verifyDecryptionResult(result, txn);
	              case 10:
	                _context3.next = 6;
	                break;
	              case 12:
	                _context3.next = 17;
	                break;
	              case 14:
	                _context3.prev = 14;
	                _context3.t0 = _context3["catch"](4);
	                _iterator4.e(_context3.t0);
	              case 17:
	                _context3.prev = 17;
	                _iterator4.f();
	                return _context3.finish(17);
	              case 20:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[4, 14, 17, 20]]);
	      }));
	      function _processDecryptionResults(_x7, _x8, _x9, _x10) {
	        return _processDecryptionResults2.apply(this, arguments);
	      }
	      return _processDecryptionResults;
	    }()
	  }, {
	    key: "_verifyDecryptionResult",
	    value: function () {
	      var _verifyDecryptionResult2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(result, txn) {
	        var device;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                device = this._senderDeviceCache.get(result.senderCurve25519Key);
	                if (device) {
	                  _context4.next = 6;
	                  break;
	                }
	                _context4.next = 4;
	                return this._deviceTracker.getDeviceByCurve25519Key(result.senderCurve25519Key, txn);
	              case 4:
	                device = _context4.sent;
	                this._senderDeviceCache.set(result.senderCurve25519Key, device);
	              case 6:
	                if (device) {
	                  result.setDevice(device);
	                } else if (!this._room.isTrackingMembers) {
	                  result.setRoomNotTrackedYet();
	                }
	              case 7:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function _verifyDecryptionResult(_x11, _x12) {
	        return _verifyDecryptionResult2.apply(this, arguments);
	      }
	      return _verifyDecryptionResult;
	    }()
	  }, {
	    key: "_addMissingSessionEvent",
	    value: function _addMissingSessionEvent(event) {
	      var _event$content3, _event$content4;
	      var senderKey = (_event$content3 = event.content) === null || _event$content3 === void 0 ? void 0 : _event$content3["sender_key"];
	      var sessionId = (_event$content4 = event.content) === null || _event$content4 === void 0 ? void 0 : _event$content4["session_id"];
	      var key = "".concat(senderKey, "|").concat(sessionId);
	      var eventIds = this._eventIdsByMissingSession.get(key);
	      if (!eventIds) {
	        eventIds = new Set();
	        this._eventIdsByMissingSession.set(key, eventIds);
	      }
	      eventIds.add(event.event_id);
	    }
	  }, {
	    key: "applyRoomKeys",
	    value: function applyRoomKeys(roomKeys) {
	      var retryEventIds = [];
	      var _iterator5 = _createForOfIteratorHelper(roomKeys),
	          _step5;
	      try {
	        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	          var roomKey = _step5.value;
	          var key = "".concat(roomKey.senderKey, "|").concat(roomKey.sessionId);
	          var entriesForSession = this._eventIdsByMissingSession.get(key);
	          if (entriesForSession) {
	            this._eventIdsByMissingSession.delete(key);
	            retryEventIds.push.apply(retryEventIds, _toConsumableArray(entriesForSession));
	          }
	        }
	      } catch (err) {
	        _iterator5.e(err);
	      } finally {
	        _iterator5.f();
	      }
	      return retryEventIds;
	    }
	  }, {
	    key: "encrypt",
	    value: function () {
	      var _encrypt = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(type, content, hsApi) {
	        var megolmResult, devices, userIds;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return this._megolmEncryption.encrypt(this._room.id, type, content, this._encryptionParams);
	              case 2:
	                megolmResult = _context5.sent;
	                if (!megolmResult.roomKeyMessage) {
	                  _context5.next = 14;
	                  break;
	                }
	                _context5.next = 6;
	                return this._deviceTracker.trackRoom(this._room);
	              case 6:
	                _context5.next = 8;
	                return this._deviceTracker.devicesForTrackedRoom(this._room.id, hsApi);
	              case 8:
	                devices = _context5.sent;
	                _context5.next = 11;
	                return this._sendRoomKey(megolmResult.roomKeyMessage, devices, hsApi);
	              case 11:
	                userIds = Array.from(devices.reduce(function (set, device) {
	                  return set.add(device.userId);
	                }, new Set()));
	                _context5.next = 14;
	                return this._clearNeedsRoomKeyFlag(userIds);
	              case 14:
	                return _context5.abrupt("return", {
	                  type: ENCRYPTED_TYPE,
	                  content: megolmResult.content
	                });
	              case 15:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function encrypt(_x13, _x14, _x15) {
	        return _encrypt.apply(this, arguments);
	      }
	      return encrypt;
	    }()
	  }, {
	    key: "needsToShareKeys",
	    value: function needsToShareKeys(memberChanges) {
	      var _iterator6 = _createForOfIteratorHelper(memberChanges.values()),
	          _step6;
	      try {
	        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
	          var m = _step6.value;
	          if (m.member.needsRoomKey) {
	            return true;
	          }
	        }
	      } catch (err) {
	        _iterator6.e(err);
	      } finally {
	        _iterator6.f();
	      }
	      return false;
	    }
	  }, {
	    key: "shareRoomKeyToPendingMembers",
	    value: function () {
	      var _shareRoomKeyToPendingMembers = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(hsApi) {
	        var txn, pendingUserIds;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                _context6.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.roomMembers]);
	              case 2:
	                txn = _context6.sent;
	                _context6.next = 5;
	                return txn.roomMembers.getUserIdsNeedingRoomKey(this._room.id);
	              case 5:
	                pendingUserIds = _context6.sent;
	                _context6.next = 8;
	                return this._shareRoomKey(pendingUserIds, hsApi);
	              case 8:
	                return _context6.abrupt("return", _context6.sent);
	              case 9:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function shareRoomKeyToPendingMembers(_x16) {
	        return _shareRoomKeyToPendingMembers.apply(this, arguments);
	      }
	      return shareRoomKeyToPendingMembers;
	    }()
	  }, {
	    key: "shareRoomKeyForMemberChanges",
	    value: function () {
	      var _shareRoomKeyForMemberChanges = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(memberChanges, hsApi) {
	        var pendingUserIds, _iterator7, _step7, m;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                pendingUserIds = [];
	                _iterator7 = _createForOfIteratorHelper(memberChanges.values());
	                try {
	                  for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
	                    m = _step7.value;
	                    if (m.member.needsRoomKey) {
	                      pendingUserIds.push(m.userId);
	                    }
	                  }
	                } catch (err) {
	                  _iterator7.e(err);
	                } finally {
	                  _iterator7.f();
	                }
	                _context7.next = 5;
	                return this._shareRoomKey(pendingUserIds, hsApi);
	              case 5:
	                return _context7.abrupt("return", _context7.sent);
	              case 6:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));
	      function shareRoomKeyForMemberChanges(_x17, _x18) {
	        return _shareRoomKeyForMemberChanges.apply(this, arguments);
	      }
	      return shareRoomKeyForMemberChanges;
	    }()
	  }, {
	    key: "_shareRoomKey",
	    value: function () {
	      var _shareRoomKey2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(userIds, hsApi) {
	        var readRoomKeyTxn, roomKeyMessage, devices, actuallySentUserIds;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                if (!(userIds.length === 0)) {
	                  _context8.next = 2;
	                  break;
	                }
	                return _context8.abrupt("return");
	              case 2:
	                _context8.next = 4;
	                return this._storage.readTxn([this._storage.storeNames.outboundGroupSessions]);
	              case 4:
	                readRoomKeyTxn = _context8.sent;
	                _context8.next = 7;
	                return this._megolmEncryption.createRoomKeyMessage(this._room.id, readRoomKeyTxn);
	              case 7:
	                roomKeyMessage = _context8.sent;
	                if (!roomKeyMessage) {
	                  _context8.next = 19;
	                  break;
	                }
	                _context8.next = 11;
	                return this._deviceTracker.devicesForRoomMembers(this._room.id, userIds, hsApi);
	              case 11:
	                devices = _context8.sent;
	                _context8.next = 14;
	                return this._sendRoomKey(roomKeyMessage, devices, hsApi);
	              case 14:
	                actuallySentUserIds = Array.from(devices.reduce(function (set, device) {
	                  return set.add(device.userId);
	                }, new Set()));
	                _context8.next = 17;
	                return this._clearNeedsRoomKeyFlag(actuallySentUserIds);
	              case 17:
	                _context8.next = 21;
	                break;
	              case 19:
	                _context8.next = 21;
	                return this._clearNeedsRoomKeyFlag(userIds);
	              case 21:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));
	      function _shareRoomKey(_x19, _x20) {
	        return _shareRoomKey2.apply(this, arguments);
	      }
	      return _shareRoomKey;
	    }()
	  }, {
	    key: "_clearNeedsRoomKeyFlag",
	    value: function () {
	      var _clearNeedsRoomKeyFlag2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee10(userIds) {
	        var _this = this;
	        var txn;
	        return regeneratorRuntime.wrap(function _callee10$(_context10) {
	          while (1) {
	            switch (_context10.prev = _context10.next) {
	              case 0:
	                _context10.next = 2;
	                return this._storage.readWriteTxn([this._storage.storeNames.roomMembers]);
	              case 2:
	                txn = _context10.sent;
	                _context10.prev = 3;
	                _context10.next = 6;
	                return Promise.all(userIds.map( function () {
	                  var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(userId) {
	                    var memberData;
	                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
	                      while (1) {
	                        switch (_context9.prev = _context9.next) {
	                          case 0:
	                            _context9.next = 2;
	                            return txn.roomMembers.get(_this._room.id, userId);
	                          case 2:
	                            memberData = _context9.sent;
	                            if (memberData.needsRoomKey) {
	                              memberData.needsRoomKey = false;
	                              txn.roomMembers.set(memberData);
	                            }
	                          case 4:
	                          case "end":
	                            return _context9.stop();
	                        }
	                      }
	                    }, _callee9);
	                  }));
	                  return function (_x22) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }()));
	              case 6:
	                _context10.next = 12;
	                break;
	              case 8:
	                _context10.prev = 8;
	                _context10.t0 = _context10["catch"](3);
	                txn.abort();
	                throw _context10.t0;
	              case 12:
	                _context10.next = 14;
	                return txn.complete();
	              case 14:
	              case "end":
	                return _context10.stop();
	            }
	          }
	        }, _callee10, this, [[3, 8]]);
	      }));
	      function _clearNeedsRoomKeyFlag(_x21) {
	        return _clearNeedsRoomKeyFlag2.apply(this, arguments);
	      }
	      return _clearNeedsRoomKeyFlag;
	    }()
	  }, {
	    key: "_sendRoomKey",
	    value: function () {
	      var _sendRoomKey2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee11(roomKeyMessage, devices, hsApi) {
	        var messages;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                _context11.next = 2;
	                return this._olmEncryption.encrypt("m.room_key", roomKeyMessage, devices, hsApi);
	              case 2:
	                messages = _context11.sent;
	                _context11.next = 5;
	                return this._sendMessagesToDevices(ENCRYPTED_TYPE, messages, hsApi);
	              case 5:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this);
	      }));
	      function _sendRoomKey(_x23, _x24, _x25) {
	        return _sendRoomKey2.apply(this, arguments);
	      }
	      return _sendRoomKey;
	    }()
	  }, {
	    key: "_sendMessagesToDevices",
	    value: function () {
	      var _sendMessagesToDevices2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee12(type, messages, hsApi) {
	        var messagesByUser, payload, txnId;
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                messagesByUser = groupBy(messages, function (message) {
	                  return message.device.userId;
	                });
	                payload = {
	                  messages: Array.from(messagesByUser.entries()).reduce(function (userMap, _ref3) {
	                    var _ref4 = _slicedToArray(_ref3, 2),
	                        userId = _ref4[0],
	                        messages = _ref4[1];
	                    userMap[userId] = messages.reduce(function (deviceMap, message) {
	                      deviceMap[message.device.deviceId] = message.content;
	                      return deviceMap;
	                    }, {});
	                    return userMap;
	                  }, {})
	                };
	                txnId = makeTxnId();
	                _context12.next = 5;
	                return hsApi.sendToDevice(type, payload, txnId).response();
	              case 5:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12);
	      }));
	      function _sendMessagesToDevices(_x26, _x27, _x28) {
	        return _sendMessagesToDevices2.apply(this, arguments);
	      }
	      return _sendMessagesToDevices;
	    }()
	  }]);
	  return RoomEncryption;
	}();
	var DecryptionPreparation$1 = function () {
	  function DecryptionPreparation(megolmDecryptionPreparation, extraErrors, flags, roomEncryption) {
	    _classCallCheck(this, DecryptionPreparation);
	    this._megolmDecryptionPreparation = megolmDecryptionPreparation;
	    this._extraErrors = extraErrors;
	    this._flags = flags;
	    this._roomEncryption = roomEncryption;
	  }
	  _createClass(DecryptionPreparation, [{
	    key: "decrypt",
	    value: function () {
	      var _decrypt = _asyncToGenerator( regeneratorRuntime.mark(function _callee13() {
	        return regeneratorRuntime.wrap(function _callee13$(_context13) {
	          while (1) {
	            switch (_context13.prev = _context13.next) {
	              case 0:
	                _context13.t0 = DecryptionChanges$2;
	                _context13.next = 3;
	                return this._megolmDecryptionPreparation.decrypt();
	              case 3:
	                _context13.t1 = _context13.sent;
	                _context13.t2 = this._extraErrors;
	                _context13.t3 = this._flags;
	                _context13.t4 = this._roomEncryption;
	                return _context13.abrupt("return", new _context13.t0(_context13.t1, _context13.t2, _context13.t3, _context13.t4));
	              case 8:
	              case "end":
	                return _context13.stop();
	            }
	          }
	        }, _callee13, this);
	      }));
	      function decrypt() {
	        return _decrypt.apply(this, arguments);
	      }
	      return decrypt;
	    }()
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      this._megolmDecryptionPreparation.dispose();
	    }
	  }]);
	  return DecryptionPreparation;
	}();
	var DecryptionChanges$2 = function () {
	  function DecryptionChanges(megolmDecryptionChanges, extraErrors, flags, roomEncryption) {
	    _classCallCheck(this, DecryptionChanges);
	    this._megolmDecryptionChanges = megolmDecryptionChanges;
	    this._extraErrors = extraErrors;
	    this._flags = flags;
	    this._roomEncryption = roomEncryption;
	  }
	  _createClass(DecryptionChanges, [{
	    key: "write",
	    value: function () {
	      var _write = _asyncToGenerator( regeneratorRuntime.mark(function _callee14(txn) {
	        var _yield$this$_megolmDe, results, errors;
	        return regeneratorRuntime.wrap(function _callee14$(_context14) {
	          while (1) {
	            switch (_context14.prev = _context14.next) {
	              case 0:
	                _context14.next = 2;
	                return this._megolmDecryptionChanges.write(txn);
	              case 2:
	                _yield$this$_megolmDe = _context14.sent;
	                results = _yield$this$_megolmDe.results;
	                errors = _yield$this$_megolmDe.errors;
	                mergeMap(this._extraErrors, errors);
	                _context14.next = 8;
	                return this._roomEncryption._processDecryptionResults(results, errors, this._flags, txn);
	              case 8:
	                return _context14.abrupt("return", new BatchDecryptionResult(results, errors));
	              case 9:
	              case "end":
	                return _context14.stop();
	            }
	          }
	        }, _callee14, this);
	      }));
	      function write(_x29) {
	        return _write.apply(this, arguments);
	      }
	      return write;
	    }()
	  }]);
	  return DecryptionChanges;
	}();
	var BatchDecryptionResult = function () {
	  function BatchDecryptionResult(results, errors) {
	    _classCallCheck(this, BatchDecryptionResult);
	    this.results = results;
	    this.errors = errors;
	  }
	  _createClass(BatchDecryptionResult, [{
	    key: "applyToEntries",
	    value: function applyToEntries(entries) {
	      var _iterator8 = _createForOfIteratorHelper(entries),
	          _step8;
	      try {
	        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
	          var entry = _step8.value;
	          var result = this.results.get(entry.id);
	          if (result) {
	            entry.setDecryptionResult(result);
	          } else {
	            var error = this.errors.get(entry.id);
	            if (error) {
	              entry.setDecryptionError(error);
	            }
	          }
	        }
	      } catch (err) {
	        _iterator8.e(err);
	      } finally {
	        _iterator8.f();
	      }
	    }
	  }]);
	  return BatchDecryptionResult;
	}();

	var TRACKING_STATUS_OUTDATED = 0;
	var TRACKING_STATUS_UPTODATE = 1;
	function deviceKeysAsDeviceIdentity(deviceSection) {
	  var _deviceSection$unsign;
	  var deviceId = deviceSection["device_id"];
	  var userId = deviceSection["user_id"];
	  return {
	    userId: userId,
	    deviceId: deviceId,
	    ed25519Key: deviceSection.keys["ed25519:".concat(deviceId)],
	    curve25519Key: deviceSection.keys["curve25519:".concat(deviceId)],
	    algorithms: deviceSection.algorithms,
	    displayName: (_deviceSection$unsign = deviceSection.unsigned) === null || _deviceSection$unsign === void 0 ? void 0 : _deviceSection$unsign.device_display_name
	  };
	}
	var DeviceTracker = function () {
	  function DeviceTracker(_ref) {
	    var storage = _ref.storage,
	        getSyncToken = _ref.getSyncToken,
	        olmUtil = _ref.olmUtil,
	        ownUserId = _ref.ownUserId,
	        ownDeviceId = _ref.ownDeviceId;
	    _classCallCheck(this, DeviceTracker);
	    this._storage = storage;
	    this._getSyncToken = getSyncToken;
	    this._identityChangedForRoom = null;
	    this._olmUtil = olmUtil;
	    this._ownUserId = ownUserId;
	    this._ownDeviceId = ownDeviceId;
	  }
	  _createClass(DeviceTracker, [{
	    key: "writeDeviceChanges",
	    value: function () {
	      var _writeDeviceChanges = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(deviceLists, txn) {
	        var userIdentities;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                userIdentities = txn.userIdentities;
	                if (!(Array.isArray(deviceLists.changed) && deviceLists.changed.length)) {
	                  _context2.next = 4;
	                  break;
	                }
	                _context2.next = 4;
	                return Promise.all(deviceLists.changed.map( function () {
	                  var _ref2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(userId) {
	                    var user;
	                    return regeneratorRuntime.wrap(function _callee$(_context) {
	                      while (1) {
	                        switch (_context.prev = _context.next) {
	                          case 0:
	                            _context.next = 2;
	                            return userIdentities.get(userId);
	                          case 2:
	                            user = _context.sent;
	                            if (user) {
	                              user.deviceTrackingStatus = TRACKING_STATUS_OUTDATED;
	                              userIdentities.set(user);
	                            }
	                          case 4:
	                          case "end":
	                            return _context.stop();
	                        }
	                      }
	                    }, _callee);
	                  }));
	                  return function (_x3) {
	                    return _ref2.apply(this, arguments);
	                  };
	                }()));
	              case 4:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function writeDeviceChanges(_x, _x2) {
	        return _writeDeviceChanges.apply(this, arguments);
	      }
	      return writeDeviceChanges;
	    }()
	  }, {
	    key: "writeMemberChanges",
	    value: function writeMemberChanges(room, memberChanges, txn) {
	      var _this = this;
	      return Promise.all(Array.from(memberChanges.values()).map( function () {
	        var _ref3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(memberChange) {
	          return regeneratorRuntime.wrap(function _callee3$(_context3) {
	            while (1) {
	              switch (_context3.prev = _context3.next) {
	                case 0:
	                  return _context3.abrupt("return", _this._applyMemberChange(memberChange, txn));
	                case 1:
	                case "end":
	                  return _context3.stop();
	              }
	            }
	          }, _callee3);
	        }));
	        return function (_x4) {
	          return _ref3.apply(this, arguments);
	        };
	      }()));
	    }
	  }, {
	    key: "trackRoom",
	    value: function () {
	      var _trackRoom = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(room) {
	        var memberList, txn, isTrackingChanges, members;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                if (!(room.isTrackingMembers || !room.isEncrypted)) {
	                  _context4.next = 2;
	                  break;
	                }
	                return _context4.abrupt("return");
	              case 2:
	                _context4.next = 4;
	                return room.loadMemberList();
	              case 4:
	                memberList = _context4.sent;
	                _context4.prev = 5;
	                _context4.next = 8;
	                return this._storage.readWriteTxn([this._storage.storeNames.roomSummary, this._storage.storeNames.userIdentities]);
	              case 8:
	                txn = _context4.sent;
	                _context4.prev = 9;
	                isTrackingChanges = room.writeIsTrackingMembers(true, txn);
	                members = Array.from(memberList.members.values());
	                _context4.next = 14;
	                return this._writeJoinedMembers(members, txn);
	              case 14:
	                _context4.next = 20;
	                break;
	              case 16:
	                _context4.prev = 16;
	                _context4.t0 = _context4["catch"](9);
	                txn.abort();
	                throw _context4.t0;
	              case 20:
	                _context4.next = 22;
	                return txn.complete();
	              case 22:
	                room.applyIsTrackingMembersChanges(isTrackingChanges);
	              case 23:
	                _context4.prev = 23;
	                memberList.release();
	                return _context4.finish(23);
	              case 26:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this, [[5,, 23, 26], [9, 16]]);
	      }));
	      function trackRoom(_x5) {
	        return _trackRoom.apply(this, arguments);
	      }
	      return trackRoom;
	    }()
	  }, {
	    key: "_writeJoinedMembers",
	    value: function () {
	      var _writeJoinedMembers2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(members, txn) {
	        var _this2 = this;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                _context6.next = 2;
	                return Promise.all(members.map( function () {
	                  var _ref4 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(member) {
	                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
	                      while (1) {
	                        switch (_context5.prev = _context5.next) {
	                          case 0:
	                            if (!(member.membership === "join")) {
	                              _context5.next = 3;
	                              break;
	                            }
	                            _context5.next = 3;
	                            return _this2._writeMember(member, txn);
	                          case 3:
	                          case "end":
	                            return _context5.stop();
	                        }
	                      }
	                    }, _callee5);
	                  }));
	                  return function (_x8) {
	                    return _ref4.apply(this, arguments);
	                  };
	                }()));
	              case 2:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6);
	      }));
	      function _writeJoinedMembers(_x6, _x7) {
	        return _writeJoinedMembers2.apply(this, arguments);
	      }
	      return _writeJoinedMembers;
	    }()
	  }, {
	    key: "_writeMember",
	    value: function () {
	      var _writeMember2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(member, txn) {
	        var userIdentities, identity;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                userIdentities = txn.userIdentities;
	                _context7.next = 3;
	                return userIdentities.get(member.userId);
	              case 3:
	                identity = _context7.sent;
	                if (!identity) {
	                  userIdentities.set({
	                    userId: member.userId,
	                    roomIds: [member.roomId],
	                    deviceTrackingStatus: TRACKING_STATUS_OUTDATED
	                  });
	                } else {
	                  if (!identity.roomIds.includes(member.roomId)) {
	                    identity.roomIds.push(member.roomId);
	                    userIdentities.set(identity);
	                  }
	                }
	              case 5:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7);
	      }));
	      function _writeMember(_x9, _x10) {
	        return _writeMember2.apply(this, arguments);
	      }
	      return _writeMember;
	    }()
	  }, {
	    key: "_applyMemberChange",
	    value: function () {
	      var _applyMemberChange2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(memberChange, txn) {
	        var userIdentities, identity;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                if (!(memberChange.previousMembership !== "join" && memberChange.membership === "join")) {
	                  _context8.next = 5;
	                  break;
	                }
	                _context8.next = 3;
	                return this._writeMember(memberChange.member, txn);
	              case 3:
	                _context8.next = 11;
	                break;
	              case 5:
	                if (!(memberChange.previousMembership === "join" && memberChange.membership !== "join")) {
	                  _context8.next = 11;
	                  break;
	                }
	                userIdentities = txn.userIdentities;
	                _context8.next = 9;
	                return userIdentities.get(memberChange.userId);
	              case 9:
	                identity = _context8.sent;
	                if (identity) {
	                  identity.roomIds = identity.roomIds.filter(function (roomId) {
	                    return roomId !== memberChange.roomId;
	                  });
	                  if (identity.roomIds.length === 0) {
	                    userIdentities.remove(identity.userId);
	                  } else {
	                    userIdentities.set(identity);
	                  }
	                }
	              case 11:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));
	      function _applyMemberChange(_x11, _x12) {
	        return _applyMemberChange2.apply(this, arguments);
	      }
	      return _applyMemberChange;
	    }()
	  }, {
	    key: "_queryKeys",
	    value: function () {
	      var _queryKeys2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee11(userIds, hsApi) {
	        var deviceKeyResponse, verifiedKeysPerUser, flattenedVerifiedKeysPerUser, deviceIdentitiesWithPossibleChangedKeys, txn, deviceIdentities, _iterator, _step, deviceIdentity;
	        return regeneratorRuntime.wrap(function _callee11$(_context11) {
	          while (1) {
	            switch (_context11.prev = _context11.next) {
	              case 0:
	                _context11.next = 2;
	                return hsApi.queryKeys({
	                  "timeout": 10000,
	                  "device_keys": userIds.reduce(function (deviceKeysMap, userId) {
	                    deviceKeysMap[userId] = [];
	                    return deviceKeysMap;
	                  }, {}),
	                  "token": this._getSyncToken()
	                }).response();
	              case 2:
	                deviceKeyResponse = _context11.sent;
	                verifiedKeysPerUser = this._filterVerifiedDeviceKeys(deviceKeyResponse["device_keys"]);
	                flattenedVerifiedKeysPerUser = verifiedKeysPerUser.reduce(function (all, _ref5) {
	                  var verifiedKeys = _ref5.verifiedKeys;
	                  return all.concat(verifiedKeys);
	                }, []);
	                deviceIdentitiesWithPossibleChangedKeys = flattenedVerifiedKeysPerUser.map(deviceKeysAsDeviceIdentity);
	                _context11.next = 8;
	                return this._storage.readWriteTxn([this._storage.storeNames.userIdentities, this._storage.storeNames.deviceIdentities]);
	              case 8:
	                txn = _context11.sent;
	                _context11.prev = 9;
	                _context11.next = 12;
	                return Promise.all(deviceIdentitiesWithPossibleChangedKeys.map( function () {
	                  var _ref6 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(deviceIdentity) {
	                    var existingDevice;
	                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
	                      while (1) {
	                        switch (_context9.prev = _context9.next) {
	                          case 0:
	                            _context9.next = 2;
	                            return txn.deviceIdentities.get(deviceIdentity.userId, deviceIdentity.deviceId);
	                          case 2:
	                            existingDevice = _context9.sent;
	                            if (!(!existingDevice || existingDevice.ed25519Key === deviceIdentity.ed25519Key)) {
	                              _context9.next = 5;
	                              break;
	                            }
	                            return _context9.abrupt("return", deviceIdentity);
	                          case 5:
	                            return _context9.abrupt("return", null);
	                          case 6:
	                          case "end":
	                            return _context9.stop();
	                        }
	                      }
	                    }, _callee9);
	                  }));
	                  return function (_x15) {
	                    return _ref6.apply(this, arguments);
	                  };
	                }()));
	              case 12:
	                deviceIdentities = _context11.sent;
	                deviceIdentities = deviceIdentities.filter(function (di) {
	                  return !!di;
	                });
	                _iterator = _createForOfIteratorHelper(deviceIdentities);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    deviceIdentity = _step.value;
	                    txn.deviceIdentities.set(deviceIdentity);
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	                _context11.next = 18;
	                return Promise.all(verifiedKeysPerUser.map( function () {
	                  var _ref8 = _asyncToGenerator( regeneratorRuntime.mark(function _callee10(_ref7) {
	                    var userId, identity;
	                    return regeneratorRuntime.wrap(function _callee10$(_context10) {
	                      while (1) {
	                        switch (_context10.prev = _context10.next) {
	                          case 0:
	                            userId = _ref7.userId;
	                            _context10.next = 3;
	                            return txn.userIdentities.get(userId);
	                          case 3:
	                            identity = _context10.sent;
	                            identity.deviceTrackingStatus = TRACKING_STATUS_UPTODATE;
	                            txn.userIdentities.set(identity);
	                          case 6:
	                          case "end":
	                            return _context10.stop();
	                        }
	                      }
	                    }, _callee10);
	                  }));
	                  return function (_x16) {
	                    return _ref8.apply(this, arguments);
	                  };
	                }()));
	              case 18:
	                _context11.next = 24;
	                break;
	              case 20:
	                _context11.prev = 20;
	                _context11.t0 = _context11["catch"](9);
	                txn.abort();
	                throw _context11.t0;
	              case 24:
	                _context11.next = 26;
	                return txn.complete();
	              case 26:
	                return _context11.abrupt("return", deviceIdentities);
	              case 27:
	              case "end":
	                return _context11.stop();
	            }
	          }
	        }, _callee11, this, [[9, 20]]);
	      }));
	      function _queryKeys(_x13, _x14) {
	        return _queryKeys2.apply(this, arguments);
	      }
	      return _queryKeys;
	    }()
	  }, {
	    key: "_filterVerifiedDeviceKeys",
	    value: function _filterVerifiedDeviceKeys(keyQueryDeviceKeysResponse) {
	      var _this3 = this;
	      var curve25519Keys = new Set();
	      var verifiedKeys = Object.entries(keyQueryDeviceKeysResponse).map(function (_ref9) {
	        var _ref10 = _slicedToArray(_ref9, 2),
	            userId = _ref10[0],
	            keysByDevice = _ref10[1];
	        var verifiedEntries = Object.entries(keysByDevice).filter(function (_ref11) {
	          var _deviceKeys$keys, _deviceKeys$keys2;
	          var _ref12 = _slicedToArray(_ref11, 2),
	              deviceId = _ref12[0],
	              deviceKeys = _ref12[1];
	          var deviceIdOnKeys = deviceKeys["device_id"];
	          var userIdOnKeys = deviceKeys["user_id"];
	          if (userIdOnKeys !== userId) {
	            return false;
	          }
	          if (deviceIdOnKeys !== deviceId) {
	            return false;
	          }
	          var ed25519Key = (_deviceKeys$keys = deviceKeys.keys) === null || _deviceKeys$keys === void 0 ? void 0 : _deviceKeys$keys["ed25519:".concat(deviceId)];
	          var curve25519Key = (_deviceKeys$keys2 = deviceKeys.keys) === null || _deviceKeys$keys2 === void 0 ? void 0 : _deviceKeys$keys2["curve25519:".concat(deviceId)];
	          if (typeof ed25519Key !== "string" || typeof curve25519Key !== "string") {
	            return false;
	          }
	          if (curve25519Keys.has(curve25519Key)) {
	            console.warn("ignoring device with duplicate curve25519 key in /keys/query response", deviceKeys);
	            return false;
	          }
	          curve25519Keys.add(curve25519Key);
	          return _this3._hasValidSignature(deviceKeys);
	        });
	        var verifiedKeys = verifiedEntries.map(function (_ref13) {
	          var _ref14 = _slicedToArray(_ref13, 2),
	              deviceKeys = _ref14[1];
	          return deviceKeys;
	        });
	        return {
	          userId: userId,
	          verifiedKeys: verifiedKeys
	        };
	      });
	      return verifiedKeys;
	    }
	  }, {
	    key: "_hasValidSignature",
	    value: function _hasValidSignature(deviceSection) {
	      var _deviceSection$keys;
	      var deviceId = deviceSection["device_id"];
	      var userId = deviceSection["user_id"];
	      var ed25519Key = deviceSection === null || deviceSection === void 0 ? void 0 : (_deviceSection$keys = deviceSection.keys) === null || _deviceSection$keys === void 0 ? void 0 : _deviceSection$keys["".concat(SIGNATURE_ALGORITHM, ":").concat(deviceId)];
	      return verifyEd25519Signature(this._olmUtil, userId, deviceId, ed25519Key, deviceSection);
	    }
	  }, {
	    key: "devicesForTrackedRoom",
	    value: function () {
	      var _devicesForTrackedRoom = _asyncToGenerator( regeneratorRuntime.mark(function _callee12(roomId, hsApi) {
	        var txn, userIds;
	        return regeneratorRuntime.wrap(function _callee12$(_context12) {
	          while (1) {
	            switch (_context12.prev = _context12.next) {
	              case 0:
	                _context12.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.roomMembers, this._storage.storeNames.userIdentities]);
	              case 2:
	                txn = _context12.sent;
	                _context12.next = 5;
	                return txn.roomMembers.getAllUserIds(roomId);
	              case 5:
	                userIds = _context12.sent;
	                _context12.next = 8;
	                return this._devicesForUserIds(roomId, userIds, txn, hsApi);
	              case 8:
	                return _context12.abrupt("return", _context12.sent);
	              case 9:
	              case "end":
	                return _context12.stop();
	            }
	          }
	        }, _callee12, this);
	      }));
	      function devicesForTrackedRoom(_x17, _x18) {
	        return _devicesForTrackedRoom.apply(this, arguments);
	      }
	      return devicesForTrackedRoom;
	    }()
	  }, {
	    key: "devicesForRoomMembers",
	    value: function () {
	      var _devicesForRoomMembers = _asyncToGenerator( regeneratorRuntime.mark(function _callee13(roomId, userIds, hsApi) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee13$(_context13) {
	          while (1) {
	            switch (_context13.prev = _context13.next) {
	              case 0:
	                _context13.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.userIdentities]);
	              case 2:
	                txn = _context13.sent;
	                _context13.next = 5;
	                return this._devicesForUserIds(roomId, userIds, txn, hsApi);
	              case 5:
	                return _context13.abrupt("return", _context13.sent);
	              case 6:
	              case "end":
	                return _context13.stop();
	            }
	          }
	        }, _callee13, this);
	      }));
	      function devicesForRoomMembers(_x19, _x20, _x21) {
	        return _devicesForRoomMembers.apply(this, arguments);
	      }
	      return devicesForRoomMembers;
	    }()
	  }, {
	    key: "_devicesForUserIds",
	    value: function () {
	      var _devicesForUserIds2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee14(roomId, userIds, userIdentityTxn, hsApi) {
	        var _this4 = this;
	        var allMemberIdentities, identities, upToDateIdentities, outdatedIdentities, queriedDevices, deviceTxn, devicesPerUser, flattenedDevices, devices;
	        return regeneratorRuntime.wrap(function _callee14$(_context14) {
	          while (1) {
	            switch (_context14.prev = _context14.next) {
	              case 0:
	                _context14.next = 2;
	                return Promise.all(userIds.map(function (userId) {
	                  return userIdentityTxn.userIdentities.get(userId);
	                }));
	              case 2:
	                allMemberIdentities = _context14.sent;
	                identities = allMemberIdentities.filter(function (identity) {
	                  return identity && identity.roomIds.includes(roomId);
	                });
	                upToDateIdentities = identities.filter(function (i) {
	                  return i.deviceTrackingStatus === TRACKING_STATUS_UPTODATE;
	                });
	                outdatedIdentities = identities.filter(function (i) {
	                  return i.deviceTrackingStatus === TRACKING_STATUS_OUTDATED;
	                });
	                if (!outdatedIdentities.length) {
	                  _context14.next = 10;
	                  break;
	                }
	                _context14.next = 9;
	                return this._queryKeys(outdatedIdentities.map(function (i) {
	                  return i.userId;
	                }), hsApi);
	              case 9:
	                queriedDevices = _context14.sent;
	              case 10:
	                _context14.next = 12;
	                return this._storage.readTxn([this._storage.storeNames.deviceIdentities]);
	              case 12:
	                deviceTxn = _context14.sent;
	                _context14.next = 15;
	                return Promise.all(upToDateIdentities.map(function (identity) {
	                  return deviceTxn.deviceIdentities.getAllForUserId(identity.userId);
	                }));
	              case 15:
	                devicesPerUser = _context14.sent;
	                flattenedDevices = devicesPerUser.reduce(function (all, devicesForUser) {
	                  return all.concat(devicesForUser);
	                }, []);
	                if (queriedDevices && queriedDevices.length) {
	                  flattenedDevices = flattenedDevices.concat(queriedDevices);
	                }
	                devices = flattenedDevices.filter(function (device) {
	                  var isOwnDevice = device.userId === _this4._ownUserId && device.deviceId === _this4._ownDeviceId;
	                  return !isOwnDevice;
	                });
	                return _context14.abrupt("return", devices);
	              case 20:
	              case "end":
	                return _context14.stop();
	            }
	          }
	        }, _callee14, this);
	      }));
	      function _devicesForUserIds(_x22, _x23, _x24, _x25) {
	        return _devicesForUserIds2.apply(this, arguments);
	      }
	      return _devicesForUserIds;
	    }()
	  }, {
	    key: "getDeviceByCurve25519Key",
	    value: function () {
	      var _getDeviceByCurve25519Key = _asyncToGenerator( regeneratorRuntime.mark(function _callee15(curve25519Key, txn) {
	        return regeneratorRuntime.wrap(function _callee15$(_context15) {
	          while (1) {
	            switch (_context15.prev = _context15.next) {
	              case 0:
	                _context15.next = 2;
	                return txn.deviceIdentities.getByCurve25519Key(curve25519Key);
	              case 2:
	                return _context15.abrupt("return", _context15.sent);
	              case 3:
	              case "end":
	                return _context15.stop();
	            }
	          }
	        }, _callee15);
	      }));
	      function getDeviceByCurve25519Key(_x26, _x27) {
	        return _getDeviceByCurve25519Key.apply(this, arguments);
	      }
	      return getDeviceByCurve25519Key;
	    }()
	  }]);
	  return DeviceTracker;
	}();

	var Lock = function () {
	  function Lock() {
	    _classCallCheck(this, Lock);
	    this._promise = null;
	    this._resolve = null;
	  }
	  _createClass(Lock, [{
	    key: "take",
	    value: function take() {
	      var _this = this;
	      if (!this._promise) {
	        this._promise = new Promise(function (resolve) {
	          _this._resolve = resolve;
	        });
	        return true;
	      }
	      return false;
	    }
	  }, {
	    key: "release",
	    value: function release() {
	      if (this._resolve) {
	        this._promise = null;
	        var resolve = this._resolve;
	        this._resolve = null;
	        resolve();
	      }
	    }
	  }, {
	    key: "released",
	    value: function released() {
	      return this._promise;
	    }
	  }, {
	    key: "isTaken",
	    get: function get() {
	      return !!this._promise;
	    }
	  }]);
	  return Lock;
	}();

	var LockMap = function () {
	  function LockMap() {
	    _classCallCheck(this, LockMap);
	    this._map = new Map();
	  }
	  _createClass(LockMap, [{
	    key: "takeLock",
	    value: function () {
	      var _takeLock = _asyncToGenerator( regeneratorRuntime.mark(function _callee(key) {
	        var _this = this;
	        var lock;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                lock = this._map.get(key);
	                if (!lock) {
	                  _context.next = 9;
	                  break;
	                }
	              case 2:
	                if (lock.take()) {
	                  _context.next = 7;
	                  break;
	                }
	                _context.next = 5;
	                return lock.released();
	              case 5:
	                _context.next = 2;
	                break;
	              case 7:
	                _context.next = 12;
	                break;
	              case 9:
	                lock = new Lock();
	                lock.take();
	                this._map.set(key, lock);
	              case 12:
	                lock.released().then(function () {
	                  Promise.resolve().then(function () {
	                    if (!lock.isTaken) {
	                      _this._map.delete(key);
	                    }
	                  });
	                });
	                return _context.abrupt("return", lock);
	              case 14:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function takeLock(_x) {
	        return _takeLock.apply(this, arguments);
	      }
	      return takeLock;
	    }()
	  }]);
	  return LockMap;
	}();

	var PICKLE_KEY = "DEFAULT_KEY";
	var Session$1 = function () {
	  function Session(_ref) {
	    var _this = this;
	    var clock = _ref.clock,
	        storage = _ref.storage,
	        hsApi = _ref.hsApi,
	        sessionInfo = _ref.sessionInfo,
	        olm = _ref.olm,
	        workerPool = _ref.workerPool;
	    _classCallCheck(this, Session);
	    this._clock = clock;
	    this._storage = storage;
	    this._hsApi = hsApi;
	    this._syncInfo = null;
	    this._sessionInfo = sessionInfo;
	    this._rooms = new ObservableMap();
	    this._sendScheduler = new SendScheduler({
	      hsApi: hsApi,
	      backoff: new RateLimitingBackoff()
	    });
	    this._roomUpdateCallback = function (room, params) {
	      return _this._rooms.update(room.id, params);
	    };
	    this._user = new User(sessionInfo.userId);
	    this._deviceMessageHandler = new DeviceMessageHandler({
	      storage: storage
	    });
	    this._olm = olm;
	    this._olmUtil = null;
	    this._e2eeAccount = null;
	    this._deviceTracker = null;
	    this._olmEncryption = null;
	    this._megolmEncryption = null;
	    this._megolmDecryption = null;
	    this._getSyncToken = function () {
	      return _this.syncToken;
	    };
	    this._workerPool = workerPool;
	    if (olm) {
	      this._olmUtil = new olm.Utility();
	      this._deviceTracker = new DeviceTracker({
	        storage: storage,
	        getSyncToken: this._getSyncToken,
	        olmUtil: this._olmUtil,
	        ownUserId: sessionInfo.userId,
	        ownDeviceId: sessionInfo.deviceId
	      });
	    }
	    this._createRoomEncryption = this._createRoomEncryption.bind(this);
	  }
	  _createClass(Session, [{
	    key: "_setupEncryption",
	    value: function _setupEncryption() {
	      console.log("loaded e2ee account with keys", this._e2eeAccount.identityKeys);
	      var senderKeyLock = new LockMap();
	      var olmDecryption = new Decryption({
	        account: this._e2eeAccount,
	        pickleKey: PICKLE_KEY,
	        olm: this._olm,
	        storage: this._storage,
	        now: this._clock.now,
	        ownUserId: this._user.id,
	        senderKeyLock: senderKeyLock
	      });
	      this._olmEncryption = new Encryption({
	        account: this._e2eeAccount,
	        pickleKey: PICKLE_KEY,
	        olm: this._olm,
	        storage: this._storage,
	        now: this._clock.now,
	        ownUserId: this._user.id,
	        olmUtil: this._olmUtil,
	        senderKeyLock: senderKeyLock
	      });
	      this._megolmEncryption = new Encryption$1({
	        account: this._e2eeAccount,
	        pickleKey: PICKLE_KEY,
	        olm: this._olm,
	        storage: this._storage,
	        now: this._clock.now,
	        ownDeviceId: this._sessionInfo.deviceId
	      });
	      this._megolmDecryption = new Decryption$1({
	        pickleKey: PICKLE_KEY,
	        olm: this._olm,
	        workerPool: this._workerPool
	      });
	      this._deviceMessageHandler.enableEncryption({
	        olmDecryption: olmDecryption,
	        megolmDecryption: this._megolmDecryption
	      });
	    }
	  }, {
	    key: "_createRoomEncryption",
	    value: function _createRoomEncryption(room, encryptionParams) {
	      if (!this._olmEncryption) {
	        throw new Error("creating room encryption before encryption got globally enabled");
	      }
	      if (encryptionParams.algorithm !== MEGOLM_ALGORITHM) {
	        return null;
	      }
	      return new RoomEncryption({
	        room: room,
	        deviceTracker: this._deviceTracker,
	        olmEncryption: this._olmEncryption,
	        megolmEncryption: this._megolmEncryption,
	        megolmDecryption: this._megolmDecryption,
	        storage: this._storage,
	        encryptionParams: encryptionParams
	      });
	    }
	  }, {
	    key: "beforeFirstSync",
	    value: function () {
	      var _beforeFirstSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee(isNewLogin) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!this._olm) {
	                  _context.next = 26;
	                  break;
	                }
	                if (!(isNewLogin && this._e2eeAccount)) {
	                  _context.next = 3;
	                  break;
	                }
	                throw new Error("there should not be an e2ee account already on a fresh login");
	              case 3:
	                if (this._e2eeAccount) {
	                  _context.next = 20;
	                  break;
	                }
	                _context.next = 6;
	                return this._storage.readWriteTxn([this._storage.storeNames.session]);
	              case 6:
	                txn = _context.sent;
	                _context.prev = 7;
	                _context.next = 10;
	                return Account.create({
	                  hsApi: this._hsApi,
	                  olm: this._olm,
	                  pickleKey: PICKLE_KEY,
	                  userId: this._sessionInfo.userId,
	                  deviceId: this._sessionInfo.deviceId,
	                  txn: txn
	                });
	              case 10:
	                this._e2eeAccount = _context.sent;
	                _context.next = 17;
	                break;
	              case 13:
	                _context.prev = 13;
	                _context.t0 = _context["catch"](7);
	                txn.abort();
	                throw _context.t0;
	              case 17:
	                _context.next = 19;
	                return txn.complete();
	              case 19:
	                this._setupEncryption();
	              case 20:
	                _context.next = 22;
	                return this._e2eeAccount.generateOTKsIfNeeded(this._storage);
	              case 22:
	                _context.next = 24;
	                return this._e2eeAccount.uploadKeys(this._storage);
	              case 24:
	                _context.next = 26;
	                return this._deviceMessageHandler.decryptPending(this.rooms);
	              case 26:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[7, 13]]);
	      }));
	      function beforeFirstSync(_x) {
	        return _beforeFirstSync.apply(this, arguments);
	      }
	      return beforeFirstSync;
	    }()
	  }, {
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var _this2 = this;
	        var txn, pendingEventsByRoomId, rooms;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return this._storage.readTxn([this._storage.storeNames.session, this._storage.storeNames.roomSummary, this._storage.storeNames.roomMembers, this._storage.storeNames.timelineEvents, this._storage.storeNames.timelineFragments, this._storage.storeNames.pendingEvents]);
	              case 2:
	                txn = _context2.sent;
	                _context2.next = 5;
	                return txn.session.get("sync");
	              case 5:
	                this._syncInfo = _context2.sent;
	                if (!this._olm) {
	                  _context2.next = 11;
	                  break;
	                }
	                _context2.next = 9;
	                return Account.load({
	                  hsApi: this._hsApi,
	                  olm: this._olm,
	                  pickleKey: PICKLE_KEY,
	                  userId: this._sessionInfo.userId,
	                  deviceId: this._sessionInfo.deviceId,
	                  txn: txn
	                });
	              case 9:
	                this._e2eeAccount = _context2.sent;
	                if (this._e2eeAccount) {
	                  this._setupEncryption();
	                }
	              case 11:
	                _context2.next = 13;
	                return this._getPendingEventsByRoom(txn);
	              case 13:
	                pendingEventsByRoomId = _context2.sent;
	                _context2.next = 16;
	                return txn.roomSummary.getAll();
	              case 16:
	                rooms = _context2.sent;
	                _context2.next = 19;
	                return Promise.all(rooms.map(function (summary) {
	                  var room = _this2.createRoom(summary.roomId, pendingEventsByRoomId.get(summary.roomId));
	                  return room.load(summary, txn);
	                }));
	              case 19:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function load() {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "stop",
	    value: function stop() {
	      var _this$_workerPool;
	      (_this$_workerPool = this._workerPool) === null || _this$_workerPool === void 0 ? void 0 : _this$_workerPool.dispose();
	      this._sendScheduler.stop();
	    }
	  }, {
	    key: "start",
	    value: function () {
	      var _start = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(lastVersionResponse) {
	        var txn, _iterator, _step, _step$value, room;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                if (!lastVersionResponse) {
	                  _context3.next = 7;
	                  break;
	                }
	                _context3.next = 3;
	                return this._storage.readWriteTxn([this._storage.storeNames.session]);
	              case 3:
	                txn = _context3.sent;
	                txn.session.set("serverVersions", lastVersionResponse);
	                _context3.next = 7;
	                return txn.complete();
	              case 7:
	                this._sendScheduler.start();
	                _iterator = _createForOfIteratorHelper(this._rooms);
	                try {
	                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                    _step$value = _slicedToArray(_step.value, 2), room = _step$value[1];
	                    room.start();
	                  }
	                } catch (err) {
	                  _iterator.e(err);
	                } finally {
	                  _iterator.f();
	                }
	              case 10:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function start(_x2) {
	        return _start.apply(this, arguments);
	      }
	      return start;
	    }()
	  }, {
	    key: "_getPendingEventsByRoom",
	    value: function () {
	      var _getPendingEventsByRoom2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(txn) {
	        var pendingEvents;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return txn.pendingEvents.getAll();
	              case 2:
	                pendingEvents = _context4.sent;
	                return _context4.abrupt("return", pendingEvents.reduce(function (groups, pe) {
	                  var group = groups.get(pe.roomId);
	                  if (group) {
	                    group.push(pe);
	                  } else {
	                    groups.set(pe.roomId, [pe]);
	                  }
	                  return groups;
	                }, new Map()));
	              case 4:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4);
	      }));
	      function _getPendingEventsByRoom(_x3) {
	        return _getPendingEventsByRoom2.apply(this, arguments);
	      }
	      return _getPendingEventsByRoom;
	    }()
	  }, {
	    key: "createRoom",
	    value: function createRoom(roomId, pendingEvents) {
	      var room = new Room({
	        roomId: roomId,
	        getSyncToken: this._getSyncToken,
	        storage: this._storage,
	        emitCollectionChange: this._roomUpdateCallback,
	        hsApi: this._hsApi,
	        sendScheduler: this._sendScheduler,
	        pendingEvents: pendingEvents,
	        user: this._user,
	        createRoomEncryption: this._createRoomEncryption
	      });
	      this._rooms.add(roomId, room);
	      return room;
	    }
	  }, {
	    key: "writeSync",
	    value: function () {
	      var _writeSync = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(syncResponse, syncFilterId, txn) {
	        var _syncResponse$to_devi;
	        var changes, syncToken, deviceOneTimeKeysCount, syncInfo, deviceLists, toDeviceEvents;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                changes = {};
	                syncToken = syncResponse.next_batch;
	                deviceOneTimeKeysCount = syncResponse.device_one_time_keys_count;
	                if (this._e2eeAccount && deviceOneTimeKeysCount) {
	                  changes.e2eeAccountChanges = this._e2eeAccount.writeSync(deviceOneTimeKeysCount, txn);
	                }
	                if (syncToken !== this.syncToken) {
	                  syncInfo = {
	                    token: syncToken,
	                    filterId: syncFilterId
	                  };
	                  txn.session.set("sync", syncInfo);
	                  changes.syncInfo = syncInfo;
	                }
	                if (!this._deviceTracker) {
	                  _context5.next = 10;
	                  break;
	                }
	                deviceLists = syncResponse.device_lists;
	                if (!deviceLists) {
	                  _context5.next = 10;
	                  break;
	                }
	                _context5.next = 10;
	                return this._deviceTracker.writeDeviceChanges(deviceLists, txn);
	              case 10:
	                toDeviceEvents = (_syncResponse$to_devi = syncResponse.to_device) === null || _syncResponse$to_devi === void 0 ? void 0 : _syncResponse$to_devi.events;
	                if (Array.isArray(toDeviceEvents)) {
	                  this._deviceMessageHandler.writeSync(toDeviceEvents, txn);
	                }
	                return _context5.abrupt("return", changes);
	              case 13:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function writeSync(_x4, _x5, _x6) {
	        return _writeSync.apply(this, arguments);
	      }
	      return writeSync;
	    }()
	  }, {
	    key: "afterSync",
	    value: function afterSync(_ref2) {
	      var syncInfo = _ref2.syncInfo,
	          e2eeAccountChanges = _ref2.e2eeAccountChanges;
	      if (syncInfo) {
	        this._syncInfo = syncInfo;
	      }
	      if (this._e2eeAccount && e2eeAccountChanges) {
	        this._e2eeAccount.afterSync(e2eeAccountChanges);
	      }
	    }
	  }, {
	    key: "afterSyncCompleted",
	    value: function () {
	      var _afterSyncCompleted = _asyncToGenerator( regeneratorRuntime.mark(function _callee6() {
	        var needsToUploadOTKs, promises;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                _context6.next = 2;
	                return this._e2eeAccount.generateOTKsIfNeeded(this._storage);
	              case 2:
	                needsToUploadOTKs = _context6.sent;
	                promises = [this._deviceMessageHandler.decryptPending(this.rooms)];
	                if (needsToUploadOTKs) {
	                  promises.push(this._e2eeAccount.uploadKeys(this._storage));
	                }
	                _context6.next = 7;
	                return Promise.all(promises);
	              case 7:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function afterSyncCompleted() {
	        return _afterSyncCompleted.apply(this, arguments);
	      }
	      return afterSyncCompleted;
	    }()
	  }, {
	    key: "isStarted",
	    get: function get() {
	      return this._sendScheduler.isStarted;
	    }
	  }, {
	    key: "rooms",
	    get: function get() {
	      return this._rooms;
	    }
	  }, {
	    key: "syncToken",
	    get: function get() {
	      var _this$_syncInfo;
	      return (_this$_syncInfo = this._syncInfo) === null || _this$_syncInfo === void 0 ? void 0 : _this$_syncInfo.token;
	    }
	  }, {
	    key: "syncFilterId",
	    get: function get() {
	      var _this$_syncInfo2;
	      return (_this$_syncInfo2 = this._syncInfo) === null || _this$_syncInfo2 === void 0 ? void 0 : _this$_syncInfo2.filterId;
	    }
	  }, {
	    key: "user",
	    get: function get() {
	      return this._user;
	    }
	  }]);
	  return Session;
	}();

	var LoadStatus = createEnum("NotLoading", "Login", "LoginFailed", "Loading", "SessionSetup",
	"Migrating",
	"FirstSync", "Error", "Ready");
	var LoginFailure = createEnum("Connection", "Credentials", "Unknown");
	var SessionContainer = function () {
	  function SessionContainer(_ref) {
	    var clock = _ref.clock,
	        random = _ref.random,
	        onlineStatus = _ref.onlineStatus,
	        request = _ref.request,
	        storageFactory = _ref.storageFactory,
	        sessionInfoStorage = _ref.sessionInfoStorage,
	        olmPromise = _ref.olmPromise,
	        workerPromise = _ref.workerPromise;
	    _classCallCheck(this, SessionContainer);
	    this._random = random;
	    this._clock = clock;
	    this._onlineStatus = onlineStatus;
	    this._request = request;
	    this._storageFactory = storageFactory;
	    this._sessionInfoStorage = sessionInfoStorage;
	    this._status = new ObservableValue(LoadStatus.NotLoading);
	    this._error = null;
	    this._loginFailure = null;
	    this._reconnector = null;
	    this._session = null;
	    this._sync = null;
	    this._sessionId = null;
	    this._storage = null;
	    this._olmPromise = olmPromise;
	    this._workerPromise = workerPromise;
	  }
	  _createClass(SessionContainer, [{
	    key: "createNewSessionId",
	    value: function createNewSessionId() {
	      return Math.floor(this._random() * Number.MAX_SAFE_INTEGER).toString();
	    }
	  }, {
	    key: "startWithExistingSession",
	    value: function () {
	      var _startWithExistingSession = _asyncToGenerator( regeneratorRuntime.mark(function _callee(sessionId) {
	        var sessionInfo;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!(this._status.get() !== LoadStatus.NotLoading)) {
	                  _context.next = 2;
	                  break;
	                }
	                return _context.abrupt("return");
	              case 2:
	                this._status.set(LoadStatus.Loading);
	                _context.prev = 3;
	                _context.next = 6;
	                return this._sessionInfoStorage.get(sessionId);
	              case 6:
	                sessionInfo = _context.sent;
	                if (sessionInfo) {
	                  _context.next = 9;
	                  break;
	                }
	                throw new Error("Invalid session id: " + sessionId);
	              case 9:
	                _context.next = 11;
	                return this._loadSessionInfo(sessionInfo, false);
	              case 11:
	                _context.next = 17;
	                break;
	              case 13:
	                _context.prev = 13;
	                _context.t0 = _context["catch"](3);
	                this._error = _context.t0;
	                this._status.set(LoadStatus.Error);
	              case 17:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[3, 13]]);
	      }));
	      function startWithExistingSession(_x) {
	        return _startWithExistingSession.apply(this, arguments);
	      }
	      return startWithExistingSession;
	    }()
	  }, {
	    key: "startWithLogin",
	    value: function () {
	      var _startWithLogin = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(homeServer, username, password) {
	        var sessionInfo, hsApi, loginData, sessionId;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!(this._status.get() !== LoadStatus.NotLoading)) {
	                  _context2.next = 2;
	                  break;
	                }
	                return _context2.abrupt("return");
	              case 2:
	                this._status.set(LoadStatus.Login);
	                _context2.prev = 3;
	                hsApi = new HomeServerApi({
	                  homeServer: homeServer,
	                  request: this._request,
	                  createTimeout: this._clock.createTimeout
	                });
	                _context2.next = 7;
	                return hsApi.passwordLogin(username, password, "Hydrogen").response();
	              case 7:
	                loginData = _context2.sent;
	                sessionId = this.createNewSessionId();
	                sessionInfo = {
	                  id: sessionId,
	                  deviceId: loginData.device_id,
	                  userId: loginData.user_id,
	                  homeServer: homeServer,
	                  accessToken: loginData.access_token,
	                  lastUsed: this._clock.now()
	                };
	                _context2.next = 12;
	                return this._sessionInfoStorage.add(sessionInfo);
	              case 12:
	                _context2.next = 19;
	                break;
	              case 14:
	                _context2.prev = 14;
	                _context2.t0 = _context2["catch"](3);
	                this._error = _context2.t0;
	                if (_context2.t0 instanceof HomeServerError) {
	                  if (_context2.t0.errcode === "M_FORBIDDEN") {
	                    this._loginFailure = LoginFailure.Credentials;
	                  } else {
	                    this._loginFailure = LoginFailure.Unknown;
	                  }
	                  this._status.set(LoadStatus.LoginFailed);
	                } else if (_context2.t0 instanceof ConnectionError) {
	                  this._loginFailure = LoginFailure.Connection;
	                  this._status.set(LoadStatus.LoginFailed);
	                } else {
	                  this._status.set(LoadStatus.Error);
	                }
	                return _context2.abrupt("return");
	              case 19:
	                _context2.prev = 19;
	                _context2.next = 22;
	                return this._loadSessionInfo(sessionInfo, true);
	              case 22:
	                _context2.next = 28;
	                break;
	              case 24:
	                _context2.prev = 24;
	                _context2.t1 = _context2["catch"](19);
	                this._error = _context2.t1;
	                this._status.set(LoadStatus.Error);
	              case 28:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[3, 14], [19, 24]]);
	      }));
	      function startWithLogin(_x2, _x3, _x4) {
	        return _startWithLogin.apply(this, arguments);
	      }
	      return startWithLogin;
	    }()
	  }, {
	    key: "_loadSessionInfo",
	    value: function () {
	      var _loadSessionInfo2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(sessionInfo, isNewLogin) {
	        var _this = this;
	        var hsApi, filteredSessionInfo, olm, workerPool, lastVersionsResponse;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                this._status.set(LoadStatus.Loading);
	                this._reconnector = new Reconnector({
	                  onlineStatus: this._onlineStatus,
	                  retryDelay: new ExponentialRetryDelay(this._clock.createTimeout),
	                  createMeasure: this._clock.createMeasure
	                });
	                hsApi = new HomeServerApi({
	                  homeServer: sessionInfo.homeServer,
	                  accessToken: sessionInfo.accessToken,
	                  request: this._request,
	                  reconnector: this._reconnector,
	                  createTimeout: this._clock.createTimeout
	                });
	                this._sessionId = sessionInfo.id;
	                _context3.next = 6;
	                return this._storageFactory.create(sessionInfo.id);
	              case 6:
	                this._storage = _context3.sent;
	                filteredSessionInfo = {
	                  deviceId: sessionInfo.deviceId,
	                  userId: sessionInfo.userId,
	                  homeServer: sessionInfo.homeServer
	                };
	                _context3.next = 10;
	                return this._olmPromise;
	              case 10:
	                olm = _context3.sent;
	                workerPool = null;
	                if (!this._workerPromise) {
	                  _context3.next = 16;
	                  break;
	                }
	                _context3.next = 15;
	                return this._workerPromise;
	              case 15:
	                workerPool = _context3.sent;
	              case 16:
	                this._session = new Session$1({
	                  storage: this._storage,
	                  sessionInfo: filteredSessionInfo,
	                  hsApi: hsApi,
	                  olm: olm,
	                  clock: this._clock,
	                  workerPool: workerPool
	                });
	                _context3.next = 19;
	                return this._session.load();
	              case 19:
	                this._status.set(LoadStatus.SessionSetup);
	                _context3.next = 22;
	                return this._session.beforeFirstSync(isNewLogin);
	              case 22:
	                this._sync = new Sync({
	                  hsApi: hsApi,
	                  storage: this._storage,
	                  session: this._session
	                });
	                this._reconnectSubscription = this._reconnector.connectionStatus.subscribe(function (state) {
	                  if (state === ConnectionStatus.Online) {
	                    _this._sync.start();
	                    _this._session.start(_this._reconnector.lastVersionsResponse);
	                  }
	                });
	                _context3.next = 26;
	                return this._waitForFirstSync();
	              case 26:
	                this._status.set(LoadStatus.Ready);
	                if (!this._session.isStarted) {
	                  _context3.next = 32;
	                  break;
	                }
	                _context3.next = 30;
	                return hsApi.versions({
	                  timeout: 10000
	                }).response();
	              case 30:
	                lastVersionsResponse = _context3.sent;
	                this._session.start(lastVersionsResponse);
	              case 32:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function _loadSessionInfo(_x5, _x6) {
	        return _loadSessionInfo2.apply(this, arguments);
	      }
	      return _loadSessionInfo;
	    }()
	  }, {
	    key: "_waitForFirstSync",
	    value: function () {
	      var _waitForFirstSync2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee4() {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.prev = 0;
	                this._sync.start();
	                this._status.set(LoadStatus.FirstSync);
	                _context4.next = 9;
	                break;
	              case 5:
	                _context4.prev = 5;
	                _context4.t0 = _context4["catch"](0);
	                if (_context4.t0 instanceof ConnectionError) {
	                  _context4.next = 9;
	                  break;
	                }
	                throw _context4.t0;
	              case 9:
	                this._waitForFirstSyncHandle = this._sync.status.waitFor(function (s) {
	                  return s === SyncStatus.Syncing || s === SyncStatus.Stopped;
	                });
	                _context4.prev = 10;
	                _context4.next = 13;
	                return this._waitForFirstSyncHandle.promise;
	              case 13:
	                if (!(this._sync.status.get() === SyncStatus.Stopped)) {
	                  _context4.next = 16;
	                  break;
	                }
	                if (!this._sync.error) {
	                  _context4.next = 16;
	                  break;
	                }
	                throw this._sync.error;
	              case 16:
	                _context4.next = 23;
	                break;
	              case 18:
	                _context4.prev = 18;
	                _context4.t1 = _context4["catch"](10);
	                if (!(_context4.t1 instanceof AbortError)) {
	                  _context4.next = 22;
	                  break;
	                }
	                return _context4.abrupt("return");
	              case 22:
	                throw _context4.t1;
	              case 23:
	                _context4.prev = 23;
	                this._waitForFirstSyncHandle = null;
	                return _context4.finish(23);
	              case 26:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this, [[0, 5], [10, 18, 23, 26]]);
	      }));
	      function _waitForFirstSync() {
	        return _waitForFirstSync2.apply(this, arguments);
	      }
	      return _waitForFirstSync;
	    }()
	  }, {
	    key: "stop",
	    value: function stop() {
	      if (this._reconnectSubscription) {
	        this._reconnectSubscription();
	        this._reconnectSubscription = null;
	      }
	      if (this._sync) {
	        this._sync.stop();
	      }
	      if (this._session) {
	        this._session.stop();
	      }
	      if (this._waitForFirstSyncHandle) {
	        this._waitForFirstSyncHandle.dispose();
	        this._waitForFirstSyncHandle = null;
	      }
	      if (this._storage) {
	        this._storage.close();
	        this._storage = null;
	      }
	    }
	  }, {
	    key: "deleteSession",
	    value: function () {
	      var _deleteSession = _asyncToGenerator( regeneratorRuntime.mark(function _callee5() {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!this._sessionId) {
	                  _context5.next = 4;
	                  break;
	                }
	                _context5.next = 3;
	                return Promise.all([this._storageFactory.delete(this._sessionId), this._sessionInfoStorage.delete(this._sessionId)]);
	              case 3:
	                this._sessionId = null;
	              case 4:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function deleteSession() {
	        return _deleteSession.apply(this, arguments);
	      }
	      return deleteSession;
	    }()
	  }, {
	    key: "loadStatus",
	    get: function get() {
	      return this._status;
	    }
	  }, {
	    key: "loadError",
	    get: function get() {
	      return this._error;
	    }
	  }, {
	    key: "sync",
	    get: function get() {
	      return this._sync;
	    }
	  }, {
	    key: "session",
	    get: function get() {
	      return this._session;
	    }
	  }, {
	    key: "reconnector",
	    get: function get() {
	      return this._reconnector;
	    }
	  }]);
	  return SessionContainer;
	}();

	var STORE_NAMES = Object.freeze(["session", "roomState", "roomSummary", "roomMembers", "timelineEvents", "timelineFragments", "pendingEvents", "userIdentities", "deviceIdentities", "olmSessions", "inboundGroupSessions", "outboundGroupSessions", "groupSessionDecryptions"]);
	var STORE_MAP = Object.freeze(STORE_NAMES.reduce(function (nameMap, name) {
	  nameMap[name] = name;
	  return nameMap;
	}, {}));
	var StorageError = function (_Error) {
	  _inherits(StorageError, _Error);
	  var _super = _createSuper(StorageError);
	  function StorageError(message, cause, value) {
	    var _this;
	    _classCallCheck(this, StorageError);
	    var fullMessage = message;
	    if (cause) {
	      fullMessage += ": ";
	      if (typeof cause.name === "string") {
	        fullMessage += "(name: ".concat(cause.name, ") ");
	      }
	      if (typeof cause.code === "number") {
	        fullMessage += "(code: ".concat(cause.code, ") ");
	      }
	    }
	    if (value) {
	      fullMessage += "(value: ".concat(JSON.stringify(value), ") ");
	    }
	    if (cause) {
	      fullMessage += cause.message;
	    }
	    _this = _super.call(this, fullMessage);
	    if (cause) {
	      _this.errcode = cause.name;
	    }
	    _this.cause = cause;
	    _this.value = value;
	    return _this;
	  }
	  _createClass(StorageError, [{
	    key: "name",
	    get: function get() {
	      return "StorageError";
	    }
	  }]);
	  return StorageError;
	}( _wrapNativeSuper(Error));

	var WrappedDOMException = function (_StorageError) {
	  _inherits(WrappedDOMException, _StorageError);
	  var _super = _createSuper(WrappedDOMException);
	  function WrappedDOMException(request) {
	    var _source$transaction, _source$transaction$d;
	    var _this;
	    _classCallCheck(this, WrappedDOMException);
	    var source = request === null || request === void 0 ? void 0 : request.source;
	    var storeName = (source === null || source === void 0 ? void 0 : source.name) || "<unknown store>";
	    var databaseName = (source === null || source === void 0 ? void 0 : (_source$transaction = source.transaction) === null || _source$transaction === void 0 ? void 0 : (_source$transaction$d = _source$transaction.db) === null || _source$transaction$d === void 0 ? void 0 : _source$transaction$d.name) || "<unknown db>";
	    _this = _super.call(this, "Failed IDBRequest on ".concat(databaseName, ".").concat(storeName), request.error);
	    _this.storeName = storeName;
	    _this.databaseName = databaseName;
	    return _this;
	  }
	  return WrappedDOMException;
	}(StorageError);
	function encodeUint32(n) {
	  var hex = n.toString(16);
	  return "0".repeat(8 - hex.length) + hex;
	}
	function decodeUint32(str) {
	  return parseInt(str, 16);
	}
	function openDatabase(name, createObjectStore, version) {
	  var req = window.indexedDB.open(name, version);
	  req.onupgradeneeded = function (ev) {
	    var db = ev.target.result;
	    var txn = ev.target.transaction;
	    var oldVersion = ev.oldVersion;
	    createObjectStore(db, txn, oldVersion, version);
	  };
	  return reqAsPromise(req);
	}
	function reqAsPromise(req) {
	  return new Promise(function (resolve, reject) {
	    req.addEventListener("success", function (event) {
	      return resolve(event.target.result);
	    });
	    req.addEventListener("error", function (event) {
	      return reject(new WrappedDOMException(event.target));
	    });
	  });
	}
	function txnAsPromise(txn) {
	  return new Promise(function (resolve, reject) {
	    txn.addEventListener("complete", resolve);
	    txn.addEventListener("abort", function (event) {
	      return reject(new WrappedDOMException(event.target));
	    });
	  });
	}
	function iterateCursor(cursorRequest, processValue) {
	  return new Promise(function (resolve, reject) {
	    cursorRequest.onerror = function () {
	      reject(new StorageError("Query failed", cursorRequest.error));
	    };
	    cursorRequest.onsuccess = function (event) {
	      var cursor = event.target.result;
	      if (!cursor) {
	        resolve(false);
	        return;
	      }
	      var result = processValue(cursor.value, cursor.key);
	      var done = result === null || result === void 0 ? void 0 : result.done;
	      var jumpTo = result === null || result === void 0 ? void 0 : result.jumpTo;
	      if (done) {
	        resolve(true);
	      } else if (jumpTo) {
	        cursor.continue(jumpTo);
	      } else {
	        cursor.continue();
	      }
	    };
	  }).catch(function (err) {
	    throw new StorageError("iterateCursor failed", err);
	  });
	}

	var QueryTarget = function () {
	  function QueryTarget(target) {
	    _classCallCheck(this, QueryTarget);
	    this._target = target;
	  }
	  _createClass(QueryTarget, [{
	    key: "_openCursor",
	    value: function _openCursor(range, direction) {
	      if (range && direction) {
	        return this._target.openCursor(range, direction);
	      } else if (range) {
	        return this._target.openCursor(range);
	      } else if (direction) {
	        return this._target.openCursor(null, direction);
	      } else {
	        return this._target.openCursor();
	      }
	    }
	  }, {
	    key: "supports",
	    value: function supports(methodName) {
	      return this._target.supports(methodName);
	    }
	  }, {
	    key: "get",
	    value: function get(key) {
	      return reqAsPromise(this._target.get(key));
	    }
	  }, {
	    key: "getKey",
	    value: function getKey(key) {
	      var _this = this;
	      if (this._target.supports("getKey")) {
	        return reqAsPromise(this._target.getKey(key));
	      } else {
	        return reqAsPromise(this._target.get(key)).then(function (value) {
	          if (value) {
	            return value[_this._target.keyPath];
	          }
	        });
	      }
	    }
	  }, {
	    key: "reduce",
	    value: function reduce(range, reducer, initialValue) {
	      return this._reduce(range, reducer, initialValue, "next");
	    }
	  }, {
	    key: "reduceReverse",
	    value: function reduceReverse(range, reducer, initialValue) {
	      return this._reduce(range, reducer, initialValue, "prev");
	    }
	  }, {
	    key: "selectLimit",
	    value: function selectLimit(range, amount) {
	      return this._selectLimit(range, amount, "next");
	    }
	  }, {
	    key: "selectLimitReverse",
	    value: function selectLimitReverse(range, amount) {
	      return this._selectLimit(range, amount, "prev");
	    }
	  }, {
	    key: "selectWhile",
	    value: function selectWhile(range, predicate) {
	      return this._selectWhile(range, predicate, "next");
	    }
	  }, {
	    key: "selectWhileReverse",
	    value: function selectWhileReverse(range, predicate) {
	      return this._selectWhile(range, predicate, "prev");
	    }
	  }, {
	    key: "selectAll",
	    value: function () {
	      var _selectAll = _asyncToGenerator( regeneratorRuntime.mark(function _callee(range, direction) {
	        var cursor, results;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                cursor = this._openCursor(range, direction);
	                results = [];
	                _context.next = 4;
	                return iterateCursor(cursor, function (value) {
	                  results.push(value);
	                  return {
	                    done: false
	                  };
	                });
	              case 4:
	                return _context.abrupt("return", results);
	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function selectAll(_x, _x2) {
	        return _selectAll.apply(this, arguments);
	      }
	      return selectAll;
	    }()
	  }, {
	    key: "selectFirst",
	    value: function selectFirst(range) {
	      return this._find(range, function () {
	        return true;
	      }, "next");
	    }
	  }, {
	    key: "selectLast",
	    value: function selectLast(range) {
	      return this._find(range, function () {
	        return true;
	      }, "prev");
	    }
	  }, {
	    key: "find",
	    value: function find(range, predicate) {
	      return this._find(range, predicate, "next");
	    }
	  }, {
	    key: "findReverse",
	    value: function findReverse(range, predicate) {
	      return this._find(range, predicate, "prev");
	    }
	  }, {
	    key: "findMaxKey",
	    value: function () {
	      var _findMaxKey = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(range) {
	        var cursor, maxKey;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                cursor = this._target.openKeyCursor(range, "prev");
	                _context2.next = 3;
	                return iterateCursor(cursor, function (_, key) {
	                  maxKey = key;
	                  return {
	                    done: true
	                  };
	                });
	              case 3:
	                return _context2.abrupt("return", maxKey);
	              case 4:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function findMaxKey(_x3) {
	        return _findMaxKey.apply(this, arguments);
	      }
	      return findMaxKey;
	    }()
	  }, {
	    key: "iterateKeys",
	    value: function () {
	      var _iterateKeys = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(range, callback) {
	        var cursor;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                cursor = this._target.openKeyCursor(range, "next");
	                _context3.next = 3;
	                return iterateCursor(cursor, function (_, key) {
	                  return {
	                    done: callback(key)
	                  };
	                });
	              case 3:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function iterateKeys(_x4, _x5) {
	        return _iterateKeys.apply(this, arguments);
	      }
	      return iterateKeys;
	    }()
	  }, {
	    key: "findExistingKeys",
	    value: function () {
	      var _findExistingKeys = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(keys, backwards, callback) {
	        var direction, compareKeys, sortedKeys, firstKey, lastKey, cursor, i, consumerDone;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                direction = backwards ? "prev" : "next";
	                compareKeys = function compareKeys(a, b) {
	                  return backwards ? -indexedDB.cmp(a, b) : indexedDB.cmp(a, b);
	                };
	                sortedKeys = keys.slice().sort(compareKeys);
	                firstKey = backwards ? sortedKeys[sortedKeys.length - 1] : sortedKeys[0];
	                lastKey = backwards ? sortedKeys[0] : sortedKeys[sortedKeys.length - 1];
	                cursor = this._target.openKeyCursor(IDBKeyRange.bound(firstKey, lastKey), direction);
	                i = 0;
	                consumerDone = false;
	                _context4.next = 10;
	                return iterateCursor(cursor, function (value, key) {
	                  while (i < sortedKeys.length && compareKeys(sortedKeys[i], key) < 0 && !consumerDone) {
	                    consumerDone = callback(sortedKeys[i], false);
	                    ++i;
	                  }
	                  if (i < sortedKeys.length && compareKeys(sortedKeys[i], key) === 0 && !consumerDone) {
	                    consumerDone = callback(sortedKeys[i], true);
	                    ++i;
	                  }
	                  var done = consumerDone || i >= sortedKeys.length;
	                  var jumpTo = !done && sortedKeys[i];
	                  return {
	                    done: done,
	                    jumpTo: jumpTo
	                  };
	                });
	              case 10:
	                while (!consumerDone && i < sortedKeys.length) {
	                  consumerDone = callback(sortedKeys[i], false);
	                  ++i;
	                }
	              case 11:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function findExistingKeys(_x6, _x7, _x8) {
	        return _findExistingKeys.apply(this, arguments);
	      }
	      return findExistingKeys;
	    }()
	  }, {
	    key: "_reduce",
	    value: function _reduce(range, reducer, initialValue, direction) {
	      var reducedValue = initialValue;
	      var cursor = this._openCursor(range, direction);
	      return iterateCursor(cursor, function (value) {
	        reducedValue = reducer(reducedValue, value);
	        return {
	          done: false
	        };
	      });
	    }
	  }, {
	    key: "_selectLimit",
	    value: function _selectLimit(range, amount, direction) {
	      return this._selectUntil(range, function (results) {
	        return results.length === amount;
	      }, direction);
	    }
	  }, {
	    key: "_selectUntil",
	    value: function () {
	      var _selectUntil2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(range, predicate, direction) {
	        var cursor, results;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                cursor = this._openCursor(range, direction);
	                results = [];
	                _context5.next = 4;
	                return iterateCursor(cursor, function (value) {
	                  results.push(value);
	                  return {
	                    done: predicate(results, value)
	                  };
	                });
	              case 4:
	                return _context5.abrupt("return", results);
	              case 5:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function _selectUntil(_x9, _x10, _x11) {
	        return _selectUntil2.apply(this, arguments);
	      }
	      return _selectUntil;
	    }()
	  }, {
	    key: "_selectWhile",
	    value: function () {
	      var _selectWhile2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(range, predicate, direction) {
	        var cursor, results;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                cursor = this._openCursor(range, direction);
	                results = [];
	                _context6.next = 4;
	                return iterateCursor(cursor, function (value) {
	                  var passesPredicate = predicate(value);
	                  if (passesPredicate) {
	                    results.push(value);
	                  }
	                  return {
	                    done: !passesPredicate
	                  };
	                });
	              case 4:
	                return _context6.abrupt("return", results);
	              case 5:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function _selectWhile(_x12, _x13, _x14) {
	        return _selectWhile2.apply(this, arguments);
	      }
	      return _selectWhile;
	    }()
	  }, {
	    key: "iterateWhile",
	    value: function () {
	      var _iterateWhile = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(range, predicate) {
	        var cursor;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                cursor = this._openCursor(range, "next");
	                _context7.next = 3;
	                return iterateCursor(cursor, function (value) {
	                  var passesPredicate = predicate(value);
	                  return {
	                    done: !passesPredicate
	                  };
	                });
	              case 3:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));
	      function iterateWhile(_x15, _x16) {
	        return _iterateWhile.apply(this, arguments);
	      }
	      return iterateWhile;
	    }()
	  }, {
	    key: "_find",
	    value: function () {
	      var _find2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(range, predicate, direction) {
	        var cursor, result, found;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                cursor = this._openCursor(range, direction);
	                _context8.next = 3;
	                return iterateCursor(cursor, function (value) {
	                  var found = predicate(value);
	                  if (found) {
	                    result = value;
	                  }
	                  return {
	                    done: found
	                  };
	                });
	              case 3:
	                found = _context8.sent;
	                if (!found) {
	                  _context8.next = 6;
	                  break;
	                }
	                return _context8.abrupt("return", result);
	              case 6:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));
	      function _find(_x17, _x18, _x19) {
	        return _find2.apply(this, arguments);
	      }
	      return _find;
	    }()
	  }]);
	  return QueryTarget;
	}();

	var QueryTargetWrapper = function () {
	  function QueryTargetWrapper(qt) {
	    _classCallCheck(this, QueryTargetWrapper);
	    this._qt = qt;
	  }
	  _createClass(QueryTargetWrapper, [{
	    key: "supports",
	    value: function supports(methodName) {
	      return !!this._qt[methodName];
	    }
	  }, {
	    key: "openKeyCursor",
	    value: function openKeyCursor() {
	      if (!this._qt.openKeyCursor) {
	        return this.openCursor.apply(this, arguments);
	      }
	      try {
	        var _this$_qt;
	        return (_this$_qt = this._qt).openKeyCursor.apply(_this$_qt, arguments);
	      } catch (err) {
	        throw new StorageError("openKeyCursor failed", err);
	      }
	    }
	  }, {
	    key: "openCursor",
	    value: function openCursor() {
	      try {
	        var _this$_qt2;
	        return (_this$_qt2 = this._qt).openCursor.apply(_this$_qt2, arguments);
	      } catch (err) {
	        throw new StorageError("openCursor failed", err);
	      }
	    }
	  }, {
	    key: "put",
	    value: function put() {
	      try {
	        var _this$_qt3;
	        return (_this$_qt3 = this._qt).put.apply(_this$_qt3, arguments);
	      } catch (err) {
	        throw new StorageError("put failed", err);
	      }
	    }
	  }, {
	    key: "add",
	    value: function add() {
	      try {
	        var _this$_qt4;
	        return (_this$_qt4 = this._qt).add.apply(_this$_qt4, arguments);
	      } catch (err) {
	        throw new StorageError("add failed", err);
	      }
	    }
	  }, {
	    key: "get",
	    value: function get() {
	      try {
	        var _this$_qt5;
	        return (_this$_qt5 = this._qt).get.apply(_this$_qt5, arguments);
	      } catch (err) {
	        throw new StorageError("get failed", err);
	      }
	    }
	  }, {
	    key: "getKey",
	    value: function getKey() {
	      try {
	        var _this$_qt6;
	        return (_this$_qt6 = this._qt).getKey.apply(_this$_qt6, arguments);
	      } catch (err) {
	        throw new StorageError("getKey failed", err);
	      }
	    }
	  }, {
	    key: "delete",
	    value: function _delete() {
	      try {
	        var _this$_qt7;
	        return (_this$_qt7 = this._qt).delete.apply(_this$_qt7, arguments);
	      } catch (err) {
	        throw new StorageError("delete failed", err);
	      }
	    }
	  }, {
	    key: "index",
	    value: function index() {
	      try {
	        var _this$_qt8;
	        return (_this$_qt8 = this._qt).index.apply(_this$_qt8, arguments);
	      } catch (err) {
	        throw new StorageError("index failed", err);
	      }
	    }
	  }, {
	    key: "keyPath",
	    get: function get() {
	      if (this._qt.objectStore) {
	        return this._qt.objectStore.keyPath;
	      } else {
	        return this._qt.keyPath;
	      }
	    }
	  }]);
	  return QueryTargetWrapper;
	}();
	var Store = function (_QueryTarget) {
	  _inherits(Store, _QueryTarget);
	  var _super = _createSuper(Store);
	  function Store(idbStore) {
	    _classCallCheck(this, Store);
	    return _super.call(this, new QueryTargetWrapper(idbStore));
	  }
	  _createClass(Store, [{
	    key: "index",
	    value: function index(indexName) {
	      return new QueryTarget(new QueryTargetWrapper(this._idbStore.index(indexName)));
	    }
	  }, {
	    key: "put",
	    value: function () {
	      var _put = _asyncToGenerator( regeneratorRuntime.mark(function _callee(value) {
	        var originalErr;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.prev = 0;
	                _context.next = 3;
	                return reqAsPromise(this._idbStore.put(value));
	              case 3:
	                return _context.abrupt("return", _context.sent);
	              case 6:
	                _context.prev = 6;
	                _context.t0 = _context["catch"](0);
	                originalErr = _context.t0.cause;
	                throw new StorageError("put on ".concat(_context.t0.databaseName, ".").concat(_context.t0.storeName, " failed"), originalErr, value);
	              case 10:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[0, 6]]);
	      }));
	      function put(_x) {
	        return _put.apply(this, arguments);
	      }
	      return put;
	    }()
	  }, {
	    key: "add",
	    value: function () {
	      var _add = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(value) {
	        var originalErr;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.prev = 0;
	                _context2.next = 3;
	                return reqAsPromise(this._idbStore.add(value));
	              case 3:
	                return _context2.abrupt("return", _context2.sent);
	              case 6:
	                _context2.prev = 6;
	                _context2.t0 = _context2["catch"](0);
	                originalErr = _context2.t0.cause;
	                throw new StorageError("add on ".concat(_context2.t0.databaseName, ".").concat(_context2.t0.storeName, " failed"), originalErr, value);
	              case 10:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[0, 6]]);
	      }));
	      function add(_x2) {
	        return _add.apply(this, arguments);
	      }
	      return add;
	    }()
	  }, {
	    key: "delete",
	    value: function () {
	      var _delete2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(keyOrKeyRange) {
	        var originalErr;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.prev = 0;
	                _context3.next = 3;
	                return reqAsPromise(this._idbStore.delete(keyOrKeyRange));
	              case 3:
	                return _context3.abrupt("return", _context3.sent);
	              case 6:
	                _context3.prev = 6;
	                _context3.t0 = _context3["catch"](0);
	                originalErr = _context3.t0.cause;
	                throw new StorageError("delete on ".concat(_context3.t0.databaseName, ".").concat(_context3.t0.storeName, " failed"), originalErr, keyOrKeyRange);
	              case 10:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[0, 6]]);
	      }));
	      function _delete(_x3) {
	        return _delete2.apply(this, arguments);
	      }
	      return _delete;
	    }()
	  }, {
	    key: "_idbStore",
	    get: function get() {
	      return this._target;
	    }
	  }]);
	  return Store;
	}(QueryTarget);

	var SessionStore = function () {
	  function SessionStore(sessionStore) {
	    _classCallCheck(this, SessionStore);
	    this._sessionStore = sessionStore;
	  }
	  _createClass(SessionStore, [{
	    key: "get",
	    value: function () {
	      var _get = _asyncToGenerator( regeneratorRuntime.mark(function _callee(key) {
	        var entry;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this._sessionStore.get(key);
	              case 2:
	                entry = _context.sent;
	                if (!entry) {
	                  _context.next = 5;
	                  break;
	                }
	                return _context.abrupt("return", entry.value);
	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function get(_x) {
	        return _get.apply(this, arguments);
	      }
	      return get;
	    }()
	  }, {
	    key: "set",
	    value: function set(key, value) {
	      return this._sessionStore.put({
	        key: key,
	        value: value
	      });
	    }
	  }, {
	    key: "add",
	    value: function add(key, value) {
	      return this._sessionStore.add({
	        key: key,
	        value: value
	      });
	    }
	  }, {
	    key: "remove",
	    value: function remove(key) {
	      this._sessionStore.delete(key);
	    }
	  }]);
	  return SessionStore;
	}();

	var RoomSummaryStore = function () {
	  function RoomSummaryStore(summaryStore) {
	    _classCallCheck(this, RoomSummaryStore);
	    this._summaryStore = summaryStore;
	  }
	  _createClass(RoomSummaryStore, [{
	    key: "getAll",
	    value: function getAll() {
	      return this._summaryStore.selectAll();
	    }
	  }, {
	    key: "set",
	    value: function set(summary) {
	      return this._summaryStore.put(summary);
	    }
	  }]);
	  return RoomSummaryStore;
	}();

	function encodeKey(roomId, fragmentId, eventIndex) {
	  return "".concat(roomId, "|").concat(encodeUint32(fragmentId), "|").concat(encodeUint32(eventIndex));
	}
	function encodeEventIdKey(roomId, eventId) {
	  return "".concat(roomId, "|").concat(eventId);
	}
	function decodeEventIdKey(eventIdKey) {
	  var _eventIdKey$split = eventIdKey.split("|"),
	      _eventIdKey$split2 = _slicedToArray(_eventIdKey$split, 2),
	      roomId = _eventIdKey$split2[0],
	      eventId = _eventIdKey$split2[1];
	  return {
	    roomId: roomId,
	    eventId: eventId
	  };
	}
	var Range = function () {
	  function Range(only, lower, upper, lowerOpen, upperOpen) {
	    _classCallCheck(this, Range);
	    this._only = only;
	    this._lower = lower;
	    this._upper = upper;
	    this._lowerOpen = lowerOpen;
	    this._upperOpen = upperOpen;
	  }
	  _createClass(Range, [{
	    key: "asIDBKeyRange",
	    value: function asIDBKeyRange(roomId) {
	      try {
	        if (this._only) {
	          return IDBKeyRange.only(encodeKey(roomId, this._only.fragmentId, this._only.eventIndex));
	        }
	        if (this._lower && !this._upper) {
	          return IDBKeyRange.bound(encodeKey(roomId, this._lower.fragmentId, this._lower.eventIndex), encodeKey(roomId, this._lower.fragmentId, WebPlatform.maxStorageKey), this._lowerOpen, false);
	        }
	        if (!this._lower && this._upper) {
	          return IDBKeyRange.bound(encodeKey(roomId, this._upper.fragmentId, WebPlatform.minStorageKey), encodeKey(roomId, this._upper.fragmentId, this._upper.eventIndex), false, this._upperOpen);
	        }
	        if (this._lower && this._upper) {
	          return IDBKeyRange.bound(encodeKey(roomId, this._lower.fragmentId, this._lower.eventIndex), encodeKey(roomId, this._upper.fragmentId, this._upper.eventIndex), this._lowerOpen, this._upperOpen);
	        }
	      } catch (err) {
	        throw new StorageError("IDBKeyRange failed with data: " + JSON.stringify(this), err);
	      }
	    }
	  }]);
	  return Range;
	}();
	var TimelineEventStore = function () {
	  function TimelineEventStore(timelineStore) {
	    _classCallCheck(this, TimelineEventStore);
	    this._timelineStore = timelineStore;
	  }
	  _createClass(TimelineEventStore, [{
	    key: "onlyRange",
	    value: function onlyRange(eventKey) {
	      return new Range(eventKey);
	    }
	  }, {
	    key: "upperBoundRange",
	    value: function upperBoundRange(eventKey) {
	      var open = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      return new Range(undefined, undefined, eventKey, undefined, open);
	    }
	  }, {
	    key: "lowerBoundRange",
	    value: function lowerBoundRange(eventKey) {
	      var open = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      return new Range(undefined, eventKey, undefined, open);
	    }
	  }, {
	    key: "boundRange",
	    value: function boundRange(lower, upper) {
	      var lowerOpen = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	      var upperOpen = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
	      return new Range(undefined, lower, upper, lowerOpen, upperOpen);
	    }
	  }, {
	    key: "lastEvents",
	    value: function () {
	      var _lastEvents = _asyncToGenerator( regeneratorRuntime.mark(function _callee(roomId, fragmentId, amount) {
	        var eventKey;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                eventKey = EventKey.maxKey;
	                eventKey.fragmentId = fragmentId;
	                return _context.abrupt("return", this.eventsBefore(roomId, eventKey, amount));
	              case 3:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function lastEvents(_x, _x2, _x3) {
	        return _lastEvents.apply(this, arguments);
	      }
	      return lastEvents;
	    }()
	  }, {
	    key: "firstEvents",
	    value: function () {
	      var _firstEvents = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(roomId, fragmentId, amount) {
	        var eventKey;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                eventKey = EventKey.minKey;
	                eventKey.fragmentId = fragmentId;
	                return _context2.abrupt("return", this.eventsAfter(roomId, eventKey, amount));
	              case 3:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function firstEvents(_x4, _x5, _x6) {
	        return _firstEvents.apply(this, arguments);
	      }
	      return firstEvents;
	    }()
	  }, {
	    key: "eventsAfter",
	    value: function eventsAfter(roomId, eventKey, amount) {
	      var idbRange = this.lowerBoundRange(eventKey, true).asIDBKeyRange(roomId);
	      return this._timelineStore.selectLimit(idbRange, amount);
	    }
	  }, {
	    key: "eventsBefore",
	    value: function () {
	      var _eventsBefore = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomId, eventKey, amount) {
	        var range, events;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                range = this.upperBoundRange(eventKey, true).asIDBKeyRange(roomId);
	                _context3.next = 3;
	                return this._timelineStore.selectLimitReverse(range, amount);
	              case 3:
	                events = _context3.sent;
	                events.reverse();
	                return _context3.abrupt("return", events);
	              case 6:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function eventsBefore(_x7, _x8, _x9) {
	        return _eventsBefore.apply(this, arguments);
	      }
	      return eventsBefore;
	    }()
	  }, {
	    key: "findFirstOccurringEventId",
	    value: function () {
	      var _findFirstOccurringEventId = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(roomId, eventIds) {
	        var byEventId, keys, results, firstFoundKey, firstFoundAndPrecedingResolved;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                firstFoundAndPrecedingResolved = function _firstFoundAndPrecedi() {
	                  for (var i = 0; i < results.length; ++i) {
	                    if (results[i] === undefined) {
	                      return;
	                    } else if (results[i] === true) {
	                      return keys[i];
	                    }
	                  }
	                };
	                byEventId = this._timelineStore.index("byEventId");
	                keys = eventIds.map(function (eventId) {
	                  return encodeEventIdKey(roomId, eventId);
	                });
	                results = new Array(keys.length);
	                _context4.next = 6;
	                return byEventId.findExistingKeys(keys, false, function (key, found) {
	                  var index = keys.indexOf(key);
	                  results[index] = found;
	                  firstFoundKey = firstFoundAndPrecedingResolved();
	                  return !!firstFoundKey;
	                });
	              case 6:
	                return _context4.abrupt("return", firstFoundKey && decodeEventIdKey(firstFoundKey).eventId);
	              case 7:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function findFirstOccurringEventId(_x10, _x11) {
	        return _findFirstOccurringEventId.apply(this, arguments);
	      }
	      return findFirstOccurringEventId;
	    }()
	  }, {
	    key: "insert",
	    value: function insert(entry) {
	      entry.key = encodeKey(entry.roomId, entry.fragmentId, entry.eventIndex);
	      entry.eventIdKey = encodeEventIdKey(entry.roomId, entry.event.event_id);
	      return this._timelineStore.add(entry);
	    }
	  }, {
	    key: "update",
	    value: function update(entry) {
	      return this._timelineStore.put(entry);
	    }
	  }, {
	    key: "get",
	    value: function get(roomId, eventKey) {
	      return this._timelineStore.get(encodeKey(roomId, eventKey.fragmentId, eventKey.eventIndex));
	    }
	  }, {
	    key: "removeRange",
	    value: function removeRange(roomId, range) {
	      return this._timelineStore.delete(range.asIDBKeyRange(roomId));
	    }
	  }, {
	    key: "getByEventId",
	    value: function getByEventId(roomId, eventId) {
	      return this._timelineStore.index("byEventId").get(encodeEventIdKey(roomId, eventId));
	    }
	  }]);
	  return TimelineEventStore;
	}();

	var RoomStateStore = function () {
	  function RoomStateStore(idbStore) {
	    _classCallCheck(this, RoomStateStore);
	    this._roomStateStore = idbStore;
	  }
	  _createClass(RoomStateStore, [{
	    key: "getAllForType",
	    value: function () {
	      var _getAllForType = _asyncToGenerator( regeneratorRuntime.mark(function _callee(type) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));
	      function getAllForType(_x) {
	        return _getAllForType.apply(this, arguments);
	      }
	      return getAllForType;
	    }()
	  }, {
	    key: "get",
	    value: function () {
	      var _get = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(type, stateKey) {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function get(_x2, _x3) {
	        return _get.apply(this, arguments);
	      }
	      return get;
	    }()
	  }, {
	    key: "set",
	    value: function () {
	      var _set = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomId, event) {
	        var key, entry;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                key = "".concat(roomId, "|").concat(event.type, "|").concat(event.state_key);
	                entry = {
	                  roomId: roomId,
	                  event: event,
	                  key: key
	                };
	                return _context3.abrupt("return", this._roomStateStore.put(entry));
	              case 3:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function set(_x4, _x5) {
	        return _set.apply(this, arguments);
	      }
	      return set;
	    }()
	  }]);
	  return RoomStateStore;
	}();

	function encodeKey$1(roomId, userId) {
	  return "".concat(roomId, "|").concat(userId);
	}
	function decodeKey(key) {
	  var _key$split = key.split("|"),
	      _key$split2 = _slicedToArray(_key$split, 2),
	      roomId = _key$split2[0],
	      userId = _key$split2[1];
	  return {
	    roomId: roomId,
	    userId: userId
	  };
	}
	var RoomMemberStore = function () {
	  function RoomMemberStore(roomMembersStore) {
	    _classCallCheck(this, RoomMemberStore);
	    this._roomMembersStore = roomMembersStore;
	  }
	  _createClass(RoomMemberStore, [{
	    key: "get",
	    value: function get(roomId, userId) {
	      return this._roomMembersStore.get(encodeKey$1(roomId, userId));
	    }
	  }, {
	    key: "set",
	    value: function () {
	      var _set = _asyncToGenerator( regeneratorRuntime.mark(function _callee(member) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                member.key = encodeKey$1(member.roomId, member.userId);
	                return _context.abrupt("return", this._roomMembersStore.put(member));
	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function set(_x) {
	        return _set.apply(this, arguments);
	      }
	      return set;
	    }()
	  }, {
	    key: "getAll",
	    value: function getAll(roomId) {
	      var range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
	      return this._roomMembersStore.selectWhile(range, function (member) {
	        return member.roomId === roomId;
	      });
	    }
	  }, {
	    key: "getAllUserIds",
	    value: function () {
	      var _getAllUserIds = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(roomId) {
	        var userIds, range;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                userIds = [];
	                range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
	                _context2.next = 4;
	                return this._roomMembersStore.iterateKeys(range, function (key) {
	                  var decodedKey = decodeKey(key);
	                  if (decodedKey.roomId === roomId) {
	                    userIds.push(decodedKey.userId);
	                    return false;
	                  }
	                  return true;
	                });
	              case 4:
	                return _context2.abrupt("return", userIds);
	              case 5:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function getAllUserIds(_x2) {
	        return _getAllUserIds.apply(this, arguments);
	      }
	      return getAllUserIds;
	    }()
	  }, {
	    key: "getUserIdsNeedingRoomKey",
	    value: function () {
	      var _getUserIdsNeedingRoomKey = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(roomId) {
	        var userIds, range;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                userIds = [];
	                range = IDBKeyRange.lowerBound(encodeKey$1(roomId, ""));
	                _context3.next = 4;
	                return this._roomMembersStore.iterateWhile(range, function (member) {
	                  if (member.roomId !== roomId) {
	                    return false;
	                  }
	                  if (member.needsRoomKey) {
	                    userIds.push(member.userId);
	                  }
	                  return true;
	                });
	              case 4:
	                return _context3.abrupt("return", userIds);
	              case 5:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function getUserIdsNeedingRoomKey(_x3) {
	        return _getUserIdsNeedingRoomKey.apply(this, arguments);
	      }
	      return getUserIdsNeedingRoomKey;
	    }()
	  }]);
	  return RoomMemberStore;
	}();

	function encodeKey$2(roomId, fragmentId) {
	  return "".concat(roomId, "|").concat(encodeUint32(fragmentId));
	}
	var TimelineFragmentStore = function () {
	  function TimelineFragmentStore(store) {
	    _classCallCheck(this, TimelineFragmentStore);
	    this._store = store;
	  }
	  _createClass(TimelineFragmentStore, [{
	    key: "_allRange",
	    value: function _allRange(roomId) {
	      try {
	        return IDBKeyRange.bound(encodeKey$2(roomId, WebPlatform.minStorageKey), encodeKey$2(roomId, WebPlatform.maxStorageKey));
	      } catch (err) {
	        throw new StorageError("error from IDBKeyRange with roomId ".concat(roomId), err);
	      }
	    }
	  }, {
	    key: "all",
	    value: function all(roomId) {
	      return this._store.selectAll(this._allRange(roomId));
	    }
	  }, {
	    key: "liveFragment",
	    value: function liveFragment(roomId) {
	      return this._store.findReverse(this._allRange(roomId), function (fragment) {
	        return typeof fragment.nextId !== "number" && typeof fragment.nextToken !== "string";
	      });
	    }
	  }, {
	    key: "add",
	    value: function add(fragment) {
	      fragment.key = encodeKey$2(fragment.roomId, fragment.id);
	      return this._store.add(fragment);
	    }
	  }, {
	    key: "update",
	    value: function update(fragment) {
	      return this._store.put(fragment);
	    }
	  }, {
	    key: "get",
	    value: function get(roomId, fragmentId) {
	      return this._store.get(encodeKey$2(roomId, fragmentId));
	    }
	  }]);
	  return TimelineFragmentStore;
	}();

	function encodeKey$3(roomId, queueIndex) {
	  return "".concat(roomId, "|").concat(encodeUint32(queueIndex));
	}
	function decodeKey$1(key) {
	  var _key$split = key.split("|"),
	      _key$split2 = _slicedToArray(_key$split, 2),
	      roomId = _key$split2[0],
	      encodedQueueIndex = _key$split2[1];
	  var queueIndex = decodeUint32(encodedQueueIndex);
	  return {
	    roomId: roomId,
	    queueIndex: queueIndex
	  };
	}
	var PendingEventStore = function () {
	  function PendingEventStore(eventStore) {
	    _classCallCheck(this, PendingEventStore);
	    this._eventStore = eventStore;
	  }
	  _createClass(PendingEventStore, [{
	    key: "getMaxQueueIndex",
	    value: function () {
	      var _getMaxQueueIndex = _asyncToGenerator( regeneratorRuntime.mark(function _callee(roomId) {
	        var range, maxKey;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                range = IDBKeyRange.bound(encodeKey$3(roomId, WebPlatform.minStorageKey), encodeKey$3(roomId, WebPlatform.maxStorageKey), false, false);
	                _context.next = 3;
	                return this._eventStore.findMaxKey(range);
	              case 3:
	                maxKey = _context.sent;
	                if (!maxKey) {
	                  _context.next = 6;
	                  break;
	                }
	                return _context.abrupt("return", decodeKey$1(maxKey).queueIndex);
	              case 6:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function getMaxQueueIndex(_x) {
	        return _getMaxQueueIndex.apply(this, arguments);
	      }
	      return getMaxQueueIndex;
	    }()
	  }, {
	    key: "remove",
	    value: function remove(roomId, queueIndex) {
	      var keyRange = IDBKeyRange.only(encodeKey$3(roomId, queueIndex));
	      this._eventStore.delete(keyRange);
	    }
	  }, {
	    key: "exists",
	    value: function () {
	      var _exists = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(roomId, queueIndex) {
	        var keyRange, key;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                keyRange = IDBKeyRange.only(encodeKey$3(roomId, queueIndex));
	                _context2.next = 3;
	                return this._eventStore.getKey(keyRange);
	              case 3:
	                key = _context2.sent;
	                return _context2.abrupt("return", !!key);
	              case 5:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function exists(_x2, _x3) {
	        return _exists.apply(this, arguments);
	      }
	      return exists;
	    }()
	  }, {
	    key: "add",
	    value: function add(pendingEvent) {
	      pendingEvent.key = encodeKey$3(pendingEvent.roomId, pendingEvent.queueIndex);
	      return this._eventStore.add(pendingEvent);
	    }
	  }, {
	    key: "update",
	    value: function update(pendingEvent) {
	      return this._eventStore.put(pendingEvent);
	    }
	  }, {
	    key: "getAll",
	    value: function getAll() {
	      return this._eventStore.selectAll();
	    }
	  }]);
	  return PendingEventStore;
	}();

	var UserIdentityStore = function () {
	  function UserIdentityStore(store) {
	    _classCallCheck(this, UserIdentityStore);
	    this._store = store;
	  }
	  _createClass(UserIdentityStore, [{
	    key: "get",
	    value: function get(userId) {
	      return this._store.get(userId);
	    }
	  }, {
	    key: "set",
	    value: function set(userIdentity) {
	      this._store.put(userIdentity);
	    }
	  }, {
	    key: "remove",
	    value: function remove(userId) {
	      return this._store.delete(userId);
	    }
	  }]);
	  return UserIdentityStore;
	}();

	function encodeKey$4(userId, deviceId) {
	  return "".concat(userId, "|").concat(deviceId);
	}
	var DeviceIdentityStore = function () {
	  function DeviceIdentityStore(store) {
	    _classCallCheck(this, DeviceIdentityStore);
	    this._store = store;
	  }
	  _createClass(DeviceIdentityStore, [{
	    key: "getAllForUserId",
	    value: function getAllForUserId(userId) {
	      var range = IDBKeyRange.lowerBound(encodeKey$4(userId, ""));
	      return this._store.selectWhile(range, function (device) {
	        return device.userId === userId;
	      });
	    }
	  }, {
	    key: "get",
	    value: function get(userId, deviceId) {
	      return this._store.get(encodeKey$4(userId, deviceId));
	    }
	  }, {
	    key: "set",
	    value: function set(deviceIdentity) {
	      deviceIdentity.key = encodeKey$4(deviceIdentity.userId, deviceIdentity.deviceId);
	      this._store.put(deviceIdentity);
	    }
	  }, {
	    key: "getByCurve25519Key",
	    value: function getByCurve25519Key(curve25519Key) {
	      return this._store.index("byCurve25519Key").get(curve25519Key);
	    }
	  }]);
	  return DeviceIdentityStore;
	}();

	function encodeKey$5(senderKey, sessionId) {
	  return "".concat(senderKey, "|").concat(sessionId);
	}
	function decodeKey$2(key) {
	  var _key$split = key.split("|"),
	      _key$split2 = _slicedToArray(_key$split, 2),
	      senderKey = _key$split2[0],
	      sessionId = _key$split2[1];
	  return {
	    senderKey: senderKey,
	    sessionId: sessionId
	  };
	}
	var OlmSessionStore = function () {
	  function OlmSessionStore(store) {
	    _classCallCheck(this, OlmSessionStore);
	    this._store = store;
	  }
	  _createClass(OlmSessionStore, [{
	    key: "getSessionIds",
	    value: function () {
	      var _getSessionIds = _asyncToGenerator( regeneratorRuntime.mark(function _callee(senderKey) {
	        var sessionIds, range;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                sessionIds = [];
	                range = IDBKeyRange.lowerBound(encodeKey$5(senderKey, ""));
	                _context.next = 4;
	                return this._store.iterateKeys(range, function (key) {
	                  var decodedKey = decodeKey$2(key);
	                  if (decodedKey.senderKey === senderKey) {
	                    sessionIds.push(decodedKey.sessionId);
	                    return false;
	                  }
	                  return true;
	                });
	              case 4:
	                return _context.abrupt("return", sessionIds);
	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function getSessionIds(_x) {
	        return _getSessionIds.apply(this, arguments);
	      }
	      return getSessionIds;
	    }()
	  }, {
	    key: "getAll",
	    value: function getAll(senderKey) {
	      var range = IDBKeyRange.lowerBound(encodeKey$5(senderKey, ""));
	      return this._store.selectWhile(range, function (session) {
	        return session.senderKey === senderKey;
	      });
	    }
	  }, {
	    key: "get",
	    value: function get(senderKey, sessionId) {
	      return this._store.get(encodeKey$5(senderKey, sessionId));
	    }
	  }, {
	    key: "set",
	    value: function set(session) {
	      session.key = encodeKey$5(session.senderKey, session.sessionId);
	      return this._store.put(session);
	    }
	  }, {
	    key: "remove",
	    value: function remove(senderKey, sessionId) {
	      return this._store.delete(encodeKey$5(senderKey, sessionId));
	    }
	  }]);
	  return OlmSessionStore;
	}();

	function encodeKey$6(roomId, senderKey, sessionId) {
	  return "".concat(roomId, "|").concat(senderKey, "|").concat(sessionId);
	}
	var InboundGroupSessionStore = function () {
	  function InboundGroupSessionStore(store) {
	    _classCallCheck(this, InboundGroupSessionStore);
	    this._store = store;
	  }
	  _createClass(InboundGroupSessionStore, [{
	    key: "has",
	    value: function () {
	      var _has = _asyncToGenerator( regeneratorRuntime.mark(function _callee(roomId, senderKey, sessionId) {
	        var key, fetchedKey;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                key = encodeKey$6(roomId, senderKey, sessionId);
	                _context.next = 3;
	                return this._store.getKey(key);
	              case 3:
	                fetchedKey = _context.sent;
	                return _context.abrupt("return", key === fetchedKey);
	              case 5:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function has(_x, _x2, _x3) {
	        return _has.apply(this, arguments);
	      }
	      return has;
	    }()
	  }, {
	    key: "get",
	    value: function get(roomId, senderKey, sessionId) {
	      return this._store.get(encodeKey$6(roomId, senderKey, sessionId));
	    }
	  }, {
	    key: "set",
	    value: function set(session) {
	      session.key = encodeKey$6(session.roomId, session.senderKey, session.sessionId);
	      this._store.put(session);
	    }
	  }]);
	  return InboundGroupSessionStore;
	}();

	var OutboundGroupSessionStore = function () {
	  function OutboundGroupSessionStore(store) {
	    _classCallCheck(this, OutboundGroupSessionStore);
	    this._store = store;
	  }
	  _createClass(OutboundGroupSessionStore, [{
	    key: "remove",
	    value: function remove(roomId) {
	      this._store.delete(roomId);
	    }
	  }, {
	    key: "get",
	    value: function get(roomId) {
	      return this._store.get(roomId);
	    }
	  }, {
	    key: "set",
	    value: function set(session) {
	      this._store.put(session);
	    }
	  }]);
	  return OutboundGroupSessionStore;
	}();

	function encodeKey$7(roomId, sessionId, messageIndex) {
	  return "".concat(roomId, "|").concat(sessionId, "|").concat(messageIndex);
	}
	var GroupSessionDecryptionStore = function () {
	  function GroupSessionDecryptionStore(store) {
	    _classCallCheck(this, GroupSessionDecryptionStore);
	    this._store = store;
	  }
	  _createClass(GroupSessionDecryptionStore, [{
	    key: "get",
	    value: function get(roomId, sessionId, messageIndex) {
	      return this._store.get(encodeKey$7(roomId, sessionId, messageIndex));
	    }
	  }, {
	    key: "set",
	    value: function set(decryption) {
	      decryption.key = encodeKey$7(decryption.roomId, decryption.sessionId, decryption.messageIndex);
	      this._store.put(decryption);
	    }
	  }]);
	  return GroupSessionDecryptionStore;
	}();

	var Transaction = function () {
	  function Transaction(txn, allowedStoreNames) {
	    _classCallCheck(this, Transaction);
	    this._txn = txn;
	    this._allowedStoreNames = allowedStoreNames;
	    this._stores = {
	      session: null,
	      roomSummary: null,
	      roomTimeline: null,
	      roomState: null
	    };
	  }
	  _createClass(Transaction, [{
	    key: "_idbStore",
	    value: function _idbStore(name) {
	      if (!this._allowedStoreNames.includes(name)) {
	        throw new StorageError("Invalid store for transaction: ".concat(name, ", only ").concat(this._allowedStoreNames.join(", "), " are allowed."));
	      }
	      return new Store(this._txn.objectStore(name));
	    }
	  }, {
	    key: "_store",
	    value: function _store(name, mapStore) {
	      if (!this._stores[name]) {
	        var idbStore = this._idbStore(name);
	        this._stores[name] = mapStore(idbStore);
	      }
	      return this._stores[name];
	    }
	  }, {
	    key: "complete",
	    value: function complete() {
	      return txnAsPromise(this._txn);
	    }
	  }, {
	    key: "abort",
	    value: function abort() {
	      this._txn.abort();
	    }
	  }, {
	    key: "session",
	    get: function get() {
	      return this._store("session", function (idbStore) {
	        return new SessionStore(idbStore);
	      });
	    }
	  }, {
	    key: "roomSummary",
	    get: function get() {
	      return this._store("roomSummary", function (idbStore) {
	        return new RoomSummaryStore(idbStore);
	      });
	    }
	  }, {
	    key: "timelineFragments",
	    get: function get() {
	      return this._store("timelineFragments", function (idbStore) {
	        return new TimelineFragmentStore(idbStore);
	      });
	    }
	  }, {
	    key: "timelineEvents",
	    get: function get() {
	      return this._store("timelineEvents", function (idbStore) {
	        return new TimelineEventStore(idbStore);
	      });
	    }
	  }, {
	    key: "roomState",
	    get: function get() {
	      return this._store("roomState", function (idbStore) {
	        return new RoomStateStore(idbStore);
	      });
	    }
	  }, {
	    key: "roomMembers",
	    get: function get() {
	      return this._store("roomMembers", function (idbStore) {
	        return new RoomMemberStore(idbStore);
	      });
	    }
	  }, {
	    key: "pendingEvents",
	    get: function get() {
	      return this._store("pendingEvents", function (idbStore) {
	        return new PendingEventStore(idbStore);
	      });
	    }
	  }, {
	    key: "userIdentities",
	    get: function get() {
	      return this._store("userIdentities", function (idbStore) {
	        return new UserIdentityStore(idbStore);
	      });
	    }
	  }, {
	    key: "deviceIdentities",
	    get: function get() {
	      return this._store("deviceIdentities", function (idbStore) {
	        return new DeviceIdentityStore(idbStore);
	      });
	    }
	  }, {
	    key: "olmSessions",
	    get: function get() {
	      return this._store("olmSessions", function (idbStore) {
	        return new OlmSessionStore(idbStore);
	      });
	    }
	  }, {
	    key: "inboundGroupSessions",
	    get: function get() {
	      return this._store("inboundGroupSessions", function (idbStore) {
	        return new InboundGroupSessionStore(idbStore);
	      });
	    }
	  }, {
	    key: "outboundGroupSessions",
	    get: function get() {
	      return this._store("outboundGroupSessions", function (idbStore) {
	        return new OutboundGroupSessionStore(idbStore);
	      });
	    }
	  }, {
	    key: "groupSessionDecryptions",
	    get: function get() {
	      return this._store("groupSessionDecryptions", function (idbStore) {
	        return new GroupSessionDecryptionStore(idbStore);
	      });
	    }
	  }]);
	  return Transaction;
	}();

	var Storage = function () {
	  function Storage(idbDatabase) {
	    _classCallCheck(this, Storage);
	    this._db = idbDatabase;
	    var nameMap = STORE_NAMES.reduce(function (nameMap, name) {
	      nameMap[name] = name;
	      return nameMap;
	    }, {});
	    this.storeNames = Object.freeze(nameMap);
	  }
	  _createClass(Storage, [{
	    key: "_validateStoreNames",
	    value: function _validateStoreNames(storeNames) {
	      var idx = storeNames.findIndex(function (name) {
	        return !STORE_NAMES.includes(name);
	      });
	      if (idx !== -1) {
	        throw new StorageError("Tried top, a transaction unknown store ".concat(storeNames[idx]));
	      }
	    }
	  }, {
	    key: "readTxn",
	    value: function () {
	      var _readTxn = _asyncToGenerator( regeneratorRuntime.mark(function _callee(storeNames) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._validateStoreNames(storeNames);
	                _context.prev = 1;
	                txn = this._db.transaction(storeNames, "readonly");
	                return _context.abrupt("return", new Transaction(txn, storeNames));
	              case 6:
	                _context.prev = 6;
	                _context.t0 = _context["catch"](1);
	                throw new StorageError("readTxn failed", _context.t0);
	              case 9:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[1, 6]]);
	      }));
	      function readTxn(_x) {
	        return _readTxn.apply(this, arguments);
	      }
	      return readTxn;
	    }()
	  }, {
	    key: "readWriteTxn",
	    value: function () {
	      var _readWriteTxn = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(storeNames) {
	        var txn;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                this._validateStoreNames(storeNames);
	                _context2.prev = 1;
	                txn = this._db.transaction(storeNames, "readwrite");
	                return _context2.abrupt("return", new Transaction(txn, storeNames));
	              case 6:
	                _context2.prev = 6;
	                _context2.t0 = _context2["catch"](1);
	                throw new StorageError("readWriteTxn failed", _context2.t0);
	              case 9:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[1, 6]]);
	      }));
	      function readWriteTxn(_x2) {
	        return _readWriteTxn.apply(this, arguments);
	      }
	      return readWriteTxn;
	    }()
	  }, {
	    key: "close",
	    value: function close() {
	      this._db.close();
	    }
	  }]);
	  return Storage;
	}();

	function exportSession(_x) {
	  return _exportSession.apply(this, arguments);
	}
	function _exportSession() {
	  _exportSession = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(db) {
	    var NOT_DONE, txn, data;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            NOT_DONE = {
	              done: false
	            };
	            txn = db.transaction(STORE_NAMES, "readonly");
	            data = {};
	            _context2.next = 5;
	            return Promise.all(STORE_NAMES.map( function () {
	              var _ref = _asyncToGenerator( regeneratorRuntime.mark(function _callee(name) {
	                var results, store;
	                return regeneratorRuntime.wrap(function _callee$(_context) {
	                  while (1) {
	                    switch (_context.prev = _context.next) {
	                      case 0:
	                        results = data[name] = [];
	                        store = txn.objectStore(name);
	                        _context.next = 4;
	                        return iterateCursor(store.openCursor(), function (value) {
	                          results.push(value);
	                          return NOT_DONE;
	                        });
	                      case 4:
	                      case "end":
	                        return _context.stop();
	                    }
	                  }
	                }, _callee);
	              }));
	              return function (_x4) {
	                return _ref.apply(this, arguments);
	              };
	            }()));
	          case 5:
	            return _context2.abrupt("return", data);
	          case 6:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2);
	  }));
	  return _exportSession.apply(this, arguments);
	}
	function importSession(_x2, _x3) {
	  return _importSession.apply(this, arguments);
	}
	function _importSession() {
	  _importSession = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(db, data) {
	    var txn, _iterator, _step, name, store, _iterator2, _step2, value;
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            txn = db.transaction(STORE_NAMES, "readwrite");
	            _iterator = _createForOfIteratorHelper(STORE_NAMES);
	            try {
	              for (_iterator.s(); !(_step = _iterator.n()).done;) {
	                name = _step.value;
	                store = txn.objectStore(name);
	                _iterator2 = _createForOfIteratorHelper(data[name]);
	                try {
	                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	                    value = _step2.value;
	                    store.add(value);
	                  }
	                } catch (err) {
	                  _iterator2.e(err);
	                } finally {
	                  _iterator2.f();
	                }
	              }
	            } catch (err) {
	              _iterator.e(err);
	            } finally {
	              _iterator.f();
	            }
	            _context3.next = 5;
	            return txnAsPromise(txn);
	          case 5:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3);
	  }));
	  return _importSession.apply(this, arguments);
	}

	var schema = [createInitialStores, createMemberStore, migrateSession, createIdentityStores, createOlmSessionStore, createInboundGroupSessionsStore, createOutboundGroupSessionsStore, createGroupSessionDecryptions, addSenderKeyIndexToDeviceStore];
	function createInitialStores(db) {
	  db.createObjectStore("session", {
	    keyPath: "key"
	  });
	  db.createObjectStore("roomSummary", {
	    keyPath: "roomId"
	  });
	  db.createObjectStore("timelineFragments", {
	    keyPath: "key"
	  });
	  var timelineEvents = db.createObjectStore("timelineEvents", {
	    keyPath: "key"
	  });
	  timelineEvents.createIndex("byEventId", "eventIdKey", {
	    unique: true
	  });
	  db.createObjectStore("roomState", {
	    keyPath: "key"
	  });
	  db.createObjectStore("pendingEvents", {
	    keyPath: "key"
	  });
	}
	function createMemberStore(_x, _x2) {
	  return _createMemberStore.apply(this, arguments);
	}
	function _createMemberStore() {
	  _createMemberStore = _asyncToGenerator( regeneratorRuntime.mark(function _callee(db, txn) {
	    var roomMembers, roomState;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            roomMembers = new RoomMemberStore(db.createObjectStore("roomMembers", {
	              keyPath: "key"
	            }));
	            roomState = txn.objectStore("roomState");
	            _context.next = 4;
	            return iterateCursor(roomState.openCursor(), function (entry) {
	              if (entry.event.type === EVENT_TYPE) {
	                roomState.delete(entry.key);
	                var member = RoomMember.fromMemberEvent(entry.roomId, entry.event);
	                if (member) {
	                  roomMembers.set(member.serialize());
	                }
	              }
	            });
	          case 4:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _createMemberStore.apply(this, arguments);
	}
	function migrateSession(_x3, _x4) {
	  return _migrateSession.apply(this, arguments);
	}
	function _migrateSession() {
	  _migrateSession = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(db, txn) {
	    var session, PRE_MIGRATION_KEY, entry, _entry$value, syncToken, syncFilterId, serverVersions, store;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            session = txn.objectStore("session");
	            _context2.prev = 1;
	            PRE_MIGRATION_KEY = 1;
	            _context2.next = 5;
	            return reqAsPromise(session.get(PRE_MIGRATION_KEY));
	          case 5:
	            entry = _context2.sent;
	            if (entry) {
	              session.delete(PRE_MIGRATION_KEY);
	              _entry$value = entry.value, syncToken = _entry$value.syncToken, syncFilterId = _entry$value.syncFilterId, serverVersions = _entry$value.serverVersions;
	              store = new SessionStore(session);
	              store.set("sync", {
	                token: syncToken,
	                filterId: syncFilterId
	              });
	              store.set("serverVersions", serverVersions);
	            }
	            _context2.next = 13;
	            break;
	          case 9:
	            _context2.prev = 9;
	            _context2.t0 = _context2["catch"](1);
	            txn.abort();
	            console.error("could not migrate session", _context2.t0.stack);
	          case 13:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2, null, [[1, 9]]);
	  }));
	  return _migrateSession.apply(this, arguments);
	}
	function createIdentityStores(db) {
	  db.createObjectStore("userIdentities", {
	    keyPath: "userId"
	  });
	  db.createObjectStore("deviceIdentities", {
	    keyPath: "key"
	  });
	}
	function createOlmSessionStore(db) {
	  db.createObjectStore("olmSessions", {
	    keyPath: "key"
	  });
	}
	function createInboundGroupSessionsStore(db) {
	  db.createObjectStore("inboundGroupSessions", {
	    keyPath: "key"
	  });
	}
	function createOutboundGroupSessionsStore(db) {
	  db.createObjectStore("outboundGroupSessions", {
	    keyPath: "roomId"
	  });
	}
	function createGroupSessionDecryptions(db) {
	  db.createObjectStore("groupSessionDecryptions", {
	    keyPath: "key"
	  });
	}
	function addSenderKeyIndexToDeviceStore(db, txn) {
	  var deviceIdentities = txn.objectStore("deviceIdentities");
	  deviceIdentities.createIndex("byCurve25519Key", "curve25519Key", {
	    unique: true
	  });
	}

	var sessionName = function sessionName(sessionId) {
	  return "brawl_session_".concat(sessionId);
	};
	var openDatabaseWithSessionId = function openDatabaseWithSessionId(sessionId) {
	  return openDatabase(sessionName(sessionId), createStores, schema.length);
	};
	var StorageFactory = function () {
	  function StorageFactory() {
	    _classCallCheck(this, StorageFactory);
	  }
	  _createClass(StorageFactory, [{
	    key: "create",
	    value: function () {
	      var _create = _asyncToGenerator( regeneratorRuntime.mark(function _callee(sessionId) {
	        var db;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return openDatabaseWithSessionId(sessionId);
	              case 2:
	                db = _context.sent;
	                return _context.abrupt("return", new Storage(db));
	              case 4:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));
	      function create(_x) {
	        return _create.apply(this, arguments);
	      }
	      return create;
	    }()
	  }, {
	    key: "delete",
	    value: function _delete(sessionId) {
	      var databaseName = sessionName(sessionId);
	      var req = window.indexedDB.deleteDatabase(databaseName);
	      return reqAsPromise(req);
	    }
	  }, {
	    key: "export",
	    value: function () {
	      var _export2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(sessionId) {
	        var db;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return openDatabaseWithSessionId(sessionId);
	              case 2:
	                db = _context2.sent;
	                _context2.next = 5;
	                return exportSession(db);
	              case 5:
	                return _context2.abrupt("return", _context2.sent);
	              case 6:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2);
	      }));
	      function _export(_x2) {
	        return _export2.apply(this, arguments);
	      }
	      return _export;
	    }()
	  }, {
	    key: "import",
	    value: function () {
	      var _import2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(sessionId, data) {
	        var db;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return openDatabaseWithSessionId(sessionId);
	              case 2:
	                db = _context3.sent;
	                _context3.next = 5;
	                return importSession(db, data);
	              case 5:
	                return _context3.abrupt("return", _context3.sent);
	              case 6:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3);
	      }));
	      function _import(_x3, _x4) {
	        return _import2.apply(this, arguments);
	      }
	      return _import;
	    }()
	  }]);
	  return StorageFactory;
	}();
	function createStores(_x5, _x6, _x7, _x8) {
	  return _createStores.apply(this, arguments);
	}
	function _createStores() {
	  _createStores = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(db, txn, oldVersion, version) {
	    var startIdx, i;
	    return regeneratorRuntime.wrap(function _callee4$(_context4) {
	      while (1) {
	        switch (_context4.prev = _context4.next) {
	          case 0:
	            startIdx = oldVersion || 0;
	            i = startIdx;
	          case 2:
	            if (!(i < version)) {
	              _context4.next = 8;
	              break;
	            }
	            _context4.next = 5;
	            return schema[i](db, txn);
	          case 5:
	            ++i;
	            _context4.next = 2;
	            break;
	          case 8:
	          case "end":
	            return _context4.stop();
	        }
	      }
	    }, _callee4);
	  }));
	  return _createStores.apply(this, arguments);
	}

	var SessionInfoStorage = function () {
	  function SessionInfoStorage(name) {
	    _classCallCheck(this, SessionInfoStorage);
	    this._name = name;
	  }
	  _createClass(SessionInfoStorage, [{
	    key: "getAll",
	    value: function getAll() {
	      var sessionsJson = localStorage.getItem(this._name);
	      if (sessionsJson) {
	        var sessions = JSON.parse(sessionsJson);
	        if (Array.isArray(sessions)) {
	          return Promise.resolve(sessions);
	        }
	      }
	      return Promise.resolve([]);
	    }
	  }, {
	    key: "hasAnySession",
	    value: function () {
	      var _hasAnySession = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        var all;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this.getAll();
	              case 2:
	                all = _context.sent;
	                return _context.abrupt("return", all && all.length > 0);
	              case 4:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function hasAnySession() {
	        return _hasAnySession.apply(this, arguments);
	      }
	      return hasAnySession;
	    }()
	  }, {
	    key: "updateLastUsed",
	    value: function () {
	      var _updateLastUsed = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(id, timestamp) {
	        var sessions, session;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return this.getAll();
	              case 2:
	                sessions = _context2.sent;
	                if (sessions) {
	                  session = sessions.find(function (session) {
	                    return session.id === id;
	                  });
	                  if (session) {
	                    session.lastUsed = timestamp;
	                    localStorage.setItem(this._name, JSON.stringify(sessions));
	                  }
	                }
	              case 4:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function updateLastUsed(_x, _x2) {
	        return _updateLastUsed.apply(this, arguments);
	      }
	      return updateLastUsed;
	    }()
	  }, {
	    key: "get",
	    value: function () {
	      var _get = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(id) {
	        var sessions;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this.getAll();
	              case 2:
	                sessions = _context3.sent;
	                if (!sessions) {
	                  _context3.next = 5;
	                  break;
	                }
	                return _context3.abrupt("return", sessions.find(function (session) {
	                  return session.id === id;
	                }));
	              case 5:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function get(_x3) {
	        return _get.apply(this, arguments);
	      }
	      return get;
	    }()
	  }, {
	    key: "add",
	    value: function () {
	      var _add = _asyncToGenerator( regeneratorRuntime.mark(function _callee4(sessionInfo) {
	        var sessions;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this.getAll();
	              case 2:
	                sessions = _context4.sent;
	                sessions.push(sessionInfo);
	                localStorage.setItem(this._name, JSON.stringify(sessions));
	              case 5:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function add(_x4) {
	        return _add.apply(this, arguments);
	      }
	      return add;
	    }()
	  }, {
	    key: "delete",
	    value: function () {
	      var _delete2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(sessionId) {
	        var sessions;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return this.getAll();
	              case 2:
	                sessions = _context5.sent;
	                sessions = sessions.filter(function (s) {
	                  return s.id !== sessionId;
	                });
	                localStorage.setItem(this._name, JSON.stringify(sessions));
	              case 5:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function _delete(_x5) {
	        return _delete2.apply(this, arguments);
	      }
	      return _delete;
	    }()
	  }]);
	  return SessionInfoStorage;
	}();

	function avatarInitials(name) {
	  var firstChar = name.charAt(0);
	  if (firstChar === "!" || firstChar === "@" || firstChar === "#") {
	    firstChar = name.charAt(1);
	  }
	  return firstChar.toUpperCase();
	}
	function hashCode(str) {
	  var hash = 0;
	  var i;
	  var chr;
	  if (str.length === 0) {
	    return hash;
	  }
	  for (i = 0; i < str.length; i++) {
	    chr = str.charCodeAt(i);
	    hash = (hash << 5) - hash + chr;
	    hash |= 0;
	  }
	  return Math.abs(hash);
	}
	function getIdentifierColorNumber(id) {
	  return hashCode(id) % 8 + 1;
	}

	var ViewModel = function (_EventEmitter) {
	  _inherits(ViewModel, _EventEmitter);
	  var _super = _createSuper(ViewModel);
	  function ViewModel() {
	    var _this;
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        clock = _ref.clock,
	        emitChange = _ref.emitChange;
	    _classCallCheck(this, ViewModel);
	    _this = _super.call(this);
	    _this.disposables = null;
	    _this._options = {
	      clock: clock,
	      emitChange: emitChange
	    };
	    return _this;
	  }
	  _createClass(ViewModel, [{
	    key: "childOptions",
	    value: function childOptions(explicitOptions) {
	      return Object.assign({}, this._options, explicitOptions);
	    }
	  }, {
	    key: "track",
	    value: function track(disposable) {
	      if (!this.disposables) {
	        this.disposables = new Disposables();
	      }
	      return this.disposables.track(disposable);
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      if (this.disposables) {
	        this.disposables.dispose();
	      }
	    }
	  }, {
	    key: "disposeTracked",
	    value: function disposeTracked(disposable) {
	      if (this.disposables) {
	        return this.disposables.disposeTracked(disposable);
	      }
	      return null;
	    }
	  }, {
	    key: "i18n",
	    value: function i18n(parts) {
	      var result = "";
	      for (var i = 0; i < parts.length; ++i) {
	        result = result + parts[i];
	        if (i < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
	          result = result + (i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1]);
	        }
	      }
	      return result;
	    }
	  }, {
	    key: "updateOptions",
	    value: function updateOptions(options) {
	      this._options = Object.assign(this._options, options);
	    }
	  }, {
	    key: "emitChange",
	    value: function emitChange(changedProps) {
	      if (this._options.emitChange) {
	        this._options.emitChange(changedProps);
	      } else {
	        this.emit("change", changedProps);
	      }
	    }
	  }, {
	    key: "clock",
	    get: function get() {
	      return this._options.clock;
	    }
	  }]);
	  return ViewModel;
	}(EventEmitter);

	function _templateObject() {
	  var data = _taggedTemplateLiteral(["Empty Room"]);
	  _templateObject = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	function isSortedAsUnread(vm) {
	  return vm.isUnread || vm.isOpen && vm._wasUnreadWhenOpening;
	}
	var RoomTileViewModel = function (_ViewModel) {
	  _inherits(RoomTileViewModel, _ViewModel);
	  var _super = _createSuper(RoomTileViewModel);
	  function RoomTileViewModel(options) {
	    var _this;
	    _classCallCheck(this, RoomTileViewModel);
	    _this = _super.call(this, options);
	    var room = options.room,
	        emitOpen = options.emitOpen;
	    _this._room = room;
	    _this._emitOpen = emitOpen;
	    _this._isOpen = false;
	    _this._wasUnreadWhenOpening = false;
	    return _this;
	  }
	  _createClass(RoomTileViewModel, [{
	    key: "close",
	    value: function close() {
	      if (this._isOpen) {
	        this._isOpen = false;
	        this.emitChange("isOpen");
	      }
	    }
	  }, {
	    key: "open",
	    value: function open() {
	      if (!this._isOpen) {
	        this._isOpen = true;
	        this._wasUnreadWhenOpening = this._room.isUnread;
	        this.emitChange("isOpen");
	        this._emitOpen(this._room, this);
	      }
	    }
	  }, {
	    key: "compare",
	    value: function compare(other) {
	      var myRoom = this._room;
	      var theirRoom = other._room;
	      if (myRoom.isLowPriority !== theirRoom.isLowPriority) {
	        if (myRoom.isLowPriority) {
	          return 1;
	        }
	        return -1;
	      }
	      if (isSortedAsUnread(this) !== isSortedAsUnread(other)) {
	        if (isSortedAsUnread(this)) {
	          return -1;
	        }
	        return 1;
	      }
	      var myTimestamp = myRoom.lastMessageTimestamp;
	      var theirTimestamp = theirRoom.lastMessageTimestamp;
	      var myTimestampValid = Number.isSafeInteger(myTimestamp);
	      var theirTimestampValid = Number.isSafeInteger(theirTimestamp);
	      if (myTimestampValid !== theirTimestampValid) {
	        if (!theirTimestampValid) {
	          return -1;
	        }
	        return 1;
	      }
	      var timeDiff = theirTimestamp - myTimestamp;
	      if (timeDiff === 0 || !theirTimestampValid || !myTimestampValid) {
	        var nameCmp = this.name.localeCompare(other.name);
	        if (nameCmp === 0) {
	          return this._room.id.localeCompare(other._room.id);
	        }
	        return nameCmp;
	      }
	      return timeDiff;
	    }
	  }, {
	    key: "isOpen",
	    get: function get() {
	      return this._isOpen;
	    }
	  }, {
	    key: "isUnread",
	    get: function get() {
	      return this._room.isUnread;
	    }
	  }, {
	    key: "name",
	    get: function get() {
	      return this._room.name || this.i18n(_templateObject());
	    }
	  }, {
	    key: "avatarLetter",
	    get: function get() {
	      return avatarInitials(this.name);
	    }
	  }, {
	    key: "avatarColorNumber",
	    get: function get() {
	      return getIdentifierColorNumber(this._room.id);
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      if (this._room.avatarUrl) {
	        return this._room.mediaRepository.mxcUrlThumbnail(this._room.avatarUrl, 32, 32, "crop");
	      }
	      return null;
	    }
	  }, {
	    key: "avatarTitle",
	    get: function get() {
	      return this.name;
	    }
	  }, {
	    key: "badgeCount",
	    get: function get() {
	      return this._room.notificationCount;
	    }
	  }, {
	    key: "isHighlighted",
	    get: function get() {
	      return this._room.highlightCount !== 0;
	    }
	  }]);
	  return RoomTileViewModel;
	}(ViewModel);

	var UpdateAction = function () {
	  function UpdateAction(remove, update, updateParams) {
	    _classCallCheck(this, UpdateAction);
	    this._remove = remove;
	    this._update = update;
	    this._updateParams = updateParams;
	  }
	  _createClass(UpdateAction, [{
	    key: "shouldRemove",
	    get: function get() {
	      return this._remove;
	    }
	  }, {
	    key: "shouldUpdate",
	    get: function get() {
	      return this._update;
	    }
	  }, {
	    key: "updateParams",
	    get: function get() {
	      return this._updateParams;
	    }
	  }], [{
	    key: "Remove",
	    value: function Remove() {
	      return new UpdateAction(true, false, null);
	    }
	  }, {
	    key: "Update",
	    value: function Update(newParams) {
	      return new UpdateAction(false, true, newParams);
	    }
	  }, {
	    key: "Nothing",
	    value: function Nothing() {
	      return new UpdateAction(false, false, null);
	    }
	  }]);
	  return UpdateAction;
	}();

	var TilesCollection = function (_BaseObservableList) {
	  _inherits(TilesCollection, _BaseObservableList);
	  var _super = _createSuper(TilesCollection);
	  function TilesCollection(entries, tileCreator) {
	    var _this;
	    _classCallCheck(this, TilesCollection);
	    _this = _super.call(this);
	    _this._entries = entries;
	    _this._tiles = null;
	    _this._entrySubscription = null;
	    _this._tileCreator = tileCreator;
	    _this._emitSpontanousUpdate = _this._emitSpontanousUpdate.bind(_assertThisInitialized(_this));
	    return _this;
	  }
	  _createClass(TilesCollection, [{
	    key: "_emitSpontanousUpdate",
	    value: function _emitSpontanousUpdate(tile, params) {
	      var entry = tile.lowerEntry;
	      var tileIdx = this._findTileIdx(entry);
	      this.emitUpdate(tileIdx, tile, params);
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      this._entrySubscription = this._entries.subscribe(this);
	      this._populateTiles();
	    }
	  }, {
	    key: "_populateTiles",
	    value: function _populateTiles() {
	      this._tiles = [];
	      var currentTile = null;
	      var _iterator = _createForOfIteratorHelper(this._entries),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var entry = _step.value;
	          if (!currentTile || !currentTile.tryIncludeEntry(entry)) {
	            currentTile = this._tileCreator(entry);
	            if (currentTile) {
	              this._tiles.push(currentTile);
	            }
	          }
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      var prevTile = null;
	      var _iterator2 = _createForOfIteratorHelper(this._tiles),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var tile = _step2.value;
	          if (prevTile) {
	            prevTile.updateNextSibling(tile);
	          }
	          tile.updatePreviousSibling(prevTile);
	          prevTile = tile;
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	      if (prevTile) {
	        prevTile.updateNextSibling(null);
	      }
	      var _iterator3 = _createForOfIteratorHelper(this._tiles),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var _tile = _step3.value;
	          _tile.setUpdateEmit(this._emitSpontanousUpdate);
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "_findTileIdx",
	    value: function _findTileIdx(entry) {
	      return sortedIndex(this._tiles, entry, function (entry, tile) {
	        return -tile.compareEntry(entry);
	      });
	    }
	  }, {
	    key: "_findTileAtIdx",
	    value: function _findTileAtIdx(entry, idx) {
	      var tile = this._getTileAtIdx(idx);
	      if (tile && tile.compareEntry(entry) === 0) {
	        return tile;
	      }
	    }
	  }, {
	    key: "_getTileAtIdx",
	    value: function _getTileAtIdx(tileIdx) {
	      if (tileIdx >= 0 && tileIdx < this._tiles.length) {
	        return this._tiles[tileIdx];
	      }
	      return null;
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      this._entrySubscription = this._entrySubscription();
	      this._tiles = null;
	    }
	  }, {
	    key: "onReset",
	    value: function onReset() {
	      this._buildInitialTiles();
	      this.emitReset();
	    }
	  }, {
	    key: "onAdd",
	    value: function onAdd(index, entry) {
	      var tileIdx = this._findTileIdx(entry);
	      var prevTile = this._getTileAtIdx(tileIdx - 1);
	      if (prevTile && prevTile.tryIncludeEntry(entry)) {
	        this.emitUpdate(tileIdx - 1, prevTile);
	        return;
	      }
	      var nextTile = this._getTileAtIdx(tileIdx);
	      if (nextTile && nextTile.tryIncludeEntry(entry)) {
	        this.emitUpdate(tileIdx, nextTile);
	        return;
	      }
	      var newTile = this._tileCreator(entry);
	      if (newTile) {
	        if (prevTile) {
	          prevTile.updateNextSibling(newTile);
	          newTile.updatePreviousSibling(prevTile);
	        }
	        if (nextTile) {
	          newTile.updateNextSibling(nextTile);
	          nextTile.updatePreviousSibling(newTile);
	        }
	        this._tiles.splice(tileIdx, 0, newTile);
	        this.emitAdd(tileIdx, newTile);
	        newTile.setUpdateEmit(this._emitSpontanousUpdate);
	      }
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(index, entry, params) {
	      var tileIdx = this._findTileIdx(entry);
	      var tile = this._findTileAtIdx(entry, tileIdx);
	      if (tile) {
	        var action = tile.updateEntry(entry, params);
	        if (action.shouldRemove) {
	          this._removeTile(tileIdx, tile);
	        }
	        if (action.shouldUpdate) {
	          this.emitUpdate(tileIdx, tile, action.updateParams);
	        }
	      }
	    }
	  }, {
	    key: "_removeTile",
	    value: function _removeTile(tileIdx, tile) {
	      var prevTile = this._getTileAtIdx(tileIdx - 1);
	      var nextTile = this._getTileAtIdx(tileIdx + 1);
	      this._tiles.splice(tileIdx, 1);
	      prevTile && prevTile.updateNextSibling(nextTile);
	      nextTile && nextTile.updatePreviousSibling(prevTile);
	      tile.setUpdateEmit(null);
	      this.emitRemove(tileIdx, tile);
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(index, entry) {
	      var tileIdx = this._findTileIdx(entry);
	      var tile = this._findTileAtIdx(entry, tileIdx);
	      if (tile) {
	        var removeTile = tile.removeEntry(entry);
	        if (removeTile) {
	          this._removeTile(tileIdx, tile);
	        } else {
	          this.emitUpdate(tileIdx, tile);
	        }
	      }
	    }
	  }, {
	    key: "onMove",
	    value: function onMove(fromIdx, toIdx, value) {
	    }
	  }, {
	    key: Symbol.iterator,
	    value: function value() {
	      return this._tiles.values();
	    }
	  }, {
	    key: "getFirst",
	    value: function getFirst() {
	      return this._tiles[0];
	    }
	  }, {
	    key: "length",
	    get: function get() {
	      return this._tiles.length;
	    }
	  }]);
	  return TilesCollection;
	}(BaseObservableList);

	var SimpleTile = function (_ViewModel) {
	  _inherits(SimpleTile, _ViewModel);
	  var _super = _createSuper(SimpleTile);
	  function SimpleTile(_ref) {
	    var _this;
	    var entry = _ref.entry;
	    _classCallCheck(this, SimpleTile);
	    _this = _super.call(this);
	    _this._entry = entry;
	    return _this;
	  }
	  _createClass(SimpleTile, [{
	    key: "setUpdateEmit",
	    value: function setUpdateEmit(emitUpdate) {
	      var _this2 = this;
	      this.updateOptions({
	        emitChange: function emitChange(paramName) {
	          return emitUpdate(_this2, paramName);
	        }
	      });
	    }
	  }, {
	    key: "compareEntry",
	    value: function compareEntry(entry) {
	      return this._entry.compare(entry);
	    }
	  }, {
	    key: "updateEntry",
	    value: function updateEntry(entry) {
	      this._entry = entry;
	      return UpdateAction.Nothing();
	    }
	  }, {
	    key: "removeEntry",
	    value: function removeEntry(entry) {
	      return true;
	    }
	  }, {
	    key: "tryIncludeEntry",
	    value: function tryIncludeEntry() {
	      return false;
	    }
	  }, {
	    key: "updatePreviousSibling",
	    value: function updatePreviousSibling(prev) {}
	  }, {
	    key: "updateNextSibling",
	    value: function updateNextSibling(next) {}
	  }, {
	    key: "shape",
	    get: function get() {
	      return null;
	    }
	  }, {
	    key: "isContinuation",
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: "hasDateSeparator",
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: "internalId",
	    get: function get() {
	      return this._entry.asEventKey().toString();
	    }
	  }, {
	    key: "isPending",
	    get: function get() {
	      return this._entry.isPending;
	    }
	  }, {
	    key: "upperEntry",
	    get: function get() {
	      return this._entry;
	    }
	  }, {
	    key: "lowerEntry",
	    get: function get() {
	      return this._entry;
	    }
	  }]);
	  return SimpleTile;
	}(ViewModel);

	var GapTile = function (_SimpleTile) {
	  _inherits(GapTile, _SimpleTile);
	  var _super = _createSuper(GapTile);
	  function GapTile(options, timeline) {
	    var _this;
	    _classCallCheck(this, GapTile);
	    _this = _super.call(this, options);
	    _this._timeline = timeline;
	    _this._loading = false;
	    _this._error = null;
	    return _this;
	  }
	  _createClass(GapTile, [{
	    key: "fill",
	    value: function () {
	      var _fill = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (this._loading) {
	                  _context.next = 18;
	                  break;
	                }
	                this._loading = true;
	                this.emitChange("isLoading");
	                _context.prev = 3;
	                _context.next = 6;
	                return this._timeline.fillGap(this._entry, 10);
	              case 6:
	                _context.next = 14;
	                break;
	              case 8:
	                _context.prev = 8;
	                _context.t0 = _context["catch"](3);
	                console.error("timeline.fillGap(): ".concat(_context.t0.message, ":\n").concat(_context.t0.stack));
	                this._error = _context.t0;
	                this.emitChange("error");
	                throw _context.t0;
	              case 14:
	                _context.prev = 14;
	                this._loading = false;
	                this.emitChange("isLoading");
	                return _context.finish(14);
	              case 18:
	                return _context.abrupt("return", this._entry.edgeReached);
	              case 19:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[3, 8, 14, 18]]);
	      }));
	      function fill() {
	        return _fill.apply(this, arguments);
	      }
	      return fill;
	    }()
	  }, {
	    key: "updateEntry",
	    value: function updateEntry(entry, params) {
	      _get(_getPrototypeOf(GapTile.prototype), "updateEntry", this).call(this, entry, params);
	      if (!entry.isGap) {
	        return UpdateAction.Remove();
	      } else {
	        return UpdateAction.Nothing();
	      }
	    }
	  }, {
	    key: "shape",
	    get: function get() {
	      return "gap";
	    }
	  }, {
	    key: "isLoading",
	    get: function get() {
	      return this._loading;
	    }
	  }, {
	    key: "error",
	    get: function get() {
	      if (this._error) {
	        var dir = this._entry.prev_batch ? "previous" : "next";
	        return "Could not load ".concat(dir, " messages: ").concat(this._error.message);
	      }
	      return null;
	    }
	  }]);
	  return GapTile;
	}(SimpleTile);

	var MessageTile = function (_SimpleTile) {
	  _inherits(MessageTile, _SimpleTile);
	  var _super = _createSuper(MessageTile);
	  function MessageTile(options) {
	    var _this;
	    _classCallCheck(this, MessageTile);
	    _this = _super.call(this, options);
	    _this._mediaRepository = options.mediaRepository;
	    _this._clock = options.clock;
	    _this._isOwn = _this._entry.sender === options.ownUserId;
	    _this._date = _this._entry.timestamp ? new Date(_this._entry.timestamp) : null;
	    _this._isContinuation = false;
	    return _this;
	  }
	  _createClass(MessageTile, [{
	    key: "_getContent",
	    value: function _getContent() {
	      return this._entry.content;
	    }
	  }, {
	    key: "updatePreviousSibling",
	    value: function updatePreviousSibling(prev) {
	      _get(_getPrototypeOf(MessageTile.prototype), "updatePreviousSibling", this).call(this, prev);
	      var isContinuation = false;
	      if (prev && prev instanceof MessageTile && prev.sender === this.sender) {
	        var myTimestamp = this._entry.timestamp || this._clock.now();
	        var otherTimestamp = prev._entry.timestamp || this._clock.now();
	        isContinuation = myTimestamp - otherTimestamp < 5 * 60 * 1000;
	      }
	      if (isContinuation !== this._isContinuation) {
	        this._isContinuation = isContinuation;
	        this.emitChange("isContinuation");
	      }
	    }
	  }, {
	    key: "shape",
	    get: function get() {
	      return "message";
	    }
	  }, {
	    key: "sender",
	    get: function get() {
	      return this._entry.displayName || this._entry.sender;
	    }
	  }, {
	    key: "avatarColorNumber",
	    get: function get() {
	      return getIdentifierColorNumber(this._entry.sender);
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      if (this._entry.avatarUrl) {
	        return this._mediaRepository.mxcUrlThumbnail(this._entry.avatarUrl, 30, 30, "crop");
	      }
	      return null;
	    }
	  }, {
	    key: "avatarLetter",
	    get: function get() {
	      return avatarInitials(this.sender);
	    }
	  }, {
	    key: "avatarTitle",
	    get: function get() {
	      return this.sender;
	    }
	  }, {
	    key: "date",
	    get: function get() {
	      return this._date && this._date.toLocaleDateString({}, {
	        month: "numeric",
	        day: "numeric"
	      });
	    }
	  }, {
	    key: "time",
	    get: function get() {
	      return this._date && this._date.toLocaleTimeString({}, {
	        hour: "numeric",
	        minute: "2-digit"
	      });
	    }
	  }, {
	    key: "isOwn",
	    get: function get() {
	      return this._isOwn;
	    }
	  }, {
	    key: "isContinuation",
	    get: function get() {
	      return this._isContinuation;
	    }
	  }, {
	    key: "isUnverified",
	    get: function get() {
	      return this._entry.isUnverified;
	    }
	  }]);
	  return MessageTile;
	}(SimpleTile);

	var TextTile = function (_MessageTile) {
	  _inherits(TextTile, _MessageTile);
	  var _super = _createSuper(TextTile);
	  function TextTile() {
	    _classCallCheck(this, TextTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(TextTile, [{
	    key: "text",
	    get: function get() {
	      var content = this._getContent();
	      var body = content && content.body;
	      if (content.msgtype === "m.emote") {
	        return "* ".concat(this._entry.sender, " ").concat(body);
	      } else {
	        return body;
	      }
	    }
	  }]);
	  return TextTile;
	}(MessageTile);

	var MAX_HEIGHT = 300;
	var MAX_WIDTH = 400;
	var ImageTile = function (_MessageTile) {
	  _inherits(ImageTile, _MessageTile);
	  var _super = _createSuper(ImageTile);
	  function ImageTile() {
	    _classCallCheck(this, ImageTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(ImageTile, [{
	    key: "_scaleFactor",
	    value: function _scaleFactor() {
	      var _this$_getContent;
	      var info = (_this$_getContent = this._getContent()) === null || _this$_getContent === void 0 ? void 0 : _this$_getContent.info;
	      var scaleHeightFactor = MAX_HEIGHT / (info === null || info === void 0 ? void 0 : info.h);
	      var scaleWidthFactor = MAX_WIDTH / (info === null || info === void 0 ? void 0 : info.w);
	      return Math.min(scaleWidthFactor, scaleHeightFactor, 1);
	    }
	  }, {
	    key: "thumbnailUrl",
	    get: function get() {
	      var _this$_getContent2;
	      var mxcUrl = (_this$_getContent2 = this._getContent()) === null || _this$_getContent2 === void 0 ? void 0 : _this$_getContent2.url;
	      if (typeof mxcUrl === "string") {
	        return this._mediaRepository.mxcUrlThumbnail(mxcUrl, this.thumbnailWidth, this.thumbnailHeight, "scale");
	      }
	      return null;
	    }
	  }, {
	    key: "url",
	    get: function get() {
	      var _this$_getContent3;
	      var mxcUrl = (_this$_getContent3 = this._getContent()) === null || _this$_getContent3 === void 0 ? void 0 : _this$_getContent3.url;
	      if (typeof mxcUrl === "string") {
	        return this._mediaRepository.mxcUrl(mxcUrl);
	      }
	      return null;
	    }
	  }, {
	    key: "thumbnailWidth",
	    get: function get() {
	      var _this$_getContent4;
	      var info = (_this$_getContent4 = this._getContent()) === null || _this$_getContent4 === void 0 ? void 0 : _this$_getContent4.info;
	      return Math.round((info === null || info === void 0 ? void 0 : info.w) * this._scaleFactor());
	    }
	  }, {
	    key: "thumbnailHeight",
	    get: function get() {
	      var _this$_getContent5;
	      var info = (_this$_getContent5 = this._getContent()) === null || _this$_getContent5 === void 0 ? void 0 : _this$_getContent5.info;
	      return Math.round((info === null || info === void 0 ? void 0 : info.h) * this._scaleFactor());
	    }
	  }, {
	    key: "label",
	    get: function get() {
	      return this._getContent().body;
	    }
	  }, {
	    key: "shape",
	    get: function get() {
	      return "image";
	    }
	  }]);
	  return ImageTile;
	}(MessageTile);

	var LocationTile = function (_MessageTile) {
	  _inherits(LocationTile, _MessageTile);
	  var _super = _createSuper(LocationTile);
	  function LocationTile() {
	    _classCallCheck(this, LocationTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(LocationTile, [{
	    key: "mapsLink",
	    get: function get() {
	      var geoUri = this._getContent().geo_uri;
	      var _geoUri$split$1$split = geoUri.split(":")[1].split(","),
	          _geoUri$split$1$split2 = _slicedToArray(_geoUri$split$1$split, 2),
	          lat = _geoUri$split$1$split2[0],
	          long = _geoUri$split$1$split2[1];
	      return "maps:".concat(lat, " ").concat(long);
	    }
	  }, {
	    key: "label",
	    get: function get() {
	      return "".concat(this.sender, " sent their location, click to see it in maps.");
	    }
	  }]);
	  return LocationTile;
	}(MessageTile);

	var RoomNameTile = function (_SimpleTile) {
	  _inherits(RoomNameTile, _SimpleTile);
	  var _super = _createSuper(RoomNameTile);
	  function RoomNameTile() {
	    _classCallCheck(this, RoomNameTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(RoomNameTile, [{
	    key: "shape",
	    get: function get() {
	      return "announcement";
	    }
	  }, {
	    key: "announcement",
	    get: function get() {
	      var content = this._entry.content;
	      return "".concat(this._entry.displayName || this._entry.sender, " named the room \"").concat(content.name, "\"");
	    }
	  }]);
	  return RoomNameTile;
	}(SimpleTile);

	var RoomMemberTile = function (_SimpleTile) {
	  _inherits(RoomMemberTile, _SimpleTile);
	  var _super = _createSuper(RoomMemberTile);
	  function RoomMemberTile() {
	    _classCallCheck(this, RoomMemberTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(RoomMemberTile, [{
	    key: "shape",
	    get: function get() {
	      return "announcement";
	    }
	  }, {
	    key: "announcement",
	    get: function get() {
	      var _this$_entry$content;
	      var _this$_entry = this._entry,
	          sender = _this$_entry.sender,
	          content = _this$_entry.content,
	          prevContent = _this$_entry.prevContent,
	          stateKey = _this$_entry.stateKey;
	      var senderName = this._entry.displayName || sender;
	      var targetName = sender === stateKey ? senderName : ((_this$_entry$content = this._entry.content) === null || _this$_entry$content === void 0 ? void 0 : _this$_entry$content.displayname) || stateKey;
	      var membership = content && content.membership;
	      var prevMembership = prevContent && prevContent.membership;
	      if (prevMembership === "join" && membership === "join") {
	        if (content.avatar_url !== prevContent.avatar_url) {
	          return "".concat(senderName, " changed their avatar");
	        } else if (content.displayname !== prevContent.displayname) {
	          return "".concat(senderName, " changed their name to ").concat(content.displayname);
	        }
	      } else if (membership === "join") {
	        return "".concat(targetName, " joined the room");
	      } else if (membership === "invite") {
	        return "".concat(targetName, " was invited to the room by ").concat(senderName);
	      } else if (prevMembership === "invite") {
	        if (membership === "join") {
	          return "".concat(targetName, " accepted the invitation to join the room");
	        } else if (membership === "leave") {
	          return "".concat(targetName, " declined the invitation to join the room");
	        }
	      } else if (membership === "leave") {
	        if (stateKey === sender) {
	          return "".concat(targetName, " left the room");
	        } else {
	          var reason = content.reason;
	          return "".concat(targetName, " was kicked from the room by ").concat(senderName).concat(reason ? ": ".concat(reason) : "");
	        }
	      } else if (membership === "ban") {
	        return "".concat(targetName, " was banned from the room by ").concat(senderName);
	      }
	      return "".concat(sender, " membership changed to ").concat(content.membership);
	    }
	  }]);
	  return RoomMemberTile;
	}(SimpleTile);

	function _templateObject$1() {
	  var data = _taggedTemplateLiteral(["**Encrypted message**"]);
	  _templateObject$1 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var EncryptedEventTile = function (_MessageTile) {
	  _inherits(EncryptedEventTile, _MessageTile);
	  var _super = _createSuper(EncryptedEventTile);
	  function EncryptedEventTile() {
	    _classCallCheck(this, EncryptedEventTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(EncryptedEventTile, [{
	    key: "text",
	    get: function get() {
	      return this.i18n(_templateObject$1());
	    }
	  }]);
	  return EncryptedEventTile;
	}(MessageTile);

	function tilesCreator(_ref) {
	  var room = _ref.room,
	      ownUserId = _ref.ownUserId,
	      clock = _ref.clock;
	  return function tilesCreator(entry, emitUpdate) {
	    var options = {
	      entry: entry,
	      emitUpdate: emitUpdate,
	      ownUserId: ownUserId,
	      clock: clock,
	      mediaRepository: room.mediaRepository
	    };
	    if (entry.isGap) {
	      return new GapTile(options, room);
	    } else if (entry.eventType) {
	      switch (entry.eventType) {
	        case "m.room.message":
	          {
	            var content = entry.content;
	            var msgtype = content && content.msgtype;
	            switch (msgtype) {
	              case "m.text":
	              case "m.notice":
	              case "m.emote":
	                return new TextTile(options);
	              case "m.image":
	                return new ImageTile(options);
	              case "m.location":
	                return new LocationTile(options);
	              default:
	                return null;
	            }
	          }
	        case "m.room.name":
	          return new RoomNameTile(options);
	        case "m.room.member":
	          return new RoomMemberTile(options);
	        case "m.room.encrypted":
	          return new EncryptedEventTile(options);
	        default:
	          return null;
	      }
	    }
	  };
	}

	var TimelineViewModel = function (_ViewModel) {
	  _inherits(TimelineViewModel, _ViewModel);
	  var _super = _createSuper(TimelineViewModel);
	  function TimelineViewModel(options) {
	    var _this;
	    _classCallCheck(this, TimelineViewModel);
	    _this = _super.call(this, options);
	    var room = options.room,
	        timeline = options.timeline,
	        ownUserId = options.ownUserId;
	    _this._timeline = timeline;
	    _this._tiles = new TilesCollection(timeline.entries, tilesCreator({
	      room: room,
	      ownUserId: ownUserId,
	      clock: _this.clock
	    }));
	    return _this;
	  }
	  _createClass(TimelineViewModel, [{
	    key: "loadAtTop",
	    value: function () {
	      var _loadAtTop = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        var firstTile;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                firstTile = this._tiles.getFirst();
	                if (!(firstTile.shape === "gap")) {
	                  _context.next = 5;
	                  break;
	                }
	                return _context.abrupt("return", firstTile.fill());
	              case 5:
	                _context.next = 7;
	                return this._timeline.loadAtTop(10);
	              case 7:
	                return _context.abrupt("return", false);
	              case 8:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function loadAtTop() {
	        return _loadAtTop.apply(this, arguments);
	      }
	      return loadAtTop;
	    }()
	  }, {
	    key: "unloadAtTop",
	    value: function unloadAtTop(tileAmount) {
	    }
	  }, {
	    key: "loadAtBottom",
	    value: function loadAtBottom() {}
	  }, {
	    key: "unloadAtBottom",
	    value: function unloadAtBottom(tileAmount) {
	    }
	  }, {
	    key: "tiles",
	    get: function get() {
	      return this._tiles;
	    }
	  }]);
	  return TimelineViewModel;
	}(ViewModel);

	function _templateObject$2() {
	  var data = _taggedTemplateLiteral(["Empty Room"]);
	  _templateObject$2 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var RoomViewModel = function (_ViewModel) {
	  _inherits(RoomViewModel, _ViewModel);
	  var _super = _createSuper(RoomViewModel);
	  function RoomViewModel(options) {
	    var _this;
	    _classCallCheck(this, RoomViewModel);
	    _this = _super.call(this, options);
	    var room = options.room,
	        ownUserId = options.ownUserId,
	        closeCallback = options.closeCallback;
	    _this._room = room;
	    _this._ownUserId = ownUserId;
	    _this._timeline = null;
	    _this._timelineVM = null;
	    _this._onRoomChange = _this._onRoomChange.bind(_assertThisInitialized(_this));
	    _this._timelineError = null;
	    _this._sendError = null;
	    _this._closeCallback = closeCallback;
	    _this._composerVM = new ComposerViewModel(_assertThisInitialized(_this));
	    _this._clearUnreadTimout = null;
	    return _this;
	  }
	  _createClass(RoomViewModel, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._room.on("change", this._onRoomChange);
	                _context.prev = 1;
	                this._timeline = this.track(this._room.openTimeline());
	                _context.next = 5;
	                return this._timeline.load();
	              case 5:
	                this._timelineVM = new TimelineViewModel(this.childOptions({
	                  room: this._room,
	                  timeline: this._timeline,
	                  ownUserId: this._ownUserId
	                }));
	                this.emitChange("timelineViewModel");
	                _context.next = 14;
	                break;
	              case 9:
	                _context.prev = 9;
	                _context.t0 = _context["catch"](1);
	                console.error("room.openTimeline(): ".concat(_context.t0.message, ":\n").concat(_context.t0.stack));
	                this._timelineError = _context.t0;
	                this.emitChange("error");
	              case 14:
	                this._clearUnreadTimout = this.clock.createTimeout(2000);
	                _context.prev = 15;
	                _context.next = 18;
	                return this._clearUnreadTimout.elapsed();
	              case 18:
	                _context.next = 20;
	                return this._room.clearUnread();
	              case 20:
	                _context.next = 26;
	                break;
	              case 22:
	                _context.prev = 22;
	                _context.t1 = _context["catch"](15);
	                if (!(_context.t1.name !== "AbortError")) {
	                  _context.next = 26;
	                  break;
	                }
	                throw _context.t1;
	              case 26:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[1, 9], [15, 22]]);
	      }));
	      function load() {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      _get(_getPrototypeOf(RoomViewModel.prototype), "dispose", this).call(this);
	      if (this._clearUnreadTimout) {
	        this._clearUnreadTimout.abort();
	        this._clearUnreadTimout = null;
	      }
	    }
	  }, {
	    key: "close",
	    value: function close() {
	      this._closeCallback();
	    }
	  }, {
	    key: "_onRoomChange",
	    value: function _onRoomChange() {
	      this.emitChange("name");
	    }
	  }, {
	    key: "_sendMessage",
	    value: function () {
	      var _sendMessage2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(message) {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                if (!message) {
	                  _context2.next = 14;
	                  break;
	                }
	                _context2.prev = 1;
	                _context2.next = 4;
	                return this._room.sendEvent("m.room.message", {
	                  msgtype: "m.text",
	                  body: message
	                });
	              case 4:
	                _context2.next = 13;
	                break;
	              case 6:
	                _context2.prev = 6;
	                _context2.t0 = _context2["catch"](1);
	                console.error("room.sendMessage(): ".concat(_context2.t0.message, ":\n").concat(_context2.t0.stack));
	                this._sendError = _context2.t0;
	                this._timelineError = null;
	                this.emitChange("error");
	                return _context2.abrupt("return", false);
	              case 13:
	                return _context2.abrupt("return", true);
	              case 14:
	                return _context2.abrupt("return", false);
	              case 15:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[1, 6]]);
	      }));
	      function _sendMessage(_x) {
	        return _sendMessage2.apply(this, arguments);
	      }
	      return _sendMessage;
	    }()
	  }, {
	    key: "name",
	    get: function get() {
	      return this._room.name || this.i18n(_templateObject$2());
	    }
	  }, {
	    key: "timelineViewModel",
	    get: function get() {
	      return this._timelineVM;
	    }
	  }, {
	    key: "error",
	    get: function get() {
	      if (this._timelineError) {
	        return "Something went wrong loading the timeline: ".concat(this._timelineError.message);
	      }
	      if (this._sendError) {
	        return "Something went wrong sending your message: ".concat(this._sendError.message);
	      }
	      return "";
	    }
	  }, {
	    key: "avatarLetter",
	    get: function get() {
	      return avatarInitials(this.name);
	    }
	  }, {
	    key: "avatarColorNumber",
	    get: function get() {
	      return getIdentifierColorNumber(this._room.id);
	    }
	  }, {
	    key: "avatarUrl",
	    get: function get() {
	      if (this._room.avatarUrl) {
	        return this._room.mediaRepository.mxcUrlThumbnail(this._room.avatarUrl, 32, 32, "crop");
	      }
	      return null;
	    }
	  }, {
	    key: "avatarTitle",
	    get: function get() {
	      return this.name;
	    }
	  }, {
	    key: "composerViewModel",
	    get: function get() {
	      return this._composerVM;
	    }
	  }]);
	  return RoomViewModel;
	}(ViewModel);
	var ComposerViewModel = function (_ViewModel2) {
	  _inherits(ComposerViewModel, _ViewModel2);
	  var _super2 = _createSuper(ComposerViewModel);
	  function ComposerViewModel(roomVM) {
	    var _this2;
	    _classCallCheck(this, ComposerViewModel);
	    _this2 = _super2.call(this);
	    _this2._roomVM = roomVM;
	    _this2._isEmpty = true;
	    return _this2;
	  }
	  _createClass(ComposerViewModel, [{
	    key: "sendMessage",
	    value: function sendMessage(message) {
	      var success = this._roomVM._sendMessage(message);
	      if (success) {
	        this._isEmpty = true;
	        this.emitChange("canSend");
	      }
	      return success;
	    }
	  }, {
	    key: "setInput",
	    value: function setInput(text) {
	      this._isEmpty = text.length === 0;
	      this.emitChange("canSend");
	    }
	  }, {
	    key: "canSend",
	    get: function get() {
	      return !this._isEmpty;
	    }
	  }]);
	  return ComposerViewModel;
	}(ViewModel);

	function _templateObject4() {
	  var data = _taggedTemplateLiteral(["Sync failed because of ", ""]);
	  _templateObject4 = function _templateObject4() {
	    return data;
	  };
	  return data;
	}
	function _templateObject3() {
	  var data = _taggedTemplateLiteral(["Catching up with your conversations\u2026"]);
	  _templateObject3 = function _templateObject3() {
	    return data;
	  };
	  return data;
	}
	function _templateObject2() {
	  var data = _taggedTemplateLiteral(["Trying to reconnect now\u2026"]);
	  _templateObject2 = function _templateObject2() {
	    return data;
	  };
	  return data;
	}
	function _templateObject$3() {
	  var data = _taggedTemplateLiteral(["Disconnected, trying to reconnect in ", "s\u2026"]);
	  _templateObject$3 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var SessionStatus = createEnum("Disconnected", "Connecting", "FirstSync", "Sending", "Syncing", "SyncError");
	var SessionStatusViewModel = function (_ViewModel) {
	  _inherits(SessionStatusViewModel, _ViewModel);
	  var _super = _createSuper(SessionStatusViewModel);
	  function SessionStatusViewModel(options) {
	    var _this;
	    _classCallCheck(this, SessionStatusViewModel);
	    _this = _super.call(this, options);
	    var sync = options.sync,
	        reconnector = options.reconnector;
	    _this._sync = sync;
	    _this._reconnector = reconnector;
	    _this._status = _this._calculateState(reconnector.connectionStatus.get(), sync.status.get());
	    return _this;
	  }
	  _createClass(SessionStatusViewModel, [{
	    key: "start",
	    value: function start() {
	      var _this2 = this;
	      var update = function update() {
	        return _this2._updateStatus();
	      };
	      this.track(this._sync.status.subscribe(update));
	      this.track(this._reconnector.connectionStatus.subscribe(update));
	    }
	  }, {
	    key: "_updateStatus",
	    value: function _updateStatus() {
	      var _this3 = this;
	      var newStatus = this._calculateState(this._reconnector.connectionStatus.get(), this._sync.status.get());
	      if (newStatus !== this._status) {
	        if (newStatus === SessionStatus.Disconnected) {
	          this._retryTimer = this.track(this.clock.createInterval(function () {
	            _this3.emitChange("statusLabel");
	          }, 1000));
	        } else {
	          this._retryTimer = this.disposeTracked(this._retryTimer);
	        }
	        this._status = newStatus;
	        console.log("newStatus", newStatus);
	        this.emitChange();
	      }
	    }
	  }, {
	    key: "_calculateState",
	    value: function _calculateState(connectionStatus, syncStatus) {
	      if (connectionStatus !== ConnectionStatus.Online) {
	        switch (connectionStatus) {
	          case ConnectionStatus.Reconnecting:
	            return SessionStatus.Connecting;
	          case ConnectionStatus.Waiting:
	            return SessionStatus.Disconnected;
	        }
	      } else if (syncStatus !== SyncStatus.Syncing) {
	        switch (syncStatus) {
	          case SyncStatus.InitialSync:
	          case SyncStatus.CatchupSync:
	            return SessionStatus.FirstSync;
	          case SyncStatus.Stopped:
	            return SessionStatus.SyncError;
	        }
	      }
	      else {
	          return SessionStatus.Syncing;
	        }
	    }
	  }, {
	    key: "connectNow",
	    value: function connectNow() {
	      if (this.isConnectNowShown) {
	        this._reconnector.tryNow();
	      }
	    }
	  }, {
	    key: "isShown",
	    get: function get() {
	      return this._status !== SessionStatus.Syncing;
	    }
	  }, {
	    key: "statusLabel",
	    get: function get() {
	      switch (this._status) {
	        case SessionStatus.Disconnected:
	          {
	            var retryIn = Math.round(this._reconnector.retryIn / 1000);
	            return this.i18n(_templateObject$3(), retryIn);
	          }
	        case SessionStatus.Connecting:
	          return this.i18n(_templateObject2());
	        case SessionStatus.FirstSync:
	          return this.i18n(_templateObject3());
	        case SessionStatus.SyncError:
	          return this.i18n(_templateObject4(), this._sync.error);
	      }
	      return "";
	    }
	  }, {
	    key: "isWaiting",
	    get: function get() {
	      switch (this._status) {
	        case SessionStatus.Connecting:
	        case SessionStatus.FirstSync:
	          return true;
	        default:
	          return false;
	      }
	    }
	  }, {
	    key: "isConnectNowShown",
	    get: function get() {
	      return this._status === SessionStatus.Disconnected;
	    }
	  }]);
	  return SessionStatusViewModel;
	}(ViewModel);

	var SessionViewModel = function (_ViewModel) {
	  _inherits(SessionViewModel, _ViewModel);
	  var _super = _createSuper(SessionViewModel);
	  function SessionViewModel(options) {
	    var _this;
	    _classCallCheck(this, SessionViewModel);
	    _this = _super.call(this, options);
	    var sessionContainer = options.sessionContainer;
	    _this._session = sessionContainer.session;
	    _this._sessionStatusViewModel = _this.track(new SessionStatusViewModel(_this.childOptions({
	      sync: sessionContainer.sync,
	      reconnector: sessionContainer.reconnector
	    })));
	    _this._currentRoomTileViewModel = null;
	    _this._currentRoomViewModel = null;
	    var roomTileVMs = _this._session.rooms.mapValues(function (room, emitChange) {
	      return new RoomTileViewModel({
	        room: room,
	        emitChange: emitChange,
	        emitOpen: _this._openRoom.bind(_assertThisInitialized(_this))
	      });
	    });
	    _this._roomList = roomTileVMs.sortValues(function (a, b) {
	      return a.compare(b);
	    });
	    return _this;
	  }
	  _createClass(SessionViewModel, [{
	    key: "start",
	    value: function start() {
	      this._sessionStatusViewModel.start();
	    }
	  }, {
	    key: "_closeCurrentRoom",
	    value: function _closeCurrentRoom() {
	      var _this$_currentRoomTil;
	      (_this$_currentRoomTil = this._currentRoomTileViewModel) === null || _this$_currentRoomTil === void 0 ? void 0 : _this$_currentRoomTil.close();
	      this._currentRoomViewModel = this.disposeTracked(this._currentRoomViewModel);
	    }
	  }, {
	    key: "_openRoom",
	    value: function _openRoom(room, roomTileVM) {
	      var _this2 = this;
	      this._closeCurrentRoom();
	      this._currentRoomTileViewModel = roomTileVM;
	      this._currentRoomViewModel = this.track(new RoomViewModel(this.childOptions({
	        room: room,
	        ownUserId: this._session.user.id,
	        closeCallback: function closeCallback() {
	          _this2._closeCurrentRoom();
	          _this2.emitChange("currentRoom");
	        }
	      })));
	      this._currentRoomViewModel.load();
	      this.emitChange("currentRoom");
	    }
	  }, {
	    key: "sessionStatusViewModel",
	    get: function get() {
	      return this._sessionStatusViewModel;
	    }
	  }, {
	    key: "roomList",
	    get: function get() {
	      return this._roomList;
	    }
	  }, {
	    key: "currentRoom",
	    get: function get() {
	      return this._currentRoomViewModel;
	    }
	  }]);
	  return SessionViewModel;
	}(ViewModel);

	var SessionLoadViewModel = function (_ViewModel) {
	  _inherits(SessionLoadViewModel, _ViewModel);
	  var _super = _createSuper(SessionLoadViewModel);
	  function SessionLoadViewModel(options) {
	    var _this;
	    _classCallCheck(this, SessionLoadViewModel);
	    _this = _super.call(this, options);
	    var createAndStartSessionContainer = options.createAndStartSessionContainer,
	        sessionCallback = options.sessionCallback,
	        homeserver = options.homeserver,
	        deleteSessionOnCancel = options.deleteSessionOnCancel;
	    _this._createAndStartSessionContainer = createAndStartSessionContainer;
	    _this._sessionCallback = sessionCallback;
	    _this._homeserver = homeserver;
	    _this._deleteSessionOnCancel = deleteSessionOnCancel;
	    _this._loading = false;
	    _this._error = null;
	    return _this;
	  }
	  _createClass(SessionLoadViewModel, [{
	    key: "start",
	    value: function () {
	      var _start = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        var _this2 = this;
	        var loadStatus;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!this._loading) {
	                  _context.next = 2;
	                  break;
	                }
	                return _context.abrupt("return");
	              case 2:
	                _context.prev = 2;
	                this._loading = true;
	                this.emitChange("loading");
	                this._sessionContainer = this._createAndStartSessionContainer();
	                this._waitHandle = this._sessionContainer.loadStatus.waitFor(function (s) {
	                  _this2.emitChange("loadLabel");
	                  var isCatchupSync = s === LoadStatus.FirstSync && _this2._sessionContainer.sync.status.get() === SyncStatus.CatchupSync;
	                  return isCatchupSync || s === LoadStatus.LoginFailed || s === LoadStatus.Error || s === LoadStatus.Ready;
	                });
	                _context.prev = 7;
	                _context.next = 10;
	                return this._waitHandle.promise;
	              case 10:
	                _context.next = 15;
	                break;
	              case 12:
	                _context.prev = 12;
	                _context.t0 = _context["catch"](7);
	                return _context.abrupt("return");
	              case 15:
	                loadStatus = this._sessionContainer.loadStatus.get();
	                if (loadStatus === LoadStatus.FirstSync || loadStatus === LoadStatus.Ready) {
	                  this._sessionCallback(this._sessionContainer);
	                }
	                if (this._sessionContainer.loadError) {
	                  console.error("session load error", this._sessionContainer.loadError);
	                }
	                _context.next = 24;
	                break;
	              case 20:
	                _context.prev = 20;
	                _context.t1 = _context["catch"](2);
	                this._error = _context.t1;
	                console.error("error thrown during session load", _context.t1.stack);
	              case 24:
	                _context.prev = 24;
	                this._loading = false;
	                this.emitChange("loading");
	                return _context.finish(24);
	              case 28:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[2, 20, 24, 28], [7, 12]]);
	      }));
	      function start() {
	        return _start.apply(this, arguments);
	      }
	      return start;
	    }()
	  }, {
	    key: "cancel",
	    value: function () {
	      var _cancel = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.prev = 0;
	                if (!this._sessionContainer) {
	                  _context2.next = 7;
	                  break;
	                }
	                this._sessionContainer.stop();
	                if (!this._deleteSessionOnCancel) {
	                  _context2.next = 6;
	                  break;
	                }
	                _context2.next = 6;
	                return this._sessionContainer.deleteSession();
	              case 6:
	                this._sessionContainer = null;
	              case 7:
	                if (this._waitHandle) {
	                  this._waitHandle.dispose();
	                  this._waitHandle = null;
	                }
	                this._sessionCallback();
	                _context2.next = 15;
	                break;
	              case 11:
	                _context2.prev = 11;
	                _context2.t0 = _context2["catch"](0);
	                this._error = _context2.t0;
	                this.emitChange();
	              case 15:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[0, 11]]);
	      }));
	      function cancel() {
	        return _cancel.apply(this, arguments);
	      }
	      return cancel;
	    }()
	  }, {
	    key: "loading",
	    get: function get() {
	      return this._loading;
	    }
	  }, {
	    key: "loadLabel",
	    get: function get() {
	      var sc = this._sessionContainer;
	      var error = this._error || sc && sc.loadError;
	      if (error || sc && sc.loadStatus.get() === LoadStatus.Error) {
	        return "Something went wrong: ".concat(error && error.message, ".");
	      }
	      if (sc) {
	        switch (sc.loadStatus.get()) {
	          case LoadStatus.NotLoading:
	            return "Preparing\u2026";
	          case LoadStatus.Login:
	            return "Checking your login and password\u2026";
	          case LoadStatus.LoginFailed:
	            switch (sc.loginFailure) {
	              case LoginFailure.LoginFailure:
	                return "Your username and/or password don't seem to be correct.";
	              case LoginFailure.Connection:
	                return "Can't connect to ".concat(this._homeserver, ".");
	              case LoginFailure.Unknown:
	                return "Something went wrong while checking your login and password.";
	            }
	            break;
	          case LoadStatus.SessionSetup:
	            return "Setting up your encryption keys\u2026";
	          case LoadStatus.Loading:
	            return "Loading your conversations\u2026";
	          case LoadStatus.FirstSync:
	            return "Getting your conversations from the server\u2026";
	          default:
	            return this._sessionContainer.loadStatus.get();
	        }
	      }
	      return "Preparing\u2026";
	    }
	  }]);
	  return SessionLoadViewModel;
	}(ViewModel);

	var LoginViewModel = function (_ViewModel) {
	  _inherits(LoginViewModel, _ViewModel);
	  var _super = _createSuper(LoginViewModel);
	  function LoginViewModel(options) {
	    var _this;
	    _classCallCheck(this, LoginViewModel);
	    _this = _super.call(this, options);
	    var sessionCallback = options.sessionCallback,
	        defaultHomeServer = options.defaultHomeServer,
	        createSessionContainer = options.createSessionContainer;
	    _this._createSessionContainer = createSessionContainer;
	    _this._sessionCallback = sessionCallback;
	    _this._defaultHomeServer = defaultHomeServer;
	    _this._loadViewModel = null;
	    _this._loadViewModelSubscription = null;
	    return _this;
	  }
	  _createClass(LoginViewModel, [{
	    key: "login",
	    value: function () {
	      var _login = _asyncToGenerator( regeneratorRuntime.mark(function _callee(username, password, homeserver) {
	        var _this2 = this;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._loadViewModelSubscription = this.disposeTracked(this._loadViewModelSubscription);
	                if (this._loadViewModel) {
	                  this._loadViewModel.cancel();
	                }
	                this._loadViewModel = new SessionLoadViewModel({
	                  createAndStartSessionContainer: function createAndStartSessionContainer() {
	                    var sessionContainer = _this2._createSessionContainer();
	                    sessionContainer.startWithLogin(homeserver, username, password);
	                    return sessionContainer;
	                  },
	                  sessionCallback: function sessionCallback(sessionContainer) {
	                    if (sessionContainer) {
	                      _this2._sessionCallback(sessionContainer);
	                    } else {
	                      _this2._loadViewModel = null;
	                      _this2.emitChange("loadViewModel");
	                    }
	                  },
	                  deleteSessionOnCancel: true,
	                  homeserver: homeserver
	                });
	                this._loadViewModel.start();
	                this.emitChange("loadViewModel");
	                this._loadViewModelSubscription = this.track(this._loadViewModel.disposableOn("change", function () {
	                  if (!_this2._loadViewModel.loading) {
	                    _this2._loadViewModelSubscription = _this2.disposeTracked(_this2._loadViewModelSubscription);
	                  }
	                  _this2.emitChange("isBusy");
	                }));
	              case 6:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function login(_x, _x2, _x3) {
	        return _login.apply(this, arguments);
	      }
	      return login;
	    }()
	  }, {
	    key: "cancel",
	    value: function cancel() {
	      if (!this.isBusy) {
	        this._sessionCallback();
	      }
	    }
	  }, {
	    key: "defaultHomeServer",
	    get: function get() {
	      return this._defaultHomeServer;
	    }
	  }, {
	    key: "loadViewModel",
	    get: function get() {
	      return this._loadViewModel;
	    }
	  }, {
	    key: "isBusy",
	    get: function get() {
	      if (!this._loadViewModel) {
	        return false;
	      } else {
	        return this._loadViewModel.loading;
	      }
	    }
	  }]);
	  return LoginViewModel;
	}(ViewModel);

	var SessionItemViewModel = function (_ViewModel) {
	  _inherits(SessionItemViewModel, _ViewModel);
	  var _super = _createSuper(SessionItemViewModel);
	  function SessionItemViewModel(sessionInfo, pickerVM) {
	    var _this;
	    _classCallCheck(this, SessionItemViewModel);
	    _this = _super.call(this, {});
	    _this._pickerVM = pickerVM;
	    _this._sessionInfo = sessionInfo;
	    _this._isDeleting = false;
	    _this._isClearing = false;
	    _this._error = null;
	    _this._exportDataUrl = null;
	    return _this;
	  }
	  _createClass(SessionItemViewModel, [{
	    key: "delete",
	    value: function () {
	      var _delete2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                this._isDeleting = true;
	                this.emitChange("isDeleting");
	                _context.prev = 2;
	                _context.next = 5;
	                return this._pickerVM.delete(this.id);
	              case 5:
	                _context.next = 12;
	                break;
	              case 7:
	                _context.prev = 7;
	                _context.t0 = _context["catch"](2);
	                this._error = _context.t0;
	                console.error(_context.t0);
	                this.emitChange("error");
	              case 12:
	                _context.prev = 12;
	                this._isDeleting = false;
	                this.emitChange("isDeleting");
	                return _context.finish(12);
	              case 16:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[2, 7, 12, 16]]);
	      }));
	      function _delete() {
	        return _delete2.apply(this, arguments);
	      }
	      return _delete;
	    }()
	  }, {
	    key: "clear",
	    value: function () {
	      var _clear = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                this._isClearing = true;
	                this.emitChange();
	                _context2.prev = 2;
	                _context2.next = 5;
	                return this._pickerVM.clear(this.id);
	              case 5:
	                _context2.next = 12;
	                break;
	              case 7:
	                _context2.prev = 7;
	                _context2.t0 = _context2["catch"](2);
	                this._error = _context2.t0;
	                console.error(_context2.t0);
	                this.emitChange("error");
	              case 12:
	                _context2.prev = 12;
	                this._isClearing = false;
	                this.emitChange("isClearing");
	                return _context2.finish(12);
	              case 16:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[2, 7, 12, 16]]);
	      }));
	      function clear() {
	        return _clear.apply(this, arguments);
	      }
	      return clear;
	    }()
	  }, {
	    key: "export",
	    value: function () {
	      var _export2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee3() {
	        var data, json, blob;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.prev = 0;
	                _context3.next = 3;
	                return this._pickerVM._exportData(this._sessionInfo.id);
	              case 3:
	                data = _context3.sent;
	                json = JSON.stringify(data, undefined, 2);
	                blob = new Blob([json], {
	                  type: "application/json"
	                });
	                this._exportDataUrl = URL.createObjectURL(blob);
	                this.emitChange("exportDataUrl");
	                _context3.next = 14;
	                break;
	              case 10:
	                _context3.prev = 10;
	                _context3.t0 = _context3["catch"](0);
	                alert(_context3.t0.message);
	                console.error(_context3.t0);
	              case 14:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this, [[0, 10]]);
	      }));
	      function _export() {
	        return _export2.apply(this, arguments);
	      }
	      return _export;
	    }()
	  }, {
	    key: "clearExport",
	    value: function clearExport() {
	      if (this._exportDataUrl) {
	        URL.revokeObjectURL(this._exportDataUrl);
	        this._exportDataUrl = null;
	        this.emitChange("exportDataUrl");
	      }
	    }
	  }, {
	    key: "error",
	    get: function get() {
	      return this._error && this._error.message;
	    }
	  }, {
	    key: "isDeleting",
	    get: function get() {
	      return this._isDeleting;
	    }
	  }, {
	    key: "isClearing",
	    get: function get() {
	      return this._isClearing;
	    }
	  }, {
	    key: "id",
	    get: function get() {
	      return this._sessionInfo.id;
	    }
	  }, {
	    key: "label",
	    get: function get() {
	      var _this$_sessionInfo = this._sessionInfo,
	          userId = _this$_sessionInfo.userId,
	          comment = _this$_sessionInfo.comment;
	      if (comment) {
	        return "".concat(userId, " (").concat(comment, ")");
	      } else {
	        return userId;
	      }
	    }
	  }, {
	    key: "sessionInfo",
	    get: function get() {
	      return this._sessionInfo;
	    }
	  }, {
	    key: "exportDataUrl",
	    get: function get() {
	      return this._exportDataUrl;
	    }
	  }, {
	    key: "avatarColorNumber",
	    get: function get() {
	      return getIdentifierColorNumber(this._sessionInfo.userId);
	    }
	  }, {
	    key: "avatarInitials",
	    get: function get() {
	      return avatarInitials(this._sessionInfo.userId);
	    }
	  }]);
	  return SessionItemViewModel;
	}(ViewModel);
	var SessionPickerViewModel = function (_ViewModel2) {
	  _inherits(SessionPickerViewModel, _ViewModel2);
	  var _super2 = _createSuper(SessionPickerViewModel);
	  function SessionPickerViewModel(options) {
	    var _this2;
	    _classCallCheck(this, SessionPickerViewModel);
	    _this2 = _super2.call(this, options);
	    var storageFactory = options.storageFactory,
	        sessionInfoStorage = options.sessionInfoStorage,
	        sessionCallback = options.sessionCallback,
	        createSessionContainer = options.createSessionContainer;
	    _this2._storageFactory = storageFactory;
	    _this2._sessionInfoStorage = sessionInfoStorage;
	    _this2._sessionCallback = sessionCallback;
	    _this2._createSessionContainer = createSessionContainer;
	    _this2._sessions = new SortedArray(function (s1, s2) {
	      return s1.id.localeCompare(s2.id);
	    });
	    _this2._loadViewModel = null;
	    _this2._error = null;
	    return _this2;
	  }
	  _createClass(SessionPickerViewModel, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee4() {
	        var _this3 = this;
	        var sessions;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this._sessionInfoStorage.getAll();
	              case 2:
	                sessions = _context4.sent;
	                this._sessions.setManyUnsorted(sessions.map(function (s) {
	                  return new SessionItemViewModel(s, _this3);
	                }));
	              case 4:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));
	      function load() {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "pick",
	    value: function () {
	      var _pick = _asyncToGenerator( regeneratorRuntime.mark(function _callee5(id) {
	        var _this4 = this;
	        var sessionVM;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                if (!this._loadViewModel) {
	                  _context5.next = 2;
	                  break;
	                }
	                return _context5.abrupt("return");
	              case 2:
	                sessionVM = this._sessions.array.find(function (s) {
	                  return s.id === id;
	                });
	                if (sessionVM) {
	                  this._loadViewModel = new SessionLoadViewModel({
	                    createAndStartSessionContainer: function createAndStartSessionContainer() {
	                      var sessionContainer = _this4._createSessionContainer();
	                      sessionContainer.startWithExistingSession(sessionVM.id);
	                      return sessionContainer;
	                    },
	                    sessionCallback: function sessionCallback(sessionContainer) {
	                      if (sessionContainer) {
	                        _this4._sessionCallback(sessionContainer);
	                      } else {
	                        _this4._loadViewModel = null;
	                        _this4.emitChange("loadViewModel");
	                      }
	                    }
	                  });
	                  this._loadViewModel.start();
	                  this.emitChange("loadViewModel");
	                }
	              case 4:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));
	      function pick(_x) {
	        return _pick.apply(this, arguments);
	      }
	      return pick;
	    }()
	  }, {
	    key: "_exportData",
	    value: function () {
	      var _exportData2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee6(id) {
	        var sessionInfo, stores, data;
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                _context6.next = 2;
	                return this._sessionInfoStorage.get(id);
	              case 2:
	                sessionInfo = _context6.sent;
	                _context6.next = 5;
	                return this._storageFactory.export(id);
	              case 5:
	                stores = _context6.sent;
	                data = {
	                  sessionInfo: sessionInfo,
	                  stores: stores
	                };
	                return _context6.abrupt("return", data);
	              case 8:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));
	      function _exportData(_x2) {
	        return _exportData2.apply(this, arguments);
	      }
	      return _exportData;
	    }()
	  }, {
	    key: "import",
	    value: function () {
	      var _import2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee7(json) {
	        var data, sessionInfo;
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                _context7.prev = 0;
	                data = JSON.parse(json);
	                sessionInfo = data.sessionInfo;
	                sessionInfo.comment = "Imported on ".concat(new Date().toLocaleString(), " from id ").concat(sessionInfo.id, ".");
	                sessionInfo.id = this._createSessionContainer().createNewSessionId();
	                _context7.next = 7;
	                return this._storageFactory.import(sessionInfo.id, data.stores);
	              case 7:
	                _context7.next = 9;
	                return this._sessionInfoStorage.add(sessionInfo);
	              case 9:
	                this._sessions.set(new SessionItemViewModel(sessionInfo, this));
	                _context7.next = 16;
	                break;
	              case 12:
	                _context7.prev = 12;
	                _context7.t0 = _context7["catch"](0);
	                alert(_context7.t0.message);
	                console.error(_context7.t0);
	              case 16:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this, [[0, 12]]);
	      }));
	      function _import(_x3) {
	        return _import2.apply(this, arguments);
	      }
	      return _import;
	    }()
	  }, {
	    key: "delete",
	    value: function () {
	      var _delete3 = _asyncToGenerator( regeneratorRuntime.mark(function _callee8(id) {
	        var idx;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                idx = this._sessions.array.findIndex(function (s) {
	                  return s.id === id;
	                });
	                _context8.next = 3;
	                return this._sessionInfoStorage.delete(id);
	              case 3:
	                _context8.next = 5;
	                return this._storageFactory.delete(id);
	              case 5:
	                this._sessions.remove(idx);
	              case 6:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));
	      function _delete(_x4) {
	        return _delete3.apply(this, arguments);
	      }
	      return _delete;
	    }()
	  }, {
	    key: "clear",
	    value: function () {
	      var _clear2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee9(id) {
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                _context9.next = 2;
	                return this._storageFactory.delete(id);
	              case 2:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this);
	      }));
	      function clear(_x5) {
	        return _clear2.apply(this, arguments);
	      }
	      return clear;
	    }()
	  }, {
	    key: "cancel",
	    value: function cancel() {
	      if (!this._loadViewModel) {
	        this._sessionCallback();
	      }
	    }
	  }, {
	    key: "loadViewModel",
	    get: function get() {
	      return this._loadViewModel;
	    }
	  }, {
	    key: "sessions",
	    get: function get() {
	      return this._sessions;
	    }
	  }]);
	  return SessionPickerViewModel;
	}(ViewModel);

	var BrawlViewModel = function (_ViewModel) {
	  _inherits(BrawlViewModel, _ViewModel);
	  var _super = _createSuper(BrawlViewModel);
	  function BrawlViewModel(options) {
	    var _this;
	    _classCallCheck(this, BrawlViewModel);
	    _this = _super.call(this, options);
	    var createSessionContainer = options.createSessionContainer,
	        sessionInfoStorage = options.sessionInfoStorage,
	        storageFactory = options.storageFactory;
	    _this._createSessionContainer = createSessionContainer;
	    _this._sessionInfoStorage = sessionInfoStorage;
	    _this._storageFactory = storageFactory;
	    _this._error = null;
	    _this._sessionViewModel = null;
	    _this._loginViewModel = null;
	    _this._sessionPickerViewModel = null;
	    _this._sessionContainer = null;
	    _this._sessionCallback = _this._sessionCallback.bind(_assertThisInitialized(_this));
	    return _this;
	  }
	  _createClass(BrawlViewModel, [{
	    key: "load",
	    value: function () {
	      var _load = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this._sessionInfoStorage.hasAnySession();
	              case 2:
	                if (!_context.sent) {
	                  _context.next = 6;
	                  break;
	                }
	                this._showPicker();
	                _context.next = 7;
	                break;
	              case 6:
	                this._showLogin();
	              case 7:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));
	      function load() {
	        return _load.apply(this, arguments);
	      }
	      return load;
	    }()
	  }, {
	    key: "_sessionCallback",
	    value: function _sessionCallback(sessionContainer) {
	      var _this2 = this;
	      if (sessionContainer) {
	        this._setSection(function () {
	          _this2._sessionContainer = sessionContainer;
	          _this2._sessionViewModel = new SessionViewModel(_this2.childOptions({
	            sessionContainer: sessionContainer
	          }));
	          _this2._sessionViewModel.start();
	        });
	      } else {
	        if (this.activeSection === "login") {
	          this._showPicker();
	        } else {
	          this._showLogin();
	        }
	      }
	    }
	  }, {
	    key: "_showPicker",
	    value: function () {
	      var _showPicker2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var _this3 = this;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                this._setSection(function () {
	                  _this3._sessionPickerViewModel = new SessionPickerViewModel({
	                    sessionInfoStorage: _this3._sessionInfoStorage,
	                    storageFactory: _this3._storageFactory,
	                    createSessionContainer: _this3._createSessionContainer,
	                    sessionCallback: _this3._sessionCallback
	                  });
	                });
	                _context2.prev = 1;
	                _context2.next = 4;
	                return this._sessionPickerViewModel.load();
	              case 4:
	                _context2.next = 9;
	                break;
	              case 6:
	                _context2.prev = 6;
	                _context2.t0 = _context2["catch"](1);
	                this._setSection(function () {
	                  return _this3._error = _context2.t0;
	                });
	              case 9:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this, [[1, 6]]);
	      }));
	      function _showPicker() {
	        return _showPicker2.apply(this, arguments);
	      }
	      return _showPicker;
	    }()
	  }, {
	    key: "_showLogin",
	    value: function _showLogin() {
	      var _this4 = this;
	      this._setSection(function () {
	        _this4._loginViewModel = new LoginViewModel({
	          defaultHomeServer: "https://matrix.org",
	          createSessionContainer: _this4._createSessionContainer,
	          sessionCallback: _this4._sessionCallback
	        });
	      });
	    }
	  }, {
	    key: "_setSection",
	    value: function _setSection(setter) {
	      this._error = null;
	      this._sessionViewModel = null;
	      this._loginViewModel = null;
	      this._sessionPickerViewModel = null;
	      if (this._sessionContainer) {
	        this._sessionContainer.stop();
	        this._sessionContainer = null;
	      }
	      setter();
	      this.emitChange("activeSection");
	    }
	  }, {
	    key: "activeSection",
	    get: function get() {
	      if (this._error) {
	        return "error";
	      } else if (this._sessionViewModel) {
	        return "session";
	      } else if (this._loginViewModel) {
	        return "login";
	      } else {
	        return "picker";
	      }
	    }
	  }, {
	    key: "error",
	    get: function get() {
	      return this._error;
	    }
	  }, {
	    key: "sessionViewModel",
	    get: function get() {
	      return this._sessionViewModel;
	    }
	  }, {
	    key: "loginViewModel",
	    get: function get() {
	      return this._loginViewModel;
	    }
	  }, {
	    key: "sessionPickerViewModel",
	    get: function get() {
	      return this._sessionPickerViewModel;
	    }
	  }]);
	  return BrawlViewModel;
	}(ViewModel);

	var _TAG_NAMES;
	function isChildren(children) {
	  return _typeof(children) !== "object" || !!children.nodeType || Array.isArray(children);
	}
	function classNames(obj, value) {
	  return Object.entries(obj).reduce(function (cn, _ref) {
	    var _ref2 = _slicedToArray(_ref, 2),
	        name = _ref2[0],
	        enabled = _ref2[1];
	    if (typeof enabled === "function") {
	      enabled = enabled(value);
	    }
	    if (enabled) {
	      return cn + (cn.length ? " " : "") + name;
	    } else {
	      return cn;
	    }
	  }, "");
	}
	function setAttribute(el, name, value) {
	  if (name === "className") {
	    name = "class";
	  }
	  if (value === false) {
	    el.removeAttribute(name);
	  } else {
	    if (value === true) {
	      value = name;
	    }
	    el.setAttribute(name, value);
	  }
	}
	function elNS(ns, elementName, attributes, children) {
	  if (attributes && isChildren(attributes)) {
	    children = attributes;
	    attributes = null;
	  }
	  var e = document.createElementNS(ns, elementName);
	  if (attributes) {
	    for (var _i = 0, _Object$entries = Object.entries(attributes); _i < _Object$entries.length; _i++) {
	      var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
	          name = _Object$entries$_i[0],
	          value = _Object$entries$_i[1];
	      if (name === "className" && _typeof(value) === "object" && value !== null) {
	        value = classNames(value);
	      }
	      setAttribute(e, name, value);
	    }
	  }
	  if (children) {
	    if (!Array.isArray(children)) {
	      children = [children];
	    }
	    var _iterator = _createForOfIteratorHelper(children),
	        _step;
	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var c = _step.value;
	        if (!c.nodeType) {
	          c = text(c);
	        }
	        e.appendChild(c);
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	  }
	  return e;
	}
	function text(str) {
	  return document.createTextNode(str);
	}
	var HTML_NS = "http://www.w3.org/1999/xhtml";
	var SVG_NS = "http://www.w3.org/2000/svg";
	var TAG_NAMES = (_TAG_NAMES = {}, _defineProperty(_TAG_NAMES, HTML_NS, ["a", "ol", "ul", "li", "div", "h1", "h2", "h3", "h4", "h5", "h6", "p", "strong", "em", "span", "img", "section", "main", "article", "aside", "pre", "button", "time", "input", "textarea", "label"]), _defineProperty(_TAG_NAMES, SVG_NS, ["svg", "circle"]), _TAG_NAMES);
	var tag = {};
	var _loop = function _loop() {
	  var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
	      ns = _Object$entries2$_i[0],
	      tags = _Object$entries2$_i[1];
	  var _iterator2 = _createForOfIteratorHelper(tags),
	      _step2;
	  try {
	    var _loop2 = function _loop2() {
	      var tagName = _step2.value;
	      tag[tagName] = function (attributes, children) {
	        return elNS(ns, tagName, attributes, children);
	      };
	    };
	    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	      _loop2();
	    }
	  } catch (err) {
	    _iterator2.e(err);
	  } finally {
	    _iterator2.f();
	  }
	};
	for (var _i2 = 0, _Object$entries2 = Object.entries(TAG_NAMES); _i2 < _Object$entries2.length; _i2++) {
	  _loop();
	}

	function insertAt(parentNode, idx, childNode) {
	  var isLast = idx === parentNode.childElementCount;
	  if (isLast) {
	    parentNode.appendChild(childNode);
	  } else {
	    var nextDomNode = parentNode.children[idx];
	    parentNode.insertBefore(childNode, nextDomNode);
	  }
	}
	var ListView = function () {
	  function ListView(_ref, childCreator) {
	    var list = _ref.list,
	        onItemClick = _ref.onItemClick,
	        className = _ref.className,
	        _ref$parentProvidesUp = _ref.parentProvidesUpdates,
	        parentProvidesUpdates = _ref$parentProvidesUp === void 0 ? true : _ref$parentProvidesUp;
	    _classCallCheck(this, ListView);
	    this._onItemClick = onItemClick;
	    this._list = list;
	    this._className = className;
	    this._root = null;
	    this._subscription = null;
	    this._childCreator = childCreator;
	    this._childInstances = null;
	    this._mountArgs = {
	      parentProvidesUpdates: parentProvidesUpdates
	    };
	    this._onClick = this._onClick.bind(this);
	  }
	  _createClass(ListView, [{
	    key: "root",
	    value: function root() {
	      return this._root;
	    }
	  }, {
	    key: "update",
	    value: function update(attributes) {
	      if (attributes.hasOwnProperty("list")) {
	        if (this._subscription) {
	          this._unloadList();
	          while (this._root.lastChild) {
	            this._root.lastChild.remove();
	          }
	        }
	        this._list = attributes.list;
	        this.loadList();
	      }
	    }
	  }, {
	    key: "mount",
	    value: function mount() {
	      var attr = {};
	      if (this._className) {
	        attr.className = this._className;
	      }
	      this._root = tag.ul(attr);
	      this.loadList();
	      if (this._onItemClick) {
	        this._root.addEventListener("click", this._onClick);
	      }
	      return this._root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      if (this._list) {
	        this._unloadList();
	      }
	    }
	  }, {
	    key: "_onClick",
	    value: function _onClick(event) {
	      if (event.target === this._root) {
	        return;
	      }
	      var childNode = event.target;
	      while (childNode.parentNode !== this._root) {
	        childNode = childNode.parentNode;
	      }
	      var index = Array.prototype.indexOf.call(this._root.childNodes, childNode);
	      var childView = this._childInstances[index];
	      this._onItemClick(childView, event);
	    }
	  }, {
	    key: "_unloadList",
	    value: function _unloadList() {
	      this._subscription = this._subscription();
	      var _iterator = _createForOfIteratorHelper(this._childInstances),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var child = _step.value;
	          child.unmount();
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	      this._childInstances = null;
	    }
	  }, {
	    key: "loadList",
	    value: function loadList() {
	      if (!this._list) {
	        return;
	      }
	      this._subscription = this._list.subscribe(this);
	      this._childInstances = [];
	      var fragment = document.createDocumentFragment();
	      var _iterator2 = _createForOfIteratorHelper(this._list),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var item = _step2.value;
	          var child = this._childCreator(item);
	          this._childInstances.push(child);
	          var childDomNode = child.mount(this._mountArgs);
	          fragment.appendChild(childDomNode);
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	      this._root.appendChild(fragment);
	    }
	  }, {
	    key: "onAdd",
	    value: function onAdd(idx, value) {
	      this.onBeforeListChanged();
	      var child = this._childCreator(value);
	      this._childInstances.splice(idx, 0, child);
	      insertAt(this._root, idx, child.mount(this._mountArgs));
	      this.onListChanged();
	    }
	  }, {
	    key: "onRemove",
	    value: function onRemove(idx, _value) {
	      this.onBeforeListChanged();
	      var _this$_childInstances = this._childInstances.splice(idx, 1),
	          _this$_childInstances2 = _slicedToArray(_this$_childInstances, 1),
	          child = _this$_childInstances2[0];
	      child.root().remove();
	      child.unmount();
	      this.onListChanged();
	    }
	  }, {
	    key: "onMove",
	    value: function onMove(fromIdx, toIdx, value) {
	      this.onBeforeListChanged();
	      var _this$_childInstances3 = this._childInstances.splice(fromIdx, 1),
	          _this$_childInstances4 = _slicedToArray(_this$_childInstances3, 1),
	          child = _this$_childInstances4[0];
	      this._childInstances.splice(toIdx, 0, child);
	      child.root().remove();
	      insertAt(this._root, toIdx, child.root());
	      this.onListChanged();
	    }
	  }, {
	    key: "onUpdate",
	    value: function onUpdate(i, value, params) {
	      if (this._childInstances) {
	        var instance = this._childInstances[i];
	        instance && instance.update(value, params);
	      }
	    }
	  }, {
	    key: "onBeforeListChanged",
	    value: function onBeforeListChanged() {}
	  }, {
	    key: "onListChanged",
	    value: function onListChanged() {}
	  }]);
	  return ListView;
	}();

	function errorToDOM(error) {
	  var stack = new Error().stack;
	  var callee = stack.split("\n")[1];
	  return tag.div([tag.h2("Something went wrong…"), tag.h3(error.message), tag.p("This occurred while running ".concat(callee, ".")), tag.pre(error.stack)]);
	}

	function objHasFns(obj) {
	  for (var _i = 0, _Object$values = Object.values(obj); _i < _Object$values.length; _i++) {
	    var value = _Object$values[_i];
	    if (typeof value === "function") {
	      return true;
	    }
	  }
	  return false;
	}
	var TemplateView = function () {
	  function TemplateView(value) {
	    var render = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
	    _classCallCheck(this, TemplateView);
	    this._value = value;
	    this._render = render;
	    this._eventListeners = null;
	    this._bindings = null;
	    this._subViews = null;
	    this._root = null;
	    this._boundUpdateFromValue = null;
	  }
	  _createClass(TemplateView, [{
	    key: "_subscribe",
	    value: function _subscribe() {
	      if (typeof this._value.on === "function") {
	        this._boundUpdateFromValue = this._updateFromValue.bind(this);
	        this._value.on("change", this._boundUpdateFromValue);
	      }
	    }
	  }, {
	    key: "_unsubscribe",
	    value: function _unsubscribe() {
	      if (this._boundUpdateFromValue) {
	        if (typeof this._value.off === "function") {
	          this._value.off("change", this._boundUpdateFromValue);
	        }
	        this._boundUpdateFromValue = null;
	      }
	    }
	  }, {
	    key: "_attach",
	    value: function _attach() {
	      if (this._eventListeners) {
	        var _iterator = _createForOfIteratorHelper(this._eventListeners),
	            _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var _step$value = _step.value,
	                node = _step$value.node,
	                name = _step$value.name,
	                fn = _step$value.fn;
	            node.addEventListener(name, fn);
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	      }
	    }
	  }, {
	    key: "_detach",
	    value: function _detach() {
	      if (this._eventListeners) {
	        var _iterator2 = _createForOfIteratorHelper(this._eventListeners),
	            _step2;
	        try {
	          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	            var _step2$value = _step2.value,
	                node = _step2$value.node,
	                name = _step2$value.name,
	                fn = _step2$value.fn;
	            node.removeEventListener(name, fn);
	          }
	        } catch (err) {
	          _iterator2.e(err);
	        } finally {
	          _iterator2.f();
	        }
	      }
	    }
	  }, {
	    key: "mount",
	    value: function mount(options) {
	      var builder = new TemplateBuilder(this);
	      if (this._render) {
	        this._root = this._render(builder, this._value);
	      } else if (this.render) {
	        this._root = this.render(builder, this._value);
	      } else {
	        throw new Error("no render function passed in, or overriden in subclass");
	      }
	      var parentProvidesUpdates = options && options.parentProvidesUpdates;
	      if (!parentProvidesUpdates) {
	        this._subscribe();
	      }
	      this._attach();
	      return this._root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      this._detach();
	      this._unsubscribe();
	      if (this._subViews) {
	        var _iterator3 = _createForOfIteratorHelper(this._subViews),
	            _step3;
	        try {
	          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	            var v = _step3.value;
	            v.unmount();
	          }
	        } catch (err) {
	          _iterator3.e(err);
	        } finally {
	          _iterator3.f();
	        }
	      }
	    }
	  }, {
	    key: "root",
	    value: function root() {
	      return this._root;
	    }
	  }, {
	    key: "_updateFromValue",
	    value: function _updateFromValue(changedProps) {
	      this.update(this._value, changedProps);
	    }
	  }, {
	    key: "update",
	    value: function update(value) {
	      this._value = value;
	      if (this._bindings) {
	        var _iterator4 = _createForOfIteratorHelper(this._bindings),
	            _step4;
	        try {
	          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
	            var binding = _step4.value;
	            binding();
	          }
	        } catch (err) {
	          _iterator4.e(err);
	        } finally {
	          _iterator4.f();
	        }
	      }
	    }
	  }, {
	    key: "_addEventListener",
	    value: function _addEventListener(node, name, fn) {
	      if (!this._eventListeners) {
	        this._eventListeners = [];
	      }
	      this._eventListeners.push({
	        node: node,
	        name: name,
	        fn: fn
	      });
	    }
	  }, {
	    key: "_addBinding",
	    value: function _addBinding(bindingFn) {
	      if (!this._bindings) {
	        this._bindings = [];
	      }
	      this._bindings.push(bindingFn);
	    }
	  }, {
	    key: "_addSubView",
	    value: function _addSubView(view) {
	      if (!this._subViews) {
	        this._subViews = [];
	      }
	      this._subViews.push(view);
	    }
	  }, {
	    key: "value",
	    get: function get() {
	      return this._value;
	    }
	  }]);
	  return TemplateView;
	}();
	var TemplateBuilder = function () {
	  function TemplateBuilder(templateView) {
	    _classCallCheck(this, TemplateBuilder);
	    this._templateView = templateView;
	  }
	  _createClass(TemplateBuilder, [{
	    key: "_addAttributeBinding",
	    value: function _addAttributeBinding(node, name, fn) {
	      var _this = this;
	      var prevValue = undefined;
	      var binding = function binding() {
	        var newValue = fn(_this._value);
	        if (prevValue !== newValue) {
	          prevValue = newValue;
	          setAttribute(node, name, newValue);
	        }
	      };
	      this._templateView._addBinding(binding);
	      binding();
	    }
	  }, {
	    key: "_addClassNamesBinding",
	    value: function _addClassNamesBinding(node, obj) {
	      this._addAttributeBinding(node, "className", function (value) {
	        return classNames(obj, value);
	      });
	    }
	  }, {
	    key: "_addTextBinding",
	    value: function _addTextBinding(fn) {
	      var _this2 = this;
	      var initialValue = fn(this._value);
	      var node = text(initialValue);
	      var prevValue = initialValue;
	      var binding = function binding() {
	        var newValue = fn(_this2._value);
	        if (prevValue !== newValue) {
	          prevValue = newValue;
	          node.textContent = newValue + "";
	        }
	      };
	      this._templateView._addBinding(binding);
	      return node;
	    }
	  }, {
	    key: "_setNodeAttributes",
	    value: function _setNodeAttributes(node, attributes) {
	      for (var _i2 = 0, _Object$entries = Object.entries(attributes); _i2 < _Object$entries.length; _i2++) {
	        var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
	            key = _Object$entries$_i[0],
	            value = _Object$entries$_i[1];
	        var isFn = typeof value === "function";
	        if (key === "className" && _typeof(value) === "object" && value !== null) {
	          if (objHasFns(value)) {
	            this._addClassNamesBinding(node, value);
	          } else {
	            setAttribute(node, key, classNames(value));
	          }
	        } else if (key.startsWith("on") && key.length > 2 && isFn) {
	          var eventName = key.substr(2, 1).toLowerCase() + key.substr(3);
	          var handler = value;
	          this._templateView._addEventListener(node, eventName, handler);
	        } else if (isFn) {
	          this._addAttributeBinding(node, key, value);
	        } else {
	          setAttribute(node, key, value);
	        }
	      }
	    }
	  }, {
	    key: "_setNodeChildren",
	    value: function _setNodeChildren(node, children) {
	      if (!Array.isArray(children)) {
	        children = [children];
	      }
	      var _iterator5 = _createForOfIteratorHelper(children),
	          _step5;
	      try {
	        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
	          var child = _step5.value;
	          if (typeof child === "function") {
	            child = this._addTextBinding(child);
	          } else if (!child.nodeType) {
	            child = text(child);
	          }
	          node.appendChild(child);
	        }
	      } catch (err) {
	        _iterator5.e(err);
	      } finally {
	        _iterator5.f();
	      }
	    }
	  }, {
	    key: "_addReplaceNodeBinding",
	    value: function _addReplaceNodeBinding(fn, renderNode) {
	      var _this3 = this;
	      var prevValue = fn(this._value);
	      var node = renderNode(null);
	      var binding = function binding() {
	        var newValue = fn(_this3._value);
	        if (prevValue !== newValue) {
	          prevValue = newValue;
	          var newNode = renderNode(node);
	          if (node.parentNode) {
	            node.parentNode.replaceChild(newNode, node);
	          }
	          node = newNode;
	        }
	      };
	      this._templateView._addBinding(binding);
	      return node;
	    }
	  }, {
	    key: "el",
	    value: function el(name, attributes, children) {
	      return this.elNS(HTML_NS, name, attributes, children);
	    }
	  }, {
	    key: "elNS",
	    value: function elNS(ns, name, attributes, children) {
	      if (attributes && isChildren(attributes)) {
	        children = attributes;
	        attributes = null;
	      }
	      var node = document.createElementNS(ns, name);
	      if (attributes) {
	        this._setNodeAttributes(node, attributes);
	      }
	      if (children) {
	        this._setNodeChildren(node, children);
	      }
	      return node;
	    }
	  }, {
	    key: "view",
	    value: function view(_view) {
	      var root;
	      try {
	        root = _view.mount();
	      } catch (err) {
	        return errorToDOM(err);
	      }
	      this._templateView._addSubView(_view);
	      return root;
	    }
	  }, {
	    key: "createTemplate",
	    value: function createTemplate(render) {
	      return function (vm) {
	        return new TemplateView(vm, render);
	      };
	    }
	  }, {
	    key: "mapView",
	    value: function mapView(mapFn, viewCreator) {
	      var _this4 = this;
	      return this._addReplaceNodeBinding(mapFn, function (prevNode) {
	        if (prevNode && prevNode.nodeType !== Node.COMMENT_NODE) {
	          var subViews = _this4._templateView._subViews;
	          var viewIdx = subViews.findIndex(function (v) {
	            return v.root() === prevNode;
	          });
	          if (viewIdx !== -1) {
	            var _subViews$splice = subViews.splice(viewIdx, 1),
	                _subViews$splice2 = _slicedToArray(_subViews$splice, 1),
	                _view2 = _subViews$splice2[0];
	            _view2.unmount();
	          }
	        }
	        var view = viewCreator(mapFn(_this4._value));
	        if (view) {
	          return _this4.view(view);
	        } else {
	          return document.createComment("node binding placeholder");
	        }
	      });
	    }
	  }, {
	    key: "if",
	    value: function _if(fn, viewCreator) {
	      var _this5 = this;
	      return this.mapView(function (value) {
	        return !!fn(value);
	      }, function (enabled) {
	        return enabled ? viewCreator(_this5._value) : null;
	      });
	    }
	  }, {
	    key: "_value",
	    get: function get() {
	      return this._templateView._value;
	    }
	  }]);
	  return TemplateBuilder;
	}();
	var _loop$1 = function _loop() {
	  var _Object$entries2$_i = _slicedToArray(_Object$entries2$1[_i3], 2),
	      ns = _Object$entries2$_i[0],
	      tags = _Object$entries2$_i[1];
	  var _iterator6 = _createForOfIteratorHelper(tags),
	      _step6;
	  try {
	    var _loop2 = function _loop2() {
	      var tag = _step6.value;
	      TemplateBuilder.prototype[tag] = function (attributes, children) {
	        return this.elNS(ns, tag, attributes, children);
	      };
	    };
	    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
	      _loop2();
	    }
	  } catch (err) {
	    _iterator6.e(err);
	  } finally {
	    _iterator6.f();
	  }
	};
	for (var _i3 = 0, _Object$entries2$1 = Object.entries(TAG_NAMES); _i3 < _Object$entries2$1.length; _i3++) {
	  _loop$1();
	}

	function spinner(t) {
	  var extraClasses = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
	  return t.svg({
	    className: Object.assign({
	      "spinner": true
	    }, extraClasses),
	    viewBox: "0 0 100 100"
	  }, t.circle({
	    cx: "50%",
	    cy: "50%",
	    r: "45%",
	    pathLength: "100"
	  }));
	}
	function renderAvatar(t, vm, size) {
	  var hasAvatar = !!vm.avatarUrl;
	  var avatarClasses = _defineProperty({
	    avatar: true
	  }, "usercolor".concat(vm.avatarColorNumber), !hasAvatar);
	  var sizeStr = size.toString();
	  var avatarContent = hasAvatar ? t.img({
	    src: function src(vm) {
	      return vm.avatarUrl;
	    },
	    width: sizeStr,
	    height: sizeStr,
	    title: function title(vm) {
	      return vm.avatarTitle;
	    }
	  }) : function (vm) {
	    return vm.avatarLetter;
	  };
	  return t.div({
	    className: avatarClasses
	  }, [avatarContent]);
	}

	var RoomTile = function (_TemplateView) {
	  _inherits(RoomTile, _TemplateView);
	  var _super = _createSuper(RoomTile);
	  function RoomTile() {
	    _classCallCheck(this, RoomTile);
	    return _super.apply(this, arguments);
	  }
	  _createClass(RoomTile, [{
	    key: "render",
	    value: function render(t, vm) {
	      return t.li({
	        "className": {
	          "active": function active(vm) {
	            return vm.isOpen;
	          }
	        }
	      }, [renderAvatar(t, vm, 32), t.div({
	        className: "description"
	      }, [t.div({
	        className: {
	          "name": true,
	          unread: function unread(vm) {
	            return vm.isUnread;
	          }
	        }
	      }, function (vm) {
	        return vm.name;
	      }), t.div({
	        className: {
	          "badge": true,
	          highlighted: function highlighted(vm) {
	            return vm.isHighlighted;
	          },
	          hidden: function hidden(vm) {
	            return !vm.badgeCount;
	          }
	        }
	      }, function (vm) {
	        return vm.badgeCount;
	      })])]);
	    }
	  }, {
	    key: "clicked",
	    value: function clicked() {
	      this.value.open();
	    }
	  }]);
	  return RoomTile;
	}(TemplateView);

	function _templateObject$4() {
	  var data = _taggedTemplateLiteral(["Loading more messages \u2026"]);
	  _templateObject$4 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var GapView = function (_TemplateView) {
	  _inherits(GapView, _TemplateView);
	  var _super = _createSuper(GapView);
	  function GapView() {
	    _classCallCheck(this, GapView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(GapView, [{
	    key: "render",
	    value: function render(t, vm) {
	      var className = {
	        GapView: true,
	        isLoading: function isLoading(vm) {
	          return vm.isLoading;
	        }
	      };
	      return t.li({
	        className: className
	      }, [spinner(t), t.div(vm.i18n(_templateObject$4())), t.if(function (vm) {
	        return vm.error;
	      }, t.createTemplate(function (t) {
	        return t.strong(function (vm) {
	          return vm.error;
	        });
	      }))]);
	    }
	  }]);
	  return GapView;
	}(TemplateView);

	function renderMessage(t, vm, children) {
	  var classes = {
	    "TextMessageView": true,
	    own: vm.isOwn,
	    pending: vm.isPending,
	    unverified: vm.isUnverified,
	    continuation: function continuation(vm) {
	      return vm.isContinuation;
	    }
	  };
	  var profile = t.div({
	    className: "profile"
	  }, [renderAvatar(t, vm, 30), t.div({
	    className: "sender usercolor".concat(vm.avatarColorNumber)
	  }, vm.sender)]);
	  children = [profile].concat(children);
	  return t.li({
	    className: classes
	  }, t.div({
	    className: "message-container"
	  }, children));
	}

	var TextMessageView = function (_TemplateView) {
	  _inherits(TextMessageView, _TemplateView);
	  var _super = _createSuper(TextMessageView);
	  function TextMessageView() {
	    _classCallCheck(this, TextMessageView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(TextMessageView, [{
	    key: "render",
	    value: function render(t, vm) {
	      return renderMessage(t, vm, [t.p([vm.text, t.time({
	        className: {
	          hidden: !vm.date
	        }
	      }, vm.date + " " + vm.time)])]);
	    }
	  }]);
	  return TextMessageView;
	}(TemplateView);

	var ImageView = function (_TemplateView) {
	  _inherits(ImageView, _TemplateView);
	  var _super = _createSuper(ImageView);
	  function ImageView() {
	    _classCallCheck(this, ImageView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(ImageView, [{
	    key: "render",
	    value: function render(t, vm) {
	      var heightRatioPercent = vm.thumbnailHeight / vm.thumbnailWidth * 100;
	      var image = t.img({
	        className: "picture",
	        src: vm.thumbnailUrl,
	        width: vm.thumbnailWidth,
	        height: vm.thumbnailHeight,
	        loading: "lazy",
	        alt: vm.label
	      });
	      var linkContainer = t.a({
	        href: vm.url,
	        target: "_blank",
	        style: "padding-top: ".concat(heightRatioPercent, "%; width: ").concat(vm.thumbnailWidth, "px;")
	      }, image);
	      return renderMessage(t, vm, [t.div(linkContainer), t.p(t.time(vm.date + " " + vm.time))]);
	    }
	  }]);
	  return ImageView;
	}(TemplateView);

	var AnnouncementView = function (_TemplateView) {
	  _inherits(AnnouncementView, _TemplateView);
	  var _super = _createSuper(AnnouncementView);
	  function AnnouncementView() {
	    _classCallCheck(this, AnnouncementView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(AnnouncementView, [{
	    key: "render",
	    value: function render(t) {
	      return t.li({
	        className: "AnnouncementView"
	      }, t.div(function (vm) {
	        return vm.announcement;
	      }));
	    }
	  }]);
	  return AnnouncementView;
	}(TemplateView);

	var TimelineList = function (_ListView) {
	  _inherits(TimelineList, _ListView);
	  var _super = _createSuper(TimelineList);
	  function TimelineList(viewModel) {
	    var _this;
	    _classCallCheck(this, TimelineList);
	    var options = {
	      className: "Timeline",
	      list: viewModel.tiles
	    };
	    _this = _super.call(this, options, function (entry) {
	      switch (entry.shape) {
	        case "gap":
	          return new GapView(entry);
	        case "announcement":
	          return new AnnouncementView(entry);
	        case "message":
	          return new TextMessageView(entry);
	        case "image":
	          return new ImageView(entry);
	      }
	    });
	    _this._atBottom = false;
	    _this._onScroll = _this._onScroll.bind(_assertThisInitialized(_this));
	    _this._topLoadingPromise = null;
	    _this._viewModel = viewModel;
	    return _this;
	  }
	  _createClass(TimelineList, [{
	    key: "_loadAtTopWhile",
	    value: function () {
	      var _loadAtTopWhile2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee(predicate) {
	        var shouldStop;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (!this._topLoadingPromise) {
	                  _context.next = 2;
	                  break;
	                }
	                return _context.abrupt("return");
	              case 2:
	                _context.prev = 2;
	              case 3:
	                if (!predicate()) {
	                  _context.next = 12;
	                  break;
	                }
	                this._topLoadingPromise = this._viewModel.loadAtTop();
	                _context.next = 7;
	                return this._topLoadingPromise;
	              case 7:
	                shouldStop = _context.sent;
	                if (!shouldStop) {
	                  _context.next = 10;
	                  break;
	                }
	                return _context.abrupt("break", 12);
	              case 10:
	                _context.next = 3;
	                break;
	              case 12:
	                _context.next = 16;
	                break;
	              case 14:
	                _context.prev = 14;
	                _context.t0 = _context["catch"](2);
	              case 16:
	                _context.prev = 16;
	                this._topLoadingPromise = null;
	                return _context.finish(16);
	              case 19:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this, [[2, 14, 16, 19]]);
	      }));
	      function _loadAtTopWhile(_x) {
	        return _loadAtTopWhile2.apply(this, arguments);
	      }
	      return _loadAtTopWhile;
	    }()
	  }, {
	    key: "_onScroll",
	    value: function () {
	      var _onScroll2 = _asyncToGenerator( regeneratorRuntime.mark(function _callee2() {
	        var PAGINATE_OFFSET, root, beforeContentHeight, lastContentHeight;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                PAGINATE_OFFSET = 100;
	                root = this.root();
	                if (root.scrollTop < PAGINATE_OFFSET && !this._topLoadingPromise && this._viewModel) {
	                  beforeContentHeight = root.scrollHeight;
	                  lastContentHeight = beforeContentHeight;
	                  this._loadAtTopWhile(function () {
	                    var contentHeight = root.scrollHeight;
	                    var amountGrown = contentHeight - beforeContentHeight;
	                    root.scrollTop = root.scrollTop + (contentHeight - lastContentHeight);
	                    lastContentHeight = contentHeight;
	                    return amountGrown < PAGINATE_OFFSET;
	                  });
	                }
	              case 3:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));
	      function _onScroll() {
	        return _onScroll2.apply(this, arguments);
	      }
	      return _onScroll;
	    }()
	  }, {
	    key: "mount",
	    value: function mount() {
	      var root = _get(_getPrototypeOf(TimelineList.prototype), "mount", this).call(this);
	      root.addEventListener("scroll", this._onScroll);
	      return root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      this.root().removeEventListener("scroll", this._onScroll);
	      _get(_getPrototypeOf(TimelineList.prototype), "unmount", this).call(this);
	    }
	  }, {
	    key: "loadList",
	    value: function () {
	      var _loadList = _asyncToGenerator( regeneratorRuntime.mark(function _callee3() {
	        var root, scrollHeight, clientHeight;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _get(_getPrototypeOf(TimelineList.prototype), "loadList", this).call(this);
	                root = this.root();
	                _context3.next = 4;
	                return Promise.resolve();
	              case 4:
	                scrollHeight = root.scrollHeight, clientHeight = root.clientHeight;
	                if (scrollHeight > clientHeight) {
	                  root.scrollTop = root.scrollHeight;
	                }
	                this._loadAtTopWhile(function () {
	                  var scrollHeight = root.scrollHeight,
	                      clientHeight = root.clientHeight;
	                  return scrollHeight <= clientHeight;
	                });
	              case 7:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));
	      function loadList() {
	        return _loadList.apply(this, arguments);
	      }
	      return loadList;
	    }()
	  }, {
	    key: "onBeforeListChanged",
	    value: function onBeforeListChanged() {
	      var fromBottom = this._distanceFromBottom();
	      this._atBottom = fromBottom < 1;
	    }
	  }, {
	    key: "_distanceFromBottom",
	    value: function _distanceFromBottom() {
	      var root = this.root();
	      return root.scrollHeight - root.scrollTop - root.clientHeight;
	    }
	  }, {
	    key: "onListChanged",
	    value: function onListChanged() {
	      var root = this.root();
	      if (this._atBottom) {
	        root.scrollTop = root.scrollHeight;
	      }
	    }
	  }]);
	  return TimelineList;
	}(ListView);

	function _templateObject$5() {
	  var data = _taggedTemplateLiteral(["Loading messages\u2026"]);
	  _templateObject$5 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var TimelineLoadingView = function (_TemplateView) {
	  _inherits(TimelineLoadingView, _TemplateView);
	  var _super = _createSuper(TimelineLoadingView);
	  function TimelineLoadingView() {
	    _classCallCheck(this, TimelineLoadingView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(TimelineLoadingView, [{
	    key: "render",
	    value: function render(t, vm) {
	      return t.div({
	        className: "TimelineLoadingView"
	      }, [spinner(t), t.div(vm.i18n(_templateObject$5()))]);
	    }
	  }]);
	  return TimelineLoadingView;
	}(TemplateView);

	function _templateObject2$1() {
	  var data = _taggedTemplateLiteral(["Send"]);
	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };
	  return data;
	}
	function _templateObject$6() {
	  var data = _taggedTemplateLiteral(["Send"]);
	  _templateObject$6 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var MessageComposer = function (_TemplateView) {
	  _inherits(MessageComposer, _TemplateView);
	  var _super = _createSuper(MessageComposer);
	  function MessageComposer(viewModel) {
	    var _this;
	    _classCallCheck(this, MessageComposer);
	    _this = _super.call(this, viewModel);
	    _this._input = null;
	    return _this;
	  }
	  _createClass(MessageComposer, [{
	    key: "render",
	    value: function render(t, vm) {
	      var _this2 = this;
	      this._input = t.input({
	        placeholder: "Send a message ...",
	        onKeydown: function onKeydown(e) {
	          return _this2._onKeyDown(e);
	        },
	        onInput: function onInput() {
	          return vm.setInput(_this2._input.value);
	        }
	      });
	      return t.div({
	        className: "MessageComposer"
	      }, [this._input, t.button({
	        className: "send",
	        title: vm.i18n(_templateObject$6()),
	        disabled: function disabled(vm) {
	          return !vm.canSend;
	        },
	        onClick: function onClick() {
	          return _this2._trySend();
	        }
	      }, vm.i18n(_templateObject2$1()))]);
	    }
	  }, {
	    key: "_trySend",
	    value: function _trySend() {
	      if (this.value.sendMessage(this._input.value)) {
	        this._input.value = "";
	      }
	    }
	  }, {
	    key: "_onKeyDown",
	    value: function _onKeyDown(event) {
	      if (event.key === "Enter") {
	        this._trySend();
	      }
	    }
	  }]);
	  return MessageComposer;
	}(TemplateView);

	var RoomView = function (_TemplateView) {
	  _inherits(RoomView, _TemplateView);
	  var _super = _createSuper(RoomView);
	  function RoomView() {
	    _classCallCheck(this, RoomView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(RoomView, [{
	    key: "render",
	    value: function render(t, vm) {
	      return t.div({
	        className: "RoomView"
	      }, [t.div({
	        className: "TimelinePanel"
	      }, [t.div({
	        className: "RoomHeader"
	      }, [t.button({
	        className: "back",
	        onClick: function onClick() {
	          return vm.close();
	        }
	      }), renderAvatar(t, vm, 32), t.div({
	        className: "room-description"
	      }, [t.h2(function (vm) {
	        return vm.name;
	      })])]), t.div({
	        className: "RoomView_error"
	      }, function (vm) {
	        return vm.error;
	      }), t.mapView(function (vm) {
	        return vm.timelineViewModel;
	      }, function (timelineViewModel) {
	        return timelineViewModel ? new TimelineList(timelineViewModel) : new TimelineLoadingView(vm);
	      }), t.view(new MessageComposer(this.value.composerViewModel))])]);
	    }
	  }]);
	  return RoomView;
	}(TemplateView);

	var SwitchView = function () {
	  function SwitchView(defaultView) {
	    _classCallCheck(this, SwitchView);
	    this._childView = defaultView;
	  }
	  _createClass(SwitchView, [{
	    key: "mount",
	    value: function mount() {
	      return this._childView.mount();
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      return this._childView.unmount();
	    }
	  }, {
	    key: "root",
	    value: function root() {
	      return this._childView.root();
	    }
	  }, {
	    key: "update",
	    value: function update() {
	      return this._childView.update();
	    }
	  }, {
	    key: "switch",
	    value: function _switch(newView) {
	      var oldRoot = this.root();
	      this._childView.unmount();
	      this._childView = newView;
	      var newRoot;
	      try {
	        newRoot = this._childView.mount();
	      } catch (err) {
	        newRoot = errorToDOM(err);
	      }
	      var parent = oldRoot.parentNode;
	      if (parent) {
	        parent.replaceChild(newRoot, oldRoot);
	      }
	    }
	  }, {
	    key: "childView",
	    get: function get() {
	      return this._childView;
	    }
	  }]);
	  return SwitchView;
	}();
	var BoundSwitchView = function (_SwitchView) {
	  _inherits(BoundSwitchView, _SwitchView);
	  var _super = _createSuper(BoundSwitchView);
	  function BoundSwitchView(value, mapper, viewCreator) {
	    var _this;
	    _classCallCheck(this, BoundSwitchView);
	    _this = _super.call(this, viewCreator(mapper(value), value));
	    _this._mapper = mapper;
	    _this._viewCreator = viewCreator;
	    _this._mappedValue = mapper(value);
	    return _this;
	  }
	  _createClass(BoundSwitchView, [{
	    key: "update",
	    value: function update(value) {
	      var mappedValue = this._mapper(value);
	      if (mappedValue !== this._mappedValue) {
	        this._mappedValue = mappedValue;
	        this.switch(this._viewCreator(this._mappedValue, value));
	      } else {
	        _get(_getPrototypeOf(BoundSwitchView.prototype), "update", this).call(this, value);
	      }
	    }
	  }]);
	  return BoundSwitchView;
	}(SwitchView);

	var RoomPlaceholderView = function () {
	  function RoomPlaceholderView() {
	    _classCallCheck(this, RoomPlaceholderView);
	    this._root = null;
	  }
	  _createClass(RoomPlaceholderView, [{
	    key: "mount",
	    value: function mount() {
	      this._root = tag.div({
	        className: "RoomPlaceholderView"
	      }, tag.h2("Choose a room on the left side."));
	      return this._root;
	    }
	  }, {
	    key: "root",
	    value: function root() {
	      return this._root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {}
	  }, {
	    key: "update",
	    value: function update() {}
	  }]);
	  return RoomPlaceholderView;
	}();

	var SessionStatusView = function (_TemplateView) {
	  _inherits(SessionStatusView, _TemplateView);
	  var _super = _createSuper(SessionStatusView);
	  function SessionStatusView() {
	    _classCallCheck(this, SessionStatusView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(SessionStatusView, [{
	    key: "render",
	    value: function render(t, vm) {
	      return t.div({
	        className: {
	          "SessionStatusView": true,
	          "hidden": function hidden(vm) {
	            return !vm.isShown;
	          }
	        }
	      }, [spinner(t, {
	        hidden: function hidden(vm) {
	          return !vm.isWaiting;
	        }
	      }), t.p(function (vm) {
	        return vm.statusLabel;
	      }), t.if(function (vm) {
	        return vm.isConnectNowShown;
	      }, t.createTemplate(function (t) {
	        return t.button({
	          onClick: function onClick() {
	            return vm.connectNow();
	          }
	        }, "Retry now");
	      })), window.DEBUG ? t.button({
	        id: "showlogs"
	      }, "Show logs") : ""]);
	    }
	  }]);
	  return SessionStatusView;
	}(TemplateView);

	var SessionView = function () {
	  function SessionView(viewModel) {
	    _classCallCheck(this, SessionView);
	    this._viewModel = viewModel;
	    this._middleSwitcher = null;
	    this._roomList = null;
	    this._currentRoom = null;
	    this._root = null;
	    this._onViewModelChange = this._onViewModelChange.bind(this);
	  }
	  _createClass(SessionView, [{
	    key: "root",
	    value: function root() {
	      return this._root;
	    }
	  }, {
	    key: "mount",
	    value: function mount() {
	      this._viewModel.on("change", this._onViewModelChange);
	      this._sessionStatusBar = new SessionStatusView(this._viewModel.sessionStatusViewModel);
	      this._roomList = new ListView({
	        className: "RoomList",
	        list: this._viewModel.roomList,
	        onItemClick: function onItemClick(roomTile, event) {
	          return roomTile.clicked(event);
	        }
	      }, function (room) {
	        return new RoomTile(room);
	      });
	      this._middleSwitcher = new SwitchView(new RoomPlaceholderView());
	      this._root = tag.div({
	        className: "SessionView"
	      }, [this._sessionStatusBar.mount(), tag.div({
	        className: "main"
	      }, [tag.div({
	        className: "LeftPanel"
	      }, this._roomList.mount()), this._middleSwitcher.mount()])]);
	      return this._root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      this._roomList.unmount();
	      this._middleSwitcher.unmount();
	      this._viewModel.off("change", this._onViewModelChange);
	    }
	  }, {
	    key: "_onViewModelChange",
	    value: function _onViewModelChange(prop) {
	      if (prop === "currentRoom") {
	        if (this._viewModel.currentRoom) {
	          this._root.classList.add("room-shown");
	          this._middleSwitcher.switch(new RoomView(this._viewModel.currentRoom));
	        } else {
	          this._root.classList.remove("room-shown");
	          this._middleSwitcher.switch(new RoomPlaceholderView());
	        }
	      }
	    }
	  }, {
	    key: "update",
	    value: function update() {}
	  }]);
	  return SessionView;
	}();

	function hydrogenGithubLink(t) {
	  if (window.HYDROGEN_VERSION) {
	    return t.a({
	      target: "_blank",
	      href: "https://github.com/vector-im/hydrogen-web/releases/tag/v".concat(window.HYDROGEN_VERSION)
	    }, "Hydrogen v".concat(window.HYDROGEN_VERSION, " on Github"));
	  } else {
	    return t.a({
	      target: "_blank",
	      href: "https://github.com/vector-im/hydrogen-web"
	    }, "Hydrogen on Github");
	  }
	}

	var SessionLoadView = function (_TemplateView) {
	  _inherits(SessionLoadView, _TemplateView);
	  var _super = _createSuper(SessionLoadView);
	  function SessionLoadView() {
	    _classCallCheck(this, SessionLoadView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(SessionLoadView, [{
	    key: "render",
	    value: function render(t) {
	      return t.div({
	        className: "SessionLoadView"
	      }, [spinner(t, {
	        hiddenWithLayout: function hiddenWithLayout(vm) {
	          return !vm.loading;
	        }
	      }), t.p(function (vm) {
	        return vm.loadLabel;
	      })]);
	    }
	  }]);
	  return SessionLoadView;
	}(TemplateView);

	function _templateObject9() {
	  var data = _taggedTemplateLiteral(["Log In"]);
	  _templateObject9 = function _templateObject9() {
	    return data;
	  };
	  return data;
	}
	function _templateObject8() {
	  var data = _taggedTemplateLiteral(["Go Back"]);
	  _templateObject8 = function _templateObject8() {
	    return data;
	  };
	  return data;
	}
	function _templateObject7() {
	  var data = _taggedTemplateLiteral(["Homeserver"]);
	  _templateObject7 = function _templateObject7() {
	    return data;
	  };
	  return data;
	}
	function _templateObject6() {
	  var data = _taggedTemplateLiteral(["Password"]);
	  _templateObject6 = function _templateObject6() {
	    return data;
	  };
	  return data;
	}
	function _templateObject5() {
	  var data = _taggedTemplateLiteral(["Username"]);
	  _templateObject5 = function _templateObject5() {
	    return data;
	  };
	  return data;
	}
	function _templateObject4$1() {
	  var data = _taggedTemplateLiteral(["Sign In"]);
	  _templateObject4$1 = function _templateObject4() {
	    return data;
	  };
	  return data;
	}
	function _templateObject3$1() {
	  var data = _taggedTemplateLiteral(["Your matrix homeserver"]);
	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };
	  return data;
	}
	function _templateObject2$2() {
	  var data = _taggedTemplateLiteral(["Password"]);
	  _templateObject2$2 = function _templateObject2() {
	    return data;
	  };
	  return data;
	}
	function _templateObject$7() {
	  var data = _taggedTemplateLiteral(["Username"]);
	  _templateObject$7 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	var LoginView = function (_TemplateView) {
	  _inherits(LoginView, _TemplateView);
	  var _super = _createSuper(LoginView);
	  function LoginView() {
	    _classCallCheck(this, LoginView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(LoginView, [{
	    key: "render",
	    value: function render(t, vm) {
	      var disabled = function disabled(vm) {
	        return !!vm.isBusy;
	      };
	      var username = t.input({
	        id: "username",
	        type: "text",
	        placeholder: vm.i18n(_templateObject$7()),
	        disabled: disabled
	      });
	      var password = t.input({
	        id: "password",
	        type: "password",
	        placeholder: vm.i18n(_templateObject2$2()),
	        disabled: disabled
	      });
	      var homeserver = t.input({
	        id: "homeserver",
	        type: "text",
	        placeholder: vm.i18n(_templateObject3$1()),
	        value: vm.defaultHomeServer,
	        disabled: disabled
	      });
	      return t.div({
	        className: "PreSessionScreen"
	      }, [t.div({
	        className: "logo"
	      }), t.div({
	        className: "LoginView form"
	      }, [t.h1([vm.i18n(_templateObject4$1())]), t.if(function (vm) {
	        return vm.error;
	      }, t.createTemplate(function (t) {
	        return t.div({
	          className: "error"
	        }, function (vm) {
	          return vm.error;
	        });
	      })), t.div({
	        className: "form-row"
	      }, [t.label({
	        for: "username"
	      }, vm.i18n(_templateObject5())), username]), t.div({
	        className: "form-row"
	      }, [t.label({
	        for: "password"
	      }, vm.i18n(_templateObject6())), password]), t.div({
	        className: "form-row"
	      }, [t.label({
	        for: "homeserver"
	      }, vm.i18n(_templateObject7())), homeserver]), t.mapView(function (vm) {
	        return vm.loadViewModel;
	      }, function (loadViewModel) {
	        return loadViewModel ? new SessionLoadView(loadViewModel) : null;
	      }), t.div({
	        className: "button-row"
	      }, [t.button({
	        className: "styled secondary",
	        onClick: function onClick() {
	          return vm.cancel();
	        },
	        disabled: disabled
	      }, [vm.i18n(_templateObject8())]), t.button({
	        className: "styled primary",
	        onClick: function onClick() {
	          return vm.login(username.value, password.value, homeserver.value);
	        },
	        disabled: disabled
	      }, vm.i18n(_templateObject9()))]),
	      t.p(hydrogenGithubLink(t))])]);
	    }
	  }]);
	  return LoginView;
	}(TemplateView);

	function _templateObject2$3() {
	  var data = _taggedTemplateLiteral(["Sign In"]);
	  _templateObject2$3 = function _templateObject2() {
	    return data;
	  };
	  return data;
	}
	function _templateObject$8() {
	  var data = _taggedTemplateLiteral(["Import a session"]);
	  _templateObject$8 = function _templateObject() {
	    return data;
	  };
	  return data;
	}
	function selectFileAsText(mimeType) {
	  var input = document.createElement("input");
	  input.setAttribute("type", "file");
	  if (mimeType) {
	    input.setAttribute("accept", mimeType);
	  }
	  var promise = new Promise(function (resolve, reject) {
	    var checkFile = function checkFile() {
	      input.removeEventListener("change", checkFile, true);
	      var file = input.files[0];
	      if (file) {
	        resolve(file.text());
	      } else {
	        reject(new Error("No file selected"));
	      }
	    };
	    input.addEventListener("change", checkFile, true);
	  });
	  input.click();
	  return promise;
	}
	var SessionPickerItemView = function (_TemplateView) {
	  _inherits(SessionPickerItemView, _TemplateView);
	  var _super = _createSuper(SessionPickerItemView);
	  function SessionPickerItemView() {
	    _classCallCheck(this, SessionPickerItemView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(SessionPickerItemView, [{
	    key: "_onDeleteClick",
	    value: function _onDeleteClick() {
	      if (confirm("Are you sure?")) {
	        this.value.delete();
	      }
	    }
	  }, {
	    key: "render",
	    value: function render(t, vm) {
	      var deleteButton = t.button({
	        className: "destructive",
	        disabled: function disabled(vm) {
	          return vm.isDeleting;
	        },
	        onClick: this._onDeleteClick.bind(this)
	      }, "Sign Out");
	      var clearButton = t.button({
	        disabled: function disabled(vm) {
	          return vm.isClearing;
	        },
	        onClick: function onClick() {
	          return vm.clear();
	        }
	      }, "Clear");
	      var exportButton = t.button({
	        disabled: function disabled(vm) {
	          return vm.isClearing;
	        },
	        onClick: function onClick() {
	          return vm.export();
	        }
	      }, "Export");
	      var downloadExport = t.if(function (vm) {
	        return vm.exportDataUrl;
	      }, t.createTemplate(function (t, vm) {
	        return t.a({
	          href: vm.exportDataUrl,
	          download: "brawl-session-".concat(vm.id, ".json"),
	          onClick: function onClick() {
	            return setTimeout(function () {
	              return vm.clearExport();
	            }, 100);
	          }
	        }, "Download");
	      }));
	      var errorMessage = t.if(function (vm) {
	        return vm.error;
	      }, t.createTemplate(function (t) {
	        return t.p({
	          className: "error"
	        }, function (vm) {
	          return vm.error;
	        });
	      }));
	      return t.li([t.div({
	        className: "session-info"
	      }, [t.div({
	        className: "avatar usercolor".concat(vm.avatarColorNumber)
	      }, function (vm) {
	        return vm.avatarInitials;
	      }), t.div({
	        className: "user-id"
	      }, function (vm) {
	        return vm.label;
	      })]), t.div({
	        className: "session-actions"
	      }, [deleteButton, exportButton, downloadExport, clearButton]), errorMessage]);
	    }
	  }]);
	  return SessionPickerItemView;
	}(TemplateView);
	var SessionPickerView = function (_TemplateView2) {
	  _inherits(SessionPickerView, _TemplateView2);
	  var _super2 = _createSuper(SessionPickerView);
	  function SessionPickerView() {
	    _classCallCheck(this, SessionPickerView);
	    return _super2.apply(this, arguments);
	  }
	  _createClass(SessionPickerView, [{
	    key: "render",
	    value: function render(t, vm) {
	      var sessionList = new ListView({
	        list: vm.sessions,
	        onItemClick: function onItemClick(item, event) {
	          if (event.target.closest(".session-info")) {
	            vm.pick(item.value.id);
	          }
	        },
	        parentProvidesUpdates: false
	      }, function (sessionInfo) {
	        return new SessionPickerItemView(sessionInfo);
	      });
	      return t.div({
	        className: "PreSessionScreen"
	      }, [t.div({
	        className: "logo"
	      }), t.div({
	        className: "SessionPickerView"
	      }, [t.h1(["Continue as …"]), t.view(sessionList), t.div({
	        className: "button-row"
	      }, [t.button({
	        className: "styled secondary",
	        onClick: function () {
	          var _onClick = _asyncToGenerator( regeneratorRuntime.mark(function _callee() {
	            return regeneratorRuntime.wrap(function _callee$(_context) {
	              while (1) {
	                switch (_context.prev = _context.next) {
	                  case 0:
	                    _context.t0 = vm;
	                    _context.next = 3;
	                    return selectFileAsText("application/json");
	                  case 3:
	                    _context.t1 = _context.sent;
	                    return _context.abrupt("return", _context.t0.import.call(_context.t0, _context.t1));
	                  case 5:
	                  case "end":
	                    return _context.stop();
	                }
	              }
	            }, _callee);
	          }));
	          function onClick() {
	            return _onClick.apply(this, arguments);
	          }
	          return onClick;
	        }()
	      }, vm.i18n(_templateObject$8())), t.button({
	        className: "styled primary",
	        onClick: function onClick() {
	          return vm.cancel();
	        }
	      }, vm.i18n(_templateObject2$3()))]), t.if(function (vm) {
	        return vm.loadViewModel;
	      }, function (vm) {
	        return new SessionLoadView(vm.loadViewModel);
	      }), t.p(hydrogenGithubLink(t))])]);
	    }
	  }]);
	  return SessionPickerView;
	}(TemplateView);

	var BrawlView = function () {
	  function BrawlView(vm) {
	    _classCallCheck(this, BrawlView);
	    this._vm = vm;
	    this._switcher = null;
	    this._root = null;
	    this._onViewModelChange = this._onViewModelChange.bind(this);
	  }
	  _createClass(BrawlView, [{
	    key: "_getView",
	    value: function _getView() {
	      switch (this._vm.activeSection) {
	        case "error":
	          return new StatusView({
	            header: "Something went wrong",
	            message: this._vm.errorText
	          });
	        case "session":
	          return new SessionView(this._vm.sessionViewModel);
	        case "login":
	          return new LoginView(this._vm.loginViewModel);
	        case "picker":
	          return new SessionPickerView(this._vm.sessionPickerViewModel);
	        default:
	          throw new Error("Unknown section: ".concat(this._vm.activeSection));
	      }
	    }
	  }, {
	    key: "_onViewModelChange",
	    value: function _onViewModelChange(prop) {
	      if (prop === "activeSection") {
	        this._switcher.switch(this._getView());
	      }
	    }
	  }, {
	    key: "mount",
	    value: function mount() {
	      this._switcher = new SwitchView(this._getView());
	      this._root = this._switcher.mount();
	      this._vm.on("change", this._onViewModelChange);
	      return this._root;
	    }
	  }, {
	    key: "unmount",
	    value: function unmount() {
	      this._vm.off("change", this._onViewModelChange);
	      this._switcher.unmount();
	    }
	  }, {
	    key: "root",
	    value: function root() {
	      return this._root;
	    }
	  }, {
	    key: "update",
	    value: function update() {}
	  }]);
	  return BrawlView;
	}();
	var StatusView = function (_TemplateView) {
	  _inherits(StatusView, _TemplateView);
	  var _super = _createSuper(StatusView);
	  function StatusView() {
	    _classCallCheck(this, StatusView);
	    return _super.apply(this, arguments);
	  }
	  _createClass(StatusView, [{
	    key: "render",
	    value: function render(t, vm) {
	      return t.div({
	        className: "StatusView"
	      }, [t.h1(vm.header), t.p(vm.message)]);
	    }
	  }]);
	  return StatusView;
	}(TemplateView);

	var Timeout$1 = function () {
	  function Timeout(ms) {
	    var _this = this;
	    _classCallCheck(this, Timeout);
	    this._reject = null;
	    this._handle = null;
	    this._promise = new Promise(function (resolve, reject) {
	      _this._reject = reject;
	      _this._handle = setTimeout(function () {
	        _this._reject = null;
	        resolve();
	      }, ms);
	    });
	  }
	  _createClass(Timeout, [{
	    key: "elapsed",
	    value: function elapsed() {
	      return this._promise;
	    }
	  }, {
	    key: "abort",
	    value: function abort() {
	      if (this._reject) {
	        this._reject(new AbortError());
	        clearTimeout(this._handle);
	        this._handle = null;
	        this._reject = null;
	      }
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      this.abort();
	    }
	  }]);
	  return Timeout;
	}();
	var Interval$1 = function () {
	  function Interval(ms, callback) {
	    _classCallCheck(this, Interval);
	    this._handle = setInterval(callback, ms);
	  }
	  _createClass(Interval, [{
	    key: "dispose",
	    value: function dispose() {
	      if (this._handle) {
	        clearInterval(this._handle);
	        this._handle = null;
	      }
	    }
	  }]);
	  return Interval;
	}();
	var TimeMeasure$1 = function () {
	  function TimeMeasure() {
	    _classCallCheck(this, TimeMeasure);
	    this._start = window.performance.now();
	  }
	  _createClass(TimeMeasure, [{
	    key: "measure",
	    value: function measure() {
	      return window.performance.now() - this._start;
	    }
	  }]);
	  return TimeMeasure;
	}();
	var Clock$1 = function () {
	  function Clock() {
	    _classCallCheck(this, Clock);
	  }
	  _createClass(Clock, [{
	    key: "createMeasure",
	    value: function createMeasure() {
	      return new TimeMeasure$1();
	    }
	  }, {
	    key: "createTimeout",
	    value: function createTimeout(ms) {
	      return new Timeout$1(ms);
	    }
	  }, {
	    key: "createInterval",
	    value: function createInterval(callback, ms) {
	      return new Interval$1(ms, callback);
	    }
	  }, {
	    key: "now",
	    value: function now() {
	      return Date.now();
	    }
	  }]);
	  return Clock;
	}();

	var OnlineStatus = function (_BaseObservableValue) {
	  _inherits(OnlineStatus, _BaseObservableValue);
	  var _super = _createSuper(OnlineStatus);
	  function OnlineStatus() {
	    var _this;
	    _classCallCheck(this, OnlineStatus);
	    _this = _super.call(this);
	    _this._onOffline = _this._onOffline.bind(_assertThisInitialized(_this));
	    _this._onOnline = _this._onOnline.bind(_assertThisInitialized(_this));
	    return _this;
	  }
	  _createClass(OnlineStatus, [{
	    key: "_onOffline",
	    value: function _onOffline() {
	      this.emit(false);
	    }
	  }, {
	    key: "_onOnline",
	    value: function _onOnline() {
	      this.emit(true);
	    }
	  }, {
	    key: "onSubscribeFirst",
	    value: function onSubscribeFirst() {
	      window.addEventListener('offline', this._onOffline);
	      window.addEventListener('online', this._onOnline);
	    }
	  }, {
	    key: "onUnsubscribeLast",
	    value: function onUnsubscribeLast() {
	      window.removeEventListener('offline', this._onOffline);
	      window.removeEventListener('online', this._onOnline);
	    }
	  }, {
	    key: "value",
	    get: function get() {
	      return navigator.onLine;
	    }
	  }]);
	  return OnlineStatus;
	}(BaseObservableValue);

	var WorkerState = function () {
	  function WorkerState(worker) {
	    _classCallCheck(this, WorkerState);
	    this.worker = worker;
	    this.busy = false;
	  }
	  _createClass(WorkerState, [{
	    key: "attach",
	    value: function attach(pool) {
	      this.worker.addEventListener("message", pool);
	      this.worker.addEventListener("error", pool);
	    }
	  }, {
	    key: "detach",
	    value: function detach(pool) {
	      this.worker.removeEventListener("message", pool);
	      this.worker.removeEventListener("error", pool);
	    }
	  }]);
	  return WorkerState;
	}();
	var Request = function () {
	  function Request(message, pool) {
	    var _this = this;
	    _classCallCheck(this, Request);
	    this._promise = new Promise(function (_resolve, _reject) {
	      _this._resolve = _resolve;
	      _this._reject = _reject;
	    });
	    this._message = message;
	    this._pool = pool;
	    this._worker = null;
	  }
	  _createClass(Request, [{
	    key: "abort",
	    value: function abort() {
	      if (this._isNotDisposed) {
	        this._pool._abortRequest(this);
	        this._dispose();
	      }
	    }
	  }, {
	    key: "response",
	    value: function response() {
	      return this._promise;
	    }
	  }, {
	    key: "_dispose",
	    value: function _dispose() {
	      this._reject = null;
	      this._resolve = null;
	    }
	  }, {
	    key: "_isNotDisposed",
	    get: function get() {
	      return this._resolve && this._reject;
	    }
	  }]);
	  return Request;
	}();
	var WorkerPool = function () {
	  function WorkerPool(path, amount) {
	    _classCallCheck(this, WorkerPool);
	    this._workers = [];
	    for (var i = 0; i < amount; ++i) {
	      var worker = new WorkerState(new Worker(path));
	      worker.attach(this);
	      this._workers[i] = worker;
	    }
	    this._requests = new Map();
	    this._counter = 0;
	    this._pendingFlag = false;
	    this._init = null;
	  }
	  _createClass(WorkerPool, [{
	    key: "init",
	    value: function init() {
	      var _this2 = this;
	      var promise = new Promise(function (resolve, reject) {
	        _this2._init = {
	          resolve: resolve,
	          reject: reject
	        };
	      });
	      this.sendAll({
	        type: "ping"
	      }).then(this._init.resolve, this._init.reject).finally(function () {
	        _this2._init = null;
	      });
	      return promise;
	    }
	  }, {
	    key: "handleEvent",
	    value: function handleEvent(e) {
	      if (e.type === "message") {
	        var message = e.data;
	        var request = this._requests.get(message.replyToId);
	        if (request) {
	          request._worker.busy = false;
	          if (request._isNotDisposed) {
	            if (message.type === "success") {
	              request._resolve(message.payload);
	            } else if (message.type === "error") {
	              request._reject(new Error(message.stack));
	            }
	            request._dispose();
	          }
	          this._requests.delete(message.replyToId);
	        }
	        this._sendPending();
	      } else if (e.type === "error") {
	        if (this._init) {
	          this._init.reject(new Error("worker error during init"));
	        }
	        console.error("worker error", e);
	      }
	    }
	  }, {
	    key: "_getPendingRequest",
	    value: function _getPendingRequest() {
	      var _iterator = _createForOfIteratorHelper(this._requests.values()),
	          _step;
	      try {
	        for (_iterator.s(); !(_step = _iterator.n()).done;) {
	          var r = _step.value;
	          if (!r._worker) {
	            return r;
	          }
	        }
	      } catch (err) {
	        _iterator.e(err);
	      } finally {
	        _iterator.f();
	      }
	    }
	  }, {
	    key: "_getFreeWorker",
	    value: function _getFreeWorker() {
	      var _iterator2 = _createForOfIteratorHelper(this._workers),
	          _step2;
	      try {
	        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	          var w = _step2.value;
	          if (!w.busy) {
	            return w;
	          }
	        }
	      } catch (err) {
	        _iterator2.e(err);
	      } finally {
	        _iterator2.f();
	      }
	    }
	  }, {
	    key: "_sendPending",
	    value: function _sendPending() {
	      this._pendingFlag = false;
	      var success;
	      do {
	        success = false;
	        var request = this._getPendingRequest();
	        if (request) {
	          var worker = this._getFreeWorker();
	          if (worker) {
	            this._sendWith(request, worker);
	            success = true;
	          }
	        }
	      } while (success);
	    }
	  }, {
	    key: "_sendWith",
	    value: function _sendWith(request, worker) {
	      request._worker = worker;
	      worker.busy = true;
	      worker.worker.postMessage(request._message);
	    }
	  }, {
	    key: "_enqueueRequest",
	    value: function _enqueueRequest(message) {
	      this._counter += 1;
	      message.id = this._counter;
	      var request = new Request(message, this);
	      this._requests.set(message.id, request);
	      return request;
	    }
	  }, {
	    key: "send",
	    value: function send(message) {
	      var request = this._enqueueRequest(message);
	      var worker = this._getFreeWorker();
	      if (worker) {
	        this._sendWith(request, worker);
	      }
	      return request;
	    }
	  }, {
	    key: "sendAll",
	    value: function sendAll(message) {
	      var _this3 = this;
	      var promises = this._workers.map(function (worker) {
	        var request = _this3._enqueueRequest(Object.assign({}, message));
	        _this3._sendWith(request, worker);
	        return request.response();
	      });
	      return Promise.all(promises);
	    }
	  }, {
	    key: "dispose",
	    value: function dispose() {
	      var _iterator3 = _createForOfIteratorHelper(this._workers),
	          _step3;
	      try {
	        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
	          var w = _step3.value;
	          w.detach(this);
	          w.worker.terminate();
	        }
	      } catch (err) {
	        _iterator3.e(err);
	      } finally {
	        _iterator3.f();
	      }
	    }
	  }, {
	    key: "_trySendPendingInNextTick",
	    value: function _trySendPendingInNextTick() {
	      var _this4 = this;
	      if (!this._pendingFlag) {
	        this._pendingFlag = true;
	        Promise.resolve().then(function () {
	          _this4._sendPending();
	        });
	      }
	    }
	  }, {
	    key: "_abortRequest",
	    value: function _abortRequest(request) {
	      request._reject(new AbortError());
	      if (request._worker) {
	        request._worker.busy = false;
	      }
	      this._requests.delete(request._message.id);
	      this._trySendPendingInNextTick();
	    }
	  }]);
	  return WorkerPool;
	}();

	function addScript(src) {
	  return new Promise(function (resolve, reject) {
	    var s = document.createElement("script");
	    s.setAttribute("src", src);
	    s.onload = resolve;
	    s.onerror = reject;
	    document.body.appendChild(s);
	  });
	}
	function loadOlm(_x) {
	  return _loadOlm.apply(this, arguments);
	}
	function _loadOlm() {
	  _loadOlm = _asyncToGenerator( regeneratorRuntime.mark(function _callee(olmPaths) {
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            if (window.msCrypto && !window.crypto) {
	              window.crypto = window.msCrypto;
	            }
	            if (!olmPaths) {
	              _context.next = 14;
	              break;
	            }
	            if (!window.WebAssembly) {
	              _context.next = 9;
	              break;
	            }
	            _context.next = 5;
	            return addScript(olmPaths.wasmBundle);
	          case 5:
	            _context.next = 7;
	            return window.Olm.init({
	              locateFile: function locateFile() {
	                return olmPaths.wasm;
	              }
	            });
	          case 7:
	            _context.next = 13;
	            break;
	          case 9:
	            _context.next = 11;
	            return addScript(olmPaths.legacyBundle);
	          case 11:
	            _context.next = 13;
	            return window.Olm.init();
	          case 13:
	            return _context.abrupt("return", window.Olm);
	          case 14:
	            return _context.abrupt("return", null);
	          case 15:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _loadOlm.apply(this, arguments);
	}
	function relPath(path, basePath) {
	  var idx = basePath.lastIndexOf("/");
	  var dir = idx === -1 ? "" : basePath.slice(0, idx);
	  var dirCount = dir.length ? dir.split("/").length : 0;
	  return "../".repeat(dirCount) + path;
	}
	function loadWorker(_x2) {
	  return _loadWorker.apply(this, arguments);
	}
	function _loadWorker() {
	  _loadWorker = _asyncToGenerator( regeneratorRuntime.mark(function _callee2(paths) {
	    var workerPool, path;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            workerPool = new WorkerPool(paths.worker, 4);
	            _context2.next = 3;
	            return workerPool.init();
	          case 3:
	            path = relPath(paths.olm.legacyBundle, paths.worker);
	            _context2.next = 6;
	            return workerPool.sendAll({
	              type: "load_olm",
	              path: path
	            });
	          case 6:
	            return _context2.abrupt("return", workerPool);
	          case 7:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2);
	  }));
	  return _loadWorker.apply(this, arguments);
	}
	function main(_x3, _x4) {
	  return _main.apply(this, arguments);
	}
	function _main() {
	  _main = _asyncToGenerator( regeneratorRuntime.mark(function _callee3(container, paths) {
	    var clock, request, sessionInfoStorage, storageFactory, workerPromise, vm, view;
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            _context3.prev = 0;
	            clock = new Clock$1();
	            if (typeof fetch === "function") {
	              request = createFetchRequest(clock.createTimeout);
	            } else {
	              request = xhrRequest;
	            }
	            sessionInfoStorage = new SessionInfoStorage("brawl_sessions_v1");
	            storageFactory = new StorageFactory();
	            if (!window.WebAssembly) {
	              workerPromise = loadWorker(paths);
	            }
	            vm = new BrawlViewModel({
	              createSessionContainer: function createSessionContainer() {
	                return new SessionContainer({
	                  random: Math.random,
	                  onlineStatus: new OnlineStatus(),
	                  storageFactory: storageFactory,
	                  sessionInfoStorage: sessionInfoStorage,
	                  request: request,
	                  clock: clock,
	                  olmPromise: loadOlm(paths.olm),
	                  workerPromise: workerPromise
	                });
	              },
	              sessionInfoStorage: sessionInfoStorage,
	              storageFactory: storageFactory,
	              clock: clock
	            });
	            window.__brawlViewModel = vm;
	            _context3.next = 10;
	            return vm.load();
	          case 10:
	            view = new BrawlView(vm);
	            container.appendChild(view.mount());
	            _context3.next = 17;
	            break;
	          case 14:
	            _context3.prev = 14;
	            _context3.t0 = _context3["catch"](0);
	            console.error("".concat(_context3.t0.message, ":\n").concat(_context3.t0.stack));
	          case 17:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3, null, [[0, 14]]);
	  }));
	  return _main.apply(this, arguments);
	}

	exports.main = main;

	return exports;

}({}));
