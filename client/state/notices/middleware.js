/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { successNotice } from 'state/notices/actions';
import { POST_SAVE_SUCCESS } from 'state/action-types';

export const OBSERVERS = {
	[ POST_SAVE_SUCCESS ]: ( action, dispatch ) => {
		let text;
		switch ( action.post.status ) {
			case 'trash':
				text = translate( 'Post successfully moved to trash' );
				break;

			case 'publish':
				text = translate( 'Post successfully published' );
				break;
		}

		if ( text ) {
			dispatch( successNotice( text ) );
		}
	}
};

export default function noticesMiddleware( { dispatch, getState } ) {
	return ( next ) => ( action ) => {
		if ( OBSERVERS.hasOwnProperty( action.type ) ) {
			OBSERVERS[ action.type ]( action, dispatch, getState );
		}

		return next( action );
	};
}
