let basic = {
  a: false
};
if (basic.a) log("basic");

let proto = {
  get a() { log(); },
  get b() {}
};

let plainProto = {
  __proto__: proto
};
if (plainProto.a) log("plainProto a");
if (plainProto.b) log("plainProto b");

let quotedProto = {
  "__proto__": proto
};
if (quotedProto.a) log("quotedProto a");
if (quotedProto.b) log("quotedProto b");
