let proto = {
  get a() { log(); },
  get b() {}
};

let plainProto = {
  __proto__: proto
};
if (plainProto.a) ;

let quotedProto = {
  "__proto__": proto
};
if (quotedProto.a) ;
