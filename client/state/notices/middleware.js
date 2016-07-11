/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import {
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_SAVE_SUCCESS
} from 'state/action-types';

export const OBSERVERS = {
	[ POST_DELETE_FAILURE ]: ( action, dispatch, getState ) => {
		const post = getSitePost( getState(), action.siteId, action.postId );

		let message;
		if ( post ) {
			message = translate( 'An error occurred while deleting "%s"', {
				args: [ truncate( post.title, { length: 24 } ) ]
			} );
		} else {
			message = translate( 'An error occurred while deleting the post' );
		}

		dispatch( errorNotice( message ) );
	},
	[ POST_DELETE_SUCCESS ]: ( action, dispatch ) => {
		dispatch( successNotice( translate( 'Post successfully deleted' ) ) );
	},
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
