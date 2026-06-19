define(['./.env.local', './.env2.local'], (function (dep1, dep2) { 'use strict';

	console.log(dep1.num + dep2.num);

}));
