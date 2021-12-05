//begin "conditionalStyles.js"

function initCSS(){
moreStyle.textContent = "";

let aliasFlag = false;

if(useScripts.shortRomaji){
	shortRomaji.forEach(createAlias);
	aliasFlag = true
}

const titleAliases = JSON.parse(localStorage.getItem("titleAliases"));
if(titleAliases){
	aliasFlag = true;
	titleAliases.forEach(createAlias)
}

if(aliasFlag){
	moreStyle.textContent += `
a.title::before
,.quick-search-results .el-select-dropdown__item a > span::before{
	visibility: visible;
	line-height: 1.15;
	margin-right: 2px;
}
.medialist.table .title > a::before{
	visibility: visible;
	font-size: 1.5rem;
	margin-right: 2px;
}
.medialist.compact .title > a::before
,.medialist.cards .title > a::before
,.home .status > a.title::before
,.media-embed .title::before{
	visibility: visible;
	font-size: 1.3rem;
	margin-right: 2px;
}
.role-card a.content > .name::before{
	visibility: visible;
	font-size: 1.2rem;
}
.overlay > a.title::before
,.media-preview-card a.title::before{
	visibility: visible;
	font-size: 1.4rem;
	line-height: 1.15;
}
.role-card a.content > .name{
	line-height: 1.3!important;
}`
}
m4_include(css/CSSfavs.js)
if(useScripts.CSScompactBrowse){
	moreStyle.textContent += `
m4_include(css/compactBrowse.css)
	`
}
if(!useScripts.CSSverticalNav && useScripts.slimNav){
	moreStyle.textContent += `
#nav.nav{
	height: 40px;
}
	`
}
if(useScripts.annoyingAnimations){
	moreStyle.textContent += `
.media-card .open-editor.circle{
	transition: unset;
}
.media-card:hover .hover-data{
	animation: none!important;
}
.cover.loading::before{
	display: none!important;
}
.activity-entry .like-wrap .users{
	transition: none;
}
.search .results .media-card{
	animation: none;
}`
}
if(useScripts.CSSprofileClutter){
	moreStyle.textContent += `
.overview .list-stats > .footer{
	display: none;
}
.overview > .section > .desktop:nth-child(2){
	display: none;
}
.overview > .section > .desktop:nth-child(3){
	display: none;
}
.overview > .section > .desktop.favourites{
	display: inherit;
}
	`
}
if(useScripts.CSSbannerShadow){
	moreStyle.textContent += `
.banner .shadow{
	display: none;
}
.banner-content h1.name{
	filter: drop-shadow(0px 0px 6px black);
}
	`
}
if(useScripts.betterListPreview && !(window.screen.availWidth && window.screen.availWidth <= 1040)){
	moreStyle.textContent += `
.home{
	grid-template-columns: auto 545px!important;
}
@media(min-width: 1040px) and (max-width: 1540px){
	.page-content > .container{
		max-width: 1300px;
	}
	.list-preview{
		gap: 15px!important;
	}
	.home{
		grid-template-columns: auto 525px!important;
	}
}
#hohListPreview + .list-previews .list-preview-wrap{
	display: none;
}
#hohListPreview + .list-previews .list-preview-wrap:last-child{
	display: block;
}
	`
}
if(useScripts.CSSgreenManga){
	moreStyle.textContent += `
m4_include(css/greenManga.css)
	`
}
if(useScripts.CSSexpandFeedFilters && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
m4_include(css/expandFeedFilters.css)
	`
}
if(useScripts.showRecVotes){
	moreStyle.textContent += `
.recommendation-card .rating-wrap{
	opacity: 1;
}`
}
if(useScripts.CSSverticalNav && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
m4_include(css/verticalNav.css)
`;
	if(useScripts.rightToLeft || useScripts.rightSideNavbar){
		moreStyle.textContent += `
#app{
	padding-right: 65px;
	padding-left: 0px!important;
}
.page-content{
	padding-left: 5px;
}
#app div#nav.nav{
	left: inherit !important;
	right: 0px;
}
#app div#nav.nav .links{
	border-left: none;
	border-right: 1px solid hsla(0,0%,93.3%,.16);
}
.subMenuContainer{
	margin-left: -172px;
}
.subMenuContainer > .link{
	margin-left: 86px;
}
.hohSubMenu{
	left: 0px;
	width: 86px;
	border-top-left-radius: 3px;
	border-bottom-left-radius: 3px;
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
}
.hohColourPicker{
	right: 70px;
}
#app .nav .user-wrap .dropdown{
	left: unset;
	right: 0px;
}
#app .nav .user-wrap .dropdown::before{
	left: unset;
	right: 16px;
}
.nav .browse-wrap .dropdown{
	left: -200px;
}
.user .header-wrap{
	margin-left: -5px;
}`
	}
}
if(useScripts.CSSdecimalPoint){
	moreStyle.textContent += `
.medialist.POINT_10_DECIMAL .score[score="10"]::after,
.medialist.POINT_10_DECIMAL .score[score="9"]::after,
.medialist.POINT_10_DECIMAL .score[score="8"]::after,
.medialist.POINT_10_DECIMAL .score[score="7"]::after,
.medialist.POINT_10_DECIMAL .score[score="6"]::after,
.medialist.POINT_10_DECIMAL .score[score="5"]::after,
.medialist.POINT_10_DECIMAL .score[score="4"]::after,
.medialist.POINT_10_DECIMAL .score[score="3"]::after,
.medialist.POINT_10_DECIMAL .score[score="2"]::after,
.medialist.POINT_10_DECIMAL .score[score="1"]::after{
	margin-left: -4px;
	content: ".0";
}
	`
}
if(useScripts.CSSdarkDropdown){
	moreStyle.textContent += `
.site-theme-dark .quick-search.el-select .el-input.el-input__inner,
.site-theme-dark .quick-search .el-select .el-input.is-focus .el-input__inner,
.site-theme-dark .el-select-dropdown,
.site-theme-dark .el-dropdown-menu,
.site-theme-dark .el-dropdown-menu__item--divided::before{
	background: rgba(17, 22, 29);
}
.site-theme-dark .el-select-group__wrap:not(:last-of-type)::after{
	background: rgba(17, 22, 29);
}
.site-theme-dark .el-popper[x-placement^="bottom"] .popper__arrow,
.site-theme-dark .el-popper[x-placement^="bottom"] .popper__arrow::after{
	border-bottom-color: rgba(17, 22, 29);
	opacity: 1;
}
.site-theme-dark .el-popper[x-placement^="top"] .popper__arrow,
.site-theme-dark .el-popper[x-placement^="top"] .popper__arrow::after{
	border-top-color: rgba(17, 22, 29);
	opacity: 1;
}
	`
}
if(useScripts.CSSsmileyScore){
	moreStyle.textContent += `
.fa-frown{
	color: red;
}
.fa-smile{
	color: green;
}
.fa-meh{
	color: rgb(var(--color-orange));
}
	`
}
if(useScripts.limitProgress8){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+9){
	display:none!important;
}
	`
}
else if(useScripts.limitProgress10){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+11){
	display:none!important;
}
	`
}
if(parseInt(useScripts.forumPreviewNumber) === 0){
	moreStyle.textContent += `
.home .recent-threads{
	display: none!important;
}
	`
}
if(useScripts.CSSmobileExternalLinks){
	moreStyle.textContent += `
@media(max-width: 760px){
	.media .sidebar .external-links{
		display: block;
	}
}
	`
}
if(useScripts.SFWmode){
	moreStyle.textContent += `
m4_include(css/SFWmode.css)
	`;
	if(useScripts.CSSverticalNav){
		moreStyle.textContent += `
#nav .link[href*="/animelist"]{
	visibility: hidden;
}
#nav .link[href*="/animelist"]::after{
	content: "View List";
	visibility: visible;
	left: 0;
	right: 0;
	position: absolute;
	margin-left: auto;
	margin-right: auto;
}
#nav .link[href*="/animelist"]::before{
	visibility: visible;
}
#nav .link[href*="/mangalist"]{
	visibility: hidden;
}
#nav .link[href*="/mangalist"]::after{
	content: "Read List";
	visibility: visible;
	left: 0;
	right: 0;
	position: absolute;
	margin-left: auto;
	margin-right: auto;
}
#nav .link[href*="/mangalist"]::before{
	visibility: visible;
}`
	}
}
if(useScripts.cleanSocial){
	moreStyle.textContent += `
.social .activity-feed + div{
	display: flex;
	flex-direction: column;
}
.social .activity-feed + div > div:first-child{
	order: 2;
	margin-top: 25px;
}`
}
if(useScripts.statusBorder){
	moreStyle.textContent += `
.home .activity-text .wrap{
	border-right-width: 0px !important;
	margin-right: 0px !important;
}`
}
if(useScripts.rightToLeft){
	moreStyle.textContent += `
m4_include(css/rightToLeft.css)
	`
}
if(useScripts.partialLocalisationLanguage === "Português"){//https://github.com/hohMiyazawa/Automail/pull/123
	moreStyle.textContent += `
#app #nav.nav .wrap .links a.link{
	text-transform: none;
}`
}
};initCSS();

documentHead.appendChild(moreStyle);
let customStyle = create("style");
let currentUserCSS = "";
customStyle.id = "customCSS-automail-styles";
customStyle.type = "text/css";
documentHead.appendChild(customStyle);


let aliases = new Map();
shortRomaji.concat(
	JSON.parse(
		localStorage.getItem("titleAliases")
	) || []
).forEach(alias => {
	let matches = alias[0].match(/^\/(anime|manga)\/(\d+)\/$/);
	if(matches){
		aliases.set(parseInt(matches[2]),alias[1])
	}
});
//end "conditionalStyles.js"
