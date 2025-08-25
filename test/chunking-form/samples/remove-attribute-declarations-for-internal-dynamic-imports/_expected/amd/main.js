define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-foo'], resolve, reject); });

}));
