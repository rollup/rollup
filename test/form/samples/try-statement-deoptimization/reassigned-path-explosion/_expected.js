var node = globalThis.rootNode;

while (node) {
	node = node.k0;
	node = node.k1;
	node = node.k2;
	node = node.k3;
	node = node.k4;
	node = node.k5;
	node = node.k6;
	node = node.k7;
	node = node.k8;
	node = node.k9;
	node = node.k10;
	node = node.k11;
	node = node.k12;
	node = node.k13;
	node = node.k14;
	node = node.k15;
	node = node.k16;
	node = node.k17;
	node = node.k18;
	node = node.k19;
	node = node.k20;
	node = node.k21;
	node = node.k22;
	node = node.k23;
	node.callback(function () {
		console.log('retained');
	});
}
