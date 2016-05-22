import _ from 'underscore';
import first from './module';

export default function ( inputs ) {
	if ( !_.isArray( inputs ) ) {
		return inputs;
	}

	return first.square( inputs );
};
