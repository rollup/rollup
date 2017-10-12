const removed1 = () => removed1();
removed1();

const removed2 = () => () => removed2()();
removed2()();
