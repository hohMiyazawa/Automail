// SPDX-FileCopyrightText: 2021 Reina
// SPDX-License-Identifier: MIT
/*
Copyright (c) 2021 Reina

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
//updated code here: https://github.com/Reinachan/AniList-High-Contrast-Dark-Theme
exportModule({
	id: "reinaDark",
	description: "$setting_reinaDark",
	extendedDescription: `
More info and standalone versions: https://anilist.co/activity/136403139

Github: https://github.com/Reinachan/AniList-High-Contrast-Dark-Theme
`,
	isDefault: true,
	importance: 1,
	categories: ["Script"],
	visible: true,
	css: `
.theme-preview.dark-contrast{
	border-radius: 3px;
	border: 2px solid #46546b;
	cursor: pointer;
	display: inline-block;
	font-weight: 500;
	height: 25px;
	margin-right: 10px;
	padding-left: 2px;
	padding-top: 5px;
	width: 25px;

	background: rgb(14, 18, 22);
	color: rgb(240, 240, 240);
}
`//not the actual theme itself, just the styling of the theme switch
})

//outside the actual module export, as we want to run this at page load
if(useScripts.reinaDark){
	let darkContrastStyle = create("style");
	darkContrastStyle.id = "high-contrast-dark";
	darkContrastStyle.type = "text/css";
	documentHead.appendChild(darkContrastStyle);
	const style = `
:root {
	--color-background: 14, 18, 22;
	--color-blue: 120, 180, 255;
	--color-shadow-blue: 0, 0, 0;
	--color-foreground: 20, 25, 31;
	--color-foreground-alt: 18, 23, 29;
	--color-foreground-blue: 26, 33, 45;
	--color-foreground-grey: 15, 22, 28;
	--color-foreground-grey-dark: 6, 12, 13;
	--color-background-300: 30, 42, 56;
	--color-background-100: 19, 24, 32;
	--color-background-200: 14, 18, 22;
	--color-text: 240, 240, 240;
	--color-text-light: 220, 230, 240;
	--color-text-lighter: 230, 230, 240;
	--color-text-bright: 255, 255, 255;
	--color-blue-100: 247, 250, 252;
	--color-blue-200: 236, 246, 254;
	--color-blue-300: 201, 232, 255;
	--color-blue-400: 143, 215, 255;
	--color-blue-500: 111, 200, 255;
	--color-blue-600: 61, 180, 242;
	--color-blue-700: 8, 143, 214;
	--color-blue-800: 12, 101, 166;
	--color-blue-900: 11, 70, 113;
	--color-blue-1000: 16, 61, 85;
	--color-gray-1200: 251, 251, 251;
	--color-gray-1100: 240, 243, 246;
	--color-gray-1000: 221, 230, 238;
	--color-gray-900: 201, 215, 227;
	--color-gray-800: 173, 192, 210;
	--color-gray-700: 139, 160, 178;
	--color-gray-600: 116, 136, 153;
	--color-gray-500: 100, 115, 128;
	--color-gray-400: 81, 97, 112;
	--color-gray-300: 30, 42, 56;
	--color-gray-100: 21, 31, 46;
	--color-gray-200: 11, 22, 34;
}
.site-theme-dark {
	--color-blue: 120, 180, 255;
	--color-shadow-blue: 8, 10, 16, 0.5;
	--color-foreground: 20, 25, 31;
	--color-foreground-alt: 18, 23, 29;
	--color-background: 14, 18, 22;
	--color-foreground-blue: 26, 33, 45;
	--color-foreground-grey: 15, 22, 28;
	--color-foreground-grey-dark: 6, 12, 13;
	--color-nav-hoh: rgb(20, 25, 31);
}
.site-theme-dark {
	/* Notification Dropdown */
	--color-background-300: 30, 42, 56;
	--color-background-100: 19, 24, 32;
	--color-background-200: 14, 18, 22;
	/* Text */
	--color-text: 240, 240, 240;
	--color-text-light: 220, 230, 240;
	--color-text-lighter: 230, 230, 240;
	--color-text-bright: 255, 255, 255;
	/* Blue Colours */
	--color-blue-100: 247, 250, 252;
	--color-blue-200: 236, 246, 254;
	--color-blue-300: 201, 232, 255;
	--color-blue-400: 143, 215, 255;
	--color-blue-500: 111, 200, 255;
	--color-blue-600: 61, 180, 242;
	--color-blue-700: 8, 143, 214;
	--color-blue-800: 12, 101, 166;
	--color-blue-900: 11, 70, 113;
	--color-blue-1000: 16, 61, 85;
}
/* Navbar */
#app .nav-unscoped {
	background: #14191f;
	color: #eaeeff;
}
#app .nav-unscoped.transparent {
	background: rgba(20, 25, 31, 0.5);
	color: #eaeeff;
}
#app .nav-unscoped.transparent:hover {
	background: #14191f;
	color: #eaeeff;
}
#app .nav-unscoped .dropdown::before {
	border-bottom-color: rgb(var(--color-background-100));
}
.nav[data-v-e2f25004] {
	background: #181a32;
}
.banner-image[data-v-e2f25004] {
	filter: grayscale(50%);
}
/* Mobile and small screens adjustments */
@media screen and (max-width: 760px) {
	.page-content > .container,
	.page-content > .user > .container {
		padding-left: 2px;
		padding-right: 2px;
	}
}
/* Increase font size */
@media screen and (max-width: 760px) {
	html {
		font-size: 11px;
	}
}
/* Enable edit button on mobile */
@media screen and (max-width: 760px) {
	.media.media-page-unscoped .sidebar {
		display: grid;
		gap: 20px;
		margin-bottom: 20px;
	}
	.media.media-page-unscoped .sidebar > * {
		grid-column: span 2;
	}
	.media.media-page-unscoped .sidebar .review.button {
		grid-row: 1;
		grid-column: 2;
		width: 100%;
		height: 40px;
		margin: 0;
		display: flex;
	}
	.media.media-page-unscoped .sidebar .review.button.edit {
		grid-column: 1;
	}
	.media.media-page-unscoped .sidebar .review.button.edit span::after {
		content: ' Database Entry';
	}
	.media.media-page-unscoped .sidebar .data {
		margin-bottom: 0;
	}
	.media.media-page-unscoped .sidebar .rankings {
		grid-row: 4;
		display: grid;
		gap: 10px;
	}
	.media.media-page-unscoped .sidebar .rankings .ranking {
		margin-bottom: 0;
	}
	.media.media-page-unscoped .sidebar .rankings .ranking.rated {
		grid-column: 1;
	}
	.media.media-page-unscoped .sidebar .rankings .ranking.popular {
		grid-column: 2;
	}
}
@media screen and (max-width: 450px) {
	.media.media-page-unscoped .sidebar .rankings .ranking.rated {
		grid-column: 1;
		grid-row: 1;
	}
	.media.media-page-unscoped .sidebar .rankings .ranking.popular {
		grid-column: 1;
		grid-row: 2;
	}
}
/* Profile page mobile edits */
@media screen and (max-width: 760px) {
	.user.user-page-unscoped .overview .section .about {
		padding: 10px;
	}
}
@media screen and (max-width: 1040px) {
	.tooltip {
		display: none !important;
	}
	.user.user-page-unscoped .overview .desktop {
		display: grid;
	}
	.user.user-page-unscoped .overview .desktop.favourites.preview .favourites-wrap {
		display: grid;
		grid-auto-flow: column;
		justify-content: unset;
		width: unset;
		margin: 0;
		overflow-x: scroll;
	}
	.user.user-page-unscoped .overview .desktop.favourites.preview .favourites-wrap a {
		margin: 0;
		margin-bottom: 10px;
	}
	.user.user-page-unscoped .overview .desktop.favourites.preview .favourites-wrap a:last-of-type {
		margin-right: 15px;
	}
	.user.user-page-unscoped .overview .desktop.favourites.preview .favourites-wrap.studios {
		display: flex;
		flex-wrap: nowrap;
	}
	.user.user-page-unscoped .overview .desktop.favourites.preview .favourites-wrap.studios a {
		flex-grow: 1;
		flex-shrink: 0;
		margin-bottom: 6px;
	}
	.user.user-page-unscoped .overview > .section:nth-of-type(2) .stats-wrap {
		display: none;
	}
}
/* Coloured Text */
.name[data-v-5e514b1e] {
	color: rgb(var(--color-blue));
}
.site-theme-dark .user-page-unscoped.pink {
	--color-blue: 252, 157, 214;
}
/* Dropdown menu arrows */
.el-dropdown-menu.el-popper[x-placement^='top'] .popper__arrow::after,
.el-select-dropdown.el-popper[x-placement^='top'] .popper__arrow::after {
	bottom: 0;
}
.el-dropdown-menu.el-popper[x-placement^='bottom'] .popper__arrow::after,
.el-select-dropdown.el-popper[x-placement^='bottom'] .popper__arrow::after {
	top: 0;
}
.el-dropdown-menu.el-popper .popper__arrow,
.el-select-dropdown.el-popper .popper__arrow,
.el-dropdown-menu.el-popper .popper__arrow::after,
.el-select-dropdown.el-popper .popper__arrow::after {
	border-top-color: rgb(var(--color-foreground-grey-dark));
	border-bottom-color: rgb(var(--color-foreground-grey-dark));
}
.el-dropdown-menu.el-popper.activity-extras-dropdown[x-placement^='top'] .popper__arrow::after {
	bottom: 0;
}
.el-dropdown-menu.el-popper.activity-extras-dropdown[x-placement^='bottom'] {
	transform: translateY(25px);
}
.el-dropdown-menu.el-popper.activity-extras-dropdown[x-placement^='bottom'] .popper__arrow {
	top: -5px;
}
/* Dropdown menu */
.el-dropdown-menu.el-popper {
	text-align: center;
	background-color: rgb(var(--color-foreground-grey-dark));
	box-shadow: 0 1px 10px 0 rgba(var(--color-shadow-blue));
}
.el-dropdown-menu.el-popper.el-dropdown-menu--medium {
	width: 150px;
}
.el-dropdown-menu.el-popper.el-dropdown-menu--medium.activity-extras-dropdown {
	text-align: left;
}
.el-dropdown-menu.el-popper.el-dropdown-menu--medium .el-dropdown-menu__item:hover {
	background-color: rgb(var(--color-foreground-alt)) !important;
}
.el-dropdown-menu.el-popper .el-dropdown-menu__item--divided {
	border-top: 3px solid rgb(var(--color-foreground-alt));
	margin: auto;
}
.el-dropdown-menu.el-popper .el-dropdown-menu__item--divided::before {
	background-color: rgb(var(--color-foreground-grey-dark)) !important;
}
/* List editor dropdown menu */
.el-select-dropdown.el-popper {
	background-color: rgb(var(--color-foreground-grey-dark)) !important;
}
.el-select-dropdown {
	box-shadow: 0 1px 10px 0 rgba(var(--color-shadow-blue));
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover {
	background-color: rgb(var(--color-background)) !important;
}
/* Activity Textareas */
.activity-edit .input.el-textarea textarea {
	box-shadow: none;
	will-change: height;
	transition: height 0s;
}
/* Activity Feed Sort */
.feed-select .el-dropdown,
.section-header .el-dropdown {
	margin-right: 10px;
}
.feed-select .el-dropdown .feed-filter,
.section-header .el-dropdown .feed-filter,
.feed-select .el-dropdown .el-dropdown-link,
.section-header .el-dropdown .el-dropdown-link {
	display: none;
}
.feed-select .el-dropdown .el-dropdown-menu,
.section-header .el-dropdown .el-dropdown-menu {
	display: flex !important;
	position: relative;
	text-align: center;
	margin: 0;
	padding: 0;
	box-shadow: none;
	background-color: rgb(var(--color-foreground));
	border-radius: 3px;
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item {
	line-height: inherit;
	font-size: 1.2rem;
	font-weight: 400;
	white-space: nowrap;
	flex-grow: 1;
	margin: 0;
	padding: 6px 10px;
	color: rgb(var(--color-text-lighter));
	border-radius: 3px;
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:hover,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:hover {
	background-color: inherit;
	color: rgb(var(--color-blue));
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item.active,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item.active,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus {
	font-weight: 500;
	background-color: rgb(var(--color-foreground-blue));
	color: rgb(var(--color-text));
	border-radius: 0;
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item.active:hover,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item.active:hover,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:hover,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:hover,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:hover,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:hover {
	background-color: rgb(var(--color-foreground-blue));
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:first-of-type,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:first-of-type,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:first-of-type.active,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:first-of-type.active,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:first-of-type,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:first-of-type {
	border-radius: 3px 0 0 3px;
}
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:last-of-type,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:active:last-of-type,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:last-of-type.active,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:last-of-type.active,
.feed-select .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:last-of-type,
.section-header .el-dropdown .el-dropdown-menu .el-dropdown-menu__item:focus:last-of-type {
	border-radius: 0 3px 3px 0;
}
.overview .section-header {
	align-items: center;
	display: flex;
}
.overview .section-header .el-dropdown {
	margin-right: 0px;
	margin-left: auto;
	padding-right: 0;
}
/* Announcement */
.announcement {
	background-color: rgb(var(--color-blue-800)) !important;
}
/* Date Picker */
.el-picker-panel {
	border: 1px solid rgb(var(--color-foreground));
	background-color: rgb(var(--color-foreground-grey-dark));
	color: rgb(var(--color-text-bright));
}
.el-picker-panel .el-date-picker__header-label {
	color: rgb(var(--color-text));
}
.el-picker-panel .el-picker-panel__icon-btn,
.el-picker-panel .el-date-table th {
	color: rgb(var(--color-text-light));
}
.el-picker-panel .el-date-table td.current:not(.disabled) span {
	background-color: rgb(var(--color-blue-700));
}
.el-picker-panel .el-date-table th {
	border-bottom: 1px solid #60656c;
	padding: 1px;
}
.el-picker-panel .el-date-table td.next-month,
.el-picker-panel .el-date-table td.prev-month {
	color: #76777a;
}
.el-picker-panel .el-date-table tbody tr:nth-of-type(2) td {
	padding-top: 10px;
}
.el-picker-panel .popper__arrow::after {
	border-bottom-color: rgb(var(--color-foreground-grey-dark)) !important;
	border-top-color: rgb(var(--color-foreground-grey-dark)) !important;
}
/* hoh styling */
#hohSettings .hohCategories {
	display: flex;
	flex-wrap: wrap;
	position: relative;
	text-align: center;
	margin: 0;
	padding: 0;
	box-shadow: none;
	background-color: rgb(var(--color-background));
	border-radius: 3px;
}
#hohSettings .hohCategories .hohCategory {
	border: none;
	line-height: inherit;
	font-size: 1.2rem;
	font-weight: 400;
	white-space: nowrap;
	flex-grow: 1;
	margin: 0;
	padding: 6px 10px;
	color: rgb(var(--color-text-lighter));
	border-radius: 3px;
}
#hohSettings .hohCategories .hohCategory:hover {
	background-color: inherit;
	color: rgb(var(--color-blue));
}
#hohSettings .hohCategories .hohCategory.active,
#hohSettings .hohCategories .hohCategory:active,
#hohSettings .hohCategories .hohCategory:focus {
	font-weight: 500;
	background-color: rgb(var(--color-foreground-blue));
	color: rgb(var(--color-text));
	border-radius: 0;
}
#hohSettings .hohCategories .hohCategory.active:hover,
#hohSettings .hohCategories .hohCategory:active:hover,
#hohSettings .hohCategories .hohCategory:focus:hover {
	background-color: rgb(var(--color-foreground-blue));
}
#hohSettings .hohCategories .hohCategory:active:first-of-type,
#hohSettings .hohCategories .hohCategory:first-of-type.active,
#hohSettings .hohCategories .hohCategory:focus:first-of-type {
	border-radius: 3px 0 0 3px;
}
#hohSettings .hohCategories .hohCategory:active:last-of-type,
#hohSettings .hohCategories .hohCategory:last-of-type.active,
#hohSettings .hohCategories .hohCategory:focus:last-of-type {
	border-radius: 0 3px 3px 0;
}
#hohSettings .hohDisplayBox {
	border-color: #0e1216;
	border-radius: 5px;
}
#hohSettings .scrollableContent {
	padding: 30px;
	padding-top: 35px;
	padding-left: 15px;
}
#hohSettings .hohDisplayBoxTitle {
	top: 25px;
	left: 35px;
	font-weight: bold;
	font-size: 1.7em;
}
#hohSettings .hohResizePearl {
	right: 10px;
	bottom: 10px;
}
#hohSettings .hohDisplayBoxClose {
	padding: 4px;
	border-radius: 20px;
	border-width: 2px;
	border-color: #900;
	width: 30px;
	height: 30px;
	text-align: center;
	vertical-align: bottom;
	font-weight: bold;
}
#hohSettings input,
#hohSettings select {
	height: 40px;
	border-radius: 4px;
	color: rgb(var(--color-text));
	outline: 0;
	transition: 0.2s;
	border: 0;
	background: rgb(var(--color-background));
	box-shadow: none;
	padding-right: 10px;
	padding-left: 15px;
}
#hohSettings textarea {
	border-radius: 4px;
	color: rgb(var(--color-text));
	outline: 0;
	transition: 0.2s;
	border: 0;
	background: rgb(var(--color-background));
	box-shadow: none;
	padding: 10px;
	width: 100%;
	height: 200px;
}
.hohNativeInput {
	height: 40px;
	border-radius: 4px;
	color: rgb(var(--color-text));
	outline: 0;
	transition: 0.2s;
	border: 0;
	background: rgb(var(--color-background));
	box-shadow: none;
	padding-right: 10px;
	padding-left: 15px;
}
.info.hasMeter {
	position: absolute !important;
	width: 100%;
	left: 0 !important;
	bottom: 0 !important;
	padding: 12px;
}
.info.hasMeter meter {
	border-radius: 4px;
	width: 100%;
	height: 5px;
}
.info.hasMeter meter::-moz-meter-bar {
	border-radius: 4px;
}
.activity-entry {
	border-radius: 4px;
	margin-right: 0 !important;
}
/* Forum */
.comment-wrap {
	border-left: 7px solid rgba(var(--color-foreground-blue));
}
.comment-wrap .child.odd {
	border-left: 7px solid rgba(var(--color-foreground-grey-dark));
}
/* Staff/character page header */
@media screen and (max-width: 700px) {
	.character-wrap > .character > .header .mobile-background,
	.staff-wrap > .staff > .header .mobile-background {
		background: rgb(var(--color-foreground));
	}
}
@media screen and (min-width: 701px) {
	.character-wrap > .character > .header,
	.staff-wrap > .staff > .header {
		background: rgb(var(--color-foreground));
	}
}
.character-wrap > .character > .header .name,
.staff-wrap > .staff > .header .name {
	color: rgb(var(--color-gray-900));
}
.character-wrap > .character > .header .name-alt,
.staff-wrap > .staff > .header .name-alt {
	color: rgb(var(--color-gray-800));
}
.character-wrap > .character > .header .edit,
.staff-wrap > .staff > .header .edit {
	color: rgb(var(--color-gray-800));
}
/* ------ Database Tools ------ */
@media screen and (max-width: 800px) {
	.media.container {
		grid-template-columns: auto;
		gap: 20px;
		min-width: 250px;
	}
	/* Popup modal */
	.media.container .el-dialog__wrapper.dialog .el-dialog {
		width: 98%;
	}
	/* Navigation tabs */
	.media.container .pages {
		grid-column: 1;
		grid-row: 1;
	}
	.media.container > div:last-of-type {
		grid-column: 1;
		grid-row: 2;
	}
}
/* General form inputs */
.media.container .submission-form .col-2 {
	gap: 0 10px;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.media.container .submission-form .col-3 {
	gap: 0 10px;
	grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.media.container .submission-form.select-group .col-3 {
	gap: 10px;
	grid-template-columns: repeat(auto-fit, minmax(180px, 250px));
}
/* Character page */
.media.container .character-row {
	grid-template-columns: 1fr 1.3fr 0.1fr;
}
@media screen and (min-width: 1000px) {
	.media.container .character-row {
		grid-template-columns: 0.6fr 1.3fr 0.1fr;
	}
}
@media screen and (max-width: 450px) {
	.media.container .character-row {
		grid-template-columns: auto auto 40px;
		grid-template-rows: auto;
		gap: 10px;
	}
	.media.container .character-row .character.col {
		grid-row: 1;
	}
	.media.container .character-row .actor.col {
		grid-row: 2;
	}
	.media.container .character-row .actions {
		grid-column: 3;
		grid-row: 1 / span 2;
	}
}
/* Images */
@media screen and (min-width: 550px) {
	.media.container .images .submission-form:first-of-type {
		display: grid;
		grid-template-columns: min-content;
	}
	.media.container .images .submission-form:first-of-type .el-input {
		grid-column: 2;
		grid-row: 1;
	}
	.media.container .images .submission-form:first-of-type .cover {
		margin-right: 15px;
		grid-column: 1;
		grid-row: 1;
	}
}
.media.container .images .submission-form .cover.banner {
	width: 100%;
}
/* Increased active tab contrast in media and user nav */
.media .nav .link.router-link-exact-active.router-link-active,
.user .nav .link.router-link-exact-active.router-link-active {
	background: rgba(var(--color-background-200));
}
.media .nav .link.router-link-exact-active.router-link-active {
	color: rgb(var(--color-blue));
	border-radius: 3px 3px 0 0;
	padding: 15px 30px;
}
/* Reduce transparancy of card view notes to make them less easier to miss (accessibility) */
.medialist.cards .entry-card .notes,
.medialist.cards .entry-card .repeat {
	color: rgba(var(--color-white),1) !important;
	filter: drop-shadow(0 0 3px rgba(0,0,0,.9)) !important;
}
/* Increased contrast of review date */
.review .banner .date {
	color: rgba(var(--color-white),.6);
}
`
	if(useScripts.reinaDarkEnable){
		darkContrastStyle.textContent = style
	}
	let adder = function(){//listen for the Site Theme changer to appear. A poller should be all that's needed
		let siteThemeSwitch = document.querySelector(".footer .theme-selector");
		if(!siteThemeSwitch){
			setTimeout(adder,500);//pretty relaxed timer, since the footer isn't even on screen when the page loads. 
		}
		else{
			siteThemeSwitch.appendChild(document.createTextNode(" "));
			Array.from(document.querySelectorAll(".el-tooltip.theme-preview")).forEach(theme => {
				theme.onclick = function(){
					if(useScripts.reinaDarkEnable){
						useScripts.reinaDarkEnable = false;
						useScripts.save();
						darkContrastStyle.textContent = ""
					}
				}
			})
			let darkContrastSwitch = create("div",["el-tooltip","theme-preview","dark-contrast"],"A",siteThemeSwitch);
			darkContrastSwitch.title = translate("$theme_highContrastDark");//not quite the same as the native tooltip, but that's a minor issue that can be fixed later
			darkContrastSwitch.onclick = function(){
				if(!useScripts.reinaDarkEnable){
					document.querySelector(".el-tooltip.theme-preview.dark").click();//fallback theme
					useScripts.reinaDarkEnable = true;
					useScripts.save();
					darkContrastStyle.textContent = style
				}
			}
		}
	};
	adder()
}
