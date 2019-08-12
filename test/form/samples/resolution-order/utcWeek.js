function interval() {
	var i = function() {};
	i.range = function() {};
	return i;
}

function utcWeekday(i) {
	return interval();
}

export var utcSunday = utcWeekday(0);
export var utcMonday = utcWeekday(1);
export var utcTuesday = utcWeekday(2);
export var utcWednesday = utcWeekday(3);
export var utcThursday = utcWeekday(4);
export var utcFriday = utcWeekday(5);
export var utcSaturday = utcWeekday(6);

export var utcSundays = utcSunday.range;
export var utcMondays = utcMonday.range;
export var utcTuesdays = utcTuesday.range;
export var utcWednesdays = utcWednesday.range;
export var utcThursdays = utcThursday.range;
export var utcFridays = utcFriday.range;
export var utcSaturdays = utcSaturday.range;
