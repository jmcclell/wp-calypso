/**
 * External Dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import debounce from 'lodash/debounce';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import HeaderBack from 'reader/header-back';
import FormTextInput from 'components/forms/form-text-input';
import SearchCard from 'components/post-card/search';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';

//const stats = require( 'reader/stats' );
//

const SearchCardAdapter = React.createClass( {
	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( props = this.props ) {
		return {
			site: SiteStore.get( props.post.site_ID ),
			feed: props.post.feed_ID ? FeedStore.get( props.post.feed_ID ) : null
		};
	},

	componentWillReceiveProps( nextProps ) {
		this.setState( this.getStateFromStores( nextProps ) );
	},

	onCardClick( props, event ) {
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			return;
		}
		const rootNode = ReactDom.findDOMNode( this );
		const anchor = closest( event.target, 'a', true, rootNode );

		if ( anchor && anchor.href.search( /\/read\/blogs\/|\/read\/feeds\// ) !== -1 ) {
			return;
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel=external]', true, rootNode ) ) {
			return;
		}

		event.preventDefault();
		this.props.handleClick( this.props.post, {} );
	},

	onCommentClick() {
		this.props.handleClick( this.props.post, { comments: true } );
	},

	render() {
		return <SearchCard
			post={ this.props.post }
			site={ this.state.site }
			feed={ this.state.feed }
			onClick={ this.onCardClick }
			onCommentClick={ this.onCommentClick } />;
	}
} );

const emptyStore = {
	get() {
		return [];
	},
	isLastPage() {
		return true;
	},
	getUpdateCount() {
		return 0;
	},
	getSelectedIndex() {
		return -1;
	},
	on() {},
	off() {}
};

const FeedStream = React.createClass( {

	propTypes: {
		query: React.PropTypes.string
	},

	getInitialState() {
		return {
			title: this.getTitle()
		};
	},

	componentWillMount() {
		this.debouncedUpdate = debounce( this.updateQuery, 300 );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.query !== this.props.query ) {
			this.updateState( nextProps );
		}
	},

	updateState( props = this.props ) {
		const newState = {
			title: this.getTitle( props )
		};
		if ( newState.title !== this.state.title ) {
			this.setState( newState );
		}
	},

	getTitle( props = this.props ) {
		return props.query;
	},

	updateQuery() {
		if ( ! this.isMounted() ) {
			return;
		}
		const newValue = ReactDom.findDOMNode( this.refs.searchInput ).value;
		this.props.onQueryChange( newValue );
	},

	cardFactory() {
		return SearchCardAdapter;
	},

	render() {
		const emptyContent = this.props.query
			? <EmptyContent query={ this.props.query } />
			: <div>{ this.translate( 'What would you like to find?' ) }</div>;

		if ( this.props.setPageTitle ) {
			this.props.setPageTitle( this.state.title || this.translate( 'Search' ) );
		}

		const store = this.props.store || emptyStore;

		return (
			<Stream { ...this.props } store={ store }
				listName={ this.state.title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
				cardFactory={ this.cardFactory } >
				{ this.props.showBack && <HeaderBack /> }
				<h2>{ this.translate( 'Search' ) }</h2>
				<p>
					<FormTextInput
						type="text"
						value={ undefined }
						defaultValue={ this.props.query }
						ref="searchInput"
						onChange={ this.debouncedUpdate }
						placeholder={ this.translate( 'Enter a search term' ) } />
				</p>
			</Stream>
		);
	}
} );

export default FeedStream;
