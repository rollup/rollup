define(['require'], (function (require) { 'use strict';

	new Promise(function (resolve, reject) { require(['./generated-button'], resolve, reject); }).then(({ default: button }) => console.log(button));
	new Promise(function (resolve, reject) { require(['./generated-other'], resolve, reject); }).then(({ default: other }) => console.log(other));
	new Promise(function (resolve, reject) { require(['./generated-single'], resolve, reject); }).then(({ name }) => console.log(name));
	new Promise(function (resolve, reject) { require(['./generated-index'], resolve, reject); }).then(({ default: withoutDirectory }) => console.log(withoutDirectory));

}));
