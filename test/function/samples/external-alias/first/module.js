import _ from 'underscore';

export default function square ( inputs ) {
	return _.map( inputs, function ( x ) {
		return x * x;
	});
};
