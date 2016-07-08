export const OBSERVERS = {};

export default function noticesMiddleware( { dispatch, getState } ) {
	return ( next ) => ( action ) => {
		if ( OBSERVERS.hasOwnProperty( action.type ) ) {
			OBSERVERS[ action.type ]( action, dispatch, getState );
		}

		return next( action );
	};
}
