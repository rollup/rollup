const detail = { value: null };
const event = new CustomEvent('test', { detail });
event.detail.value = true;
if (detail.value) console.log('ok');
else console.log('failed');
