/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { wrapThemeOptionsWithSiteSelector } from './themes-site-selector-modal';
import {
	preview,
	purchase,
	activate,
	tryandcustomize,
	getSheetOptions,
	bindOptionsToDispatch
} from './theme-options';
import { getQueryParams, getThemesList } from 'state/themes/themes-list/selectors';
import ThemeShowcase from './theme-showcase';

const ThemesMultiSite = wrapThemeOptionsWithSiteSelector( '/design' )( props => (
	<ThemeShowcase { ...props }>
		<SidebarNavigation />
	</ThemeShowcase>
) );

const mergeProps = ( stateProps, dispatchProps, ownProps ) => Object.assign(
	{},
	ownProps,
	stateProps,
	{
		options: Object.assign(
			{},
			dispatchProps,
			getSheetOptions()
		),
		defaultOption: dispatchProps.tryandcustomize,
		getScreenshotOption: () => getSheetOptions().info
	}
);

export default connect(
	state => ( {
		queryParams: getQueryParams( state ),
		themesList: getThemesList( state )
	} ),
	bindOptionsToDispatch( {
		preview,
		purchase,
		activate,
		tryandcustomize
	}, 'showcase' ),
	mergeProps
)( ThemesMultiSite );
