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
import { NOTICE_CREATE } from 'state/action-types';

describe( 'middleware', () => {
	function dummyNoticeObserver( action, dispatch, getState ) {
		dispatch( successNotice( `${ getState() } ${ action.target }` ) );
	}

	let store;
	useSandbox( ( sandbox ) => {
		store = createStore( () => 'Hello' );
		sandbox.spy( store, 'dispatch' );
	} );

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
