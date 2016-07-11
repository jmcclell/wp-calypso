/**
 * External dependencies
 */
import { expect } from 'chai';
import { createStore } from 'redux';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import noticesMiddleware, { OBSERVERS } from '../middleware';
import { useSandbox } from 'test/helpers/use-sinon';
import { successNotice } from 'state/notices/actions';
import {
	NOTICE_CREATE,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_SAVE_SUCCESS
} from 'state/action-types';

describe( 'middleware', () => {
	let state = null,
		store;

	useSandbox( ( sandbox ) => {
		store = createStore( noop );
		sandbox.stub( store, 'getState', () => state );
		sandbox.spy( store, 'dispatch' );
	} );

	beforeEach( () => {
		state = null;
	} );

	describe( 'noticesMiddleware()', () => {
		function dummyNoticeObserver( action, dispatch, getState ) {
			dispatch( successNotice( `${ getState() } ${ action.target }` ) );
		}

		before( () => {
			OBSERVERS.DUMMY_TYPE = dummyNoticeObserver;
		} );

		after( () => {
			delete OBSERVERS.DUMMY_TYPE;
		} );

		it( 'should trigger the observer corresponding to the dispatched action type', () => {
			state = 'Hello';
			noticesMiddleware( store )( noop )( { type: 'DUMMY_TYPE', target: 'World' } );

			expect( store.dispatch ).to.have.been.calledWithMatch( {
				type: NOTICE_CREATE,
				notice: {
					text: 'Hello World'
				}
			} );
		} );
	} );

	describe( 'OBSERVERS', () => {
		context( '.POST_DELETE_FAILURE', () => {
			it( 'should dispatch error notice with truncated title if known', () => {
				state = {
					posts: {
						items: {
							'3d097cb7c5473c169bba0eb8e3c6cb64': {
								ID: 841,
								site_ID: 2916284,
								global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
								title: 'Hello World, This Should Be Truncated'
							}
						}
					}
				};

				noticesMiddleware( store )( noop )( {
					type: POST_DELETE_FAILURE,
					siteId: 2916284,
					postId: 841
				} );

				expect( store.dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting "Hello World, This Sho..."'
					}
				} );
			} );

			it( 'should dispatch error notice with unknown title', () => {
				state = {
					posts: {
						items: {}
					}
				};

				noticesMiddleware( store )( noop )( {
					type: POST_DELETE_FAILURE,
					siteId: 2916284,
					postId: 841
				} );

				expect( store.dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error',
						text: 'An error occurred while deleting the post'
					}
				} );
			} );
		} );

		context( '.POST_DELETE_SUCCESS', () => {
			it( 'should dispatch success notice', () => {
				noticesMiddleware( store )( noop )( {
					type: POST_DELETE_SUCCESS
				} );

				expect( store.dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully deleted'
					}
				} );
			} );
		} );

		context( '.POST_SAVE_SUCCESS', () => {
			it( 'should not dispatch if status has no corresponding text', () => {
				noticesMiddleware( store )( noop )( {
					type: POST_SAVE_SUCCESS,
					post: {
						title: 'Hello World',
						status: 'invalid'
					}
				} );

				expect( store.dispatch ).to.not.have.been.calledWithMatch( {
					type: NOTICE_CREATE
				} );
			} );

			it( 'should dispatch success notice for trash', () => {
				noticesMiddleware( store )( noop )( {
					type: POST_SAVE_SUCCESS,
					post: { status: 'trash' }
				} );

				expect( store.dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully moved to trash'
					}
				} );
			} );

			it( 'should dispatch success notice for publish', () => {
				noticesMiddleware( store )( noop )( {
					type: POST_SAVE_SUCCESS,
					post: { status: 'publish' }
				} );

				expect( store.dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-success',
						text: 'Post successfully published'
					}
				} );
			} );
		} );
	} );
} );
