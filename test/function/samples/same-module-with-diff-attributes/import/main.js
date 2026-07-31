import smallLogoImage from './logo.png' with { size: '100' };
import largeLogoImage from './logo.png' with { size: '200' };

assert.equal(smallLogoImage, './logo.png?attributes=%7B%22size%22%3A%22100%22%7D');
assert.equal(largeLogoImage, './logo.png?attributes=%7B%22size%22%3A%22200%22%7D');
