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
import { NOTICE_CREATE, POST_SAVE_SUCCESS } from 'state/action-types';

describe( 'middleware', () => {
	let store;
	useSandbox( ( sandbox ) => {
		store = createStore( () => 'Hello' );
		sandbox.spy( store, 'dispatch' );
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
