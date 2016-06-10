import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import crypto from 'crypto';

import {
	firstValid,
	hardTruncation,
	shortEnough
} from '../helpers';

const TITLE_LENGTH = 40;
const DESCRIPTION_LENGTH = 300;

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

const blavatarUrl = slug => {
	const slugHash = crypto
		.createHash( 'md5' )
		.update( slug )
		.digest( 'hex' );

	return `https://secure.gravatar.com/blavatar/${ slugHash }?s=512`;
};

const facebookTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	hardTruncation( TITLE_LENGTH )
);

const facebookDesription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export const FacebookPreview = React.createClass( {
	mixins: [ PureRenderMixin ],

	render() {
		const {
			url,
			type,
			title,
			description,
			image,
			slug
		} = this.props;

		const previewClasses = classNames( 'facebook-opengraph-preview', {
			[ `facebook-opengraph-preview__${ type }` ]: true
		} );

		return (
			<div className={ previewClasses }>
				<div className="facebook-opengraph-preview__image">
					<img src={ image || blavatarUrl( slug ) } />
				</div>
				<div className="facebook-opengraph-preview__body">
					<div className="facebook-opengraph-preview__title">
						{ facebookTitle( title || '' ) }
					</div>
					<div className="facebook-opengraph-preview__description">
						{ facebookDesription( description || '' ) }
					</div>
					<div className="facebook-opengraph-preview__url">
						{ baseDomain( url ) }
					</div>
				</div>
			</div>
		);
	}
} );

FacebookPreview.propTypes = {
	url: PropTypes.string,
	type: PropTypes.string,
	title: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string,
	slug: PropTypes.string
};

export default FacebookPreview;
