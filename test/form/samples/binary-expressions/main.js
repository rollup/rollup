if ((1 + 1).unknown) {
	console.log('retained');
} else {
	console.log('retained');
}

if (1 != '1') console.log('removed');
if (1 !== 1) console.log('removed');
if (4 % 2 === 0) console.log('retained 1');
if ((6 & 3) === 2) console.log('retained 2');
if (2 * 3 === 6) console.log('retained 3');
if (2 ** 3 === 8) console.log('retained 4');
if (2 + 3 === 5) console.log('retained 5');
if (3 - 2 === 1) console.log('retained 6');
if (6 / 3 === 2) console.log('retained 7');
if (1 < 2 ) console.log('retained 8');
if (3 << 1 === 6) console.log('retained 9');
if (3 <= 4) console.log('retained 10');
if (1 == '1') console.log('retained 11');
if (1 === 1) console.log('retained 12');
if (3 > 2) console.log('retained 13');
if (3 >= 2) console.log('retained 14');
if (6 >> 1 === 3) console.log('retained 15');
if (-1 >>> 28 === 15) console.log('retained 16');
if (3 ^ 5 === 6) console.log('retained 17');
if (1 in 2) console.log('retained 18');
if (1 instanceof 2) console.log('retained 19');
if (2 | 4 === 6) console.log('retained 20');
