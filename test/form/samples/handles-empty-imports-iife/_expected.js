(function (dns, util, fs) {
	'use strict';

	dns.resolve('name');
	fs.writeFileSync('foo', 'bar');

}(dns, util, fs));
