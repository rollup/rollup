let basic = {
  a: false
};
if (basic.a) log("basic");

let proto = {
  get a() { log(); }
};

let plainProto = {
  __proto__: proto
};
if (plainProto.a) log("plainProto");

let quotedProto = {
  "__proto__": proto
};
if (quotedProto.a) log("quotedProto");
