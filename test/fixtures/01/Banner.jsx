import _ from 'lodash';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { lucidClassNames } from '../../util/style-helpers';
import { createClass, omitProps } from '../../util/component-types';
import DangerIcon from '../Icon/DangerIcon/DangerIcon';
import InfoIcon from '../Icon/InfoIcon/InfoIcon';
import SuccessIcon from '../Icon/SuccessIcon/SuccessIcon';
import WarningIcon from '../Icon/WarningIcon/WarningIcon';

const cx = lucidClassNames.bind('&-Banner');

const {
	bool,
	element,
	func,
	node,
	oneOf,
	string,
} = React.PropTypes;

/**
 *
 * {"categories": ["communication"], "madeFrom": ["DangerIcon", "InfoIcon", "SuccessIcon", "WarningIcon"]}
 *
 * A basic Banner. Any props that are not explicitly called out below will be
 * passed through to the native `Banner` component.
 *
 * Short single line content can be passed in as a simple string. Multi line
 * messages should be passed wrapped in a `<p>` tag.
 *
 * It is valid to use `strong` or `em` within a `Banner` message.
 */
const Banner = createClass({
	displayName: 'Banner',
	propTypes: {
		/**
		 * Pass in a bool to display predefined icon based on `kind`.
		 */
		hasIcon: bool,
		/**
		 * Pass in a icon component for custom icons within `Banner`.
		 */
		icon: element,
		/**
		 * Set this to `true` if you want to have a `x` close icon.
		 */
		isCloseable: bool,
		/**
		 * Set this value to `false` if you want to remove the rounded corners on
		 * the `Banner`.  **default is `true`**
		 */
		hasRoundedCorners: bool,
		/**
		 * Class names that are appended to the defaults.
		 */
		className: string,
		/**
		 * Any valid React children.
		 */
		children: node,
		/**
		 * Style variations of the `Banner`.
		 */
		kind: oneOf([
			'primary',
			'success',
			'warning',
			'danger',
			'info',
			'default',
		]),
		/**
		 * If set to `true` the banner have smaller padding on the inside.
		 */
		isSmall: bool,
		/**
		 * Called when the user closes the `Banner`.
		 *
		 * Signature: `({ event, props }) => {}`
		 */
		onClose: func,
		/**
		 * Controls the visibility of the `Banner`.
		 */
		isClosed: bool,

	},

	getDefaultProps() {
		return {
			hasIcon: false,
			icon: null,
			isCloseable: true,
			hasRoundedCorners: true,
			kind: 'default',
			isSmall: false,
			onClose: _.noop,
		};
	},

	render() {
		return <div></div>
	},
});

export default Banner;
