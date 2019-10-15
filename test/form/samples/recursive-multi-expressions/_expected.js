const unknown = globalThis.unknown;

var logical1 = logical1 || (() => {});
logical1()();
logical1.x = 1;
logical1().x = 1;
logical1()().x = 1;

var logical2 = logical2 || console.log;
logical2();

var conditional1 = unknown ? conditional1 : () => {};
conditional1()();
conditional1.x = 1;
conditional1().x = 1;
conditional1()().x = 1;

var conditional2 = unknown ? conditional1 : console.log;
conditional2();
