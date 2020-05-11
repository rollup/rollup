global.myGlobal = 1;
export default myGlobal;
global.myGlobal = 2;
export const updated = myGlobal;
delete global.myGlobal;
