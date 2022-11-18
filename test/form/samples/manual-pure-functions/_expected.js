const lib = () => console.log();
lib.baz = console.log;

lib(); // not removed
lib.quuz(); // not removed
