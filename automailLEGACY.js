// ==UserScript==
// @name         Automail
// @namespace    http://tampermonkey.net/
// @version      8.61
// @description  Extra parts for Anilist.co
// @author       hoh
// @match        https://anilist.co/*
// @grant        GM_xmlhttpRequest
// @license      GPLv3
// ==/UserScript==
(function(){
"use strict";
const scriptInfo = {
	"version" : "8.61",
	"name" : "Automail",
	"link" : "https://greasyfork.org/en/scripts/370473-automail",
	"author" : "hoh",
	"authorLink" : "https://anilist.co/user/hoh/",
	"license" : "GPLv3"
};
/*
	A collection of enhancements for Anilist.co
*/
/*
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	<https://www.gnu.org/licenses/>.
*/
/*
"useScripts" contains the defaults for the various modules. This is stored in the user's localStorage.
Many of the modules are closely tied to the Anilist API
Other than that, some data loaded from MyAnimelist is the only external resource

Optionally, a user may give the script privileges through the Anilist grant system, enabling some additional modules
*/

/* GENERAL STRUCTURE:
 1. CSS
 2. tools and helper functions
 3. The modules, as individual callable functions
 4. The URL matcher, for making the modules run at the right sites
 5. Module descriptions
*/

//a shared style node for all the modules. Most custom classes are prefixed by "hoh" to avoid collisions with native Anilist classes
let style = document.createElement("style");
style.id = "aniscripts-styles";
style.type = "text/css";

//The default colour is rgb(var(--color-blue)) provided by Anilist, but rgb(var(--color-green)) is preferred for things related to manga
style.textContent = `
body{
	margin: 0px;
}
#hohSettings{
	margin-top: 20px;
	display: none;
}
.apps + #hohSettings{
	display: inline;
}
#hohSettings textarea,
#hohSettings input,
#hohSettings select{
	color: inherit;
	background-color: rgb(var(--color-foreground-grey));
	border-width: 1px;
	padding: 3px;
	border-radius: 3px;
}
.hohTime{
	position: absolute;
	right: 12px;
	top: 6px;
	font-size: 1.1rem;
}
.hohUnread{
	border-right: 8px;
	border-color: rgba(var(--color-blue));
	border-right-style: solid;
}
.hohNotification{
	margin-bottom: 10px;
	background: rgb(var(--color-foreground));
	border-radius: 4px;
	justify-content: space-between;
	line-height: 0;
	min-height: 72px;
	position: relative;
}
.hohNotification *{
	line-height: 1.15;
}
.hohUserImageSmall{
	display: inline-block;
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	position: absolute;
	z-index: 10;
}
.hohUserImage{
	height: 72px;
	width: 72px;
	display: inline-block;
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	position: absolute;
}
.hohMediaImage{
	height: 70px;
	margin-right: 5px;
}
.hohMessageText{
	position: absolute;
	margin-top: 30px;
	margin-left: 80px;
}
.hohMediaImageContainer{
	vertical-align: bottom;
	margin-left: 400px;
	display: inline;
	position: relative;
	display: inline-block;
	min-height: 70px;
	width: calc(100% - 500px);
	text-align: right;
	padding-bottom: 1px;
}
.hohMediaImageContainer > a{
	height: 70px;
	line-height: 0!important;
	display: inline-block;
	z-index: 11;
}
span.hohMediaImageContainer{
	line-height: 0!important;
}
.hohCommentsContainer{
	margin-top: 5px;
}
.hohCommentsArea{
	margin: 10px;
	display: none;
	padding-bottom: 2px;
	margin-top: 5px;
	width: 95%;
}
.hohCommentsContainer > a.link{
	font-size: 1.3rem;
}
.hohComments{
	float: right;
	display: none;
	margin-top: -21px;
	margin-right: 10px;
	cursor: pointer;
	margin-left: 600px;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
.hohCombined .hohComments{
	display: none!important;
}
.hohQuickCom{
	padding: 5px;
	background-color: rgb(var(--color-background));
	margin-bottom: 5px;
	position: relative;
}
.hohQuickComName{
	margin-right: 15px;
	color: rgb(var(--color-blue));
}
.hohThisIsMe{
	color: rgb(var(--color-green));
}
.hohILikeThis{
	color: rgb(var(--color-red));
}
.hohQuickComName::after{
	content: ":";
}
.hohQuickComContent{
	margin-right: 40px;
	display: block;
}
.hohQuickComContent > p{
	margin: 1px;
}
.hohQuickComLikes{
	position: absolute;
	right: 5px;
	bottom: 5px;
	display: inline-block;
}
.hohQuickComContent img {
	max-width: 100%;
}
.hohSpoiler::before{
	color: rgb(var(--color-blue));
	cursor: pointer;
	background: rgb(var(--color-background));
	border-radius: 3px;
	content: "Spoiler, click to view";
	font-size: 1.3rem;
	padding: 0 5px;
}
.hohSpoiler.hohClicked::before{
	display: none;
}
.hohSpoiler > span{
	display: none;
}
.hohMessageText > span > div.time{
	display: none;
}
.hohUnhandledSpecial > div{
	margin-top: -15px;
}
.hohMonospace{
	font-family: monospace;
}
.hohForumHider{
	margin-right: 3px;
	cursor: pointer;
	font-family: monospace;
}
.hohForumHider:hover{
	color: rgb(var(--color-blue));
}
.hohBackgroundCover{
	height: 70px;
	width: 50px;
	display: inline-block;
	background-repeat: no-repeat;
	background-size: cover;
	margin-top: 1px;
	line-height: 0;
	margin-bottom: 1px;
}
#hohDescription{
	width: 280px;
	height: 150px;
	float: left;
	color: rgb(var(--color-blue));
}
.hohStatsTrigger{
	cursor: pointer;
	border-radius: 3px;
	color: rgb(var(--color-text-lighter));
	display: block;
	font-size: 1.4rem;
	margin-bottom: 8px;
	margin-left: -10px;
	padding: 5px 10px;
	font-weight: 700;
}
.hohActive{
	background: rgba(var(--color-foreground),.8);
	color: rgb(var(--color-text));
	font-weight: 500;
}
#hohFavCount{
	position: absolute;
	right: 30px;
	color: rgba(var(--color-red));
	top: 10px;
	font-weight: 400;
}
.hohShamelessLink{
	display: block;
	margin-bottom: 5px;
}
.hohSlidePlayer{
	display: block;
	position: relative;
	width: 500px;
}
.hohSlide{
	position: absolute;
	top: 0px;
	font-size: 500%;
	height: 100%;
	display: flex;
	align-items: center;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	opacity:0.5;
}
.hohSlide:hover{
	background-color: rgb(0,0,0,0.4);
	cursor: pointer;
	opacity:1;
}
.hohRightSlide{
	right: 0px;
	padding-left: 10px;
	padding-right: 20px;
}
.hohLeftSlide{
	left: 0px;
	padding-left: 20px;
	padding-right: 10px;
}
.hohShare{
	position: absolute;
	right: 12px;
	top: 30px;
	cursor: pointer;
	color: rgb(var(--color-blue-dim));
}
.activity-entry{
	position: relative;
}
.activity-entry.activity-text{
	border-right-width: 0px!important;
}
.hohEmbed{
	border-style: solid;
	border-color: rgb(var(--color-text));
	border-width: 1px;
	padding: 15px;
	position: relative;
}
.hohEmbed .avatar{
	border-radius: 3px;
	height: 40px;
	width: 40px;
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	display: inline-block;
}
.hohEmbed .name{
	display: inline-block;
	height: 40px;
	line-height: 40px;
	vertical-align: top;
	color: rgb(var(--color-blue));
	font-size: 1.4rem;
	margin-left: 12px !important;
}
.hohEmbed .time{
	color: rgb(var(--color-text-lighter));
	font-size: 1.1rem;
	position: absolute;
	right: 12px;
	top: 12px;
}
#hoh-character-roles .view-media-character{
	grid-template-areas: "media character";
}
#hoh-character-roles .view-media-character .media{
	grid-area: media;
}
.hohRecsLabel{
	color: rgb(var(--color-blue)) !important;
}
.hohRecsItem{
	margin-top: 5px;
	margin-bottom: 10px;
}
.hohTaglessLinkException{
	display: block;
}
.hohTaglessLinkException::after{
	content: ""!important;
}
.hohStatValue{
	color: rgb(var(--color-blue));
}
.user-page-unscoped .markdown-editor{
	width: 100%;
}
.markdown-editor > [title="Image"],
.markdown-editor > [title="Youtube Video"],
.markdown-editor > [title="WebM Video"]{
	color: rgba(var(--color-red));
}
.hohBackgroundUserCover{
	height: 50px;
	width: 50px;
	display: inline-block;
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	margin-top: 11px;
	margin-bottom: 1px;
}
.hohRegularTag{
	border-style: solid;
	border-width: 1px;
	border-radius: 3px;
	padding: 2px;
	margin-right: 3px;
}
.hohTableHider{
	cursor: pointer;
	margin: 4px;
	color: rgb(var(--color-blue));
}
.hohCross{
	cursor: pointer;
	margin-left: 2px;
	color: red;
}
.hohFavCountBrowse{
	color: white;
	position: absolute;
	right: 2px;
	font-size: 60%;
	opacity: 0.7;
}
.hohColourPicker{
	position: absolute;
	right: 60px;
	margin-top: 0px;
}
.hohColourPicker h2{
	color: #3db4f2;
	font-size: 1.6rem;
	font-weight: 400;
	padding-bottom: 12px;
}
.hohSecondaryRow{
	background-color: rgb(var(--color-background));
}
.hohSecondaryRow:hover{
	background-color: rgb(var(--color-foreground));
}
.hohSecondaryRow svg.repeat{
	margin-left: 15px;
}
.media-preview-card meter{
	width: 150px;
	margin-bottom: 5px;
}
.sidebar .tags .tag{
	min-height: 35px;
	margin-bottom: 5px !important;

}
.custom-lists .el-checkbox__label{
	display: inline !important;
	white-space: pre-wrap;
	white-space: -webkit-pre-wrap;
	white-space: normal;
	word-wrap: anywhere;
	word-break: break-word;
}
.hohStatusDot{
	position: absolute;
	width: 10px;
	height: 10px;
	border-radius: 50px;
}
.hohStatusDotRight{
	top: 2px;
	right: 2px;
}
.relations.hohRelationStatusDots .hohStatusDot{
	position: relative;
	transform: translate(-5px,-5px);
}
.relations.hohRelationStatusDots > div.grid-wrap{
	padding-top: 5px;
}
.relations.hohRelationStatusDots > h2{
	margin-bottom: 5px;
}
.recommendation-card .cover{
	overflow: visible;
}
.recommendation-card .hohStatusDot{
	transform: translate(-5px,-5px);
}
.studio .container.header{
	position: relative;
}
.studio .favourite{
	position: absolute;
	top: 10px;
	right: 30px;
}
.filter .view-all{
	background-color: rgb(var(--color-foreground));
	height: 32px;
	border-radius: 3px;
	text-align: center;
	padding-top: 8px;
}
.title > a{
	line-height: 1.15!important;
}
.embed .title{
	line-height: 18px!important;
}
#dubNotice{
	font-size: 12px;
	font-weight: 500;
	text-align: center;
	text-transform: capitalize;
	background: rgb(var(--color-foreground));
	margin-top: 0em;
	margin-bottom: 16px;
	border-radius: 3px;
	padding: 8px 12px;
}
#hohDraw3x3{
	margin-top: 5px;
	cursor: pointer;
}
.home .feed-type-toggle{
	min-width: 148px;
}
.hohDisplayBox{
	position: fixed;
	top: 80px;
	left: 200px;
	z-index: 999;
	padding: 20px;
	background-color: rgb(var(--color-foreground));
	border: solid 1px;
	border-radius: 4px;
	box-shadow: black 2px 2px 20px;
	overflow: hidden;
}
.hohDisplayBox .scrollableContent{
	overflow: auto;
	height: 100%;
	scrollbar-width: thin;
}
.hohDisplayBoxClose{
	position: absolute;
	right: 15px;
	top: 15px;
	cursor: pointer;
	background-color: red;
	border: solid;
	border-width: 1px;
	border-radius: 2px;
	color: white;
	border-color: rgb(var(--color-text));
	filter: drop-shadow(0 0 0.2rem crimson);
}
.hohDisplayBoxClose:hover{
	filter: drop-shadow(0 0 0.75rem crimson);
}
.hohFeedFilter{
	position: absolute;
	top: 2px;
	font-size: 1.4rem;
	font-weight: 500;
}
.hohFeedFilter input{
	width: 45px;
	background: none;
	border: none;
	margin-left: 6px;
	color: rgb(var(--color-text));
}
.hohFeedFilter input::-webkit-outer-spin-button, 
.hohFeedFilter input::-webkit-inner-spin-button{
	opacity: 1;
}
[list="staffRoles"]::-webkit-calendar-picker-indicator{
	display: none;
}
[list="staffRoles"]{
	background: rgb(var(--color-foreground));
	background: rgb(var(--color-foreground));
	padding: 5px;
	border-width: 0px;
	border-radius: 2px;
	margin-left: 20px;
}
.hohFeedFilter button{
	color: rgb(var(--color-text));
	cursor: pointer;
	background: none;
	border: none;
	margin-left: 10px;
}
.hohFeedFilter button:hover{
	color: rgb(var(--color-blue));
}
.actions .list .add{
	-webkit-touch-callout: none;
	-webkit-user-select: none;
	-khtml-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
.text div.markdown{
	scrollbar-width: thin;
}
.user .about > div.content-wrap{
	scrollbar-width: thin;
}
.list-wrap .section-name,
.quick-search input[placeholder="Search AniList"]{
	text-transform: none;
}
.list-wrap{
	counter-reset: animeCounter;
}
.results.studios{
	counter-reset: studioCounter;
}
.results.studios .studio > .name::before{
	counter-increment: studioCounter;
	content: counter(studioCounter);
	opacity: 0.2;
	font-size: 70%;
	margin-left: -12px;
	margin-right: 3px;
}
.medialist.table.compact .entry .title::before{
	counter-increment: animeCounter;
	content: counter(animeCounter);
	display: inline-block;
	margin-right: 4px;
	margin-left: -17px;
	opacity: 0.2;
	text-align: right;
	width: 25px;
	min-width: 25px;
	font-size: 70%;
}
.hohEnumerateStaff{
	position: absolute;
	margin-left: -12px;
	margin-top: 10px;
}
#hohMALscore .type,
#hohMALserialization .type{
	font-size: 1.3rem;
	font-weight: 500;
	padding-bottom: 5px;
	display: inline-block;
}
#app .tooltip{
	z-index: 9923;
}
#hohMALscore .value,
#hohMALserialization .value{
	color: rgb(var(--color-text-lighter));
	font-size: 1.2rem;
	line-height: 1.3;
	display: block;
}
.hohMediaScore{
	color: rgb(var(--color-text-lighter));
	font-size: 1.2rem;
	position: absolute;
	top: -10px;
	padding-left: 10px;
	padding-right: 10px;
	margin-left: -10px;
}
.forum-thread .like .button{
	margin-right: 0px!important;
}
.forum-thread .actions{
	user-select: none;
}
#hohFilters{
	margin-top: 5px;
	margin-bottom: 5px;
}
#hohFilters input{
	width: 55px;
	margin: 5px;
}
.hohCompare{
	margin-top: 10px;
	counter-reset: animeCounterComp;
	position: relative;
}
.hohCompare .hohUserRow,
.hohCompare .hohHeaderRow{
	background: rgb(var(--color-foreground));
}
.hohCompare table,
.hohCompare th,
.hohCompare td{
	border-top-width: 0px;
	border-bottom-width: 1px;
	border-right-width: 1px;
	border-left-width: 0px;
	border-style: solid;
	border-color: black;
	padding: 5px;
}
.hohCompare table{
	background: rgb(var(--color-foreground-grey));
	border-spacing: 0px;
	margin-top: 10px;
	border-right: none;
	border-bottom: none;
}
#app{
	overflow: unset;
}
#graphiql{
	--color-blue: 61,180,242;
}
.list-stats{
	margin-bottom: 0px!important;
}
.activity-feed-wrap,
.activity-feed-wrap + div{
	margin-top: 25px;
}
.page-content > .container,
.notifications-feed,
.page-content > .studio{
	margin-top: 67px !important;
}
.hohUserRow td,
.hohUserRow th{
	min-width: 120px;
	border-top-width: 1px;
	position: sticky;
	top: 3px;
	z-index: 1000;
	background: rgb(var(--color-foreground));
}
.hohHeaderRow td,
.hohHeaderRow th{
	border-top: none;
}
.hohUserRow input{
	width: 100px;
}
.hohUserRow img{
	width: 30px;
	height: 30px;
	border-radius: 2px;
}
tr.hohAnimeTable:nth-child(2n+1){
	background-color: rgb(var(--color-foreground));
}
.hohAnimeTable,
.hohAnimeTable td{
	position: relative;
}
.hohAnimeTable .hohStatusDot{
	top: calc(50% - 5px);
	right: 5px;
}
.hohHeaderRow .hohStatusDot{
	background: rgb(var(--color-background));
	top: calc(50% - 5px);
	right: 5px;
	cursor: pointer;
}
.hohStatusProgress{
	position: absolute;
	left: 60px;
	top: calc(50% - 5px);
	font-size: 60%;
}
.hohAnimeTable > td:nth-child(1)::before{
	counter-increment: animeCounterComp;
	content: counter(animeCounterComp) ". ";
	position: absolute;
	left: 1px;
	text-align: right;
	width: 40px;
	color: rgb(var(--color-blue));
}
.hohAnimeTable > td:nth-child(1){
	padding-left: 43px;
	border-left-width: 1px;
}
.hohUserRow > td:nth-child(1),
.hohHeaderRow > th:nth-child(1){
	border-left: solid;
	border-left-width: 1px;
	border-color: black;
}
.hohArrowSort{
	font-size: 3rem;
	cursor: pointer;
	margin-left: 4px;
	margin-right: 4px;
}
.hohFilterSort{
	cursor: pointer;
	border-width: 1px;
	border-style: solid;
	padding: 2px;
	borderRadius: 4px;
}
.hohArrowSort:hover,
.hohFilterSort:hover{
	color: rgb(var(--color-blue));
}
.hohAnimeTableRemove{
	cursor: pointer;
	position: absolute;
	top: 0px;
	right: 0px;
}
.hohCheckbox.el-checkbox__input > span.el-checkbox__inner{
	background-color: rgb(var(--color-foreground));
	margin-right:10px;
	border-color: rgba(var(--color-text),.2);
}
.hohCheckbox input:checked + .el-checkbox__inner{
	background-color: #409eff;
	border-color: #409eff;
}
.hohCheckbox input:checked + .el-checkbox__inner::after{
	transform: rotate(45deg) scaleY(1);
}
.hohCheckbox input{
	display: none;
}
.hohCheckbox{
	margin-left: 2px;
}
.hohCheckbox .el-checkbox__inner::after {
	box-sizing: content-box;
	content: "";
	border: 1px solid #fff;
	border-left: 0;
	border-top: 0;
	height: 7px;
	left: 4px;
	position: absolute;
	top: 1px;
	transform: rotate(45deg) scaleY(0);
	width: 3px;
	transition: transform .15s ease-in .05s;
	transform-origin: center;
}
.hohCheckbox .el-checkbox__inner {
	display: inline-block;
	position: relative;
	border: 1px solid #dcdfe6;
	border-radius: 2px;
	box-sizing: border-box;
	width: 14px;
	height: 14px;
	z-index: 1;
	transition: border-color .25s cubic-bezier(.71,-.46,.29,1.46),background-color .25s cubic-bezier(.71,-.46,.29,1.46);
}
.hohCheckbox.el-checkbox__input{
	white-space: nowrap;
	cursor: pointer;
	outline: none;
	display: inline-block;
	line-height: 1;
	position: relative;
	vertical-align: middle;
}
.media-card .list-status[status="Repeating"]{
	background: violet;
}
.external-link[href="https://mangaplus.shueisha.co.jp/titles/100030"]::after{
	content: "(rerun)";
}
.external-link[href="https://mangaplus.shueisha.co.jp/titles/100020"]::after{
	content: "(latest)";
}
.sense-wrap{
	display: none;
}
.hohDismiss{
	cursor: pointer;
	transform: translate(20px,-11px);
	width: 10px;
	height: 5px;
	margin-left: -10px;
}
.substitution .media-roles:not(.substitution){
	display: none;
}
.substitution .character-roles{
	max-width: 1520px;
}
.hohButton{
	align-items: center;
	background: #3db4f2;
	border-radius: 4px;
	color: rgb(var(--color-text-bright));
	cursor: pointer;
	display: inline-flex;
	font-size: 1.3rem;
	margin-right: 10px;
	margin-top: 15px;
	padding: 10px 15px;
	transition: .2s;
	border-width: 0px;
}
.user-social .title::before{
	font-size: 1.6rem;
}
textarea{
	background: rgb(var(--color-foreground));
}
select{
	background: rgb(var(--color-foreground));
	padding: 5px;
	border-radius: 4px;
	border-width: 0px;
	margin: 4px;
	color: rgb(var(--color-text));
}
.hohPostLink{
	position: absolute;
	top: 50px;
}
.hohRec{
	position: relative;
	background: rgb(var(--color-foreground));
	padding: 10px;
	border-radius: 3px;
	margin-bottom: 15px;
}
.hohBlock{
	padding: 4px;
	border-width: 1px;
	border-style: solid;
	border-radius: 5px;
	margin: 2px;
}
.hohBlockSpec{
	padding-right: 15px;
}
.hohBlockCross{
	padding: 5px;
	color: red;
	cursor: pointer;
}
.medialist .filters .filter-group:first-child > span{
	position: relative;
}
.medialist .filters .filter-group:first-child > span .count{
	position: absolute;
	right: 0px;
}
.categories .category{
	text-transform: none;
	white-space: nowrap;
}
.media-preview-card.hohFallback{
	position: relative;
}
.media-preview-card .hohFallback{
	position: absolute;
	top: 5px;
	left: 5px;
	word-break: break-word;
	overflow-y: hidden;
	max-height: 110px;
	max-width: 75px;
}
.media-preview-card .cover{
	z-index: 3;
}
.hohChangeScore{
	font-family: monospace;
	cursor: pointer;
	display: none;
}
.score[score="0"] .hohChangeScore,
.medialist .score[score="0"]{
	pointer-events: none;
}
.score[score="0"] .hohChangeScore{
	display: none!important;
}
.row:hover .hohChangeScore,
.hohMediaScore:hover .hohChangeScore{
	display: inline;
}
.activity-text .name[href="/user/Dunkan85/"]::after{
	background-image: url(https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg);
	background-size: 12px;
	display: inline-block;
	width: 12px;
	height: 12px;
	content: "";
	margin-left: 5px;
}
.hohSumableStatusContainer{
	float: right;
}
.hohSumableStatus{
	width: 16px;
	height: 16px;
	text-align: center;
	vertical-align: middle;
	border-radius: 16px;
	line-height: 16px;
	color: black;
	font-size: 10px;
	display: inline-block;
	margin-left: 2px;
}
.relations.small > div{
	margin-left: 5px;
}
.hohMyThreads{
	color: rgb(var(--color-text-lighter));
	padding: 5px 10px;
	font-size: 1.4rem;
	display: inline-block;
	padding-bottom: 20px;
}
.hohImport .el-checkbox__label{
	padding-left: 0px;
}
.hohImportEntry{
	width: 30%;
	display: inline-block;
	background-color: rgb(var(--color-foreground));
	padding: 5px;
	margin: 5px;
	border-radius: 2px;
}
.hohImportArrow{
	font-size: 40px;
}
.hohImportRow{
	margin: 10px;
}
.results.characters + .hohThemeSwitch,
.results.staff + .hohThemeSwitch{
	display: none;
}
.hohThemeSwitch{
	align-items: center;
	background: rgb(var(--color-foreground));
	border-radius: 4px;
	display: flex;
	justify-content: space-between;
	padding: 10px 13px;
	width: 100px;
}
.hohThemeSwitch .active{
	color: rgb(var(--color-blue));
}
.hohThemeSwitch > span{
	cursor: pointer;
}
.user-social.listView .user-follow .wrap{
	display: block!important;
}
.user-social.listView .user-follow .user{
	height: 50px;
	width: 50px;
	margin: 5px;
	overflow: visible;
	border-top-right-radius: 0px;
	border-bottom-right-radius: 0px;
}
.user-social.listView .user-follow .follow-card .name{
	width: 250px;
	margin-left: 80px !important;
	opacity: 1;
}
.user-social.listView .user-follow .follow-card{
	margin: 2px;
}
.user-social.listView .user-follow .follow-card div.avatar{
	overflow: visible!important;
}
.user-social.listView .thread-card .body-preview,
.user-social.listView .thread-card .footer{
	display: none;
}
.user-social.listView .thread-card .title{
	margin-bottom: 0px;
}
.user-social.listView .thread-card{
	margin-bottom: 10px;
}
.user-social.listView .user-comments .header{
	display: none;
}
.user-social.listView .comment-wrap{
	margin-bottom: 5px;
}
.hohDownload{
	position: absolute;
	right: 10px;
	top: 305px;
	font-weight: bolder;
	font-size: 120%;
}
.media .hohDownload{
	top: 375px;
}
meter::-webkit-meter-optimum-value{
	background: rgb(var(--color-blue));
}
meter::-moz-meter-bar{
	background: rgb(var(--color-blue));
}
.input-wrap.manga input[placeholder="Status"],
.input-wrap.anime input[placeholder="Status"],
.input-wrap.anime .form.score input{
	width: 220px;
}
.substitution .role-card{
	background: rgb(var(--color-foreground));
	border-radius: 3px;
	display: inline-grid;
	grid-template-columns: 50% 50%;
	height: 80px;
	overflow: hidden;
}
.substitution .media-roles .role-card{
	grid-template-columns: 100%;
}
.substitution .role-card > div{
	display: inline-grid;
	grid-template-columns: 60px auto;
	grid-template-areas: "image content";
}
.substitution .cover{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	grid-area: image;
}
.substitution .grid-wrap .content{
	font-size: 1.2rem;
	grid-area: content;
	overflow: hidden;
	padding: 10px;
}
.substitution .grid-wrap .content .name{
	display: block;
	height: 48px;
	line-height: 1.3;
}
.substitution .grid-wrap{
	display: grid;
	grid-column-gap: 30px;
	grid-row-gap: 15px;
	grid-template-columns: repeat(2,1fr);
}
.substitution .role{
	color: rgb(var(--color-text-lighter));
	font-size: 1.1rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
}
.user-follow .follow-card{
	background-color: rgb(var(--color-foreground));
}
.recent-recommendations .switch .option{
	white-space: nowrap;
}
.media-staff .role-card .role:hover{
	overflow-x: auto;
	scrollbar-width: none;
}
.media-staff .role-card .role:hover::-webkit-scrollbar{
	width: 0;
	height: 0;
}
@media(max-width: 1540px){
	.substitution .character-roles{
		max-width: 1200px;
	}
}
@media(max-width: 1040px){
	.input-wrap.manga input[placeholder="Status"],
	.input-wrap.anime input[placeholder="Status"],
	.input-wrap.anime .form.score input{
		width: 100%;
	}
	.substitution .grid-wrap{
		grid-template-columns: 1fr;
	}
	.home .list-preview .media-preview-card:nth-child(5n+3) .content{
		text-align: left;
		right: unset;
	}
}
@media(max-width: 760px){
	#hohMALscore{
		padding-right: 25px;
	}
	#hohMALscore .type{
		font-weight: 400;
	}
	#hohMALscore .value{
		color: rgb(var(--color-text));
		font-size: 1.4rem;
	}
	.hohMediaImageContainer{
		position: absolute;
		right: -22px;
		max-height: 30px;
		width: 25px;
		overflow: scroll;
	}
	.hohUserImageSmall{
		display: none;
	}
	.hohMessageText{
		margin-top: 30px!important;
	}
	.hohBackgroundUserCover{
		margin-top: 1px;
	}
	.hohMediaImageContainer > a{
		height: 20px;
	}
	.hohMediaImage{
		height: 20px;
		width: 20px;
		margin-right: 0px
	}
	.hohNotification{
		margin-right: 23px;
		font-size: 1.5rem;
	}
	.hohCommentsContainer{
		position: relative;
		top: 70px;
	}
	.hohComments{
		position: absolute;
		right: -5px;
		top: 5px;
	}
	.notifications-feed .filters p{
		display: inline;
		margin-left: 10px;
	}
	.activity-feed .actions,
	.activity-feed .actions .action .count{
		font-size: 1.6rem;
	}
	.hohDownload{
		top: 50px;
	}
	.media .hohDownload{
		top: 5px;
	}
	#dubNotice{
		margin: 0px;
	}
	.hohFeedFilter .hohDescription{
		display: none;
	}
	.forum-feed .create-btn + .filter-group > a{
		display: inline-block;
		width: 19%;
		padding-top: 40px;
		padding-bottom: 40px;
		text-align: center;
		border-style: solid;
		border-width: 1px;
		border-color: rgb(var(--color-foreground));
	}
	.hohExtraFilters{
		max-height: 250px;
		overflow: auto;
	}
	.recommendations-wrap .actions .thumbs-down{
		margin-right: 10px;
	}
	.relations.hohRelationStatusDots .hohStatusDot,
	.recommendation-card .hohStatusDot{
		position: relative;
		transform: none;
	}
}
@media(max-width: 500px){
	.footer [href="https://anilist.co"],
	.footer [href="/sitemap/index.xml"]{
		display: none;
	}
	.footer .links{
		margin-left: -20px;
	}
	.markdown-editor{
		padding: 12px 2px!important;
	}
	.hohColourPicker{
		display: none;
	}
}
.tagIndex p{
	cursor: pointer;
}
.tagIndex p:hover{
	cursor: pointer;
	color: rgb(var(--color-blue));
}
.tagIndex .count{
	font-size: small;
	float: right;
	opacity: 0.5;
}
.hohTable .row{
	display: grid;
	grid-template-columns: 40% repeat(auto-fill, 120px);
	padding: 5px;
	cursor: pointer;
}
.hohTable .row.good{
	grid-template-columns: 40% repeat(auto-fill, 150px);
}
.hohTable .row > div{
	grid-row: 1;
}
.hohTable{
	padding: 20px;
	background: rgb(var(--color-foreground));
}
.hohTable .count{
	display: inline-block;
	min-width: 20px;
	font-size: 70%;
}
.hohTable .hohSumableStatusContainer{
	margin-right: 8px;
}
.hohTable .header.row{
	background: rgb(var(--color-background));
}
#regularAnimeTable,
#regularMangaTable,
#animeStaff,
#animeStudios,
#mangaStaff{
	display: none!important;
}
.user[type="anime"][page="tags"]:not(.hohSpecialPage) #regularAnimeTable,
.user[type="manga"][page="tags"]:not(.hohSpecialPage) #regularMangaTable,
.user[type="anime"][page="staff"]:not(.hohSpecialPage) #animeStaff,
.user[type="anime"][page="studios"]:not(.hohSpecialPage) #animeStudios,
.user[type="manga"][page="staff"]:not(.hohSpecialPage) #mangaStaff{
	display: block!important;
}
.user[type="anime"][page="tags"] .increase-stats::after,
.user[type="manga"][page="tags"] .increase-stats::after,
.user[type="anime"][page="staff"] .increase-stats::after,
.user[type="anime"][page="studios"] .increase-stats::after,
.user[type="manga"][page="staff"] .increase-stats::after{
	content: "Or view the full list below:";
	display: block;
}
.user .hohMilestones .milestones .milestone:nth-child(2)::after{
	display: none;
}
.hohCategories{
	margin-bottom: 20px;
	padding-right: 15px;
	padding-left: 0px;
}
.hohCategory{
	display: inline-block;
	padding: 5px;
	margin: 3px;
	border-style: solid;
	border-radius: 5px;
	color: rgb(var(--color-text));
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	font-size: 1.2rem;
}
.hohCategory.active{
	background: rgb(var(--color-blue));
	color: rgb(var(--color-text-bright));
}
#hohSettings .hohSetting{
	display: none;
}
#hohSettings.all .hohSetting,
#hohSettings.Notifications .hohSetting.Notifications,
#hohSettings.Feeds .hohSetting.Feeds,
#hohSettings.Forum .hohSetting.Forum,
#hohSettings.Lists .hohSetting.Lists,
#hohSettings.Profiles .hohSetting.Profiles,
#hohSettings.Stats .hohSetting.Stats,
#hohSettings.Media .hohSetting.Media,
#hohSettings.Navigation .hohSetting.Navigation,
#hohSettings.Browse .hohSetting.Browse,
#hohSettings.Script .hohSetting.Script,
#hohSettings.Login .hohSetting.Login{
	display: block;
}
.noLogin .hohSetting.Login{
	opacity: 0.4;
}
.medialist.cards .entry-card .progress{
	width: 60%;
}
#titleAliasInput{
	max-width: 100%;
}
.hohAdvancedDollar{
	font-weight: bold;
	margin-left: 9px;
}
.social input[list="socialUsers"]{
	background: rgb(var(--color-foreground));
	border-width: 0px;
	padding: 5px;
	margin-right: 5px;
}
.termsFeed{
	--color-blue: 61,180,242;
	--color-green: 123,213,85;
	--color-red: 232,93,117;
}
.hohFeed{
	margin-top: 10px;
	margin-bottom: 20px;
}
.hohFeed video{
	max-width: 100%;
}
.hohFeed .activity,
.hohFeed .activity .reply{
	min-height: 25px;
	position: relative;
	border-style: solid;
	border-width: 1px;
	border-bottom-width: 0px;
}
.hohFeed .activity .replies{
	margin-left: 60px;
	margin-top: 5px;
}
.hohFeed .activity:last-child{
	border-bottom-width: 1px;
}
.hohFeed a{
	text-decoration: none;
	color: rgb(var(--color-blue));
}
.hohFeed .hohButton{
	font-size: 1rem;
	color: initial;
	margin: 5px;
	filter: drop-shadow(2px 2px 3px black);
}
.hohFeed img{
	max-width: 500px;
}
.hohFeed .markdown_spoiler{
	background: rgb(31, 35, 45);
	color: rgb(31, 35, 45);
}
.hohFeed .markdown_spoiler:hover{
	color: rgb(159,173,189);
}
.hohFeed .markdown_spoiler img{
	filter: blur(10px) hue-rotate(60deg) brightness(0.7);
}
.hohFeed .markdown_spoiler:hover img{
	filter: none;
}
.hohFeed .markdown_spoiler::after{
	content: "Spoiler";
	color: rgb(159,173,189);
	margin-left: 2px;
}
.hohZoom{
	transform: scale(1.5);
	transform-origin: 0 0;
	transition: transform 0.4s;
	z-index: 200;
	box-shadow: 5px 5px 5px black;
}
.hohZoom .reply-wrap{
	background: rgb(var(--color-background));
}
.hohTable.hohNoPointer .row,
.hohNoPointer{
	cursor: unset;
}
.hohNewChapter{
	position: relative;
}
.hohNewChapter .hohDisplayBoxClose{
	display: none;
	top: 0px;
}
.hohNewChapter:hover .hohDisplayBoxClose{
	display: inline;
}
.hohFeed .activity:hover::before{
	content: ">";
	position: absolute;
	left: -20px;
	top: 0px;
}
.hohFeed .hohLikes:hover{
	color: rgb(var(--color-red));
	filter: saturate(50%);
}
.hohLikeQuickView{
	position: absolute;
	bottom: 0px;
	left: 45px;
	font-size: 70%;
	white-space: nowrap;
	overflow: hidden;
	max-width: 270px;
}
.hohFeed .hohLikes:hover .hohLikeQuickView{
	filter: saturate(200%);
}
.hohFeed .hohLikes:hover .hohLikeQuickView{
	color:rgb(159,173,189);
}
.hohFeed .activity:hover > .time{
	color: rgb(var(--color-blue));
}
.hohSocialFeed{
	position: relative;
}
.hohReplaceFeed > *:not(.hohSocialFeed){
	display: none;
}
.hohSocialFeed .wrap{
	background: rgb(var(--color-foreground));
	border-radius: 4px;
	font-size: 1.3rem;
	overflow: hidden;
	position: relative;
	min-height: 55px !important;
}
.hohSocialFeed .cover{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
}
.hohSocialFeed .avatar{
	display: block;
	border-radius: 3px;
	height: 36px;
	margin-top: 9px;
	width: 36px;
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
}
.hohSocialFeed .activity-entry{
	margin-bottom: 10px
}
.hohSocialFeed .details{
	min-width: 500px;
	padding: 10px 16px !important;
}
.hohSocialFeed .reply .avatar{
	height: 25px;
	width: 25px;
}
.hohSocialFeed .activity-entry > .wrap > .actions{
	bottom: 12px;
	color: rgb(var(--color-blue-dim));
	position: absolute;
	right: 12px;
}
.hohSocialFeed .activity-entry > .wrap .action{
	cursor: pointer;
	display: inline-block;
	padding-left: 5px;
	transition: .2s;
}
.hohSocialFeed .activity-entry > .wrap > .time{
	color: rgb(var(--color-text-lighter));
	font-size: 1.1rem;
	position: absolute;
	right: 12px;
	top: 12px;
}
.hohSocialFeed .reply{
	background: rgb(var(--color-foreground));
	border-radius: 3px;
	font-size: 1.3rem;
	margin-bottom: 15px;
	padding: 14px;
	padding-bottom: 4px;
	position: relative;
}
.hohSocialFeed .reply .actions{
	color: rgb(var(--color-blue-dim));
	position: absolute;
	right: 12px;
	top: 12px;
}
.hohSocialFeed .activity-entry > .wrap > .time .action{
	cursor: pointer;
	opacity: 0;
	padding-right: 10px;
	transition: .2s;
}
.hohSocialFeed .activity-entry > .wrap > .time:hover .action{
	opacity: 1;
}
.hohSocialFeed .liked{
	color: rgb(var(--color-red));
}
.hohSocialFeed .name,
.hohSocialFeed .title{
	color: rgb(var(--color-blue));
}
.hohMilestones .stat .value{
	color: rgb(var(--color-blue));
	font-size: 1.4rem;
	font-weight: 700;
	padding-bottom: 8px;
}
.hohMilestones .stat .label{
	color: rgb(var(--color-text-light));
  	font-size: 1.1rem;
}
.hohMediaEmbed .embed{
	background: rgb(var(--color-background));
	border-radius: 3px;
	display: inline-grid;
	font-size: 14px;
	grid-template-columns: 50px auto;
	line-height: 18px;
	max-width: 550px;
	min-height: 64px;
	overflow: hidden;
	width: auto;
}
.hohMediaEmbed .wrap{
	color: rgb(var(--color-text-light));
	overflow: hidden;
	padding: 10px 16px 10px 12px;
	text-overflow: ellipsis;
}
.hohMediaEmbed .title{
	color: rgb(var(--color-blue));
	font-size: 1.3rem;
	font-weight: 500;
	margin-bottom: -10px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.hohMediaEmbed .info{
	font-size: 1.2rem;
	position: relative;
}
.hohMediaEmbed .genres{
	min-height: 18px;
	min-width: 14px;
	opacity: 0;
	position: relative;
	top: 18px;
	transition: .2s;
}
.hohMediaEmbed .cover{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
}
.hohMediaEmbed .info > span{
	display: inline;
	transition: .2s;
	opacity: 1;
}
.hohMediaEmbed:hover .info > span{
	opacity: 0;
}
.hohMediaEmbed:hover .info > .genres{
	opacity: 1;
}
.hohGetMarkdown{
	cursor: pointer;
	opacity: 0;
	padding-right: 10px;
	transition: .2s;
}
.activity-entry:hover .hohGetMarkdown{
	color: rgb(var(--color-blue));
	opacity: 1;
}
.hohMarkdownSource{
	font-size: 1.4rem;
	line-height: 1.4;
	overflow-wrap: break-word;
	word-break: break-word;
}
.queryResults .message img{
	max-width: 100%;
}
.hohTimelineEntry{
	margin: 7px;
	position: relative;
	padding: 7px;
	border-radius: 2px;
	background: rgb(var(--color-foreground));
}
.hohImport .dropbox{
	align-items: center;
	background: rgba(var(--color-background),.6);
	border-radius: 4px;
	color: rgb(var(--color-text-lighter));
	cursor: pointer;
	display: inline-flex;
	font-size: 1.3rem;
	height: 200px;
	justify-content: center;
	line-height: 2rem;
	margin-right: 20px;
	outline-offset: -12px;
	outline: 2px dashed rgba(var(--color-text),.2);
	padding: 18px 20px;
	position: relative;
	transition: .2s;
	vertical-align: text-top;
	width: 200px;
}
.hohImport .dropbox p{
	font-size: 1.2em;
	padding: 50px 0;
	text-align: center;
}
.hohImport .dropbox .input-file{
	cursor: pointer;
	height: 200px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	width: 100%;
}
.hohImport label.el-checkbox{
	display: block;
	margin-top: 20px;
	margin-bottom: 10px;
}
.section.hohImport{
	margin-bottom: 50px;
}
.media-manga .external-links{
	position: relative;
}
.media-manga .external-links > h2{
	visibility: hidden;
}
.media-manga .external-links > h2::after{
	visibility: visible;
	position: absolute;
	left: 0px;
	top: 0px;
	content: "External & Reading links";
}
.hohButton.danger{
	background: rgba(var(--color-red),.8);
	color: rgb(var(--color-white));
}
.hohButton:disabled{
	opacity: 0.5;
	cursor: default;
}
.hohStepper{
	cursor: pointer;
	position: absolute;
	opacity: 0.5;
}
.el-slider:hover .hohStepper{
	opacity: 1;
}
.hohNameCel{
	margin-left: 50px;
	display: block;
}
.trailer{
	overflow: auto;
	resize: both;
}
.trailer .video{
	height: calc(99% - 30px);
}
.hohResizePearl{
	position: absolute;
	right: 2px;
	bottom: 2px;
	width: 20px;
	height: 20px;
	border: solid;
	border-radius: 10px;
	background: rgb(var(--color-foreground));
	cursor: nw-resize;
}
.activity-entry > .wrap > .time:hover{
	background: rgb(var(--color-foreground));
	z-index: 60;
}
.activity-entry > .wrap > .time .action{
	margin-left: 5px;
	padding-right: 5px;
}
a.external::after{
	content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="12" height="12" viewBox="0 0 24 24"><path fill="%23fff" stroke="%2336c" d="M1.5 4.518h5.982V10.5H1.5z"/><path fill="%2336c" d="M5.765 1H11v5.39L9.427 7.937l-1.31-1.31L5.393 9.35l-2.69-2.688 2.81-2.808L4.2 2.544z"/><path fill="%23fff" d="M9.995 2.004l.022 4.885L8.2 5.07 5.32 7.95 4.09 6.723l2.882-2.88-1.85-1.852z"/></svg>');
}
.load-more:hover{
	color: rgb(var(--color-blue));
}
#hohListPreview .media-preview-card:hover .image-text{
	opacity: 0;
}
#hohListPreview .media-preview-card:hover .plus-progress{
	opacity: 1;
}
#hohListPreview .plus-progress{
	background: rgba(var(--color-overlay),.7);
	border-radius: 0 0 3px 3px;
	bottom: 0;
	color: rgba(var(--color-text-bright),.9);
	display: inline-block;
	font-size: 1.3rem;
	font-weight: 500;
	left: 0;
	letter-spacing: .2px;
	margin-bottom: 0;
	opacity: 0;
	padding-bottom: 8px;
	padding-top: 8px;
	position: absolute;
	transition: .3s;
	width: 100%;
}
#hohListPreview .content{
	background: rgb(var(--color-background));
	height: 100%;
	left: 100%;
	position: absolute;
	top: 0;
	opacity: 0;
	transition: opacity .3s;
	width: 212px;
	z-index: -1;
	border-radius: 0 3px 3px 0;
	padding: 12px;
}
#hohListPreview .info-left .content{
	border-radius: 3px 0 0 3px;
	left: auto !important;
	right: 100%;
	text-align: right;
}
#hohListPreview .media-preview-card:hover .content{
	opacity: 1;
	z-index: 5;
}
#hohListPreview .content:hover{
	opacity: 0!important;
	z-index: -1!important;
}
#hohListPreview .size-toggle{
	float: right;
}
.site-theme-contrast .media-page-unscoped .header .description{
	color: rgb(var(--color-text));
}
.hohDeleteActivity{
	position: absolute;
	top: 2px;
	right: -21px;
	width: 10px;
	color: rgb(var(--color-red));
	cursor: pointer;
	display: none;
	padding-left: 5px;
	padding-right: 5px;
	background: rgb(39, 44, 56);
}
.hohFeed .activity:hover .hohDeleteActivity{
	display: inline;
}
.sense-wrap,
.adswrapper{
	display: none!important;
	height: 0px!important;
	width: 0px!important;
	opacity: 0!important;
}
input[list="socialUsers"]{
	color: rgb(var(--color-text));
}
.footer > .actions > .button.like > .like-wrap > .button.liked .icon{
	color: rgb(var(--color-peach));
}
.favourite.media{
	background-color: rgb(var(--color-background));
}
.hohSearchResult{
	width: 18.5%;
	display: inline-block;
	text-align: center;
	padding: 3px;
	height: 2.2em;
	overflow: hidden;
	border-style: solid;
	border-width: 1px;
	border-radius: 2px;
	cursor: pointer;
	bacground-color: inherit;
	margin: 1px;
}
.hohSearchResult.anime{
	color: rgb(var(--color-blue));
}
.hohSearchResult.manga{
	color: rgb(var(--color-green));
}
.hohSearchResult.anime:hover{
	background-color: rgb(var(--color-blue),0.3);
}
.hohSearchResult.manga:hover{
	background-color: rgb(var(--color-green),0.3);
}
.hohSearchResult.anime.selected{
	background-color: rgb(var(--color-blue),0.3);
	cursor: initial;
}
.hohSearchResult.manga.selected{
	background-color: rgb(var(--color-green),0.3);
	cursor: initial;
}
.favourites .favourite{
	background-color: rgb(var(--color-background));
}
.hohCharacter .role-card div{
	display: inline-grid;
}
.hohCharacter .role-card > div{
	display: inline-grid;
	grid-template-columns: 60px auto;
	grid-template-areas: "image content";
}
.hohCharacter .cover{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	grid-area: image;
}
.hohCharacter .content{
	font-size: 1.2rem;
	grid-area: content;
	overflow: hidden;
	padding: 10px;
}
.hohCharacter .staff .content{
	text-align: right;
}
.hohCharacter .name{
	display: block;
	height: 48px;
	line-height: 1.3;
}
.hohCharacter .role{
	color: rgb(var(--color-text-lighter));
	font-size: 1.1rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 100%;
}
.hohCharacter .view-media-staff{
	grid-template-areas: "media staff";
}
.hohCharacter .view-media-staff .staff{
	grid-template-areas: "content image";
	grid-template-columns: auto 60px;
	grid-area: staff;
}
.hohCharacter .view-media-staff .media{
	grid-area: media;
}
.hohCharacter .role-card{
	background: rgb(var(--color-foreground));
	border-radius: 3px;
	display: inline-grid;
	grid-template-columns: 50% 50%;
	height: 80px;
	overflow: hidden;
}
.hohNoAWC .thread-card.small{
	margin-bottom: 15px;
	background: rgb(var(--color-foreground));
	border-radius: 3px;
	padding: 18px;
	position: relative;
}
.hohNoAWC .title{
	font-size: 1.4rem;
	display: block;
	margin-bottom: 12px;
	margin-right: 110px;
}
.hohNoAWC .footer{
	align-items: center;
	display: flex;
	flex-direction: row;
}
.hohNoAWC .avatar{
	background-position: 50%;
	background-repeat: no-repeat;
	background-size: cover;
	border-radius: 3px;
	display: inline-block;
	height: 25px;
	vertical-align: text-top;
	width: 25px;
}
.hohNoAWC .name{
	display: inline-block;
	font-size: 1.3rem;
	padding-left: 10px;
}
.hohNoAWC .name span{
	color: rgb(var(--color-blue));
}
.hohNoAWC .categories{
	margin-left: auto;
	white-space: nowrap;
}
.hohNoAWC .category{
	border-radius: 100px;
	color: #fff;
	display: inline-block;
	font-size: 1.1rem;
	margin-left: 10px;
	padding: 4px 8px;
	text-transform: lowercase;
}
.hohNoAWC .category:hover{
	color: rgba(26,27,28,.6);
}
.hohNoAWC .info{
	color: rgb(var(--color-text-lighter));
	font-size: 1.2rem;
	position: absolute;
	right: 12px;
	top: 12px;
}
.hohNoAWC .info span{
	padding-left: 10px;
}
body.TMPreviewScore > .el-tooltip__popper{
	display: none;
}
`;
let documentHead = document.querySelector("head");
if(documentHead){
	documentHead.appendChild(style)
}
else{
	return//xml documents or something. At least it's not a place where the script can run
}

try{
	localStorage.setItem("test","test");
	localStorage.removeItem("test");
}
catch(e){
	alert("Error: LocalStorage not available.");
	console.log("LocalStorage, required for saving settings, is not available. Terminating Automail.");
	return;
}

const notificationColourDefaults = {
	"ACTIVITY_LIKE":{"colour":"rgb(250,122,122)","supress":false},
	"ACTIVITY_REPLY_LIKE":{"colour":"rgb(250,122,122)","supress":false},
	"THREAD_COMMENT_LIKE":{"colour":"rgb(250,122,122)","supress":false},
	"THREAD_LIKE":{"colour":"rgb(250,122,122)","supress":false},
	"THREAD_COMMENT_REPLY":{"colour":"rgb(61,180,242)","supress":false},
	"ACTIVITY_REPLY":{"colour":"rgb(61,180,242)","supress":false},
	"ACTIVITY_MESSAGE":{"colour":"rgb(123,213,85)","supress":false},
	"FOLLOWING":{"colour":"rgb(123,213,85)","supress":false},
	"ACTIVITY_MENTION":{"colour":"rgb(123,213,85)","supress":false},
	"THREAD_COMMENT_MENTION":{"colour":"rgb(123,213,85)","supress":false},
	"THREAD_SUBSCRIBED":{"colour":"rgb(247,191,99)","supress":false},
	"AIRING":{"colour":"rgb(247,191,99)","supress":false}
};

let useScripts = {//most modules are turned on by default
	notifications: true,
	socialTab: true,
	forumComments: true,
	forumMedia: true,
	staffPages: true,
	tagDescriptions: true,
	completedScore: true,
	droppedScore: false,
	moreStats: true,
	characterFavouriteCount: true,
	studioFavouriteCount: true,
	CSSfavs: true,
	CSScompactBrowse: true,
	CSSgreenManga: false,
	CSSfollowCounter: true,
	CSSprofileClutter: false,
	CSSdecimalPoint: false,
	CSSverticalNav: false,
	CSSbannerShadow: true,
	hideLikes: false,
	dubMarker: false,
	CSSsmileyScore: true,
	CSSdarkDropdown: true,
	CSSexpandFeedFilters: false,
	feedCommentFilter: false,
	feedCommentComments: 0,
	feedCommentLikes: 0,
	colourPicker: true,
	colourSettings: [],
	mangaBrowse: false,
	progressBar: false,
	noRewatches: false,
	hideCustomTags: false,
	shortRomaji: false,
	replaceNativeTags: true,
	draw3x3: true,
	newChapters: true,
	limitProgress8: false,
	limitProgress10: false,
	tagIndex: true,
	ALbuttonReload: true,
	expandRight: false,
	timeToCompleteColumn: false,
	mangaGuess: true,
	replaceStaffRoles: true,
	settingsTip: true,
	enumerateSubmissionStaff: true,
	MALscore: false,
	MALserial: false,
	tweets: false,
	MALrecs: false,
	mobileFriendly: false,
	entryScore: true,
	showRecVotes: true,
	activityTimeline: true,
	browseFilters: true,
	embedHentai: false,
	comparissionPage: true,
	noImagePolyfill: false,
	reviewConfidence: true,
	blockWord: false,
	dropdownOnHover: false,
	showMarkdown: true,
	myThreads: false,
	dismissDot: true,
	statusBorder: false,
	moreImports: true,
	plussMinus: true,
	milestones: false,
	allStudios: false,
	CSSmobileTags: true,
	termsFeed: false,
	termsFeedNoImages: false,
	customCSS: false,
	subTitleInfo: false,
	customCSSValue: "",
	expandDescriptions: true,
	negativeCustomList: false,
	globalCustomList: false,
	dblclickZoom: false,
	betterListPreview: false,
	youtubeFullscreen: false,
	homeScroll: true,
	blockWordValue: "nsfw",
	hideGlobalFeed: false,
	cleanSocial: false,
	SFWmode: false,
	hideAWC: false,
	forumPreviewNumber: 3,
	profileBackground: true,
	yearStepper: true,
	profileBackgroundValue: "inherit",
	viewAdvancedScores: true,
	betterReviewRatings: true,
	notificationColours: notificationColourDefaults,
	staffRoleOrder: "alphabetical",
	titleLanguage: "ROMAJI",
	dubMarkerLanguage: "English",
	accessToken: "",
	aniscriptsAPI: false
};

let userObject = JSON.parse(localStorage.getItem("auth"));
let whoAmI = "";
let whoAmIid = 0;

try{//use later for some scripts
	whoAmI = document.querySelector(".nav .links .link[href^='/user/']").href.match(/\/user\/(.*)\//)[1];//looks at the nav
}
catch(err){
	if(userObject){
		whoAmI = userObject.name;
	}
	else{
		console.warn("could not get username");
	}
}

if(userObject && userObject.donatorTier > 0 && userObject.name !== "hoh"){
	alert("Sorry, Automail does not work for donators")
	return
}

let forceRebuildFlag = false;

useScripts.save = function(){
	localStorage.setItem("hohSettings",JSON.stringify(useScripts))
};
const useScriptsSettings = JSON.parse(localStorage.getItem("hohSettings"));
if(useScriptsSettings){
	let keys = Object.keys(useScriptsSettings);
	keys.forEach(//this is to keep the default settings if the version in local storage is outdated
		key => useScripts[key] = useScriptsSettings[key]
	)
}
if(userObject){
	useScripts.titleLanguage = userObject.options.titleLanguage;
	whoAmIid = userObject.id
}
useScripts.save();

function safeURL(URL){
	let compo = encodeURIComponent((URL || "").replace(/\s|\/|:|★/g,"-").replace(/(\.|\)|\\|#|!|,|%|’)/g,"").replace(/ä/g,"a"));
	if(useScripts.SFWmode){
		if(badWords.some(
			word => compo.match(word)
		)){
			return ""
		}
	}
	return compo
}

function fuzzyDateCompare(first,second){//returns and INDEX, not to be used for sorting
	if(!first.year || !second.year){
		return -1
	}
	if(first.year > second.year){
		return 0
	}
	else if(first.year < second.year){
		return 1
	}
	if(!first.month || !second.month){
		return -1
	}
	if(first.month > second.month){
		return 0
	}
	else if(first.month < second.month){
		return 1
	}
	if(!first.day || !second.day){
		return -1
	}
	if(first.day > second.day){
		return 0
	}
	else if(first.day < second.day){
		return 1
	}
	return -1
}

function formatTime(diff,type){
	let magRound = function(num){
		if(num < 1){
			return Math.round(num);
		}
		else{
			if(
				Math.log(Math.ceil(num)) < 2*Math.log(num) - Math.log(Math.floor(num))
			){
				return Math.ceil(num)
			}
			else{
				return Math.floor(num)
			}
		}
	};
	let times = [
		{name: "year",short: "y",value: 60*60*24*365},
		{name: "month",short: "m",value: 60*60*24*30},
		{name: "week",short: "w",value: 60*60*24*7},
		{name: "day",short: "d",value: 60*60*24},
		{name: "hour",short: "h",value: 60*60},
		{name: "minute",short: "m",value: 60},
		{name: "second",short: "s",value: 1},
	];
	let timeIndex = 0;
	let significantValue = 0;
	let reminder = 0;
	do{
		significantValue = diff/times[timeIndex].value;
		reminder = (diff - Math.floor(significantValue) * times[timeIndex].value)/times[timeIndex + 1].value;
		timeIndex++;
	}while(!Math.floor(significantValue) && timeIndex < (times.length - 1));
	timeIndex--;
	if(!Math.floor(significantValue)){
		if(type === "short"){
			return magRound(diff) + "s"
		};
		if(magRound(diff) === 1){
			return magRound(diff) + " second"
		};
		return magRound(diff) + " seconds";
	}
	if(Math.floor(significantValue) > 1){
		if(type === "short"){
			return magRound(significantValue) + times[timeIndex].short
		};
		return magRound(significantValue) + " " + times[timeIndex].name + "s";
	}
	if(magRound(reminder) > 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " " + magRound(reminder) + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].name + " " + magRound(reminder) + " " + times[timeIndex + 1].name + "s";
	}
	if(magRound(reminder) === 1){
		if(type === "short"){
			return "1" + times[timeIndex].short + " 1" + times[timeIndex + 1].short	
		}
		return "1 " + times[timeIndex].name + " 1 " + times[timeIndex + 1].name;
	}
	if(type === "short"){
		return "1" + times[timeIndex].short
	}
	return "1 " + times[timeIndex].name;
}

function nativeTimeElement(timestamp){
	let dateObj = new Date(timestamp*1000);
	let elem = create("time");
	elem.setAttribute("datetime",dateObj);
	elem.title = dateObj.toLocaleDateString() + ", " + dateObj.toLocaleTimeString();
	let calculateTime = function(){
		let now = new Date();
		let diff = Math.round(now.valueOf()/1000) - Math.round(dateObj.valueOf()/1000);
		if(diff === 0){
			elem.innerText = "Just now";
		}
		if(diff === 1){
			elem.innerText = "1 second ago";
		}
		else if(diff < 60){
			elem.innerText = diff + " seconds ago";
		}
		else{
			diff = Math.floor(diff/60);
			if(diff === 1){
				elem.innerText = "1 minute ago";
			}
			else if(diff < 60){
				elem.innerText = diff + " minutes ago";
			}
			else{
				diff = Math.floor(diff/60);
				if(diff === 1){
					elem.innerText = "1 hour ago";
				}
				else if(diff < 24){
					elem.innerText = diff + " hours ago";
				}
				else{
					diff = Math.floor(diff/24);
					if(diff === 1){
						elem.innerText = "1 day ago";
					}
					else if(diff < 7){
						elem.innerText = diff + " days ago";
					}
					else if(diff === 7){
						elem.innerText = "1 week ago";
					}
					else if(diff < 30){
						elem.innerText = Math.floor(diff/7) + " weeks ago";
					}
					else if(diff < 365){
						if(Math.floor(diff/30) === 1){
							elem.innerText = "1 month ago";
						}
						else{
							elem.innerText = Math.floor(diff/30) + " months ago";
						}
					}
					else{
						diff = Math.floor(diff/365);
						if(diff === 1){
							elem.innerText = "1 year ago";
						}
						else{
							elem.innerText = diff + " years ago";
						}
					}
				}
			}
		};
		setTimeout(function(){
			if(!document.body.contains(elem)){
				return
			}
			calculateTime()
		},60*1000)
	};calculateTime();
	return elem;
}

let wilson = function(positiveScore,total){
	if(total === 0){
		return {
			left: 0,
			right: 0
		}
	}
	// phat is the proportion of successes
	// in a Bernoulli trial process
	let phat = positiveScore / total;
	// z is 1-alpha/2 percentile of a standard
	// normal distribution for error alpha=5%
	const z = 1.96;
	// implement the algorithm https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval#Wilson_score_interval
	let a = phat + z * z / (2 * total);
	let b = z * Math.sqrt((phat * (1 - phat) + z * z / (4 * total)) / total);
	let c = 1 + z * z / total;
	return {
		left: (a - b) / c,
		right: Math.min(1,(a + b) / c)
	};
};

if(!String.prototype.includes){//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
	String.prototype.includes = function(search,start){
		'use strict';
		if(search instanceof RegExp){
			throw TypeError('first argument must not be a RegExp');
		} 
		if(start === undefined){
			start = 0
		}
		return this.indexOf(search,start) !== -1;
	}
}

Number.prototype.roundPlaces = function(places){
	return +(
		Math.round(
			this * Math.pow(10,places)
		) / Math.pow(10,places)
	)
}

function capitalize(string){
	return (string + "").charAt(0).toUpperCase() + (string + "").slice(1)
}

function csvEscape(string){
	return "\"" + (string || "").replace(/"/g,"\"\"") + "\""
}

function hashCode(string){//non-cryptographic hash
	var hash = 0, i, chr;
	if(string.length === 0){
		return hash
	}
	for(i = 0; i < string.length; i++) {
		chr   = string.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash
}

setInterval(function(){
	document.querySelectorAll(`a[rel="noopener noreferrer"]`).forEach(link => {
		let linker = (new URL(link.href)).host;
		if(linker && linker.split(".").length >= 2){
			linker = linker.split(".")[linker.split(".").length - 2];
			if(
[556415734,1724824539,-779421562,-1111399772,-93654449,1120312799,-781704176,-1550515495,3396395,567115318,-307082983,1954992241,-307211474,-307390044,1222804306,-795095039,-1014860289,403785740].includes(hashCode(linker))
			){
				link.href = "https://anilist.co/forum/thread/14";
				link.innerText = "THIS BE BAD LINK, IT'S NOW VEWY DISPOSED OF OwO (click the report button to call the mods on this naughty user)";
			}
		}
	})
	document.querySelectorAll(".sense-wrap").forEach(link => {
		link.remove()
	})
},2000);

const svgns = "http://www.w3.org/2000/svg";
const svgShape = function(shape,target,attributes){
	shape = shape || "g";
	let obj = document.createElementNS(svgns,shape);
	Object.keys(attributes || {}).forEach(key => {
		obj.setAttributeNS(null,key,attributes[key])
	});
	if(target){
		target.appendChild(obj)
	}
	return obj
}
const VALUE = ((a,b) => a - b);//Used for sorting functions
const VALUE_DESC = ((b,a) => a - b);
const TRUTHY = (a => a);//filtering
const ACCUMULATE = (a,b) => (a || 0) + (b || 0);
const ALPHABETICAL = function(valueFunction){
	if(valueFunction){
		return (a,b) => ("" + valueFunction(a)).localeCompare("" + valueFunction(b))
	}
	return (a,b) => ("" + a).localeCompare("" + b)
}
const NOW = () => (new Date()).valueOf();

const Stats = {
	average: function(list){
		return list.reduce((a,b) => (a || 0) + (b || 0))/list.length
	},
	median: function(list){
		let temp = [...list].sort((a,b) => a - b);
		return (
			temp[Math.floor((temp.length - 1)/2)]
			+ temp[Math.ceil((temp.length - 1)/2)]
		)/2;
	},
	mode: function(list){
		return [...list].sort(
			(b,a) => list.filter(
				e => e === a
			).length - list.filter(
				e => e === b
			).length
		)[0];
	}
}

const evalBackslash = function(text){
	let output = "";
	let special = false;
	Array.from(text).forEach(char => {
		if(char === "\\"){
			if(special){
				output += "\\"
			}
			special = !special;
		}
		else{
			output += char;
		}
	});
	return output
}

//this function is for removing duplicates in a sorted list.
//the twist is that it also provides a way to merge the duplicates with a custom function
const removeGroupedDuplicates = function(
	list,
	uniquenessFunction,
	modificationFunction
){//both functions optional
	if(!uniquenessFunction){
		uniquenessFunction = e => e;
	};
	list = list.sort(
		(a,b) => uniquenessFunction(a) - uniquenessFunction(b)
	);
	let returnList = [];
	list.forEach((element,index) => {
		if(index === list.length - 1){
			returnList.push(element);
			return;
		}
		if(uniquenessFunction(element) === uniquenessFunction(list[index + 1])){
			if(modificationFunction){
				modificationFunction(element,list[index + 1]);
			}
		}
		else{
			returnList.push(element);
		}
	});
	return returnList
};

//for the school/workplace methods
let badWords = ["hentai","loli","nsfw","ecchi","sex","gore","porn","violence","lewd","fuck","waifu"];//woooo so bad.
const badTags = ["gore","nudity","ahegao","irrumatio","sex toys","ashikoki","defloration","paizuri","tekoki","nakadashi","large breasts","facial","futanari","public sex","flat chest","voyeur","fellatio","incest","threesome","anal sex","bondage","cunnilingus","harem","masturbation","slavery","gyaru","rape"];
badWords = badWords.concat(badTags);

function create(type,classes,text,appendLocation,cssText){
	let element = document.createElement(type);
	if(Array.isArray(classes)){
		element.classList.add(...classes);
		if(classes.includes("newTab")){
			element.setAttribute("target","_blank")
		}
	}
	else if(classes){
		if(classes[0] === "#"){
			element.id = classes.substring(1)
		}
		else{
			element.classList.add(classes);
			if(classes === "newTab"){
				element.setAttribute("target","_blank")
			}
		}
	};
	if(text || text === 0){
		element.innerText = text
	};
	if(appendLocation && appendLocation.appendChild){
		appendLocation.appendChild(element)
	};
	if(cssText){
		element.style.cssText = cssText
	};
	return element;
};

function createCheckbox(target,id,checked){//target[,id]
	let hohCheckbox = create("label",["hohCheckbox","el-checkbox__input"],false,target);		
	let checkbox = create("input",false,false,hohCheckbox);
	if(id){
		checkbox.id = id
	}
	checkbox.type = "checkbox";
	checkbox.checked = !!checked;
	create("span","el-checkbox__inner",false,hohCheckbox);
	return checkbox;
}

function createDisplayBox(cssProperties){
	let displayBox = create("div","hohDisplayBox",false,document.querySelector("#app"),cssProperties);
	let mousePosition;
	let offset = [0,0];
	let isDown = false;
	let isDownResize = false;
	let displayBoxClose = create("span","hohDisplayBoxClose",svgAssets.cross,displayBox);
	displayBoxClose.onclick = function(){
		displayBox.remove();
	};
	let resizePearl = create("span","hohResizePearl",false,displayBox);
	displayBox.addEventListener("mousedown",function(e){
		isDown = true;
		offset = [
			displayBox.offsetLeft - e.clientX,
			displayBox.offsetTop - e.clientY
		];
	},true);
	resizePearl.addEventListener("mousedown",function(e){
		event.stopPropagation();
		event.preventDefault();
		isDownResize = true;
		offset = [
			displayBox.offsetLeft,
			displayBox.offsetTop
		];
	},true);
	document.addEventListener("mouseup",function(){
		isDown = false;
		isDownResize = false;
	},true);
	document.addEventListener("mousemove",function(event){
		event.preventDefault();
		if(isDownResize){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.width = (mousePosition.x - offset[0]) + "px";
			displayBox.style.height = (mousePosition.y - offset[1]) + "px";
			return;
		}
		if(isDown){
			mousePosition = {
				x : event.clientX,
				y : event.clientY
			};
			displayBox.style.left = (mousePosition.x + offset[0]) + "px";
			displayBox.style.top  = (mousePosition.y + offset[1]) + "px";
		}
	},true);
	let innerSpace = create("div","scrollableContent",false,displayBox);
	return innerSpace;
}

function removeChildren(node){
	if(node){
		while(node.childElementCount){
			node.lastChild.remove()
		}
	}
}

const svgAssets = {
	envelope : "✉",
	cross : "✕",
	like : "♥",
	likeNative : `
<svg aria-hidden="true" data-prefix="fas" data-icon="heart" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-heart fa-w-16 fa-sm"><path fill="currentColor" d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z" class=""></path></svg>`,
	frown : `
<svg aria-hidden="true" data-prefix="far" data-icon="frown" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-frown fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-80 128c-40.2 0-78 17.7-103.8 48.6-8.5 10.2-7.1 25.3 3.1 33.8 10.2 8.5 25.3 7.1 33.8-3.1 16.6-19.9 41-31.4 66.9-31.4s50.3 11.4 66.9 31.4c4.8 5.7 11.6 8.6 18.5 8.6 5.4 0 10.9-1.8 15.4-5.6 10.2-8.5 11.5-23.6 3.1-33.8C326 321.7 288.2 304 248 304z">
	</path>
</svg>`,
	meh : `
<svg aria-hidden="true" data-prefix="far" data-icon="meh" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-meh fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm-80-216c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-64c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm8 144H160c-13.2 0-24 10.8-24 24s10.8 24 24 24h176c13.2 0 24-10.8 24-24s-10.8-24-24-24z">
	</path>
</svg>`,
	smile : `
<svg aria-hidden="true" data-prefix="far" data-icon="smile" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="svg-inline--fa fa-smile fa-w-16 fa-lg">
	<path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm84-143.4c-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.6-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8-10.2-8.4-25.3-7.1-33.8 3.1zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z">
	</path>
</svg>`,
	star : `
<svg aria-hidden="true" data-prefix="fas" data-icon="star" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="icon svg-inline--fa fa-star fa-w-18">
	<path fill="currentColor" d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z">
	</path>
</svg>`,
	notes: `
<svg aria-hidden="true" data-icon="notes" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-redo-alt fa-w-16">
	<path fill="currentColor" d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z">
	</path>
</svg>`,
	//the column sorting arrow
	angleDown : `
<svg aria-hidden="true" data-prefix="fas" data-icon="angle-down" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="svg-inline--fa fa-angle-down fa-w-10">
	<path fill="currentColor" d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z">
	</path>
</svg>`,
	view : `
<svg aria-hidden="true" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-18 fa-sm">
	<path fill="currentColor" d="M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z">
	</path>
</svg>`,
	reply : `
<svg aria-hidden="true" data-prefix="fas" data-icon="comments" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-comments fa-w-18 fa-sm">
	<path fill="currentColor" d="M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z">
	</path>
</svg>`,
	repeat : `
<svg aria-hidden="true" data-prefix="fas" data-icon="redo-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-redo-alt fa-w-16 repeat">
	<path fill="currentColor" d="M256.455 8c66.269.119 126.437 26.233 170.859 68.685l35.715-35.715C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.75c-30.864-28.899-70.801-44.907-113.23-45.273-92.398-.798-170.283 73.977-169.484 169.442C88.764 348.009 162.184 424 256 424c41.127 0 79.997-14.678 110.629-41.556 4.743-4.161 11.906-3.908 16.368.553l39.662 39.662c4.872 4.872 4.631 12.815-.482 17.433C378.202 479.813 319.926 504 256 504 119.034 504 8.001 392.967 8 256.002 7.999 119.193 119.646 7.755 256.455 8z">
	</path>
</svg>`,
	external : `
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
	<path fill="#fff" stroke="#36c" d="M1.5 4.518h5.982V10.5H1.5z"/>
	<path fill="#36c" d="M5.765 1H11v5.39L9.427 7.937l-1.31-1.31L5.393 9.35l-2.69-2.688 2.81-2.808L4.2 2.544z"/>
	<path fill="#fff" d="M9.995 2.004l.022 4.885L8.2 5.07 5.32 7.95 4.09 6.723l2.882-2.88-1.85-1.852z"/>
</svg>`,
	listView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="list-ul" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-list-ul fa-w-16">
	<g fill="currentColor">
		<circle cx="48" cy="96"  r="48"/>
		<circle cx="48" cy="256" r="48"/>
		<circle cx="48" cy="416" r="48"/>
		<rect x="128" y="60"  width="384" height="72" rx="16"/>
		<rect x="128" y="220" width="384" height="72" rx="16"/>
		<rect x="128" y="380" width="384" height="72" rx="16"/>
	</g>
</svg>`,
	simpleListView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="list-ul" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-list-ul fa-w-16">
	<g fill="currentColor">
		<rect x="0" y="60"  width="384" height="72" rx="16"/>
		<rect x="0" y="220" width="384" height="72" rx="16"/>
		<rect x="0" y="380" width="384" height="72" rx="16"/>
	</g>
</svg>`,
	bigListView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-list" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-list fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="149" height="128" rx="24"/>
		<rect x="0"   y="192" width="149" height="128" rx="24"/>
		<rect x="0"   y="352" width="149" height="128" rx="24"/>
		<rect x="181" y="32"  width="331" height="128" rx="24"/>
		<rect x="181" y="192" width="331" height="128" rx="24"/>
		<rect x="181" y="352" width="331" height="128" rx="24"/>
	</g>
</svg>`,
	compactView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-large" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-large fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="155" height="208" rx="24"/>
		<rect x="0"   y="272" width="155" height="208" rx="24"/>
		<rect x="178" y="32"  width="155" height="208" rx="24"/>
		<rect x="178" y="272" width="155" height="208" rx="24"/>
		<rect x="356" y="32"  width="155" height="208" rx="24"/>
		<rect x="356" y="272" width="155" height="208" rx="24"/>
	</g>
</svg>`,
	cardView : `
<svg aria-hidden="true" data-prefix="fas" data-icon="th-large" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-th-large fa-w-16">
	<g fill="currentColor">
		<rect x="0"   y="32"  width="240" height="208" rx="24"/>
		<rect x="0"   y="272" width="240" height="208" rx="24"/>
		<rect x="272" y="32"  width="240" height="208" rx="24"/>
		<rect x="272" y="272" width="240" height="208" rx="24"/>
	</g>
</svg>`,
	link : `
<svg aria-hidden="true" data-prefix="fas" data-icon="link" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-link fa-w-16 fa-sm">
	<path fill="currentColor" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path>
</svg>`,
	eye: `
<svg data-v-2b6aef6a="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="svg-inline--fa fa-eye fa-w-18 fa-sm"><path data-v-2b6aef6a="" fill=\"currentColor" d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" class=""></path></svg>`
};

const distributionColours = {
	"COMPLETED" : "rgb(104, 214,  57)",
	"CURRENT"   : "rgb(  2, 169, 255)",
	"PAUSED"    : "rgb(247, 121, 164)",
	"DROPPED"   : "rgb(232,  93, 117)",
	"PLANNING"  : "rgb(247, 154,  99)",
	"REPEATING" : "violet"
};

const distributionFormats = {
	"TV" : "TV",
	"TV_SHORT" : "TV Short",
	"MOVIE" : "Movie",
	"SPECIAL" : "Special",
	"OVA" : "OVA",
	"ONA" : "ONA",
	"MUSIC" : "Music",
	"MANGA" : "Manga",
	"NOVEL" : "Light Novel",
	"ONE_SHOT" : "One Shot"
};

const distributionStatus = {
	"FINISHED" : "Finished",
	"RELEASING" : "Releasing",
	"NOT_YET_RELEASED" : "Not Yet Released",
	"CANCELLED" : "Cancelled"
};

const categoryColours = new Map([
	[1,"rgb(0, 170, 255)"],
	[2,"rgb(76, 175, 80)"],
	[3,"rgb(75, 179, 185)"],
	[4,"rgb(75, 179, 185)"],
	[5,"rgb(103, 58, 183)"],
	[7,"rgb(78, 163, 230)"],
	[8,"rgb(0, 150, 136)"],
	[9,"rgb(96, 125, 139)"],
	[10,"rgb(36, 36, 169)"],
	[11,"rgb(251, 71, 30)"],
	[12,"rgb(239, 48, 81)"],
	[13,"rgb(233, 30, 99)"],
	[15,"rgb(184, 90, 199)"],
	[16,"rgb(255, 152, 0)"],
	[17,"rgb(121, 85, 72)"],
	[18,"rgb(43, 76, 105)"]
]);

if(useScripts.mangaBrowse){
	let navLinks = document.querySelector(`#nav .links .link[href="/search/anime"]`);
	if(navLinks){
		navLinks.href = "/search/manga";
		/*must remove the existing evenlistener for clicks.
		the reason for this is that it fires before the link, making the href useless
		this unfortunately turns it into a regular link, which reloads the page, so it's slower than the default behaviour.
		but since user interactions is even slower, this still saves time for those who only are interested in manga
		*/
		let mangaBrowseLink = navLinks.cloneNode(true);//copying and pasting the node should remove all event references to it
		navLinks.parentNode.replaceChild(mangaBrowseLink,navLinks);
	};
};

if(useScripts.colourPicker && (!useScripts.mobileFriendly)){
	let colourStyle = create("style");
	colourStyle.id = "colour-picker-styles";
	colourStyle.type = "text/css";
	documentHead.appendChild(colourStyle);
	const basicStyles = `
.footer .links{
	margin-left: calc(0px + 1%);
	transform: translate(0px,10px);
}
.hohColourPicker .hohCheckbox{
	margin-left: 10px;
}
`;
	if(Array.isArray(useScripts.colourSettings)){//legacy styles
		let newObjectStyle = {};
		useScripts.colourSettings.forEach(
			colour => newObjectStyle[colour.colour] = {
				initial: colour.initial,
				dark: colour.dark,
				contrast: colour.contrast
			}
		);
		useScripts.colourSettings = newObjectStyle;
		useScripts.save()
	}
	let applyColourStyles = function(){
		colourStyle.textContent = basicStyles;//eh, fix later.
		Object.keys(useScripts.colourSettings).forEach(key => {
			let colour = useScripts.colourSettings[key];
			let hexToRgb = function(hex){
				let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				return result ? [
					parseInt(result[1],16),
					parseInt(result[2],16),
					parseInt(result[3],16)
				] : null;
			}
			if(colour.initial){
				colourStyle.textContent += `:root{${key}:${hexToRgb(colour.initial).join(",")};}`
			};
			if(colour.dark){
				colourStyle.textContent += `.site-theme-dark{${key}:${hexToRgb(colour.dark).join(",")};}`
			};
			if(colour.contrast){
				colourStyle.textContent += `.site-theme-contrast{${key}:${hexToRgb(colour.contrast).join(",")};}`
			}
		})
	};applyColourStyles();
	let colourPickerLocation = document.querySelector("#app > .wrap > .footer > .container");
	if(colourPickerLocation){
		const supportedColours = [
			"--color-background",
			"--color-foreground",
			"--color-foreground-grey",
			"--color-foreground-grey-dark",
			"--color-foreground-blue",
			"--color-foreground-blue-dark",
			"--color-background-blue-dark",
			"--color-overlay",
			"--color-shadow",
			"--color-shadow-dark",
			"--color-text",
			"--color-text-light",
			"--color-text-lighter",
			"--color-text-bright",
			"--color-blue",
			"--color-blue-dim",
			"--color-white",
			"--color-black",
			"--color-red",
			"--color-peach",
			"--color-orange",
			"--color-yellow",
			"--color-green"
		];
		let colourChanger = function(){
			useScripts.colourSettings[cpSelector.value] = {
				"initial" :  (cpInitialBox.checked  ? cpInput.value : false),
				"dark" :     (cpDarkBox.checked     ? cpInput.value : false),
				"contrast" : (cpContrastBox.checked ? cpInput.value : false)
			}
			applyColourStyles();
			useScripts.save()
		};
		let cpContainer = create("div","hohColourPicker",false,colourPickerLocation);
		let cpTitle = create("h2",false,"Adjust Colours",cpContainer);
		let cpInput = create("input",false,false,cpContainer);
		cpInput.type = "color";
		let cpSelector = create("select",false,false,cpContainer);
		supportedColours.forEach(colour => {
			let option = create("option",false,colour,cpSelector);
			option.value = colour;
		});
		let cpDomain = create("p",false,false,cpContainer);
		let cpInitialBox = createCheckbox(cpDomain);
		create("span",false,"default",cpDomain);
		let cpDarkBox = createCheckbox(cpDomain);
		create("span",false,"dark",cpDomain);
		let cpContrastBox = createCheckbox(cpDomain);
		create("span",false,"contrast",cpDomain);
		let cpSelectorChanger = function(){
			if(useScripts.colourSettings[cpSelector.value]){
				cpInitialBox.checked  = !!useScripts.colourSettings[cpSelector.value].initial;
				cpDarkBox.checked     = !!useScripts.colourSettings[cpSelector.value].dark;
				cpContrastBox.checked = !!useScripts.colourSettings[cpSelector.value].contrast;
				cpInput.value = useScripts.colourSettings[cpSelector.value].initial
			}
			cpInitialBox.checked = false;
			cpDarkBox.checked = false;
			cpContrastBox.checked = false;
		};
		cpSelector.onchange = cpSelectorChanger;
		cpInput.onchange = colourChanger;
		cpInitialBox.onchange = colourChanger;
		cpDarkBox.onchange = colourChanger;
		cpContrastBox.onchange = colourChanger;
		cpSelectorChanger()
	}
}

let moreStyle = create("style");
moreStyle.id = "conditional-aniscripts-styles";
moreStyle.type = "text/css";

let createAlias = function(alias){
	if(alias[0] === "css/"){
		moreStyle.textContent += alias[1]
	}
	else{
		const dataSelect = `[href^="${alias[0]}"]`;
		const targetName = alias[1].substring(0,Math.min(100,alias[1].length));
		moreStyle.textContent += `
.title > a${dataSelect}
,a.title${dataSelect}
,.overlay > a.title${dataSelect}
,.media-preview-card a.title${dataSelect}
,.quick-search-results .el-select-dropdown__item a${dataSelect}> span
,.media-embed${dataSelect} .title
,.status > a.title${dataSelect}
,.role-card a.content${dataSelect} > .name{
	visibility: hidden;
	line-height: 0px;
}
.results.media a.title${dataSelect}
,.home .status > a.title${dataSelect}{
	font-size: 2%;
}

a.title${dataSelect}::before
,.quick-search-results .el-select-dropdown__item a${dataSelect} > span::before
,.role-card a.content${dataSelect} > .name::before
,.home .status > a.title${dataSelect}::before
,.media-embed${dataSelect} .title::before
,.overlay > a.title${dataSelect}::before
,.media-preview-card a.title${dataSelect}::before
,.title > a${dataSelect}::before{
	content:"${targetName}";
	visibility: visible;
}`;
	}
}

const shortRomaji = (useScripts.shortRomaji ? [
["/anime/30/","Evangelion"],
["/anime/32/","End of Evangelion"],
["/anime/5114/","Fullmetal Alchemist: Brotherhood"],
["/anime/10620/","Mirai Nikki"],
["/anime/1575/","Code Geass"],
["/anime/2904/","Code Geass R2"],
["/anime/21355/","Re:Zero"],
["/anime/2001/","Gurren Lagann"],
["/anime/21202/","Konosuba!"],
["/anime/21699/","Konosuba! 2"],
["/anime/21574/","Konosuba!: Kono Subarashii Choker ni Shufuku wo!"],
["/anime/9756/","Madoka★Magica"],
["/anime/9989/","AnoHana"],
["/anime/20623/","Kiseijuu"],
["/anime/14741/","Chuunibyou!"],
["/anime/18671/","Chuunibyou! 2"],
["/anime/14813/","OreGairu"],
["/anime/20920/","Danmachi"],
["/anime/8074/","HIGHSCHOOL OF THE DEAD"],
["/anime/849/","Haruhi"],
["/anime/4382/","Haruhi (2009)"],
["/anime/19603/","Unlimited Blade Works"],
["/anime/20792/","Unlimited Blade Works 2"],
["/anime/8769/","OreImo"],
["/anime/10020/","OreImo Specials"],
["/anime/13659/","OreImo 2"],
["/anime/18857/","OreImo 2 Specials"],
["/anime/2025/","Darker than BLACK"],
["/anime/20698/","OreGairu 2"],
["/anime/16592/","Danganronpa"],
["/anime/16742/","WataMote"],
["/anime/101291/","Bunny Girl-senpai"],
["/anime/104157/","Bunny Girl-senpai Movie"],
["/anime/19221/","NouKome"],
["/anime/45/","Rurouni Kenshin"],
["/anime/8795/","Panty & Stocking"],
["/anime/21860/","Sukasuka"],
["/anime/33/","Berserk"],
["/anime/97938/","Boruto"],
["/anime/97907/","Death March"],
["/anime/100183/","Gun Gale Online"],
["/anime/20474/","JoJo: Stardust Crusaders"],
["/anime/20799/","JoJo: Stardust Crusaders - Egypt-hen"],
["/anime/21450/","JoJo: Diamond wa Kudakenai"],
["/anime/102883/","JoJo: Ougon no Kaze"],
["/anime/101921/","Kaguya-sama wa Kokuraseta"],
["/anime/101166/","Danmachi: Orion no Ya"],
["/anime/20791/","Heaven’s Feel I. presage flower"],
["/anime/21718/","Heaven’s Feel II. lost butterfly"],
["/anime/21719/","Heaven’s Feel III. spring song"],
["/anime/1089/","Macross: Ai Oboete Imasu ka"],
["/anime/572/","Nausicaä"],
["/anime/513/","Laputa"],
["/anime/44/","Rurouni Kenshin: Tsuioku-hen"],
["/anime/528/","Mewtwo no Gyakushuu"],
["/anime/530/","Sailor Moon"],
["/anime/740/","Sailor Moon R"],
["/anime/532/","Sailor Moon S"],
["/anime/1239/","Sailor Moon SuperS"],
["/anime/996/","Sailor Moon Sailor Stars"],
["/anime/949/","Gunbuster!"],
["/anime/18677/","Yuushibu"],
["/manga/86635/","Kaguya-sama wa Kokurasetai"],
["/anime/17074/","Monogatari Second Season"],
["/anime/20910/","Shimoseka"],
["/anime/100182/","SAO: Alicization"],
["/anime/108759/","SAO: War of Underworld"],
["/anime/105156/","Shinchou Yuusha"]
] : []);

function initCSS(){
moreStyle.textContent = "";

let aliasFlag = false;

if(useScripts.shortRomaji){
	shortRomaji.forEach(createAlias);
	aliasFlag = true;
}

const titleAliases = JSON.parse(localStorage.getItem("titleAliases"));
if(titleAliases){
	aliasFlag = true;
	titleAliases.forEach(createAlias);
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
}`;
}

if(useScripts.CSSfavs){
/*adds a logo to most favourite studio entries. Add more if needed */
	const favStudios = [
[1,   "Studio-Pierrot",	"https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Studio_Pierrot.jpg/220px-Studio_Pierrot.jpg"],
[2,   "Kyoto-Animation","https://upload.wikimedia.org/wikipedia/commons/b/bf/Kyoto_Animation_logo.svg"],
[3,   "GONZO",		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Gonzo_company.png/220px-Gonzo_company.png"],
[4,   "BONES",		"https://i.stack.imgur.com/7pRQn.png"],
[5,   "Bee-Train",	"https://upload.wikimedia.org/wikipedia/commons/4/45/Bee_Train.svg"],
[6,   "Gainax",		"https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/Gainax_logo.svg/220px-Gainax_logo.svg.png"],
[7,   "JC-Staff",	"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/J.C.Staff_Logo.svg/220px-J.C.Staff_Logo.svg.png"],
[8,   "Artland",	"https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Artland_logo.gif/200px-Artland_logo.gif"],
[10,  "Production-IG",	"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Production_I.G_Logo.svg/250px-Production_I.G_Logo.svg.png"],
[11,  "MADHOUSE",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Madhouse_studio_logo.svg/300px-Madhouse_studio_logo.svg.png"],
[13,  "Studio-4C",	"https://upload.wikimedia.org/wikipedia/en/e/ec/Studio_4C_logo.png"],
[14,  "Sunrise",	"https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Sunrise_company_logo.svg/220px-Sunrise_company_logo.svg.png"],
[17,  "Aniplex",	"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Aniplex_logo.svg/220px-Aniplex_logo.svg.png"],
[18,  "Toei-Animation",	"https://i.stack.imgur.com/AjzVI.png",76,30],
[21,  "Studio-Ghibli",	"https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Studio_Ghibli_logo.svg/220px-Studio_Ghibli_logo.svg.png",76,30],
[22,  "Nippon-Animation","https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Nippon.png/200px-Nippon.png"],
[25,  "Milky-Animation-Label","https://img.fireden.net/a/image/1467/16/1467164781976.png"],
[27,  "Xebec",		"https://upload.wikimedia.org/wikipedia/fr/b/bd/Logo_Xebec.svg"],
[28,  "Oriental-Light-and-Magic","https://i.stack.imgur.com/Sbllv.png"],
[32,  "Manglobe",	"https://i.imgur.com/W8U74wO.png"],
[34,  "Hal-Film-Maker",	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hal_film_maker_logo.gif/220px-Hal_film_maker_logo.gif"],
[35,  "Seven-Arcs",	"https://upload.wikimedia.org/wikipedia/en/a/ac/Seven_Arcs_logo.png",76,25],
[36,  "Studio-Gallop",	"https://upload.wikimedia.org/wikipedia/commons/3/37/Studio_Gallop.png"],
[37,  "Studio-DEEN",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Studio_Deen_logo.svg/220px-Studio_Deen_logo.svg.png"],
[38,  "Arms",		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Arms_Corporation.png/200px-Arms_Corporation.png"],
[39,  "Daume",		"https://upload.wikimedia.org/wikipedia/commons/3/3e/Daume_studio_logo.png",70,35],
[41,  "Satelight",	"https://i.stack.imgur.com/qZVQg.png",76,30],
[43,  "ufotable",	"https://upload.wikimedia.org/wikipedia/en/5/56/Ufotable-Logo.png",76,30],
[44,  "Shaft",		"https://i.stack.imgur.com/tuqhK.png"],
[45,  "Pink-Pineapple",	"https://i.stack.imgur.com/2NMQ0.png"],
[47,  "Studio-Khara",	"https://i.stack.imgur.com/2d1TT.png",76,30],
[48,  "AIC",		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[51,  "diomeda",	"https://i.stack.imgur.com/ZHt3T.jpg"],
[53,  "Dentsu",		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Dentsu_logo.svg/200px-Dentsu_logo.svg.png"],
[58,  "Square-Enix",	"https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Square_Enix_logo.svg/230px-Square_Enix_logo.svg.png"],
[65,  "Tokyo-Movie-Shinsha","https://upload.wikimedia.org/wikipedia/en/2/22/Tokyo_Movie_Shinsha.png"],
[66,  "Key",		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Key_Visual_Arts_Logo.svg/167px-Key_Visual_Arts_Logo.svg.png",76,25],
[68,  "Mushi-Productions","https://i.stack.imgur.com/HmYdT.jpg"],
[73,  "TMS-Entertainment","https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TMS_Entertainment_logo.svg/220px-TMS_Entertainment_logo.svg.png"],
[79,  "Genco",		"https://www.thefilmcatalogue.com/assets/company-logos/5644/logo_en.png"],
[86,  "Group-TAC",	"https://upload.wikimedia.org/wikipedia/commons/b/b7/Group_TAC.png"],
[91,  "feel",		"https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Feel_%28company%29_logo.png/220px-Feel_%28company%29_logo.png",76,25],
[95,  "Doga-Kobo",	"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Doga_Kobo_Logo.svg/220px-Doga_Kobo_Logo.svg.png"],
[97,  "ADV-Films",	"https://upload.wikimedia.org/wikipedia/en/4/45/A.D._Vision_%28logo%29.png"],
[102, "FUNimation-Entertainment","https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Funimation_2016.svg/320px-Funimation_2016.svg.png"],
[103, "Tatsunoko-Production","https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Tatsunoko_2016_logo.png/300px-Tatsunoko_2016_logo.png"],
[104, "Lantis",		"https://upload.wikimedia.org/wikipedia/commons/3/39/Lantis_logo.png"],
[108, "Media-Factory",	"https://i.stack.imgur.com/rR7yU.png",76,25],
[112, "Brains-Base",	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Brain%27s_Base_logo.png/200px-Brain%27s_Base_logo.png"],
[113, "Kadokawa-Shoten","https://i.stack.imgur.com/ZsUDR.gif"],
[119, "Viz-Media",	"https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Viz_Media_logo.png/220px-Viz_Media_logo.png"],
[132, "PA-Works",	"https://i.stack.imgur.com/7kjSn.png"],
[143, "Mainichi-Broadcasting","https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mainichi_Broadcasting_System_logo.svg/200px-Mainichi_Broadcasting_System_logo.svg.png"],
[144, "Pony-Canyon",	"https://i.stack.imgur.com/9kkew.png"],
[145, "TBS",		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/TBS_logo.svg/200px-TBS_logo.svg.png"],
[150, "Sanrio",		"https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Sanrio_logo.svg/220px-Sanrio_logo.svg.png"],
[159, "Kodansha",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kodansha.png/200px-Kodansha.png"],
[166, "Movic",		"https://upload.wikimedia.org/wikipedia/commons/f/f3/Movic_logo.png"],
[167, "Sega",		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sega_logo.svg/200px-Sega_logo.svg.png"],
[169, "Fuji-TV",	"https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Fuji_TV_logo.svg/225px-Fuji_TV_logo.svg.png",76,30],
[193, "Idea-Factory",	"https://upload.wikimedia.org/wikipedia/en/e/eb/Idea_factory.gif"],
[196, "Production-Reed","https://upload.wikimedia.org/wikipedia/fr/7/7d/Production_Reed_Logo.png"],
[199, "Studio-Nue",	"https://i.stack.imgur.com/azzKH.png"],
[200, "Tezuka-Productions","https://upload.wikimedia.org/wikipedia/fr/f/fe/Tezuka_Productions_Logo.png"],
[238, "ATX",		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/AT-X_logo.svg/150px-AT-X_logo.svg.png",76,30],
[247, "ShinEi-Animation","https://i.stack.imgur.com/b2lcL.png"],
[262, "Kadokawa-Pictures-USA","https://i.stack.imgur.com/ZsUDR.gif"],
[287, "David-Production","https://upload.wikimedia.org/wikipedia/en/thumb/7/75/David_production.jpg/220px-David_production.jpg",76,30],
[290, "Kinema-Citrus",	"https://upload.wikimedia.org/wikipedia/commons/c/c0/Kinema_Citrus_logo.png",76,25],
[291, "CoMix-Wave",	"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Cwflogo.png/150px-Cwflogo.png"],
[292, "AIC-Plus",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[300, "SILVER-LINK",	"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Silver_Link_Logo.svg/220px-Silver_Link_Logo.svg.png"],
[309, "GoHands",	"https://i.stack.imgur.com/pScIZ.jpg"],
[314, "White-Fox",	"https://i.stack.imgur.com/lwG1T.png",76,30],
[333, "TYO-Animations",	"https://i.stack.imgur.com/KRqAp.jpg",76,25],
[334, "Ordet",		"https://i.stack.imgur.com/evr12.png",76,30],
[346, "Hoods-Entertainment","https://i.stack.imgur.com/p7S0I.png"],
[352, "Kadokawa-Pictures-Japan","https://i.stack.imgur.com/ZsUDR.gif"],
[365, "PoRO",		"https://i.stack.imgur.com/3rlAh.png"],
[372, "NIS-America-Inc","https://upload.wikimedia.org/wikipedia/en/e/e7/Nis.png"],
[376, "Sentai-Filmworks","https://i.stack.imgur.com/JV8R6.png",74,30],
[397, "Bridge",		"https://i.imgur.com/4Qn4EmK.png"],
[418, "Studio-Gokumi",	"https://i.stack.imgur.com/w1y22.png"],
[436, "AIC-Build",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[437, "Kamikaze-Douga",	"https://img7.anidb.net/pics/anime/178777.jpg"],
[456, "Lerche",		"https://i.stack.imgur.com/gRQPc.png"],
[459, "Nitroplus",	"https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Nitroplus_logo.png/220px-Nitroplus_logo.png"],
[493, "Aniplex-of-America","https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Aniplex_logo.svg/220px-Aniplex_logo.svg.png"],
[503, "Nintendo-Co-Ltd","https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/220px-Nintendo.svg.png"],
[537, "SANZIGEN",	"https://i.stack.imgur.com/CkuqH.png",76,30],
[555, "Studio-Chizu",	"https://i.stack.imgur.com/h2RuH.gif"],
[561, "A1-Pictures",	"https://i.stack.imgur.com/nBUYo.png",76,30],
[569, "MAPPA",		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/MAPPA_Logo.svg/220px-MAPPA_Logo.svg.png"],
[681, "ASCII-Media-Works","https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/ASCII_Media_Works_logo.svg/220px-ASCII_Media_Works_logo.svg.png"],
[803, "Trigger",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Trigger_Logo.svg/220px-Trigger_Logo.svg.png"],
[783, "GKids",		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/GKIDS_logo.svg/150px-GKIDS_logo.svg.png"],
[839, "LIDENFILMS",	"https://upload.wikimedia.org/wikipedia/en/6/6e/LidenFilms.png",76,30],
[858, "Wit-Studio",	"https://i.stack.imgur.com/o3Rro.png",76,30],
[911, "Passione",	"https://i.stack.imgur.com/YyEGg.jpg"],
[4418,"8bit",		"https://upload.wikimedia.org/wikipedia/en/e/ea/8-Bit_Animation_Studio.png"],
[6069,"Studio-3Hz",	"https://i.stack.imgur.com/eD0oe.jpg"],
[6071,"Studio-Shuka",	"https://upload.wikimedia.org/wikipedia/commons/f/fa/Shuka_studio.jpg"],
[6077,"Orange",		"https://i.stack.imgur.com/ve9mm.gif"],
[6142,"Geno-Studio",	"https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Genostudio.jpg/220px-Genostudio.jpg",76,25],
[6145,"Science-SARU",	"https://i.stack.imgur.com/zo9Fx.png"],
[6148,"NUT",		"https://upload.wikimedia.org/wikipedia/en/b/b0/NUT_animation_studio_logo.png"],
[6222,"CloverWorks",	"https://i.stack.imgur.com/9Fvr7.jpg"],
[6225,"TriF-studio",	"https://i.stack.imgur.com/lL85s.png",60,50],
[6235,"SEK-Studio",	"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/125px-Flag_of_North_Korea.svg.png",74,25],
[6283,"Studio-Durian",	"https://studio-durian.jp/images/ROGO2opa.png"]
	];
	let favStudioString = "";
	if(useScripts.CSSfavs){
		favStudioString += `
.overview  .favourites > .favourites-wrap > div,
.overview  .favourites > .favourites-wrap > a{
/*make the spaces in the grid even*/
	margin-bottom: 0px!important;
	margin-right: 0px!important;
	column-gap: 10px!important;
}
.user .overview{
	grid-template-columns: 460px auto!important;
}
.overview .favourites > .favourites-wrap{
	display: grid!important;
	padding: 0px!important;
	display: grid;
	grid-gap: 10px;
	column-gap: 10px!important;
	grid-template-columns: repeat(auto-fill,85px);
	grid-template-rows: repeat(auto-fill,115px);
	background: rgb(0,0,0,0) !important;
	width: 470px;
}
.overview .favourite.studio{
	cursor: pointer;
	min-height: 115px;
	font-size: 15px;
	display: grid;
	grid-gap: 10px;
	padding: 2px!important;
	padding-top: 8px!important;
	background-color: rgba(var(--color-foreground))!important;
	text-align: center;
	align-content: center;
}
.site-theme-dark .overview  .favourite.studio{
	background-color: rgb(49,56,68)!important;
}
.preview .favourite.media,
.preview .favourite.staff,
.preview .favourite.character{
	background-color: rgb(var(--color-foreground));
}
.overview .favourite.studio::after{
	display: inline-block;
	background-repeat: no-repeat;
	content:"";
	margin-left:5px;
	background-size: 76px 19px;
	width: 76px;
	height: 19px;
}`;
		favStudios.forEach(studio => {
			if(studio[2] !== ""){
				favStudioString += `.favourite.studio[href="/studio/${studio[0]}/${studio[1]}"]::after{background-image: url("${studio[2]}");`;
				if(studio.length === 5){
					favStudioString += `background-size: ${studio[3]}px ${studio[4]}px;width: ${studio[3]}px;height: ${studio[4]}px;`;
				}
				favStudioString += "}";
			}
		});
	}
	moreStyle.textContent += favStudioString;
}

if(useScripts.CSScompactBrowse){
	moreStyle.textContent += `
.search-page-unscoped.container{
	padding-left: 10px;
	padding-right: 0px;
	position: relative;
}
.search-page-unscoped > .results.media{
	margin-top: 40px;
}
.search-page-unscoped.cardView .media-card,
.search-page-unscoped:not(.listView) .media-card,
.studio-page-unscoped.cardView .media-card,
.studio-page-unscoped:not(.listView) .media-card{
	overflow: visible;
}
.search-page-unscoped.cardView .list-status,
.studio-page-unscoped.cardView .list-status{
	transform: translate(-18px,-18px);
}
.search-page-unscoped:not(.listView) .list-status,
.studio-page-unscoped:not(.listView) .list-status{
	transform: translate(-20px,-20px);
}
.search-page-unscoped:not(.cardView) .description,
.studio-page-unscoped:not(.cardView) .description{
	display: none;
}
.search-page-unscoped .preview-section,
.search-page-unscoped,
.studio-page-unscoped,
.results > .studio{
	counter-reset: ranking;
}
.search-page-unscoped:not(.cardView) .character,
.search-page-unscoped:not(.cardView) .staff,
.studio-page-unscoped:not(.cardView) .character,
.studio-page-unscoped:not(.cardView) .staff{
	position: relative;
}
.search-page-unscoped .data::before,
.studio-page-unscoped .data::before,
.search-page-unscoped .results > .character .cover::before,
.search-page-unscoped .results > .staff .cover::before{
	left: 2px;
	opacity: 0.4;
	font-size: 70%;
	position: absolute;
	counter-increment: ranking;
	content: counter(ranking);
}
.search-page-unscoped:not(.cardView) .media-card,
.studio-page-unscoped:not(.cardView) .media-card{
	min-width: 150px!important;
	grid-template-columns: 150px auto!important;
	height: 297px!important;
	width: 150px !important;
}
.search-page-unscoped:not(.cardView) .cover .overlay,
.studio-page-unscoped:not(.cardView) .cover .overlay{
	padding-left: 8px!important;
	padding-right: 8px!important;
	padding-top: 4px!important;
	padding-bottom: 14px!important;
}
.search-page-unscoped:not(.cardView) .grid-wrap > .media-card,
.studio-page-unscoped:not(.cardView) .grid-wrap > .media-card{
	margin-left: 30px;
}
.search-page-unscoped:not(.cardView) .media-card .cover,
.studio-page-unscoped:not(.cardView) .media-card .cover{
	width: 150px;
	height: 215px;
	margin-top: 53px;
	z-index: 100;
}
.search-page-unscoped:not(.cardView) .data,
.studio-page-unscoped:not(.cardView) .data{
	margin-left: -150px;
}
.search-page-unscoped:not(.cardView) .genres,
.studio-page-unscoped:not(.cardView) .genres{
	min-height:29px;
	z-index: 101;
	padding: 8px 5px!important;
	padding-bottom: 2px !important;
	font-size: 1rem!important;
	line-height: 1.15;
}
.search-page-unscoped:not(.cardView) .list-edit,
.studio-page-unscoped:not(.cardView) .list-edit{
	z-index: 101;
}
.search-page-unscoped:not(.cardView) .airing-countdown,
.studio-page-unscoped:not(.cardView) .airing-countdown{
	padding: 5px!important;
}
.search-page-unscoped:not(.cardView) .grid-wrap,
.studio-page-unscoped:not(.cardView) .grid-wrap{
	grid-template-columns: repeat(auto-fill, 150px) !important;
}
.search-page-unscoped:not(.cardView) .media,
.studio-page-unscoped:not(.cardView) .media{
	grid-template-columns: repeat(auto-fill, 150px) !important;
	width:100%;
}
.search-page-unscoped:not(.cardView) .overlay .studio{
	margin-top: 2px!important;
	margin-bottom: -8px!important;
}
.search-page-unscoped:not(.cardView) .list-status,
.studio-page-unscoped:not(.cardView) .list-status{
	width: 20px!important;
	height: 20px!important;
}
.search-page-unscoped:not(.cardView) .media-card:nth-child(5){
	display: inline-grid!important;
}
.search-page-unscoped.listView .results.media,
.search-page-unscoped.compactListView .results.media,
.studio-page-unscoped.listView .container.grid-wrap,
.studio-page-unscoped.compactListView .container.grid-wrap{
	display: block!important;
}
.search-page-unscoped.listView .media-card,
.studio-page-unscoped.listView .media-card{
	margin-bottom: 10px;
	height: 195px;
	width: 95%;
}
.search-page-unscoped.listView .media-card .cover,
.studio-page-unscoped.listView .media-card .cover{
	height: 165px;
	width: 115px;
}
.search-page-unscoped.listView .media-card .cover .overlay,
.studio-page-unscoped.listView .media-card .cover .overlay{
	position: absolute;
	top: 0px;
	left: 115px;
	z-index: 5;
	background: none;
	width: 550px;
	padding: 10px;
	color: rgb(var(--color-text));
}
.search-page-unscoped.listView .media-card .cover .overlay .studio{
	margin-top: 15px;
}
.search-page-unscoped.listView .media-card .data,
.studio-page-unscoped.listView .media-card .data{
	margin-left: -70px;
	height: 195px;
}
.search-page-unscoped.listView .media-card .data .list-edit,
.studio-page-unscoped.listView .media-card .data .list-edit{
	display: inline;
	width: 115px;
	height: 30px;
	position: absolute;
	left: -115px;
	top: 165px;
}
.search-page-unscoped.listView .media-card .data .genres,
.studio-page-unscoped.listView .media-card .data .genres{
	display: inline;
}
.search-page-unscoped.listView .media-card .data .extra,
.studio-page-unscoped.listView .media-card .data .extra{
	padding-left: 50%;
}
.search-page-unscoped.listView .media-card .data .description,
.studio-page-unscoped.listView .media-card .data .description{
	height: 102px;
}
.search-page-unscoped.listView .media-card .data .airing-countdown,
.search-page-unscoped.compactListView .media-card .data .airing-countdown,
.studio-page-unscoped.listView .media-card .data .airing-countdown,
.studio-page-unscoped.compactListView .media-card .data .airing-countdown{
	text-align: right;
}
.search-page-unscoped.listView .media-card .data .list-edit .action,
.studio-page-unscoped.listView .media-card .data .list-edit .action{
	padding: 5px;
}
.search-page-unscoped.compactListView .media .media-card,
.studio-page-unscoped.compactListView .media-card{
	margin-bottom: 5px;
	height: 30px;
	width: 95%;
}
.search-page-unscoped.compactListView .media-card .data .description,
.studio-page-unscoped.compactListView .media-card .data .description{
	display: none;
}
.search-page-unscoped.compactListView .media-card .cover,
.studio-page-unscoped.compactListView .media-card .cover{
	background: none!important;
	height: 30px;
}
.search-page-unscoped.compactListView .media-card .cover .list-status,
.studio-page-unscoped.compactListView .media-card .cover .list-status{
	transform: translate(-3px,-3px);
	z-index: 51;
	box-shadow: none;
}
.search-page-unscoped.compactListView .media-card .cover .overlay,
.studio-page-unscoped.compactListView .media-card .cover .overlay{
	z-index: 49;
	background: none;
	position: absolute;
	top: 0px;
	left: 20px;
	padding: 6px;
	width: 600px;
	color: rgb(var(--color-text));
}
.search-page-unscoped.compactListView .media-card .cover .overlay .studio{
	display: none;
}
.search-page-unscoped.compactListView .media-card .data,
.studio-page-unscoped.compactListView .media-card .data{
	margin-left: -185px;
	position: relative;
}
.search-page-unscoped.compactListView .media-card .data .list-edit,
.studio-page-unscoped.compactListView .media-card .data .list-edit{
	position: absolute;
	top: 0px;
	width: 115px;
	left: calc(100% - 115px);
	background: none;
}
.search-page-unscoped.compactListView .media-card:hover .data .airing-countdown,
.studio-page-unscoped.compactListView .media-card:hover .data .airing-countdown{
	display: none;
}
.search-page-unscoped.compactListView .media-card .data .extra,
.studio-page-unscoped.compactListView .media-card .data .extra{
	position: absolute;
	left: calc(100% - 550px);
	top: 0px;
	background: none;
	width: 150px;
}
.search-page-unscoped.compactListView .media-card .data .genres,
.studio-page-unscoped.compactListView .media-card .data .genres{
	position: absolute;
	width: 200px;
	top: 6px;
	background: none;
	left: calc(100% - 350px);
	display: inline;
	padding: 0px;
	height: 30px;
	line-height: 10px;
}
.search-page-unscoped.compactListView .media-card .data .genres span,
.studio-page-unscoped.compactListView .media-card .data .genres span{
	vertical-align: middle;
}
.search-page-unscoped.compactListView .data::before,
.studio-page-unscoped.compactListView .data::before{
	font-size: 50%;
}
.search-page-unscoped.listView .data::before,
.studio-page-unscoped.listView .data::before{
	font-size: 60%;
}
.search-page-unscoped .hohThemeSwitch{
	width: 130px;
	position: absolute;
	right: 40px;
	top: -2px;
}
.studio-page-unscoped .hohThemeSwitch{
	width: 130px;
	position: absolute;
	top: 60px;
	left: 50%;
}
@media(max-width: 1040px){
	.search-page-unscoped{
		margin-top: 40px !important;
	}
	.search-page-unscoped .hohThemeSwitch{
		right: 55px;
		top: 45px;
	}
	.search-page-unscoped .filter-toggle{
		padding-top: 10px;
		margin-top: 2px;
		margin-left: 0px;
	}
	.search-page-unscoped > .results.media{
		margin-top: 44px;
	}
}
@media(max-width: 850px){
	.search-page-unscoped:not(.cardView) .results.media{
		display: inline-grid;
		grid-column-gap: 15px;
		grid-row-gap: 15px;
	}
}
@media(max-width: 760px){
	.search-page-unscoped.compactListView .media-card .data .genres{
		display: none;
	}
	.search-page-unscoped.compactListView .media-card .data .extra{
		left: calc(100% - 280px);
		width: 120px;
	}
	.search-page-unscoped.listView .media-card .data{
		margin-left: -45px;
	}
}
@media(max-width: 550px){
	.search-page-unscoped.compactListView .media-card .data .extra{
		display: none;
	}
}
	`;
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
	`;
}
if(useScripts.CSSbannerShadow){
	moreStyle.textContent += `
.banner .shadow{
	display: none;
}
	`;
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
	`;
}
if(useScripts.CSSgreenManga){
	moreStyle.textContent += `
.review-card:hover .banner[data-src*="/media/manga/"] + .content > .header{
	color: rgb(var(--color-green));
}
.review-card:hover .banner[data-src*="/media/anime/"] + .content > .header{
	color: rgb(var(--color-blue));
}
.user .review-card:hover .banner[data-src*="/media/anime/"] + .content > .header{
	color: rgb(61,180,242);
}
.activity-markdown a[href^="https://anilist.co/manga/"]{
	color: rgba(var(--color-green));
}
.activity-manga_list > div > div > div > div > .title{
	color: rgba(var(--color-green))!important;
}
.media .relations .cover[href^="/manga/"] + div div{
	color: rgba(var(--color-green));
}
.media .relations .cover[href^="/anime/"] + div div{
	color: rgba(var(--color-blue));
}
.media .relations .cover[href^="/manga/"]{
	border-bottom-style: solid;
	border-bottom-color: rgba(var(--color-green));
	border-bottom-width: 2px;
}
.character-page-unscoped .media .content:hover[href^="/manga/"] .name,
.media-roles .media .content:hover[href^="/manga/"] .name{
	color: rgb(var(--color-green));
}
.media .relations.small .cover[href^="/manga/"]::after{
	position:absolute;
	left:1px;
	bottom:3px;
	content:"";
	border-style: solid;
	border-color: rgba(var(--color-green));
	border-width: 2px;
}
.media .relations .cover[href^="/anime/"]{
	border-bottom-style: solid;
	border-bottom-color: rgba(var(--color-blue));
	border-bottom-width: 2px;
}
.media .relations .cover div.image-text{
	margin-bottom: 2px!important;
	border-radius: 0px!important;
	padding-bottom: 8px!important;
	padding-top: 8px!important;
	font-weight: 500!important;
}
.media-embed[data-media-type="manga"] .title{
	color: rgba(var(--color-green));
}
.media-manga .actions .list{
	background: rgba(var(--color-green));
}
.media-manga .sidebar .review.button{
	background: rgba(var(--color-green));
}
.media-manga .container .content .nav .link{
	color: rgba(var(--color-green));
}
.home .recent-reviews + div > div + div + div h2.section-header.link:hover{
	color: rgba(var(--color-green));
}
.home .recent-reviews + div .cover[href^="/manga/"] + .content .info-header{
	color: rgba(var(--color-green));
}
	`;
}
if(useScripts.CSSexpandFeedFilters && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
.home .activity-feed-wrap .section-header .el-dropdown-menu,
.user .activity-feed-wrap .section-header .el-dropdown-menu{
	background: none;
	position: static;
	display: inline !important;
	margin-right: 15px;
	box-shadow: none !important;
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item{
	font-weight: normal;
	color: rgb(var(--color-text-lighter));
	margin-left: -2px !important;
	display: inline;
	font-size: 1.2rem;
	padding: 4px 15px 5px 15px;
	border-radius: 3px;
	transition: .2s;
	background: none;
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item.active,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item.active{
	background: none!important;
	color: rgb(var(--color-blue));
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item:hover,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item:hover{
	background: none!important;
	color: rgb(var(--color-blue));
}
.home .feed-select .feed-filter,
.user .section-header > .el-dropdown > .el-dropdown-selfdefine{
	display: none;
}
	`;
}
if(useScripts.showRecVotes){
	moreStyle.textContent += `
.recommendation-card .rating-wrap{
	opacity: 1;
}
`
}
if(useScripts.CSSverticalNav && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
.media .sidebar .tags .add-icon{
	opacity: 1;
}
#hohListPreview .content{
	width: 240px;
}
.user .overview > .section:first-child{
	max-width: 555px;
}
.user .overview{
 	grid-template-columns: calc(25% + 200px) 55% !important;;
}
.media .activity-entry .cover{
	display: none;
}
.media .activity-entry .embed .cover{
	display: inline;
}
.media .activity-entry .details{
	min-width: 500px;
	margin-left: 30px;
}
.media .activity-entry .details > .avatar{
	position: absolute;
	top: 0px;
	left: 5px;
}
.media .activity-entry .list{
	min-height: 55px !important;
}
.media .activity-entry .replies .count,
.media .activity-entry .replies .count + svg{
	color: rgb(var(--color-red));
}
#app .tooltip.animate-position{
	transition: opacity .26s ease-in-out,transform 0s ease-in-out;
}
.studio .hohThemeSwitch{
	top: 30px;
}
.stats-wrap .stat-cards{
	grid-gap: 20px;
	grid-template-columns: repeat(auto-fill, 300px);
}
.stats-wrap .stat-cards.has-images{
	grid-gap: 20px;
	grid-template-columns: repeat(auto-fill, 600px);
}
.stats-wrap .stat-cards .stat-card{
	box-shadow: none;
	padding: 10px;
	padding-bottom: 0px;
}
.stats-wrap .stat-cards .stat-card > .title{
	font-size: 2rem;
}
.stats-wrap .stat-cards .stat-card.has-image > .wrap > .image{
	margin-top: -45px;
	height: 100px;
	width: 70px;
}
.stats-wrap .highlight .value{
	font-size: 2rem;
}
.stats-wrap .highlight .circle{
	box-shadow: none;
	height: 35px;
	width: 35px;
}
.stats-wrap .highlights{
	grid-gap: 30px 0px;
	margin-left: 1%;
	width: 98%;
	margin-top: 0px;
	grid-template-columns: repeat(6,1fr);	
	margin-bottom: 20px;
}
.stats-wrap .stat-cards .stat-card.has-image > .title{
	margin-left: 75px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap{
	padding: 5px 15px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relations{
	transition: transform .1s ease-in-out;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relation-card{
	margin-right: 5px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relation-card .image{
	width: 70px;
	height: 100px;
}
.stats-wrap .stat-cards .stat-card .count.circle{
	top: 12px;
	right: 12px;
	height: 20px;
	width: 20px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .detail .value{
	font-size: 1.4rem;
	font-weight: 700;
	color: rgb(var(--color-blue));
}
.stats-wrap .stat-cards .stat-card .inner-wrap .detail .label{
	font-size: 1.1rem;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button{
	box-shadow: none;
	top: 40px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button.previous{
	left: 18px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button.next{
	right: 18px;
}
.user .desktop .genre-overview.content-wrap{
	font-size: 1.3rem;
}
.forum-thread .comment-wrap{
	border-left: solid!important;
	margin-bottom: 10px!important;
}
.forum-thread .comment-wrap.odd{
	border-left-style: double!important;
}
.forum-thread .comment-wrap.hohCommentSelected{
	border-left-color: rgb(var(--color-blue))!important;
}
.forum-thread .comment-wrap.hohCommentHidden{
	border-left-style: dotted!important;
}
.forum-feed .overview-header{
	color: rgba(var(--color-blue))!important;
	font-size: 2rem!important;
}
.forum-feed .thread-card{
	margin-bottom: 10px!important;
}
.forum-feed .filter-group > a{
	margin-bottom: 2px!important;
}
.activity-entry > .wrap > .actions{
	bottom: 0px!important;
}
.page-content > .container,
.notifications-feed,
.page-content > .studio{
	margin-top: 25px !important;
}
.logo{
	margin-left: -60px!important;
/*the compact layout uses more of the space to the side, so we line up the logo to the left*/
}
.footer{
	margin-top: 0px !important;
/*less space wasted over the footer*/
}
.hohUserRow td,
.hohUserRow th{
	top: 44px;
}
.container{
	padding-left: 10px;
	padding-right: 0px;
}
.hide{
	top: 0px!important;
/*stop that top bar from jumping all over the place*/
}
.notification{
	margin-bottom: 10px!important;
}
.media-embed + br{
	display: none;
}
/*Dropdown menus are site theme based*/
.quick-search .el-select .el-input .el-input__inner,
.quick-search .el-select .el-input.is-focus .el-input__inner,
.el-select-dropdown,
.el-dropdown-menu,
.el-dropdown-menu__item--divided::before{
	background: rgba(var(--color-foreground));
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover{
	background: rgba(159, 173, 189, .2);
}
.el-dropdown-menu__item--divided{
	border-color: rgba(var(--color-background));
}
.el-select-group__wrap:not(:last-of-type)::after{
	background: rgba(var(--color-foreground));
}
.el-popper[x-placement^="bottom"] .popper__arrow,
.el-popper[x-placement^="bottom"] .popper__arrow::after{
	border-bottom-color: rgba(var(--color-foreground));
}
.el-popper[x-placement^="top"] .popper__arrow,
.el-popper[x-placement^="top"] .popper__arrow::after{
	border-top-color: rgba(var(--color-foreground));
}
.wrap .link.router-link-exact-active.router-link-active,
.nav .link.router-link-exact-active.router-link-active{
	background: rgba(var(--color-foreground-grey));
	color: rgba(var(--color-blue));
}
/*--------------VERTICAL-NAV----------------*/
/*modified code from Kuwabara: https://userstyles.org/styles/161017/my-little-anilist-theme-can-not-be-this-cute*/
.hohDismiss{
	transform: translate(17.5px,-40px);
	margin-left: 0px!important;
}
#app > .nav {
	border-top: none !important;
}
#app div#nav.nav{
	width: 65px;
	height: 100%!important;
	position: fixed!important;
	top: 0!important;
	left: 0!important;
	transition: none!important;
}
div#nav.transparent{
	background: rgba(var(--color-nav))!important;
}
.nav .wrap .links{
	font-size: 1rem;
	height: 355px!important;
	margin-left: 0px;
	padding-left: 0px;
	width: 65px;
	min-width: 65px !important;
	flex-direction: column;
}
#app #nav.nav .wrap .links a.link{
	width: 65px;
	padding: 5px 0px;
	margin-bottom: 10px;
	text-align: center;
	height: unset!important;
	transition: 0.3s;
	padding-left: 0px!important;
}
div#nav.nav .link.router-link-exact-active.router-link-active,
#nav > div > div.links > a:hover{
	border-bottom-width: 0px!important;
}
.nav .wrap .links .link:hover{
	background: rgba(var(--color-blue),0.1);
}
.nav .wrap .links .link::before{
	display: block;
	content: "";
	height: 24px!important;
	width: 65px!important;
	background-size: 24px;
	margin-left: 0!important;
	margin-bottom: 3px!important;
	background-repeat: no-repeat;
	background-position: center;
	filter: grayscale(100%) brightness(1.4);
}
.nav .link[href*="/user/"]:hover::before,
.nav .link[href^="/forum/"]:hover::before,
.nav .link[href="/login"]::before,
.nav .link[href="/social"]::before,
.nav .link[href^="/search/"]:hover::before,
.nav .link[href^="/home"]:hover::before,
.site-theme-contrast .nav .link.router-link-active::before{
	filter: grayscale(0%);
}
.logo-full{
	display: none;
}
.nav .link[href="/home"]::before,
.nav .link[href="/login"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="m12 3l-10 9h3v8h5v-6h4v6h5v-8h3z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href^="/user/"]::before,
.nav .link[href="/social"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2zM12 6a3 3 0 0 0 0 6a3 3 0 0 0 0 -6zM6 18h12v-1a6 3 0 0 0 -12 0z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href*="/animelist"]::before,
.nav .link[href*="/mangalist"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M4 5h4v4h-4zM4 10h4v4h-4zM4 15h4v4h-4zM9 5h12v4h-12zM9 10h12v4h-12zM9 15h12v4h-12z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href^="/search/"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M4 5h5v13h-5zM10 5h11v6h-11zM10 12h5v6h-5zM16 12h5v6h-5z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href*="/forum"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M19 6h2a1 1 0 0 1 1 1v15l-4 -4h-11a1 1 0 0 1 -1 -1v-2h13zM3 2a1 1 0 0 0 -1 1v14l4 -4h10a1 1 0 0 0 1 -1v-9a1 1 0 0 0 -1 -1z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href="/signup"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><g fill="rgb(61,180,242)"><circle cx="15" cy="8" r="3"/><path d="M9 18h12v-1a6 3 0 0 0 -12 0z"/><text x="2" y="14" font-weight="bold" font-size="70%">+</text></g></svg>');
}
.landing .link{
	margin-left: unset!important;
}
#nav > div.wrap.guest > div.links a.link.login,
#nav > div.wrap.guest > div.links a.link.signup{
	padding: 5px 0px!important;
}
div#nav.transparent{
	background: #1f2631!important;
}
#app{
	margin-top: 0;
	padding-left: 65px;
}
.nav .user{
	position: fixed;
	top: 0;
	display: grid;
	grid-gap: 40px;
	width: 65px;
	grid-template-rows: 50px 20px;
}	
.search .dropdown.el-dropdown{
	font-size: 10px;
}
.search .el-dropdown-link svg{
	width: 65px;
	height: 23px;
	padding: 5px 0;
	background: rgba(0, 0, 0, 0.2);
}
.nav .search{
	width: 65px;
	margin: 0;
	text-align: center;
	position: fixed;
	top: 56px;
}
.quick-search-results{
	z-index: 999!important;
	top: 136px!important;
}
.user .avatar + .chevron{
	opacity: 0!important;
}
.hide{
	top:0px!important;
}
@media(max-width: 1040px){
	#app{
		padding-left: 0px;
	}
	.container{
		padding-left: 20px;
		padding-right: 20px;
	}
	.footer > .container{
		position: relative;
	}
	.hohColourPicker{
		top: 0px;
	}
	.hohDismiss{
		display: none;
	}
	.hohNotificationCake{
		margin-left: -9px;
	}
}
/*-------------------*/
::selection{
	background: rgba(var(--color-blue),0.4);
}
::-webkit-selection{
	background: rgba(var(--color-blue),0.4);
}
::-moz-selection{
	background: rgba(var(--color-blue),0.4);
}
::-webkit-scrollbar{
	width: 7px;
	height: 7px;
}
::-webkit-scrollbar-thumb{
	background: #4e4e4e!important;
}
#app{
	overflow:unset;
}
.user .header-wrap{
	position: sticky;
	top: -332px;
	z-index: 100;
}
.list-stats{
	margin-bottom:0px!important;
}
.activity-feed-wrap{
	margin-top:25px;
}
.logo{
	position: absolute;
	margin-bottom: -500px;
	display:none!important;
	margin-left: 0px !important;
}
/*home stuff*/

.reply .header a.name[href="/user/Abyss/"]::after{
	content: "Prima Undine";
	margin-left:10px;
	padding:3px;
	border-radius:2px;
	animation-duration: 20s;
	animation-iteration-count: infinite;
	animation-name: rainbow;
	animation-timing-function: ease-in-out;
	color: rgba(var(--color-white));
}
.reply .header a.name[href="/user/Taluun/"]::after{
	content: "Best Friend";
	margin-left:10px;
	padding:3px;
	border-radius:2px;
	animation-duration: 20s;
	animation-iteration-count: infinite;
	animation-name: rainbow;
	animation-timing-function: ease-in-out;
	color: rgba(var(--color-white));
}
.details > .donator-badge{
	left:105px!important;
	padding:2px!important;
	top: 100%!important;
	-ms-transform: translate(0px, -34px);
	-webkit-transform: translate(0px, -34px);
	transform: translate(0px, -34px);
}
.activity-text > div > div > div > .donator-badge{
	position:relative!important;
	display:inline-block!important;
	left:0px!important;
	top:0px!important;
	-ms-transform: translate(0px, 0px);
	-webkit-transform: translate(0px, 0px);
	transform: translate(0px, 0px);
}
.activity-replies{
	margin-top:5px!important;
	margin-left:30px!important;
	margin-right:0px!important;
}
.page-content > .container > .activity-entry .activity-replies{
	margin-top: 15px !important;
}
.activity-entry{
	margin-bottom: 10px!important;
}
.list-preview{
	grid-gap: 10px!important;
	padding:0px!important;
	background: rgb(0,0,0,0)!important;
}
.home{
	grid-column-gap: 30px!important;
	margin-top: 20px!important;
	grid-template-columns: auto 470px!important;
}
.activity-feed .reply{
	padding: 8px!important;
	margin-bottom: 5px!important;
}
.list .details{
	padding-left:10px!important;
	padding-top:5px!important;
	padding: 10px 16px!important;
	padding-bottom: 7px !important;
}
.search{
	margin-top:0px!important;
}
.emoji-spinner{
	display:none!important;
}
.wrap{
	border-radius: 2px!important;
}
.name{
	margin-left: 0px!important;
}
.activity-text > div > div > div > .name,
.activity-message > div > div > div > .name{
	margin-left: 12px!important;
}
.button{
	margin-right: 5px!important;
}
.actions{
	margin-bottom: 5px!important;
}
.status{
	display: inline-block!important;
}
.avatar{
	display: block!important;
}

/*https://anilist.co/activity/29333544*/
.activity-entry .header a:nth-child(1){
	display: inline-block!important;
}
.wrap > .list{
	min-height: 80px!important;
	grid-template-columns: 60px auto!important;
}
.popper__arrow{
	display: none!important;
}
.media-preview{
	grid-gap: 10px!important;
	padding: 0px!important;
	background: rgb(0,0,0,0)!important;
}
.media-preview-card{
	display: inline-grid!important;
}
.replies > .count{
	color: rgba(var(--color-blue));
}
.action.likes{
	color: unset;
}
.like-wrap > .button:hover{
	color: rgba(var(--color-red));
}
.replies > svg:nth-child(2){
	color: rgba(var(--color-blue));
}
.actions{
	cursor: default;
}
.activity-manga_list > div > div > div > div > .title{
	color: rgba(var(--color-green))!important;
}
.markdown-editor > [title="Image"],
.markdown-editor > [title="Youtube Video"],
.markdown-editor > [title="WebM Video"]{
	color: rgba(var(--color-red));
}
.markdown-editor > div > svg{
	min-width: 1em!important;
}
.feed-select .toggle > div.active{
	color: rgba(var(--color-blue))!important;
}
.home .details .status:first-letter,
.social .details .status:first-letter,
.activity-entry .details .status:first-letter{
	text-transform: lowercase;
}
.activity-edit .markdown-editor,
.activity-edit .input{
	margin-bottom: 10px!important;
}
.activity-edit .actions{
	margin-bottom: 25px!important;
}
.page-content .container .home.full-width{
	grid-template-columns: unset !important;
}
.activity-text .text {
	border-left: solid 5px rgba(var(--color-blue));
}
.section-header{
	padding-left:0px!important;
}
.cover[href="/anime/440/Shoujo-Kakumei-Utena/"] + .details{
	border-color: #eb609e;
	border-width: 4px;
	border-style: solid;
	border-left-width: 0px;
}
.sticky .avatar, .sticky .body-preview,
.sticky .categories, .sticky .name{
	display: none!important;
}
.search > .filter,
.search > .preview{
	margin-top: 20px;
}
.home .media-preview-card:nth-child(5n+3) .content{
	border-radius: 3px 0 0 3px;
	left: auto !important;
	right: 100%;
	text-align: right;
}
.home .media-preview-card:nth-child(5n+3) .content .info{
	right: 12px;
}
.link:hover .hohSubMenu{
	color: rgb(var(--color-text-bright));
}
.hohSubMenu{
	position: absolute;
	left: 64px;
	top: 0px;
	display: none;
	background: #1f2631;
	border-top-right-radius: 3px;
	border-bottom-right-radius: 3px;
	padding: 2px 0px;
}
.hohSubMenuLink{
	display: block;
	margin-left: 3px;
	padding: 4px;
	font-size: 130%;
	text-align: left;
	color: rgb(var(--color-text-bright));
}
@media(max-width: 1540px){
	.container{
		max-width: 1200px;
	}
}
.media .activity-feed .donator-badge{
	transform: translate(-70px,-25px);
}
.user .list.small .avatar{
	display: none!important;
}
.el-slider[aria-valuemin="1950"] .el-slider__runway::after{
	content: "";
	width: 101%;
	margin-left: -0.3%;
	height: 20px;
	display: block;
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="20" viewBox="0 0 200 20"><g fill="rgb(61,180,242)" stroke="rgb(61,180,242)"><line stroke-width="27" x1="0" y1="20" x2="200" y2="20" stroke-dasharray="1 27.4"/><text font-size="8" x="145" y="19">00</text><text font-size="6" x="88" y="19">LAMU</text><text font-size="6" x="31" y="19">ATOM</text></g></svg>');
	background-size: cover;
}
.user .el-slider[aria-valuemin="1950"] .el-slider__runway::after{
	background-size: contain;
}
	`;
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
	margin-left:-4px;
	content: ".0";
}
	`;
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
	`;
}
if(useScripts.CSSsmileyScore){
	moreStyle.textContent += `
.fa-frown{
	color: red;
}

.fa-smile{
	color: green;
}
	`;
}
if(useScripts.limitProgress8){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+9){
	display:none!important;
}
	`;
}
else if(useScripts.limitProgress10){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+11){
	display:none!important;
}
	`;
}
if(parseInt(useScripts.forumPreviewNumber) === 0){
	moreStyle.textContent += `
.home .recent-threads{
	display: none!important;
}
	`;
}
if(useScripts.CSSmobileTags){
	moreStyle.textContent += `
@media(max-width: 760px){
	.media .sidebar .tags{
		display: inline;
	}
	.media .sidebar .tags .tag{
		display: inline-block;
		margin-right: 2px;
	}
	.media .sidebar .tags .tag .rank{
		display: inline;
	}
	.media .sidebar .tags .tag .vote-dropdown .el-dropdown-link{
		display: inline;
	}
	.media .sidebar .tags .add-icon{
		opacity: 1;
	}
}
	`;
}
if(useScripts.SFWmode){
	moreStyle.textContent += `
.forum-thread .no-comments::after{
	content: "No replies yet";
	visibility: visible;
	margin-left: -250px;
}
.forum-thread .no-comments{
	visibility: hidden;
}
.list-preview .cover,
.favourites .cover{
	background-image: none!important;
}
.logo{
	display: none!important;
}
.user .banner,
.media .banner{
	background-image: none!important;
	height: 200px;
}
.review-card .banner{
	display: none;
}
.home .review-card,.home .review-card .content{
	min-height: 120px;
}
.donator-badge{
	animation-name: none!important;
	display: none;
}
.list-editor .header,
.review .banner{
	background-image: none !important;
}
.list-editor .cover{
	display: none;
}
.emoji-spinner{
	display:none!important;
}
.avatar[style*=".gif"]{
	background-image: none!important;
}
img[src*=".gif"],
video,
.youtube{
	filter: contrast(0);
}
img[src*=".gif"]:hover,
video:hover,
.youtube:hover{
	filter: contrast(1);
}
.activity-entry .cover{
	filter: contrast(0.1) brightness(0.5);
}
.activity-entry .cover:hover{
	filter: none;
}
.activity-markdown img{
	max-width: 30%;
}
.recent-reviews + div{
	display: none;
}
.favourite.studio::after{
	background-image: none!important;
}
.hohDownload{
	display: none;
}
.history-day.lv-1{
	background: rgba(var(--color-green),.2)!important;
}
.history-day.lv-3{
	background: rgba(var(--color-green),.5)!important;
}
.history-day.lv-5{
	background: rgba(var(--color-green),.9)!important;
}
.history-day.lv-7{
	background: rgba(var(--color-green))!important;
}
.history-day.lv-9{
	background: rgba(var(--color-green))!important;
}
.percentage-bar{
	display: none!important;
}
.medialist.compact .cover .image,
.medialist.table .cover .image{
	opacity: 0;
}
.hohCencor .header img.cover,
.hohCencor .relations .cover,
.hohCencor .character .cover{
	filter: contrast(0);
}
.hohCencor .header img.cover:hover,
.hohCencor .relations .cover:hover,
.hohCencor .character .cover:hover{
	filter: contrast(1);
}
.categories > span{
	position: relative;
}
.category[href="/forum/recent?category=1"],
.category[href="/forum/recent?category=1"]:hover{
	color: rgb(78, 163, 230);
}
.category[href="/forum/recent?category=1"]:hover::after{
	color: rgba(26,27,28,.6);
}
.category[href="/forum/recent?category=1"]::after{
	content: "View";
	color: #fff;
	left: 20px;
	position: absolute;
}
.category[href="/forum/recent?category=2"],
.category[href="/forum/recent?category=2"]:hover{
	color: rgb(76, 175, 80);
}
.category[href="/forum/recent?category=2"]:hover::after{
	color: rgba(26,27,28,.6);
}
.category[href="/forum/recent?category=2"]::after{
	content: "Read";
	color: #fff;
	left: 20px;
	position: absolute;
}
.avatar[style*="/default.png"]{
	background-image: url("https://i.stack.imgur.com/TRuSD.png")!important;
}
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
}`;
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
}
	`;
}
};initCSS();

documentHead.appendChild(moreStyle);
let customStyle = create("style");
let currentUserCSS = "";
customStyle.id = "customCSS-aniscripts-styles";
customStyle.type = "text/css";
documentHead.appendChild(customStyle);

let aliases = new Map();
(
	JSON.parse(
		localStorage.getItem("titleAliases")
	) || []
).concat(
	shortRomaji
).forEach(alias => {
	let matches = alias[0].match(/^\/(anime|manga)\/(\d+)\/$/);
	if(matches){
		aliases.set(parseInt(matches[2]),alias[1])
	}
});

const queryMediaListManga = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	progressVolumes
	repeat
	notes
	startedAt{
		year
		month
		day
	}
	media{
		chapters
		volumes
		format
		title{romaji native english}
		tags{name}
		genres
		meanScore
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryMediaListAnime = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	repeat
	notes
	startedAt{
		year
		month
		day
	}
	media{
		episodes
		duration
		nextAiringEpisode{episode}
		format
		title{romaji native english}
		tags{name}
		genres
		meanScore
		studios{nodes{isAnimationStudio id name}}
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryMediaListStaff = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	media{
		a:staff(sort:ID,page:1){nodes{id name{first last}}}
		b:staff(sort:ID,page:2){nodes{id name{first last}}}
	}
}
`;

const queryMediaListCompat = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			name
			isCustomList
			entries{
				... mediaListEntry
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	progressVolumes
	repeat
	notes
	startedAt{
		year
		month
		day
	}
	media{
		episodes
		chapters
		volumes
		duration
		nextAiringEpisode{episode}
		format
		title{romaji native english}
	}
	scoreRaw: score(format: POINT_100)
}
`;

const queryMediaListNotes = `
query($name: String!, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
				mediaId
				notes
			}
		}
	}
}`;

const queryActivity = `
query($id: Int!){
	Activity(id: $id){
		... on TextActivity{
			id
			userId
			type
			text
			user{
				id
				name
				avatar{large}
			}
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
		... on ListActivity {
			id
			userId
			type
			status
			progress
			user{
				id
				name
				avatar{large}
			}
			media{
				coverImage{large color}
				title{romaji native english}
			}
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
		... on MessageActivity{
			id
			type
			likes{id}
			replies{
				text(asHtml: true)
				user{name}
				likes{name}
				id
			}
		}
	}
}
`;

const queryAuthNotifications = `
query($page: Int,$name: String){
	User(name: $name){unreadNotificationCount}
	Page(page: $page){
		notifications{
			... on AiringNotification{type}
			... on FollowingNotification{type user{name}}
			... on ActivityMessageNotification{type user{name}}
			... on ActivityMentionNotification{type user{name}}
			... on ActivityReplyNotification{type user{name}}
			... on ActivityLikeNotification{type user{name}}
			... on ActivityReplyLikeNotification{type user{name}}
			... on ThreadCommentMentionNotification{type user{name}}
			... on ThreadCommentReplyNotification{type user{name}}
			... on ThreadCommentSubscribedNotification{type user{name}}
			... on ThreadCommentLikeNotification{type user{name}}
			... on ThreadLikeNotification{type user{name}}
		}
	}
}
`;

const titlePicker = function(media){
	if(useScripts.titleLanguage === "NATIVE" && media.title.native){
		return media.title.native
	}
	else if(useScripts.titleLanguage === "ENGLISH" && media.title.english){
		return media.title.english
	}
	if(aliases.has(media.id)){
		return aliases.get(media.id)
	}
	return media.title.romaji
}

const ANILIST_WEIGHT = 41;//weighting center for the weighted score formula

let APIlimit = 90;
let APIcallsUsed = 0;//this is NOT a reliable way to figure out how many more calls we can use, just a way to set some limit
let pending = {};
let APIcounter = setTimeout(function(){
	APIcallsUsed = 0;
},60*1000);//reset counter every minute, as our quota grows back

let handleResponse = function(response){
	APIlimit = response.headers.get("x-ratelimit-limit");
	APIcallsUsed = APIlimit - response.headers.get("x-ratelimit-remaining");
	return response.json().then(function(json){
		return (response.ok ? json : Promise.reject(json))
	})
};
const url = "https://graphql.anilist.co";//Current Anilist API location
const authUrl = "https://anilist.co/api/v2/oauth/authorize?client_id=2751&response_type=token";//1933 = automail

if(!window.MutationObserver){//either the older webkit implementation, or just a dummy object that doesn't throw any errors when used.
	window.MutationObserver = window.WebKitMutationObserver || function(){return {observe:function(){},disconnect:function(){}}}
}

let aniCast = {postMessage: function(){}};//dummy object for Safari
if(window.BroadcastChannel){
	aniCast = new BroadcastChannel("automail");
	aniCast.onmessage = function(message){
		if(message.data.type && message.data.type === "cache"){
			sessionStorage.setItem(message.data.key,message.data.value)
		}
	}
}
else{
	/* Safari is the most common case where BroadcastChannel is not available.
	 * It *should* be available in most other browsers, so if it isn't here's a message to those where it fails
	 * Safari users can't really do anything about it, so there's no need to nag them, hence the window.safari test
	 * If Apple implements it in the future, the code should be updated, but the code doesn't do anything *wrong* then either
	 * it will just not print the warning when BroadcastChannel isn't available
	 */
	if(!window.safari){
		console.warn("BroadcastChannel not available. Automail will not be able to share cached data between tabs")
	}
}
//mandatory: query,variables,callback
//optional: cacheKey, and optionally even then, how long the item is fresh in the cache
function generalAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback){
	if(typeof query === "object"){
		variables = query.variables;
		callback = query.callback;
		cacheKey = query.cacheKey;
		timeFresh = query.timeFresh;
		useLocalStorage = query.useLocalStorage;
		overWrite = query.overWrite;
		oldCallback = query.oldCallback;
		query = query.query;
	}
	if(cacheKey && ((useLocalStorage && window.localStorage) || (!useLocalStorage && window.sessionStorage))){
		let cacheItem = JSON.parse(
			(useLocalStorage ? localStorage.getItem(cacheKey) : sessionStorage.getItem(cacheKey))
		);
		if(cacheItem){
			if(
				(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				) && !overWrite
			){
				callback(cacheItem.data,variables);
				return
			}
			else{
				if(oldCallback){
					oldCallback(cacheItem.data,variables)
				}
				(useLocalStorage ? localStorage.removeItem(cacheKey) : sessionStorage.removeItem(cacheKey))
			}
		}
	}
	let handleData = function(data){
		callback(data,variables);
		if(cacheKey && ((useLocalStorage && window.localStorage) || (!useLocalStorage && window.sessionStorage))){
			let saltedHam = JSON.stringify({
				data: data,
				time: NOW(),
				duration: timeFresh
			});
			if(useLocalStorage){
				localStorage.setItem(cacheKey,saltedHam)
			}
			else{
				try{
					sessionStorage.setItem(cacheKey,saltedHam)
				}
				catch(err){
					console.error("Automail cache is full. Searching for expired items...");
					let purgeCounter = 0;
					Object.keys(sessionStorage).forEach(key => {
						try{
							let item = JSON.parse(sessionStorage.getItem(key));
							if(item.time && (NOW() - item.time > item.duration)){
								sessionStorage.removeItem(key);
								purgeCounter++;
							}
						}
						catch(err){
							/*there may be non-JSON objects in session storage.
							the best way to check for JSON-ness is the JSON parser, so this needs a try wrapper
							*/
						}
					});
					if(purgeCounter){
						console.log("Purged " + purgeCounter + " expired items")
					}
					else{
						Object.keys(sessionStorage).slice(0,10).forEach(
							key => sessionStorage.removeItem(key)
						);
						console.log("Found no expired items. Deleted some at random to free up space.")
					}
					try{
						sessionStorage.setItem(cacheKey,saltedHam)
					}
					catch(err){
						console.error("The Automail cache failed for the key '" + cacheKey + "'. ");
						if(saltedHam.length > 50000){
							console.warn("The cache item is possibly too large (approx. " + saltedHam.length + " bytes)")
						}
						else{
							console.warn("Setting cache item failed. Please report or check your localStorage settings.")
						}
					}
				};
				aniCast.postMessage({type:"cache",key:cacheKey,value:saltedHam});
			}
		}
	};
	let options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			"query": query,
			"variables": variables
		})
	};
	let handleError = function(error){
		if(error.errors && error.errors.some(err => err.status === 404)){//not really an error
			handleData(null);
			return
		};
		console.error(error,variables);
		handleData(null)
	};
	fetch(url,options).then(handleResponse).then(handleData).catch(handleError);
	APIcallsUsed++;
}
/*
rawQueries = [
	{
		query: a graphql query
		variables: variables like a normal API call
		callback: like in a normal API call
		cacheKey: [optional]
		duration: [optional]
	}
	...
]
*/
function queryPacker(rawQueries,possibleCallback){//get a list of query calls, and pack them into one query. The result is then split up again and sent back to each call.
	let queries = rawQueries.filter(function(query){//filter out those that have data in our local cache
		if(query.cacheKey){
			let cacheItem = JSON.parse(sessionStorage.getItem(query.cacheKey));
			if(cacheItem){
				if(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				){
					query.callback(cacheItem.data);
					return false;
				}
				else{
					sessionStorage.removeItem(query.cacheKey);//expired data
				}
			}
		}
		return true
	});
	queries.forEach(function(query){//inline all variables
		query.query = query.query.trim().replace(/^query.*?{/,"").slice(0,-1).trim();
		const enums = ["type"];
		Object.keys(query.variables).forEach(variable => {
			let replacement = query.variables[variable];
			if(!enums.includes(variable) && typeof query.variables[variable] === "string"){
				replacement = "\"" + replacement + "\""
			}
			query.query = query.query.split("$" + variable).join(replacement)
		})
	});
	let enumeratedQueries = queries.map(function(query,index){
		query.getFields = [];
		let internalList = [];
		let partial = "";
		let getField = "";
		let collectGetField = true;
		let left = 0;
		Array.from(query.query).forEach(letter => {
			partial += letter;
			if(letter === "{"){
				left++;
				collectGetField = false
			}
			else if(letter === "("){
				collectGetField = false
			}
			else if(letter === "}"){
				left--;
				if(left === 0){
					internalList.push("a" + index + "a" + internalList.length + ":" + partial.trim());
					query.getFields.push(getField.trim());
					partial = "";
					getField = "";
					collectGetField = true
				}
			}
			else if(collectGetField){
				getField += letter
			}
		});
		return internalList.join();
	});
	let mainQuery = `
query{
	${enumeratedQueries.join("\n")}
}
	`;
	let queryUnpacker = function(data){
		if(!data){
			queries.forEach(
				query => query.callback(null)
			)
		}
		else{
			queries.forEach((query,index) => {
				let returnStructure = {data:{}};
				query.getFields.forEach(
					(field,fieldIndex) => returnStructure.data[field] = data.data["a" + index + "a" + fieldIndex]
				);
				query.callback(returnStructure);
				if(query.cacheKey){
					let cacheStrucuture = {
						data: returnStructure
					}
					if(query.duration){
						cacheStrucuture.time = NOW();
						cacheStrucuture.duration = query.duration;
					}
					sessionStorage.setItem(query.cacheKey,JSON.stringify(cacheStrucuture))
				}
			});
			if(possibleCallback){
				possibleCallback()
			}
		}
	}
	if(queries.length){//hey, they might all have been in cache
		generalAPIcall(mainQuery,{},queryUnpacker)//send our "superquery" to the regular API handler
	}
}

function authAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback){//only use this for queries explicitely requiring auth permissions
	if(!useScripts.accessToken){
		generalAPIcall(query,variables,callback,cacheKey,timeFresh,useLocalStorage,overWrite,oldCallback)
		return
	}
	if(typeof query === "object"){
		variables = query.variables;
		callback = query.callback;
		cacheKey = query.cacheKey;
		timeFresh = query.timeFresh;
		useLocalStorage = query.useLocalStorage;
		overWrite = query.overWrite;
		oldCallback = query.oldCallback;
		query = query.query;
	}
	if(cacheKey){
		let cacheItem = JSON.parse(
			(useLocalStorage ? localStorage.getItem(cacheKey) : sessionStorage.getItem(cacheKey))
		);
		if(cacheItem){
			if(
				(
					!cacheItem.duration
					|| (NOW() < cacheItem.time + cacheItem.duration)
				) && !overWrite
			){
				callback(cacheItem.data,variables);
				return
			}
			else{
				if(oldCallback){
					oldCallback(cacheItem.data,variables)
				}
				(useLocalStorage ? localStorage.removeItem(cacheKey) : sessionStorage.removeItem(cacheKey))
			}
		}
	}
	let handleData = function(data){
		callback(data,variables);
		if(cacheKey){
			let saltedHam = JSON.stringify({
				data: data,
				time: NOW(),
				duration: timeFresh
			});
			if(useLocalStorage){
				localStorage.setItem(cacheKey,saltedHam)
			}
			else{
				sessionStorage.setItem(cacheKey,saltedHam);
				aniCast.postMessage({type:"cache",key:cacheKey,value:saltedHam})
			}
		}
	};
	let options = {
		method: "POST",
		headers: {
			"Authorization": "Bearer " + useScripts.accessToken,
			"Content-Type": "application/json",
			"Accept": "application/json"
		},
		body: JSON.stringify({
			"query": query,
			"variables": variables
		})
	};
	let handleError = function(error){
		console.error(error);
		if(error.errors){
			if(
				error.errors.some(thing => thing.message === "Invalid token")
			){
				useScripts.accessToken = "";
				useScripts.save();
				console.log("access token retracted");
				return
			}
		}
		if(query.includes("mutation")){
			callback(error)
		}
		else{
			handleData(null)
		}
	};
	fetch(url,options).then(handleResponse).then(handleData).catch(handleError);
	APIcallsUsed++
}

function scoreFormatter(score,format,name){
	if(name === "shuurei" && format === "POINT_5"){
		const shuureiSystem = ["",">:(",":/",":)",":D","<3"];
		return `<span class="shuureiScore" title="${score}/5 stars">${shuureiSystem[score]}</span>`
	}
	else if(name === "shuurei" && format === "POINT_10"){
		const shuureiSystem = ["",">:(","Ew","Ugh","Hm","Ok","Nice","Ooh","Wow","Fave",":D"];
		return `<span class="shuureiScore" title="${score}/10">${shuureiSystem[score]}</span>`
	}
	else if(format === "POINT_100"){
		return score + "/100"
	}
	else if(
		format === "POINT_10_DECIMAL"
		|| format === "POINT_10"
	){
		return score + "/10"
	}
	else if(format === "POINT_3"){
		if(score === 3){
			return svgAssets.smile
		}
		else if(score === 2){
			return svgAssets.meh
		}
		else if(score === 1){
			return svgAssets.frown
		}
	}
	else if(format === "POINT_5"){
		return score + svgAssets.star
	}
	else{//future types. Just gambling that they look okay in plain text
		return score
	}
}

function convertScore(score,format){
	if(format === "POINT_100"){
		return score
	}
	else if(
		format === "POINT_10_DECIMAL" ||
		format === "POINT_10"
	){
		return score*10
	}
	else if(format === "POINT_3"){
		if(score === 3){
			return 85
		}
		else if(score === 2){
			return 60
		}
		else if(score === 1){
			return 45
		}
		return 0
	}
	else if(format === "POINT_5"){
		if(score === 0){
			return 0
		};
		return score*20 - 10
	}
}

function saveAs(data,fileName,pureText){
	let link = create("a");
	document.body.appendChild(link);
	let json = pureText ? data : JSON.stringify(data);
	let blob = new Blob([json],{type: "octet/stream"});
	let url = window.URL.createObjectURL(blob);
	link.href = url;
	link.download = fileName || "File from Anilist.co";
	link.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(link);
}

function levDist(s,t){//https://stackoverflow.com/a/11958496/5697837
	// Step 1
	let n = s.length;
	let m = t.length;
	if(!n){
		return m
	}
	if(!m){
		return n
	}
	let d = []; //2d matrix
	for(var i = n; i >= 0; i--) d[i] = [];
	// Step 2
	for(var i = n; i >= 0; i--) d[i][0] = i;
	for(var j = m; j >= 0; j--) d[0][j] = j;
	// Step 3
	for(var i = 1; i <= n; i++){
		let s_i = s.charAt(i - 1);
		// Step 4
		for(var j = 1; j <= m; j++){
			//Check the jagged ld total so far
			if(i === j && d[i][j] > 4){
				return n
			}
			let t_j = t.charAt(j - 1);
			let cost = (s_i === t_j) ? 0 : 1; // Step 5
			//Calculate the minimum
			let mi = d[i - 1][j] + 1;
			let b = d[i][j - 1] + 1;
			let c = d[i - 1][j - 1] + cost;
			if(b < mi){
				mi = b
			}
			if(c < mi){
				mi = c;
			}
			d[i][j] = mi; // Step 6
			//Damerau transposition
			/*if (i > 1 && j > 1 && s_i === t.charAt(j - 2) && s.charAt(i - 2) === t_j) {
				d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
			}*/
		}
	}
	return d[n][m]
}

//Morimasa code https://greasyfork.org/en/scripts/375622-betterfollowinglist
const stats = {
	element: null,
	count: 0,
	scoreSum: 0,
	scoreCount: 0
}

const scoreColors = e => {
	let el = e.querySelector("span") || e.querySelector("svg");
	let light = document.body.classList.contains("site-theme-dark") ? 45 : 38;
	if(!el){
		return null
	}
	el.classList.add("score");
	if(el.nodeName === "svg"){
		// smiley
		if(el.dataset.icon === "meh"){
			el.childNodes[0].setAttribute("fill",`hsl(60, 100%, ${light}%)`)
		};
		return {
			scoreCount: 0.5,//weight those scores lower because of the precision
			scoreSum: ({"smile": 85,"meh": 60,"frown": 35}[el.dataset.icon])*0.5
		}
	}
	else if(el.nodeName === "SPAN"){
		let score = el.innerText.split("/").map(num => parseFloat(num));
		if(score.length === 1){// convert stars, 10 point and 10 point decimal to 100 point
			score = score[0]*20-10
		}
		else{
			if(score[1] === 10){
				score = score[0]*10
			}
			else{
				score = score[0]
			}
		}
		el.style.color = `hsl(${score*1.2}, 100%, ${light}%)`;
		return {
			scoreCount: 1,
			scoreSum: score,
		}
	}
}

const handler = (data,target,idMap) => {
	if(!target){
		return
	}
	data.forEach(e => {
		target[idMap[e.user.id]].style.gridTemplateColumns = "30px 1.3fr .7fr .6fr .2fr .2fr .5fr"; //css is my passion
		const progress = create("div","progress",e.progress);
		if(e.media.chapters || e.media.episodes){
			progress.innerText = `${e.progress}/${e.media.chapters || e.media.episodes}`;
		}
		target[idMap[e.user.id]].insertBefore(progress,target[idMap[e.user.id]].children[2])
		let notesEL = create("span","notes") // notes
		if(e.notes){
			notesEL.innerHTML = svgAssets.notes;
			notesEL.title = e.notes;
		}
		let dateString = [
			e.startedAt.year,
			e.startedAt.month,
			e.startedAt.day
		].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-") + " - " + [
			e.completedAt.year,
			e.completedAt.month,
			e.completedAt.day
		].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-");
		if(
			(e.media.chapters || e.media.episodes) === 1
			&& !e.startedAt.year
			&& e.completedAt.year
		){
			dateString = [
				e.completedAt.year,
				e.completedAt.month,
				e.completedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-");
		}
		if(dateString !== " - "){
			target[idMap[e.user.id]].children[3].title = dateString;
		}
		target[idMap[e.user.id]].insertBefore(
			notesEL,target[idMap[e.user.id]].children[4]
		)
		let rewatchEL = create("span","repeat");
		if(e.repeat){
			rewatchEL.innerHTML = svgAssets.repeat;
			rewatchEL.title = e.repeat;
		}
		target[idMap[e.user.id]].insertBefore(
			rewatchEL,target[idMap[e.user.id]].children[4]
		)
	})
}

const MakeStats = () => {
	if(stats.element){
		stats.element.remove()
	}
	let main = create("h2");
	const createStat = (text, number) => {
		let el = create("span",false,text);
		create("span",false,number,el);
		return el
	}
	let count = createStat("Users: ",stats.count);
	main.append(count);
	let avg = createStat("Avg: ",0);
	avg.style.float = "right";
	main.append(avg);
	const parent = document.querySelector(".following");
	parent.prepend(main);
	stats.element = main
}

function enhanceSocialTab(){
	if(!location.pathname.match(/^\/(anime|manga)\/\d*\/[\w\-]*\/social/)){
		return
	}
	let listOfFollowers = Array.from(document.getElementsByClassName("follow"));
	if(!listOfFollowers.length){
		setTimeout(enhanceSocialTab,100);
		return
	};
	MakeStats();
	let idmap = {};
	listOfFollowers.forEach(function(e,i){
		if(!e.dataset.changed){
			const avatarURL = e.querySelector(".avatar").dataset.src;
			if(!avatarURL || avatarURL === "https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png"){
				return
			}
			const id = avatarURL.split("/").pop().match(/\d+/g)[0];
			idmap[id] = i;
			let change = scoreColors(e);
			if(change){
				stats.scoreCount += change.scoreCount;
				stats.scoreSum += change.scoreSum
			}
			++stats.count;
			e.dataset.changed = true
		}
	})
	if(Object.keys(idmap).length){
		const mediaID = window.location.pathname.split("/")[2];
		generalAPIcall(
			`query($users:[Int],$media:Int){
				Page{
					mediaList(userId_in: $users,mediaId: $media){
						progress notes repeat user{id}
						startedAt{year month day}
						completedAt{year month day}
						media{chapters episodes}
					}
				}
			}`,
			{users: Object.keys(idmap), media: mediaID},
			function(res){
				handler(res.data.Page.mediaList,listOfFollowers,idmap)
			}
		)
		let statsElements = stats.element.querySelectorAll("span > span");
		statsElements[0].innerText = stats.count;
		const avgScore = Math.round(stats.scoreSum/stats.scoreCount || 0);
		if(avgScore){
			statsElements[1].style.color = `hsl(${avgScore*1.2}, 100%, 40%)`;
			statsElements[1].innerText = `${avgScore}%`;
			statsElements[1].title = (stats.scoreSum/stats.scoreCount).toPrecision(4)
		}
		else{
			statsElements[1].parentNode.remove() // no need if no scores
		}
		statsElements[1].onclick = function(){
			statsElements[1].classList.toggle("toggled");
			Array.from(root.querySelectorAll(".follow")).forEach(function(item){
				if(item.querySelector(".score") || !statsElements[1].classList.contains("toggled")){
					item.style.display = "grid"
				}
				else{
					item.style.display = "none"
				}
			})
		}
	}
/*add average score to social tab*/
	let root = listOfFollowers[0].parentNode;
	let distribution = {};
	Object.keys(distributionColours).forEach(
		status => distribution[status] = 0
	);
	listOfFollowers.forEach(function(follower){
		let statusType = follower.querySelector(".status").innerText.toUpperCase();
		if(statusType === "WATCHING" || statusType === "READING"){
			statusType = "CURRENT"
		};
		distribution[statusType]++
	});
	if(
		Object.keys(distributionColours).some(status => distribution[status] > 0)
	){
		let locationForIt = document.getElementById("averageScore");
		let dataList = document.getElementById("socialUsers");
		let statusList = document.getElementById("statusList");
		if(!locationForIt){
			let insertLocation = document.querySelector(".following");
			insertLocation.parentNode.style.marginTop = "5px";
			insertLocation.parentNode.style.position = "relative";
			locationForIt = create("span","#averageScore");
			insertLocation.insertBefore(
				locationForIt,
				insertLocation.children[0]
			);
			statusList = create("span","#statusList",false,false,"position:absolute;right:0px;top:5px;");
			insertLocation.insertBefore(
				statusList,
				insertLocation.children[0]
			);
			dataList = create("datalist","#socialUsers");
			insertLocation.insertBefore(
				dataList,
				insertLocation.children[0]
			)
		}
		locationForIt.nextSibling.style.marginTop = "5px";
		if(dataList.childElementCount < listOfFollowers.length){
			listOfFollowers.slice(dataList.childElementCount).forEach(
				follower => create("option",false,false,dataList)
					.value = follower.children[1].innerText
			)
		}
		removeChildren(statusList)
		Object.keys(distributionColours).sort().forEach(function(status){
			if(distribution[status]){
				let statusSumDot = create("div","hohSumableStatus",distribution[status],statusList,"cursor:pointer;");
				statusSumDot.style.background = distributionColours[status];
				statusSumDot.title = distribution[status] + " " + capitalize(status.toLowerCase());
				if(distribution[status] > 99){
					statusSumDot.style.fontSize = "8px"
				}
				if(distribution[status] > 999){
					statusSumDot.style.fontSize = "6px"
				};
				statusSumDot.onclick = function(){
					Array.from(root.querySelectorAll(".follow .status")).forEach(function(item){
						if(item.innerText.toUpperCase() === status || (["WATCHING","READING"].includes(item.innerText.toUpperCase()) && status === "CURRENT")){
							item.parentNode.style.display = "grid"
						}
						else{
							item.parentNode.style.display = "none"
						}
					})
				}
			}
		});
	};
	let waiter = function(){
		setTimeout(function(){
			if(root.childElementCount !== listOfFollowers.length){
				enhanceSocialTab()
			}
			else{
				waiter()
			}
		},100);
	};waiter()
}

function enhanceSocialTabFeed(){
	let URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w\-]*\/social/);
	if(!URLstuff){
		return
	}
	let feedLocation = document.querySelector(".activity-feed");
	if(!feedLocation){
		setTimeout(enhanceSocialTabFeed,100);
		return
	};
	let hohFeed = create("div","hohSocialFeed");
	feedLocation.insertBefore(hohFeed,feedLocation.children[0]);
	let optionsContainer = create("div",false,false,hohFeed,"position:absolute;top:0px;right:0px;");
	let hasReplies = createCheckbox(optionsContainer);
	create("span",false,"Has Replies",optionsContainer,"margin-right:7px;");
	let isFollowing = createCheckbox(optionsContainer);
	create("span",false,"Following",optionsContainer);
	let feedHeader = create("h2",false,"Recent Activity",hohFeed,"display:none;");
	let feedContent = create("div",false,false,hohFeed,"display:none;");
	let loadMore = create("div","load-more","Load More",hohFeed,"display:none;background: rgb(var(--color-foreground));border-radius: 4px;cursor: pointer;font-size: 1.4rem;margin-top: 20px;padding: 14px;text-align: center;transition: .2s;");
	let query = "";
	let buildFeed = function(page){
		authAPIcall(
			query,
			{
				page: page,
				mediaId: parseInt(URLstuff[2])
			},
			function(data){
				if(data.data.Page.pageInfo.lastPage > page){
					loadMore.style.display = "block";
					loadMore.onclick = function(){
						buildFeed(page + 1);
					}
				}
				else{
					loadMore.style.display = "none";
				}
				const randomData = "data-v-b1fca210";
				data.data.Page.activities.forEach(act => {
					let activityEntry = create("div",["activity-entry","activity-" + URLstuff[1] + "_list"],false,feedContent);activityEntry.setAttribute(randomData,"");
						let wrap = create("div","wrap",false,activityEntry);wrap.setAttribute(randomData,"");
							let list = create("div","list",false,wrap);list.setAttribute(randomData,"");
								let cover = create("a",["cover","router-link-active"],false,list);cover.setAttribute(randomData,"");
								cover.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
								cover.style.backgroundImage = `url("${act.media.coverImage.medium}")`;
								let details = create("div","details",false,list);details.setAttribute(randomData,"");
									let name = create("a","name",act.user.name,details);name.setAttribute(randomData,"");
									name.href = "/user/" + act.user.name;
									details.appendChild(document.createTextNode(" "));
									let status = create("div","status",act.status + (act.progress ? " " + act.progress + " of " : " "),details);status.setAttribute(randomData,"");
										let link = create("a",["title","router-link-active"]," " + act.media.title.userPreferred,status);link.setAttribute(randomData,"")
											link.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
									let avatar = create("a","avatar",false,details);avatar.setAttribute(randomData,"");
									avatar.href = "/user/" + act.user.name;
									avatar.style.backgroundImage = `url("${act.user.avatar.medium}")`;
							let timeWrapper = create("div","time",false,wrap);timeWrapper.setAttribute(randomData,"");
								let action = create("a","action",false,timeWrapper);action.setAttribute(randomData,"");
								action.innerHTML = svgAssets.link;
								action.href = "/activity/" + act.id;
								let time = nativeTimeElement(act.createdAt);timeWrapper.appendChild(time);time.setAttribute(randomData,"");
							let actions = create("div","actions",false,wrap);actions.setAttribute(randomData,"");
								let actionReplies = create("div",["action","replies"],false,actions);actionReplies.setAttribute(randomData,"");
									if(act.replies.length){
										let replyCount = create("span","count",act.replies.length,actionReplies);replyCount.setAttribute(randomData,"");
										actionReplies.appendChild(document.createTextNode(" "));
									};
									actionReplies.innerHTML += svgAssets.reply;
								actions.appendChild(document.createTextNode(" "));
								let actionLikes = create("div",["action","likes"],false,actions);actionLikes.setAttribute(randomData,"");
								const randomData2 = "data-v-977827fa";
									let likeWrap = create("div","like-wrap",false,actionLikes);likeWrap.setAttribute(randomData,"");likeWrap.setAttribute(randomData2,"");
										let likeButton = create("div","button",false,actionLikes);likeButton.setAttribute(randomData2,"");
											let likeCount = create("span","count",act.likes.length || "",likeButton);likeCount.setAttribute(randomData2,"");
											likeButton.appendChild(document.createTextNode(" "));
											likeButton.innerHTML += svgAssets.likeNative;
										likeButton.title = act.likes.map(a => a.name).join("\n");
										if(act.likes.some(like => like.name === whoAmI)){
											likeButton.classList.add("liked")
										};
										likeButton.onclick = function(){
											authAPIcall(
												"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
												{id: act.id},
												function(data2){
													if(!data2){
														authAPIcall(//try again once if it fails
															"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
															{id: act.id},
															function(data3){}
														)
													}
												}
											);
											if(act.likes.some(like => like.name === whoAmI)){
												act.likes.splice(act.likes.findIndex(user => user.name === whoAmI),1);
												likeButton.classList.remove("liked");
												if(act.likes.length > 0){
													likeButton.querySelector(".count").innerText = act.likes.length
												}
												else{
													likeButton.querySelector(".count").innerText = ""
												}
											}
											else{
												act.likes.push({name: whoAmI});
												likeButton.classList.add("liked");
												likeButton.querySelector(".count").innerText = act.likes.length;
											};
											likeButton.title = act.likes.map(a => a.name).join("\n")
										};
						let replyWrap = create("div","reply-wrap",false,activityEntry,"display:none;");replyWrap.setAttribute(randomData,"");
						actionReplies.onclick = function(){
							if(replyWrap.style.display === "none"){
								replyWrap.style.display = "block"
							}
							else{
								replyWrap.style.display = "none"
							}
						};
						const randomDataReplies = "data-v-7ce9ffb8";
						let activityReplies = create("div","activity-replies",false,replyWrap);activityReplies.setAttribute(randomData,"");activityReplies.setAttribute(randomDataReplies,"");
						const rnd = "data-v-0664fa9f";
						act.replies.forEach(rep => {
							let reply = create("div","reply",false,activityReplies);reply.setAttribute(randomDataReplies,"");reply.setAttribute(rnd,"");
								let header = create("div","header",false,reply);header.setAttribute(rnd,"");
									let repAvatar = create("a","avatar",false,header);repAvatar.setAttribute(rnd,"");
									repAvatar.href = "/user/" + rep.user.name;
									repAvatar.style.backgroundImage = `url("${rep.user.avatar.medium}")`;
									header.appendChild(document.createTextNode(" "));
									let repName = create("a","name",rep.user.name,header);repName.setAttribute(rnd,"");
									repName.href = "/user/" + rep.user.name;
									let cornerWrapper = create("div","actions",false,header);cornerWrapper.setAttribute(rnd,"");
										let repActionLikes = create("div",["action","likes"],false,cornerWrapper);repActionLikes.setAttribute(rnd,"");
											const randomDataHate = "data-v-977827fa";
											let repLikeWrap = create("div","like-wrap",false,repActionLikes);repLikeWrap.setAttribute(rnd,"");likeWrap.setAttribute(randomDataHate,"");
												let repLikeButton = create("div","button",false,repActionLikes);likeButton.setAttribute(randomDataHate,"");
													let repLikeCount = create("span","count",rep.likes.length || "",repLikeButton);repLikeCount.setAttribute(randomDataHate,"");
													repLikeButton.appendChild(document.createTextNode(" "));
													repLikeButton.innerHTML += svgAssets.likeNative;
												repLikeButton.title = rep.likes.map(a => a.name).join("\n");
												if(rep.likes.some(like => like.name === whoAmI)){
													repLikeButton.classList.add("liked")
												};
												repLikeButton.onclick = function(){
													authAPIcall(
														"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
														{id: rep.id},
														function(data2){
															if(!data2){
																authAPIcall(//try again once if it fails
																	"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
																	{id: rep.id},
																	function(data3){}
																)
															}
														}
													);
													if(rep.likes.some(like => like.name === whoAmI)){
														rep.likes.splice(rep.likes.findIndex(user => user.name === whoAmI),1);
														repLikeButton.classList.remove("liked");
														repLikeButton.classList.remove("hohILikeThis");
														if(rep.likes.length > 0){
															repLikeButton.querySelector(".count").innerText = rep.likes.length
														}
														else{
															repLikeButton.querySelector(".count").innerText = ""
														}
													}
													else{
														rep.likes.push({name: whoAmI});
														repLikeButton.classList.add("liked");
														repLikeButton.classList.add("hohILikeThis");
														repLikeButton.querySelector(".count").innerText = rep.likes.length;
													};
													repLikeButton.title = rep.likes.map(a => a.name).join("\n")
												};
										let repActionTime = create("div",["action","time"],false,cornerWrapper);repActionTime.setAttribute(rnd,"");
											let repTime = nativeTimeElement(rep.createdAt);repActionTime.appendChild(repTime);repTime.setAttribute(randomData,"");
								let replyMarkdown = create("div","reply-markdown",false,reply);replyMarkdown.setAttribute(rnd,"");
									let markdown = create("div","markdown",false,replyMarkdown);markdown.setAttribute(rnd,"");
									markdown.innerHTML = rep.text;
						});
				})
			}
		);
	};
	hasReplies.oninput = isFollowing.oninput = function(){
		if(hasReplies.checked || isFollowing.checked){
			feedLocation.classList.add("hohReplaceFeed");
			feedContent.style.display = "block";
			feedHeader.style.display = "block";
			removeChildren(feedContent)
			if(hasReplies.checked && isFollowing.checked){
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,hasReplies:true,isFollowing:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			}
			else if(hasReplies.checked){
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,hasReplies:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			}
			else{
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,isFollowing:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			};
			buildFeed(1);
		}
		else{
			feedLocation.classList.remove("hohReplaceFeed");
			feedContent.style.display = "none";
			feedHeader.style.display = "none";
			loadMore.style.display = "none";
		}
	}
}

function enhanceForum(){//purpose: reddit-style comment three collapse button
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)){
		return
	}
	let comments = Array.from(document.getElementsByClassName("comment-wrap"));
	comments.forEach(comment => {
		if(!comment.hasOwnProperty("hohVisited")){
			comment.hohVisited = true;
			let hider = create("span","hohForumHider","[-]");
			hider.onclick = function(){
				let parentComment = hider.parentNode.parentNode;
				if(hider.innerText === "[-]"){
					hider.innerText = "[+]";
					parentComment.children[1].style.display = "none";
					parentComment.parentNode.classList.add("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "none"
					}
				}
				else{
					hider.innerText = "[-]";
					parentComment.children[1].style.display = "block";
					parentComment.parentNode.classList.remove("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "block"
					}
				}
			};
			hider.onmouseenter = function(){
				hider.parentNode.parentNode.parentNode.classList.add("hohCommentSelected")
			}
			hider.onmouseleave = function(){
				hider.parentNode.parentNode.parentNode.classList.remove("hohCommentSelected")
			}
			comment.children[0].children[0].insertBefore(
				hider,
				comment.children[0].children[0].children[0]
			)
		}
	});
	setTimeout(enhanceForum,100)
}

function dubMarker(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
		return
	}
	if(document.getElementById("dubNotice")){
		return
	}
	const variables = {
		id: document.URL.match(/\/anime\/(\d+)\//)[1],
		page: 1,
		language: useScripts.dubMarkerLanguage.toUpperCase()
	};
	const query = `
query($id: Int!, $type: MediaType, $page: Int = 1, $language: StaffLanguage){
	Media(id: $id, type: $type){
		characters(page: $page, sort: [ROLE], role: MAIN){
			edges {
				node{id}
				voiceActors(language: $language){language}
			}
		}
	}
}`;
	let dubCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
			return
		};
		let dubNoticeLocation = document.querySelector(".sidebar");
		if(!dubNoticeLocation){
			setTimeout(function(){
				dubCallback(data)
			},200);
			return
		}
		if(data.data.Media.characters.edges.reduce(
			(actors,a) => actors + a.voiceActors.length,0
		)){//any voice actors for this language?
			if(document.getElementById("dubNotice")){
				return
			}
			let dubNotice = create("p","#dubNotice",useScripts.dubMarkerLanguage + " dub available");
			dubNoticeLocation.insertBefore(dubNotice,dubNoticeLocation.firstChild)
		}
	};
	generalAPIcall(query,variables,dubCallback,"hohDubInfo" + variables.id + variables.language)
}

function addSubTitleInfo(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/.*/);
	if(!URLstuff){
		return
	}
	else if(document.querySelector(".hohExtraBox")){
		document.querySelector(".hohExtraBox").remove()
	};
	let sidebar = document.querySelector(".sidebar");
	if(!sidebar){
		setTimeout(addSubTitleInfo,200);
		return
	};
	let infoNeeded = {};
	Array.from(sidebar.querySelectorAll(".data-set .type")).forEach(pair => {
		if(pair.innerText === "Native"){
			infoNeeded.native = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "Romaji"){
			infoNeeded.romaji = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "English"){
			infoNeeded.english = pair.nextElementSibling.innerText
		}
		else if(pair.innerText === "Format"){
			infoNeeded.format = pair.nextElementSibling.innerText;
			if(infoNeeded.format === "Manga (Chinese)"){
				infoNeeded.format = "Manhua"
			}
			else if(infoNeeded.format === "Manga (Korean)"){
				infoNeeded.format = "Manhwa"
			}
		}
		else if(pair.innerText === "Release Date" || pair.innerText === "Start Date"){
			infoNeeded.year = pair.nextElementSibling.innerText.match(/\d{4}/)[0]
		}
		else if(pair.innerText === "Studios"){
			infoNeeded.studios = pair.nextElementSibling.innerText.split("\n");
			infoNeeded.studiosLinks = Array.from(
				pair.nextElementSibling.querySelectorAll("a")
			).map(a => a.href);
		}
	});
	if(!infoNeeded.romaji){//guaranteed to exist, so a good check for if the sidebar has loaded
		setTimeout(addSubTitleInfo,200);
		return
	}
	let title = document.querySelector(".content > h1:not(#hohAliasHeading)");
	let extraBox = create("div","hohExtraBox");
	title.parentNode.insertBefore(extraBox,title.nextElementSibling);
	let subTitle = create("p","value","",extraBox,"margin:2px;font-style:italic;");
	if(useScripts.titleLanguage === "NATIVE"){
		if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.native){
			subTitle.innerText = infoNeeded.romaji
		}
		else if(infoNeeded.english && infoNeeded.english !== infoNeeded.native){
			subTitle.innerText = infoNeeded.english
		}
	}
	else if(useScripts.titleLanguage === "ENGLISH"){
		if(infoNeeded.native && infoNeeded.native !== infoNeeded.english){
			subTitle.innerText = infoNeeded.native
		}
		else if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.english){
			subTitle.innerText = infoNeeded.romaji
		}
	}
	else{
		if(
			infoNeeded.native
			&& infoNeeded.native.replace(//convert fullwidth to regular before comparing
				/[\uff01-\uff5e]/g,
				ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
			) !== infoNeeded.romaji
		){
			subTitle.innerText = infoNeeded.native
		}
	}
	if(infoNeeded.year){
		create("a","value",infoNeeded.year,extraBox,"margin-right:10px;")
			.href = "/search/" + URLstuff[1] + "\?year=" + infoNeeded.year + "%25"
	}
	if(infoNeeded.format && infoNeeded.format !== "Manga"){
		create("span","value",infoNeeded.format,extraBox,"margin-right:10px;")
	}
	if(infoNeeded.studios){
		let studioBox = create("span","value",false,extraBox);
		infoNeeded.studios.forEach((studio,i) => {
			let studiolink = create("a",false,studio,studioBox);
			studiolink.href = infoNeeded.studiosLinks[i];
			if(i < infoNeeded.studios.length - 1){
				create("span",false,", ",studioBox)
			}
		})
	}
}

function enhanceStaff(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
		return
	}
	if(document.querySelector(".hohFavCount")){
		return
	};
	const variables = {id: document.URL.match(/\/staff\/(\d+)\/?/)[1]};
	const query = "query($id: Int!){Staff(id: $id){favourites}}";
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
			return
		}
		let favCount = document.querySelector(".favourite .count");
		if(favCount){
			favCount.parentNode.onclick = function(){
				if(favCount.parentNode.classList.contains("isFavourite")){
					favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
				}
				else{
					favCount.innerText = parseInt(favCount.innerText) + 1
				}
			};
			if(data.data.Staff.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Staff.favourites + 1
			}
			else{
				favCount.innerText = data.data.Staff.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200)
		}
	};
	generalAPIcall(query,variables,favCallback,"hohStaffFavs" + variables.id,60*60*1000)
}

function replaceStaffRoles(){
	let URLstuff = location.pathname.match(/^\/staff\/(\d+)\/?.*/);
	if(!URLstuff){
		return
	};
	let possibleGarbage = document.getElementById("hoh-media-roles");
	if(possibleGarbage){
		if(possibleGarbage.dataset.staffId === URLstuff[1]){
			return
		}
		else{
			possibleGarbage.remove();
			let possibleFilterBar = document.querySelector(".hohFilterBar");
			if(possibleFilterBar){
				possibleFilterBar.remove()
			}
		}
	};
	let insertParent = document.querySelector(".media-roles");
	let insertParentCharacters = document.querySelector(".character-roles");
	if(!insertParent && !insertParentCharacters){
		setTimeout(replaceStaffRoles,200);
		return;
	};
	let substitution = false;
	if(!insertParent){
		insertParent = create("div",["media-roles","container","substitution"],false,insertParentCharacters.parentNode);
		substitution = true
	}
	else{
		insertParent.classList.add("substitution")
	};
	insertParent.parentNode.classList.add("substitution");
	let hohCharacterRolesBox = create("div","#hoh-character-roles");
	let hohCharacterRolesHeader = create("h4",false,"Character Voice Roles",hohCharacterRolesBox);
	hohCharacterRolesHeader.style.display = "none";
	let hohCharacterRoles = create("div","grid-wrap",false,hohCharacterRolesBox);
	hohCharacterRoles.style.margin = "10px";

	let hohMediaRoles = create("div","#hoh-media-roles");
	hohMediaRoles.dataset.staffId = URLstuff[1];
	let hohMediaRolesAnimeHeader = create("h4",false,"Anime Staff Roles",hohMediaRoles);
	hohMediaRolesAnimeHeader.style.display = "none";
	let hohMediaRolesAnime = create("div","grid-wrap",false,hohMediaRoles);
	hohMediaRolesAnime.style.margin = "10px";

	let hohMediaRolesMangaHeader = create("h4",false,"Manga Staff Roles",hohMediaRoles);
	hohMediaRolesMangaHeader.style.display = "none";
	let hohMediaRolesManga = create("div","grid-wrap",false,hohMediaRoles);
	hohMediaRolesManga.style.margin = "10px";
//sort
	let hohMediaSort = create("div",["container","hohFilterBar"]);
	let sortText = create("span",false,"Sort",hohMediaSort);
	let sortSelect = create("select",false,false,hohMediaSort);
	sortSelect.style.marginLeft = "5px";
	let filterSelect = create("input",false,false,hohMediaSort,"color:rgb(var(--color-text));");
	filterSelect.setAttribute("list","staffRoles");
	filterSelect.placeholder = "Filter by title, role, etc.";
	let filterExplanation = create("abbr",false,"?",hohMediaSort,"margin-left:5px;cursor:pointer;");
	filterExplanation.onclick = function(){
		let scrollableContent = createDisplayBox("min-width:400px;width:700px;");
		scrollableContent.innerText = `
Text in the field will be matched against all titles, roles, genres tags, your status, the media format and the start year. If it matches one of them, the media is displayed.

Regular expressions are permitted for titles.

If you want to limit it to just one filter type, you can do it like "genre:mecha" or "status:watching"
(status filtering only works if you have granted Automail permission to view your list data)

The start year can also be a range like "2000-2005"`
	};
	let dataList = create("datalist",false,false,hohMediaSort);
	dataList.id = "staffRoles";
	let digestStats = create("span",false,false,hohMediaSort,"margin-left:100px;position:relative;");
	let sortOptionAlpha = create("option",false,"Alphabetical",sortSelect);
	sortOptionAlpha.value = "alphabetical";
	let sortOptionChrono = create("option",false,"Chronological",sortSelect);
	sortOptionChrono.value = "chronological";
	let sortOptionPopularity = create("option",false,"Popularity",sortSelect);
	sortOptionPopularity.value = "popularity";
	let sortOptionLength = create("option",false,"Length",sortSelect);
	sortOptionLength.value = "length";
	let sortOptionScore = create("option",false,"Score",sortSelect);
	sortOptionScore.value = "score";
	if(useScripts.accessToken){
		create("option",false,"My Score",sortSelect)
			.value = "myScore"
		create("option",false,"My Progress",sortSelect)
			.value = "myProgress"
	}
	let autocomplete = new Set();
	sortSelect.value = useScripts.staffRoleOrder;
	hohMediaSort.style.marginBottom = "10px";
	hohMediaSort.style.marginTop = "3px";
//end sort
	let initPerformed = false;
	let UIinit = function(){
		initPerformed = true;
		insertParent.parentNode.insertBefore(hohMediaSort,insertParentCharacters);
		insertParent.insertBefore(hohMediaRoles,insertParent.children[0]);
		insertParentCharacters.insertBefore(hohCharacterRolesBox,insertParentCharacters.children[0]);
	};
	let animeRolesList = [];
	let mangaRolesList = [];
	let voiceRolesList = [];
	const animeValueFunction = function(anime){
		if(!anime.myStatus){
			return -1
		}
		let entryDuration = (anime.duration || 1)*(anime.myStatus.progress || 0);//current round
		if(useScripts.noRewatches && anime.myStatus.repeat){
			entryDuration = Math.max(
				1,
				anime.episodes || 0,
				anime.myStatus.progress || 0
			) * (anime.duration || 1);//first round
		}
		else{
			entryDuration += (anime.myStatus.repeat || 0) * Math.max(
				1,
				anime.episodes || 0,
				anime.myStatus.progress || 0
			) * (anime.duration || 1);//repeats
		}
		if(anime.listJSON && anime.listJSON.adjustValue){
			entryDuration = Math.max(0,entryDuration + anime.listJSON.adjustValue*(anime.duration || 1))
		}
		return entryDuration
	}
	const mangaValueFunction = function(manga){
		if(!manga.myStatus){
			return -1
		}
		let chaptersRead = 0;
		let volumesRead = 0;
		if(manga.myStatus.status === "COMPLETED"){//if it's completed, we can make some safe assumptions
			chaptersRead = Math.max(//chapter progress on the current read
				manga.chapters,//in most cases, it has a chapter count
				manga.volumes,//if not, there's at least 1 chapter per volume
				manga.myStatus.progress,//if it doesn't have a volume count either, the current progress is probably not out of date
				manga.myStatus.progressVolumes,//if it doesn't have a chapter progress, count at least 1 chapter per volume
				1//finally, an entry has at least 1 chapter
			);
			volumesRead += Math.max(
				manga.myStatus.progressVolumes,
				manga.volumes
			)
		}
		else{//we may only assume what's on the user's list.
			chaptersRead += Math.max(
				manga.myStatus.progress,
				manga.myStatus.progressVolumes
			);
			volumesRead += manga.myStatus.progressVolumes;
		};
		if(useScripts.noRewatches && (manga.myStatus.repeat || 0)){//if they have a reread, they have at least completed it
			chaptersRead = Math.max(//first round
				manga.chapters,
				manga.volumes,
				manga.myStatus.progress,
				manga.myStatus.progressVolumes,
				1
			);
			volumesRead = Math.max(
				manga.volumes,
				manga.myStatus.progressVolumes
			)
		}
		else{
			chaptersRead += (manga.myStatus.repeat || 0) * Math.max(//chapters from rereads
				manga.chapters,
				manga.volumes,
				manga.myStatus.progress,
				manga.myStatus.progressVolumes,
				1
			);
			volumesRead += (manga.myStatus.repeat || 0) * Math.max(
				manga.volumes,
				manga.myStatus.progressVolumes
			)
		};
		if(manga.listJSON && manga.listJSON.adjustValue){
			chaptersRead = Math.max(0,chaptersRead + manga.listJSON.adjustValue)
		}
		return {
			chapters: chaptersRead,
			volumes: volumesRead
		}
	}
	let listRenderer = function(){
		if(!initPerformed){
			UIinit()
		};
		useScripts.staffRoleOrder = sortSelect.value;
		useScripts.save();
		if(sortSelect.value === "alphabetical"){
			animeRolesList.sort(ALPHABETICAL(a => a.title));
			mangaRolesList.sort(ALPHABETICAL(a => a.title));
			voiceRolesList.sort(ALPHABETICAL(a => a.title))
		}
		else if(sortSelect.value === "chronological"){
			const yearSorter = (a,b) => {
				let aTime = a.startDate;
				let bTime = b.startDate;
				if(!aTime.year){
					aTime = a.endDate
				}
				if(!bTime.year){
					bTime = b.endDate
				}
				if(!aTime.year){
					if(!bTime.year){
						if(b.status === "NOT_YET_RELEASED" && a.status === "NOT_YET_RELEASED"){
							return 0
						}
						else if(a.status === "NOT_YET_RELEASED"){
							return -1
						}
					}
					return 1;
				}
				else if(!bTime.year){
					return -1
				}
				return aTime.year - bTime.year
					|| aTime.month - bTime.month
					|| aTime.day - bTime.day
					|| a.endDate.year - b.endDate.year
					|| a.endDate.month - b.endDate.month
					|| a.endDate.day - b.endDate.day
					|| 0
			};
			animeRolesList.sort(yearSorter);
			mangaRolesList.sort(yearSorter);
			voiceRolesList.sort(yearSorter)
		}
		else if(sortSelect.value === "popularity"){
			const popSorter = (b,a) => a.popularity - b.popularity || a.score - b.score;
			animeRolesList.sort(popSorter);
			mangaRolesList.sort(popSorter);
			voiceRolesList.sort(popSorter)
		}
		else if(sortSelect.value === "score"){
			const scoreSorter = (b,a) => a.score - b.score || a.popularity - b.popularity;
			animeRolesList.sort(scoreSorter);
			mangaRolesList.sort(scoreSorter);
			voiceRolesList.sort(scoreSorter)
		}
		else if(sortSelect.value === "length"){
			animeRolesList.sort(
				(b,a) => a.episodes - b.episodes || a.duration - b.duration || b.title.localeCompare(a.title)
			);
			voiceRolesList.sort(
				(b,a) => a.episodes - b.episodes || a.duration - b.duration || b.title.localeCompare(a.title)
			);
			mangaRolesList.sort(
				(b,a) => a.chapters - b.chapters || a.volumes - b.volumes || b.title.localeCompare(a.title)
			)
		}
		else if(sortSelect.value === "myScore"){
			let scoreSorter = function(b,a){
				let scoreTier = (a.myStatus ? a.myStatus.scoreRaw : 0) - (b.myStatus ? b.myStatus.scoreRaw : 0);
				if(scoreTier !== 0){
					return scoreTier
				}
				let progressTier = (a.myStatus ? a.myStatus.progress : -1) - (b.myStatus ? b.myStatus.progress : -1);
				if(progressTier !== 0){
					return progressTier
				}
				return a.popularity - b.popularity
			}
			animeRolesList.sort(scoreSorter);
			mangaRolesList.sort(scoreSorter);
			voiceRolesList.sort(scoreSorter);
		}
		else if(sortSelect.value === "myProgress"){
			const animeSorter = (b,a) => animeValueFunction(a) - animeValueFunction(b) || b.title.localeCompare(a.title);
			const mangaSorter = (b,a) => {
				const aval = mangaValueFunction(a);
				const bval = mangaValueFunction(b);
				return aval.chapters - bval.chapters || aval.volumes - bval.volumes|| b.title.localeCompare(a.title)
			}
			animeRolesList.sort(animeSorter);
			voiceRolesList.sort(animeSorter);
			mangaRolesList.sort(mangaSorter);
		}
		hohMediaRolesAnimeHeader.style.display = "none";
		hohMediaRolesMangaHeader.style.display = "none";
		hohCharacterRolesHeader.style.display = "none";
		if(animeRolesList.length){
			hohMediaRolesAnimeHeader.style.display = "inline"
		}
		if(mangaRolesList.length){
			hohMediaRolesMangaHeader.style.display = "inline"
		}
		if(voiceRolesList.length){
			hohCharacterRolesHeader.style.display = "inline"
		}
		let createRoleCard = function(media,type){
			let roleCard = create("div",["role-card","view-media"]);
			roleCard.style.position = "relative";
			let mediaA = create("div","media",false,roleCard);
			let cover = create("a","cover",false,mediaA);
			cover.href = "/" + type + "/" + media.id + "/" + safeURL(media.title);
			cover.style.backgroundImage = "url(" + media.image + ")";
			let content = create("a","content",false,mediaA);
			content.href = "/" + type + "/" + media.id + "/" + safeURL(media.title);
			let name = create("div","name",media.title,content);
			let role = create("div","role",media.role.join(", "),content);
			if(media.myStatus){
				let statusDot = create("div",["hohStatusDot","hohStatusDotRight"],false,roleCard);
				statusDot.style.background = distributionColours[media.myStatus.status];
				statusDot.title = media.myStatus.status.toLowerCase();
				if(media.myStatus.status === "CURRENT"){
					statusDot.title += " (" + media.myStatus.progress + ")"
				}
			};
			return roleCard;
		};
		let sumDuration = 0;
		let sumChapters = 0;
		let sumVolumes = 0;
		let sumScores = 0;
		let amount = 0;
		let animeCurrentFlag = false;
		let mangaCurrentFlag = false;
		let distribution = {};
		Object.keys(distributionColours).forEach(
			status => distribution[status] = 0
		);
		removeChildren(hohCharacterRoles)
		Array.from(insertParentCharacters.children).forEach(child => {
			if(child.id !== "hoh-character-roles"){
				child.style.display = "none";
			}
		})
		Array.from(insertParent.children).forEach(child => {
			if(child.id !== "hoh-media-roles"){
				child.style.display = "none"
			}
		})
		const mediaMatcher = {
			"title-romaji": (query,media) => media.titleRomaji && (
				media.titleRomaji.toLowerCase().match(query.toLowerCase())
				|| media.titleRomaji.toLowerCase().includes(query.toLowerCase())
			),
			"title-english": (query,media) => media.titleEnglish && (
				media.titleEnglish.toLowerCase().match(query.toLowerCase())
				|| media.titleEnglish.toLowerCase().includes(query.toLowerCase())
			),
			"title-native": (query,media) => media.titleNative && (
				media.titleNative.toLowerCase().match(query.toLowerCase())
				|| media.titleNative.toLowerCase().includes(query.toLowerCase())
			),
			"format": (query,media) => (media.format || "").replace("_","").toLowerCase().match(
				query.toLowerCase().replace(/\s|-|_/,"")
			),
			"status": (query,media) => media.myStatus && (
				media.myStatus.status.toLowerCase() === query.toLowerCase()
				|| media.myStatus.status === "CURRENT"  && ["reading","watching"].includes(query.toLowerCase())
				|| media.myStatus.status === "PLANNING" && ["plan to watch","plan to read"].includes(query.toLowerCase())
			),
			"year": (query,media) => {
				const rangeMatch = query.trim().match(/^(\d\d\d\d)\s?\-\s?(\d\d\d\d)$/);
				return parseInt(query) === (media.startDate.year || media.endDate.year)
					|| rangeMatch && parseInt(rangeMatch[1]) <= media.startDate.year && parseInt(rangeMatch[2]) >= media.startDate.year
			},
			"genre": (query,media) => media.genres.some(
				genre => genre === query.toLowerCase()
			),
			"tag": (query,media) => media.tags.some(
				tag => tag === query.toLowerCase()
			),
			"role": (query,media) => media.role.some(
				role => role.toLowerCase().match(query.toLowerCase())
			),
			"title": (query,media) => mediaMatcher["title-romaji"](query,media)
				|| mediaMatcher["title-english"](query,media)
				|| mediaMatcher["title-native"](query,media)
		}
		voiceRolesList.forEach(function(anime){
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],anime)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,anime)
					)
					|| anime.character.name.toLowerCase().match(filterSelect.value.toLowerCase())
					|| anime.character.name.toLowerCase().includes(filterSelect.value.toLowerCase())
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(anime,"anime");
				roleCard.classList.add("view-media-character");
				roleCard.classList.remove("view-media");
				let character = create("div","character",false,false,"grid-area: character;grid-template-columns: auto 60px;grid-template-areas: 'content image'");
				let cover = create("a","cover",false,character);
				cover.href = "/character/" + anime.character.id + "/" + safeURL(anime.character.name);
				cover.style.backgroundImage = "url(" + anime.character.image + ")";
				let content = create("a","content",false,character,"text-align: right;");
				content.href = "/character/" + anime.character.id + "/" + safeURL(anime.character.name);
				let name = create("a","name",anime.character.name,content);
				roleCard.insertBefore(character,roleCard.children[0]);
				hohCharacterRoles.appendChild(roleCard);
				if(anime.myStatus){
					distribution[anime.myStatus.status]++;
					if(anime.myStatus.status === "CURRENT"){
						animeCurrentFlag = true
					}
					sumDuration += animeValueFunction(anime);
					if(anime.myStatus.scoreRaw){
						sumScores += anime.myStatus.scoreRaw;
						amount++;
					}
				}
			}
		});
		removeChildren(hohMediaRolesAnime)
		animeRolesList.forEach(anime => {
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],anime)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,anime)
					)
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(anime,"anime");
				hohMediaRolesAnime.appendChild(roleCard);
				if(anime.myStatus){
					distribution[anime.myStatus.status]++;
					if(anime.myStatus.status === "CURRENT"){
						animeCurrentFlag = true
					}
					sumDuration += animeValueFunction(anime);
					if(anime.myStatus.scoreRaw){
						sumScores += anime.myStatus.scoreRaw;
						amount++;
					}
				}
			}
		});
		removeChildren(hohMediaRolesManga)
		mangaRolesList.forEach(manga => {
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],manga)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,manga)
					)
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(manga,"manga");
				hohMediaRolesManga.appendChild(roleCard);
				if(manga.myStatus){
					distribution[manga.myStatus.status]++;
					if(manga.myStatus.status === "CURRENT"){
						mangaCurrentFlag = true
					}
					const mangaValue = mangaValueFunction(manga);
					sumChapters += mangaValue.chapters;
					sumVolumes += mangaValue.volumes;
					if(manga.myStatus.scoreRaw){
						sumScores += manga.myStatus.scoreRaw;
						amount++
					}
				}
			}
		});
		if(sumDuration || sumChapters || sumVolumes || sumScores){
			removeChildren(digestStats)
			if(sumDuration){
				create("span",false,"Hours Watched: ",digestStats);
				create("span",false,(sumDuration/60).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))")
			};
			if(sumChapters){
				create("span",false," Chapters Read: ",digestStats);
				create("span",false,sumChapters,digestStats,"color:rgb(var(--color-blue))")
			};
			if(sumVolumes){
				create("span",false," Volumes Read: ",digestStats);
				create("span",false,sumVolumes,digestStats,"color:rgb(var(--color-blue))")
			};
			if(amount){
				create("span",false," Mean Score: ",digestStats);
				let averageNode = create("span",false,(sumScores/amount).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))");
				if((sumScores/amount) === 10 && userObject.mediaListOptions.scoreFormat === "POINT_10"){//https://anilist.co/activity/49407649
					averageNode.innerText += "/100"
				}
			};
			let statusList = create("span","#statusList",false,digestStats,"position: absolute;top: -2px;margin-left: 20px;width: 300px;");
			Object.keys(distributionColours).sort().forEach(status => {
				if(distribution[status]){
					let statusSumDot = create("div","hohSumableStatus",distribution[status],statusList,"cursor:pointer;");
					statusSumDot.style.background = distributionColours[status];
					let title = capitalize(status.toLowerCase());
					if(status === "CURRENT" && !animeCurrentFlag){
						title = "Reading"
					}
					else if(status === "CURRENT" && !mangaCurrentFlag){
						title = "Watching"
					}
					statusSumDot.title = distribution[status] + " " + title;
					if(distribution[status] > 99){
						statusSumDot.style.fontSize = "8px"
					}
					if(distribution[status] > 999){
						statusSumDot.style.fontSize = "6px"
					}
				}
			})
		};
	};
	sortSelect.oninput = listRenderer;
	filterSelect.oninput = listRenderer;
	let refreshAutocomplete = function(){
		removeChildren(dataList)
		autocomplete.forEach(
			value => create("option",false,false,dataList).value = value
		)
	};
	let animeHandler = function(data){
		if(data.data.Staff.staffMedia.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.staffMedia.pageInfo.lastPage;i++){
				authAPIcall(
					staffQuery,
					{
						page: i,
						type: "ANIME",
						id: URLstuff[1]
					},
					animeHandler
				)
			}
		};
		data.data.Staff.staffMedia.edges.forEach(edge => {
			let anime = {
				role: [edge.staffRole],
				format: edge.node.format,
				title: titlePicker(edge.node),
				titleRomaji: edge.node.title.romaji,
				titleEnglish: edge.node.title.english,
				titleNative: edge.node.title.native,
				image: edge.node.coverImage.large,
				startDate: edge.node.startDate,
				endDate: edge.node.endDate,
				id: edge.node.id,
				episodes: edge.node.episodes,
				popularity: edge.node.popularity,
				duration: edge.node.duration || 1,
				status: edge.node.status,
				score: edge.node.averageScore,
				genres: edge.node.genres.map(genre => genre.toLowerCase()),
				tags: edge.node.tags.map(tag => tag.name.toLowerCase()),
				myStatus: edge.node.mediaListEntry,
				listJSON: edge.node.mediaListEntry ? parseListJSON(edge.node.mediaListEntry.notes) : null
			};
			if(anime.myStatus && anime.myStatus.status === "REPEATING" && anime.myStatus.repeat === 0){
				anime.myStatus.repeat = 1
			}
			autocomplete.add(anime.title);
			autocomplete.add(edge.staffRole);
			animeRolesList.push(anime)
		});
		animeRolesList = removeGroupedDuplicates(
			animeRolesList,
			e => e.id,
			(oldElement,newElement) => {
				newElement.role = newElement.role.concat(oldElement.role)
			}
		);
		refreshAutocomplete();
		listRenderer();
	};
	let mangaHandler = function(data){
		if(data.data.Staff.staffMedia.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.staffMedia.pageInfo.lastPage;i++){
				authAPIcall(
					staffQuery,
					{
						page: i,
						type: "MANGA",
						id: URLstuff[1]
					},
					mangaHandler
				)
			}
		};
		data.data.Staff.staffMedia.edges.forEach(edge => {
			let manga = {
				role: [edge.staffRole],
				format: edge.node.format,
				title: titlePicker(edge.node),
				titleRomaji: edge.node.title.romaji,
				titleEnglish: edge.node.title.english,
				titleNative: edge.node.title.native,
				image: edge.node.coverImage.large,
				startDate: edge.node.startDate,
				endDate: edge.node.endDate,
				id: edge.node.id,
				chapters: edge.node.chapters,
				volumes: edge.node.volumes,
				popularity: edge.node.popularity,
				status: edge.node.status,
				score: edge.node.averageScore,
				genres: edge.node.genres.map(genre => genre.toLowerCase()),
				tags: edge.node.tags.map(tag => tag.name.toLowerCase()),
				myStatus: edge.node.mediaListEntry,
				listJSON: edge.node.mediaListEntry ? parseListJSON(edge.node.mediaListEntry.notes) : null
			};
			if(manga.myStatus && manga.myStatus.status === "REPEATING" && manga.myStatus.repeat === 0){
				manga.myStatus.repeat = 1
			}
			autocomplete.add(manga.title);
			autocomplete.add(edge.staffRole);
			mangaRolesList.push(manga)
		});
		mangaRolesList = removeGroupedDuplicates(
			mangaRolesList,
			e => e.id,
			(oldElement,newElement) => {
				newElement.role = newElement.role.concat(oldElement.role)
			}
		);
		refreshAutocomplete();
		listRenderer()
	};
	let voiceHandler = function(data){
		if(data.data.Staff.characters.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.characters.pageInfo.lastPage;i++){
				authAPIcall(
					staffVoice,
					{
						page: i,
						id: URLstuff[1]
					},
					voiceHandler
				)
			}
		};
		data.data.Staff.characters.edges.forEach(edge => {
			edge.role = capitalize(edge.role.toLowerCase());
			let character = {
				image: edge.node.image.large,
				id: edge.node.id
			}
			if(useScripts.titleLanguage === "NATIVE" && edge.node.name.native){
				character.name = edge.node.name.native
			}
			else{
				character.name = (edge.node.name.first || "") + " " + (edge.node.name.last || "")
			};
			autocomplete.add(edge.role);
			edge.media.forEach(thingy => {
				let anime = {
					role: [edge.role],
					format: thingy.format,
					title: titlePicker(thingy),
					titleRomaji: thingy.title.romaji,
					titleEnglish: thingy.title.english,
					titleNative: thingy.title.native,
					image: thingy.coverImage.large,
					startDate: thingy.startDate,
					endDate: thingy.endDate,
					id: thingy.id,
					episodes: thingy.episodes,
					popularity: thingy.popularity,
					duration: thingy.duration || 1,
					status: thingy.status,
					score: thingy.averageScore,
					myStatus: thingy.mediaListEntry,
					character: character,
					genres: thingy.genres.map(genre => genre.toLowerCase()),
					tags: thingy.tags.map(tag => tag.name.toLowerCase()),
					listJSON: thingy.mediaListEntry ? parseListJSON(thingy.mediaListEntry.notes) : null
				};
				if(anime.myStatus && anime.myStatus.status === "REPEATING" && anime.myStatus.repeat === 0){
					anime.myStatus.repeat = 1;
				}
				autocomplete.add(anime.title);
				voiceRolesList.push(anime)
			})
		});
		refreshAutocomplete();
		listRenderer();
	};
	const staffQuery = `
query($id: Int,$page: Int,$type: MediaType){
	Staff(id: $id){
		staffMedia(
			sort: POPULARITY_DESC,
			type: $type,
			page: $page
		){
			edges{
				staffRole
				node{
					id
					format
					episodes
					chapters
					volumes
					popularity
					duration
					status
					averageScore
					coverImage{large}
					startDate{year month day}
					endDate{year month day}
					title{romaji native english}
					tags{name}
					genres
					mediaListEntry{
						status
						progress
						progressVolumes
						repeat
						notes
						scoreRaw: score(format: POINT_100)
					}
				}
			}
			pageInfo{
				currentPage
				lastPage
			}
		}
	}
}`;
	const staffVoice = `
query($id: Int,$page: Int){
	Staff(id: $id){
		characters(
			sort: ID,
			page: $page
		){
			edges{
				node{
					id
					image{large}
					name{first last native}
				}
				role
				media{
					id
					format
					episodes
					chapters
					volumes
					popularity
					duration
					status
					averageScore
					coverImage{large}
					startDate{year month day}
					endDate{year month day}
					title{romaji native english}
					tags{name}
					genres
					mediaListEntry{
						status
						progress
						progressVolumes
						repeat
						notes
						scoreRaw: score(format: POINT_100)
					}
				}
			}
			pageInfo{
				currentPage
				lastPage
			}
		}
	}
}`;
	let variables = {
		page: 1,
		type: "ANIME",
		id: URLstuff[1]
	};
	authAPIcall(staffQuery,variables,animeHandler);
	variables.type = "MANGA";
	authAPIcall(staffQuery,variables,mangaHandler);
	authAPIcall(staffVoice,variables,voiceHandler);
}

function addCompletedScores(){
	if(!location.pathname.match(/^\/(home|user|activity)\/?([\w\-]+)?\/?$/)){
		return
	}
	setTimeout(addCompletedScores,1000);
	let bigQuery = [];
	let statusCollection = document.querySelectorAll(".status");
	statusCollection.forEach(function(status){
		if(
			(useScripts.completedScore && status.innerText.match(/^completed/i))
			|| (useScripts.droppedScore && status.innerText.match(/^dropped/i))
			|| location.pathname.match(/^\/activity/)
		){
			if(!status.hasOwnProperty("hohScoreMatched")){
				status.hohScoreMatched = true;
				let scoreInfo = create("span",false,false,status);
				const mediaId = /\/(\d+)\//.exec(status.children[0].href);
				if(!mediaId || !mediaId.length){
					return
				};
				scoreInfo.style.display = "none";
				let callback = function(data){
					if(!data){
						return
					};
					data = data.data.MediaList;
					let scoreSuffix = scoreFormatter(
						data.score,
						data.user.mediaListOptions.scoreFormat,
						data.user.name
					);
					let noteContent = parseListJSON(data.notes);
					let noteSuffix = "";
					if(noteContent){
						if(noteContent.hasOwnProperty("message")){
							noteSuffix += " " + noteContent.message
						}
					};
					let rewatchSuffix = "";
					if(data.repeat > 0){
						if(data.media.type === "ANIME"){
							rewatchSuffix = " [rewatch"
						}
						else{
							rewatchSuffix = " [reread"
						}
						if(data.repeat === 1){
							rewatchSuffix += "]"
						}
						else{
							rewatchSuffix += " " + data.repeat + "]"
						}
					};
					if(data.score){
						if(status.innerText.match(/^completed/i)){
							scoreInfo.innerHTML = scoreSuffix;
							create("span",false,noteSuffix,scoreInfo);
							create("span",false,rewatchSuffix,scoreInfo);
						}
						else{
							scoreInfo.innerHTML = scoreSuffix;
							create("span",false,noteSuffix,scoreInfo);
						};
						scoreInfo.style.display = "inline"
					}
				};
				const variables = {
					userName: status.parentNode.children[0].innerText.trim(),
					mediaId: +mediaId[1]
				};
				const query = `
query($userName: String,$mediaId: Int){
	MediaList(
		userName: $userName,
		mediaId: $mediaId
	){
		score
		mediaId
		notes
		repeat
		media{type}
		user{
			name
			mediaListOptions{scoreFormat}
		}
	}
}`;
				//generalAPIcall(query,variables,callback,"hohCompletedScores" + variables.mediaId + variables.userName,60*1000)
				bigQuery.push({
					query: query,
					variables: variables,
					callback: callback,
					cacheKey: "hohCompletedScores" + variables.mediaId + variables.userName,
					duration: 60*1000
				})
			}
		}
		else if(status.children.length === 2 && !status.classList.contains("form")){
			status.children[1].remove()
		}
	});
	queryPacker(bigQuery)
};

function enhanceTags(){//show tag definition in drop down menu when adding tags
	if(!location.pathname.match(/^\/(anime|manga)\/.*/)){
		return
	};
	setTimeout(enhanceTags,400);
	let possibleTagContainers = Array.from(document.querySelectorAll(".el-select-dropdown__list"));
	let bestGuess = possibleTagContainers.find(
		elem => elem.children.length > 205//horrible test, but we have no markup to go from. Assumes the tag dropdown is the only one with more than that number of children
	)
	if(!bestGuess){
		return
	};
	if(bestGuess.hasOwnProperty("hohMarked")){
		return
	}
	else{
		bestGuess.hohMarked = true
	};
	let superBody = document.getElementsByClassName("el-dialog__body")[0];
	let descriptionTarget = create("span","#hohDescription");
	superBody.insertBefore(descriptionTarget,superBody.children[2]);
	Array.from(bestGuess.children).forEach(child => {
		child.onmouseover = function(){
			if(tagDescriptions[child.children[0].innerText]){
				document.getElementById("hohDescription").innerText = tagDescriptions[child.children[0].innerText];
			}
			else{
				document.getElementById("hohDescription").innerText = "Message hoh to get this description added";//should never happen anymore
			}
		};
		child.onmouseout = function(){
			document.getElementById("hohDescription").innerText = ""
		}
	})
};

let prevLength = 0;
let displayMode = "hoh";

function enhanceNotifications(){
	//method: the real notifications are parsed, then hidden and a new list of notifications are created using a mix of parsed data and API calls.
	//alternative method: auth
	setTimeout(function(){
		if(location.pathname === "/notifications" && !(useScripts.accessToken && false)){
			enhanceNotifications()
		}
		else{
			prevLength = 0;
			displayMode = "hoh";
		}
	},300);
	if(displayMode === "native"){
		return
	};
	let possibleButton = document.querySelector(".reset-btn");
	if(possibleButton){
		if(!possibleButton.flag){
			possibleButton.flag = true;
			possibleButton.onclick = function(){
				Array.from(
					document.getElementById("hohNotifications").children
				).forEach(child => {
					child.classList.remove("hohUnread")
				})
			};
			let setting = create("p");
			let checkbox = createCheckbox(setting);
			checkbox.checked = useScripts["hideLikes"];
			checkbox.targetSetting = "hideLikes";
			checkbox.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				forceRebuildFlag = true;
				if(useScripts.accessToken && false){//fixme, that doesn't look right
					enhanceNotifications()
				}
			};
			let description = create("span",false,"Hide like notifications",setting);
			setting.style.fontSize = "small";
			if(useScripts.settingsTip){
				create("p",false,
`You can turn parts of the script on and off:
settings > apps.

You can also turn off this notice there.`,setting);
			};
			let regularNotifications = create("span",false,svgAssets.envelope + " Show default notifications");
			regularNotifications.style.cursor = "pointer";
			regularNotifications.style.fontSize = "small";
			regularNotifications.onclick = function(){
				if(displayMode === "hoh"){
					displayMode = "native";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "none";
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "grid"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show hoh notifications";
					setting.style.display = "none";
				}
				else{
					displayMode = "hoh";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "block"
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "none"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show default notifications";
					setting.style.display = ""
				};
			};
			possibleButton.parentNode.appendChild(regularNotifications);
			possibleButton.parentNode.appendChild(setting);
		};
	};
	let commentCallback = function(data){
		let listOfComments = Array.from(document.getElementsByClassName("b" + data.data.Activity.id));
		listOfComments.forEach(function(comment){
			removeChildren(comment.children[1])
			comment.children[0].style.display = "block";
			data.data.Activity.replies.slice(
				(data.data.Activity.replies.length <= 50 ? 0 : data.data.Activity.replies.length - 30),
				data.data.Activity.replies.length
			).forEach(function(reply){
				let quickCom = create("div","hohQuickCom",false,comment.children[1]);
				let quickComName = create("span","hohQuickComName",reply.user.name,quickCom);
				if(reply.user.name === whoAmI){
					quickComName.classList.add("hohThisIsMe")
				};
				let quickComContent = create("span","hohQuickComContent",false,quickCom);
				quickComContent.innerHTML = reply.text.replace(/src='http:/g,"src='https:");//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				let quickComLikes = create("span","hohQuickComLikes","♥",quickCom);
				if(reply.likes.length > 0){
					quickComLikes.innerText = reply.likes.length + "♥";
					quickComLikes.title = reply.likes.map(a => a.name).join("\n")
				}
				reply.likes.forEach(like => {
					if(like.name === whoAmI){
						quickComLikes.classList.add("hohILikeThis")
					}
				});
				if(useScripts.accessToken){
					quickComLikes.style.cursor = "pointer";
					quickComLikes.onclick = function(){
						authAPIcall(
							"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
							{id: reply.id},
							function(data){
								if(!data){
									authAPIcall(//try again once if it fails
										"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
										{id: reply.id},
										data => {}
									)
								}
							}
						);
						if(reply.likes.some(like => like.name === whoAmI)){
							reply.likes.splice(reply.likes.findIndex(user => user.name === whoAmI),1);
							quickComLikes.classList.remove("hohILikeThis");
							if(reply.likes.length > 0){
								quickComLikes.innerText = reply.likes.length + "♥"
							}
							else{
								quickComLikes.innerText = "♥"
							}
						}
						else{
							reply.likes.push({name: whoAmI});
							quickComLikes.classList.add("hohILikeThis");
							quickComLikes.innerText = reply.likes.length + "♥";
						};
						quickComLikes.title = reply.likes.map(a => a.name).join("\n");
					};
				}
			});
			let loading = create("div",false,false,comment.children[1]);
			let statusInput = create("div",false,false,comment.children[1]);
			let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);");
			let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
			let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
			inputArea.placeholder = "Write a reply...";
			inputArea.onfocus = function(){
				cancelButton.style.display = "inline";
				publishButton.style.display = "inline"
			};
			cancelButton.onclick = function(){
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
			};
			publishButton.onclick = function(){
				loading.innerText = "Publishing reply...";
				authAPIcall(
					`mutation($text: String,$activityId: Int){
						SaveActivityReply(text: $text,activityId: $activityId){
							id
							user{name}
							likes{name}
							text(asHtml: true)
							createdAt
						}
					}`,
					{text: inputArea.value,activityId: data.data.Activity.id},
					function(retur){
						loading.innerText = "";
						data.data.Activity.replies.push({
							text: retur.data.SaveActivityReply.text,
							user: retur.data.SaveActivityReply.user,
							likes: retur.data.SaveActivityReply.likes,
							id: retur.data.SaveActivityReply.id
						});
						let saltedHam = JSON.stringify({
							data: data,
							time: NOW(),
							duration: 24*60*60*1000
						});
						localStorage.setItem("hohListActivityCall" + data.data.Activity.id,saltedHam);
						commentCallback(data);
					}
				);
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
			}
		})
	};
	let notificationDrawer = function(activities){
		let newContainer = document.getElementById("hohNotifications")
		if(newContainer){
			newContainer.remove()
		};
		newContainer = create("div","#hohNotifications");
		let notificationsContainer = document.querySelector(".notifications");
		if(!notificationsContainer){
			return
		}
		notificationsContainer.insertBefore(newContainer,notificationsContainer.firstChild);
		for(var i=0;i<activities.length;i++){
			if(useScripts.hideLikes && (activities[i].type === "likeReply" || activities[i].type === "like")){
				continue
			};
			let newNotification = create("div");
			newNotification.onclick = function(){
				this.classList.remove("hohUnread");
				let notiCount = document.getElementsByClassName("notification-dot");
				if(notiCount.length){
					const actualCount = parseInt(notiCount[0].textContent);
					if(actualCount < 2){
						if(possibleButton){
							possibleButton.click();
						};
					}
					else{
						notiCount[0].innerText = (actualCount - 1);
					};
				};
			};
			if(activities[i].unread){
				newNotification.classList.add("hohUnread")
			};
			newNotification.classList.add("hohNotification");
			let notImage = create("a","hohUserImage"); //container for profile images
			notImage.href = activities[i].href;
			notImage.style.backgroundImage = activities[i].image;
			let notNotImageContainer = create("span","hohMediaImageContainer"); //container for series images
			let text = create("a","hohMessageText");
			let textName = create("span");
			let textSpan = create("span");
			textName.style.color = "rgb(var(--color-blue))";
			let counter = 1;
			if(activities[i].type === "like"){
				for(
					counter = 0;
					i + counter < activities.length
					&& activities[i + counter].type === "like"
					&& activities[i + counter].href === activities[i].href;
					counter++
				){//one person likes several of your media activities
					let notNotImage = create("a",false,false,notNotImageContainer);
					create("img",["hohMediaImage",activities[i + counter].link],false,notNotImage);
					notNotImage.href = activities[i + counter].directLink;
				};
				text.href = activities[i].directLink;
				textSpan.innerText = activities[i].textSpan;
				if(counter > 1){
					textSpan.innerText = " liked your activities."
				};
				if(counter === 1){
					while(
						i + counter < activities.length
						&& activities[i + counter].type === "like"
						&& activities[i + counter].link === activities[i].link
					){//several people likes one of your activities
						let miniImageWidth = 40;
						let miniImage = create("a","hohUserImageSmall",false,newNotification);
						miniImage.href = activities[i + counter].href;
						miniImage.title = activities[i + counter].textName;
						miniImage.style.backgroundImage = activities[i + counter].image;
						miniImage.style.height = miniImageWidth + "px";
						miniImage.style.width = miniImageWidth + "px";
						miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
						if(counter >= 8){
							miniImage.style.height = miniImageWidth/2 + "px";
							miniImage.style.width = miniImageWidth/2 + "px";
							miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
							if(counter % 2 === 1){
								miniImage.style.top = miniImageWidth/2 + "px";
							}
						};
						counter++;
					}
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter - 1);
					};
				}
				else{
					newNotification.classList.add("hohCombined")
				};
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "reply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "reply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					};
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "replyReply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "replyReply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter-1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					}
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " replied to activity you're subscribed to.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "likeReply"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "likeReply"
					&& activities[i + counter].link === activities[i].link
				){//several people likes one of your activity replies
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.title = activities[i + counter].textName;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					}
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " liked your activity reply.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "message"
				|| activities[i].type === "mention"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "airing"){
				textSpan.innerHTML = activities[i].text;//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "follow"){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(
				activities[i].type === "forumCommentLike"
				|| activities[i].type === "forumSubscribedComment"
				|| activities[i].type === "forumCommentReply"
				|| activities[i].type === "forumLike"
				|| activities[i].type === "forumMention"
			){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				let textSpan2 = create("span",false,activities[i].text,text,"color:rgb(var(--color-blue));");
				text.style.maxWidth = "none";
				text.style.marginTop = "17px";
			}
			else{//display as-is
				textSpan.classList.add("hohUnhandledSpecial");
				textSpan.innerHTML = activities[i].text;//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				text.appendChild(textSpan);
			};
			let time = create("div","hohTime");
			time.innerHTML = activities[i - counter + 1].time;//does not depend on user input
			newNotification.appendChild(notImage);
			newNotification.appendChild(text);
			newNotification.appendChild(notNotImageContainer);
			newNotification.appendChild(time);
			if(i < 25){
				let commentsContainer = create("div",["hohCommentsContainer","b" + activities[i].link]);
				let comments = create("a",["hohComments","link"],"comments",commentsContainer);
				create("span","hohMonospace","+",comments);
				comments.onclick = function(){
					if(this.children[0].innerText === "+"){
						this.children[0].innerText = "-";
						this.parentNode.children[1].style.display = "inline-block";
						let variables = {
							id: +this.parentNode.classList[1].substring(1)
						};
						generalAPIcall(queryActivity,variables,commentCallback,"hohListActivityCall" + variables.id,24*60*60*1000,true,true);
					}
					else{
						this.children[0].innerText = "+";
						this.parentNode.children[1].style.display = "none";
					};
				};
				let commentsArea = create("div","hohCommentsArea",false,commentsContainer);
				newNotification.appendChild(commentsContainer);
			}
			newContainer.appendChild(newNotification);
		};
	};
	let activities = [];
	let notifications = document.getElementsByClassName("notification");//collect the "real" notifications
	if(notifications.length === prevLength && forceRebuildFlag === false){
		return;
	}
	else{
		prevLength = notifications.length;
		forceRebuildFlag = false;
	};
	const activityTypes = {
		" liked your activity." :                           "like",
		" replied to your activity." :                      "reply",
		" sent you a message." :                            "message",
		" liked your activity reply." :                     "likeReply",
		" mentioned you in their activity." :               "mention",
		" replied to activity you're subscribed to." :      "replyReply",
		" liked your comment, in the forum thread " :       "forumCommentLike",
		" commented in your subscribed forum thread " :     "forumSubscribedComment",
		" replied to your comment, in the forum thread " :  "forumCommentReply",
		" liked your forum thread, " :                      "forumLike",
		" mentioned you, in the forum thread " :            "forumMention"
	};
	Array.from(notifications).forEach(function(notification){//parse real notifications
		notification.already = true;
		notification.style.display = "none";
		let active = {
			type: "special",
			unread: false,
			link: "aaa",//fixme. Edit 2019: I have no idea
			image: notification.children[0].style.backgroundImage,
			href: notification.children[0].href
		};
		if(
			notification.classList.length > 1
			&& notification.classList[1] != "hasMedia"
		){//"notification unread" classlist
			active.unread = true
		}
		if(//check if we can query that
			notification.children.length >= 2
			&& notification.children[1].children.length
			&& notification.children[1].children[0].children.length
			&& notification.children[1].children[0].children[0].children.length
		){
			const info = notification.children[1].children[0].children[0];
			active.directLink = info.href
			active.text =       info.innerHTML;//does not depend on user input
			active.textName =   (info.childNodes[0] || {textContent: ""}).textContent.trim();
			active.textSpan =   (info.childNodes[1] || {textContent: ""}).textContent;
			let linkMatch =     info.href.match(/activity\/(\d+)/);
			if(linkMatch){
				active.link = linkMatch[1];
			};
			var testType = info.children[0].textContent;
			active.type = activityTypes[testType];
			if(!active.type){
				active.type = "special"; //by default every activity is some weird thing we are displaying as-is
			}
			else if(
				active.type === "forumCommentLike"
				|| active.type === "forumSubscribedComment"
				|| active.type === "forumCommentReply"
				|| active.type === "forumLike"
				|| active.type === "forumMention"
			){
				active.text = (info.children[1] || {textContent: ""}).textContent
			}
		};
		if(active.type === "special"){
			active.text = notification.children[1].innerHTML;//does not depend on user input
			if(notification.children[1].children.length){
				const info = notification.children[1].children[0];
				if(
					info.children.length >= 2
					&& (info.children[1] || {textContent: ""}).textContent === " started following you."
				){
					active.type = "follow";
					active.directLink = info.children[0].href;
					active.text =       info.children[0].innerHTML;//does not depend on user input
					active.textName =   (info.children[0] || {textContent: ""}).textContent.trim();
					active.textSpan =   (info.children[1] || {textContent: ""}).textContent;
				}
				else if(
					info.children.length >= 4
					&& (info.children[3] || {textContent: ""}).textContent === " aired."
				){
					active.type = "airing";
					active.directLink = info.children[0].href;
					active.text = info.innerHTML;//does not depend on user input
				};
			};
		};
		if(
			notification.children.length > 1
			&& notification.children[1].children.length > 1
		){
			active.time = notification.children[1].children[1].innerHTML//does not depend on user input
		}
		else{
			active.time = create("span")
		};
		activities.push(active);
	});
	notificationDrawer(activities);
	for(var i=0;APIcallsUsed < (APIlimit - 5);i++){//heavy
		if(!activities.length || i >= activities.length){//loading is difficult to predict. There may be nothing there when this runs
			break
		};
		let imageCallBack = function(data){
			if(!data){
				return
			}
			pending[data.data.Activity.id + ""] = false;
			let type = data.data.Activity.type;
			if(type === "ANIME_LIST" || type === "MANGA_LIST"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundColor = data.data.Activity.media.coverImage.color || "rgb(var(--color-foreground))";
					stuff.style.backgroundImage = "url(" + data.data.Activity.media.coverImage.large + ")";
					stuff.classList.add("hohBackgroundCover");
					if(data.data.Activity.media.title){
						stuff.parentNode.title = data.data.Activity.media.title.romaji
					}
				})
			}
			else if(type === "TEXT"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundImage = "url(" + data.data.Activity.user.avatar.large + ")";
					stuff.classList.add("hohBackgroundUserCover");
				})
			};
			if(data.data.Activity.replies.length){
				commentCallback(data)
			}
		};
		let vars = {
			find: i
		};
		if(activities[i].link[0] != "a"){//activities with post link
			let variables = {
				id: +activities[i].link
			};
			if(!pending[activities[i].link]){
				pending[activities[i].link] = true;
				generalAPIcall(queryActivity,variables,imageCallBack,"hohListActivityCall" + variables.id,24*60*60*1000,true);
			}
		}
	}
};//end enhanceNotifications

function enhanceCharacterBrowse(){
	if(!document.URL.match(/\/search\/characters\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
	let favCallback = function(data,page){
		let resultsToTag = document.querySelectorAll("div.results.characters .character");
		if(resultsToTag.length < page*data.data.Page.characters.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/characters/)){
					return;
				};
				favCallback(data,page);
			},200);//may take some time to load
			return;
		};
		data = data.data.Page.characters;
		data.forEach((character,index) => create(
			"span",
			"hohFavCountBrowse",
			character.favourites,
			resultsToTag[(page - 1)*data.length + index].children[0]
		));
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1));
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1));
};

function enhanceStaffBrowse(){
	if(!document.URL.match(/\/search\/staff\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
		staff(sort: [FAVOURITES_DESC]){
			id
			favourites
			anime:staffMedia(type:ANIME){
				pageInfo{
					total
				}
			}
			manga:staffMedia(type:MANGA){
				pageInfo{
					total
				}
			}
			characters{
				pageInfo{
					total
				}
			}
		}
	}
}`;
	let favCallback = function(data,page){
		let resultsToTag = document.querySelectorAll("div.results.staff .staff");
		if(resultsToTag.length < page*data.data.Page.staff.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/staff/)){
					return
				};
				favCallback(data,page);
			},200);//may take some time to load
			return
		};
		data = data.data.Page.staff;
		data.forEach(function(staff,index){
			create("span","hohFavCountBrowse",staff.favourites,resultsToTag[(page - 1)*data.length + index].children[0]);
			if(staff.anime.pageInfo.total + staff.manga.pageInfo.total > staff.characters.pageInfo.total){
				resultsToTag[(page - 1)*data.length + index].children[0].children[0].style.backgroundImage =
				"linear-gradient(to right,rgba(var(--color-overlay),0.8),hsla(" + Math.round(
					120*(1 + staff.anime.pageInfo.total/(staff.anime.pageInfo.total + staff.manga.pageInfo.total))
				) + ",100%,50%,0.8),rgba(var(--color-overlay),0.8))"
			}
		});
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1))
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1))
};

function addProgressBar(){
	if(location.pathname != "/home"){
		return
	};
	let mediaCards = document.querySelectorAll(".media-preview-card .content .info:not(.hasMeter) > div");
	if(!mediaCards.length){
		setTimeout(function(){
			addProgressBar()
		},200);//may take some time to load
		return
	};
	mediaCards.forEach(card => {
		const progressInformation = card.innerText.match(/Progress:\ (\d+)\/(\d+)/);
		if(progressInformation){
			let pBar = create("meter");
			pBar.value = progressInformation[1];
			pBar.min = 0;
			pBar.max = progressInformation[2];
			card.parentNode.insertBefore(pBar,card);
			card.parentNode.parentNode.parentNode.querySelector(".plus-progress").onclick = function(){
				pBar.value++;
				setTimeout(function(){
					pBar.value = card.innerText.match(/Progress:\ (\d+)\/(\d+)/)[1]
				},1000)
			}
		}
	});
	document.querySelector(".size-toggle").onclick = function(){
		setTimeout(function(){
			addProgressBar()
		},200);
	}
}

function enhanceCharacter(){//adds a favourite count on every character page
	if(!location.pathname.match(/^\/character(\/.*)?/)){
		return
	};
	if(document.getElementById("hohFavCount")){
		return
	};
	let oldData = false;
	let favCallback = function(data){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/character\/.*/)){
				return
			}
			let favCount = document.querySelector(".favourite .count");
			if(favCount){
				favCount.parentNode.onclick = function(){
					if(favCount.parentNode.classList.contains("isFavourite")){
						favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
					}
					else{
						favCount.innerText = parseInt(favCount.innerText) + 1
					}
				};
				if(data.data.Character.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
					favCount.innerText = data.data.Character.favourites + 1
				}
				else{
					favCount.innerText = data.data.Character.favourites
				}
			}
			else{
				setTimeout(adder,200);
			}
		};
		if(data.data.Character.favourites){
			adder()
		};
		let languages = new Set(
			data.data.Character.media.edges.map(
				edge => edge.voiceActors.map(actor => actor.language)
			).flat()
		);
		let rolesBuilder = function(){
			if(data.data.Character.media.pageInfo.lastPage > 1){
				if(data.data.Character.media.pageInfo.currentPage === 1){
					oldData = data;
					for(let i = 2;i<=data.data.Character.media.pageInfo.lastPage;i++){
						generalAPIcall(
							`query($id: Int!,$page: Int){
								Character(id: $id){
									media(page:$page,sort:POPULARITY_DESC){
										pageInfo{currentPage lastPage}
										edges{
											characterRole
											voiceActors{
												siteUrl
												name{full native}
												language
												image{large}
											}
											node{
												id
												siteUrl
												popularity
												title{romaji english native}
												coverImage{large}
											}
										}
									}
								}
							}`,
							{
								id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1]),
								page: i
							},
							favCallback,
							"hohCharacterFavs" + variables.id + "page" + i,
							60*60*1000
						);
					}
				}
				else if(data.data.Character.media.pageInfo.currentPage){
					data.data.Character.media.edges = data.data.Character.media.edges.concat(oldData.data.Character.media.edges);
					oldData = data;
				}
			}
			if(languages.size < 2){
				if(!data.data.Character.media.edges.some(
					edge => edge.voiceActors.length > 1
				) && !data.data.Character.media.isSplit){
					return//no need to replace the page.
				}
			}
			let location = document.querySelector(".container.grid-wrap");
			if(!location || !location.childElementCount){
				setTimeout(rolesBuilder,200);
				return;
			};
			location.classList.add("hohCharacter");
			if(document.querySelector(".scroller")){
				document.querySelector(".scroller").remove()
			}
			removeChildren(location)
			let badLocation = location.cloneNode(true);
			location.parentNode.replaceChild(
				badLocation,
				location
			);
			location = badLocation;
			if(document.querySelector(".hohInputContainer")){
				document.querySelector(".hohInputContainer").remove()
			};
			let inputContainer = create("div","hohInputContainer",false,location.previousElementSibling,"position:relative;");
			let selector = create("select",false,false,inputContainer,"position:absolute;right:0px;bottom:5px;");
			if(languages.size < 2){
				selector.style.display = "none";
			}
			Array.from(languages).sort(
				(a,b) => {
					if(a === "JAPANESE"){
						return -1
					}
					if(b === "JAPANESE"){
						return 1
					}
					if(a === "KOREAN"){
						return 1
					}
					if(b === "KOREAN"){
						return -1
					}
					return a.localeCompare(b);
				}
			).forEach(language => {
				create("option",false,capitalize(language.toLowerCase()),selector)
					.value = language
			});
			let listBuilder = function(){
				removeChildren(location)
				if(data.data.Character.media.edges.length === 1){//spread multiple voice actors when we have the space
					data.data.Character.media.edges = data.data.Character.media.edges[0].voiceActors.filter(
						actor => actor.language === selector.value
					).map(
						actor => {
							return {
								node: data.data.Character.media.edges[0].node,
								characterRole: data.data.Character.media.edges[0].characterRole,
								voiceActors: [actor]
							}
						}
					);
					data.data.Character.media.isSplit = true;
				}
				data.data.Character.media.edges.sort(
					(b,a) => {
						const roleValue = {
							"MAIN": 3,
							"SUPPORTING": 2,
							"BACKGROUND": 1
						};
						return roleValue[a.characterRole] - roleValue[b.characterRole] || a.node.popularity - b.node.popularity
					}
				).forEach(edge => {
					let card = create("div",["role-card","view-media-staff"],false,location,"position:relative");
					let staff = edge.voiceActors.filter(actor => actor.language === selector.value);
					if(staff.length){
						let staffSide = create("div","staff",false,card);
						let staffCover = create("a","cover",false,staffSide);
						staffCover.href = staff[0].siteUrl.replace("https://anilist.co","");;
						staffCover.style.backgroundImage = "url(\"" + staff[0].image.large + "\")";
						let staffContent = create("a","content",false,staffSide);
						staffContent.href = staff[0].siteUrl.replace("https://anilist.co","");;
						let staffName = staff[0].name.full
						if(useScripts.titleLanguage === "NATIVE" && staff[0].name.native){
							staffName = staff[0].name.native
						}
						create("div","name",staffName,staffContent);
						create("div","role",capitalize(staff[0].language.toLowerCase()),staffContent);
						if(staff.length === 2){
							staffSide.style.marginRight = "65px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");;
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
						}
						else if(staff.length > 2){
							staffSide.style.marginRight = "130px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:65px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");;
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
							let thirdCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							thirdCover.href = staff[2].siteUrl.replace("https://anilist.co","");;
							let thirdName = staff[2].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[2].name.native){
								thirdName = staff[2].name.native
							}
							thirdCover.title = thirdName;
							thirdCover.style.backgroundImage = "url(\"" + staff[2].image.large + "\")";
						}
					};
					let mediaSide = create("div","media",false,card);
					let mediaCover = create("a","cover",false,mediaSide);
					mediaCover.href = edge.node.siteUrl.replace("https://anilist.co","");;
					mediaCover.style.backgroundImage = "url(\"" + edge.node.coverImage.large + "\")";
					let mediaContent = create("a","content",false,mediaSide);
					mediaContent.href = edge.node.siteUrl.replace("https://anilist.co","");
					let title = edge.node.title.romaji;
					if(useScripts.titleLanguage === "NATIVE" && edge.node.title.native){
						title = edge.node.title.native
					}
					else if(useScripts.titleLanguage === "ENGLISH" && edge.node.title.english){
						title= edge.node.title.english
					};
					if(aliases.has(edge.node.id)){
						title = aliases.get(edge.node.id)
					}
					create("div","name",title,mediaContent);
					create("div","role",capitalize(edge.characterRole.toLowerCase()),mediaContent);
				})
			};listBuilder();
			selector.onchange = listBuilder;
		};rolesBuilder();
	};
	const variables = {id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1])};
	generalAPIcall(
		`query($id: Int!){
			Character(id: $id){
				favourites
				media(page:1,sort:POPULARITY_DESC){
					pageInfo{currentPage lastPage}
					edges{
						characterRole
						voiceActors{
							siteUrl
							name{full native}
							language
							image{large}
						}
						node{
							id
							siteUrl
							popularity
							title{romaji english native}
							coverImage{large}
						}
					}
				}
			}
		}`,
		variables,
		favCallback,
		"hohCharacterFavs" + variables.id + "page1",
		60*60*1000
	);
};

function enhanceStudio(){//adds a favourite count to every studio page
	if(!location.pathname.match(/^\/studio(\/.*)?/)){
		return
	};
	let filterGroup = document.querySelector(".container.header");
	if(!filterGroup){
		setTimeout(enhanceStudio,200);//may take some time to load
		return;
	};
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/studio\/.*/)){
			return
		}
		let favCount = document.querySelector(".favourite .count");
		if(favCount){
			favCount.parentNode.onclick = function(){
				if(favCount.parentNode.classList.contains("isFavourite")){
					favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
				}
				else{
					favCount.innerText = parseInt(favCount.innerText) + 1
				}
			};
			if(data.data.Studio.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Studio.favourites + 1
			}
			else{
				favCount.innerText = data.data.Studio.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200);
		}
		let scoreSum = 0;
		let amount = 0;
		data.data.Studio.media.nodes.forEach(media => {
			if(media.meanScore){
				scoreSum += media.meanScore;
				amount++
			}
		});
		if(amount){
			let scoreAverage = create("span","#hohFavCount",
				(scoreSum/amount).roundPlaces(1) + "%",
				filterGroup,"top:45px;color:rgb(var(--color-blue));z-index:45;font-size:1.2rem;"
			)
		}
	};
	const variables = {id: location.pathname.match(/\/studio\/(\d+)\/?/)[1]};
	generalAPIcall(
		`
query($id: Int!){
	Studio(id: $id){
		favourites
		media(isMain:true,sort:POPULARITY_DESC){
			nodes{
				meanScore
			}
		}
	}
}`,
		variables,favCallback,"hohStudioFavs" + variables.id,60*60*1000
	);
};

function returnList(list,skipProcessing){
	if(!list){
		return null
	};
	let retl = [];
	list.data.MediaListCollection.lists.forEach(mediaList => {
		mediaList.entries.forEach(entry => {
			if(!skipProcessing){
				entry.isCustomList = mediaList.isCustomList;
				if(entry.isCustomList){
					entry.listLocations = [mediaList.name]
				}
				else{
					entry.listLocations = []
				};
				entry.scoreRaw = Math.min(entry.scoreRaw,100);
				if(!entry.media.episodes && entry.media.nextAiringEpisode){
					entry.media.episodes = entry.media.nextAiringEpisode.episode - 1
				}
				if(entry.notes){
					entry.listJSON = parseListJSON(entry.notes)
				};
				if(entry.media.a){
					entry.media.staff = removeGroupedDuplicates(
						entry.media.a.nodes.concat(
							entry.media.b.nodes
						),
						e => e.id
					);
					delete entry.media.a;
					delete entry.media.b;
				}
				if(entry.repeat > 10000){//counting eps as repeat, 10x One Piece as the plausibility baseline
					entry.repeat = 0
				}
				if(entry.status === "REPEATING" && entry.repeat === 0){
					entry.repeat = 1
				}
			};
			retl.push(entry);
		})
	})
	return removeGroupedDuplicates(
		retl,
		e => e.mediaId,
		(oldElement,newElement) => {
			if(!skipProcessing){
				newElement.listLocations = newElement.listLocations.concat(oldElement.listLocations);
				newElement.isCustomList = oldElement.isCustomList || newElement.isCustomList;
			}
		}
	)
};

function parseListJSON(listNote){
	if(!listNote){
		return null
	};
	let commandMatches = listNote.match(/\$({.*})\$/);
	if(commandMatches){
		try{
			let noteContent = JSON.parse(commandMatches[1]);
			noteContent.adjustValue = noteContent.adjust ? noteContent.adjust : 0;
			let rangeParser = function(thing){
				if(typeof thing === "number"){
					return 1
				}
				else if(typeof thing === "string"){
					thing = thing.split(",")
				};
				return thing.reduce(function(acc,item){
					if(typeof item === "number"){
						return acc + 1
					};
					let multiplierPresent = item.split("x");
					let value = 1;
					let rangePresent = multiplierPresent[0].split("-");
					if(rangePresent.length === 2){//range
						let minRange = parseFloat(rangePresent[0]);
						let maxRange = parseFloat(rangePresent[1]);
						if(minRange && maxRange){
							value = maxRange - minRange + 1
						}
					}
					if(multiplierPresent.length === 1){//no multiplier
						return acc + value
					}
					if(multiplierPresent.length === 2){//possible multiplier
						let multiplier = parseFloat(multiplierPresent[1]);
						if(multiplier || multiplier === 0){
							return acc + value*multiplier
						}
						else{
							return acc + 1
						}
					}
					else{//unparsable
						return acc + 1
					}
				},0);
			};
			if(noteContent.more){
				noteContent.adjustValue += rangeParser(noteContent.more)
			};
			if(noteContent.skip){
				noteContent.adjustValue -= rangeParser(noteContent.skip)
			};
			return noteContent;
		}
		catch(e){
			console.warn("Unable to parse JSON in list note",commandMatches)
		}
	}
	else{
		return null
	}
};

function formatCompat(compatData,targetLocation){
	let differenceSpan = create("span",false,compatData.difference.roundPlaces(3));
	if(compatData.difference < 0.9){
		differenceSpan.style.color = "green"
	}
	else if(compatData.difference > 1.1){
		differenceSpan.style.color = "red"
	};
	targetLocation.innerText = "";
	targetLocation.appendChild(differenceSpan);
	let countSpan = create("span",false," based on " + compatData.shared + " shared entries. Lower is better. 0.8 - 1.1 is common",targetLocation);
	let canvas = create("canvas",false,false,targetLocation,"display:block;");
	canvas.width = 200;
	canvas.height = 100;
	let r1 = Math.sqrt(compatData.list1/(compatData.list1 + compatData.list2));
	let r2 = Math.sqrt(compatData.list2/(compatData.list1 + compatData.list2));
	let distance;
	if(compatData.shared === compatData.list1 || compatData.shared === compatData.list2){
		distance = Math.abs(r1 - r2)
	}
	else if(compatData.shared === 0){
		distance = r1 + r2
	}
	else{
		let areaOfIntersection = function(d,r0,r1){
			let rr0 = r0 * r0;
			let rr1 = r1 * r1;
			let phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
			let theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
			let area1 = (theta * rr1 - rr1 * Math.sin(theta))/2;
			let area2 = (phi * rr0 - rr0 * Math.sin(phi))/2;
			return area1 + area2;
		};
		let overlapArea = Math.PI*compatData.shared/(compatData.list1 + compatData.list2);
		let pivot0 = Math.abs(r1 - r2);
		let pivot1 = r1 + r2;
		while(pivot1 - pivot0 > (r1 + r2)/100){
			distance = (pivot0 + pivot1)/2;
			if(areaOfIntersection(distance,r1,r2) > overlapArea){
				pivot0 = distance
			}
			else{
				pivot1 = distance
			}
		}
	}
	let ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(250,122,122)";
	ctx.arc(50 + 50*distance,50,50*r2,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242,0.5)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
}

function compatCheck(list,name,type,callback){
	const variables = {
		name: name,
		listType: type
	};
	generalAPIcall(queryMediaListCompat,variables,function(data){
		list.sort((a,b) => a.mediaId - b.mediaId);
		let list2 = returnList(data).filter(element => element.scoreRaw);
		let list3 = [];
		let indeks1 = 0;
		let indeks2 = 0;
		while(indeks1 < list.length && indeks2 < list2.length){
			if(list2[indeks2].mediaId > list[indeks1].mediaId){
				indeks1++;
				continue
			};
			if(list2[indeks2].mediaId < list[indeks1].mediaId){
				indeks2++;
				continue
			};
			if(list2[indeks2].mediaId === list[indeks1].mediaId){
				list3.push({
					mediaId: list[indeks1].mediaId,
					score1: list[indeks1].scoreRaw,
					score2: list2[indeks2].scoreRaw
				});
				indeks1++;
				indeks2++
			}
		};
		let average1 = 0;
		let average2 = 0;
		list3.forEach(item => {
			average1 += item.score1;
			average2 += item.score2;
			item.sdiff = item.score1 - item.score2
		});
		average1 = average1/list3.length;
		average2 = average2/list3.length;
		let standev1 = 0;
		let standev2 = 0;
		list3.forEach(item => {
			standev1 += Math.pow(item.score1 - average1,2);
			standev2 += Math.pow(item.score2 - average2,2)
		});
		standev1 = Math.sqrt(standev1/(list3.length - 1));
		standev2 = Math.sqrt(standev2/(list3.length - 1));
		let difference = 0;
		list3.forEach(item => {
			difference += Math.abs(
				(item.score1 - average1)/standev1
				- (item.score2 - average2)/standev2
			)
		});
		difference = difference/list3.length;
		callback({
			difference: difference,
			shared: list3.length,
			list1: list.length,
			list2: list2.length,
			user: name
		})
	})
}

//used by the stats module, and to safeguard the manga chapter guesses
const commonUnfinishedManga = {
	"53390":{//aot
		chapters:116,
		volumes:26
	},
	"30002":{//berserk
		chapters:359,
		volumes:40
	},
	"30013":{//one piece
		chapters:960,
		volumes:92
	},
	"85486":{//mha
		chapters:202,
		volumes:20
	},
	"74347":{//opm
		chapters:119,
		volumes:17
	},
	"30026":{//HxH
		chapters:390,
		volumes:36
	},
	"30656":{//vagabond
		chapters:327,
		volumes:37
	},
	"30105":{//yotsuba&
		chapters:106,
		volumes:14
	}
};
if(NOW() - new Date(2019,10,1) > 365*24*60*60*1000){
	console.log("remind hoh to update the commonUnfinishedManga list")
};

function settingsPage(){
	if(location.pathname !== "/settings/apps"){
		return
	};
	if(document.getElementById("hohSettings")){
		return
	};
	let targetLocation = document.querySelector(".settings.container .content");
	let hohSettings = create("div","#hohSettings",false,targetLocation);
	hohSettings.classList.add("all");
	let scriptStatsHead = create("h1",false,"Automail Settings",hohSettings);
	let scriptStats = create("div",false,false,hohSettings);
	let sVersion = create("p",false,false,scriptStats);
	create("span",false,"Version: ",sVersion);
	create("span","hohStatValue",scriptInfo.version,sVersion);
	let sHome = create("p",false,"Homepage: ",scriptStats);
	if(!useScripts.accessToken){
		create("p",false,"Faded options only have limited functionallity without signing in to the script",scriptStats)
	}
	let sHomeLink = create("a",false,scriptInfo.link,sHome);
	sHomeLink.href = scriptInfo.link;
	let categories = create("div",["container","hohCategories"],false,scriptStats);
	let catList = ["Notifications","Feeds","Forum","Lists","Profiles","Stats","Media","Navigation","Browse","Script","Login"];
	let activeCategory = "";
	catList.forEach(function(category){
		let catBox = create("div","hohCategory",category,categories);
		catBox.onclick = function(){
			hohSettings.className = "";
			if(activeCategory === category){
				catBox.classList.remove("active");
				activeCategory = "";
				hohSettings.classList.add("all");
			}
			else{
				if(activeCategory !== ""){
					categories.querySelector(".hohCategory.active").classList.remove("active")
				};
				catBox.classList.add("active");
				hohSettings.classList.add(category);
				activeCategory = category
			}
		}
	});
	let scriptSettings = create("div",false,false,hohSettings);
	if(!useScripts.accessToken){
		scriptSettings.classList.add("noLogin")
	}
	useScriptsDefinitions.forEach(function(def){
		let setting = create("p","hohSetting");
		if(def.visible === false){
			setting.style.display = "none"
		};
		if(def.hasOwnProperty("type")){//other kinds of input
			let input;
			if(def.type === "select"){
				input = create("select",false,false,setting);
				def.values.forEach(
					value => create("option",false,value,input)
						.value = value
				)
			}
			else if(def.type === "text"){
				input = create("input",false,false,setting)
			}
			else if(def.type === "number"){
				input = create("input",false,false,setting);
				input.type = "number";
				if(def.min !== undefined){
					input.setAttribute("min",def.min)
				}
				if(def.max){
					input.setAttribute("max",def.max)
				}
			}
			if(def.type != "heading"){
				input.targetSetting = def.id;
				input.value = useScripts[def.id];
				input.onchange = function(){
					useScripts[this.targetSetting] = this.value;
					useScripts.save();
				}
			}
		}
		else{//default: a checkbox
			let input = createCheckbox(setting);
			input.targetSetting = def.id;
			input.checked = useScripts[def.id];
			input.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				initCSS();
			}
		};
		if(def.categories){
			def.categories.forEach(
				category => setting.classList.add(category)
			)
		};
		create("span",false,def.description,setting);
		scriptSettings.appendChild(setting);
	});
	let titleAliasSettings = create("div");
	let titleAliasInstructions = create("p");
	titleAliasInstructions.innerText = `
Add title aliases. Use the format /type/id/alias , one per line. Examples:

/anime/5114/Fullmetal Alchemist
/manga/30651/Nausicaä

Changes take effect on reload.`;
	let titleAliasInput = create("textarea","#titleAliasInput");
	(
		JSON.parse(localStorage.getItem("titleAliases")) || []
	).forEach(
		alias => titleAliasInput.value += alias[0] + alias[1] + "\n"
	);
	titleAliasInput.rows = "6";
	titleAliasInput.cols = "50";
	let titleAliasChange = create("button",["hohButton","button"],"Submit");
	titleAliasChange.onclick = function(){
		let newAliases = [];
		let aliasContent = titleAliasInput.value.split("\n");
		let aliasRegex = /^(\/(anime|manga)\/\d+\/)(.*)/;
		let cssAlias = /^(css\/)(.*)/;
		aliasContent.forEach(content => {
			let matches = content.match(aliasRegex);
			if(!matches){
				let cssMatches = content.match(cssAlias);
				if(cssMatches){
					newAliases.push([cssMatches[1],cssMatches[2]])
				};
				return;
			};
			newAliases.push([matches[1],matches[3]]);
		});
		localStorage.setItem("titleAliases",JSON.stringify(newAliases));
	};
	titleAliasSettings.appendChild(create("hr"));
	titleAliasSettings.appendChild(titleAliasInstructions);
	titleAliasSettings.appendChild(titleAliasInput);
	create("br",false,false,titleAliasSettings);
	titleAliasSettings.appendChild(titleAliasChange);
	titleAliasSettings.appendChild(create("hr"));
	hohSettings.appendChild(titleAliasSettings);
	//
	let notificationColour = create("div");
	if(useScripts.accessToken){
		const notificationTypes = [
			"ACTIVITY_MESSAGE",
			"ACTIVITY_REPLY",
			"FOLLOWING",
			"ACTIVITY_MENTION",
			"THREAD_COMMENT_MENTION",
			"THREAD_SUBSCRIBED",
			"THREAD_COMMENT_REPLY",
			"AIRING",
			"ACTIVITY_LIKE",
			"ACTIVITY_REPLY_LIKE",
			"THREAD_LIKE",
			"THREAD_COMMENT_LIKE"
		];
		const supportedColours = [
			{name:"Transparent",value:"rgb(0,0,0,0)"},
			{name:"Blue",value:"rgb(61,180,242)"},
			{name:"White",value:"rgb(255,255,255)"},
			{name:"Black",value:"rgb(0,0,0)"},
			{name:"Red",value:"rgb(232,93,117)"},
			{name:"Peach",value:"rgb(250,122,122)"},
			{name:"Orange",value:"rgb(247,154,99)"},
			{name:"Yellow",value:"rgb(247,191,99)"},
			{name:"Green",value:"rgb(123,213,85)"}
		];
		create("p",false,"Notification Dot Colours",notificationColour);
		let nColourType = create("select",false,false,notificationColour);
		let nColourValue = create("select",false,false,notificationColour);
		let supressOption = createCheckbox(notificationColour);
		let supressOptionText = create("span",false,"Don't show dot",notificationColour);
		notificationTypes.forEach(
			type => create("option",false,type,nColourType)
				.value = type
		);
		supportedColours.forEach(
			colour => create("option",false,colour.name,nColourValue)
				.value = colour.value
		);
		create("br",false,false,notificationColour);
		let resetAll = create("button",["hohButton","button"],"Reset all",notificationColour);
		resetAll.onclick = function(){
			useScripts.notificationColours = notificationColourDefaults;
			useScripts.save();
		};
		nColourType.oninput = function(){
			nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
			supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
		};
		nColourValue.oninput = function(){
			useScripts.notificationColours[nColourType.value].colour = nColourValue.value;
			useScripts.save();
		};
		supressOption.oninput = function(){
			useScripts.notificationColours[nColourType.value].supress = supressOption.checked;
			useScripts.save();
		};
		nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
		supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
		hohSettings.appendChild(notificationColour);
	}
	hohSettings.appendChild(create("hr"));
	let blockList = localStorage.getItem("blockList");
	if(blockList){
		blockList = JSON.parse(blockList)
	}
	else{
		blockList = []
	};
	let blockSettings = create("div");
	let blockInstructions = create("p",false,false,blockSettings);
	blockInstructions.innerText = `
Block stuff in the home feed.

Changes take effect on reload.`;
	let blockInput = create("div","#blockInput",false,blockSettings);
	create("span",false,"User: ",blockInput);
	let blockUserInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
	blockUserInput.value = "";
	create("span",false," Status: ",blockInput);
	let blockStatusInput = create("select",false,false,blockInput,"margin-right:10px;");
	const blockStatuses = ["","all","status","progress","anime","manga","planning","watching","reading","pausing","dropping","rewatching","rereading"];
	blockStatuses.forEach(
		status => create("option",false,capitalize(status),blockStatusInput)
			.value = status
	);
	blockStatusInput.value = "";
	create("span",false," Media ID: ",blockInput);
	let blockMediaInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
	blockMediaInput.type = "number";
	blockMediaInput.value = "";
	blockMediaInput.min = 0;
	let blockAddInput = create("button",["button","hohButton"],"Add",blockInput);
	let blockVisual = create("div",false,false,blockSettings);
	let drawBlockList = function(){
		removeChildren(blockVisual)
		blockList.forEach(function(blockItem,index){;
				let item = create("div","hohBlock",false,blockVisual);
				let cross = create("span","hohBlockCross",svgAssets.cross,item);
				cross.onclick = function(){
					blockList.splice(index,1);
					localStorage.setItem("blockList",JSON.stringify(blockList));
					drawBlockList();
				};
				if(blockItem.user){
					create("span","hohBlockSpec",blockItem.user,item)
				}
				if(blockItem.status){
					create("span","hohBlockSpec",capitalize(blockItem.status),item)
				}
				if(blockItem.media){
					create("span","hohBlockSpec","ID:" + blockItem.media,item)
				}
		});
	};drawBlockList();
	blockAddInput.onclick = function(){
		let newBlock = {
			user: false,
			status: false,
			media: false
		};
		if(blockUserInput.value){
			newBlock.user = blockUserInput.value
		}
		if(blockStatusInput.value){
			newBlock.status = blockStatusInput.value
		}
		if(blockMediaInput.value){
			newBlock.media = blockMediaInput.value
		}
		if(newBlock.user || newBlock.status || newBlock.media){
			blockList.push(newBlock);
			localStorage.setItem("blockList",JSON.stringify(blockList));
			drawBlockList();
		}
	};
	hohSettings.appendChild(blockSettings);
	//
	hohSettings.appendChild(create("hr"));
	if(useScripts.profileBackground && useScripts.accessToken){
		let backgroundSettings = create("div",false,false,hohSettings);
		create("p","hohMonospace",
`Set a profile background, like this:
	red
	#640064
	url(https://www.example.com/myBackground.jpg)
	<any css background shorthand>

	Tip: Use a colour with transparancy set, to respect light and dark themes. Example: rgb(100,0,100,0.4)

	Tip2: Do you want a faded image, staying fixed in place, and filling the screen? This is how:
	linear-gradient(rgb(var(--color-background),0.8),rgb(var(--color-background),0.8)),url(https://www.example.com/myBackground.jpg) center/100% fixed
`,
		backgroundSettings);
		let inputField = create("input",false,false,backgroundSettings);
		inputField.value = useScripts.profileBackgroundValue;
		create("br",false,false,backgroundSettings);
		let backgroundChange = create("button",["hohButton","button"],"Submit",backgroundSettings);
		backgroundChange.onclick = function(){
			useScripts.profileBackgroundValue = inputField.value;
			useScripts.save();
			let jsonMatch = userObject.about.match(/^<!--(\{.*})-->/);
			let profileJson = {};
			if(jsonMatch){
				try{
					profileJson = JSON.parse(jsonMatch[1])
				}
				catch(e){
					console.warn("Invalid profile JSON")
				}
			}
			profileJson.background = useScripts.profileBackgroundValue;
			let newDescription = "<!--" + JSON.stringify(profileJson) + "-->" + (userObject.about.replace(/^<!--\{.*}-->/,""));
			authAPIcall(
				`mutation($about: String){
					UpdateUser(about: $about){
						about
					}
				}`,
				{about: newDescription},function(data){/*later*/}
			)
		};
		hohSettings.appendChild(create("hr"));
	};
	if(useScripts.customCSS && useScripts.accessToken){
		let backgroundSettings = create("div",false,false,hohSettings);
		create("p",false,"Add custom CSS to your profile. This will be visible to others.",backgroundSettings);
		let inputField = create("textarea",false,false,backgroundSettings);
		inputField.value = useScripts.customCSSValue;
		create("br",false,false,backgroundSettings);
		let backgroundChange = create("button",["hohButton","button"],"Submit",backgroundSettings);
		backgroundChange.onclick = function(){
			useScripts.customCSSValue = inputField.value;
			useScripts.save();
			let jsonMatch = userObject.about.match(/^<!--(\{.*})-->/);
			let profileJson = {};
			if(jsonMatch){
				try{
					profileJson = JSON.parse(jsonMatch[1])
				}
				catch(e){
					console.warn("Invalid profile JSON")
				}
			}
			profileJson.customCSS = useScripts.customCSSValue;
			let newDescription = "<!--" + JSON.stringify(profileJson) + "-->" + (userObject.about.replace(/^<!--\{.*}-->/,""));
			authAPIcall(
				`mutation($about: String){
					UpdateUser(about: $about){
						about
					}
				}`,
				{about: newDescription},function(data){/*later*/}
			)
		};
		hohSettings.appendChild(create("hr"));
	};

	create("p",false,"Delete all custom settings. Re-installing the script will not do that by itself.",hohSettings);
	let cleanEverything= create("button",["hohButton","button","danger"],"Default Settings",hohSettings);
	cleanEverything.onclick = function(){
		localStorage.removeItem("hohSettings");
		window.location.reload(false);
	}
	create("hr","hohSeparator",false,hohSettings);
	let loginURL = create("a",false,"Sign in with the script",hohSettings);
	loginURL.href = authUrl;
	loginURL.style.color = "rgb(var(--color-blue))";
	create("p",false,"Enables or improves every module in the \"Login\" tab, improves those greyed out.",hohSettings);
}

function addMoreStats(){
	if(!document.URL.match(/\/stats\/?/)){
		return
	};
	if(document.querySelector(".hohStatsTrigger")){
		return
	};
	let filterGroup = document.querySelector(".filter-wrap");
	if(!filterGroup){
		setTimeout(function(){
			addMoreStats()
		},200);//takes some time to load
		return;
	};
	let hohStats;
	let hohGenres;
	let regularGenresTable;
	let regularTagsTable;
	let regularAnimeTable;
	let regularMangaTable;
	let animeStaff;
	let mangaStaff;
	let animeStudios;
	let hohStatsTrigger = create("span","hohStatsTrigger","More stats",filterGroup);
	let hohGenresTrigger = create("span","hohStatsTrigger","Genres & Tags",filterGroup);
	let hohSiteStats = create("a","hohStatsTrigger","Site Stats",filterGroup);
	hohSiteStats.href = "/site-stats";
	let generateStatPage = function(){
		let personalStats = create("div","#personalStats","loading anime list...",hohStats);
		let personalStatsManga = create("div","#personalStatsManga","loading manga list...",hohStats);
		let miscQueries = create("div","#miscQueries",false,hohStats);
		create("hr","hohSeparator",false,miscQueries);
		create("h1","hohStatHeading","Various queries",miscQueries);
		let miscInput = create("div",false,false,miscQueries,"padding-top:10px;padding-bottom:10px;");
		let miscOptions = create("div","#queryOptions",false,miscQueries);
		let miscResults = create("div","#queryResults",false,miscQueries);
		let user = decodeURIComponent(document.URL.match(/user\/(.+)\/stats\/?/)[1]);
		const loginMessage = "Requires being signed in to the script. You can do that at the bottom of the settings page https://anilist.co/settings/apps";
		let availableQueries = [
			{name: "First Activity",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let userFirstQuery =
					`query ($userId: Int) {
						Activity(sort: ID,userId: $userId){
							... on MessageActivity {
								id
								createdAt
							}
							... on TextActivity {
								id
								createdAt
							}
							... on ListActivity {
								id
								createdAt
							}
						}
					}`;
					generalAPIcall(userFirstQuery,{userId: userId},function(data){
						miscResults.innerText = "";
						let newPage = create("a",false,"https://anilist.co/activity/" + data.data.Activity.id,miscResults,"color:rgb(var(--color-blue));padding-right:30px;");
						newPage.href = "/activity/" + data.data.Activity.id;
						let createdAt = data.data.Activity.createdAt;
						create("span",false," " + (new Date(createdAt*1000)),miscResults);
						let possibleOlder = create("p",false,false,miscResults);
						for(var i=1;i<=15;i++){
							generalAPIcall(userFirstQuery,{userId: userId + i},function(data){
								if(!data){return};
								if(data.data.Activity.createdAt < createdAt){
									createdAt = data.data.Activity.createdAt;
									possibleOlder.innerText = "But the account is known to exist already at " + (new Date(createdAt * 1000));
								}
							})
						}
					},"hohFirstActivity" + data.data.User.id,60*1000);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Rank",code: function(){
				generalAPIcall(
					"query($name:String){User(name:$name){name stats{watchedTime chaptersRead}}}",
					{name: user},
					function(data){
						miscResults.innerText = "";
						create("p",false,"NOTE: Due to an unfixed bug in the Anilist API, these results are increasingly out of date. This query is just kept here in case future changes allows it to work properly again.",miscResults);
						create("p",false,"Time watched: " + (data.data.User.stats.watchedTime/(60*24)).roundPlaces(1) + " days",miscResults);
						create("p",false,"Chapters read: " + data.data.User.stats.chaptersRead,miscResults);
						let ranks = {
							"anime": create("p",false,false,miscResults),
							"manga": create("p",false,false,miscResults)
						};
						let recursiveCall = function(userName,amount,currentPage,minPage,maxPage,type){
							ranks[type].innerText = capitalize(type) + " rank: [calculating...] range " + ((minPage - 1)*50 + 1) + " - " + (maxPage ? maxPage*50 : "");
							generalAPIcall(
								`
query($page:Int){
	Page(page:$page){
		pageInfo{lastPage}
		users(sort:${type === "anime" ? "WATCHED_TIME_DESC" : "CHAPTERS_READ_DESC"}){
			stats{${type === "anime" ? "watchedTime" : "chaptersRead"}}
		}
	}
}`,
								{page: currentPage},
								function(data){
									if(!maxPage){
										maxPage = data.data.Page.pageInfo.lastPage
									}
									let block = (
										type === "anime"
										? Array.from(data.data.Page.users,(a) => a.stats.watchedTime)
										: Array.from(data.data.Page.users,(a) => a.stats.chaptersRead)
									);
									if(block[block.length - 1] > amount){
										recursiveCall(userName,amount,Math.floor((currentPage + 1 + maxPage)/2),currentPage + 1,maxPage,type);
										return;
									}
									else if(block[0] > amount){
										block.forEach(function(item,index){
											if(amount === item){
												ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage - 1)*50 + index + 1);
												return;
											}
										})
									}
									else if(block[0] === amount){
										if(minPage === currentPage){
											ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage-1)*50 + 1)
										}
										else{
											recursiveCall(userName,amount,Math.floor((minPage + currentPage)/2),minPage,currentPage,type)
										};
										return;
									}
									else{
										recursiveCall(userName,amount,Math.floor((minPage + currentPage - 1)/2),minPage,currentPage - 1,type);
										return;
									};
								},"hohRank" + type + currentPage,60*60*1000
							);
						};
						recursiveCall(user,data.data.User.stats.watchedTime,1000,1,undefined,"anime");
						recursiveCall(user,data.data.User.stats.chaptersRead,500,1,undefined,"manga");
					},"hohRankStats" + user,2*60*1000
				);
			}},
			{name: "Hidden media entries",code: function(){
				miscResults.innerText = "";
				let pageCounter = create("p",false,false,miscResults);
				let pager = function(page,user){
					generalAPIcall(
`query ($userName: String,$page:Int) {
	Page(page:$page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(userName:$userName){
			hiddenFromStatusLists
			mediaId
			media{
				type
				title{romaji}
			}
			customLists(asArray:true)
		}
	}
}`,
						{
						  	page: page,
							userName: user
						},
						function(data){
							if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage){
								setTimeout(function(){
									pager(data.data.Page.pageInfo.currentPage + 1,user)
								},800);
							}
							pageCounter.innerText = "Searching page " + data.data.Page.pageInfo.currentPage + " of " + data.data.Page.pageInfo.lastPage;
							data.data.Page.mediaList.forEach(function(media){
								if(
									media.hiddenFromStatusLists
									&& media.customLists.every(cl => cl.enabled === false)
								){
									create("a","newTab",media.media.title.romaji,miscResults,"display:block;")
										.href = "/" + media.media.type.toLowerCase() + "/" + media.mediaId
								}
							})
						}
					);
				};pager(1,user);
			}},
			{name: "Notification count",code: function(){
				if(useScripts.accessToken){
					authAPIcall("query{Page{pageInfo{total}notifications{...on AiringNotification{id}}}}",{},function(data){
						miscResults.innerText = 
`${data.data.Page.pageInfo.total} notifications.
This is your notification count. The notifications of other users are private.`
					})
				}
				else{
					miscResults.innerText = 
`Error: Not signed in with the script. Reading notifications requires AUTH permissions.
You can sign in with the script from the settings page.`
				}
			}},
			{name: "Message Stats",code: function(){
				generalAPIcall(
					``,
					{name: user},
					data => {}
				)
			}},
			{name: "Related anime not on list",code: function(){
				generalAPIcall(
`query($name: String!){
	MediaListCollection(userName: $name,type: ANIME){
		lists{
			entries{
				mediaId
				score
				status
				media{
					relations{
						nodes{
							id
							title{romaji}
							type
						}
					}
				}
			}
		}
	}
}`,
				{name: user},function(data){
					let list = returnList(data,true);
					let listEntries = new Set(list.map(a => a.mediaId));
					let found = [];
					list.forEach(function(media){
						if(media.status !== "PLANNING"){
							media.media.relations.nodes.forEach(function(relation){
								if(!listEntries.has(relation.id) && relation.type === "ANIME"){
									relation.host = media.score;
									found.push(relation);
								}
							})
						}
					});
					found = removeGroupedDuplicates(
						found,
						e => e.id,
						(oldElement,newElement) => {
							newElement.host = Math.max(oldElement.host,newElement.host)
						}
					).sort(
						(b,a) => a.host - b.host
					);
					miscResults.innerText = "Found " + found.length + " shows:";
					found.forEach(
						item => create("a",["link","newTab"],item.title.romaji,miscResults,"display:block;padding:5px;")
							.href = "/anime/" + item.id
					)
				})
			}},
			{name: "Check compatibility with all following (slow)",setup: function(){
				create("span",false,"List Type: ",miscOptions);
				let select = create("select","#typeSelect",false,miscOptions);
				let animeOption = create("option",false,"Anime",select);
				let mangaOption = create("option",false,"Manga",select);
				animeOption.value = "ANIME";
				mangaOption.value = "MANGA";
			},code: function(){
				miscResults.innerText = "";
				let loadingStatus = create("p",false,false,miscResults);
				loadingStatus.innerText = "Looking up ID...";
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let currentLocation = location.pathname;
					loadingStatus.innerText = "Loading media list...";
					let typeList = document.getElementById("typeSelect").value;
					generalAPIcall(
						queryMediaListCompat,
						{
							name: user,
							listType: typeList
						},
						function(data){
							loadingStatus.innerText = "Loading users...";
							let comDisplay = create("div",false,false,miscResults);
							let list = returnList(data).filter(element => element.scoreRaw);
							let comCache = [];
							let drawComCache = function(){
								removeChildren(comDisplay)
								comCache.forEach(function(friend){
									let userRow = create("p",false,false,comDisplay);
									let differenceSpan = create("span",false,friend.difference.toPrecision(3),userRow,"min-width:60px;display:inline-block;");
									if(friend.difference < 0.9){
										differenceSpan.style.color = "green"
									}
									else if(friend.difference > 1.1){
										differenceSpan.style.color = "red"
									};
									let friendLink = create("a","newTab",friend.user,userRow,"color:rgb(var(--color-blue))");
									friendLink.href = "/user/" + friend.user;
									create("span",false,", " + friend.shared + " shared.",userRow);
								})
							};
							let friendsCaller = function(page){
								generalAPIcall(
									`query($id: Int!,$page: Int){
										Page(page: $page){
											pageInfo{
												lastPage
											}
											following(userId: $id,sort: USERNAME){
												name
											}
										}
									}`,
									{id: userId,page: page},
									function(data){
										let index = 0;
										let delayer = function(){
											if(location.pathname !== currentLocation){
												return
											}
											loadingStatus.innerText = "Comparing with " + data.data.Page.following[index].name + "...";
											compatCheck(list,data.data.Page.following[index].name,typeList,function(data){
												if(data.difference){
													comCache.push(data);
													comCache.sort((a,b) => a.difference - b.difference);
													drawComCache();
												}
											});
											if(++index < data.data.Page.following.length){
												setTimeout(delayer,1000)
											}
											else{
												if(page < data.data.Page.pageInfo.lastPage){
													friendsCaller(page + 1)
												}
												else{
													loadingStatus.innerText = ""
												}
											}
										};delayer(index);
									}
								)
							};friendsCaller(1);
						},"hohCompatANIME" + user,5*60*1000
					);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Message spy",code: function(){
				miscResults.innerText = "";
				let page = 1;
				let results = create("div",false,false,miscResults);
				let moreButton = create("button",["button","hohButton"],"Load more",miscResults);
				let getPage = function(page){
					generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(type: MESSAGE,sort: ID_DESC){
			... on MessageActivity{
				id
				recipient{name}
				message(asHtml: true)
				pure:message(asHtml: false)
				createdAt
				messenger{name}
			}
		}
	}
}`,
						{page: page},
						data => {
							data.data.Page.activities.forEach(function(message){
								if(
									message.pure.includes("AWC")
									|| message.pure.match(/^.{0,8}(thanks|tha?n?x|thank|ty).*follow.{0,10}(http.*(jpg|png|gif))?.{0,10}$/i)
									|| message.pure.match(/for( the)? follow/i)
								){
									return
								};
								let time = new Date(message.createdAt*1000);
								let newElem = create("div","message",false,results);
								create("span","time",time.toISOString().match(/^(.*)\.000Z$/)[1] + " ",newElem);
								let user = create("a",["link","newTab"],message.messenger.name,newElem,"color:rgb(var(--color-blue))");
								user.href = "/user/" + message.messenger.name;
								create("span",false," sent a message to ",newElem);
								let user2 = create("a",["link","newTab"],message.recipient.name,newElem,"color:rgb(var(--color-blue))");
								user2.href = "/user/" + message.recipient.name;
								let link = create("a",["link","newTab"]," Link",newElem);
								link.href = "/activity/" + message.id;
								newElem.innerHTML += message.message;
								create("hr",false,false,results);
							})
						}
					);
				};getPage(page);
				moreButton.onclick = function(){
					page++;
					getPage(page);
				}
			}},
			{name: "Media statistics of friends",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					generalAPIcall(
						`
query($userId: Int!){
	a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
	a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
	a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
	a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
	a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
	a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
	a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
	a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
	a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
	a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
	User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	statistics{
		anime{
			count
			minutesWatched
		}
		manga{
			count
			chaptersRead
			volumesRead
		}
	}
	stats{
		watchedTime
		chaptersRead
	}
}`,
						{userId: data.data.User.id},
						function(stats){
							let userList = [].concat(
								...Object.keys(stats.data).map(
									a => stats.data[a].following || []
								)
							);
							userList.push(stats.data.User);
							//API error polyfill
							userList.forEach(function(wrong){
								if(!wrong.statistics.anime.minutesWatched){
									wrong.statistics.anime.minutesWatched = wrong.stats.watchedTime
								}
								if(!wrong.statistics.manga.chaptersRead){
									wrong.statistics.manga.chaptersRead = wrong.stats.chaptersRead
								}
							});
							userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
							miscResults.innerText = "";
							let drawUserList = function(){
								removeChildren(miscResults)
								let table = create("div",["table","hohTable","hohNoPointer","good"],false,miscResults);
								let headerRow = create("div",["header","row"],false,table);
								let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
								let animeCountHeading = create("div",false,"Anime Count",headerRow,"cursor:pointer;");
								let animeTimeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
								let mangaCountHeading = create("div",false,"Manga Count",headerRow,"cursor:pointer;");
								let mangaChapterHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
								let mangaVolumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
								userList.forEach(function(user,index){
									let row = create("div","row",false,table);
									if(user.name === stats.data.User.name || user.name === whoAmI){
										row.style.color = "rgb(var(--color-blue))";
										row.style.background = "rgb(var(--color-background))";
									}
									let nameCel = create("div",false,(index + 1) + " ",row);
									let userLink = create("a",["link","newTab"],user.name,nameCel);
									userLink.href = "/user/" + user.name;
									create("div",false,user.statistics.anime.count,row);
									let timeString = formatTime(user.statistics.anime.minutesWatched*60);
									if(!user.statistics.anime.minutesWatched){
										timeString = "-"
									}
									create("div",false,timeString,row);
									create("div",false,user.statistics.manga.count,row);
									if(user.statistics.manga.chaptersRead){
										create("div",false,user.statistics.manga.chaptersRead,row)
									}
									else{
										create("div",false,"-",row)
									}
									if(user.statistics.manga.volumesRead){
										create("div",false,user.statistics.manga.volumesRead,row)
									}
									else{
										create("div",false,"-",row)
									}
								});
								nameHeading.onclick = function(){
									userList.sort(ALPHABETICAL(a => a.name));
									drawUserList();
								};
								animeCountHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.anime.count - b.statistics.anime.count);
									drawUserList();
								};
								animeTimeHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
									drawUserList();
								};
								mangaCountHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.count - b.statistics.manga.count);
									drawUserList();
								};
								mangaChapterHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.chaptersRead - b.statistics.manga.chaptersRead);
									drawUserList();
								};
								mangaVolumeHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.volumesRead - b.statistics.manga.volumesRead);
									drawUserList();
								};
							};drawUserList();
						}
					)
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Most popular favourites of friends",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					generalAPIcall(
						`
query($userId: Int!){
	a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
	a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
	a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
	a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
	a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
	a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
	a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
	a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
	a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
	a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
	User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	favourites{
		anime1:anime(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		anime2:anime(page:2){
			nodes{
				id
				title{romaji}
			}
		}
		manga1:manga(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		manga2:manga(page:2){
			nodes{
				id
				title{romaji}
			}
		}
	}
}`,
						{userId: data.data.User.id},
						function(foll){
							let userList = [].concat(
								...Object.keys(foll.data).map(
									a => foll.data[a].following || []
								)
							);
							let me = foll.data.User;
							me.favourites.anime = me.favourites.anime1.nodes.concat(me.favourites.anime2.nodes);
							delete me.favourites.anime1;
							delete me.favourites.anime2;
							me.favourites.manga = me.favourites.manga1.nodes.concat(me.favourites.manga2.nodes);
							delete me.favourites.manga1;
							delete me.favourites.manga2;
							let animeFavs = {};
							let mangaFavs = {};
							userList.forEach(function(user){
								user.favourites.anime = user.favourites.anime1.nodes.concat(user.favourites.anime2.nodes);
								delete user.favourites.anime1;
								delete user.favourites.anime2;
								user.favourites.anime.forEach(fav => {
									if(animeFavs[fav.id]){
										animeFavs[fav.id].count++
									}
									else{
										animeFavs[fav.id] = {
											count: 1,
											title: fav.title.romaji
										}
									}
								});
								user.favourites.manga = user.favourites.manga1.nodes.concat(user.favourites.manga2.nodes);
								delete user.favourites.manga1;
								delete user.favourites.manga2;
								user.favourites.manga.forEach(fav => {
									if(mangaFavs[fav.id]){
										mangaFavs[fav.id].count++
									}
									else{
										mangaFavs[fav.id] = {
											count: 1,
											title: fav.title.romaji
										}
									}
								})
							});
							miscResults.innerText = "";
							create("h1",false,"Anime:",miscResults,"color:rgb(var(--color-blue))");
							Object.keys(animeFavs).map(key => animeFavs[key]).sort((b,a) => a.count - b.count).slice(0,20).forEach(function(entry){
								create("p",false,entry.count + ": " + entry.title,miscResults)
							});
							create("h1",false,"Manga:",miscResults,"color:rgb(var(--color-blue))");
							Object.keys(mangaFavs).map(key => mangaFavs[key]).sort((b,a) => a.count - b.count).slice(0,20).forEach(function(entry){
								create("p",false,entry.count + ": " + entry.title,miscResults)
							});
							create("h1",false,"Similar favs:",miscResults,"color:rgb(var(--color-blue))");
							let sharePerc = user => {
								let total = user.favourites.anime.length + user.favourites.manga.length + me.favourites.anime.length + me.favourites.manga.length;
								let shared = user.favourites.anime.filter(
									a => me.favourites.anime.some(
										b => a.id === b.id
									)
								).length + user.favourites.manga.filter(
									a => me.favourites.manga.some(
										b => a.id === b.id
									)
								).length;
								return shared/total;
							};
							userList.sort((b,a) => sharePerc(a) - sharePerc(b));
							userList.slice(0,10).forEach(entry => {
								let row = create("p",false,false,miscResults);
								create("a","newTab",entry.name,row)
									.href = "/user/" + entry.name
							});
						}
					)
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Fix your dating mess",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
					let delay = 0;
					miscResults.innerText = "";
					removeChildren(miscResults)
					removeChildren(miscOptions)
					let config = [
						{
							description: "Completion date before start date",
							code: media => fuzzyDateCompare(media.startedAt,media.completedAt) === 0
						},{
							description: "Completion date before official end date",
							code: media => fuzzyDateCompare(media.media.endDate,media.completedAt) === 0
						},{
							description: "Start date before official release date",
							code: media => fuzzyDateCompare(media.media.startDate,media.startedAt) === 0
						},{
							description: "Status completed but no completion date set",
							code: media => media.status === "COMPLETED" && !media.completedAt.year
						},{
							description: "Status completed but no start date set",
							code: media => media.status === "COMPLETED" && !media.startedAt.year
						},{
							description: "Status dropped but no start date set",
							code: media => media.status === "DROPPED" && !media.startedAt.year
						},{
							description: "Status current but no start date set",
							code: media => media.status === "CURRENT" && !media.startedAt.year
						},{
							description: "Planning entry with start date",
							code: media => media.status === "PLANNING" && media.startedAt.year
						},{
							description: "Dates in the far future or past",
							code: media => (
									media.startedAt.year && (media.startedAt.year < 1960 || media.startedAt.year > (new Date().getFullYear() + 3))
								) || (
									media.completedAt.year && (media.completedAt.year < 1960 || media.completedAt.year > (new Date().getFullYear() + 3))
								)
						}
					];
					config.forEach(function(setting){
						let row = create("p",false,false,miscOptions);
						let checkBox = createCheckbox(row);
						let label = create("span",false,setting.description,row);
						checkBox.checked = true;
						checkBox.onchange = function(){
							Array.from(miscResults.children).forEach(res => {
								if(res.children[1].innerText === setting.description){
									if(checkBox.checked){
										res.style.display = "block"
									}
									else{
										res.style.display = "none"
									}
								}
							})
						}
					});
					let proc = function(data){
						let list = returnList(data,true);
						list.forEach(function(item){
							let matches = [];
							config.forEach(setting => {
								if(setting.code(item)){
									matches.push(setting.description)
								}
							});
							if(matches.length){
								let row = create("p",false,false,miscResults);
								let link = create("a",["link","newTab"],item.media.title.romaji,row,"width:440px;display:inline-block;");
								link.href = "/" + item.media.type.toLowerCase() + "/" + item.mediaId + "/" + safeURL(item.media.title.romaji);
								create("span",false,matches.join(", "),row);
								let chance = create("p",false,false,row,"margin-left:20px;margin-top: 2px;");
								create("span",false,"Entry created: " + (new Date(item.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
								if(
									(new Date(item.createdAt*1000)).toISOString().split("T")[0]
									!== (new Date(item.updatedAt*1000)).toISOString().split("T")[0]
								){
									create("span",false,"Entry updated: " + (new Date(item.updatedAt*1000)).toISOString().split("T")[0] + " \n",chance);
								}
								if(item.repeat){
									create("span",false,"Repeats: " + item.repeat + " \n",chance);
								}
								setTimeout(function(){
									generalAPIcall(
										`
										query($userId: Int,$mediaId: Int){
											first:Activity(userId: $userId,mediaId: $mediaId,sort: ID){... on ListActivity{createdAt siteUrl status progress}}
											last:Activity(userId: $userId,mediaId: $mediaId,sort: ID_DESC){... on ListActivity{createdAt siteUrl status progress}}
										}
										`,
										{
											userId: iddata.data.User.id,
											mediaId: item.mediaId
										},
										function(act){
											if(!act){return};
											let progressFirst = [act.data.first.status,act.data.first.progress].filter(TRUTHY).join(" ");
											progressFirst = (progressFirst ? " (" + progressFirst + ")" : "");
											let progressLast = [act.data.last.status,act.data.last.progress].filter(TRUTHY).join(" ");
											progressLast = (progressLast ? " (" + progressLast + ")" : "");
											if(act.data.first.siteUrl === act.data.last.siteUrl){
												let firstLink = create("a",["link","newTab"],"Only activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
												firstLink.href = act.data.first.siteUrl;
												create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
											}
											else{
												let firstLink = create("a",["link","newTab"],"First activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
												firstLink.href = act.data.first.siteUrl;
												create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
												let lastLink = create("a",["link","newTab"],"Last activity" + progressLast + ": ",chance,"color:rgb(var(--color-blue));");
												lastLink.href = act.data.last.siteUrl;
												create("span",false,(new Date(act.data.last.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
											}
										}
									);
								},delay);
								delay += 1000;
							}
						})
					};
					const query = `query($name: String!, $listType: MediaType){
							MediaListCollection(userName: $name, type: $listType){
								lists{
									entries{
										startedAt{year month day}
										completedAt{year month day}
										mediaId
										status
										createdAt
										updatedAt
										repeat
										media{
											title{romaji english native}
											startDate{year month day}
											endDate{year month day}
											type
										}
									}
								}
							}
						}`;
					generalAPIcall(
						query,
						{
							name: user,
							listType: "MANGA"
						},
						proc
					);
					generalAPIcall(
						query,
						{
							name: user,
							listType: "ANIME"
						},
						proc
					);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Fix your dating mess [Dangerous edition]",setup: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				};
				if(user.toLowerCase() !== whoAmI.toLowerCase()){
					miscResults.innerText = "This is the profile of\"" + user + "\", but currently signed in as \"" + whoAmI + "\". Are you sure this is right?";
					return
				};
				let warning = create("b",false,"Clicking on red buttons means changes to your data!",miscResults);
				let description = create("p",false,"When run, this will do the following:",miscResults);
				create("p",false,"- Completed entries with 1 episode/chapter, no rewatches, no start date, but a completion date will have the start date set equal to the completion date",miscResults);
				create("p",false,"- A list of all the changes will be printed.",miscResults);
				create("p",false,"- This will run slowly, and can be stopped at any time.",miscResults);
				let dryRun = create("button",["button","hohButton"],"Dry run",miscResults);
				let dryRunDesc = create("span",false,"(no changes made)",miscResults);
				create("hr",false,false,miscResults);
				let fullRun = create("button",["button","hohButton","danger"],"RUN",miscResults);
				let stopRun = create("button",["button","hohButton"],"Abort!",miscResults);
				create("hr",false,false,miscResults);
				let changeLog = create("div",false,false,miscResults);
				let allowRunner = true;
				let allowRun = true;
				let isDryRun = true;
				let list = [];
				let firstTime = true;
				let runner = function(){
					if(!allowRunner){
						return
					}
					allowRunner = false;
					fullRun.disabled = true;	
					dryRun.disabled = true;
					generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
						let proc = function(data){
							list = list.concat((returnList(data,true) || []).filter(
								item => item.status === "COMPLETED" && (item.media.episodes || item.media.chapters) === 1 && (!item.startedAt.year) && item.completedAt.year && !item.repeat
							));
							if(firstTime){
								firstTime = false;
								return
							};
							if(isDryRun){
								create("p",false,"DRY RUN",changeLog)
							};
							if(!list.length){
								changeLog.innerText = "No such entries found";
								return
							};
							create("p",false,"Found " + list.length + " entries.",changeLog);
							let changer = function(index){
								if(!allowRun){
									return
								};
								create("p",false,list[index].media.title.romaji + " start date set to " + list[index].completedAt.year + "-" + list[index].completedAt.month + "-" + list[index].completedAt.day,changeLog);
								if(!isDryRun){
									authAPIcall(
										`mutation($date: FuzzyDateInput,$mediaId: Int){
											SaveMediaListEntry(startedAt: $date,mediaId: $mediaId){
												id
											}
										}`,
										{mediaId: list[index].mediaId,date: list[index].completedAt},
										data => {}
									)
								};
								index++;
								if(index < list.length){
									setTimeout(function(){changer(index)},1000)
								};
							};changer(0);
						};
						const query = `query($name: String!, $listType: MediaType){
								MediaListCollection(userName: $name, type: $listType){
									lists{
										entries{
											startedAt{year month day}
											completedAt{year month day}
											mediaId
											status
											repeat
											media{
												title{romaji english native}
												chapters
												episodes
											}
										}
									}
								}
							}`;
						generalAPIcall(
							query,
							{
								name: user,
								listType: "MANGA"
							},
							proc
						);
						generalAPIcall(
							query,
							{
								name: user,
								listType: "ANIME"
							},
							proc
						);
					},"hohIDlookup" + user.toLowerCase())
				};
				stopRun.onclick = function(){
					allowRun = false;
					stopRun.disable = true;
					alert("Stopped!")
				};
				fullRun.onclick = function(){
					isDryRun = false;
					runner()
				};
				dryRun.onclick = function(){
					runner()
				};
			},code: function(){
				miscResults.innerText = "Read the description first!"
			}},
			{name: "Reviews",code: function(){
				miscResults.innerText = "";
				let dataHeader = create("div",false,false,miscResults);
				create("span",false,"There are ",dataHeader);
				let data_amount = create("span",false,"[loading...]",dataHeader);
				create("span",false," reviews on Anilist, with ",dataHeader);
				let data_ratingAmount = create("span",false,"[loading...]",dataHeader);
				create("span",false," ratings (",dataHeader);
				let data_ratingPositive = create("span",false,"[loading...]",dataHeader);
				create("span",false,"% positive)",dataHeader);
				generalAPIcall(
					`query ($page: Int) {
						Page (page: $page) {
							pageInfo {
								total
								perPage
								currentPage
								lastPage
								hasNextPage
							}
							reviews {
								id
							}
						}
					}`,
					{page: 1},
					function(data){
						data_amount.innerText = data.data.Page.pageInfo.total;
						let list = [];
						for(var i=1;i<=data.data.Page.pageInfo.lastPage;i++){
							generalAPIcall(
								`query ($page: Int){
									Page (page: $page){
										pageInfo{
											total
											perPage
											currentPage
											lastPage
											hasNextPage
										}
										reviews{
											id
											rating
											ratingAmount
											score
											user{
												name
												id
											}
											media{
												id
												title{romaji}
											}
										}
									}
								}`,
								{page: i},
								function(reviewData){
									list = list.concat(reviewData.data.Page.reviews);
									if(list.length !== reviewData.data.Page.pageInfo.total){
										return
									};
									list.sort((b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left);
									create("h3",false,"100 best reviews on Anilist",miscResults);
									let datalist1 = create("div",false,false,miscResults);
									list.slice(0,100).forEach((review,index) => {
										let dataCel = create("p",false,false,datalist1);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(review.rating,review.ratingAmount).left.toPrecision(3) + " ",dataCel);
										let userName = "[error]";
										if(review.user){
											if(review.user.name){
												userName = review.user.name
											}
										};
										create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
											.href = "/review/" + review.id
									});
									list.sort((a,b)=>wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
									create("h3",false,"100 worst reviews on Anilist",miscResults);
									let datalist2 = create("div",false,false,miscResults);
									list.slice(0,100).forEach((review,index) => {
										let dataCel = create("p",false,false,datalist2);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(review.rating,review.ratingAmount).right.toPrecision(3) + " ",dataCel);
										let userName = "[error]";
										if(review.user){
											if(review.user.name){
												userName = review.user.name
											}
										};
										create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
											.href = "/review/" + review.id
									});
									let reviewers = new Map();
									let ratings = 0;
									let positiveRatings = 0;
									list.forEach(rev => {
										ratings += rev.ratingAmount;
										positiveRatings += rev.rating;
										if(rev.user){
											if(rev.user.id){
												if(!reviewers.has(rev.user.id)){
													reviewers.set(rev.user.id,{
														id: rev.user.id,
														name: rev.user.name,
														rating: 0,
														ratingAmount: 0,
														amount: 0
													});
												}
												let person = reviewers.get(rev.user.id);
												person.rating += rev.rating;
												person.ratingAmount += rev.ratingAmount;
												person.amount++;
											};
										};
									});
									data_ratingAmount.innerText = ratings;
									data_ratingPositive.innerText = Math.round(100 * positiveRatings/ratings);
									reviewers = [...reviewers].map(
										pair => pair[1]
									).sort(
										(b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left
									);
									create("h3",false,"10 best reviewers on Anilist",miscResults);
									let datalist3 = create("div",false,false,miscResults);
									reviewers.slice(0,10).forEach((rev,index) => {
										let dataCel = create("p",false,false,datalist3);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).left.toPrecision(3) + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed"
									});
									reviewers.sort((a,b) => wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
									create("h3",false,"10 worst reviewers on Anilist",miscResults);
									let datalist4 = create("div",false,false,miscResults);
									reviewers.slice(0,10).forEach((rev,index) => {
										let dataCel = create("p",false,false,datalist4);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).right.toPrecision(3) + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed"
									});
									reviewers.sort(function(b,a){
										if(a.amount === b.amount){//rating as tie-breaker
											return a.rating/a.ratingAmount - b.rating/b.ratingAmount;
										}
										else{
											return a.amount - b.amount
										}
									});
									create("h3",false,"25 most prolific reviewers on Anilist",miscResults);
									let datalist5 = create("div",false,false,miscResults);
									let profilicSum = 0;
									reviewers.slice(0,25).forEach((rev,index) => {
										profilicSum += rev.amount;
										let dataCel = create("p",false,false,datalist5);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",rev.amount + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed";
										create("span",false," average rating: " + (100*rev.rating/rev.ratingAmount).toPrecision(2) + "%",dataCel);
									});
									create("p",false,"That's " + Math.round(100*profilicSum/list.length) + "% of all reviews on Anilist",miscResults);
									let average = (data.data.Page.pageInfo.total/reviewers.length).toPrecision(2);
									let median = Stats.median(reviewers.map(e => e.amount));
									let mode = Stats.mode(reviewers.map(e => e.amount));
									create("p",false,`${reviewers.length} users have contributed reviews (${average} reviews each on average, median ${median}, mode ${mode})`,miscResults);
									let lowRatingRating = 0;
									let lowRatingAmount = 0;
									let lowRatingCount = 0;
									let highRatingRating = 0;
									let highRatingAmount = 0;
									let highRatingCount = 0;
									let topRatingRating = 0;
									let topRatingAmount = 0;
									let topRatingCount = 0;
									let distribution = new Array(101).fill(0);//0 to 100 inclusive, since 0 is a valid review score
									create("hr",false,false,miscResults);
									list.forEach(review => {
										distribution[review.score]++;
										if(review.score <= 50){
											lowRatingRating += review.rating;
											lowRatingAmount+= review.ratingAmount;
											lowRatingCount++;
										}
										else{
											highRatingRating += review.rating;
											highRatingAmount+= review.ratingAmount;
											highRatingCount++;
											if(review.score == 100){
												topRatingRating += review.rating;
												topRatingAmount+= review.ratingAmount;
												topRatingCount++;
											}
										}
									});
									create("p",false,"The " + lowRatingCount + " reviews with a score 0-50 are rated " + (100*lowRatingRating/lowRatingAmount).toPrecision(2) + "% on average.",miscResults);
									create("p",false,"The " + highRatingCount + " reviews with a score 51-100 are rated " + (100*highRatingRating/highRatingAmount).toPrecision(2) + "% on average.",miscResults);
									create("p",false,"The " + topRatingCount + " reviews with a score 100/100 are rated " + (100*topRatingRating/topRatingAmount).toPrecision(2) + "% on average.",miscResults);

									create("p",false,"The average score for a review to give is " + Stats.average(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									create("p",false,"The median score for a review to give is " + Stats.median(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									create("p",false,"The most common score for a review to give is " + Stats.mode(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									const height = 250;
									const width = 700;
									let dia = svgShape("svg",miscResults,{
										width: width,
										height: height,
										viewBox: "0 0 " + width + " " + height
									});
									dia.style.borderRadius = "3px";
									let background = svgShape("rect",dia,{
										fill: "rgb(var(--color-foreground))",
										x: 0,
										y: 0,
										width: "100%",
										height: "100%"
									});
									let margin = {
										bottom: 30,
										top: 30,
										left: 20,
										right: 20
									};
									const bars = 101;
									const barWidth = 0.74 * (width - margin.left - margin.right)/bars;
									const barSpacing = 0.24 * (width - margin.left - margin.right)/bars;
									let maxVal = Math.max(...distribution);
									let magnitude = Math.pow(10,Math.floor(Math.log10(maxVal)));
									let mantissa = maxVal/magnitude;
									if(mantissa < 1.95){
										maxVal = 2*magnitude
									}
									else if(mantissa < 2.95){
										maxVal = 3*magnitude
									}
									else if(mantissa < 4.9){
										maxVal = 5*magnitude
									}
									else if(mantissa < 9.8){
										maxVal = 10*magnitude
									}
									else{
										maxVal = 15*magnitude
									};
									let valueFunction = function(val){
										return height - margin.bottom - (val/maxVal) * (height - margin.bottom - margin.top)
									};
									let title = svgShape("text",dia,{
										x: 10,
										y: 20,
										fill: "rgb(var(--color-text))"
									});
									title.textContent = "Review score distribution";
									distribution.forEach((val,index) => {
										if(!val){
											return;
										}
										let colour = "rgb(var(--color-text))";
										if(index % 10 === 0){
											colour = "rgb(61,180,242)";
											let text = svgShape("text",dia,{
												x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
												y: valueFunction(val) - barWidth,
												fill: colour,
												"text-anchor": "middle",
											});
											text.textContent = val;
											let text2 = svgShape("text",dia,{
												x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
												y: height - margin.bottom + 3*barWidth,
												fill: colour,
												"text-anchor": "middle",
											});
											text2.textContent = index;
										}
										else if(index % 10 === 5){
											colour = "rgb(123,213,85)"
										}
										svgShape("rect",dia,{
											x: margin.left + index*barWidth + index*barSpacing,
											y: valueFunction(val),
											width: barWidth,
											height: height - valueFunction(val) - margin.bottom,
											fill: colour
										})
									})
								}
							)
						};
					}
				);
			}},
			{name: "How many people have blocked you",code: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				}
				authAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data){
					generalAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data2){
						miscResults.innerText = "This only applies to you, regardless of what stats page you ran this query from.";
						if(data.data.Page.pageInfo.total === data2.data.Page.pageInfo.total){
							create("p",false,"No users have blocked you",miscResults)
						}
						else if((data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) < 0){
							create("p",false,"Error: The elevated privileges of moderators makes this query fail",miscResults)
						}
						else{
							create("p",false,(data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) + " users have blocked you",miscResults)
						}
					})
				})
			}},
			{name: "Find people you have blocked/are blocked by",code: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				}
				miscResults.innerText = `This only applies to you, regardless of what stats page you ran this query from. Furthermore, it probably won't find everyone.
Use the other query if you just want the number.`;
				let flag = true;
				let stopButton = create("button",["button","hohButton"],"Stop",miscResults,"display:block");
				let progress = create("p",false,false,miscResults);
				stopButton.onclick = function(){
					flag = false
				};
				let blocks = new Set();
				progress.innerText = "1 try..."
				let caller = function(page,page2){
					generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
				user{name}
			}
		}
	}
}`,
					{page: page},function(data){
						progress.innerText = (page + 1) + " tries...";
						authAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
			}
		}
	}
}`,						{page: page2},function(data2){
							let offset = 0;
							while(data2.data.Page.activities[offset].id > data.data.Page.activities[0].id){
								offset++
							};
							while(data2.data.Page.activities[0].id < data.data.Page.activities[-offset].id){
								offset--
							};
							for(var k=Math.max(-offset,0);k<data.data.Page.activities.length && (k + offset)<data2.data.Page.activities.length;k++){
								if(data.data.Page.activities[k].id !== data2.data.Page.activities[k + offset].id){
									offset--;
									if(!blocks.has(data.data.Page.activities[k].user.name)){
										let row = create("p",false,false,miscResults);
										let link = create("a",["link","newTab"],data.data.Page.activities[k].user.name,row);
										link.href = "/user/" + data.data.Page.activities[k].user.name;
										blocks.add(data.data.Page.activities[k].user.name)
									}
								};
							};
							if(flag){
								if(offset < -50){
									page2--
								};
								setTimeout(function(){caller(page + 1,page2 + 1)},2000)
							}
						})
					});
				};caller(1,1);
			}},
			{name: "BroomCat linter",setup: function(){
				create("p",false,"Welcome to BroomCat. It will help you find stray database items",miscOptions);
				let select = create("select","#typeSelect",false,miscOptions);
				let animeOption = create("option",false,"Anime",select);
				let mangaOption = create("option",false,"Manga",select);
				animeOption.value = "ANIME";
				mangaOption.value = "MANGA";
				createCheckbox(miscOptions,"restrictToList");
				create("span",false,"Restrict to personal list",miscOptions);
				create("h3",false,"Config",miscOptions);
				let conf = function(description,id,defaultValue,titleText){
					let option = create("p",false,false,miscOptions);
					let check = createCheckbox(option,id);
					let descriptionText = create("span",false,description + " ",option);
					if(defaultValue){
						check.checked = defaultValue
					}
					if(titleText){
						descriptionText.title = titleText
					}
				};
				[
					["End date before start date","startEnd",true],
					["Dates before 1900","earlyDates",true],
					["Missing dates","missingDates",true],
					["Incomplete dates","incompleteDates"],
					["No tags","noTags"],
					["No genres","noGenres"],
					["Has tag below 20%","lowTag",false,"Tags start out at 20%, so if it's below it's controversial"],
					["Has invalid genre","badGenre",true,"There's a fixed list of 19 genres, so anything else must be wrong"],
					["Missing banner","noBanner"],
					["Oneshot without one chapter","oneshot",false,"This is a requirement in the documentation"],
					["Missing MAL ID","idMal",false,"Anilist stores MAL IDs to make list imports and interactions between databases simpler"],
					["Duplicated MAL ID","duplicatedMALID"],
					["Missing native title","nativeTitle",true,"Everything has a native title, even if it's the same"],
					["Missing english title","englishTitle",false,"Not necessarily wrong, not everything is licensed"],
					["No duration","noDuration",true],
					["No chapter or episode count","noLength",true],
					["Multiple demographic tags","demographics"],
					["No studios","noStudios"],
					["Unusual length","unusualLength",true,"Doesn't have to be wrong, just check them"],
					["No source","noSource"],
					["Source = other","otherSource",false,"Anilist introduced new sources, so some of these may need to be changed"],
					["Source = original, but has source relation","badOriginalSource"],
					["More than one source","moreSource",false,"Doesn't have to be wrong, but many of these are"],
					["Adaptation older than source","newSource"],
					["Source field not equal to source media format","formatSource"],
					["Hentai with isAdult = false","nonAdultHentai"],
					["Synonym equal to title","redundantSynonym",true],
					["No extraLarge cover image","extraLarge"],
					["Temporary title","tempTitle",true,"Common for manga announcements"],
					["Romaji inconsistencies","badRomaji",true,"Catches some common romanisation errors"],
					["Weird spacing in title","weirdSpace",true],
					["TV/TV Short mixup","tvShort"],
					["Duplicated studio","duplicatedStudio"],
					["Has Twitter hashtag","hashtag",false,"Keep up with news"],
					["Releasing manga with non-zero chapter or volume count","releasingZero"],
					["Bad character encoding in description","badEncoding"],
					["Commonly misspelled words in description","badSpelling",true],
					["No description (or very short)","noDescription",true],
					["Very long description","longDescription"],
					["Likely outdated description","outdatedDescription",true,"Checks if the description appears to have been written before the series aired"]
				].forEach(ig => conf(...ig));
			},code: function(){
				let type = document.getElementById("typeSelect").value;
				let restrict = document.getElementById("restrictToList").checked;
				let require = new Set();
				let malIDs = new Set();
				let config = [
					{name: "startEnd",description: "End date before start date",code: function(media){
						if(!media.startDate.year || !media.endDate.year){
							return false
						}
						if(media.startDate.year > media.endDate.year){
							return true
						}
						else if(media.startDate.year < media.endDate.year){
							return false
						}
						if(!media.startDate.month || !media.endDate.month){
							return false
						}
						if(media.startDate.month > media.endDate.month){
							return true
						}
						else if(media.startDate.month < media.endDate.month){
							return false
						}
						if(!media.startDate.day || !media.endDate.day){
							return false
						}
						if(media.startDate.day > media.endDate.day){
							return true
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}"]},
					{name: "earlyDates",description: "Dates before 1900",code: function(media){
						return (media.startDate.year && media.startDate.year < 1900) || (media.endDate.year && media.endDate.year < 1900)
					},require: ["startDate{year month day}","endDate{year month day}"]},
					{name: "missingDates",description: "Missing dates",code: function(media){
						if(media.status === "FINISHED"){
							return (!media.startDate.year) || (!media.endDate.year);
						}
						else if(media.status === "RELEASING"){
							return !media.startDate.year;
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}","status"]}
,
					{name: "incompleteDates",description: "Incomplete dates",code: function(media){
						if(media.status === "FINISHED"){
							return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day) || (!media.endDate.year) || (!media.endDate.month) || (!media.endDate.day);
						}
						else if(media.status === "RELEASING"){
							return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day)
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}","status"]},
					{name: "noTags",description: "No tags",code: function(media){
						return media.tags.length === 0;
					},require: ["tags{rank name}"]},
					{name: "noGenres",description: "No genres",code: function(media){
						return media.genres.length === 0;
					},require: ["genres"]},
					{name: "lowTag",description: "Has tag below 20%",code: function(media){
						return media.tags.some(tag => tag.rank < 20);
					},require: ["tags{rank name}"]},
					{name: "demographics",description: "Multiple demographic tags",code: function(media){
						return media.tags.filter(tag => ["Shounen","Shoujo","Josei","Seinen","Kids"].includes(tag.name)).length > 1;
					},require: ["tags{rank name}"]},
					{name: "badGenre",description: "Has invalid genre",code: function(media){
						return media.genres.some(genre => !["Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Hentai","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"].includes(genre));
					},require: ["genres"]},
					{name: "noBanner",description: "Missing banner",code: function(media){
						return !media.bannerImage
					},require: ["bannerImage"]},
					{name: "oneshot",description: "Oneshot without one chapter",code: function(media){
						return media.format === "ONE_SHOT" && media.chapters !== 1;
					},require: ["chapters"]},
					{name: "idMal",description: "Missing MAL ID",code: function(media){
						return !media.idMal
					},require: ["idMal"]},
					{name: "duplicatedMALID",description: "Duplicated MAL ID",code: function(media){
						if(media.idMal){
							if(malIDs.has(media.idMal)){
								return true
							}
							else{
								malIDs.add(media.idMal)
								return false
							}
						}
					},require: ["idMal"]},
					{name: "nativeTitle",description: "Missing native title",code: function(media){
						return !media.title.native
					}},
					{name: "englishTitle",description: "Missing english title",code: function(media){
						return !media.title.english
					}},
					{name: "noDuration",description: "No duration",code: function(media){
						return media.type === "ANIME" && media.status !== "NOT_YET_RELEASED" && !media.duration;
					},require: ["type","duration","status"]},
					{name: "noLength",description: "No chapter or episode count",code: function(media){
						if(media.status !== "FINISHED"){
							return false
						}
						if(media.type === "ANIME"){
							return !media.episodes
						}
						else{
							return !media.chapters
						}
					},require: ["type","chapters","episodes","status"]},
					{name: "noStudios",description: "No studios",code: function(media){
						return media.type === "ANIME" && !media.studios.nodes.length;
					},require: ["type","studios{nodes{id}}"]},
					{name: "unusualLength",description: "Unusual Length",code: function(media){
						if(media.type === "ANIME"){
							return (media.episodes && media.episodes > 1000) || (media.duration && media.duration > 180);
						}
						else{
							return (media.cahpters && media.chapters > 2000) || (media.volumes && media.volumes > 150);
						}
					},require: ["type","chapters","volumes","duration","episodes"]},
					{name: "noSource",description: "No source",code: function(media){
						return !media.source;
					},require: ["source(version: 2)"]},
					{name: "otherSource",description: "Source = other",code: function(media){
						return (media.source && media.source === "OTHER");
					},require: ["source(version: 2)"]},
					{name: "badOriginalSource",description: "Source = original, but has source relation",code: function(media){
						let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
						return source.length && (media.source && media.source === "ORIGINAL")
					},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{name: "redundantSynonym",description: "Synonym equal to title",code: function(media){
						return media.synonyms.some(
							word => word === media.title.romaji
						)
						|| (media.title.native && media.synonyms.some(
							word => word === media.title.native
						))
						|| (media.title.english && media.synonyms.some(
							word => word === media.title.english
						));
					},require: ["synonyms"]},
					{name: "hashtag",description: "Has Twitter hashtag",code: function(media){
						return !!media.hashtag;
					},require: ["hashtag"]},
					{name: "nonAdultHentai",description: "Hentai with isAdult = false",code: function(media){
						return (media.genres.includes("Hentai") && !media.isAdult);
					},require: ["genres","isAdult"]},
					{name: "extraLarge",description: "No extraLarge cover image",code: function(media){
						return media.coverImage.large && media.coverImage.large === media.coverImage.extraLarge;
					},require: ["coverImage{large extraLarge}"]},
					{name: "tempTitle",description: "Temporary title",code: function(media){
						return media.title.romaji.toLowerCase() === "(Title to be Announced)".toLowerCase()
							|| (media.title.native && media.title.native.toLowerCase() === "(Title to be Announced)".toLowerCase())
							|| media.title.romaji.includes("(Provisional Title)")
							|| (media.title.native && media.title.native.includes("（仮）"));
					}},
					{name: "badRomaji",description: "Romaji inconsistencies",code: media =>
						["～","「","」","ō","ū","。","！","？","Toukyou","Oosaka"].some(
							char => media.title.romaji.includes(char)
						) || (
							media.title.native && (
								(media.title.native.includes("っち") && media.title.romaji.includes("tchi"))
								|| (media.title.native.includes("っちゃ") && media.title.romaji.includes("tcha"))
								|| (media.title.native.includes("っちょ") && media.title.romaji.includes("tcho"))
								|| (media.title.native.includes("☆") && !media.title.romaji.includes("☆"))
								|| (media.title.native.includes("♪") && !media.title.romaji.includes("♪"))
							)
						)
					},
					{name: "weirdSpace",description: "Weird spacing in title",code: function(media){
						return (
							(media.title.native || "").trim().replace("  "," ") !== (media.title.native || "")
							|| (media.title.romaji || "").trim().replace("  "," ") !== (media.title.romaji || "")
							|| (media.title.english || "").trim().replace("  "," ") !== (media.title.english || "")
						)
					},require: ["duration"]},
					{name: "tvShort",description: "TV/TV Short mixup",code: function(media){
						if(media.duration){
							return (media.format === "TV" && media.duration < 15) || (media.format === "TV_SHORT" && media.duration >= 15)
						}
						return false;
					},require: ["duration"]},
					{name: "newSource",description: "Adaptation older than source",code: function(media){
						return media.sourcing.edges.some(function(edge){
							if(edge.relationType === "SOURCE"){
								return fuzzyDateCompare(edge.node.startDate,media.startDate) === 0
							}
							return false
						})
					},require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{
						name: "moreSource",
						description: "More than one source",
						code: media => media.sourcing.edges.filter(edge => edge.relationType === "SOURCE").length > 1
							&& ![477,6].includes(media.id),//aria, trigun
						require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]
					},
					{name: "formatSource",description: "Source field not equal to source media format",code: function(media){
						let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
						return source.length && media.source
							&& (
								(source[0].node.format !== media.source)
								&& !(source[0].node.format === "NOVEL" && media.source === "LIGHT_NOVEL")
							)
					},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{name: "releasingZero",description: "Releasing manga with non-zero chapter or volume count",code: function(media){
						return media.format === "MANGA" && media.status === "RELEASING" && (media.chapters || media.volumes)
					},require: ["status","chapters","volumes"]},
					{name: "duplicatedStudio",description: "Duplicated studio",code: function(media){
						return (new Set(media.studios.nodes)).size !== media.studios.nodes.length;
					},require: ["studios{nodes{id}}"]},
					{
						name: "badEncoding",
						description: "Bad character encoding in description",
						code: media => {
							return ["</br>","&#39","[1]","[2]","â€™"].some(error => media.description.includes(error))
						},
						require: ["description"]
					},
					{
						name: "badSpelling",
						description: "Bad character encoding in description",
						code: media => {
							return ["animes ","mangas "].some(error => media.description.includes(error))
						},
						require: ["description"]
					},
					{
						name: "noDescription",
						description: "No description",
						code: media => media.description.length < 15,
						require: ["description"]
					},
					{
						name: "longDescription",
						description: "Very long description",
						code: media => media.description.length > 4000,
						require: ["description"]
					},
					{
						name: "outdatedDescription",
						description: "Likely outdated description",
						code: media => [
"upcoming adaptation","will cover","sceduled for","next year","will adapt","announced","will air"," tba"
						].some(text => media.description.toLowerCase().includes(text)) && media.status === "FINISHED",
						require: ["description","status"]
					}
				];
				config.forEach(function(setting){
					setting.active = document.getElementById(setting.name).checked;
					if(setting.active && setting.require){
						setting.require.forEach(field => require.add(field))
					}
				});
				let query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		media(type: $type,sort: POPULARITY_DESC){
			id
			title{romaji native english}
			format
			${[...require].join(" ")}
		}
	}
}`;
				if(restrict){
					query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(type: $type,sort: MEDIA_ID,userName: "${user}"){
			media{
				id
				title{romaji native english}
				format
				${[...require].join(" ")}
			}
		}
	}
}`;
				}
				miscResults.innerText = "";
				let flag = true;
				let stopButton = create("button",["button","hohButton"],"Stop",miscResults);
				let progress = create("p",false,false,miscResults);
				stopButton.onclick = function(){
					flag = false;
				};
				let caller = function(page){
					generalAPIcall(query,{type: type,page: page},function(data){
						data = data.data.Page;
						if(data.mediaList){
							data.media = data.mediaList.map(item => item.media);
						};
						data.media.forEach(media => {
							progress.innerText = "Page " + page + " of " + data.pageInfo.lastPage;
							let matches = config.filter(
								setting => setting.active && setting.code(media)
							).map(setting => setting.description);
							if(matches.length){
								let row = create("p",false,false,miscResults);
								create("a",["link","newTab"],"[" + media.format + "] " + media.title.romaji,row,"width:440px;display:inline-block;")
									.href = "/" + type.toLowerCase() + "/" + media.id;
								create("span",false,matches.join(", "),row);
							};
						});
						if(flag && data.pageInfo.currentPage < data.pageInfo.lastPage && document.getElementById("queryOptions")){
							setTimeout(function(){caller(page + 1)},1000)
						}
					});
				};caller(1);
			}},
			{name: "YiffDog officer",setup: function(){
				create("p",false,"Welcome to YiffDog. He's a relative of BroomCat, focused on the social aspect of the site. This police dog is just out of beta, so he doesn't have many options yet.",miscOptions);
				create("p",false,"(If you're reading this, it's probably not even usable yet).",miscOptions);
				create("p","danger","Do not needlessly interact with what's flagged here, limit that to honest mistakes. Silently report, or send mod messages when appropriate.",miscOptions);
				createCheckbox(miscOptions,"activities",true);
				create("span",false,"Activities",miscOptions);
				createCheckbox(miscOptions,"messages",true);
				create("span",false,"Messages",miscOptions);
				createCheckbox(miscOptions,"forum",true);
				create("span",false,"Forum",miscOptions);
				createCheckbox(miscOptions,"reviews",true);
				create("span",false,"Reviews",miscOptions);
				create("h3",false,"Config",miscOptions);
				let conf = function(description,id,defaultValue,titleText){
					let option = create("p",false,false,miscOptions);
					let check = createCheckbox(option,id);
					let descriptionText = create("span",false,description + " ",option);
					if(defaultValue){
						check.checked = defaultValue;
					}
					if(titleText){
						descriptionText.title = titleText;
					}
				};
				[
					["Link-only","linkOnly",true],
					["Bad words","badWords",true,"I'm not claiming all or any of the words in the internal list are inheritely bad, they are just a useful heuristic"],
					["Piracy links","piracy",true],
					["High activity","highActivity",true]
				
				].forEach(ig => conf(...ig));
			},code: function(){
				let checkActivities = document.getElementById("activities").checked;
				let checkMessages = document.getElementById("messages").checked;
				let checkForum = document.getElementById("forum").checked;
				let checkReviews = document.getElementById("reviews").checked;
				if(checkActivities || checkMessages || checkForum || checkReviews){
					let activitiesQuery = `activities1:Page(page:1){
								activities(type:TEXT,sort:ID_DESC){
									... on TextActivity{
										siteUrl
										text(asHtml: true)
										user{name}
									}
								}
							}
							activities2:Page(page:2){
								activities(type:TEXT,sort:ID_DESC){
									... on TextActivity{
										siteUrl
										text(asHtml: true)
										user{name}
									}
								}
							}`;
					let messagesQuery = `messages:Page(page:1){
								activities(type:MESSAGE,sort:ID_DESC){
									... on MessageActivity{
										siteUrl
										message
										messenger{name}
									}
								}
							}`;
					generalAPIcall(
						`query{
							${(checkActivities ? activitiesQuery : "")}
							${(checkMessages ? messagesQuery : "")}
						}`,
						{},
						function(data){
							miscResults.innerText = "";
							if(document.getElementById("linkOnly").checked){
								if(checkActivities){
									data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
										if(activity.text.match(/^<p><a\shref=".*?<\/a><\/p>$/)){
											let row = create("p",false,false,miscResults);
											create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
												.href = activity.siteUrl;
											create("span",false,"Link-only post. Spam?",row);
											create("p",false,false,row).innerHTML = activity.text;
										}
									})
								}
							}
							if(document.getElementById("piracy").checked){
								if(checkActivities){
									data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
										(activity.text.match(/<a href=\".*?\"/g) || []).forEach(link => {
											let linker = (
												new URL(
													(link.match(/\"(.*?)\"/) || ["",""])[1]
												)
											).host;
											if(linker && linker.split(".").length >= 2){
												linker = linker.split(".")[linker.split(".").length - 2];
												if(
									[556415734,1724824539,-779421562,-1111399772,-93654449,1120312799,-781704176,-1550515495,3396395,567115318,-307082983,1954992241,-307211474,-307390044,1222804306,-795095039,-1014860289,403785740].includes(hashCode(linker))
												){
													let row = create("p",false,false,miscResults);
													create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
														.href = activity.siteUrl;
													create("span",false,"Possible piracy link",row);
													create("p",false,false,row).innerHTML = activity.text;
												}
											};
										});
									})
								}
							}
							if(miscResults.innerText === ""){
								miscResults.innerText = "Inspection completed. Nothing unusual found.";
							}
						}
					)
				}
			}},
			{name: "Autorecs",code: function(){
				miscResults.innerText = "Collecting list data...";
				generalAPIcall(
					`query($name: String!){
						User(name: $name){
							statistics{
								anime{
									meanScore
									standardDeviation
								}
							}
						}
						MediaListCollection(userName: $name,type: ANIME,status_not: PLANNING){
							lists{
								entries{
									mediaId
									score(format: POINT_100)
									status
									media{
										recommendations(sort:RATING_DESC,perPage:5){
											nodes{
												rating
												mediaRecommendation{
													id
													title{romaji native english}
												}
											}
										}
									}
								}
							}
						}
					}`,
					{name: user},function(data){
						miscResults.innerText = "Processing...";
						const list = returnList(data,true).filter(
							media => media.status !== "PLANNING"
						);
						const existingSet = new Set(
							list.map(media => media.mediaId)
						);
						const statistics = data.data.User.statistics.anime;
						const recsMap = new Map();
						list.filter(
							media => media.score
						).forEach(media => {
							let adjustedScore = (media.score - statistics.meanScore)/statistics.standardDeviation;
							media.media.recommendations.nodes.forEach(rec => {
								if(
									!existingSet.has(rec.mediaRecommendation.id)
									&& rec.rating > 0
								){
									if(!recsMap.has(rec.mediaRecommendation.id)){
										recsMap.set(
											rec.mediaRecommendation.id,
											{title: titlePicker(rec.mediaRecommendation),score: 0}
										)
									}
									recsMap.get(rec.mediaRecommendation.id).score += (1 + Math.log(rec.rating)) * adjustedScore
								}
							})
						});
						miscResults.innerText = "";
						[...recsMap].map(
							pair => ({
								id: pair[0],
								title: pair[1].title,
								score: pair[1].score
							})
						).sort(
							(b,a) => a.score - b.score
						).slice(0,25).forEach(rec => {
							let card = create("p",false,false,miscResults);
							let score = create("span","hohMonospace",rec.score.toPrecision(3) + " ",card,"margin-right:10px;");
							create("a",false,rec.title,card)
								.href = "/anime/" + rec.id + "/"
						})
					}
				)
			}},
			{name: "Find a status",setup: function(){
				let input = create("input","#searchInput",false,miscOptions);
				input.placeholder = "text or regex to match";
			},code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					miscResults.innerText = "";
					let posts = 0;
					let progress = create("p",false,false,miscResults);
					let results = create("p",false,false,miscResults);
					let searchQuery = document.getElementById("searchInput").value;
					const query = `
					query($userId: Int,$page: Int){
						Page(page: $page){
							pageInfo{
								currentPage
								total
								lastPage
							}
							activities (userId: $userId, sort: ID_DESC, type: TEXT){
								... on TextActivity{
									siteUrl
									text(asHtml: true)
								}
							}
						}
					}`;
					let addNewUserData = function(data){
						if(data.data.Page.pageInfo.currentPage === 1){
							for(var i=2;i<=data.data.Page.pageInfo.lastPage;i++){
								generalAPIcall(query,{userId: userId,page: i},addNewUserData)
							}
						};
						posts += data.data.Page.activities.length;
						progress.innerText = "Searching status post " + posts + "/" + data.data.Page.pageInfo.total;
						data.data.Page.activities.forEach(function(act){
							if(act.text.match(new RegExp(searchQuery,"i"))){
								let newDate = create("p",false,false,results,"font-family:monospace;margin-right:10px;");
								let newPage = create("a","newTab",act.siteUrl,newDate,"color:rgb(var(--color-blue));");
								newPage.href = act.siteUrl;
								newDate.innerHTML += act.text;
								create("hr",false,false,results)
							}
						})
					};
					generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
				},"hohIDlookup" + user.toLowerCase())
			}},
			{name: "Most liked status posts",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let list = [];
					miscResults.innerText = "";
					let progress = create("p",false,false,miscResults);
					let results = create("p",false,false,miscResults);
					const query = `
					query($userId: Int,$page: Int){
						Page(page: $page){
							pageInfo{
								currentPage
								total
								lastPage
							}
							activities (userId: $userId, sort: ID_DESC, type: TEXT){
								... on TextActivity{
									siteUrl
									likes{id}
								}
							}
						}
					}`;
					let addNewUserData = function(data){
						list = list.concat(data.data.Page.activities);
						if(data.data.Page.pageInfo.currentPage === 1){
							for(var i=2;i<=data.data.Page.pageInfo.lastPage;i++){
								generalAPIcall(query,{userId: userId,page: i},addNewUserData);
							};
						};
						list.sort(function(b,a){return a.likes.length - b.likes.length});
						progress.innerText = "Searching status post " + list.length + "/" + data.data.Page.pageInfo.total;
						removeChildren(results)
						for(var i=0;i<20;i++){
							let newDate = create("p",false,list[i].likes.length + " likes ",results,"font-family:monospace;margin-right:10px;");
							let newPage = create("a","newTab",list[i].siteUrl,newDate,"color:rgb(var(--color-blue));");
							newPage.href = list[i].siteUrl;
						};
					};
					generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
				},"hohIDlookup" + user.toLowerCase());
			}}
		];
		let miscInputSelect = create("select",false,false,miscInput);
		let miscInputButton = create("button",["button","hohButton"],"Run",miscInput);
		availableQueries.forEach(function(que){
			let option = create("option",false,que.name,miscInputSelect);
			option.value = que.name
		});
		miscInputSelect.oninput = function(){
			miscOptions.innerText = "";
			let relevant = availableQueries.find(que => que.name === miscInputSelect.value);
			if(relevant.setup){
				miscResults.innerText = "";
				relevant.setup()
			}
		};
		miscInputButton.onclick = function(){
			miscResults.innerText = "Loading...";
			availableQueries.find(que => que.name === miscInputSelect.value).code()
		}
//gather some stats

		let customTagsCollection = function(list,title,fields){
			let customTags = new Map();
			let regularTags = new Map();
			let customLists = new Map();
			(
				JSON.parse(localStorage.getItem("regularTags" + title)) || []
			).forEach(
				tag => regularTags.set(tag,{
					name : tag,
					list : []
				})
			);
			customLists.set("Not on custom list",{name: "Not on custom list",list: []});
			customLists.set("All media",{name: "All media",list: []});
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				if(media.notes){
					(
						media.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					});
					(//candidates for multi word tags, which we try to detect even if they are not allowed
						media.notes.match(/(#\S+\ [^#]\S+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					})
				};
				media.media.tags.forEach(mediaTag => {
					if(regularTags.has(mediaTag.name)){
						regularTags.get(mediaTag.name).list.push(item)
					}
				});
				if(media.isCustomList){
					media.listLocations.forEach(location => {
						if(!customLists.has(location)){
							customLists.set(location,{name: location,list: []})
						}
						customLists.get(location).list.push(item)
					})
				}
				else if(useScripts.negativeCustomList){
					customLists.get("Not on custom list").list.push(item)
				};
				if(useScripts.globalCustomList){
					customLists.get("All media").list.push(item)
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			else{
				for(let [key,value] of customTags){//filter our multi word candidates
					if(key.includes(" ")){
						if(value.list.length === 1){//if it's just one of them, the prefix tag takes priority
							customTags.delete(key)
						}
						else{
							let prefix = key.split(" ")[0];
							if(customTags.has(prefix)){
								if(customTags.get(prefix).list.length === value.list.length){
									customTags.delete(prefix)
								}
								else{
									customTags.delete(key)
								}
							}
						}
					}
				}
				for(let [key,value] of customTags){//fix the basic casing error, like #shoujo vs #Shoujo. Will only merge if one is of length 1
					if(key[1] === key[1].toUpperCase()){
						let lowerCaseKey = "#" + key[1].toLowerCase() + key.slice(2);
						let lowerCaseValue = customTags.get(lowerCaseKey);
						if(lowerCaseValue){
							if(value.list.length === 1){
								lowerCaseValue.list = lowerCaseValue.list.concat(value.list);
								customTags.delete(key)
							}
							else if(lowerCaseValue.list.length === 1){
								value.list = value.list.concat(lowerCaseValue.list);
								customTags.delete(lowerCaseKey)
							}
						}
					}
				}
			}
			if(!customLists.get("Not on custom list").list.length){
				customLists.delete("Not on custom list")
			};
			if(!customLists.get("All media").list.length){
				customLists.delete("All media")
			};
			return [...customTags, ...regularTags, ...customLists].map(
				pair => pair[1]
			).map(tag => {
				let amountCount = 0;
				let average = 0;
				tag.list.forEach(item => {
					if(item.score !== 0){
						amountCount++;
						average += item.score;
					};
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key]);
						}
					})
				});
				tag.average = average/amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score);
				return tag;
			}).sort(
				(b,a) => a.list.length - b.list.length || b.name.localeCompare(a.name)
			)
		};
		let regularTagsCollection = function(list,fields,extracter){
			let tags = new Map();
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				extracter(media).forEach(tag => {
					if(useScripts.SFWmode && tag.name === "Hentai"){
						return
					}
					if(!tags.has(tag.name)){
						tags.set(tag.name,{name: tag.name,list: []})
					}
					tags.get(tag.name).list.push(item)
				})
			});
			tags.forEach(tag => {
				tag.amountCount = 0;
				tag.average = 0;
				tag.list.forEach(item => {
					if(item.score){
						tag.amountCount++;
						tag.average += item.score;
					};
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key])
						}
					})
				});
				tag.average = tag.average/tag.amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score)
			});
			return [...tags].map(
				tag => tag[1]
			).sort(
				(b,a) => (a.average*a.amountCount + ANILIST_WEIGHT)/(a.amountCount + 1) - (b.average*b.amountCount + ANILIST_WEIGHT)/(b.amountCount + 1) || a.list.length - b.list.length
			)
		};
		let drawTable = function(data,formatter,tableLocation,isTag,autoHide){
			removeChildren(tableLocation)
			tableLocation.innerText = "";
			let hasScores = data.some(elem => elem.average);
			let header = create("p",false,formatter.title);
			let tableContent = create("div",["table","hohTable"]);
			let headerRow = create("div",["header","row"],false,tableContent);
			let indexAccumulator = 0;
			formatter.headings.forEach(function(heading){
				if(!hasScores && heading === "Mean Score"){
					return
				};
				let columnTitle = create("div",false,heading,headerRow);
				if(heading === "Tag" && !isTag && formatter.isMixed){
					columnTitle.innerText = "Genre"
				}
				if(formatter.focus === indexAccumulator){
					columnTitle.innerHTML += " " + svgAssets.angleDown
				};
				columnTitle.index = +indexAccumulator;
				columnTitle.addEventListener("click",function(){
					formatter.focus = this.index;
					data.sort(formatter.sorting[this.index]);
					drawTable(data,formatter,tableLocation,isTag,autoHide)
				});
				indexAccumulator++;
			});
			for(var i=0;i<data.length;i++){
				let row = create("div","row");
				formatter.celData.forEach(function(celData,index){
					if(index === 2 && !hasScores){
						return
					};
					let cel = create("div");
					celData(cel,data,i,true,isTag);
					row.appendChild(cel)
				});
				row.onclick = function(){
					if(this.nextSibling.style.display === "none"){
						this.nextSibling.style.display = "block"
					}
					else{
						this.nextSibling.style.display = "none"
					}
				};
				tableContent.appendChild(row);
				let showList = create("div");
				if(formatter.focus === 1){//sorting by count is meaningless, sort alphabetically instead
					data[i].list.sort(formatter.sorting[0])
				}
				else if(formatter.focus === 2){//average != score
					data[i].list.sort((b,a) => a.score - b.score)
				}
				else if(formatter.focus === -1){//average != score
					//nothing, duh
				}
				else{
					data[i].list.sort(formatter.sorting[formatter.focus]);
				}
				data[i].list.forEach((nil,ind) => {
					let secondaryRow = create("div",["row","hohSecondaryRow"]);
					formatter.celData.forEach(celData => {
						let cel = create("div");
						celData(cel,data[i].list,ind,false,isTag);
						secondaryRow.appendChild(cel)
					});
					showList.appendChild(secondaryRow)
				});
				showList.style.display = "none";
				tableContent.insertBefore(showList,row.nextSibling);
			};
			tableLocation.appendChild(header);
			tableLocation.appendChild(tableContent);
			if(autoHide){
				let tableHider = create("span",["hohMonospace","hohTableHider"],"[-]",header);
				let regularTagsSetting = create("p",false,false,tableLocation);
				let regularTagsSettingLabel = create("span",false," Regular tags included (applied on reload): ",regularTagsSetting);
				let regularTagsSettingContent = create("span",false,false,regularTagsSetting);
				let regularTagsSettingNew = create("input",false,false,regularTagsSetting);
				let regularTagsSettingAdd = create("button",["hohButton","button"],"+",regularTagsSetting);
				let regularTags = JSON.parse(localStorage.getItem("regularTags" + formatter.title)) || [];
				for(var i=0;i<regularTags.length;i++){
					let tag = create("span","hohRegularTag",false,regularTagsSettingContent);
					let tagContent = create("span",false,regularTags[i],tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = regularTags[i] + "";
					tagCross.addEventListener("click",function(){
						for(var j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						};
						this.parentNode.remove();
					})
				};
				regularTagsSettingAdd.addEventListener("click",function(){
					let newTagName = this.previousSibling.value;
					if(!newTagName){
						return
					};
					newTagName = capitalize(newTagName);
					regularTags.push(newTagName);
					let tag = create("span","hohRegularTag");
					let tagContent = create("span",false,newTagName,tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = newTagName + "";
					tagCross.addEventListener("click",function(){
						for(var j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						}
						this.parentNode.remove();
					});
					this.previousSibling.previousSibling.appendChild(tag);
					localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
				});
				tableHider.onclick = function(){
					if(this.innerText === "[-]"){
						tableHider.innerText = "[+]";
						tableContent.style.display = "none";
						regularTagsSetting.style.display = "none";
						formatter.display = false
					}
					else{
						tableHider.innerText = "[-]";
						tableContent.style.display = "block";
						regularTagsSetting.style.display = "block";
						formatter.display = true
					}
				};
				if(!formatter.display){
					tableHider.innerText = "[+]";
					tableContent.style.display = "none";
					regularTagsSetting.style.display = "none";
				}
			};
		};
		let semaPhoreAnime = false;//I have no idea what "semaphore" means in software
		let semaPhoreManga = false;//but it sounds cool so this is a semaphore
//
		let nativeTagsReplacer = function(){
			if(useScripts.replaceNativeTags === false || semaPhoreAnime === false || semaPhoreManga === false){
				return
			};
			const mixedFields = [
				{
					key : "name",
					method : function(media){
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native;
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english;
						}
						return media.media.title.romaji;
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0;
							})
						}
						acc[val]++;
						return acc;
					},
					method : media => media.status
				},{
					key : "type",
					method : function(media){
						if(!media.progressVolumes && !(media.progressVolumes === 0)){
							return "ANIME";
						}
						else{
							return "MANGA";
						}
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration || 0
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead || 0
				}
			];
			let mixedFormatter = {
				title : "",
				display : true,
				isMixed : true,
				headings : ["Tag","Count","Mean Score","Time Watched","Chapters Read"],
				focus : -1,
				celData : [
					function(cel,data,index,isPrimary,isTag){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							if(isTag){
								nameCellTag.href = "/search/anime?includedTags=" + data[index].name + "&onList=true"
							}
							else{
								nameCellTag.href = "/search/anime?includedGenres=" + data[index].name + "&onList=true"
							}
							if(tagDescriptions[data[index].name]){
								nameCellTag.title = tagDescriptions[data[index].name]
							}
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										});
									}
								}
							})
						}
						else{
							let nameCellTag = create("a",["title","hohNameCel"],data[index].name,cel);
							if(data[index].type === "ANIME"){
								nameCellTag.href = "/anime/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-blue))";
							}
							else{
								nameCellTag.href = "/manga/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-green))";
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent";//default case
							}
							if(data[index].repeat === 1){
								cel.innerHTML = svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML = svgAssets.repeat + data[index].repeat
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = (data[index].average).roundPlaces(1) || "-"
						}
						else{
							cel.innerText = (data[index].score).roundPlaces(1) || "-"
						}
					},
					function(cel,data,index,isPrimary){
						if(!isPrimary && data[index].type === "MANGA"){
							cel.innerText = "-"
						}
						else if(data[index].duration === 0){
							cel.innerText = "-"
						}
						else if(data[index].duration < 60){
							cel.innerText = Math.round(data[index].duration) + "min"
						}
						else{
							cel.innerText = Math.round(data[index].duration/60) + "h"
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary || data[index].type === "MANGA"){
							cel.innerText = data[index].chaptersRead;
						}
						else{
							cel.innerText = "-"
						}
					}
				],
				sorting : [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.chaptersRead - b.chaptersRead
				]
			};
			let collectedMedia = semaPhoreAnime.concat(semaPhoreManga);
			let listOfTags = regularTagsCollection(collectedMedia,mixedFields,media => media.media.tags);
			if(listOfTags.length > 50){//restrict to 3 or more only if the user has many tags
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			if(!document.URL.match(/\/stats/)){
				return
			};
			let drawer = function(){
				drawTable(listOfTags,mixedFormatter,regularTagsTable,true);
				//recycle most of the formatter for genres
				drawTable(
					regularTagsCollection(
						collectedMedia,
						mixedFields,
						media => media.media.genres.map(a => ({name: a}))
					),
					mixedFormatter,
					regularGenresTable
				);
				hohGenresTrigger.removeEventListener("mouseover",drawer);
			}
			hohGenresTrigger.addEventListener("mouseover",drawer);
			if(hohGenresTrigger.classList.contains("hohActive")){
				drawer()
			}
		};
//get anime list
		let personalStatsCallback = function(data){
			personalStats.innerText = "";
			create("hr","hohSeparator",false,personalStats)
			create("h1","hohStatHeading","Anime stats for " + user,personalStats);
			let list = returnList(data);
			let scoreList = list.filter(element => element.scoreRaw);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStats);
				let compatLocation = create("div","#hohCheckCompat",false,personalStats);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = "loading...";
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"ANIME",
						data => formatCompat(data,compatLocation)
					)
				};
			};
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStats);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					create("span",false,false,newStat)
						.innerHTML = comment
				}
			};
//first activity
			let oldest = list.filter(
				item => item.startedAt.year
			).map(
				item => item.startedAt
			).sort((b,a) =>
				(a.year < b.year)
				|| (a.year === b.year && a.month < b.month)
				|| (a.year === b.year && a.month === b.month && a.day < b.day)
			)[0];
//scoring stats
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let amount = scoreList.length;
			let sumWeight = 0;
			let sumEntriesWeight = 0;
			let average = 0;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumDuration = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let longestDuration = {
				time: 0,
				name: "",
				status: "",
				rewatch: 0,
				id: 0
			};
			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			list.forEach(item => {
				let entryDuration = (item.media.duration || 1)*(item.progress || 0);//current round
				item.episodes = item.progress || 0;
				if(useScripts.noRewatches && item.repeat){
					entryDuration = Math.max(
						item.progress || 0,
						item.media.episodes || 1,
					) * (item.media.duration || 1);//first round
					item.episodes = Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				else{
					entryDuration += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					) * (item.media.duration || 1);//repeats
					item.episodes += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				if(item.listJSON && item.listJSON.adjustValue){
					item.episodes = Math.max(0,item.episodes + item.listJSON.adjustValue);
					entryDuration = Math.max(0,entryDuration + item.listJSON.adjustValue*(item.media.duration || 1));
				};
				item.watchedDuration = entryDuration;
				sumDuration += entryDuration;
				if(entryDuration > longestDuration.time){
					longestDuration.time = entryDuration;
					longestDuration.name = item.media.title.romaji;
					longestDuration.status = item.status;
					longestDuration.rewatch = item.repeat;
					longestDuration.id = item.mediaId
				}
			});
			scoreList.forEach(item => {
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{
					runLength = 1;
					previouScore = item.scoreRaw;
				};
				sumWeight += (item.media.duration || 1) * (item.media.episodes || 0);
				sumEntriesWeight += item.scoreRaw*(item.media.duration || 1) * (item.media.episodes || 0);
			});
			if(amount){
				average = sumEntries/amount
			}
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum;
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2);
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore);
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
//display scoring stats
			addStat("Anime on list: ",list.length);
			addStat("Anime rated: ",amount);
			if(amount !== 0){//no scores
				if(amount === 1){
					addStat("Only one score given: ",maxRunLengthScore)
				}
				else{
					addStat(
						"Average score: ",
						average.toPrecision(4)
					);
					addStat(
						"Average score: ",
						(sumEntriesWeight/sumWeight).toPrecision(4),
						" (weighted by duration)"
					);
					addStat("Median score: ",median);
					addStat(
						"Global difference: ",
						publicDifference.roundPlaces(2),
						" (average difference from global average)"
					);
					addStat(
						"Global deviation: ",
						publicDeviation.roundPlaces(2),
						" (standard deviation from the global average of each entry)"
					);
					if(maxRunLength > 1){
						addStat("Most common score: ",maxRunLengthScore, " (" + maxRunLength + " instances)")
					}
					else{
						addStat("Most common score: ","","no two scores alike")
					}
				};
//longest activity
				let singleText = (100*longestDuration.time/sumDuration).roundPlaces(2) + "% is ";
				singleText += "<a href='https://anilist.co/anime/" + longestDuration.id + "'>" + longestDuration.name + "</a>";
				if(longestDuration.rewatch === 0){
					if(longestDuration.status === "CURRENT"){
						singleText += ". Currently watching."
					}
					else if(longestDuration.status === "PAUSED"){
						singleText += ". On hold."
					}
					else if(longestDuration.status === "DROPPED"){
						singleText += ". Dropped."
					}
				}
				else{
					if(longestDuration.status === "COMPLETED"){
						if(longestDuration.rewatch === 1){
							singleText += ". Rewatched once."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Rewatched twice."
						}
						else{
							singleText += ". Rewatched " + longestDuration.rewatch + " times."
						}
					}
					else if(longestDuration.status === "CURRENT" || status === "REPEATING"){
						if(longestDuration.rewatch === 1){
							singleText += ". First rewatch in progress."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Second rewatch in progress."
						}
						else{
							singleText += ". Rewatch number " + longestDuration.rewatch + " in progress."
						}
					}
					else if(longestDuration.status === "PAUSED"){
						if(longestDuration.rewatch === 1){
							singleText += ". First rewatch on hold."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Second rewatch on hold."
						}
						else{
							singleText += ". Rewatch number " + longestDuration.rewatch + " on hold."
						}
					}
					else if(longestDuration.status === "DROPPED"){
						if(longestDuration.rewatch === 1){
							singleText += ". Dropped on first rewatch."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Dropped on second rewatch."
						}
						else{
							singleText += ". Dropped on rewatch number " + longestDuration.rewatch + "."
						}
					};
				};
				addStat(
					"Time watched: ",
					(sumDuration/(60*24)).roundPlaces(2),
					" days (" + singleText + ")"
				)
			};
			let TVepisodes = 0;
			let TVepisodesLeft = 0;
			list.filter(show => show.media.format === "TV").forEach(function(show){
				TVepisodes += show.progress;
				TVepisodes += show.repeat * Math.max(1,(show.media.episodes || 0),show.progress);
				if(show.status === "CURRENT"){
					TVepisodesLeft += Math.max((show.media.episodes || 0) - show.progress,0)
				}
			});
			addStat("TV episodes watched: ",TVepisodes);
			addStat("TV episodes remaining for current shows: ",TVepisodesLeft);
			if(oldest){
				create("p",false,"First logged anime: " + oldest.year + "-" + oldest.month + "-" + oldest.day + ". (users can change start dates)",personalStats)
			};
			let animeFormatter = {
				title: "Custom Anime Tags",
				display: !useScripts.hideCustomTags,
				headings: ["Tag","Count","Mean Score","Time Watched","Episodes","Eps remaining"],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px";
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px";
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/anime/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.innerHTML += svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML += svgAssets.repeat + data[index].repeat
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-";
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1);
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-";
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1);
							}
						}
					},
					function(cel,data,index){
						cel.innerText = formatTime(data[index].duration*60,"short");
						cel.title = (data[index].duration/60).roundPlaces(1) + " hours";
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(!data[index].list.length){
								cel.innerText = "-";
							}
							else{
								cel.innerText = data[index].episodes;
							}
						}
						else{
							cel.innerText = data[index].episodes;
						}
					},
					function(cel,data,index,isPrimary){
						if(data[index].episodes === 0 && data[index].remaining === 0 || isPrimary && !data[index].list.length){
							cel.innerText = "-";
						}
						else if(data[index].remaining === 0){
							cel.innerText = "completed";
						}
						else{
							if(useScripts.timeToCompleteColumn){
								cel.innerText = data[index].remaining + " (" + formatTime(data[index].remainingTime*60,"short") + ")";
							}
							else{
								cel.innerText = data[index].remaining;
							}
						}
					}
				],
				sorting: [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.episodes - b.episodes,
					(b,a) => a.remaining - b.remaining
				]
			};
			const animeFields = [
				{
					key : "name",
					method : function(media){
						if(aliases.has(media.mediaId)){
							return aliases.get(media.mediaId);
						}
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native;
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english;
						};
						return media.media.title.romaji;
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0;
							})
						}
						acc[val]++;
						return acc;
					},
					method : media => media.status
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration
				},{
					key : "episodes",
					sumable : ACCUMULATE,
					method : media => media.episodes
				},{
					key : "remaining",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max((media.media.episodes || 0) - media.progress,0);
					}
				},{
					key : "remainingTime",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max(((media.media.episodes || 0) - media.progress) * (media.media.duration || 1),0);
					}
				}
			];
			let customTags = customTagsCollection(list,animeFormatter.title,animeFields);
			if(customTags.length){
				let customTagsAnimeTable = create("div","#customTagsAnimeTable",false,personalStats);
				drawTable(customTags,animeFormatter,customTagsAnimeTable,true,true)
			};

			let listOfTags = regularTagsCollection(list,animeFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			drawTable(listOfTags,animeFormatter,regularAnimeTable,true,false);
			semaPhoreAnime = list;
			nativeTagsReplacer();
			generalAPIcall(queryMediaListStaff,{name: user,listType: "ANIME"},function(data){
				let rawStaff = returnList(data);
				rawStaff.forEach((raw,index) => {
					raw.status = list[index].status;
					raw.watchedDuration = list[index].watchedDuration;
					raw.scoreRaw = list[index].scoreRaw
				});
				let staffMap = {};
				rawStaff.filter(obj => obj.status !== "PLANNING").forEach(media => {
					media.media.staff.forEach(staff => {
						if(!staffMap[staff.id]){
							staffMap[staff.id] = {
								watchedDuration: 0,
								count: 0,
								scoreCount: 0,
								scoreSum: 0,
								id: staff.id,
								name: staff.name
							}
						};
						if(media.watchedDuration){
							staffMap[staff.id].watchedDuration += media.watchedDuration;
							staffMap[staff.id].count++
						};
						if(media.scoreRaw){
							staffMap[staff.id].scoreSum += media.scoreRaw;
							staffMap[staff.id].scoreCount++
						}
					})
				});
				let staffList = [];
				Object.keys(staffMap).forEach(
					key => staffList.push(staffMap[key])
				);
				staffList = staffList.filter(
					obj => obj.count >= 1
				).sort(
					(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
				);
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 3)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 5)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 10)
				};
				let hasScores = staffList.some(a => a.scoreCount);
				let drawStaffList = function(){
					removeChildren(animeStaff)
					animeStaff.innerText = "";
					let table        = create("div",["table","hohTable","hohNoPointer"],false,animeStaff);
					let headerRow    = create("div",["header","row","good"],false,table);
					let nameHeading  = create("div",false,"Name",headerRow,"cursor:pointer;");
					let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
					let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
					if(!hasScores){
						scoreHeading.style.display = "none"
					}
					let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
					staffList.forEach(function(staff,index){
						let row = create("div",["row","good"],false,table);
						let nameCel = create("div",false,(index + 1) + " ",row);
						let staffLink = create("a",["link","newTab"],(staff.name.first + " " + (staff.name.last || "")).trim(),nameCel);
						staffLink.href = "/staff/" + staff.id;
						create("div",false,staff.count,row);
						if(hasScores){
							create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row);
						}
						let timeCel = create("div",false,formatTime(staff.watchedDuration*60),row);
						timeCel.title = (staff.watchedDuration/60).roundPlaces(1) + " hours";
					});
					let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStaff,"margin-top:10px;");
					let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStaff,"margin-top:10px;");
					csvButton.onclick = function(){
						let csvContent = 'Staff,Count,"Mean Score","Time Watched"\n';
						staffList.forEach(staff => {
							csvContent += csvEscape(
								[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
							) + ",";
							csvContent += staff.count + ",";
							csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
							csvContent += (staff.watchedDuration/60).roundPlaces(1) + "\n"
						});
						saveAs(csvContent,"Anime staff stats for " + user + ".csv",true)
					};
					jsonButton.onclick = function(){
						saveAs({
							type: "ANIME",
							user: user,
							timeStamp: NOW(),
							version: "1.00",
							scriptInfo: scriptInfo,
							url: document.URL,
							description: "Anilist anime staff stats for " + user,
							fields: [
								{name: "name",   description: "The full name of the staff member, as firstname lastname"},
								{name: "staffID",description: "The staff member's database number in the Anilist database"},
								{name: "count",  description: "The total number of media this staff member has credits for, for the current user"},
								{name: "score",  description: "The current user's mean score for the staff member out of 100"},
								{name: "minutesWatched",description: "How many minutes of this staff member's credited media the current user has watched"}
							],
							data: staffList.map(staff => {
								return {
									name: (staff.name.first + " " + (staff.name.last || "")).trim(),
									staffID: staff.id,
									count: staff.count,
									score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
									minutesWatched: staff.watchedDuration
								}
							})
						},"Anime staff stats for " + user + ".json");
					}
					nameHeading.onclick = function(){
						staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
						drawStaffList()
					};
					countHeading.onclick = function(){
						staffList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
						drawStaffList()
					};
					scoreHeading.onclick = function(){
						staffList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
						drawStaffList()
					};
					timeHeading.onclick = function(){
						staffList.sort((b,a) => a.watchedDuration - b.watchedDuration);
						drawStaffList()
					}
				};
				let clickOnce = function(){
					drawStaffList();
					let place = document.querySelector(`[href$="/stats/anime/staff"]`);
					if(place){
						place.removeEventListener("click",clickOnce)
					}
				}
				let waiter = function(){
					if(location.pathname.includes("/stats/anime/staff")){
						clickOnce();
						return
					}
					let place = document.querySelector(`[href$="/stats/anime/staff"]`);
					if(place){
						place.addEventListener("click",clickOnce)
					}
					else{
						setTimeout(waiter,200)
					}
				};waiter();
			},"hohListCacheAnimeStaff" + user,15*60*1000);
			let studioMap = {};
			list.forEach(function(anime){
				anime.media.studios.nodes.forEach(function(studio){
					if(!useScripts.allStudios && !studio.isAnimationStudio){
						return
					}
					if(!studioMap[studio.name]){
						studioMap[studio.name] = {
							watchedDuration: 0,
							count: 0,
							scoreCount: 0,
							scoreSum: 0,
							id: studio.id,
							isAnimationStudio: studio.isAnimationStudio,
							name: studio.name,
							media: []
						}
					}
					if(anime.watchedDuration){
						studioMap[studio.name].watchedDuration += anime.watchedDuration;
						studioMap[studio.name].count++
					};
					if(anime.scoreRaw){
						studioMap[studio.name].scoreSum += anime.scoreRaw;
						studioMap[studio.name].scoreCount++
					};
					let title = anime.media.title.romaji;
					if(anime.status !== "PLANNING"){
						if(useScripts.titleLanguage === "NATIVE" && anime.media.title.native){
							title = anime.media.title.native
						}
						else if(useScripts.titleLanguage === "ENGLISH" && anime.media.title.english){
							title = anime.media.title.english
						}
						studioMap[studio.name].media.push({
							watchedDuration: anime.watchedDuration,
							score: anime.scoreRaw,
							title: title,
							id: anime.mediaId,
							repeat: anime.repeat,
							status: anime.status
						})
					}
				})
			});
			let studioList = [];
			Object.keys(studioMap).forEach(
				key => studioList.push(studioMap[key])
			);
			studioList = studioList.filter(
				studio => studio.count >= 1
			).sort(
				(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
			);
			studioList.forEach(
				studio => studio.media.sort((b,a) => a.score - b.score)
			);
			let hasScores = studioList.some(a => a.scoreCount);
			let drawStudioList = function(){
				removeChildren(animeStudios)
				animeStudios.innerText = "";
				let table = create("div",["table","hohTable"],false,animeStudios);
				let headerRow = create("div",["header","row","good"],false,table);
				let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
				let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
				let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
				if(!hasScores){
					scoreHeading.style.display = "none"
				}
				let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
				studioList.forEach(function(studio,index){
					let row = create("div",["row","good"],false,table);
					let nameCel = create("div",false,(index + 1) + " ",row);
					let studioLink = create("a",["link","newTab"],studio.name,nameCel);
					studioLink.href = "/studio/" + studio.id;
					if(!studio.isAnimationStudio){
						studioLink.style.color = "rgb(var(--color-green))"
					};
					let nameCellStatus = create("span","hohSumableStatusContainer",false,nameCel);
					Object.keys(distributionColours).sort().forEach(status => {
						let statCount = studio.media.filter(media => media.status === status).length;
						if(statCount){
							let statusSumDot = create("div","hohSumableStatus",statCount,nameCellStatus);
							statusSumDot.style.background = distributionColours[status];
							statusSumDot.title = statCount + " " + capitalize(status.toLowerCase());
							if(statCount > 99){
								statusSumDot.style.fontSize = "8px"
							}
							if(statCount > 999){
								statusSumDot.style.fontSize = "6px"
							}
							statusSumDot.onclick = function(e){
								e.stopPropagation();
								Array.from(nameCel.parentNode.nextSibling.children).forEach(function(child){
									if(child.children[1].children[0].title === status.toLowerCase()){
										child.style.display = "grid"
									}
									else{
										child.style.display = "none"
									}
								})
							}
						}
					});
					create("div",false,studio.count,row);
					if(hasScores){
						let scoreCel = create("div",false,(studio.scoreSum/studio.scoreCount).roundPlaces(2),row);
						scoreCel.title = studio.scoreCount + " ratings";
					}
					let timeString = formatTime(studio.watchedDuration*60);
					let timeCel = create("div",false,timeString,row);
					timeCel.title = (studio.watchedDuration/60).roundPlaces(1) + " hours";
					let showRow = create("div",false,false,table,"display:none;");
					studio.media.forEach(top => {
						let secondRow = create("div",["row","hohSecondaryRow","good"],false,showRow);
						let titleCel = create("div",false,false,secondRow,"margin-left:50px;");
						let titleLink = create("a","link",top.title,titleCel);
						titleLink.href = "/anime/" + top.id + "/" + safeURL(top.title);
						let countCel = create("div",false,false,secondRow);
						let statusDot = create("div","hohStatusDot",false,countCel);
						statusDot.style.backgroundColor = distributionColours[top.status];
						statusDot.title = top.status.toLowerCase();
						if(top.status === "COMPLETED"){
							statusDot.style.backgroundColor = "transparent";//default case
						}
						if(top.repeat === 1){
							countCel.innerHTML += svgAssets.repeat
						}
						else if(top.repeat > 1){
							countCel.innerHTML += svgAssets.repeat + top.repeat
						}
						create("div",false,(top.score ? top.score : "-"),secondRow);
						let timeString = formatTime(top.watchedDuration*60);
						let timeCel = create("div",false,timeString,secondRow);
						timeCel.title = (top.watchedDuration/60).roundPlaces(1) + " hours";
					});
					row.onclick = function(){
						if(showRow.style.display === "none"){
							showRow.style.display = "block"
						}
						else{
							showRow.style.display = "none"
						}
					}
				});
				let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStudios,"margin-top:10px;");
				let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStudios,"margin-top:10px;");
				csvButton.onclick = function(){
					let csvContent = 'Studio,Count,"Mean Score","Time Watched"\n';
					studioList.forEach(function(studio){
						csvContent += csvEscape(studio.name) + ",";
						csvContent += studio.count + ",";
						csvContent += (studio.scoreSum/studio.scoreCount).roundPlaces(2) + ",";
						csvContent += (studio.watchedDuration/60).roundPlaces(1) + "\n";
					});
					saveAs(csvContent,"Anime studio stats for " + user + ".csv",true);
				};
				jsonButton.onclick = function(){
					saveAs({
						type: "ANIME",
						user: user,
						timeStamp: NOW(),
						version: "1.00",
						scriptInfo: scriptInfo,
						url: document.URL,
						description: "Anilist anime studio stats for " + user,
						fields: [
							{name: "studio",description: "The name of the studio. (Can also be other companies, depending on the user's settings)"},
							{name: "studioID",description: "The studio's database number in the Anilist database"},
							{name: "count",description: "The total number of media this studio has credits for, for the current user"},
							{name: "score",description: "The current user's mean score for the studio out of 100"},
							{name: "minutesWatched",description: "How many minutes of this studio's credited media the current user has watched"},
							{
								name: "media",
								description: "A list of the media associated with this studio",
								subSelection: [
									{name: "title",description: "The title of the media (language depends on user settings)"},
									{name: "ID",description: "The media's database number in the Anilist database"},
									{name: "score",description: "The current user's mean score for the media out of 100"},
									{name: "minutesWatched",description: "How many minutes of the media the current user has watched"},
									{name: "status",description: "The current user's watching status for the media"},
								]
							}
						],
						data: studioList.map(studio => {
							return {
								studio: studio.name,
								studioID: studio.id,
								count: studio.count,
								score: (studio.scoreSum/studio.scoreCount).roundPlaces(2),
								minutesWatched: studio.watchedDuration,
								media: studio.media.map(media => {
									return {
										title: media.title,
										ID: media.id,
										score: media.score,
										minutesWatched: media.watchedDuration,
										status: media.status
									}
								})
							}
						})
					},"Anime studio stats for " + user + ".json");
				}
				nameHeading.onclick = function(){
					studioList.sort(ALPHABETICAL(a => a.name));
					studioList.forEach(studio => {
						studio.media.sort(ALPHABETICAL(a => a.title))
					});
					drawStudioList();
				};
				countHeading.onclick = function(){
					studioList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
					drawStudioList();
				};
				scoreHeading.onclick = function(){
					studioList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
					studioList.forEach(studio => {
						studio.media.sort((b,a) => a.score - b.score)
					});
					drawStudioList();
				};
				timeHeading.onclick = function(){
					studioList.sort((b,a) => a.watchedDuration - b.watchedDuration);
					studioList.forEach(function(studio){
						studio.media.sort((b,a) => a.watchedDuration - b.watchedDuration);
					});
					drawStudioList();
				};
			};
			let clickOnce = function(){
				drawStudioList();
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.removeEventListener("click",clickOnce)
				}
			}
			let waiter = function(){
				if(location.pathname.includes("/stats/anime/studios")){
					clickOnce();
					return;
				}
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.addEventListener("click",clickOnce)
				}
				else{
					setTimeout(waiter,200)
				}
			};waiter();
		};
		if(user === whoAmI){
			generalAPIcall(
				queryMediaListAnime,
				{
					name: user,
					listType: "ANIME"
				},
				personalStatsCallback,"hohListCacheAnime",10*60*1000
			);
		}
		else{
			generalAPIcall(
				queryMediaListAnime,
				{
					name: user,
					listType: "ANIME"
				},
				personalStatsCallback
			);
		}
//manga stats
		let personalStatsMangaCallback = function(data){
			personalStatsManga.innerText = "";
			create("hr","hohSeparator",false,personalStatsManga);
			create("h1","hohStatHeading","Manga stats for " + user,personalStatsManga);
			let list = returnList(data);
			let scoreList = list.filter(element => element.scoreRaw);
			let personalStatsMangaContainer = create("div",false,false,personalStatsManga);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStatsManga);
				let compatLocation = create("div","#hohCheckCompatManga",false,personalStatsManga);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = "loading...";
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"MANGA",
						function(data){
							formatCompat(data,compatLocation)
						}
					)
				};
			};
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStatsManga);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					let newStatComment = create("span",false,false,newStat);
					newStatComment.innerHTML = comment;
				};
			};
			let chapters = 0;
			let volumes = 0;
			/*
			For most airing anime, Anilist provides "media.nextAiringEpisode.episode"
			Unfortunately, the same is not the case for releasing manga.
			THIS DOESN'T MATTER the first time a user is reading something, as we are then just using the current progress.
			But on a re-read, we need the total length to count all the chapters read.
			I can (and do) get a lower bound for this by using the current progress (this is what Anilist does),
			but this is not quite accurate, especially early in a re-read.
			The list below is to catch some of those exceptions
			*/
			let unfinishedLookup = function(mediaId,mode,mediaStatus,mediaProgress){//wow, this is a mess. But it works
				if(mediaStatus === "FINISHED"){
					return 0//it may have finished since the list was updated
				};
				if(commonUnfinishedManga.hasOwnProperty(mediaId)){
					if(mode === "chapters"){
						return commonUnfinishedManga[mediaId].chapters
					}
					else if(mode === "volumes"){
						return commonUnfinishedManga[mediaId].volumes
					}
					else if(mode === "volumesNow"){
						if(commonUnfinishedManga[mediaId].chapters <= mediaProgress){
							return commonUnfinishedManga[mediaId].volumes
						}
						else{
							return 0//conservative
						}
					};
					return 0;//fallback
				}
				else{
					return 0//not in our list
				}
			};
			list.forEach(function(item){
				let chaptersRead = 0;
				let volumesRead = 0;
				if(item.status === "COMPLETED"){//if it's completed, we can make some safe assumptions
					chaptersRead += Math.max(//chapter progress on the current read
						item.media.chapters,//in most cases, it has a chapter count
						item.media.volumes,//if not, there's at least 1 chapter per volume
						item.progress,//if it doesn't have a volume count either, the current progress is probably not out of date
						item.progressVolumes,//if it doesn't have a chapter progress, count at least 1 chapter per volume
						1//finally, an entry has at least 1 chapter
					);
					volumesRead += Math.max(
						item.progressVolumes,
						item.media.volumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)//if people have forgotten to update their volume count and have caught up.
					)
				}
				else{//we may only assume what's on the user's list.
					chaptersRead += Math.max(
						item.progress,
						item.progressVolumes
					);
					volumesRead += Math.max(
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)
					)
				};
				if(useScripts.noRewatches && item.repeat){//if they have a reread, they have at least completed it
					chaptersRead = Math.max(//first round
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead = Math.max(
						item.media.volumes,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				}
				else{
					chaptersRead += item.repeat * Math.max(//chapters from rereads
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead += item.repeat * Math.max(//many manga have no volumes, so we can't make all of the same assumptions
						item.media.volumes,
						item.progressVolumes,//better than nothing if a volume count is missing
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				};
				if(item.listJSON && item.listJSON.adjustValue){
					chaptersRead = Math.max(0,chaptersRead + item.listJSON.adjustValue)
				};
				chapters += chaptersRead;
				volumes += volumesRead;
				item.volumesRead = volumesRead;
				item.chaptersRead = chaptersRead;
			});
//
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let average = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let amount = scoreList.length;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumWeight = 0;
			let sumEntriesWeight = 0;

			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			scoreList.forEach(function(item){
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{	
					runLength = 1;
					previouScore = item.scoreRaw
				};
				sumWeight += item.chaptersRead;
				sumEntriesWeight += item.scoreRaw * item.chaptersRead
			});
			addStat("Manga on list: ",list.length);
			addStat("Manga rated: ",amount);
			addStat("Total chapters: ",chapters);
			addStat("Total volumes: ",volumes);
			if(amount){
				average = sumEntries/amount
			};
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2);
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore);
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
			if(amount){//no scores
				if(amount === 1){
					addStat(
						"Only one score given: ",
						maxRunLengthScore
					)
				}
				else{
					addStat(
						"Average score: ",
						average.toPrecision(4)
					);
					addStat(
						"Average score: ",
						(sumEntriesWeight/sumWeight).toPrecision(4),
						" (weighted by chapters)"
					);
					addStat("Median score: ",median);
					addStat(
						"Global difference: ",
						publicDifference.roundPlaces(2),
						" (average difference from global average)"
					);
					addStat(
						"Global deviation: ",
						publicDeviation.roundPlaces(2),
						" (standard deviation from the global average of each entry)"
					);
					if(maxRunLength > 1){
						addStat("Most common score: ",maxRunLengthScore, " (" + maxRunLength + " instances)")
					}
					else{
						addStat("Most common score: ","","no two scores alike")
					}
				}
			};
//
			let mangaFormatter = {
				title: "Custom Manga Tags",
				display: !useScripts.hideCustomTags,
				headings: ["Tag","Count","Mean Score","Chapters","Volumes"],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/manga/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.innerHTML = svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML = svgAssets.repeat + data[index].repeat
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1)
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].chaptersRead
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].volumesRead
						}
					}
				],
				sorting: [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.chaptersRead - b.chaptersRead,
					(b,a) => a.volumesRead - b.volumesRead
				]
			};
			const mangaFields = [
				{
					key : "name",
					method : function(media){
						if(aliases.has(media.mediaId)){
							return aliases.get(media.mediaId)
						}
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english
						}
						return media.media.title.romaji
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0
							})
						}
						acc[val]++;
						return acc
					},
					method : media => media.status
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead
				},{
					key : "volumesRead",
					sumable : ACCUMULATE,
					method : media => media.volumesRead
				}
			];
			let customTags = customTagsCollection(list,mangaFormatter.title,mangaFields);
			if(customTags.length){
				let customTagsMangaTable = create("div","#customTagsMangaTable",false,personalStatsManga);
				drawTable(customTags,mangaFormatter,customTagsMangaTable,true,true)
			};
			let listOfTags = regularTagsCollection(list,mangaFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			drawTable(listOfTags,mangaFormatter,regularMangaTable,true,false);
			semaPhoreManga = list;
			nativeTagsReplacer();
			generalAPIcall(queryMediaListStaff,{name: user,listType: "MANGA"},function(data){
				let rawStaff = returnList(data);
				rawStaff.forEach(function(raw,index){
					raw.status = list[index].status;
					raw.chaptersRead = list[index].chaptersRead;
					raw.volumesRead = list[index].volumesRead;
					raw.scoreRaw = list[index].scoreRaw
				});
				let staffMap = {};
				rawStaff.filter(obj => obj.status !== "PLANNING").forEach(function(media){
					media.media.staff.forEach(function(staff){
						if(!staffMap[staff.id]){
							staffMap[staff.id] = {
								chaptersRead: 0,
								volumesRead: 0,
								count: 0,
								scoreCount: 0,
								scoreSum: 0,
								id: staff.id,
								name: staff.name
							}
						}
						if(media.chaptersRead || media.volumesRead){
							staffMap[staff.id].volumesRead += media.volumesRead;
							staffMap[staff.id].chaptersRead += media.chaptersRead;
							staffMap[staff.id].count++
						};
						if(media.scoreRaw){
							staffMap[staff.id].scoreSum += media.scoreRaw;
							staffMap[staff.id].scoreCount++
						}
					})
				});
				let staffList = [];
				Object.keys(staffMap).forEach(
					key => staffList.push(staffMap[key])
				);
				staffList = staffList.filter(obj => obj.count >= 1).sort(
					(b,a) => a.count - b.count || a.chaptersRead - b.chaptersRead || a.volumesRead - b.volumesRead
				);
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 3
						|| (obj.count >= 2 && obj.chaptersRead > 100)
						|| obj.chaptersRead > 200
					)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 5
						|| (obj.count >= 2 && obj.chaptersRead > 200)
						|| obj.chaptersRead > 300
					)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 10
						|| (obj.count >= 2 && obj.chaptersRead > 300)
						|| obj.chaptersRead > 400
					)
				};
				let hasScores = staffList.some(a => a.scoreCount);
				let drawStaffList = function(){
					removeChildren(mangaStaff)
					mangaStaff.innerText = "";
					let table = create("div",["table","hohTable","hohNoPointer"],false,mangaStaff);
					let headerRow = create("div",["header","row","good"],false,table);
					let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
					let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
					let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
					if(!hasScores){
						scoreHeading.style.display = "none"
					}
					let timeHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
					let volumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
					staffList.forEach(function(staff,index){
						let row = create("div",["row","good"],false,table);
						let nameCel = create("div",false,(index + 1) + " ",row);
						create("a","newTab",staff.name.first + " " + (staff.name.last || ""),nameCel)
							.href = "/staff/" + staff.id;
						create("div",false,staff.count,row);
						if(hasScores){
							create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row)
						}
						create("div",false,staff.chaptersRead,row);
						create("div",false,staff.volumesRead,row)
					});
					let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",mangaStaff,"margin-top:10px;");
					let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",mangaStaff,"margin-top:10px;");
					csvButton.onclick = function(){
						let csvContent = 'Staff,Count,"Mean Score","Chapters Read","Volumes Read"\n';
						staffList.forEach(function(staff){
							csvContent += csvEscape(
								[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
							) + ",";
							csvContent += staff.count + ",";
							csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
							csvContent += staff.chaptersRead + ",";
							csvContent += staff.volumesRead + "\n";
						});
						saveAs(csvContent,"Manga staff stats for " + user + ".csv",true)
					};
					jsonButton.onclick = function(){
						saveAs({
							type: "MANGA",
							user: user,
							timeStamp: NOW(),
							version: "1.00",
							scriptInfo: scriptInfo,
							url: document.URL,
							description: "Anilist manga staff stats for " + user,
							fields: [
								{name: "name",description: "The full name of the staff member, as firstname lastname"},
								{name: "staffID",description: "The staff member's database number in the Anilist database"},
								{name: "count",description: "The total number of media this staff member has credits for, for the current user"},
								{name: "score",description: "The current user's mean score for the staff member out of 100"},
								{name: "chaptersRead",description: "How many chapters of this staff member's credited media the current user has read"},
								{name: "volumesRead",description: "How many volumes of this staff member's credited media the current user has read"}
							],
							data: staffList.map(staff => {
								return {
									name: (staff.name.first + " " + (staff.name.last || "")).trim(),
									staffID: staff.id,
									count: staff.count,
									score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
									chaptersRead: staff.chaptersRead,
									volumesRead: staff.volumesRead
								}
							})
						},"Manga staff stats for " + user + ".json")
					}
					nameHeading.onclick = function(){
						staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
						drawStaffList()
					};
					countHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.count - b.count
								|| a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					};
					scoreHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
								|| a.count - b.count
								|| a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
						);
						drawStaffList()
					};
					timeHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
								|| a.count - b.count
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					};
					volumeHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.volumesRead - b.volumesRead
								|| a.chaptersRead - b.chaptersRead
								|| a.count - b.count
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					}
				};
				let clickOnce = function(){
					drawStaffList();
					let place = document.querySelector(`[href$="/stats/manga/staff"]`);
					if(place){
						place.removeEventListener("click",clickOnce)
					}
				}
				let waiter = function(){
					if(location.pathname.includes("/stats/manga/staff")){
						clickOnce();
						return
					}
					let place = document.querySelector(`[href$="/stats/manga/staff"]`);
					if(place){
						place.addEventListener("click",clickOnce)
					}
					else{
						setTimeout(waiter,200)
					}
				};waiter();
			},"hohListCacheMangaStaff" + user,10*60*1000);
		};
		if(user === whoAmI){
			generalAPIcall(
				queryMediaListManga,
				{
					name: user,
					listType: "MANGA"
				},
				personalStatsMangaCallback,"hohListCacheManga",10*60*1000
			)
		}
		else{
			generalAPIcall(
				queryMediaListManga,
				{
					name: user,
					listType: "MANGA"
				},
				personalStatsMangaCallback
			)
		}
	};
	let tabWaiter = function(){
		let tabMenu = filterGroup.querySelectorAll(".filter-group > a");
		tabMenu.forEach(function(tab){
			tab.onclick = function(){
				Array.from(document.querySelector(".stats-wrap").children).forEach(child => {
					child.style.display = "initial";
				});
				Array.from(document.getElementsByClassName("hohActive")).forEach(child => {
					child.classList.remove("hohActive");
				});
				document.getElementById("hohStats").style.display = "none";
				document.getElementById("hohGenres").style.display = "none";
				document.querySelector(".page-content .user").classList.remove("hohSpecialPage");
			};
		});
		if(!tabMenu.length){
			setTimeout(tabWaiter,200)
		}
	};tabWaiter();
	let statsWrap = document.querySelector(".stats-wrap");
	if(statsWrap){
		hohStats = create("div","#hohStats",false,statsWrap,"display:none;");
		hohGenres = create("div","#hohGenres",false,statsWrap,"display:none;");
		regularGenresTable = create("div","#regularGenresTable","loading...",hohGenres);
		regularTagsTable = create("div","#regularTagsTable","loading...",hohGenres);
		regularAnimeTable = create("div","#regularAnimeTable","loading...",statsWrap);
		regularMangaTable = create("div","#regularMangaTable","loading...",statsWrap);
		animeStaff = create("div","#animeStaff","loading...",statsWrap);
		mangaStaff = create("div","#mangaStaff","loading...",statsWrap);
		animeStudios = create("div","#animeStudios","loading...",statsWrap);
		hohStats.calculated = false;
		generateStatPage();
	};
	hohStatsTrigger.onclick = function(){
		hohStatsTrigger.classList.add("hohActive");
		hohGenresTrigger.classList.remove("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active");
		};
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "initial";
		hohGenres.style.display = "none"
	};
	hohGenresTrigger.onclick = function(){
		hohStatsTrigger.classList.remove("hohActive");
		hohGenresTrigger.classList.add("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active")
		};
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "none";
		hohGenres.style.display = "initial";
	};
};

function drawListStuff(){
	const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
	if(!URLstuff){
		return
	};
	if(document.querySelector(".hohExtraFilters")){
		return
	};
	let filters = document.querySelector(".filters-wrap");
	if(!filters){
		setTimeout(drawListStuff,200);
		return
	};
	let extraFilters = create("div","hohExtraFilters");
	extraFilters.style.marginTop = "15px";
	if(useScripts.draw3x3){
		let buttonDraw3x3 = create("span","#hohDraw3x3","3x3",extraFilters);
		buttonDraw3x3.title = "Create a 3x3 from 9 selected entries";
		buttonDraw3x3.onclick = function(){
			this.style.color = "rgb(var(--color-blue))";
			let counter = 0;
			let linkList = [];
			let cardList = document.querySelectorAll(".entry-card.row,.entry.row");
			cardList.forEach(function(card){
				card.onclick = function(){
					if(this.draw3x3selected){
						counter--;
						linkList[this.draw3x3selected - 1] = "";
						this.draw3x3selected = false;
						this.style.borderStyle = "none";
					}
					else{
						counter++;
						linkList.push(this.querySelector(".cover .image").style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',""));
						this.draw3x3selected = +linkList.length;
						this.style.borderStyle = "solid";
						if(counter === 9){
							linkList = linkList.filter(e => e !== "");
							let displayBox = createDisplayBox();
							create("p",false,"Save the image below:",displayBox);
							displayBox.querySelector(".hohDisplayBoxClose").onclick = function(){
								displayBox.remove();
								cardList.forEach(function(card){
									card.draw3x3selected = false;
									card.style.borderStyle = "none";
								});
								counter = 0;
								linkList = [];
							};
							create("div",false,false,displayBox);
							let finalCanvas = create("canvas",false,false,displayBox);
							finalCanvas.width = 230*3;
							finalCanvas.height = 345*3;
							let ctx = finalCanvas.getContext("2d");
							let drawStuff = function(image,x,y,width,height){
								let img = new Image();
								img.onload = function(){
									ctx.drawImage(img,x,y,width,height);
								}
								img.src = image;
							};
							for(var i=0;i<3;i++){
								for(var j=0;j<3;j++){
									drawStuff(linkList[i*3+j],j*230,i*345,230,345);
								};
							};
						}
					}
				};
			});
		}
	}
	if(useScripts.newChapters && URLstuff[2] === "mangalist"){
		let buttonFindChapters = create("button",["hohButton","button"],"New Chapters",extraFilters,"display:block;");
		buttonFindChapters.onclick = function(){
			let scrollableContent = createDisplayBox("min-width:400px;height:500px;");
			let loader = create("p",false,"Scanning...",scrollableContent);
			generalAPIcall(`
			query($name: String!){
				MediaListCollection(userName: $name, type: MANGA){
					lists{
						entries{
							mediaId
							status
							media{
								status
							}
						}
					}
				}
			}`,
			{name: decodeURIComponent(URLstuff[1])},
			function(data){
				let list = returnList(data,true).filter(a => a.status === "CURRENT" && a.media.status === "RELEASING");
				let returnedItems = 0;
				let goodItems = [];
				let checkListing = function(data){
					returnedItems++;
					if(returnedItems === list.length){
						loader.innerText = "";
						if(!goodItems.length){
							loader.innerText = "No new items found :(";
						};
					};
					let guesses = [];
					let userIdCache = new Set();
					data.data.Page.activities.forEach(function(activity){
						if(activity.progress){
							let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
							if(!userIdCache.has(activity.userId)){
								guesses.push(chapterMatch);
								userIdCache.add(activity.userId);
							};
						};
					});
					guesses.sort(VALUE_DESC);
					if(guesses.length){
						let bestGuess = guesses[0];
						if(guesses.length > 2){
							let diff = guesses[0] - guesses[1];
							let inverseDiff = 1 + Math.ceil(20/(diff+1));
							if(guesses.length >= inverseDiff){
								if(guesses[1] === guesses[inverseDiff]){
									bestGuess = guesses[1];
								}
							};
						};
						if(commonUnfinishedManga.hasOwnProperty(data.data.MediaList.media.id)){
							if(bestGuess < commonUnfinishedManga[data.data.MediaList.media.id].chapters){
								bestGuess = commonUnfinishedManga[data.data.MediaList.media.id].chapters;
							};
						};
						let bestDiff = bestGuess - data.data.MediaList.progress;
						if(bestDiff > 0 && bestDiff < 30){
							goodItems.push({data:data,bestGuess:bestGuess});
							removeChildren(scrollableContent)
							goodItems.sort((b,a) => a.data.data.MediaList.score - b.data.data.MediaList.score);
							goodItems.forEach(function(item){
								let listing = create("p","hohNewChapter",false,scrollableContent);
								let title = item.data.data.MediaList.media.title.romaji;
								if(useScripts.titleLanguage === "NATIVE" && item.data.data.MediaList.media.title.native){
									title = item.data.data.MediaList.media.title.native;
								}
								else if(useScripts.titleLanguage === "ENGLISH" && item.data.data.MediaList.media.title.english){
									title = item.data.data.MediaList.media.title.english;
								};
								let countPlace = create("span",false,false,listing,"width:110px;display:inline-block;");
								let progress = create("span",false,item.data.data.MediaList.progress + " ",countPlace);
								let guess = create("span",false,"+" + (item.bestGuess - item.data.data.MediaList.progress),countPlace,"color:rgb(var(--color-green));");
								if(useScripts.accessToken){
									progress.style.cursor = "pointer";
									progress.title = "Increase progress by 1";
									progress.onclick = function(){
										item.data.data.MediaList.progress++;
										authAPIcall(
											`mutation($id: Int,$progress: Int){
												SaveMediaListEntry(mediaId: $id,progress: $progress){id}
											}`,
											{
												id: item.data.data.MediaList.media.id,
												progress: item.data.data.MediaList.progress
											},
											function(fib){}
										);
										progress.innerText = item.data.data.MediaList.progress + " ";
										if(item.bestGuess - item.data.data.MediaList.progress > 0){
											guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress);
										}
										else{
											guess.innerText = "";
										}
									}
								};
								create("a",["link","newTab"],title,listing)
									.href = "/manga/" + item.data.data.MediaList.media.id + "/" + safeURL(title) + "/";
								let chapterClose = create("span","hohDisplayBoxClose",svgAssets.cross,listing);
								chapterClose.onclick = function(){
									listing.remove();
								};
							});
						}
					};
				};
				let bigQuery = [];
				list.forEach(function(entry,index){
					bigQuery.push({
						query: `
query($id: Int,$userName: String){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
	MediaList(
		userName: $userName,
		mediaId: $id
	){
		progress
		score
		media{
			id
			title{romaji native english}
		}
	}
}`,
						variables: {
							id: entry.mediaId,
							userName: decodeURIComponent(URLstuff[1])
						},
						callback: checkListing
					});
					if((index % 20) === 0){
						queryPacker(bigQuery);
						bigQuery = [];
					};
				});
				queryPacker(bigQuery);
			});
		};
	};
	if(useScripts.tagIndex && (!useScripts.mobileFriendly)){
		let tagIndex = create("div","tagIndex",false,extraFilters);
		let collectNotes = function(data){
			let customTags = new Map();	
			let listData = returnList(data,true);
			listData.forEach(function(entry){
				if(entry.notes){
					(
						entry.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,count: 0})
						}
						customTags.get(tagMatch).count++
					})
					let noteContent = parseListJSON(entry.notes);
					if(noteContent && noteContent.lists){
						noteContent.lists.forEach(function(list){
							if(list.name && list.info){
								let titles = document.querySelectorAll("h3.section-name");
								for(var i=0;i<titles.length;i++){
									if(titles[i].innerText === list.name){
										let descriptionNode = create("p",false,list.info);
										titles[i].parentNode.insertBefore(descriptionNode,titles[i].nextSibling);
										break;
									}
								}
							}
						})
					}
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			customTags = [...customTags].map(pair => pair[1]);
			customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
			removeChildren(tagIndex)
			customTags.forEach(tag => {
				let tagElement = create("p",false,tag.name,tagIndex);
				create("span","count",tag.count,tagElement);
				tagElement.onclick = function(){
					let filterBox = document.querySelector(".entry-filter input");
					filterBox.value = tag.name;
					filterBox.dispatchEvent(new Event("input"));
					if(filterBox.scrollIntoView){
						filterBox.scrollIntoView({"behavior": "smooth","block": "start"})
					}
					else{
						document.body.scrollTop = document.documentElement.scrollTop = 0
					}
				}
			})
		};
		let variables = {
			name: decodeURIComponent(URLstuff[1]),
			listType: "ANIME"
		};
		if(URLstuff[2] === "mangalist"){
			variables.listType = "MANGA"
		};
		generalAPIcall(queryMediaListNotes,variables,collectNotes,"hohCustomTagIndex" + variables.listType + variables.name,60*1000);
	}
	filters.appendChild(extraFilters);
	let filterBox = document.querySelector(".entry-filter input");
	let searchParams = new URLSearchParams(location.search);
	let paramSearch = searchParams.get("search");
	if(paramSearch){
		filterBox.value = decodeURIComponent(paramSearch);
		let event = new Event("input");
		filterBox.dispatchEvent(event);
	}
	let filterChange = function(){
		let newURL = location.protocol + "//" + location.host + location.pathname 
		if(filterBox.value === ""){
			searchParams.delete("search")
		}
		else{
			searchParams.set("search",encodeURIComponent(filterBox.value));
			newURL += "?" + searchParams.toString();
		}
		current = newURL;
		history.replaceState({},"",newURL);
		if(document.querySelector(".el-icon-circle-close")){
			document.querySelector(".el-icon-circle-close").onclick = filterChange
		}
	}
	filterBox.oninput = filterChange;
	filterChange();
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: true
	};
	if(
		decodeURIComponent(URLstuff[1]) === whoAmI
		&& useScripts.accessToken
		&& useScripts.plussMinus
		&& (
			document.querySelector(".medialist").classList.contains("POINT_100")
			|| document.querySelector(".medialist").classList.contains("POINT_10")
			|| document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")
		)
	){
		let minScore = 1;
		let maxScore = 100;
		let stepSize = 1;
		if(document.querySelector(".medialist").classList.contains("POINT_10") || document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			maxScore = 10;
		}
		if(document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			stepSize = 0.1;
		}
		let scoreChanger = function(){
			observer.disconnect();
			lists.querySelectorAll(".list-entries .row .score").forEach(function(entry){
				if(!entry.childElementCount){
					let updateScore = function(isUp){
						let score = parseFloat(entry.attributes.score.value);
						if(isUp){
							score += stepSize;
						}
						else{
							score -= stepSize;
						}
						if(score >= minScore && score <= maxScore){
							let id = parseInt(entry.previousElementSibling.children[0].href.match(/(anime|manga)\/(\d+)/)[2]);
							lists.querySelectorAll("[href=\"" + entry.previousElementSibling.children[0].attributes.href.value + "\"]").forEach(function(rItem){
								rItem.parentNode.nextElementSibling.attributes.score.value = score.roundPlaces(1);
								rItem.parentNode.nextElementSibling.childNodes[1].textContent = " " + score.roundPlaces(1) + " ";
							});
							authAPIcall(
								`mutation($id:Int,$score:Float){
									SaveMediaListEntry(mediaId:$id,score:$score){
										score
									}
								}`,
								{id:id,score:score},function(data){/*later*/}
							);
						};
					};
					let changeMinus = create("span","hohChangeScore","-");
					entry.insertBefore(changeMinus,entry.firstChild);
					let changePluss = create("span","hohChangeScore","+",entry);
					changeMinus.onclick = function(){updateScore(false)};
					changePluss.onclick = function(){updateScore(true)};
				}
			});
			observer.observe(lists,mutationConfig);
		}
		let lists = document.querySelector(".lists");
		let observer = new MutationObserver(scoreChanger);
		observer.observe(lists,mutationConfig);
		scoreChanger();
	}
};

function addDblclickZoom(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addDblclickZoom,200);
		return;
	};
	activityFeedWrap.addEventListener("dblclick",function(e){
		e = e || window.event;
		let target = e.target || e.srcElement;
	 	while(target.classList){
			if(target.classList.contains("activity-entry")){
				target.classList.toggle("hohZoom");
				break;
			};
			target = target.parentNode;
		}  
	},false);
}

function addFeedFilters(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let filterBox = document.querySelector(".hohFeedFilter");
	if(filterBox){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addFeedFilters,100);
		return;
	};
	let activityFeed = activityFeedWrap.querySelector(".activity-feed");
	if(!activityFeed){
		setTimeout(addFeedFilters,100);
		return;
	};
	let commentFilterBoxInput;
	let commentFilterBoxLabel;
	let likeFilterBoxInput;
	let likeFilterBoxLabel;
	let allFilterBox;
	let blockList = localStorage.getItem("blockList");
	if(blockList){
		blockList = JSON.parse(blockList)
	}
	else{
		blockList = []
	};
	let postRemover = function(){
		if(!location.pathname.match(/^\/home\/?$/)){
			return
		};
		for(var i=0;i<activityFeed.children.length;i++){
			if(activityFeed.children[i].querySelector(".el-dialog__wrapper")){
				continue
			};
			let actionLikes = activityFeed.children[i].querySelector(".action.likes .button .count");
			if(actionLikes){
				actionLikes = parseInt(actionLikes.innerText);
			}
			else{
				actionLikes = 0
			};
			let actionReplies = activityFeed.children[i].querySelector(".action.replies .count");
			if(actionReplies){
				actionReplies = parseInt(actionReplies.innerText);
			}
			else{
				actionReplies = 0
			};
			let blockRequire = true;
			if(useScripts.blockWord && activityFeed.children[i].classList.contains("activity-text")){
				try{
					if(activityFeed.children[i].innerText.match(new RegExp(blockWordValue,"i"))){
						blockRequire = false
					}
				}
				catch(err){
					if(activityFeed.children[i].innerText.toLowerCase().match(useScripts.blockWordValue.toLowerCase())){
						blockRequire = false
					}
				}
			}
			if(useScripts.statusBorder){
				if(activityFeed.children[i].classList.contains("activity-anime_list") || activityFeed.children[i].classList.contains("activity-manga_list")){
					let blockerMap = {
						"plans": "PLANNING",
						"Plans": "PLANNING",
						"watched": "CURRENT",
						"Watched": "CURRENT",
						"read": "CURRENT",
						"Read": "CURRENT",
						"completed": "COMPLETED",
						"Completed": "COMPLETED",
						"paused": "PAUSED",
						"Paused": "PAUSED",
						"dropped": "DROPPED",
						"Dropped": "DROPPED",
						"rewatched": "REPEATING",
						"Rewatched": "REPEATING",
						"reread": "REPEATING",
						"Reread": "REPEATING"
					};
					let status = blockerMap[
						Object.keys(blockerMap).find(
							key => activityFeed.children[i].querySelector(".status").innerText.includes(key)
						)
					]
					if(status === "CURRENT"){
						activityFeed.children[i].style.borderRightWidth = "0px"
					}
					else if(status === "COMPLETED"){
						activityFeed.children[i].style.borderRightStyle = "solid";
						activityFeed.children[i].style.borderRightWidth = "5px";
						if(useScripts.CSSgreenManga && activityFeed.children[i].classList.contains("activity-anime_list")){
							activityFeed.children[i].style.borderRightColor = "rgb(var(--color-blue))";
						}
						else{
							activityFeed.children[i].style.borderRightColor = "rgb(var(--color-green))";
						}
					}
					else{
						activityFeed.children[i].style.borderRightStyle = "solid";
						activityFeed.children[i].style.borderRightWidth = "5px";
						activityFeed.children[i].style.borderRightColor = distributionColours[status];
					}
				}		
			}
			const statusCheck = {
				"planning": /^plans/i,
				"watching": /^watched/i,
				"reading": /^read/i,
				"completing": /^completed/i,
				"pausing": /^paused/i,
				"dropping": /^dropped/i,
				"rewatching": /^rewatched/i,
				"rereading": /^reread/i
			}
			if(
				(!useScripts.feedCommentFilter || (
					actionLikes >= likeFilterBoxInput.value
					&& (likeFilterBoxInput.value >= 0 || actionLikes < -likeFilterBoxInput.value)
					&& actionReplies >= commentFilterBoxInput.value
					&& (commentFilterBoxInput.value >= 0 || actionReplies < -commentFilterBoxInput.value)
				))
				&& blockRequire
				&& blockList.every(
					blocker => (
						blocker.user
						&& activityFeed.children[i].querySelector(".name").textContent.trim().toLowerCase() !== blocker.user.toLowerCase()
					)
					|| (
						blocker.media
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| activityFeed.children[i].querySelector(".status .title").href.match(/\/(anime|manga)\/(\d+)/)[2] !== blocker.media
						)
					)
					|| (
						blocker.status
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| blocker.status == "status"
							|| (
								blocker.status === "anime"
								&& !activityFeed.children[i].classList.contains("activity-anime_list")
							)
							|| (
								blocker.status === "manga"
								&& !activityFeed.children[i].classList.contains("activity-manga_list")
							)
							|| (
								statusCheck[blocker.status]
								&& !activityFeed.children[i].querySelector(".status").textContent.trim().match(statusCheck[blocker.status])
							)
						)
					)
				)
			){
				if(
					useScripts.SFWmode
					&& activityFeed.children[i].classList.contains("activity-text")
					&& badWords.some(word => activityFeed.children[i].querySelector(".activity-markdown").innerText.match(word))
				){
					activityFeed.children[i].style.opacity= 0.5
				}
				else{
					activityFeed.children[i].style.display = ""
				}
			}
			else{
				activityFeed.children[i].style.display = "none"
			}
		};
	};
	if(useScripts.feedCommentFilter){
		filterBox = create("div","hohFeedFilter",false,activityFeedWrap);
		create("span","hohDescription","At least ",filterBox);
		activityFeedWrap.style.position = "relative";
		activityFeedWrap.children[0].childNodes[0].nodeValue = "";
		commentFilterBoxInput = create("input",false,false,filterBox);
		commentFilterBoxInput.type = "number";
		commentFilterBoxInput.value = useScripts.feedCommentComments;
		commentFilterBoxLabel = create("span",false," comments, ",filterBox);
		likeFilterBoxInput = create("input",false,false,filterBox);
		likeFilterBoxInput.type = "number";
		likeFilterBoxInput.value = useScripts.feedCommentLikes;
		likeFilterBoxLabel = create("span",false," likes",filterBox);
		allFilterBox = create("button",false,"⟳",filterBox,"padding:0px;");
		commentFilterBoxInput.onchange = function(){
			useScripts.feedCommentComments = commentFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		likeFilterBoxInput.onchange = function(){
			useScripts.feedCommentLikes = likeFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		allFilterBox.onclick = function(){
			commentFilterBoxInput.value = 0;
			likeFilterBoxInput.value = 0;
			useScripts.feedCommentComments = 0;
			useScripts.feedCommentLikes = 0;
			useScripts.save();
			postRemover();
		};
	}
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: false
	};
	let observer = new MutationObserver(function(){
		postRemover();
		setTimeout(postRemover,500);
	});
	observer.observe(activityFeed,mutationConfig);
	let observerObserver = new MutationObserver(function(){//Who police police? The police police police police
		activityFeed = activityFeedWrap.querySelector(".activity-feed");
		if(activityFeed){
			observer.disconnect();
			observer = new MutationObserver(function(){
				postRemover();
				setTimeout(postRemover,500);
			});
			observer.observe(activityFeed,mutationConfig);
		}
	});
	observerObserver.observe(activityFeedWrap,mutationConfig);
	postRemover();
	let waiter = function(){
		setTimeout(function(){
			if(location.pathname.match(/^\/home\/?$/)){
				postRemover();
				waiter();
			};
		},5*1000);
	};waiter();
};

function expandRight(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let possibleFullWidth = document.querySelector(".home.full-width");
	if(possibleFullWidth){
		let homeContainer = possibleFullWidth.parentNode;
		let sideBar = document.querySelector(".activity-feed-wrap")
		if(!sideBar){
			setTimeout(expandRight,100);
			return;
		};
		sideBar = sideBar.nextElementSibling;
		sideBar.insertBefore(possibleFullWidth,sideBar.firstChild);
		let setSemantics = function(){
			let toggle = document.querySelector(".size-toggle.fa-compress");
			if(toggle){
				toggle.onclick = function(){
					homeContainer.insertBefore(possibleFullWidth,homeContainer.firstChild)
				}
			}
			else{
				setTimeout(setSemantics,200)
			};
		};setSemantics();
	}
}

function mangaGuess(cleanAnime,id){
	let possibleMangaGuess = document.querySelector(".data-set .value[data-media-id]");
	if(possibleMangaGuess){
		if(cleanAnime){
			removeChildren(possibleMangaGuess)
		}
		else if(id !== parseInt(possibleMangaGuess.dataset.mediaId)){
			removeChildren(possibleMangaGuess)
		}
	};
	if(cleanAnime){
		return
	};
	let URLstuff = location.pathname.match(/^\/manga\/(\d+)\/?(.*)?/);
	if(!URLstuff){
		return;
	};
	let possibleReleaseStatus = Array.from(
		document.querySelectorAll(".data-set .value")
	).find(
		element => element.innerText.match(/^Releasing/)
	);
	if(!possibleReleaseStatus){
		setTimeout(mangaGuess,200);
		return;
	}
	if(possibleReleaseStatus.dataset.mediaId === URLstuff[1]){
		if(possibleReleaseStatus.children.length !== 0){
			return
		}
	}
	else{
		removeChildren(possibleReleaseStatus)
	};
	possibleReleaseStatus.dataset.mediaId = URLstuff[1];
	const variables = {id: parseInt(URLstuff[1]),userName: whoAmI};
	let query = `
query($id: Int,$userName: String){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
	MediaList(
		userName: $userName,
		mediaId: $id
	){
		progress
	}
}`;
	let possibleMyStatus = document.querySelector(".actions .list .add");
	const simpleQuery = !possibleMyStatus || possibleMyStatus.innerText === "Add to List" || possibleMyStatus.innerText === "Planning";
	if(simpleQuery){
		query = `
query($id: Int){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
}`;
	};
	let highestChapterFinder = function(data){
		if(possibleReleaseStatus.children.length !== 0){
			return;
		}
		let guesses = [];
		let userIdCache = new Set();
		data.data.Page.activities.forEach(function(activity){
			if(activity.progress){
				let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
				if(!userIdCache.has(activity.userId)){
					guesses.push(chapterMatch);
					userIdCache.add(activity.userId)
				}
			}
		});
		guesses.sort(VALUE_DESC);
		if(guesses.length){
			let bestGuess = guesses[0];
			if(guesses.length > 2){
				let diff = guesses[0] - guesses[1];
				let inverseDiff = 1 + Math.ceil(25/(diff+1));
				if(guesses.length >= inverseDiff){
					if(guesses[1] === guesses[inverseDiff]){
						bestGuess = guesses[1]
					}
				}
			};
			if(commonUnfinishedManga.hasOwnProperty(variables.id)){
				if(bestGuess < commonUnfinishedManga[variables.id].chapters){
					bestGuess = commonUnfinishedManga[variables.id].chapters
				}
			};
			if(simpleQuery){
				if(bestGuess){
					create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus);
				}
			}
			else{
				bestGuess = Math.max(bestGuess,data.data.MediaList.progress);
				if(bestGuess){
					if(bestGuess === data.data.MediaList.progress){
						create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus,"color:rgb(var(--color-green));");
					}
					else{
						create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus);
						create("span","hohGuess"," [+" + (bestGuess - data.data.MediaList.progress) + "]",possibleReleaseStatus,"color:rgb(var(--color-red));");
					}
				}
			};
		};
	};
	try{
		generalAPIcall(query,variables,highestChapterFinder,"hohMangaGuess" + variables.id,30*60*1000);
	}
	catch(e){
		sessionStorage.removeItem("hohMangaGuess" + variables.id);
	}
}

if(useScripts.ALbuttonReload){
	let logo = document.querySelector(".logo");
	if(logo){
		logo.onclick = function(){
			if(location.pathname.match(/\/home\/?$/)){//we only want this behaviour here
				window.location.reload(false);//reload page, but use cache if possible
			}
		}
	}
}

function enumerateSubmissionStaff(){
	if(!location.pathname.match(/^\/edit/)){
		return;
	};
	setTimeout(enumerateSubmissionStaff,500);
	let staffFound = [];
	let staffEntries = document.querySelectorAll(".staff-row .col > .image");
	Array.from(staffEntries).forEach(function(staff){
		let enumerate = staffFound.filter(a => a === staff.href).length;
		if(enumerate === 1){
			let firstStaff = document.querySelector(".staff-row .col > .image[href=\"" + staff.href.replace("https://anilist.co","") + "\"]");
			if(!firstStaff.previousSibling){
				firstStaff.parentNode.insertBefore(
					create("span","hohEnumerateStaff",1),
					firstStaff
				)
			};
		}
		if(enumerate > 0){
			if(staff.previousSibling){
				staff.previousSibling.innerText = enumerate + 1;
			}
			else{
				staff.parentNode.insertBefore(
					create("span","hohEnumerateStaff",(enumerate + 1)),
					staff
				)
			}
		};
		staffFound.push(staff.href);
	});
}

function addMALscore(type,id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return;
	};
	let MALscore = document.getElementById("hohMALscore");
	if(MALscore){
		if(parseInt(MALscore.dataset.id) === id){
			return;
		}
		else{
			MALscore.remove();
		}
	};
	let MALserial = document.getElementById("hohMALserialization");
	if(MALserial){
		if(parseInt(MALserial.dataset.id) === id){
			return;
		}
		else{
			MALserial.remove();
		}
	};
	let possibleReleaseStatus = Array.from(document.querySelectorAll(".data-set .type"));
	const MALlocation = possibleReleaseStatus.find(element => element.innerText === "Mean Score");
	if(MALlocation){
		MALscore = create("div","data-set");
		MALscore.id = "hohMALscore";
		MALscore.dataset.id = id;
		MALlocation.parentNode.parentNode.insertBefore(MALscore,MALlocation.parentNode.nextSibling);
		if(type === "manga"){
			MALserial = create("div","data-set");
			MALserial.id = "hohMALserialization";
			MALserial.dataset.id = id;
			MALlocation.parentNode.parentNode.insertBefore(MALserial,MALlocation.parentNode.nextSibling.nextSibling);
		}
		generalAPIcall("query($id:Int){Media(id:$id){idMal}}",{id:id},function(data){
			if(data.data.Media.idMal){
				let handler = function(response){
					let score = response.responseText.match(/ratingValue.+?(\d+\.\d+)/);
					if(score && useScripts.MALscore){
						MALscore.style.paddingBottom = "14px";
						create("a",["type","newTab","external"],"MAL Score",MALscore)
							.href = "https://myanimelist.net/" + type + "/" + data.data.Media.idMal;
						create("div","value",score[1],MALscore);
					}
					if(type === "manga" && useScripts.MALserial){
						let serialization = response.responseText.match(/Serialization:<\/span>\n.*?href="(.*?)"\stitle="(.*?)"/);
						if(serialization){
							MALserial.style.paddingBottom = "14px";
							create("div","type","Serialization",MALserial);
							let link = create("a",["value","newTab","external"],serialization[2].replace("&#039;","'"),MALserial)
							link.href = "https://myanimelist.net" + serialization[1];
						}
					}
					let adder = function(){
						let possibleOverview = document.querySelector(".overview .grid-section-wrap:last-child");
						if(!possibleOverview){
							setTimeout(adder,500);
							return;
						}
						(possibleOverview.querySelector(".hohRecContainer") || {remove: ()=>{}}).remove();
						let recContainer = create("div",["grid-section-wrap","hohRecContainer"],false,possibleOverview);
						create("h2",false,"MAL recs",recContainer);
						let pattern = /class="picSurround"><a href="https:\/\/myanimelist.net\/(anime|manga)\/(\d+)\/(.|\n)*?detail\-user\-recs\-text.*?">(.*?)<\/div>/g;
						let matching = [];
						let matchingItem;
						while((matchingItem = pattern.exec(response.responseText)) && matching.length < 5){//single "=" is intended, we are setting the value of each match, not comparing
							matching.push(matchingItem)
						}
						if(!matching.length){
							recContainer.style.display = "none"
						}
						matching.forEach(function(item){
							let idMal = item[2];
							let description = item[4];
							let rec = create("div","hohRec",false,recContainer);
							let recImage = create("a","hohBackgroundCover",false,rec,"border-radius: 3px;");
							let recTitle = create("a","title",false,rec,"position:absolute;top:35px;left:80px;color:rgb(var(--color-blue));");
							recTitle.innerText = "MAL ID " + idMal;
							let recDescription = create("p",false,false,rec,"font-size: 1.4rem;line-height: 1.5;");
							recDescription.innerHTML = description;
							generalAPIcall("query($idMal:Int,$type:MediaType){Media(idMal:$idMal,type:$type){id title{romaji native english} coverImage{large color} siteUrl}}",{idMal:idMal,type:item[1].toUpperCase()},function(data){
								if(!data){
									return;
								};
								recImage.style.backgroundColor = data.data.Media.coverImage.color || "rgb(var(--color-foreground))";
								recImage.style.backgroundImage = "url(\"" + data.data.Media.coverImage.large + "\")";
								recImage.href = data.data.Media.siteUrl;
								if(useScripts.titleLanguage === "NATIVE" && data.data.Media.title.native){
									recTitle.innerText = data.data.Media.title.native;
								}
								else if(useScripts.titleLanguage === "ENGLISH" && data.data.Media.title.english){
									recTitle.innerText = data.data.Media.title.english;
								}
								else{
									recTitle.innerText = data.data.Media.title.romaji;
								}
								recTitle.href = data.data.Media.siteUrl;
							},"hohIDmalReverse" + idMal);
						})
					};
					if(useScripts.MALrecs){
						adder()
					}
				}
				if(window.GM_xmlhttpRequest){
					GM_xmlhttpRequest({
						method: "GET",
						anonymous: true,
						url: "https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs",
						onload: function(response){handler(response)}
					})
				}
				else{
					let oReq = new XMLHttpRequest();
					oReq.addEventListener("load",function(){handler(this)});
					oReq.open("GET","https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs");
					oReq.send();
				}
			}
		},"hohIDmal" + id);
	}
	else{
		setTimeout(() => {addMALscore(type,id)},200)
	}
}

function cencorMediaPage(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let possibleLocation = document.querySelectorAll(".tags .tag .name");
	if(possibleLocation.length){
		if(possibleLocation.some(
			tag => badTags.some(
				bad => tag.innerText.toLowerCase().includes(bad)
			)
		)){
			let content = document.querySelector(".page-content");
			if(content){
				content.classList.add("hohCencor")
			}
		}
	}
	else{
		setTimeout(() => {cencorMediaPage(id)},200)
	}
}

function addEntryScore(id,tries){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let existing = document.getElementById("hohEntryScore");
	if(existing){
		if(existing.dataset.mediaId === id && !tries){
			return
		}
		else{
			existing.remove()
		}
	};
	let possibleLocation = document.querySelector(".actions .list .add");
	if(possibleLocation){
		let miniHolder = create("div","#hohEntryScore",false,possibleLocation.parentNode.parentNode,"position:relative;");
		miniHolder.dataset.mediaId = id;
		let type = possibleLocation.innerText;
		if(type === "Reading" || type === "Completed" || type === "Watching" || type === "Paused" || type === "Repeating" || type === "Dropped"){
			generalAPIcall(
				"query($id:Int,$name:String){MediaList(mediaId:$id,userName:$name){score progress}}",
				{id: id,name: whoAmI},
				function(data){
					let MediaList = data.data.MediaList;
					let scoreSpanContainer = create("div","hohMediaScore",false,miniHolder);
					let scoreSpan = create("span",false,false,scoreSpanContainer);
					let minScore = 1;
					let maxScore = 100;
					let stepSize = 1;
					if(["POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
						maxScore = 10
					}
					if(userObject.mediaListOptions.scoreFormat === "POINT_10_DECIMAL"){
						stepSize = 0.1
					}
					if(MediaList.score){
						scoreSpan.innerHTML = scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat,whoAmI);
						if(useScripts.accessToken && ["POINT_100","POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
							let updateScore = function(isUp){
								let score = MediaList.score;
								if(isUp){
									MediaList.score += stepSize
								}
								else{
									MediaList.score -= stepSize
								}
								if(MediaList.score >= minScore && MediaList.score <= maxScore){
									scoreSpan.innerHTML = scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat,whoAmI);
									authAPIcall(
										`mutation($id:Int,$score:Float){
											SaveMediaListEntry(mediaId:$id,score:$score){
												score
											}
										}`,
										{id: id,score: MediaList.score},
										data => {}
									);
									let blockingCache = JSON.parse(sessionStorage.getItem("hohEntryScore" + id + whoAmI));
									blockingCache.data.data.MediaList.score = MediaList.score.roundPlaces(1);
									blockingCache.time = NOW();
									sessionStorage.setItem("hohEntryScore" + id + whoAmI,JSON.stringify(blockingCache));
								}
								else if(MediaList.score < minScore){
									MediaList.score = minScore
								}
								else if(MediaList.score > maxScore){
									MediaList.score = maxScore
								}
							};
							let changeMinus = create("span","hohChangeScore","-",false,"padding:2px;position:absolute;left:-1px;top:-2.5px;");
							scoreSpanContainer.insertBefore(changeMinus,scoreSpanContainer.firstChild);
							let changePluss = create("span","hohChangeScore","+",scoreSpanContainer,"padding:2px;");
							changeMinus.onclick = function(){updateScore(false)};
							changePluss.onclick = function(){updateScore(true)};
						}
					};
					if(type !== "Completed"){
						let progressPlace = create("span","hohMediaScore",false,miniHolder,"right:0px;");
						let progressVal = create("span",false,MediaList.progress,progressPlace);
						if(useScripts.accessToken){
							let changePluss = create("span","hohChangeScore","+",progressPlace,"padding:2px;position:absolute;top:-2.5px;");
							changePluss.onclick = function(){
								MediaList.progress++;
								authAPIcall(
									`mutation($id:Int,$progress:Int){
										SaveMediaListEntry(mediaId:$id,progress:$progress){
											progress
										}
									}`,
									{id: id,progress: MediaList.progress},
									data => {}
								);
								progressVal.innerText = MediaList.progress;
							};
						}
					};
				},
				"hohEntryScore" + id + whoAmI,30*1000
			);
		}
		else if(type === "Add to List" && (tries || 0) < 10){
			setTimeout(function(){addEntryScore(id,(tries || 0) + 1)},200);
		}
	}
	else{
		setTimeout(function(){addEntryScore(id)},200);
	}
}

function notificationCake(){
	let notificationDot = document.querySelector(".notification-dot");
	if(notificationDot && (!notificationDot.childElementCount)){
		authAPIcall(
			queryAuthNotifications,
			{page:1,name:whoAmI},
			function(data){
				let Page = data.data.Page;
				let User = data.data.User;
				let types = [];
				let names = [];
				for(var i=0;i<Page.notifications.length && i<User.unreadNotificationCount;i++){
					if(!Page.notifications[i].type){
						Page.notifications[i].type = "THREAD_SUBSCRIBED";
					};
					if(Page.notifications[i].user){
						names.push(Page.notifications[i].user.name);
					};
					if(!useScripts.notificationColours[Page.notifications[i].type].supress){
						types.push(Page.notifications[i].type);
					};
				};
				if(types.length){
					let notificationCake = create("canvas","hohNotificationCake");
					notificationCake.width = 120;
					notificationCake.height = 120;
					notificationCake.style.width = "30px";
					notificationCake.style.height = "30px";
					notificationDot.innerText = "";
					notificationDot.style.background = "none";
					notificationDot.style.width = "30px";
					notificationDot.style.height = "30px";
					notificationDot.style.borderRadius = "0";
					notificationDot.style.left = "5px";
					notificationDot.style.marginRight = "-3px";
					notificationDot.appendChild(notificationCake);
					let cakeCtx = notificationCake.getContext("2d");
					cakeCtx.fillStyle = "red";
					cakeCtx.textAlign = "center";
					cakeCtx.fontWeight = "500";
					cakeCtx.font = 50 + "px sans-serif";
					types.forEach(function(type,i){
						cakeCtx.fillStyle = useScripts.notificationColours[type].colour;
						cakeCtx.beginPath();
						cakeCtx.arc(
							60,60,
							40,
							Math.PI * (2*i/types.length - 0.5),
							Math.PI * (2*(i+1)/types.length - 0.5)
						);
						cakeCtx.lineTo(60,60);
						cakeCtx.closePath();
						cakeCtx.fill();
					});
					cakeCtx.fillStyle = "#fff2f2";
					cakeCtx.fillText(User.unreadNotificationCount,60,76);
					notificationCake.innerText = User.unreadNotificationCount;
					notificationCake.title = names.join("\n");
					let poller = function(){
						if(!document.querySelector(".hohNotificationCake")){
							try{
								notificationCake();
							}catch(err){};
						}
						else{
							setTimeout(poller,4000);
						};
					};poller();
					if(!document.querySelector(".hohDismiss") && useScripts.dismissDot){
						let dismisser = create("span","hohDismiss",".",notificationDot.parentNode);
						dismisser.onclick = function(){
							authAPIcall("query{Notification(resetNotificationCount:true){... on ActivityLikeNotification{id}}}",{},function(data){
								dismisser.previousSibling.style.display = "none";
								dismisser.style.display = "none";
							});
						};
					}
				}
				else{
					notificationDot.style.display = "none";
				};
			}
		);
	}
}

if(useScripts.accessToken && !useScripts.mobileFriendly){
	setInterval(notificationCake,4*1000);
};

function addActivityTimeline(){
	let URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w\-]*\/social/);
	if(!URLstuff){
		return;
	};
	if(document.getElementById("activityTimeline")){
		return;
	};
	if(!whoAmIid){
		generalAPIcall(
			"query($name:String){User(name:$name){id}}",
			{name: whoAmI},
			function(data){
				whoAmIid = data.data.User.id;
				addActivityTimeline();
			},
			"hohIDlookup" + whoAmI.toLowerCase()
		);
		return;
	};
	let followingLocation = document.querySelector(".following");
	if(!followingLocation){
		setTimeout(addActivityTimeline,200);
		return;
	};
	const status = document.querySelector(".actions .list .add").innerText;
	let activityTimeline = create("div","#activityTimeline",false,followingLocation.parentNode);
	let variables = {
		mediaId: URLstuff[2],
		userId: whoAmIid,
		page: 1
	};
	const query = `
query($userId: Int,$mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		activities(userId: $userId, mediaId: $mediaId, sort: ID){
			... on ListActivity{
				siteUrl
				createdAt
				status
				progress
				replyCount
			}
		}
	}
}`;
	let lineCaller = function(query,variables){
		generalAPIcall(query,variables,function(data){
			if(data.data.Page.pageInfo.currentPage === 1){
				removeChildren(activityTimeline)
				if(data.data.Page.activities.length){
					create("h2",false,"Activity Timeline",activityTimeline);
				}
			};
			data.data.Page.activities.forEach(function(activity){
				let activityEntry = create("div","hohTimelineEntry",false,activityTimeline);
				if(activity.replyCount){
					activityEntry.style.color = "rgb(var(--color-blue))";
				};
				let activityContext = create("a","newTab",capitalize(activity.status),activityEntry);
				activityContext.href = activity.siteUrl;
				if(["watched episode","read chapter","rewatched episode","reread chapter"].includes(activity.status)){
					activityContext.innerText += " " + activity.progress;
				};
				create("span",false,
					" " + (new Date(activity.createdAt*1000)).toDateString(),
					activityEntry,
					"position:absolute;right:7px;"
				);
			});
			if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage){
				variables.page++;
				lineCaller(query,variables);
			}
		},"hohMediaTimeline" + variables.mediaId + "u" + variables.userId + "p" + variables.page,120*1000);
	};
	if(status !== "Add To List"){
		lineCaller(query,variables);
	};
	let lookingElse = create("div",false,false,followingLocation.parentNode,"margin-top:30px;");
	create("div",false,"Looking for the activities of someone else? ",lookingElse);
	let lookingElseInput = create("input",false,false,lookingElse);
	lookingElseInput.placeholder = "User";
	lookingElseInput.setAttribute("list","socialUsers");
	let lookingElseButton= create("button",["button","hohButton"],"Search",lookingElse);
	let lookingElseError= create("span",false,"",lookingElse);
	lookingElseButton.onclick = function(){
		if(lookingElseInput.value){
			lookingElseError.innerText = "...";
			generalAPIcall(
				"query($name:String){User(name:$name){id}}",
				{name: lookingElseInput.value},
				function(data){
					if(!data){
						lookingElseError.innerText = "User not found";
						return;
					};
					lookingElseError.innerText = "";
					variables.userId = data.data.User.id;
					variables.page = 1;
					lineCaller(query,variables);
				},
				"hohIDlookup" + lookingElseInput.value.toLowerCase()
			);
		};
	}
}

function showMarkdown(id){
	if(!location.pathname.match(id)){
		return;
	}
	if(document.querySelector(".hohGetMarkdown")){
		return;
	}
	let timeContainer = document.querySelector(".activity-text .time,.activity-message .time");
	if(!timeContainer){
		setTimeout(function(){showMarkdown(id)},200);
		return;
	};
	let codeLink = create("span",["action","hohGetMarkdown"],"</>",false,"font-weight:bolder;");
	timeContainer.insertBefore(codeLink,timeContainer.firstChild);
	codeLink.onclick = function(){
		let activityMarkdown = document.querySelector(".activity-markdown");
		if(activityMarkdown.style.display === "none"){
			document.querySelector(".hohMarkdownSource").style.display = "none";
			activityMarkdown.style.display = "initial";
		}
		else{
			activityMarkdown.style.display = "none";
			let markdownSource = document.querySelector(".hohMarkdownSource");
			if(markdownSource){
				markdownSource.style.display = "initial";
			}
			else{
				generalAPIcall("query($id:Int){Activity(id:$id){...on MessageActivity{text:message}...on TextActivity{text}}}",{id:id},function(data){
					if(!location.pathname.match(id) || !data){
						return;
					};
					markdownSource = create("div",["activity-markdown","hohMarkdownSource"],data.data.Activity.text,activityMarkdown.parentNode);
				},"hohGetMarkdown" + id,20*1000);
			}
		}
	}
}

function addActivityLinks(activityID){
	let arrowCallback = function(data){
		let adder = function(link){
			if(!location.pathname.includes("/activity/" + activityID)){
				return;
			};
			let activityLocation = document.querySelector(".activity-entry");
			if(activityLocation){
				activityLocation.appendChild(link);
				return;
			}
			else{
				setTimeout(function(){adder(link)},200);
			}
		};
		let queryPrevious;
		let queryNext;
		let variables = {
			userId: data.data.Activity.userId || data.data.Activity.recipientId,
			createdAt: data.data.Activity.createdAt
		};
		if(data.data.Activity.type === "ANIME_LIST" || data.data.Activity.type === "MANGA_LIST"){
			variables.mediaId = data.data.Activity.media.id;
			queryPrevious = `
query ($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "TEXT"){
			queryPrevious = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "MESSAGE"){
			let link = create("a","hohPostLink","↑",false,"left:-25px;top:25px;");
			link.href = "/user/" + data.data.Activity.recipient.name + "/";
			link.title = data.data.Activity.recipient.name + "'s profile";
			adder(link);
			variables.messengerId = data.data.Activity.messengerId;
			queryPrevious = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
		}
		else{//unknown new types of activities
			return;
		};
		if(data.previous){
			if(data.previous !== "FIRST"){
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.href = data.previous;
				link.rel = "prev";
				link.title = "Previous activity";
				adder(link);
			}
		}
		else{
			data.previous = "FIRST";
			generalAPIcall(queryPrevious,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.title = "Previous activity";
				link.rel = "prev";
				link.href = pdata.data.Activity.siteUrl;
				adder(link);
				data.previous = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.next = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		}
		if(data.next){
			let link = create("a","hohPostLink","→",false,"right:-25px;");
			link.href = data.next;
			link.rel = "next";
			link.title = "Next activity";
			adder(link);
		}
		else{
			generalAPIcall(queryNext,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","→",false,"right:-25px;");
				link.href = pdata.data.Activity.siteUrl;
				link.rel = "next";
				link.title = "Next activity";
				adder(link);
				data.next = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.previous = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		};
		sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
	}
	let possibleCache = sessionStorage.getItem("hohActivity" + activityID);
	if(possibleCache){
		arrowCallback(JSON.parse(possibleCache));
	}
	else{
		generalAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on ListActivity{
			type
			userId
			createdAt
			media{id}
		}
		... on TextActivity{
			type
			userId
			createdAt
		}
		... on MessageActivity{
			type
			recipientId
			recipient{name}
			messengerId
			createdAt
		}
	}
}`,{id:activityID},arrowCallback);
	}
}

function addBrowseFilters(type){
	if(!location.pathname.match(/^\/search/)){
		return;
	};
	let sorts = document.querySelector(".hohAlready");
	if(!sorts){
		sorts = document.querySelector(".filter-group .el-select-dropdown .el-select-dropdown__list");
		if(!sorts){
			setTimeout(function(){addBrowseFilters(type)},200);
			return;
		};
		sorts.classList.add("hohAlready");
	};
	let alreadyAdded = document.querySelectorAll(".hohSorts");
	alreadyAdded.forEach(function(already){
		already.remove();
	});
	let URLredirect = function(property,value){
		let url = new URLSearchParams(location.search);
		url.set(property,value);
		window.location.href = location.protocol + "//" + location.host + location.pathname + "?" + url.toString();
	};
	if(type === "anime"){
		let episodeSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Episodes ↓",episodeSort);
		let episodeSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Episodes ↑",episodeSortb);
		for(var i=0;i<sorts.children.length;i++){
			sorts.children[i].onmouseover = function(){
				let currentHover = sorts.querySelector(".hover");
				if(currentHover){
					currentHover.classList.remove("hover");
				};
				this.classList.add("hover");
			};
		};
		episodeSort.onclick = function(){
			URLredirect("sort","EPISODES_DESC");
		};
		episodeSortb.onclick = function(){
			URLredirect("sort","EPISODES");
		};
	}
	else if(type === "manga"){
		let chapterSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Chapters ↓",chapterSort);
		let chapterSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Chapters ↑",chapterSortb);
		let volumeSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Volumes ↓",volumeSort);
		let volumeSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Volumes ↑",volumeSortb);
		for(var i=0;i<sorts.children.length;i++){
			sorts.children[i].onmouseover = function(){
				let currentHover = sorts.querySelector(".hover");
				if(currentHover){
					currentHover.classList.remove("hover");
				};
				this.classList.add("hover");
			};
		};
		chapterSort.onclick = function(){
			URLredirect("sort","CHAPTERS_DESC");
		};
		chapterSortb.onclick = function(){
			URLredirect("sort","CHAPTERS");
		};
		volumeSort.onclick = function(){
			URLredirect("sort","VOLUMES_DESC");
		};
		volumeSortb.onclick = function(){
			URLredirect("sort","VOLUMES");
		};
	};
}

function addComparissionPage(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/);
	if(!URLstuff){
		return;
	};
	let userA = decodeURIComponent(URLstuff[1]);
	let type = URLstuff[2];
	let compareLocation = document.querySelector(".compare");
	let nativeCompareExists = true;
	if(!compareLocation){
		nativeCompareExists = false;
		compareLocation = document.querySelector(".medialist");
		if(!compareLocation){
			setTimeout(addComparissionPage,200);
			return;
		};
	};
	if(document.querySelector(".hohCompare")){
		return;
	};
	compareLocation.style.display = "none";
	let compareArea = create("div","hohCompare",false,compareLocation.parentNode);
	if(nativeCompareExists){
		let switchButton = create("span",false,"Show default compare",compareLocation.parentNode,"position:absolute;top:0px;right:0px;cursor:pointer;z-index:100;");
		switchButton.onclick = function(){
			if(switchButton.innerText === "Show default compare"){
				switchButton.innerText ="Show hoh compare";
				compareLocation.style.display = "";
				compareArea.style.display = "none";
				switchButton.style.top = "-30px";
			}
			else{
				switchButton.innerText ="Show default compare";
				compareLocation.style.display = "none";
				compareArea.style.display = "";
				switchButton.style.top = "0px";
			}
		};
		compareLocation.parentNode.style.position = "relative";
	};
	let formatFilterLabel = create("span",false,"Filter:",compareArea);
	formatFilterLabel.style.padding = "5px";
	let formatFilter = create("select",false,false,compareArea);
	let addOption = function(value,text){
		let newOption = create("option",false,text,formatFilter);
		newOption.value = value;
	};
	addOption("all","All");
	if(type === "anime"){
		addOption("TV","TV");
		addOption("MOVIE","Movie");
		addOption("TV_SHORT","TV Short");
		addOption("OVA","OVA");
		addOption("ONA","ONA");
		addOption("SPECIAL","Special");
		addOption("MUSIC","Music");
	}
	else if(type === "manga"){
		addOption("MANGA","Manga");
		addOption("NOVEL","Novel");
		addOption("ONE_SHOT","One Shot");
	};
	let ratingFilterLabel = create("span",false,"Min. ratings:",compareArea);
	ratingFilterLabel.style.padding = "5px";
	let ratingFilter = create("input",false,false,compareArea,"width:45px;color:rgb(var(--color-text))");
	ratingFilter.type = "number";
	ratingFilter.value = 1;
	ratingFilter.min = 0;
	let systemFilterLabel = create("span",false,"Individual rating systems:",compareArea,"padding:5px;");
	let systemFilter = createCheckbox(compareArea);
	systemFilter.checked = false;
	let colourLabel = create("span",false,"Colour entire cell:",compareArea,"padding:5px;");
	let colourFilter = createCheckbox(compareArea);
	colourFilter.checked = false;			
	let tableContainer = create("table",false,false,compareArea);
	let table = create("tbody",false,false,tableContainer);
	let digestSelect = {value:"average"};//placeholder
	let shows = [];//the stuff we are displaying in the table
	let users = [];
	let listCache = {};//storing raw anime data
	let ratingMode = "average";let guser = 0;let inverse = false;
	let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",compareLocation.parentNode,"margin-top:10px;");
	let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",compareLocation.parentNode,"margin-top:10px;");
	csvButton.onclick = function(){
		let csvContent = "Title," + digestSelect.selectedOptions[0].text + "," + users.map(user => user.name).join(",") + "\n";
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			csvContent += csvEscape(show.title) + "," + show.digest + "," + show.score.join(",") + "\n";
		});
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".csv";
		saveAs(csvContent,filename,true);
	};
	jsonButton.onclick = function(){
		let jsonData = {
			users: users,
			formatFilter: formatFilter.value,
			digestValue: digestSelect.value,
			type: capitalize(type),
			version: "1.00",
			scriptInfo: scriptInfo,
			url: document.URL,
			timeStamp: NOW(),
			media: shows
		}
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".json";
		saveAs(jsonData,filename);
	}
	let sortShows = function(){
		let averageCalc = function(scoreArray,weight){
			let sum = 0;
			let dividents = 0;
			scoreArray.forEach(function(score){
				if(score){
					sum += score;
					dividents++;
				};
			});
			return {
				average: ((dividents + (weight || 0)) ? (sum/(dividents + (weight || 0))) : 0),
				dividents: dividents
			};
		};
		let sortingModes = {
			"average": function(show){
				show.digest = averageCalc(show.score).average;
			},
			"average0": function(show){
				show.digest = averageCalc(show.score,1).average;
			},
			"standardDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.pow(score - average.average,2);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"absoluteDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.abs(score - average.average);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"max": function(show){
				show.digest = Math.max(...show.score);
			},
			"min": function(show){
				show.digest = Math.min(...show.score.filter(TRUTHY)) || 0;
			},
			"difference": function(show){
				let mini = Math.min(...show.score.filter(TRUTHY)) || 0;
				let maks = Math.max(...show.score);
				show.digest = maks - mini;
			},
			"ratings": function(show){
				show.digest = show.score.filter(TRUTHY).length;
			},
			"planned": function(show){
				show.digest = show.status.filter(value => value === "PLANNING").length;
			},
			"current": function(show){
				show.digest = show.status.filter(value => (value === "CURRENT" || value === "REPEATING")).length;
			},
			"favourites": function(show){
				show.digest = show.favourite.filter(TRUTHY).length;
			},
			"median": function(show){
				let newScores = show.score.filter(TRUTHY);
				if(newScores.length === 0){
					show.digest = 0;
				}
				else{
					show.digest = Stats.median(newScores);
				};
			},
			"popularity": function(show){
				show.digest = show.popularity;
			},
			"averageScore": function(show){
				show.digest = show.averageScore;
			},
			"averageScoreDiff": function(show){
				if(!show.averageScore){
					show.digest = 0;
					return;
				};
				show.digest = averageCalc(show.score).average - show.averageScore;
			}
		};
		if(ratingMode === "user"){
			shows.sort(
				(a,b) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "userInverse"){
			shows.sort(
				(b,a) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "title"){
			shows.sort(ALPHABETICAL(a => a.title))
		}
		else if(ratingMode === "titleInverse"){
			shows = shows.sort(ALPHABETICAL(a => a.title)).reverse()
		}
		else{
			shows.forEach(sortingModes[ratingMode]);
			if(inverse){
				shows.sort((b,a) => b.digest - a.digest)
			}
			else{
				shows.sort((a,b) => b.digest - a.digest)
			}
		}
	};
	let drawTable = function(){
		while(table.childElementCount > 2){
			table.lastChild.remove()
		};
		let columnAmounts = [];
		users.forEach(function(element){
			columnAmounts.push({sum:0,amount:0});
		})
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			let row = create("tr","hohAnimeTable");
			row.onclick = function(){
				if(this.style.background === "rgb(var(--color-blue),0.5)"){
					this.style.background = "unset";
				}
				else{
					this.style.background = "rgb(var(--color-blue),0.5)";
				}
			}
			let showID = create("td",false,false,false,"max-width:250px;");
			create("a","newTab",show.title,showID)
				.href = "/" + type + "/" + show.id + "/" + safeURL(show.title);
			let showAverage = create("td");
			if(show.digest){
				let fractional = show.digest % 1;
				showAverage.innerText = show.digest.roundPlaces(3);
				[
					{s:"½",v:1/2},
					{s:"⅓",v:1/3},
					{s:"¼",v:1/4},
					{s:"¾",v:3/4},
					{s:"⅔",v:2/3},
					{s:"⅙",v:1/6},
					{s:"⅚",v:5/6},
					{s:"⅐",v:1/7}
				].find(symbol => {
					if(Math.abs(fractional - symbol.v) < 0.0001){
						showAverage.innerText = Math.floor(show.digest) + " " + symbol.s;
						return true;
					}
					return false;
				});
			};
			row.appendChild(showID);
			row.appendChild(showAverage);
			for(var i=0;i<show.score.length;i++){
				let showUserScore = create("td",false,false,row);
				if(show.score[i]){
					if(systemFilter.checked){
						showUserScore.innerHTML = scoreFormatter(show.scorePersonal[i],users[i].system,users[i].name);
					}
					else{
						showUserScore.innerText = show.score[i];
					};
					columnAmounts[i].sum += show.score[i];
					columnAmounts[i].amount++;
				}
				else{
					if(show.status[i] === "NOT"){
						showUserScore.innerText = " ";
					}
					else{
						showUserScore.innerText = "–";//n-dash
					};
				};
				if(show.status[i] !== "NOT"){
					if(colourFilter.checked){
						showUserScore.style.backgroundImage = "linear-gradient(to right,rgb(0,0,0,0)," + distributionColours[show.status[i]] + ")";
					}
					else{
						let statusDot = create("div","hohStatusDot",false,showUserScore);
						statusDot.style.background = distributionColours[show.status[i]];
						statusDot.title = show.status[i].toLowerCase();
					};
				};
				if(show.progress[i]){
					create("span","hohStatusProgress",show.progress[i],showUserScore);
				};
				if(show.favourite[i]){
					let favStar = create("span",false,false,showUserScore,"color:gold;font-size:1rem;vertical-align:middle;padding-bottom:2px;");
					favStar.innerHTML = svgAssets.star;
				};
			};
			table.appendChild(row);
		});
		if(columnAmounts.some(amount => amount.amount > 0)){
			let lastRow = create("tr",false,false,table);
			create("td",false,false,lastRow);
			create("td",false,false,lastRow);
			columnAmounts.forEach(amount => {
				let averageCel = create("td",false,"–",lastRow);
				if(amount.amount){
					averageCel.innerText = (amount.sum/amount.amount).roundPlaces(2);
				}
			})
		}
	};
	let changeUserURL = function(){
		const baseState = location.protocol + "//" + location.host + location.pathname;
		let params = "";
		if(users.length){
			params += "&users=" + users.map(user => user.name + (user.demand ? (user.demand === -1 ? "-" : "*") : "")).join(",");
		}
		if(formatFilter.value !== "all"){
			params += "&filter=" + encodeURIComponent(formatFilter.value);
		};
		if(ratingFilter.value !== 1){
			params += "&minRatings=" + encodeURIComponent(ratingFilter.value);
		};
		if(systemFilter.checked){
			params += "&ratingSystems=true";
		};
		if(colourFilter.checked){;
			params += "&fullColour=true";
		};
		if(ratingMode !== "average"){;
			params += "&sort=" + ratingMode;
		};
		if(params.length){
			params = "?" + params.substring(1);
		}
		current = baseState + params;
		history.replaceState({},"",baseState + params);
	};
	let drawUsers = function(){
		removeChildren(table)
		let userRow = create("tr");
		let resetCel = create("td",false,false,userRow);
		let resetButton = create("button",["hohButton","button"],"Reset",resetCel,"margin-top:0px;");
		resetButton.onclick = function(){
			users = [];
			shows = [];
			drawUsers();
			changeUserURL();
		};
		let digestCel = create("td");
		digestSelect = create("select");
		let addOption = (value,text) => {
			create("option",false,text,digestSelect)
				.value = value;
		};
		addOption("average","Average");
		addOption("median","Median");
		addOption("average0","Average~0");
		addOption("min","Minimum");
		addOption("max","Maximum");
		addOption("difference","Difference");
		addOption("standardDeviation","Std. Deviation");
		addOption("absoluteDeviation","Abs. Deviation");
		addOption("ratings","#Ratings");
		addOption("planned","#Planning");
		addOption("current","#Current");
		addOption("favourites","#Favourites");
		addOption("popularity","$Popularity");
		addOption("averageScore","$Score");
		addOption("averageScoreDiff","$Score diff.");
		if(["title","titleInverse","user","userInverse"].includes(ratingMode)){
			digestSelect.value = ratingMode;
		};
		digestSelect.oninput = function(){
			ratingMode = digestSelect.value;
			sortShows();
			drawTable();
			changeUserURL();
		};
		digestCel.appendChild(digestSelect);
		userRow.appendChild(digestCel);
		users.forEach(function(user,index){
			let userCel = create("td",false,false,userRow);
			let avatar = create("img",false,false,userCel);
			avatar.src = listCache[user.name].data.MediaListCollection.user.avatar.medium;
			let name = create("span",false,user.name,userCel);
			name.style.padding = "8px";
			let remove = create("span","hohAnimeTableRemove","✕",userCel);
			remove.onclick = function(){
				deleteUser(index)
			}
		});
		let addCel = create("td");
		let addInput = create("input",false,false,addCel);
		let addButton = create("button",["button","hohButton"],"Add",addCel,"margin-top:0px;");
		addButton.style.cursor = "pointer";
		addButton.onclick = function(){
			if(addInput.value !== ""){
				addUser(addInput.value);
				addButton.innerText = "...";
				addButton.disabled = true;
				addInput.readOnly = true;
			}
		};
		userRow.appendChild(addCel);
		let headerRow = create("tr");
		let typeCel = create("th");
		let downArrowa = create("span","hohArrowSort","▼",typeCel);
		downArrowa.onclick = function(){
			ratingMode = "title";
			sortShows();
			drawTable();
		};
		let typeCelLabel = create("span",false,capitalize(type),typeCel);
		let upArrowa = create("span","hohArrowSort","▲",typeCel);
		upArrowa.onclick = function(){
			ratingMode = "titleInverse";
			sortShows();
			drawTable();
		};
		headerRow.appendChild(typeCel);
		let digestSortCel = create("td");
		digestSortCel.style.textAlign = "center";
		let downArrow = create("span","hohArrowSort","▼",digestSortCel);
		downArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = false;
			sortShows(digestSelect.value);
			drawTable();
		};
		let upArrow = create("span","hohArrowSort","▲",digestSortCel);
		upArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = true;
			sortShows();
			drawTable();
		};
		headerRow.appendChild(digestSortCel);
		users.forEach(function(user,index){
			let userCel = create("td");
			userCel.style.textAlign = "center";
			userCel.style.position = "relative";
			let filter = create("span");
			if(user.demand === 0){
				filter.innerText = "☵"
			}
			else if(user.demand === 1){
				filter.innerText = "✓";
				filter.style.color = "green";
			}
			else{
				filter.innerText = "✕";
				filter.style.color = "red";
			};
			filter.classList.add("hohFilterSort");
			filter.onclick = function(){
				if(filter.innerText === "☵"){
					filter.innerText = "✓";
					filter.style.color = "green";
					user.demand = 1;
				}
				else if(filter.innerText === "✓"){
					filter.innerText = "✕";
					filter.style.color = "red";
					user.demand = -1;
				}
				else{
					filter.innerText = "☵";
					filter.style.color = "";
					user.demand = 0;
				};
				drawTable();
				changeUserURL();
			};
			let downArrow = create("span","hohArrowSort","▼");
			downArrow.onclick = function(){
				ratingMode = "user";
				guser = index;
				sortShows();
				drawTable();
			};
			let upArrow = create("span","hohArrowSort","▲");
			upArrow.onclick = function(){
				ratingMode = "userInverse";
				guser = index;
				sortShows();
				drawTable();
			};
			let statusFilterDot = create("div","hohStatusDot");
			const stati = ["COMPLETED","CURRENT","PLANNING","PAUSED","DROPPED","REPEATING","NOT"];
			statusFilterDot.onclick = function(){
				if(user.status === "NOT"){
					user.status = false;
					statusFilterDot.style.background = "rgb(var(--color-background))";
					statusFilterDot.title = "all";
				}
				else if(user.status === "REPEATING"){
					user.status = "NOT";
					statusFilterDot.style.background = `center / contain no-repeat url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 10 10"><line stroke="red" x1="0" y1="0" x2="10" y2="10"/><line x1="0" y1="10" x2="10" y2="0" stroke="red"/></svg>')`;
					statusFilterDot.title = "no status";
				}
				else if(user.status === false){
					user.status = "COMPLETED";
					statusFilterDot.style.background = distributionColours["COMPLETED"];
					statusFilterDot.title = "completed";
				}
				else{
					user.status = stati[stati.indexOf(user.status) + 1];
					statusFilterDot.style.background = distributionColours[user.status];
					statusFilterDot.title = user.status.toLowerCase();
				};
				drawTable();
			};
			userCel.appendChild(downArrow);
			userCel.appendChild(filter);
			userCel.appendChild(upArrow);
			userCel.appendChild(statusFilterDot);
			headerRow.appendChild(userCel);
		});
		userRow.classList.add("hohUserRow");
		headerRow.classList.add("hohHeaderRow");
		table.appendChild(userRow);
		table.appendChild(headerRow);
	};
	let addUser = function(userName,paramDemand){
		let handleData = function(data,cached){
			users.push({
				name: userName,
				demand: (paramDemand ? (paramDemand === "-" ? -1 : 1) : 0),
				system: data.data.MediaListCollection.user.mediaListOptions.scoreFormat,
				status: false
			});
			let list = returnList(data,true);
			if(!cached){
				list.forEach(function(alia){
					alia.media.id = alia.mediaId;
					alia.media.title = titlePicker(alia.media);
					alia.scoreRaw = convertScore(alia.score,data.data.MediaListCollection.user.mediaListOptions.scoreFormat);
				})
			};
			shows.sort(function(a,b){return a.id - b.id;});
			let listPointer = 0;
			let userIndeks = 0;
			if(shows.length){
				userIndeks = shows[0].score.length
			};
			let favs = data.data.MediaListCollection.user.favourites.fav.nodes.concat(
				data.data.MediaListCollection.user.favourites.fav2.nodes
			).concat(
				data.data.MediaListCollection.user.favourites.fav3.nodes
			).map(media => media.id);
			let createEntry = function(mediaEntry){
				let entry = {
					id: mediaEntry.mediaId,
					average: mediaEntry.scoreRaw,
					title: mediaEntry.media.title,
					format: mediaEntry.media.format,
					score: Array(userIndeks).fill(0),
					scorePersonal: Array(userIndeks).fill(0),
					status: Array(userIndeks).fill("NOT"),
					progress: Array(userIndeks).fill(false),
					numberWatched: mediaEntry.scoreRaw ? 1 : 0,
					favourite: Array(userIndeks).fill(false),
					averageScore: mediaEntry.media.averageScore,
					popularity: mediaEntry.media.popularity
				};
				entry.score.push(mediaEntry.scoreRaw);
				entry.scorePersonal.push(mediaEntry.score);
				entry.status.push(mediaEntry.status);
				if(mediaEntry.status !== "PLANNING" && mediaEntry.status !== "COMPLETED"){
					entry.progress.push(mediaEntry.progress + "/" + (mediaEntry.media.chapters || mediaEntry.media.episodes || ""))
				}
				else{
					entry.progress.push(false)
				}
				entry.favourite.push(favs.includes(entry.id));
				return entry;
			};
			shows.forEach(function(show){
				show.score.push(0);
				show.scorePersonal.push(0);
				show.status.push("NOT");
				show.progress.push(false);
				show.favourite.push(false);
			});
			for(var i=0;i<shows.length && listPointer < list.length;i++){
				if(shows[i].id < list[listPointer].mediaId){
					continue;
				}
				else if(shows[i].id === list[listPointer].mediaId){
					shows[i].score[userIndeks] = list[listPointer].scoreRaw;
					shows[i].scorePersonal[userIndeks] = list[listPointer].score;
					shows[i].status[userIndeks] = list[listPointer].status;
					if(list[listPointer].scoreRaw){
						shows[i].numberWatched++
					};
					if(list[listPointer].status !== "PLANNING" && list[listPointer].status !== "COMPLETED"){
						shows[i].progress[userIndeks] = list[listPointer].progress + "/" + (list[listPointer].media.chapters || list[listPointer].media.episodes || "");
					}
					else{
						shows[i].progress[userIndeks] = false
					};
					shows[i].favourite[userIndeks] = favs.includes(shows[i].id);
					listPointer++;
				}
				else{
					shows.splice(i,0,createEntry(list[listPointer]));
					listPointer++;
				};
			};
			for(;listPointer < list.length;listPointer++){
				shows.push(createEntry(list[listPointer]));
			};
			sortShows();
			drawUsers();
			drawTable();
			changeUserURL();
		};
		if(listCache.hasOwnProperty(userName)){
			handleData(listCache[userName],true)
		}
		else{
			generalAPIcall(
`query($name: String, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
			... mediaListEntry
			}
		}
		user{
			id
			name
			avatar{medium}
			mediaListOptions{scoreFormat}
			favourites{
				fav:${type.toLowerCase()}(page:1){
					nodes{
						id
					}
				}
				fav2:${type.toLowerCase()}(page:2){
					nodes{
						id
					}
				}
				fav3:${type.toLowerCase()}(page:3){
					nodes{
						id
					}
				}
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	score
	media{
		episodes
		chapters
		format
		title{romaji native english}
		averageScore
		popularity
	}
}`,
				{name:userName,listType:type.toUpperCase()},
				function(data){
					listCache[userName] = data;
					handleData(data,false);
				}
			);
		};
	};
	let deleteUser = function(index){
		users.splice(index,1);
		shows.forEach(function(show){
			show.score.splice(index,1);
			show.scorePersonal.splice(index,1);
			show.status.splice(index,1);
			show.progress.splice(index,1);
			show.favourite.splice(index,1);
		});
		shows = shows.filter(function(show){
			return !show.status.every(status => status === "NOT")
		});
		if(guser === index){
			guser = false
		}
		else if(guser > index){
			guser--
		};
		sortShows();
		drawUsers();
		drawTable();
		changeUserURL();
	};
	formatFilter.oninput = function(){drawTable();changeUserURL()};
	ratingFilter.oninput = function(){drawTable();changeUserURL()};
	systemFilter.onclick = function(){drawTable();changeUserURL()};
	colourFilter.onclick = function(){drawTable();changeUserURL()};
	let searchParams = new URLSearchParams(location.search);
	let paramFormat = searchParams.get("filter");
	if(paramFormat){
		formatFilter.value = paramFormat
	};
	let paramRating = searchParams.get("minRatings");
	if(paramRating){
		ratingFilter.value = paramRating
	};
	let paramSystem = searchParams.get("ratingSystems");
	if(paramSystem){
		systemFilter.checked = (paramSystem === "true")
	};
	let paramColour = searchParams.get("fullColour");
	if(paramColour){
		colourFilter.checked = (paramColour === "true")
	};
	let paramSort = searchParams.get("sort");
	if(paramSort){
		ratingMode = paramSort
	};
	let paramUsers = searchParams.get("users");
	if(paramUsers){
		paramUsers.split(",").forEach(user => {
			let paramDemand = user.match(/(\*|\-)$/);
			if(paramDemand){
				paramDemand = paramDemand[0]
			}
			user = user.replace(/(\*|\-)$/,"");
			if(user === "~"){
				addUser(whoAmI,paramDemand)
			}
			else{
				addUser(user,paramDemand)
			}
		})
	}
	else{
		addUser(whoAmI);
		addUser(userA);
	}
}

function addFollowCount(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} followers(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",false,followCount,target.children[2],"position:absolute;right:3px;");
			}
		});
		//these two must be separate calls, because they are allowed to fail individually (too many followers)
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} following(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",false,followCount,target.children[1],"position:absolute;right:3px;");
			}
		});
	},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
}

function embedHentai(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(home|user|forum|activity)/)){
		return
	};
	if(useScripts.SFWmode){//saved you there
		return
	};
	setTimeout(embedHentai,1000);
	let mediaEmbeds = document.querySelectorAll(".media-embed");
	let bigQuery = [];//collects all on a page first so we only have to send 1 API query.
	mediaEmbeds.forEach(function(embed){
		if(embed.children.length === 0 && !embed.classList.contains("hohMediaEmbed")){//if( "not-rendered-natively" && "not-rendered-by-this sript" )
			embed.classList.add("hohMediaEmbed");
			let createEmbed = function(data){
				if(!data){
					return
				};
				embed.innerText = "";
				let eContainer = create("div",false,false,embed);
				let eEmbed = create("div","embed",false,eContainer);
				let eCover = create("div","cover",false,eEmbed);
				eCover.style.backgroundImage = "url(" + data.data.Media.coverImage.large + ")";
				let eWrap = create("div","wrap",false,eEmbed);
				let mediaTitle = titlePicker(data.data.Media);
				let eTitle = create("div","title",mediaTitle,eWrap);
				let eInfo = create("div","info",false,eWrap);
				let eGenres = create("div","genres",false,eInfo);
				data.data.Media.genres.forEach((genre,index) => {
					let eGenre = create("span",false,genre,eGenres);
					let comma = create("span",false,", ",eGenre);
					if(index === data.data.Media.genres.length - 1){
						comma.style.display = "none"
					}
				});
				create("span",false,distributionFormats[data.data.Media.format],eInfo);
				create("span",false," · " + distributionStatus[data.data.Media.status],eInfo);
				if(data.data.Media.season){
					create("span",false,
						" · " + capitalize(data.data.Media.season.toLowerCase()) + " " + data.data.Media.startDate.year,
						eInfo
					)
				}
				else if(data.data.Media.startDate.year){
					create("span",false,
						" · " + data.data.Media.startDate.year,
						eInfo
					)
				}
				if(data.data.Media.averageScore){
					create("span",false," · " + data.data.Media.averageScore + "%",eInfo)
				}
				else if(data.data.Media.meanScore){//fallback if it's not popular enough, better than nothing
					create("span",false," · " + data.data.Media.meanScore + "%",eInfo)
				}
			}
			bigQuery.push({
				query: "query($mediaId:Int,$type:MediaType){Media(id:$mediaId,type:$type){id title{romaji native english} coverImage{large} genres format status season meanScore averageScore startDate{year}}}",
				variables: {
					mediaId: +embed.dataset.mediaId,
					type: embed.dataset.mediaType.toUpperCase()
				},
				callback: createEmbed,
				cacheKey: "hohMedia" + embed.dataset.mediaId
			})
		};
	});
	queryPacker(bigQuery);
}

function addForumMedia(){
	if(location.pathname !== "/home"){
		return
	}
	let forumThreads = Array.from(document.querySelectorAll(".home .forum-wrap .thread-card .category"));
	if(!forumThreads.length){
		setTimeout(addForumMedia,200);
		return;
	};
	if(forumThreads.some(
		thread => thread && ["anime","manga"].includes(thread.innerText.toLowerCase())
	)){
		generalAPIcall("query{Page(perPage:3){threads(sort:REPLIED_AT_DESC){title mediaCategories{id title{romaji native english}}}}}",{},function(data){
			if(location.pathname !== "/home"){
				return
			}
			data.data.Page.threads.forEach((thread,index) => {
				if(thread.mediaCategories.length && ["anime","manga"].includes(forumThreads[index].innerText.toLowerCase())){
					let title = titlePicker(thread.mediaCategories[0]);
					if(title.length > 40){
						forumThreads[index].title = title;
						title = title.slice(0,35) + "…";
					};
					forumThreads[index].innerText = title;
				}
			})
		})
	}
}

function addForumMediaNoAWC(){
	if(location.pathname !== "/home"){
		return
	};
	let buildPreview = function(data){
		if(location.pathname !== "/home"){
			return
		}
		let forumPreview = document.querySelector(".recent-threads .forum-wrap");
		if(!(forumPreview && forumPreview.childElementCount)){
			setTimeout(function(){buildPreview(data)},400);
			return;
		};
		forumPreview.classList.add("hohNoAWC");
		removeChildren(forumPreview)
		data.data.Page.threads.filter(
			thread => !thread.title.match(/^(AWC|Anime\sWatching\s(Challenge|Club)|MRC)/)
		).slice(0,parseInt(useScripts.forumPreviewNumber)).forEach(thread => {
			let card = create("div",["thread-card","small"],false,forumPreview);
			create("a","title",thread.title,card).href = "/forum/thread/" + thread.id;
			let footer = create("div","footer",false,card);
			let avatar = create("a","avatar",false,footer);
			avatar.href = "/user/" + (thread.replyUser || thread.user).name;
			avatar.style.backgroundImage = "url(\"" + (thread.replyUser || thread.user).avatar.large + "\")";
			let name = create("div","name",false,footer);
			if(thread.replyCount === 0){
				let contextText = create("a",false,"By",name);
				name.appendChild(document.createTextNode(" "));
				let nameWrap = create("a",false,false,name);
				nameWrap.href = thread.replyUser.name;
				contextText.href = "/forum/thread/" + thread.id + "/comment/" + thread.replyCommentId;
				let nameInner = create("span",false,thread.replyUser.name,nameWrap);
			}
			else if(!thread.replyUser){
				let contextText = create("a",false,"By",name);
				name.appendChild(document.createTextNode(" "));
				let nameWrap = create("a",false,false,name);
				nameWrap.href = "/user/" + thread.user.name;
				contextText.href = "/forum/thread/" + thread.id;
				let nameInner = create("span",false,thread.user.name,nameWrap);
			}
			else{
				let nameWrap = create("a",false,false,name);
				nameWrap.href = "/user/" + thread.replyUser.name;
				let nameInner = create("span",false,thread.replyUser.name,nameWrap);
				name.appendChild(document.createTextNode(" "));
				let contextText = create("a",false,"replied ",name);
				contextText.href = "/forum/thread/" + thread.id + "/comment/" + thread.replyCommentId;
				contextText.appendChild(nativeTimeElement(thread.repliedAt));
			};
			let categories = create("div","categories",false,footer);
			if(thread.mediaCategories.length === 0){
				if(thread.categories.length){
					let catWrap = create("span",false,false,categories);
					let category = create("a","category",thread.categories[0].name,catWrap);
					category.href = "/forum/recent?category=" + thread.categories[0].id;
					category.style.background = (categoryColours.get(thread.categories[0].id) || "rgb(78, 163, 230)") + " none repeat scroll 0% 0%";
				}
			}
			else{
				let mediaTitle = titlePicker(thread.mediaCategories[0]);
				if(mediaTitle.length > 25){
					let lastIndex = mediaTitle.slice(0,25).lastIndexOf(" ");
					if(lastIndex > 20){
						mediaTitle.slice(0,lastIndex);
					}
					else{
						mediaTitle = mediaTitle.slice(0,20)
					}
				}
				let catWrap;
				if(thread.categories.length && thread.categories[0].id !== 1 && thread.categories[0].id !== 2){
					catWrap = create("span",false,false,categories);
					let category = create("a","category",thread.categories[0].name,catWrap);
					category.href = "/forum/recent?category=" + thread.categories[0].id;
					category.style.background = (categoryColours.get(thread.categories[0].id) || "rgb(78, 163, 230)") + " none repeat scroll 0% 0%";
				}
				catWrap = create("span",false,false,categories);
				let mediaCategory = create("a","category",mediaTitle,catWrap);
				mediaCategory.href = "/forum/recent?media=" + thread.mediaCategories[0].id;
				mediaCategory.style.background = (thread.mediaCategories[0].type === "ANIME" ? "rgb(var(--color-blue))" : "rgb(var(--color-green))") + " none repeat scroll 0% 0%";
			}
			let info = create("div","info",false,footer);
			let viewCount = create("span",false,false,info);
			viewCount.innerHTML = svgAssets.eye + " " + thread.viewCount;
			if(!thread.replyUser){
				thread.replyCount--;
			}
			if(thread.replyCount){
				info.appendChild(document.createTextNode(" "));
				let replyCount = create("span",false,false,info);
				replyCount.innerHTML = svgAssets.reply + " " + thread.replyCount;
			}
		})
	};
	if(useScripts.forumPreviewNumber > 0){
		generalAPIcall(
			`query{
				Page(perPage:${parseInt(useScripts.forumPreviewNumber) + 12},page:1){
					threads(sort:REPLIED_AT_DESC){
						id
						viewCount
						replyCount
						title
						repliedAt
						replyCommentId
						user{
							name
							avatar{large}
						}
						replyUser{
							name
							avatar{large}
						}
						categories{
							id
							name
						}
						mediaCategories{
							id
							type
							title{romaji native english}
						}
					}
				}
			}`,
			{},
			buildPreview
		)
	}
}

function addImageFallback(){
	if(!document.URL.match(/(\/home|\/user\/)/)){
		return
	}
	setTimeout(addImageFallback,1000);
	let mediaImages = document.querySelectorAll(".media-preview-card:not(.hohFallback) .content .title");
	mediaImages.forEach(cover => {
		cover.parentNode.parentNode.classList.add("hohFallback");
		if(cover.parentNode.parentNode.querySelector(".hohFallback")){
			return
		};
		let fallback = create("span","hohFallback",cover.textContent,cover.parentNode.parentNode);
		if(useScripts.titleLanguage === "ROMAJI"){
			fallback.innerHTML = cover.textContent.replace(/\S{3}(a|\(|☆|\-|e|i|ou|(o|u)(?!u|\s)|n(?!a|e|i|o|u))(?![a-z]($|[^a-z]))/gi,m => m + "<wbr>");
			/*	create word break opportunities for 'break-word' in nice places in romaji
				- after vowels, or 'ou' or 'uu'. Those pairs should not be broken
				- If there's a 'n' from 'ん', the break opportunity should be delayed to after it.
				- 'ん' is determined by 'n' not followed by a vowel. This doesn't work in cases of '[...]んお[...]' vs '[...]の[...]', but that's a shortcomming of romaji
				- don't break early in words, that just looks awkward. just before the last character also looks weird.
				- don't break off punctuation or numbers at the end of words*/
		}
	})
}

function linkFixer(){
	if(location.pathname !== "/home"){
		return
	}
	let recentReviews = document.querySelector(".recent-reviews h2.section-header");
	let recentThreads = document.querySelector(".recent-threads h2.section-header");
	if(recentReviews && recentThreads){
		recentReviews.innerText = "";
		create("a",false,"Recent Reviews",recentReviews)
			.href = "/reviews";
		recentThreads.innerText = "";
		create("a",false,"Forum Activity",recentThreads)
			.href = "/forum/overview";
	}
	else{
		setTimeout(linkFixer,2000)//invisible change, does not take priority
	}
}

function addReviewConfidence(){
	generalAPIcall("query{Page(page:1,perPage:30){reviews(sort:ID_DESC){id rating ratingAmount}}}",{},function(data){
		let adder = function(){
			if(location.pathname !== "/reviews"){
				return
			}
			let locationForIt = document.querySelector(".recent-reviews .review-wrap");
			if(!locationForIt){
				setTimeout(adder,200);
				return;
			}
			data.data.Page.reviews.forEach((review,index) => {
				let wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
				let extraScore = create("span",false,"~" + Math.round(100*wilsonLowerBound));
				extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
				extraScore.style.marginRight = "3px";
				let parent = locationForIt.children[index].querySelector(".votes");
				parent.insertBefore(extraScore,parent.firstChild);
				if(wilsonLowerBound < 0.05){
					locationForIt.children[index].style.opacity = "0.5"
				}
			})
		};adder();
	},"hohRecentReviews",30*1000);
}

function addRelationStatusDot(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return;
	};
	let relations = document.querySelector(".relations");
	if(relations){
		if(relations.classList.contains("hohRelationStatusDots")){
			return
		};
		relations.classList.add("hohRelationStatusDots");
	};
	authAPIcall(
`query($id: Int){
	Media(id:$id){
		relations{
			nodes{
				id
				type
				mediaListEntry{status}
			}
		}
		recommendations(sort:RATING_DESC){
			nodes{
				mediaRecommendation{
					id
					type
					mediaListEntry{status}
				}
			}
		}
	}
}`,
		{id: id},
		function(data){
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations){
						relations.classList.add("hohRelationStatusDots");
						relations.querySelectorAll(".hohStatusDot").forEach(dot => dot.remove());
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300);
					}
				}
			};adder();
			let recsAdder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				};
				let recs = data.data.Media.recommendations.nodes.map(
					item => item.mediaRecommendation
				).filter(
					item => item.mediaListEntry
				);
				if(recs.length){
					let findCard = document.querySelector(".recommendation-card");
					if(findCard){
						findCard = findCard.parentNode;
						let adder = function(){
							findCard.querySelectorAll(".hohStatusDot").forEach(
								dot => dot.remove()
							);
							recs.forEach(media => {
								let target = findCard.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
								if(target){
									let statusDot = create("div","hohStatusDot",false,target);
									statusDot.style.background = distributionColours[media.mediaListEntry.status];
									statusDot.title = media.mediaListEntry.status.toLowerCase();
								}
							});
						};adder();
						let toggle = findCard.parentNode.querySelector(".view-all .toggle");
						if(toggle){
							toggle.addEventListener("click",function(){
								setTimeout(adder,1000)
							})
						}
					}
					else{
						setTimeout(recsAdder,300)
					}
				}
			};recsAdder();
		},
		"hohRelationStatusDot" + id,2*60*1000,
		false,false,
		function(data){
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations && !relations.classList.contains("hohRelationStatusDots")){
						relations.classList.add("hohRelationStatusDots");
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300)
					}
				}
			};adder();
		}
	)
}

function selectMyThreads(){
	if(document.URL !== "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		return
	}
	let target = document.querySelector(".filter-group span:nth-child(4)");
	if(!target){
		setTimeout(selectMyThreads,100)
	}
	else{
		target.click()
	}
}

function addMyThreadsLink(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/)){
		return
	};
	if(document.querySelector(".hohMyThreads")){
		return
	};
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addMyThreadsLink,100)
	}
	else{
		create("a",["hohMyThreads","link"],"My Threads",target)
			.href = "https://anilist.co/user/" + whoAmI + "/social#my-threads"
	}
}

function moreImports(){
	if(document.URL !== "https://anilist.co/settings/import"){
		return
	}
	let target = document.querySelector(".content .import");
	if(!target){
		setTimeout(moreImports,200);
		return;
	};
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let apAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Anime List",apAnime);
	let apAnimeCheckboxContainer = create("label","el-checkbox",false,apAnime);
	let apAnimeOverwrite = createCheckbox(apAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",apAnimeCheckboxContainer);
	let apAnimeDropzone = create("div","dropbox",false,apAnime);
	let apAnimeInput = create("input","input-file",false,apAnimeDropzone);
	let apAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",apAnimeDropzone);
	apAnimeInput.type = "file";
	apAnimeInput.name = "json";
	apAnimeInput.accept = "application/json";
	let apManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Manga List",apManga);
	let apMangaCheckboxContainer = create("label","el-checkbox",false,apManga);
	let apMangaOverwrite = createCheckbox(apMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",apMangaCheckboxContainer);
	let apMangaDropzone = create("div","dropbox",false,apManga);
	let apMangaInput = create("input","input-file",false,apMangaDropzone);
	let apMangaDropText = create("p",false,"Drop list JSON file here or click to upload",apMangaDropzone);
	apMangaInput.type = "file";
	apMangaInput.name = "json";
	apMangaInput.accept = "application/json";
	let resultsArea = create("div","importResults",false,target);
	let resultsErrors = create("div",false,false,resultsArea,"color:red;padding:5px;");
	let resultsWarnings = create("div",false,false,resultsArea,"color:orange;padding:5px;");
	let resultsStatus = create("div",false,false,resultsArea,"padding:5px;");
	let pushResults = create("button",["hohButton","button"],"Import all selected",resultsArea,"display:none;");
	let resultsTable = create("div",false,false,resultsArea);
	let apImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrors.innerText = "error parsing JSON";
			}
			if(data.export.type !== type){
				resultsErrors.innerText = "error wrong list";
				return;
			}
			if(data.user.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarnings.innerText = "List for \"" + data.user.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.export.date)) > 1000*86400*30){
				resultsWarnings.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.export.date)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			resultsStatus.innerText = "Trying to find matching media...";
			let shows = [];
			let drawShows = function(){
				removeChildren(resultsTable)
				shows.sort(
					(b,a) => a.titles[0].levDistance - b.titles[0].levDistance
				);
				shows.forEach(show => {
					let row = create("div","hohImportRow",false,resultsTable);
					if(show.isAnthology){
						create("div","hohImportEntry",show.apData.map(a => a.name).join(", "),row)
					}
					else{
						create("div","hohImportEntry",show.apData.name,row)
					}
					create("span","hohImportArrow","→",row);
					let aniEntry = create("div","hohImportEntry",false,row,"margin-left:50px");
					let aniLink = create("a",["link","newTab"],show.titles[0].title,aniEntry);
					aniLink.href = "/" + type + "/" + show.titles[0].id;
					let button = createCheckbox(row);
					row.style.backgroundColor = "hsl(" + (120 - Math.min(show.titles[0].levDistance,12)*10) + ",30%,50%)";
					if(show.titles[0].levDistance > 8){
						button.checked = false;
						show.toImport = false;
					}
					else{
						button.checked = true;
						show.toImport = true;
					}
					button.oninput = function(){
						show.toImport = button.checked
					}
				})
			};
			const apAnthologies = {
				"The Dragon Dentist": 20947,
				"Hill Climb Girl": 20947,
				"20min Walk From Nishi-Ogikubo Station": 20947,
				"Collection of Key Animation Films": 20947,
				"(Making of) Evangelion: Another Impact": 20947,
				"Sex and Violence with Mach Speed": 20947,
				"Memoirs of Amorous Gentlemen": 20947,
				"Denkou Choujin Gridman: boys invent great hero": 20947,
				"Evangelion: Another Impact": 20947,
				"Bureau of Proto Society": 20947,
				"Cassette Girl": 20947,
				"Bubu & Bubulina": 20947,
				"I can Friday by day!": 20947,
				"Three Fallen Witnesses": 20947,
				"Robot on the Road": 20947,
				"Comedy Skit 1989": 20947,
				"Power Plant No.33": 20947,
				"Me! Me! Me! Chronic": 20947,
				"Endless Night": 20947,
				"Neon Genesis IMPACTS": 20947,
				"Obake-chan": 20947,
				"Hammerhead": 20947,
				"Girl": 20947,
				"Yamadeloid": 20947,
				"Me! Me! Me!": 20947,
				"Ibuseki Yoruni": 20947,
				"Rapid Rouge": 20947,
				"Tomorrow from there": 20947,
				"The Diary of Ochibi": 20947,
				"until You come to me.": 20947,
				"Tsukikage no Tokio": 20947,
				"Carnage": 20947,
				"Iconic Field": 20947,
				"The Ultraman (2015)": 20947,
				"Kanoun": 20947,
				"Ragnarok": 20947,
				"Death Note Rewrite 1: Visions of a God": 2994,
				"Death Note Rewrite 2: L's Successors": 2994,
			}
			const apMappings = {
				"Rebuild of Evangelion: Final": 3786,
				"KonoSuba – God’s blessing on this wonderful world!! Movie: Legend of Crimson": 102976,
				"Puella Magi Madoka Magica: Magica Quartet x Nisioisin": 20891,
				"Kanye West: Good Morning": 8626,
				"Patlabor 2: The Movie": 1096,
				"She and Her Cat": 1004,
				"Star Blazers: Space Battleship Yamato 2199": 12029,
				"Digimon Season 3: Tamers": 874,
				"The Anthem of the Heart": 20968,
				"Digimon Movie 1: Digimon Adventure": 2961,
				"Love, Chunibyo & Other Delusions!: Sparkling... Slapstick Noel": 16934,
				"The Labyrinth of Grisaia Special": 21312,
				"Candy Boy EX01": 5116,
				"Candy Boy EX02": 6479,
				"Attack on Titan 3rd Season": 99147,
				"Attack on Titan 2nd Season": 20958,
				"Nichijou - My Ordinary Life: Episode 0": 8857,
				"March Comes in like a Lion 2nd Season": 98478,
				"KonoSuba – God’s blessing on this wonderful world!! 2 OVA": 97996,
				"KonoSuba – God’s blessing on this wonderful world!! OVA": 21574,
				"Laid-Back Camp Specials": 101206,
				"Spice and Wolf II OVA": 6007,
				"Mob Psycho 100 Specials": 102449
			}
			let bigQuery = [];
			let myFastMappings = [];
			data.entries.forEach(function(entry,index){
				if(entry.status === "won't watch"){
					return
				};
				if(apAnthologies[entry.name]){
					let already = myFastMappings.findIndex(function(mapping){
						return mapping.id === apAnthologies[entry.name]
					});
					if(already !== -1){
						myFastMappings[already].entries.push(entry)
					}
					else{
						myFastMappings.push({
							entries: [entry],
							isAnthology: true,
							id: apAnthologies[entry.name]
						})
					}
					return;
				}
				if(apMappings[entry.name]){
					myFastMappings.push({
						entries: [entry],
						id: apMappings[entry.name]
					})
					return;
				}
				bigQuery.push({
					query: `query($search:String){Page(perPage:3){media(type:${type.toUpperCase()},search:$search){title{romaji english native} id synonyms}}}`,
					variables: {search: entry.name},
					callback: function(dat){
						let show = {
							apData: entry,
							aniData: dat.data.Page.media
						}
						show.titles = [];
						show.aniData.forEach(function(hit){
							show.titles.push({
								title: hit.title.romaji,
								id: hit.id,
								levDistance: Math.min(
									levDist(show.apData.name,hit.title.romaji),
									levDist(show.apData.name,hit.title.romaji.toUpperCase()),
									levDist(show.apData.name,hit.title.romaji.toLowerCase())
								)
							});
							if(hit.title.native){
								show.titles.push({
									title: hit.title.native,
									id: hit.id,
									levDistance: levDist(show.apData.name,hit.title.native)
								});
							}
							if(hit.title.english){
								show.titles.push({
									title: hit.title.english,
									id: hit.id,
									levDistance: Math.min(
										levDist(show.apData.name,hit.title.english),
										levDist(show.apData.name,hit.title.english.toUpperCase()),
										levDist(show.apData.name,hit.title.english.toLowerCase())
									)
								});
							}
							hit.synonyms.forEach(
								synonym => show.titles.push({
									title: synonym,
									id: hit.id,
									levDistance: levDist(show.apData.name,synonym)
								})
							)
						});
						show.titles.sort(
							(a,b) => a.levDistance - b.levDistance
						);
						shows.push(show);
						drawShows();
					}
				});
				if(index % 40 === 0){
					queryPacker(bigQuery);
					bigQuery = [];
				}
			});
			let apStatusMap = {
				"want to read": "PLANNING",
				"stalled": "PAUSED",
				"read": "COMPLETED",
				"reading": "CURRENT",
				"watched": "COMPLETED",
				"want to watch": "PLANNING",
				"dropped": "DROPPED",
				"watching": "CURRENT"
			}
			queryPacker(bigQuery,function(){
				setTimeout(function(){
					resultsStatus.innerText = "Please review the media matches. The worst matches are on top.";
					pushResults.style.display = "inline";
					pushResults.onclick = function(){
						pushResults.style.display = "none";
						if(!useScripts.accessToken){
							alert("Not signed in to the script. Can't do any changes to your list\n Go to settings > apps to sign in");
							return;
						}
						authAPIcall(
						`query($name: String,$listType: MediaType){
							Viewer{name mediaListOptions{scoreFormat}}
							MediaListCollection(userName: $name, type: $listType){
								lists{
									entries{
										mediaId
									}
								}
							}
						}`,
						{
							listType: type.toUpperCase(),
							name: whoAmI
						},
						function(data){
							if(data.data.Viewer.name !== whoAmI){
								alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the scirpt again to fix this.");
								return;
							};
							let list = returnList(data,true).map(a => a.mediaId);
							shows = shows.filter(function(show){
								if(!show.toImport){
									return false;
								}
								if(type === "anime"){
									if(!apAnimeOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								else{
									if(!apMangaOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								return true;
							});
							if(!shows.length){
								return;
							};
							let mutater = function(show,index){
								if(index + 1 < shows.length){
									setTimeout(function(){
										mutater(shows[index + 1],index + 1);
									},1000);
								}
								let status = false;
								if(show.isAnthology){
									status = "CURRENT";
								}
								else{
									status = apStatusMap[show.apData.status];
								}
								if(!status){
									console.log("Unknown status: " + show.apData.status);
									return;
								}
								let score = 0;
								if(!show.isAnthology){
									score = show.apData.rating*2;
									if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_100"){
										score = show.apData.rating*20;
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_5"){
										score = Math.floor(show.apData.rating);
										if(show.apData.rating === 0.5){
											score = 1
										}
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_3"){
										if(show.apData.rating === 0){
											score = 0
										}
										else if(show.apData.rating < 2.5){
											score = 1
										}
										else if(show.apData.rating < 4){
											score = 2
										}
										else{
											score = 3
										}
									};
								};
								let progress = 0;
								let progressVolumes = 0;
								let repeat = 0;
								if(show.isAnthology){
									progress = show.apData.length
								}
								else{
									repeat = Math.max(0,show.apData.times - 1) || 0;
									if(status === "DROPPED" || status === "PAUSED" || status === "CURRENT"){
										if(type === "anime"){
											progress = show.apData.eps
										}
										else{
											progress = show.apData.ch
										}
									}
								}
								if(type === "manga"){
									progressVolumes = show.apData.vol
								}
								if(progress){
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$progress: Int,
											$progressVolumes: Int,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												progress: $progress,
												progressVolumes: $progressVolumes,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											progress: progress,
											progressVolumes: progressVolumes,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title + "\n"
											}
										}
									)
								}
								else{
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title +  "\n"
											}
										}
									)
								}
								resultsStatus.innerText = (index + 1) + " of " + shows.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(shows[0],0);
						})
					};
				},2000);
			});
			bigQuery = [];
			myFastMappings.forEach(function(entry){
				bigQuery.push({
					query: `query($id:Int){Media(type:${type.toUpperCase()},id:$id){title{romaji english native} id}}`,
					variables: {id: entry.id},
					callback: function(dat){
						if(entry.isAnthology){
							let show = {
								apData: entry.entries,
								directMapping: true,
								isAnthology: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
							}
							shows.push(show);
							drawShows();
						}
						else{
							let show = {
								apData: entry.entries[0],
								directMapping: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
							}
							shows.push(show);
							drawShows();
						}
					}
				})
			});
			queryPacker(bigQuery);
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	apAnimeInput.onchange = function(){
		apImport("anime",apAnimeInput.files[0])
	}
	apMangaInput.onchange = function(){
		apImport("manga",apMangaInput.files[0])
	}
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let alAnimeExp = create("div",["section","hohImport"],false,target);
	create("h2",false,"AniList: Export Anime List",alAnimeExp);
	let alAnimeButton = create("button",["button","hohButton"],"Export Anime",alAnimeExp);
	alAnimeButton.onclick = function(){
		generalAPIcall(
			`
	query($name: String!){
		MediaListCollection(userName: $name, type: ANIME){
			lists{
				name
				isCustomList
				isSplitCompletedList
				entries{
					... mediaListEntry
				}
			}
		}
		User(name: $name){
			name
			id
			mediaListOptions{
				scoreFormat
			}
		}
	}

	fragment mediaListEntry on MediaList{
		mediaId
		status
		progress
		repeat
		notes
		priority
		hiddenFromStatusLists
		customLists
		advancedScores
		startedAt{
			year
			month
			day
		}
		completedAt{
			year
			month
			day
		}
		updatedAt
		createdAt
		media{
			idMal
			title{romaji native english}
		}
		score
	}
	`,
			{name: whoAmI},
			function(data){
				data.data.version = "1.01";
				data.data.scriptInfo = scriptInfo;
				data.data.type = "ANIME";
				data.data.url = document.URL;
				data.data.timeStamp = NOW();
				saveAs(data.data,"AnilistAnimeList.json");
			}
		);
	}
	create("h2",false,"AniList: Export Manga List",alAnimeExp,"margin-top:20px;");
	let alMangaButton = create("button",["button","hohButton"],"Export Manga",alAnimeExp);
	alMangaButton.onclick = function(){
		generalAPIcall(
			`
	query($name: String!){
		MediaListCollection(userName: $name, type: MANGA){
			lists{
				name
				isCustomList
				isSplitCompletedList
				entries{
					... mediaListEntry
				}
			}
		}
		User(name: $name){
			name
			id
			mediaListOptions{
				scoreFormat
			}
		}
	}

	fragment mediaListEntry on MediaList{
		mediaId
		status
		progress
		progressVolumes
		repeat
		notes
		priority
		hiddenFromStatusLists
		customLists
		advancedScores
		startedAt{
			year
			month
			day
		}
		completedAt{
			year
			month
			day
		}
		updatedAt
		createdAt
		media{
			idMal
			title{romaji native english}
		}
		score
	}
	`,
			{name: whoAmI},
			function(data){
				data.data.version = "1.01";
				data.data.scriptInfo = scriptInfo;
				data.data.type = "MANGA";
				data.data.url = document.URL;
				data.data.timeStamp = NOW();
				saveAs(data.data,"AnilistMangaList.json");
			}
		);
	};
	let malExport = function(data,type){//maybe some time? But there's always malscraper, which does it better
		let xmlContent = "";
		saveAs(xmlContent,type.toLowerCase() + "list_0_-_0.xml",true);
	}
	let alAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Anime List",alAnime);
	let alAnimeCheckboxContainer = create("label","el-checkbox",false,alAnime,"display:none;");
	let alAnimeOverwrite = createCheckbox(alAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",alAnimeCheckboxContainer);
	let alAnimeDropzone = create("div","dropbox",false,alAnime);
	let alAnimeInput = create("input","input-file",false,alAnimeDropzone);
	let alAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",alAnimeDropzone);
	alAnimeInput.type = "file";
	alAnimeInput.name = "json";
	alAnimeInput.accept = "application/json";
	let alManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Manga List",alManga);
	let alMangaCheckboxContainer = create("label","el-checkbox",false,alManga,"display:none;");
	let alMangaOverwrite = createCheckbox(alMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",alMangaCheckboxContainer);
	let alMangaDropzone = create("div","dropbox",false,alManga);
	let alMangaInput = create("input","input-file",false,alMangaDropzone);
	let alMangaDropText = create("p",false,"Drop list JSON file here or click to upload",alMangaDropzone);
	alMangaInput.type = "file";
	alMangaInput.name = "json";
	alMangaInput.accept = "application/json";
	let resultsAreaAL = create("div","importResults",false,target);
	let resultsErrorsAL = create("div",false,false,resultsAreaAL,"color:red;padding:5px;");
	let resultsWarningsAL = create("div",false,false,resultsAreaAL,"color:orange;padding:5px;");
	let resultsStatusAL = create("div",false,false,resultsAreaAL,"padding:5px;");
	let pushResultsAL = create("button",["hohButton","button"],"Import all",resultsAreaAL,"display:none;");
	let resultsTableAL = create("div",false,false,resultsAreaAL);
	let alImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrorsAL.innerText = "error parsing JSON";
			}
			if(parseFloat(data.version) > 1){//was not part of 1.00
				if(data.type !== type.toUpperCase()){
					resultsErrorsAL.innerText = "error wrong list type";
					return;
				}
			}
//
			if(data.User.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarningsAL.innerText = "List for \"" + data.User.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.timeStamp)) > 1000*86400*30){
				resultsWarningsAL.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.timeStamp)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			resultsStatusAL.innerText = "Calculating list differences...";
			if((type === "anime" && alAnimeOverwrite.checked) || (type === "manga" && alMangaOverwrite.checked)){
			}
			else{
				authAPIcall(
					`query($name:String!,$listType:MediaType){
						Viewer{name mediaListOptions{scoreFormat}}
						MediaListCollection(userName:$name,type:$listType){
							lists{
								entries{mediaId}
							}
						}
					}`,
					{
						name: whoAmI,
						listType: type.toUpperCase()
					},
					data2 => {
						if(!data2){
							resultsErrorsAL.innerText = "Could not find the list of " + whoAmI;
							return;
						}
						if(data2.data.Viewer.name !== whoAmI){
							alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data2.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the scirpt again to fix this.");
							return
						};
						let existing = new Set(data2.data.MediaListCollection.lists.map(list => list.entries).flat().map(entry => entry.mediaId));
						let dataList = returnList({data: data},true);
						let already = dataList.filter(entry => existing.has(entry.mediaId)).length;
						let notAlready = dataList.filter(entry => !existing.has(entry.mediaId));
						resultsStatusAL.innerText += "\n" + already + " of " + dataList.length + " entries already on list. Not modifying";
						if(notAlready.length > 0){
							resultsStatusAL.innerText += "\nThe " + notAlready.length + " entries below will be added:";
							pushResultsAL.style.display = "inline";
							notAlready.forEach(show => {
								let row = create("p",false,false,resultsTableAL);
								create("a",false,show.media.title.romaji,row)
									.href = "https://anilist.co/" + type + "/" + show.mediaId
							});
							pushResultsAL.onclick = function(){
								pushResultsAL.style.display = "none";



							let mutater = function(show,index){
								if(index + 1 < notAlready.length){
									setTimeout(function(){
										mutater(notAlready[index + 1],index + 1);
									},1000);
								}
								authAPIcall(
									`mutation($startedAt: FuzzyDateInput,$completedAt: FuzzyDateInput,$notes: String){
										SaveMediaListEntry(
											mediaId: ${show.mediaId},
											status: ${show.status},
											score: ${show.score},
											progress: ${show.progress},
											progressVolumes: ${show.progressVolumes || 0},
											repeat: ${show.repeat},
											priority: ${show.priority},
											notes: $notes,
											startedAt: $startedAt,
											completedAt: $completedAt
										){id}
									}`,
									{
										startedAt: show.startedAt,
										completedAt: show.completedAt,
										notes: show.notes
									},
									data => {}
								)
								resultsStatusAL.innerText = (index + 1) + " of " + notAlready.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(notAlready[0],0);



							}
						}
					}
				)
			}
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	alAnimeInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("anime",alAnimeInput.files[0])
	}
	alMangaInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("manga",alMangaInput.files[0])
	}
}

function addSocialThemeSwitch(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".filters .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addSocialThemeSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target,"width:70px;");
	let listView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	listView.innerHTML = svgAssets.listView;
	cardView.innerHTML = svgAssets.cardView;
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		document.querySelector(".user-social").classList.add("listView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		document.querySelector(".user-social.listView").classList.remove("listView");
	}
	let traitorTracer = create("button",["button","hohButton"],"⇌",target,"padding:5px;");
	traitorTracer.title = "Check who follows back. (will not be accurate if there are more than 600)";
	traitorTracer.onclick = function(){
		traitorTracer.setAttribute("disabled","disabled");
		let query = `
		query($userId: Int!){
			${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){following(userId: $userId,sort: USERNAME){name}}").join("\n")}
		}`;
		let traitorText = traitorTracer.parentNode.querySelector(".filter-group .active").childNodes[0].textContent.trim();
		if(traitorText === "Following"){
			query = `
			query($userId: Int!){
				${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){followers(userId: $userId,sort: USERNAME){name}}").join("\n")}
			}`
		}
		else if(traitorText !== "Followers"){
			return
		};
		generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
			generalAPIcall(
				query,
				{userId: data.data.User.id},
				function(people){
					traitorTracer.removeAttribute("disabled");
					let users = new Set(
						[].concat(
							...Object.keys(people.data).map(
								a => people.data[a].following || people.data[a].followers
							)
						).map(a => a.name)
					);
					document.querySelectorAll(".user-follow .follow-card .name").forEach(function(place){
						if(!users.has(place.textContent.trim())){
							place.parentNode.style.border = "7px solid red"
						}
					})
				}
			)
		},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
	}
}

function addCompactBrowseSwitch(){
	let URLstuff = location.pathname.match(/^\/search\//)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".search-page-unscoped .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".search-page-unscoped");
	if(!target){
		setTimeout(addCompactBrowseSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target);
	let compactListView = create("span",false,false,themeSwitch);
	let listView = create("span",false,false,themeSwitch);
	let compactView = create("span","active",false,themeSwitch);
	let cardView = create("span",false,false,themeSwitch);
	compactListView.innerHTML = svgAssets.listView;
	listView.innerHTML = svgAssets.bigListView;
	compactView.innerHTML = svgAssets.compactView;
	cardView.innerHTML = svgAssets.cardView;
	compactView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.add("cardView");
		target.classList.add("listView");
		target.classList.remove("compactListView");
	}
	compactListView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactListView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.add("compactListView");
	}
}

function addStudioBrowseSwitch(){
	let URLstuff = location.pathname.match(/^\/studio\//)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".studio-page-unscoped .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".studio-page-unscoped");
	if(!target){
		setTimeout(addStudioBrowseSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target);
	target.classList.add("cardView");
	let compactListView = create("span",false,false,themeSwitch);
	let listView = create("span",false,false,themeSwitch);
	let compactView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	compactListView.innerHTML = svgAssets.listView;
	listView.innerHTML = svgAssets.bigListView;
	compactView.innerHTML = svgAssets.compactView;
	cardView.innerHTML = svgAssets.cardView;
	compactView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.add("cardView");
		target.classList.add("listView");
		target.classList.remove("compactListView");
	}
	compactListView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactListView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.add("compactListView");
	}
}

function viewAdvancedScores(url){
	let URLstuff = url.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/);
	let name = decodeURIComponent(URLstuff[1]);
	generalAPIcall(
		`query($name:String!){
			User(name:$name){
				mediaListOptions{
					animeList{advancedScoringEnabled}
					mangaList{advancedScoringEnabled}
				}
			}
		}`,
		{name: name},function(data){
		if(
			!(
				(URLstuff[2] === "anime" && data.data.User.mediaListOptions.animeList.advancedScoringEnabled)
				|| (URLstuff[2] === "manga" && data.data.User.mediaListOptions.mangaList.advancedScoringEnabled)
			)
		){
			return
		};
		generalAPIcall(
			`query($name:String!,$listType:MediaType){
				MediaListCollection(userName:$name,type:$listType){
					lists{
						entries{mediaId advancedScores}
					}
				}
			}`,
			{name: name,listType: URLstuff[2].toUpperCase()},
			function(data2){
				let list = new Map(returnList(data2,true).map(a => [a.mediaId,a.advancedScores]));
				let finder = function(){
					if(!document.URL.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/)){
						return
					};
					document.querySelectorAll(
						".list-entries .entry .title > a:not(.hohAdvanced)"
					).forEach(function(entry){
						entry.classList.add("hohAdvanced");
						let key = parseInt(entry.href.match(/\/(\d+)\//)[1]);
						let dollar = create("span","hohAdvancedDollar","$",entry.parentNode);
						let advanced = list.get(key);
						let reasonable = Object.keys(advanced).map(
							key => [key,advanced[key]]
						).filter(
							a => a[1]
						);
						dollar.title = reasonable.map(
							a => a[0] + ": " + a[1]
						).join("\n");
						if(!reasonable.length){
							dollar.style.display = "none"
						}
					});
					setTimeout(finder,1000);
				};finder();
			}
		)
	})
};

function randomButtons(){
	let list = [
		{data:"users",single:"user"},
		{data:"media(type: ANIME)",single:"anime"},
		{data:"media(type: MANGA)",single:"manga"},
		{data:"characters",single:"character"},
		{data:"staff",single:"staff"},
		{data:"reviews",single:"review"}
	];
	list.forEach(function(item,index){
		let adder = function(data){
			let place = document.querySelectorAll("section > .heading > h3");
			if(place.length <= index){
				setTimeout(function(){adder(data)},200);
				return;
			}
			let currentText = place[index].innerText;
			place[index].innerText = "";
			let link = create("a","link",currentText,place[index],"cursor:pointer;");
			let selected = Math.floor(Math.random()*data.data.Page.pageInfo.total);
			link.onclick = function(){
				generalAPIcall(
					`query($page:Int){
						Page(page:$page){
							${item.data}{id}
						}
					}`,
					{page: Math.ceil(selected / 50)},
					function(data){
						window.location.href = "https://anilist.co/" + item.single + "/" + data.data.Page[item.data.replace(/\(.*\)/,"")][selected % 50].id + "/";
					}
				);
			}
		};
		generalAPIcall(
			`query($page:Int){
				Page(page:$page){
					pageInfo{total}
					${item.data}{id}
				}
			}`,
			{page: 1},
			adder
		)
	});
	let speedAdder = function(data){
		if(!data){
			return
		}
		let place = document.querySelector(".page-content .container section");
		if(!place){
			setTimeout(function(){speedAdder(data)},200);
			return;
		};
		let activityContainer = create("div",false,false,place.parentNode);
		create("h3","heading","Current Activity",activityContainer);
		create("p",false,Math.round((3600*199/(data.data.act1.activities[0].createdAt - data.data.act2.activities[9].createdAt))) + " activities/hour",activityContainer);
		let activities = data.data.text.activities;
		create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " status posts/hour",activityContainer);
		activities = data.data.message.activities;
		create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " messages/hour",activityContainer);
		
	};
	generalAPIcall(
		`query{
			act1:Page(page: 1,perPage:10){
				activities(sort:ID_DESC){
					... on TextActivity{createdAt}
					... on MessageActivity{createdAt}
					... on ListActivity{createdAt}
				}
			}
			act2:Page(page: 20,perPage:10){
				activities(sort:ID_DESC){
					... on TextActivity{createdAt}
					... on MessageActivity{createdAt}
					... on ListActivity{createdAt}
				}
			}
			text:Page{
				activities(sort:ID_DESC,type:TEXT){
					... on TextActivity{createdAt}
				}
			}
			message:Page{
				activities(sort:ID_DESC,type:MESSAGE){
					... on MessageActivity{createdAt}
				}
			}
		}`,
		{},
		speedAdder
	)
}

function possibleBlocked(oldURL){
	let URLstuff = oldURL.match(/\/user\/(.*?)\/?$/);
	if(URLstuff){
		let name = decodeURIComponent(URLstuff[1]);
		const query = `
		query($userName: String) {
			User(name: $userName){
				id
			}
		}`;
		let variables = {
			userName: name
		}
		if(name !== whoAmI){
			generalAPIcall(query,variables,data => {
				let notFound = document.querySelector(".not-found");
				name = name.split("/")[0];
				if(notFound){
					if(name.includes("submissions")){
						notFound.innerText = "This submission was probably denied"
					}
					else if(data){
						notFound.innerText = name + " has blocked you"
					}
					else if(name === "ModChan"){
						notFound.innerText = "Nope."
					}
					else{
						notFound.innerText = name + " does not exist or has a private profile"
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			})
		}
		return
	}
	URLstuff = oldURL.match(/\/(anime|manga)\/(\d+)/);
	if(URLstuff){
		let type = URLstuff[1];
		let id = parseInt(URLstuff[2]);
		const query = `
		query($id: Int,$type: MediaType) {
			Media(id: $id,type: $type){
				genres
			}
		}`;
		let variables = {
			type: type.toUpperCase(),
			id: id
		}
		generalAPIcall(query,variables,data => {
			if(data.data.Media.genres.some(genre => genre === "Hentai")){
				let notFound = document.querySelector(".not-found");
				if(notFound){
					if(id === 320){
						notFound.innerText = `Kite isn't *really* hentai, but it kinda is too, and it's a bit complicated.

(You you enable 18+ content in settings > Anime & Manga)`
					}
					else{
						notFound.innerText = `That's one of them hentais.

(You you enable 18+ content in settings > Anime & Manga)`
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			}
		})
	}
}

function hideGlobalFeed(){
	if(!location.pathname.match(/^\/home/)){
		return
	};
	let toggle = document.querySelector(".feed-type-toggle");
	if(!toggle){
		setTimeout(hideGlobalFeed,100);
		return
	};
	toggle.children[1].style.display = "none";
	if(toggle.children[1].classList.contains("active")){
		toggle.children[0].click()
	}
};

function yearStepper(){
	if(!location.pathname.match(/\/user\/.*\/(anime|manga)list/)){
		return
	}
	let slider = document.querySelector(".el-slider");
	if(!slider){
		setTimeout(yearStepper,200);
		return
	};
	const maxYear = parseInt(slider.getAttribute("aria-valuemax"));
	const minYear = parseInt(slider.getAttribute("aria-valuemin"));
	const yearRange = maxYear - minYear;
	let clickSlider = function(year){//thanks, mator!
		let runway = slider.children[0];
		let r = runway.getBoundingClientRect();
		const x = r.left + r.width * ((year - minYear) / yearRange);
		const y = r.top + r.height / 2;
		runway.dispatchEvent(new MouseEvent("click",{
			clientX: x,
			clientY: y
		}))
	};
	let adjuster = function(delta){
		let heading = slider.previousElementSibling;
		if(heading.children.length === 0){
			if(delta === -1){
				clickSlider(maxYear)
			}
			else{
				clickSlider(minYear)
			}
		}
		else{
			let current = parseInt(heading.children[0].innerText);
			clickSlider(current + delta);
		}
	};
	if(document.querySelector(".hohStepper")){
		return
	};
	slider.style.position = "relative";
	let decButton = create("span","hohStepper","<",slider,"left:-27px;font-size:200%;top:0px;");
	let incButton = create("span","hohStepper",">",slider,"right:-27px;font-size:200%;top:0px;");
	decButton.onclick = function(){
		adjuster(-1)
	};
	incButton.onclick = function(){
		adjuster(1)
	}
}

function profileBackground(){
	if(useScripts.SFWmode){//clearly not safe, users can upload anything
		return
	};
	let URLstuff = location.pathname.match(/^\/user\/(.*?)\/?$/);
	const query = `
	query($userName: String) {
		User(name: $userName){
			about
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,data => {
		if(!data){
			return;
		};
		let jsonMatch = (data.data.User.about || "").match(/^<!--(\{.*})-->/);
		if(!jsonMatch){
			let target = document.querySelector(".user-page-unscoped");
			if(target){
				target.style.background = "unset"
			}
			return;
		};
		try{
			let jsonData = JSON.parse(jsonMatch[1]);
			let adder = function(){
				if(!location.pathname.match(/^\/user\/(.*?)\/?$/)){
					return
				};
				let target = document.querySelector(".user-page-unscoped");
				if(target){
					target.style.background = jsonData.background || "none";
				}
				else{
					setTimeout(adder,200);
				}
			};adder();
		}
		catch(e){
			console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
			console.log(jsonMatch[1]);
		};
	},"hohProfileBackground" + variables.userName,30*1000);
}

function addCustomCSS(){
	if(useScripts.SFWmode){
		return
	};
	let URLstuff = location.pathname.match(/^\/user\/([^/]*)\/?/);
	if(!customStyle.textContent || (decodeURIComponent(URLstuff[1]) !== currentUserCSS)){
		const query = `
		query($userName: String) {
			User(name: $userName){
				about
			}
		}`;
		let variables = {
			userName: decodeURIComponent(URLstuff[1])
		}
		generalAPIcall(query,variables,data => {
			customStyle.textContent = "";
			if(!data){
				return;
			};
			let jsonMatch = (data.data.User.about || "").match(/^<!--(\{.*})-->/);
			if(!jsonMatch){
				return
			};
			try{
				let jsonData = JSON.parse(jsonMatch[1]);
				if(jsonData.customCSS){
					customStyle.textContent = jsonData.customCSS;
					currentUserCSS = decodeURIComponent(URLstuff[1]);
				}
			}
			catch(e){
				console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
				console.log(jsonMatch[1]);
			}
		},"hohProfileBackground" + variables.userName,30*1000);
	}
}

function termsFeed(){
	let page = 1;
	let location = document.querySelector(".container");
	location.parentNode.style.background = "rgb(39,44,56)";
	location.parentNode.style.color = "rgb(159,173,189)";
	let terms = create("div",["container","termsFeed"],false,location.parentNode,"max-width: 1100px;margin-left:170px;margin-right:170px;");
	location.style.display = "none";
	let policy = create("button",["hohButton","button"],"View Privacy Policy instead",terms,"font-size:1rem;color:initial;");
	policy.onclick = function(){
		location.style.display = "initial";
		terms.style.display = "none";
	};
	if(!useScripts.accessToken){
		create("p",false,"This module does not work without signing in to the script",terms);
		let loginURL = create("a",false,"Sign in with the script",terms);
		loginURL.href = authUrl;
		loginURL.style.color = "rgb(61,180,242)";
		return;
	};
	let browseSettings = create("div",false,false,terms,"margin-top:10px;");
	let onlyGlobal = createCheckbox(browseSettings);
	create("span",false,"Global",browseSettings,"margin-right:5px;");
	let onlyStatus = createCheckbox(browseSettings);
	create("span",false,"Text posts",browseSettings,"margin-right:5px;");
	let onlyReplies = createCheckbox(browseSettings);
	create("span",false,"Has replies",browseSettings,"margin-right:5px;");
	let onlyForum = createCheckbox(browseSettings);
	create("span",false,"Forum",browseSettings,"margin-right:5px;");
	let onlyReviews = createCheckbox(browseSettings);
	create("span",false,"Reviews",browseSettings);
	create("br",false,false,browseSettings);
	create("br",false,false,browseSettings);
	let onlyUser = createCheckbox(browseSettings);
	create("span",false,"User",browseSettings,"margin-right:5px;");
	let onlyUserInput = create("input",false,false,browseSettings,"background:rgb(31,35,45);border-width:0px;margin-left:20px;border-radius:3px;color:rgb(159,173,189);margin-right: 10px;padding:3px;");
	let onlyMedia = createCheckbox(browseSettings);
	create("span",false,"Media",browseSettings,"margin-right:5px;");
	let onlyMediaResult = {id: 0,type: "ANIME"};
	let onlyMediaInput = create("input",false,false,browseSettings,"background:rgb(31,35,45);border-width:0px;margin-left:20px;border-radius:3px;color:rgb(159,173,189);margin-right: 10px;padding:3px;");
	let mediaDisplayResults = create("div",false,false,browseSettings,"margin-top:5px;");
	let dataUsers = new Set([whoAmI]);
	let dataMedia = new Set();
	let dataUsersList = create("datalist","#userDatalist",false,browseSettings);
	let dataMediaList = create("datalist","#userMedialist",false,browseSettings);
	onlyUserInput.setAttribute("list","userDatalist");
	onlyMediaInput.setAttribute("list","userMedialist");
	let feed = create("div","hohFeed",false,terms);
	let topNav = create("div",false,false,feed,"position:relative;min-height:60px;margin-bottom:15px;");
	let loading = create("p",false,"Loading...",topNav);
	let pageCount = create("p",false,"Page 1",topNav);
	let statusInput = create("div",false,false,topNav);
	let onlySpecificActivity = false;
	let statusInputTitle = create("input",false,false,statusInput,"display:none;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);background: rgb(var(--color-foreground));");
	statusInputTitle.placeholder = "Title";
	let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);resize: vertical;");
	create("br",false,false,statusInput);
	let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
	let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
	inputArea.placeholder = "Write a status...";
	let topPrevious = create("button",["hohButton","button"],"Refresh",topNav,"position:fixed;top:120px;left:calc(5% - 50px);z-index:50;");
	let topNext = create("button",["hohButton","button"],"Next →",topNav,"position:fixed;top:120px;right:calc(5% - 50px);z-index:50;");
	let feedContent = create("div",false,false,feed);
	let notiLink = create("a",["link","newTab"],"",topNav,"position:fixed;top:10px;right:10px;color:rgb(var(--color-blue));text-decoration:none;");
	notiLink.href = "/notifications";
	let lastUpdated = 0;
	let buildPage = function(activities,type,requestTime){
		if(requestTime < lastUpdated){
			return
		}
		lastUpdated = requestTime;
		loading.innerText = "";
		pageCount.innerText = "Page " + page;
		if(page === 1){
			topPrevious.innerText = "Refresh"
		}
		else{
			topPrevious.innerText = "← Previous"
		};
		removeChildren(feedContent)
		activities.forEach(function(activity){
			let act = create("div","activity",false,feedContent);
			let diff = NOW() - (new Date(activity.createdAt * 1000)).valueOf();
			let time = create("span",["time","hohMonospace"],formatTime(Math.round(diff/1000),"short"),act,"width:50px;position:absolute;left:1px;top:2px;");
			time.title = (new Date(activity.createdAt * 1000)).toLocaleString();
			let content = create("div",false,false,act,"margin-left:60px;position:relative;");
			if(!activity.user){
				return
			}
			let user = create("a",["link","newTab"],activity.user.name,content);
			user.href = "/user/" + activity.user.name + "/";
			let actions = create("div","actions",false,content,"position:absolute;text-align:right;");
			let replyWrap = create("span",["action","hohReplies"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
			let replyCount = create("span","count",(activity.replies.length || activity.replyCount ? activity.replies.length || activity.replyCount : " "),replyWrap);
			let replyIcon = create("span",false,false,replyWrap);
			replyIcon.innerHTML = svgAssets.reply;
			replyWrap.style.cursor = "pointer";
			replyIcon.children[0].style.width = "13px";
			replyIcon.stylemarginLeft = "-2px";
			let likeWrap = create("span",["action","hohLikes"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
			likeWrap.title = activity.likes.map(a => a.name).join("\n");
			let likeCount = create("span","count",(activity.likes.length ? activity.likes.length : " "),likeWrap);
			let heart = create("span",false,"♥",likeWrap,"position:relative;");
			let likeQuickView = create("div","hohLikeQuickView",false,heart);
			if(type === "review"){
				heart.innerText = activity.rating + "/" + activity.ratingAmount
			};
			likeWrap.style.cursor = "pointer";
			if(activity.likes.some(like => like.name === whoAmI)){
				likeWrap.classList.add("hohILikeThis");
			};
			let likeify = function(likes,likeQuickView){
				removeChildren(likeQuickView)
				if(likes.length === 0){}
				else if(likes.length === 1){
					create("span",false,likes[0].name,likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
				}
				else if(likes.length === 2){
					let name1 = create("span",false,likes[0].name.slice(0,(likes[0].name.length <= 6 ? likes[0].name.length : 4)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
					create("span",false," & ",likeQuickView);
					let name2 = create("span",false,likes[1].name.slice(0,(likes[1].name.length <= 6 ? likes[1].name.length : 4)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[1].name)) % 360},50%,50%)`);
					name1.onmouseover = function(){
						name1.innerText = likes[0].name
					}
					name2.onmouseover = function(){
						name2.innerText = likes[1].name
					}
				}
				else if(likes.length === 3){
					let name1 = create("span",false,likes[0].name.slice(0,(likes[0].name.length <= 3 ? likes[0].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
					create("span",false,", ",likeQuickView);
					let name2 = create("span",false,likes[1].name.slice(0,(likes[1].name.length <= 3 ? likes[1].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[1].name)) % 360},50%,50%)`);
					create("span",false," & ",likeQuickView);
					let name3 = create("span",false,likes[2].name.slice(0,(likes[2].name.length <= 3 ? likes[1].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[2].name)) % 360},50%,50%)`);
					name1.onmouseover = function(){
						name1.innerText = likes[0].name
					}
					name2.onmouseover = function(){
						name2.innerText = likes[1].name
					}
					name3.onmouseover = function(){
						name3.innerText = likes[2].name
					}
				}
				else if(likes.length === 4){
					likes.forEach(like => {
						let name = create("span",false,like.name.slice(0,(like.name.length <= 3 ? like.name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false,", ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name;
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length === 5 || likes.length === 6){
					likes.forEach(like => {
						let name = create("span",false,like.name.slice(0,2),likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false," ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name
						}
						name.onmouseout = function(){
							name.innerText = like.name.slice(0,2)
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length < 12){
					likes.forEach(like => {
						let name = create("span",false,like.name[0],likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false," ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name
						}
						name.onmouseout = function(){
							name.innerText = like.name[0]
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length <= 20){
					likes.forEach(like => {
						let name = create("span",false,like.name[0],likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						name.onmouseover = function(){
							name.innerText = " " + like.name + " "
						}
						name.onmouseout = function(){
							name.innerText = like.name[0]
						}
					});
				}
			};
			likeify(activity.likes,likeQuickView);
			likeWrap.onclick = function(){
				authAPIcall(
					"mutation($id:Int){ToggleLike(id:$id,type:" + type.toUpperCase() + "){id}}",
					{id: activity.id},
					data => {}
				);
				if(likeWrap.classList.contains("hohILikeThis")){
					activity.likes.splice(activity.likes.findIndex(user => user.name === whoAmI),1);
					if(activity.likes.length === 0){
						likeCount.innerText = " "
					}
					else{
						likeCount.innerText = activity.likes.length
					}
				}
				else{
					activity.likes.push({name: whoAmI});
					likeCount.innerText = activity.likes.length;
				};
				likeWrap.classList.toggle("hohILikeThis");
				likeWrap.title = activity.likes.map(a => a.name).join("\n");
				likeify(activity.likes,likeQuickView);
			};
			replyWrap.onclick = function(){
				if(act.querySelector(".replies")){
					act.lastChild.remove();
				}
				else if(type === "thread"){
					window.location = "https://anilist.co/forum/thread/" + activity.id + "/";//remove when implemented
					let createReplies = data => {//what's happening here? Must look into it later
						let replies = create("div","replies",false,act);
						data.data.threadReplies.forEach(function(repy){
						});
					};
					//generalAPIcall(``,{},createReplies)
				}
				else{
					let createReplies = function(){
						let replies = create("div","replies",false,act);
						activity.replies.forEach(reply => {
							let rep = create("div","reply",false,replies);
							let ndiff = NOW() - (new Date(reply.createdAt * 1000)).valueOf();
							let time = create("span",["time","hohMonospace"],formatTime(Math.round(ndiff/1000),"short"),rep,"width:50px;position:absolute;left:1px;top:2px;");
							time.title = (new Date(activity.createdAt * 1000)).toLocaleString();
							let user = create("a",["link","newTab"],reply.user.name,rep,"margin-left: 60px;");
							user.href = "/user/" + reply.user.name + "/";
							let text = create("div","status",false,rep,"padding-bottom:10px;margin-left:5px;max-width:100%;");
							if(useScripts.termsFeedNoImages && !activity.renderingPermission){
								let cleanText = reply.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
									let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
									return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
								})
								text.innerHTML = cleanText;
							}
							else{
								text.innerHTML = reply.text
							}
							Array.from(text.querySelectorAll(".youtube")).forEach(ytLink => {
								create("a",["link","newTab"],"Youtube " + ytLink.id,ytLink)
									.href = "https://www.youtube.com/watch?v=" + ytLink.id;
							});
							let actions = create("div","actions",false,rep,"position:absolute;text-align:right;right:4px;bottom:0px;");
							let likeWrap = create("span",["action","hohLikes"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
							likeWrap.title = reply.likes.map(a => a.name).join("\n");
							let likeCount = create("span","count",(reply.likes.length ? reply.likes.length : " "),likeWrap);
							let heart = create("span",false,"♥",likeWrap,"position:relative;");
							let likeQuickView = create("div","hohLikeQuickView",false,heart,"position:absolute;bottom:0px;left:30px;font-size:70%;white-space:nowrap;");
							likeWrap.style.cursor = "pointer";
							if(reply.likes.some(like => like.name === whoAmI)){
								likeWrap.classList.add("hohILikeThis");
							};
							likeify(reply.likes,likeQuickView);
							likeWrap.onclick = function(){
								authAPIcall(
									"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
									{id: reply.id},
									data => {}
								);
								if(likeWrap.classList.contains("hohILikeThis")){
									reply.likes.splice(reply.likes.findIndex(user => user.name === whoAmI),1);
									if(reply.likes.length === 0){
										likeCount.innerText = " ";
									}
									else{
										likeCount.innerText = reply.likes.length;
									};
								}
								else{
									reply.likes.push({name: whoAmI});
									likeCount.innerText = reply.likes.length;
								};
								likeWrap.classList.toggle("hohILikeThis");
								likeWrap.title = reply.likes.map(a => a.name).join("\n");
								likeify(reply.likes,likeQuickView);
							};
						});
						let statusInput = create("div",false,false,replies);
						let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);resize: vertical;");
						let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
						let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
						inputArea.placeholder = "Write a reply...";
						inputArea.onfocus = function(){
							cancelButton.style.display = "inline";
							publishButton.style.display = "inline";
						};
						cancelButton.onclick = function(){
							inputArea.value = "";
							cancelButton.style.display = "none";
							publishButton.style.display = "none";
							document.activeElement.blur();
						};
						publishButton.onclick = function(){
							loading.innerText = "Publishing reply...";
							authAPIcall(
								`mutation($text: String,$activityId: Int){
									SaveActivityReply(text: $text,activityId: $activityId){
										id
										user{name}
										likes{name}
										text(asHtml: true)
										createdAt
									}
								}`,
								{text: inputArea.value,activityId: activity.id},
								data => {
									loading.innerText = "";
									activity.replies.push(data.data.SaveActivityReply);
									replyCount.innerText = activity.replies.length;
									act.lastChild.remove();
									createReplies();
								}
							);
							inputArea.value = "";
							cancelButton.style.display = "none";
							publishButton.style.display = "none";
							document.activeElement.blur();
						};
					};createReplies();
				};
			};
			let status;
			if(activity.type === "TEXT" || activity.type === "MESSAGE"){
				status = create("div",false,false,content,"padding-bottom:10px;width:95%;overflow-wrap:anywhere;");
				if(useScripts.termsFeedNoImages){
					let cleanText = activity.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
						let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					}).replace(/<video.*?video>/g,video => {
						let link = video.match(/src=("|')(.*?)("|')/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					})
					status.innerHTML = cleanText;
					if(cleanText !== activity.text){
						let render = create("a",false,"IMG",act,"position:absolute;top:2px;right:50px;width:10px;cursor:pointer;");
						render.onclick = () => {
							activity.renderingPermission = true;
							status.innerHTML = activity.text;
							render.style.display = "none";
						}
					}
				}
				else{
					status.innerHTML = activity.text;
				}
				Array.from(status.querySelectorAll(".youtube")).forEach(ytLink => {
					create("a",["link","newTab"],ytLink.id,ytLink)
						.href = ytLink.id
				});
				if(activity.user.name === whoAmI && activity.type === "TEXT" && type !== "thread"){
					let edit = create("a",false,"Edit",act,"position:absolute;top:2px;right:40px;width:10px;cursor:pointer;font-size:small;color:inherit;");
					if(useScripts.termsFeedNoImages){
						edit.style.right = "80px"
					}
					edit.onclick = function(){
						loading.innerText = "Loading activity " + activity.id + "...";
						if(terms.scrollIntoView){
							terms.scrollIntoView({"behavior": "smooth","block": "start"})
						}
						else{
							document.body.scrollTop = document.documentElement.scrollTop = 0
						};
						authAPIcall(
							`query($id: Int){
								Activity(id: $id){
									... on TextActivity{
										text(asHtml: false)
									}
								}
							}`,
							{id: activity.id},
							data => {
								if(!data){
									onlySpecificActivity = false;
									loading.innerText = "Failed to load activity";
								}
								inputArea.focus();
								onlySpecificActivity = activity.id;
								loading.innerText = "Editing activity " + activity.id;
								inputArea.value = data.data.Activity.text;
							}
						)
					}
				}
				act.classList.add("text");
				actions.style.right = "21px";
				actions.style.bottom = "4px";
			}
			else{
				status = create("span",false," " + activity.status,content);
				if(activity.progress){
					create("span",false," " + activity.progress + " of",content);
				};
				let title = activity.media.title.romaji;
				if(useScripts.titleLanguage === "NATIVE" && activity.media.title.native){
					title = activity.media.title.native;
				}
				else if(useScripts.titleLanguage === "ENGLISH" && activity.media.title.english){
					title = activity.media.title.english;
				};
				dataMedia.add(title);
				title = titlePicker(activity.media);
				let media = create("a",["link","newTab"]," " + title,content);
				media.href = "/" + activity.media.type.toLowerCase() + "/" + activity.media.id + "/" + safeURL(title) + "/";
				if(activity.media.type === "MANGA" && useScripts.CSSgreenManga){
					media.style.color = "rgb(var(--color-green))";
				};
				act.classList.add("list");
				actions.style.right = "21px";
				actions.style.top = "2px";
				if(useScripts.statusBorder){
					let blockerMap = {
						"plans": "PLANNING",
						"watched": "CURRENT",
						"read": "CURRENT",
						"completed": "COMPLETED",
						"paused": "PAUSED",
						"dropped": "DROPPED",
						"rewatched": "REPEATING",
						"reread": "REPEATING"
					};
					let status = blockerMap[
						Object.keys(blockerMap).find(
							key => activity.status.includes(key)
						)
					]
					if(status === "CURRENT"){
						//nothing
					}
					else if(status === "COMPLETED"){
						act.style.borderLeftWidth = "3px";
						act.style.marginLeft = "-2px";
						if(useScripts.CSSgreenManga && activity.media.type === "ANIME"){
							act.style.borderLeftColor = "rgb(var(--color-blue))";
						}
						else{
							act.style.borderLeftColor = "rgb(var(--color-green))";
						}
					}
					else{
						act.style.borderLeftWidth = "3px";
						act.style.marginLeft = "-2px";
						act.style.borderLeftColor = distributionColours[status];
					}
				}
			};
			let link = create("a",["link","newTab"],false,act,"position:absolute;top:2px;right:4px;width:10px;");
			link.innerHTML = svgAssets.link;
			if(type === "thread"){
				link.href = "https://anilist.co/forum/thread/" + activity.id + "/";
			}
			else{
				link.href = "https://anilist.co/" + type + "/" + activity.id + "/";
			}
			if(activity.user.name === whoAmI){
				let deleteActivity = create("span","hohDeleteActivity",svgAssets.cross,act);
				deleteActivity.title = "Delete";
				deleteActivity.onclick = function(){
					authAPIcall(
						"mutation($id: Int){Delete" + capitalize(type) + "(id: $id){deleted}}",
						{id: activity.id},
						function(data){
							if(data.data.DeleteActivity.deleted){
								act.style.display = "none"
							}
						}
					)
				}
			}
			dataUsers.add(activity.user.name);
			activity.replies.forEach(reply => {
				dataUsers.add(reply.user.name);
				(reply.text.match(/@(.*?)</g) || []).forEach(user => {
					dataUsers.add(user.slice(1,user.length-1))
				})
			})
		});
		if(terms.scrollIntoView){
			terms.scrollIntoView({"behavior": "smooth","block": "start"})
		}
		else{
			document.body.scrollTop = document.documentElement.scrollTop = 0
		};
		removeChildren(dataUsersList)
		dataUsers.forEach(user => {
			create("option",false,false,dataUsersList)
				.value = user;
		});
		removeChildren(dataMediaList)
		dataMedia.forEach(media => {
			create("option",false,false,dataMediaList)
				.value = media;
		});
	};
	let requestPage = function(npage,userID){
		page = npage;
		let types = [];
		if(!onlyUser.checked){
			types.push("MESSAGE")
		}
		if(onlyStatus.checked){
			types.push("ANIME_LIST","MANGA_LIST")
		};
		let specificUser = onlyUserInput.value || whoAmI;
		if(onlyUser.checked && !userID){
			generalAPIcall("query($name:String){User(name:$name){id}}",{name: specificUser},function(data){
				if(data){
					requestPage(npage,data.data.User.id)
				}
				else{
					loading.innerText = "Not Found"
				}
			},"hohIDlookup" + specificUser.toLowerCase());
			return;
		};
		let requestTime = NOW();
		if(onlyForum.checked){
			authAPIcall(
				`
query($page: Int){
	Page(page: $page){
		threads(sort:REPLIED_AT_DESC${(onlyUser.checked ? ",userId: " + userID : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaCategoryId: " + onlyMediaResult.id : ""}){
			id
			createdAt
			user{name}
			text:body(asHtml: true)
			likes{name}
			title
			replyCount
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage},
				function(data){
					buildPage(data.data.Page.threads.map(thread => {
						thread.type = "TEXT";
						thread.replies = [];
						thread.text = "<h2>" + thread.title + "</h2>" + thread.text;
						return thread
					}).filter(thread => thread.replyCount || !onlyReplies.checked),"thread",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications"
						}
						else{
							notiLink.title = "no unread notifications"
						}
					};
				}
			);
		}
		else if(onlyReviews.checked){
			authAPIcall(
				`
query($page: Int){
	Page(page: $page,perPage: 20){
		reviews(sort:CREATED_AT_DESC${(onlyUser.checked ? ",userId: " + userID : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaId: " + onlyMediaResult.id : ""}){
			id
			createdAt
			user{name}
			media{
				id
				type
				title{romaji native english}
			}
			summary
			body(asHtml: true)
			rating
			ratingAmount
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage},
				function(data){
					buildPage(data.data.Page.reviews.map(review => {
						review.type = "TEXT";
						review.likes = [];
						review.replies = [{
							id: review.id,
							user: review.user,
							likes: [],
							text: review.body,
							createdAt: review.createdAt
						}];
						review.text = review.summary
						return review
					}),"review",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications";
						}
						else{
							notiLink.title = "no unread notifications";
						}
					};
				}
			);
		}
		else{
			authAPIcall(
				`
query($page: Int,$types: [ActivityType]){
	Page(page: $page){
		activities(${(onlyUser.checked || onlyGlobal.checked ? "" : "isFollowing: true,")}sort: ID_DESC,type_not_in: $types${(onlyReplies.checked ? ",hasReplies: true" : "")}${(onlyUser.checked ? ",userId: " + userID : "")}${(onlyGlobal.checked ? ",hasRepliesOrTypeText: true" : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaId: " + onlyMediaResult.id : ""}){
			... on MessageActivity{
				id
				type
				createdAt
				user:messenger{name}
				text:message(asHtml: true)
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
			... on TextActivity{
				id
				type
				createdAt
				user{name}
				text(asHtml: true)
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
			... on ListActivity{
				id
				type
				createdAt
				user{name}
				status
				progress
				media{
					id
					type
					title{romaji native english}
				}
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage,types:types},
				function(data){
					buildPage(data.data.Page.activities,"activity",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications";
						}
						else{
							notiLink.title = "no unread notifications";
						}
					};
				}
			);
		}
	};
	requestPage(page);
	let setInputs = function(){
		statusInputTitle.style.display = "none";
		if(onlyReviews.checked){
			inputArea.placeholder = "Writing reviews not supported yet...";
			publishButton.innerText = "Publish";
		}
		else if(onlyForum.checked){
			inputArea.placeholder = "Write a forum post...";
			statusInputTitle.style.display = "block";
			publishButton.innerText = "Publish";
		}
		else if(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase()){
			inputArea.placeholder = "Write a message...";
			publishButton.innerText = "Send";
		}
		else{
			inputArea.placeholder = "Write a status...";
			publishButton.innerText = "Publish";
		}
	};
	topPrevious.onclick = function(){
		loading.innerText = "Loading...";
		if(page === 1){
			requestPage(1)
		}
		else{
			requestPage(page - 1)
		}
	};
	topNext.onclick = function(){
		loading.innerText = "Loading...";
		requestPage(page + 1);
	};
	onlyGlobal.onchange = function(){
		loading.innerText = "Loading...";
		statusInputTitle.style.display = "none";
		inputArea.placeholder = "Write a status...";
		onlyUser.checked = false;
		onlyForum.checked = false;
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyStatus.onchange = function(){
		loading.innerText = "Loading...";
		onlyForum.checked = false;
		onlyReviews.checked = false;
		onlyMedia.checked = false;
		requestPage(1);
	};
	onlyReplies.onchange = function(){
		loading.innerText = "Loading...";
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyUser.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		onlyGlobal.checked = false;
		requestPage(1);
	};
	onlyForum.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		onlyGlobal.checked = false;
		onlyStatus.checked = false;
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyMedia.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		requestPage(1);
	};
	onlyReviews.onchange = function(){
		setInputs();
		onlyGlobal.checked = false;
		onlyStatus.checked = false;
		onlyForum.checked = false;
		onlyReplies.checked = false;
		loading.innerText = "Loading...";
		requestPage(1);
	}
	let oldOnlyUser = "";
	onlyUserInput.onfocus = function(){
		oldOnlyUser = onlyUserInput.value
	};
	let oldOnlyMedia = "";
	onlyMediaInput.onfocus = function(){
		oldOnlyMedia = onlyMediaInput.value
	};
	onlyMediaInput.onblur = function(){
		if(onlyMediaInput.value === oldOnlyMedia){
			return;
		}
		if(onlyMediaInput.value === ""){
			removeChildren(mediaDisplayResults)
			onlyMediaResult.id = false;
		}
		else{
			if(!mediaDisplayResults.childElementCount){
				create("span",false,"Searching...",mediaDisplayResults);
			}
			generalAPIcall(`
				query($search: String){
					Page(page:1,perPage:5){
						media(search:$search,sort:SEARCH_MATCH){
							title{romaji}
							id
							type
						}
					}
				}`,
				{search: onlyMediaInput.value},
				function(data){
					removeChildren(mediaDisplayResults)
					data.data.Page.media.forEach((media,index) => {
						let result = create("span",["hohSearchResult",media.type.toLowerCase()],media.title.romaji,mediaDisplayResults);
						if(index === 0){
							result.classList.add("selected");
							onlyMediaResult.id = media.id;
							onlyMediaResult.type = media.type;
						}
						result.onclick = function(){
							mediaDisplayResults.querySelector(".selected").classList.toggle("selected");
							result.classList.add("selected");
							onlyMediaResult.id = media.id;
							onlyMediaResult.type = media.type;
							onlyMedia.checked = true;
							onlyStatus.checked = false;
							loading.innerText = "Loading...";
							requestPage(1);
						}
					});
					if(data.data.Page.media.length){
						onlyMedia.checked = true;
						onlyStatus.checked = false;
						loading.innerText = "Loading...";
						requestPage(1);
					}
					else{
						create("span",false,"No results found",mediaDisplayResults);
						onlyMediaResult.id = false;
					}
				}
			)
		};
	};
	onlyUserInput.onblur = function(){
		if(onlyForum.checked){
			inputArea.placeholder = "Write a forum post...";
			publishButton.innerText = "Publish";
		}
		else if(
			(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase())
			|| (oldOnlyUser !== onlyUserInput.value && onlyUserInput.value !== "")
		){
			inputArea.placeholder = "Write a message...";
			publishButton.innerText = "Send";	
		}
		else{
			inputArea.placeholder = "Write a status...";
			publishButton.innerText = "Publish";
		}
		if(oldOnlyUser !== onlyUserInput.value && onlyUserInput.value !== ""){
			loading.innerText = "Loading...";
			onlyUser.checked = true;
			requestPage(1);
		}
		else if(onlyUser.checked && oldOnlyUser !== onlyUserInput.value){
			loading.innerText = "Loading...";
			requestPage(1);
		}
	};
	onlyUserInput.addEventListener("keyup",function(event){
		if(event.key === "Enter"){
			onlyUserInput.blur();
		}
	});
	onlyMediaInput.addEventListener("keyup",function(event){
		if(event.key === "Enter"){
			onlyMediaInput.blur();
		}
	});
	inputArea.onfocus = function(){
		cancelButton.style.display = "inline";
		publishButton.style.display = "inline";
	};
	cancelButton.onclick = function(){
		inputArea.value = "";
		cancelButton.style.display = "none";
		publishButton.style.display = "none";
		loading.innerText = "";
		onlySpecificActivity = false;
		document.activeElement.blur();
	};
	publishButton.onclick = function(){
		if(onlyForum.checked){
			alert("Sorry, not implemented yet");
			//loading.innerText = "Publishing forum post...";
			return;
		}
		else if(onlyReviews.checked){
			alert("Sorry, not implemented yet");
			//loading.innerText = "Publishing review...";
			return;
		}
		else if(onlySpecificActivity){
			loading.innerText = "Publishing...";
			authAPIcall(
				"mutation($text: String,$id: Int){SaveTextActivity(id: $id,text: $text){id}}",
				{text: inputArea.value,id: onlySpecificActivity},
				function(data){
					onlySpecificActivity = false;
					requestPage(1);
				}
			);
		}
		else if(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase()){
			loading.innerText = "Sending Message...";
			generalAPIcall("query($name:String){User(name:$name){id}}",{name: onlyUserInput.value},function(data){
				if(data){
					authAPIcall(
						"mutation($text: String,$recipientId: Int){SaveMessageActivity(message: $text,recipientId: $recipientId){id}}",
						{
							text: inputArea.value,
							recipientId: data.data.User.id
						},
						function(data){
							requestPage(1);
						}
					)
				}
				else{
					loading.innerText = "Not Found";
				}
			},"hohIDlookup" + onlyUserInput.value.toLowerCase());
		}
		else{
			loading.innerText = "Publishing...";
			authAPIcall(
				"mutation($text: String){SaveTextActivity(text: $text){id}}",
				{text: inputArea.value},
				function(data){
					requestPage(1);
				}
			);
		}
		inputArea.value = "";
		cancelButton.style.display = "none";
		publishButton.style.display = "none";
		document.activeElement.blur();
	};
	let sideBarContent = create("div","sidebar",false,feed,"position:absolute;left:20px;top:200px;max-width:150px;");
	let buildPreview = function(data){
		if(!data){
			return;
		}
		removeChildren(sideBarContent)
		let mediaLists = data.data.Page.mediaList.map(mediaList => {
			if(aliases.has(mediaList.media.id)){
				mediaList.media.title.userPreferred = aliases.get(mediaList.media.id)
			}
			return mediaList
		});
		mediaLists.slice(0,20).forEach(mediaList => {
			let mediaEntry = create("div",false,false,sideBarContent,"border-bottom: solid;border-bottom-width: 1px;margin-bottom: 10px;border-radius: 3px;padding: 2px;");
			create("a","link",mediaList.media.title.userPreferred,mediaEntry,"min-height:40px;display:inline-block;")
				.href = "/anime/" + mediaList.media.id + "/" + safeURL(mediaList.media.title.userPreferred);
			let progress = create("div",false,false,mediaEntry,"font-size: small;");
			create("span",false,"Progress: ",progress);
			let number = create("span",false,mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : ""),progress);
			let plusProgress = create("span",false,"+",progress,"padding-left:5px;padding-right:5px;cursor:pointer;");
			let isBlocked = false;
			plusProgress.onclick = function(e){
				if(isBlocked){
					return
				};
				if(mediaList.media.episodes){
					if(mediaList.progress < mediaList.media.episodes){
						mediaList.progress++;
						number.innerText = mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : "");
						isBlocked = true;
						setTimeout(function(){
							isBlocked = false;
						},300);
						if(mediaList.progress === mediaList.media.episodes){
							plusProgress.innerText = "";
							if(mediaList.status === "REWATCHING"){//don't overwrite the existing end date
								authAPIcall(
									`mutation($progress: Int,$id: Int){
										SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED){id}
									}`,
									{id: mediaList.id,progress: mediaList.progress},
									data => {}
								);
							}
							else{
								authAPIcall(
									`mutation($progress: Int,$id: Int,$date:FuzzyDateInput){
										SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED,completedAt:$date){id}
									}`,
									{
										id: mediaList.id,
										progress: mediaList.progress,
										date: {
											year: (new Date()).getUTCFullYear(),
											month: (new Date()).getUTCMonth() + 1,
											day: (new Date()).getUTCDate(),
										}
									},
									data => {}
								);
							};
							mediaEntry.style.backgroundColor = "rgba(0,200,0,0.1)";
						}
						else{
							authAPIcall(
								`mutation($progress: Int,$id: Int){
									SaveMediaListEntry(progress: $progress,id:$id){id}
								}`,
								{id: mediaList.id,progress: mediaList.progress},
								data => {}
							);
						}
						localStorage.setItem("hohListPreview",JSON.stringify(data));
					}
				}
				else{
					mediaList.progress++;
					number.innerText = mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : "");
					isBlocked = true;
					setTimeout(function(){
						isBlocked = false;
					},300);
					authAPIcall(
						`mutation($progress: Int,$id: Int){
							SaveMediaListEntry(progress: $progress,id:$id){id}
						}`,
						{id: mediaList.id,progress: mediaList.progress},
						data => {}
					);
					localStorage.setItem("hohListPreview",JSON.stringify(data));
				};
				e.stopPropagation();
				e.preventDefault();
				return false
			}
		});
	};
	authAPIcall(
		`query($name: String){
			Page(page:1){
				mediaList(type:ANIME,status_in:[CURRENT,REPEATING],userName:$name,sort:UPDATED_TIME_DESC){
					id
					priority
					scoreRaw: score(format: POINT_100)
					progress
					status
					media{
						id
						episodes
						coverImage{large color}
						title{userPreferred}
						nextAiringEpisode{episode timeUntilAiring}
					}
				}
			}
		}`,{name: whoAmI},function(data){
			localStorage.setItem("hohListPreview",JSON.stringify(data));
			buildPreview(data,true);
		}
	);
	buildPreview(JSON.parse(localStorage.getItem("hohListPreview")),false);
}

function scoreOverviewFixer(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\//)){
		return;
	}
	let overview = document.querySelector(".media .overview");
	if(!overview){
		setTimeout(scoreOverviewFixer,300);
		return;
	}
	let follows = overview.querySelectorAll(".follow");
	if(follows.length){
		follows.forEach(el => {
			scoreColors(el);
		});
	}
	else{
		setTimeout(scoreOverviewFixer,300);
	}
}

function meanScoreBack(){
	let URLstuff = location.pathname.match(/^\/user\/(.*?)\/?$/);
	const query = `
	query($userName: String) {
		User(name: $userName){
			statistics{
				anime{
					episodesWatched
					meanScore
				}
				manga{
					volumesRead
					meanScore
				}
			}
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,function(data){
		if(!data){
			return;
		}
		let adder = function(){
			if(!location.pathname.match(/^\/user\/(.*?)\/?$/)){
				return;
			}
			let possibleStatsWrap = document.querySelectorAll(".stats-wrap .stats-wrap");
			if(possibleStatsWrap.length){
				if(possibleStatsWrap.length === 2 && possibleStatsWrap[0].childElementCount === 3){
					if(data.data.User.statistics.anime.meanScore){
						let statAnime = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.anime.episodesWatched,statAnime);
						create("div","label","Total Episodes",statAnime);
						let totalDays = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalDays + " Days Watched";
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones");
					};
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[1]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label","Total Volumes",statManga);
						let totalChapters = possibleStatsWrap[1].children[1].children[0].innerText;
						possibleStatsWrap[1].children[1].remove();
						possibleStatsWrap[1].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalChapters + " Chapters Read";
						possibleStatsWrap[1].parentNode.classList.add("hohMilestones");
					};
				}
				else if(possibleStatsWrap[0].innerText.includes("Total Manga")){
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label","Total Volumes",statManga);
						let totalChapters = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalChapters + " Chapters Read";
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones");
					};
				}
			}
			else{
				setTimeout(adder,200);
			}
		};adder();
	},"hohMeanScoreBack" + variables.userName,60*1000);
}

function betterReviewRatings(){
	if(!location.pathname.match(/\/home/)){
		return
	}
	let reviews = document.querySelectorAll(".review-card .el-tooltip.votes");
	if(!reviews.length){
		setTimeout(betterReviewRatings,500);
		return;
	}
	// Basic idea: read the rating info from the tooltips to avoid an API call.
	document.body.classList.add("TMPreviewScore");//add a temporary class, which makes all tooltips
	reviews.forEach(likeElement => {//trigger creation of the tooltips (they don't exist before hover)
		likeElement.dispatchEvent(new Event("mouseenter"));
		likeElement.dispatchEvent(new Event("mouseleave"));
	});
	setTimeout(function(){//give anilist some time to generate them
		reviews.forEach(likeElement => {
			let likeExtra = document.getElementById(likeElement.attributes["aria-describedby"].value);
			if(likeExtra){
				let matches = likeExtra.innerText.match(/out of (\d+)/);
				if(matches){
					likeElement.childNodes[1].textContent += "/" + matches[1]
				}
			}
			likeElement.style.bottom = "4px";
			likeElement.style.right = "7px";
		})
		document.body.classList.remove("TMPreviewScore");//make tooltips visible again
	},200);
}

function addForumMedia(){
	let id = parseInt(document.URL.match(/\d+$/)[0]);
	let adder = function(data){
		if(!document.URL.includes(id) || !data){
			return
		}
		let feed = document.querySelector(".feed");
		if(!feed){
			setTimeout(function(){adder(data)},200);
			return
		}
		data.data.Media.id = id;
		let mediaLink = create("a",false,titlePicker(data.data.Media),false,"color:rgb(var(--color-blue));padding:10px;display:block;");
		mediaLink.href = data.data.Media.siteUrl;
		feed.insertBefore(mediaLink,feed.firstChild);
	}
	generalAPIcall(
		`query($id:Int){Media(id:$id){title{native english romaji} siteUrl}}`,
		{id: id},
		adder,
		"hohMediaLookup" + id
	)
}

function betterListPreview(){
	if(window.screen.availWidth && window.screen.availWidth <= 1040){
		return
	}
	let errorHandler = function(e){
		console.error(e);
		console.warn("Alternative list preview failed. Trying to bring back the native one");
		let hohListPreviewToRemove = document.getElementById("hohListPreview");
		if(hohListPreviewToRemove){
			hohListPreviewToRemove.remove()
		};
		document.querySelectorAll(".list-preview-wrap").forEach(wrap => {
			wrap.style.display = "block"
		})
	}
	try{//it's complex, and could go wrong. Furthermore, we want a specific behavour when it fails, namely bringing back the native preview
	let hohListPreview = document.getElementById("hohListPreview");
	if(hohListPreview){
		return;
	};
	let buildPreview = function(data,overWrite){try{
		if(!data){
			return;
		}
		if(!hohListPreview){
			overWrite = true;
			let listPreviews = document.querySelectorAll(".list-previews h2");
			if(!listPreviews.length){
				setTimeout(function(){buildPreview(data)},200);
				return
			};
			hohListPreview = create("div","#hohListPreview");
			listPreviews[0].parentNode.parentNode.parentNode.parentNode.insertBefore(hohListPreview,listPreviews[0].parentNode.parentNode.parentNode);
			listPreviews.forEach(heading => {
				if(!heading.innerText.includes("Manga")){
					heading.parentNode.parentNode.style.display = "none";
				}
			})
		};
		if(overWrite){
			let mediaLists = data.data.Page.mediaList.map((mediaList,index) => {
				mediaList.index = index;
				if(aliases.has(mediaList.media.id)){
					mediaList.media.title.userPreferred = aliases.get(mediaList.media.id)
				}
				return mediaList
			});
			let notAiring = mediaLists.filter(
				mediaList => !mediaList.media.nextAiringEpisode
			)
			let airing = mediaLists.filter(
				mediaList => mediaList.media.nextAiringEpisode
			).map(
				mediaList => {
					mediaList.points = 100/(mediaList.index + 1) + mediaList.priority/10 + (mediaList.scoreRaw || 60)/10;
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
						mediaList.points -= 100/(mediaList.index + 1);
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 1;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*3){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*1){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 3;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*10){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 5;
						}
						else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
							mediaList.points += 2;
						}
					}
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
						mediaList.points += 7;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 3;
							}
						}
					}
					else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 3){
						mediaList.points += 2;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 1;
							}
						}
					}
					return mediaList;
				}
			).sort(
				(b,a) => a.points - b.points
			);
			let airingImportant = mediaLists.filter(
				(mediaList,index) => mediaList.media.nextAiringEpisode && (
					index < 20
					|| mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*4
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1
					)
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6
						&& mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2
					)
				)
			).length;
			if(airingImportant > 3){
				airingImportant = Math.min(5*Math.ceil((airingImportant - 1)/5),airing.length)
			}
			removeChildren(hohListPreview)
			let drawSection = function(list,name,moveExpander){
				let airingSection = create("div","list-preview-wrap",false,hohListPreview,"margin-bottom: 20px;");
				let airingSectionHeader = create("div","section-header",false,airingSection);
				if(name === "Airing"){
					create("a","asHeading",name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
						.href = "https://anilist.co/airing"
				}
				else{
					create("h2",false,name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
				};
				if(moveExpander){
					airingSectionHeader.appendChild(document.querySelector(".size-toggle"))
				};
				let airingListPreview = create("div","list-preview",false,airingSection,"display:grid;grid-template-columns: repeat(5,85px);grid-template-rows: repeat(auto-fill,115px);grid-gap: 20px;padding: 20px;background: rgb(var(--color-foreground));");
				list.forEach((air,index) => {
					let card = create("div",["media-preview-card","small","hohFallback"],false,airingListPreview,"width: 85px;height: 115px;background: rgb(var(--color-foreground));border-radius: 3px;display: inline-grid;");
					if(air.media.coverImage.color){
						card.style.backgroundColor = air.media.coverImage.color
					};
					if(index % 5 > 1){
						card.classList.add("info-left")
					};
					let cover = create("a","cover",false,card,"background-position: 50%;background-repeat: no-repeat;background-size: cover;text-align: center;border-radius: 3px;");
					cover.style.backgroundImage = "url(\"" + air.media.coverImage.large + "\")";
					cover.href = "/anime/" + air.media.id + "/" + safeURL(air.media.title.userPreferred);
					if(air.media.nextAiringEpisode){
						let imageText = create("div","image-text",false,cover,"background: rgba(var(--color-overlay),.7);border-radius: 0 0 3px 3px;bottom: 0;color: rgba(var(--color-text-bright),.91);display: inline-block;font-weight: 400;left: 0;letter-spacing: .2px;margin-bottom: 0;position: absolute;transition: .3s;width: 100%;font-size: 1.1rem;line-height: 1.2;padding: 8px;");
						let imageTextWrapper = create("div","countdown",false,imageText);
						let createCountDown = function(){
							removeChildren(imageTextWrapper)
							create("span",false,"Ep " + air.media.nextAiringEpisode.episode + " - ",imageTextWrapper);
							if(air.media.nextAiringEpisode.timeUntilAiring <= 0){
								create("span",false,"Recently aired",imageTextWrapper);
								return;
							};
							let days = Math.floor(air.media.nextAiringEpisode.timeUntilAiring/(60*60*24));
							let hours = Math.floor((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24))/3600);
							let minutes = Math.round((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24) - hours*3600)/60);
							if(minutes === 60){
								hours++;
								minutes = 0;
								if(hours === 24){
									days++;
									hours = 0;
								}
							};
							if(days){
								create("span",false,days + "d ",imageTextWrapper)
							}
							if(hours){
								create("span",false,hours + "h ",imageTextWrapper)
							}
							if(minutes){
								create("span",false,minutes + "m",imageTextWrapper)
							}
							setTimeout(function(){
								air.media.nextAiringEpisode.timeUntilAiring -= 60;
								createCountDown();
							},60*1000);
						};createCountDown();
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							create("div","behind-accent",false,imageText,"background: rgb(var(--color-red));border-radius: 0 0 2px 2px;bottom: 0;height: 5px;left: 0;position: absolute;transition: .2s;width: 100%;")
						}
					}
					let imageOverlay = create("div","image-overlay",false,cover);
					let plusProgress = create("div","plus-progress",air.progress + " +",imageOverlay);
					let content = create("div","content",false,card);
					if(air.media.nextAiringEpisode){
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							let infoHeader = create("div","info-header",false,content,"color: rgb(var(--color-blue));font-size: 1.2rem;font-weight: 500;margin-bottom: 8px;");
							create("div",false,behind + " episode" + (behind > 1 ? "s" : "") + " behind",infoHeader);
						}
					}
					let title = create("a","title",air.media.title.userPreferred,content,"font-size: 1.4rem;");
					let info = create("div",["info","hasMeter"],false,content,"bottom: 12px;color: rgb(var(--color-text-lighter));font-size: 1.2rem;left: 12px;position: absolute;");
					let pBar;
					if(air.media.episodes && useScripts.progressBar){
						pBar = create("meter",false,false,info);
						pBar.value = air.progress;
						pBar.min = 0;
						pBar.max = air.media.episodes;
						if(air.media.nextAiringEpisode){
							pBar.low = air.media.nextAiringEpisode.episode - 2;
							pBar.high = air.media.nextAiringEpisode.episode - 1;
							pBar.optimum = air.media.nextAiringEpisode.episode - 1;
						}
					};
					let progress = create("div",false,"Progress: " + air.progress + (air.media.episodes ? "/" + air.media.episodes : ""),info);
					let isBlocked = false;
					plusProgress.onclick = function(e){
						if(isBlocked){
							return
						};
						if(air.media.episodes){
							if(air.progress < air.media.episodes){
								if(useScripts.progressBar){
									pBar.value++;
								}
								air.progress++;
								progress.innerText = "Progress: " + air.progress + (air.media.episodes ? "/" + air.media.episodes : "");
								isBlocked = true;
								setTimeout(function(){
									plusProgress.innerText = air.progress + " +";
									isBlocked = false;
								},300);
								if(air.progress === air.media.episodes){
									progress.innerText += " Completed";
									if(air.status === "REWATCHING"){//don't overwrite the existing end date
										authAPIcall(
											`mutation($progress: Int,$id: Int){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED){id}
											}`,
											{id: air.id,progress: air.progress},
											data => {}
										);
									}
									else{
										authAPIcall(
											`mutation($progress: Int,$id: Int,$date:FuzzyDateInput){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED,completedAt:$date){id}
											}`,
											{
												id: air.id,
												progress: air.progress,
												date: {
													year: (new Date()).getUTCFullYear(),
													month: (new Date()).getUTCMonth() + 1,
													day: (new Date()).getUTCDate(),
												}
											},
											data => {}
										);
									}
								}
								else{
									authAPIcall(
										`mutation($progress: Int,$id: Int){
											SaveMediaListEntry(progress: $progress,id:$id){id}
										}`,
										{id: air.id,progress: air.progress},
										data => {}
									);
								}
								localStorage.setItem("hohListPreview",JSON.stringify(data));
							}
						}
						else{
							air.progress++;
							plusProgress.innerText = air.progress + " +";
							isBlocked = true;
							setTimeout(function(){
								plusProgress.innerText = air.progress + " +";
								isBlocked = false;
							},300);
							authAPIcall(
								`mutation($progress: Int,$id: Int){
									SaveMediaListEntry(progress: $progress,id:$id){id}
								}`,
								{id: air.id,progress: air.progress},
								data => {}
							);
							localStorage.setItem("hohListPreview",JSON.stringify(data));
						};
						if(air.media.nextAiringEpisode){
							if(air.progress === air.media.nextAiringEpisode.episode - 1){
								if(card.querySelector(".behind-accent")){
									card.querySelector(".behind-accent").remove()
								}
							}
						}
						e.stopPropagation();
						e.preventDefault();
						return false
					}
					let fallback = create("span","hohFallback",air.media.title.userPreferred,card,"background-color: rgb(var(--color-foreground),0.6);padding: 3px;border-radius: 3px;");
					if(useScripts.titleLanguage === "ROMAJI"){
						fallback.innerHTML = air.media.title.userPreferred.replace(/\S{3}(a|\(|☆|\-|e|i|ou|(o|u)(?!u|\s)|n(?!a|e|i|o|u))(?![a-z]($|[^a-z]))/gi,m => m + "<wbr>");
					}
					
				});
			};
			if(airingImportant > 3){
				drawSection(
					airing.slice(0,airingImportant),"Airing",true
				);
				drawSection(
					notAiring.slice(0,5*Math.ceil((20 - airingImportant)/5)),"Anime in Progress"
				)
			}
			else{
				let remainderAiring = airing.slice(0,airingImportant).filter(air => air.index >= 20);
				drawSection(mediaLists.slice(0,20 - remainderAiring.length).concat(remainderAiring),"Anime in Progress",true);
			}
		}
	}catch(e){errorHandler(e)}}
	authAPIcall(
		`query($name: String){
			Page(page:1){
				mediaList(type:ANIME,status_in:[CURRENT,REPEATING],userName:$name,sort:UPDATED_TIME_DESC){
					id
					priority
					scoreRaw: score(format: POINT_100)
					progress
					status
					media{
						id
						episodes
						coverImage{large color}
						title{userPreferred}
						nextAiringEpisode{episode timeUntilAiring}
					}
				}
			}
		}`,{name: whoAmI},function(data){
			localStorage.setItem("hohListPreview",JSON.stringify(data));
			buildPreview(data,true);
		}
	);
	buildPreview(JSON.parse(localStorage.getItem("hohListPreview")),false);
	}
	catch(e){
		errorHandler(e)
	}
}

let urlChangedDependence = false;

if(useScripts.dropdownOnHover && whoAmI){
	let addMouseover = function(){
		let navThingy = document.querySelector(".nav .user .el-dropdown-link");
		if(navThingy){
			navThingy.onmouseover = function(){
				let controls = document.getElementById(navThingy.attributes["aria-controls"].value);
				if(!controls || controls.style.display === "none"){
					navThingy.click()
				}
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover();
}

if(useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .link[href^="/user/"]`);
		if(navThingy){
			navThingy.style.position = "relative";
			let hackContainer = create("div","subMenuContainer",false,false,"position:relative;width:100%;min-height:50px;z-index:134;display:inline-flex;");
			navThingy.parentNode.insertBefore(hackContainer,navThingy);
			hackContainer.appendChild(navThingy);
			let subMenu = create("div","hohSubMenu",false,hackContainer);
			create("a","hohSubMenuLink","Favourites",subMenu)
				.href = "/user/" + whoAmI + "/favorites";
			let linkStats = create("a","hohSubMenuLink","Stats",subMenu);
			if(useScripts.mangaBrowse){
				linkStats.href = "/user/" + whoAmI + "/stats/manga/overview";
			}
			else{
				linkStats.href = "/user/" + whoAmI + "/stats/anime/overview";
			}
			create("a","hohSubMenuLink","Social",subMenu)
				.href = "/user/" + whoAmI + "/social";
			create("a","hohSubMenuLink","Reviews",subMenu)
				.href = "/user/" + whoAmI + "/reviews";
			create("a","hohSubMenuLink","Submissions",subMenu)
				.href = "/user/" + whoAmI + "/submissions";
			hackContainer.onmouseenter = function(){
				subMenu.style.display = "inline";
			}
			hackContainer.onmouseleave = function(){
				subMenu.style.display = "none";
			}
		}
		else{
			setTimeout(addMouseover,500);
		}
	};addMouseover();
}

let likeLoop = setInterval(function(){
	document.querySelectorAll(
		".activity-entry > .wrap > .actions .action.likes:not(.hohHandledLike)"
	).forEach(thingy => {
		thingy.classList.add("hohHandledLike");
		thingy.onmouseover = function(){
			if(thingy.classList.contains("hohLoadedLikes")){
				return
			}
			thingy.classList.add("hohLoadedLikes");
			if(!thingy.querySelector(".count")){
				return
			}
			if(parseInt(thingy.querySelector(".count").innerText) <= 5){
				return
			}
			const id = parseInt(thingy.parentNode.parentNode.querySelector(`[href^="/activity/"`).href.match(/\d+/));
			generalAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on TextActivity{
			likes{name}
		}
		... on MessageActivity{
			likes{name}
		}
		... on ListActivity{
			likes{name}
		}
	}
}`,
				{id: id},
				data => thingy.title = data.data.Activity.likes.map(like => like.name).join("\n")
			)
		}
	});
	if(useScripts.tweets){
		document.querySelectorAll(
			`.markdown a[href^="https://twitter.com/"]`
		).forEach(tweet => {
			if(tweet.classList.contains("hohEmbedded")){
				return
			};
			let tweetMatch = tweet.href.match(/^https:\/\/twitter\.com\/(.+?)\/status\/\d+/)
			if(!tweetMatch || tweet.href !== tweet.innerText){
				return
			}
			tweet.classList.add("hohEmbedded");
			tweet.innerHTML += `<blockquote class="twitter-tweet"${(document.body.classList.contains("site-theme-dark") ? " data-theme=\"dark\"" : "")}><p lang="en" dir="ltr"><a class="hohEmbedded" href="${tweet.href}">Loading tweet by ${tweetMatch[1]}...</p></blockquote>`;
			if(document.getElementById("automailTwitterEmbed")){
				document.getElementById("automailTwitterEmbed").remove()
			}
			let script = document.createElement("script");
			script.setAttribute("src","https://platform.twitter.com/widgets.js");
			script.setAttribute("async","");
			script.id = "automailTwitterEmbed";
			document.head.appendChild(script);
		})
	}
},400);

function singleActivityReplyLikes(id){
	let adder = function(data){
		if(!document.URL.includes("activity/" + id || !data)){
			return
		};
		let post = document.querySelector(".activity-entry > .wrap > .actions .action.likes");
		if(!post){
			setTimeout(function(){adder(data)},200);
			return;
		};
		post.classList.add("hohLoadedLikes");
		post.classList.add("hohHandledLike");
		if(post.querySelector(".count") && !(parseInt(post.querySelector(".count").innerText) <= 5)){
			post.title = data.data.Activity.likes.map(like => like.name).join("\n")
		};
		let smallAdder = function(){
			if(!document.URL.includes("activity/" + id)){
				return
			};
			let actionLikes = document.querySelectorAll(".activity-replies .action.likes");
			if(!actionLikes.length){
				setTimeout(smallAdder,200);
				return;
			}
			actionLikes.forEach((node,index) => {
				if(node.querySelector(".count") && !(parseInt(node.querySelector(".count").innerText) <= 5)){
					node.title = data.data.Activity.replies[index].likes.map(like => like.name).join("\n")
				}
			});
		};
		if(data.data.Activity.replies.length){
			smallAdder()
		}
	}
	generalAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on TextActivity{
			likes{name}
			replies{likes{name}}
		}
		... on MessageActivity{
			likes{name}
			replies{likes{name}}
		}
		... on ListActivity{
			likes{name}
			replies{likes{name}}
		}
	}
}`,
		{id: id},
		adder
	);
}

function forumLikes(){
	let URLstuff = location.pathname.match(/^\/forum\/thread\/(\d+)/);
	if(!URLstuff){
		return
	}
	let adder = function(data){
		if((!data) || (!location.pathname.includes("forum/thread/" + URLstuff[1]))){
			return
		}
		let button = document.querySelector(".footer .actions .button.like");
		if(!button){
			setTimeout(function(){adder(data)},200);
			return;
		}
		button.title = data.data.Thread.likes.map(like => like.name).join("\n");
	}
	generalAPIcall(`
query($id: Int){
	Thread(id: $id){
		likes{name}
	}
}`,
		{id: parseInt(URLstuff[1])},
		adder
	);
}

if(useScripts.youtubeFullscreen){
	setInterval(function(){
		document.querySelectorAll(".youtube iframe").forEach(video => {
			if(!video.hasAttribute("allowfullscreen")){
				video.setAttribute("allowfullscreen","true");
			}
		});
	},1000);
}

if(useScripts.mobileFriendly){
	let addReviewLink = function(){
		let footerPlace = document.querySelector(".footer .links section:last-child");
		if(footerPlace){
			let revLink = create("a",false,"Reviews",footerPlace,"display:block;padding:6px;");
			revLink.href = "/reviews/";
		}
		else{
			setTimeout(addReviewLink,500)
		}
	};addReviewLink();
}

let titleObserver = new MutationObserver(function(mutations){
	let title = document.querySelector("head > title").textContent;
	let titleMatch = title.match(/(.*)\s\((\d+)\)\s\((.*)\s\(\2\)\)(.*)/);//ugly nested paranthesis like "Tetsuwan Atom (1980) (Astro Boy (1980)) · AniList"
	if(titleMatch){
		//change to the form "Tetsuwan Atom (Astro Boy 1980) · AniList"
		document.title = titleMatch[1] + " (" + titleMatch[3] + " " + titleMatch[2] + ")" + titleMatch[4];
	}
	if(document.URL.match(/^https:\/\/anilist\.co\/search\/characters/) && title !== "Find Characters · AniList"){
		document.title = "Find Characters · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/staff/) && title !== "Find Staff · AniList"){
		document.title = "Find Staff · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/studios/) && title !== "Find Studios · AniList"){
		document.title = "Find Studios · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/anime/) && title !== "Find Anime · AniList"){
		document.title = "Find Anime · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/manga/) && title !== "Find Manga · AniList"){
		document.title = "Find Manga · AniList"
	};
	if(useScripts.SFWmode && title !== "Table of Contents"){
		document.title = "Table of Contents"
	}
});
if(document.title){
	titleObserver.observe(document.querySelector("head > title"),{subtree: true, characterData: true, childList: true })
}

function handleScripts(url,oldURL){
	if(url === "https://anilist.co/settings/apps"){
		settingsPage()
	}
	else if(url === "https://anilist.co/notifications" && useScripts.notifications){
		enhanceNotifications();
		return;
	}
	else if(url === "https://anilist.co/reviews" && useScripts.reviewConfidence){
		addReviewConfidence();
		return;
	}
	else if(url === "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		selectMyThreads()
	}
	else if(url === "https://anilist.co/settings/import" && useScripts.moreImports){
		moreImports()
	}
	else if(url === "https://anilist.co/terms" && useScripts.termsFeed){
		termsFeed()
	}
	else if(url === "https://anilist.co/site-stats"){
		randomButtons()
	}
	else if(url === "https://anilist.co/404"){
		possibleBlocked(oldURL)
	}
	if(url.match(/^https:\/\/anilist\.co\/(anime|manga)\/\d*\/[\w\-]*\/social/)){
		if(useScripts.socialTab){
			enhanceSocialTab();
			if(useScripts.accessToken){
				enhanceSocialTabFeed()
			}
		};
		if(useScripts.activityTimeline){
			addActivityTimeline()
		}
	}
	else{
		stats.element = null;
		stats.count = 0;
		stats.scoreSum = 0;
		stats.scoreCount = 0;
	}
	if(
		url.match(/\/stats\/?/)
		&& useScripts.moreStats
	){
		addMoreStats()
	};
	if(
		url.match(/^https:\/\/anilist\.co\/home#access_token/)
	){
		let tokenList = location.hash.split("&").map(a => a.split("="));
		useScripts.accessToken = tokenList[0][1];
		useScripts.save();
		location.replace(location.protocol + "//" + location.hostname + location.pathname);
	};
	if(
		url.match(/^https:\/\/anilist\.co\/home#aniscripts-login/)
	){
		if(useScripts.accessToken){
			alert("Already authorized. You can rewoke this under 'apps' in your Anilist settings")
		}
		else{
			location.href = authUrl
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/user/)){
		if(useScripts.completedScore || useScripts.droppedScore){//we also want this script to run on user pages
			addCompletedScores()
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		};
		let adder = function(){
			let banner = document.querySelector(".banner");
			if(banner && banner.style.backgroundImage !== "url(\"undefined\")"){
				let bannerLink = create("a","hohDownload","⭳",banner);
				const linkPlace = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
				bannerLink.href = linkPlace;
				bannerLink.title = "Banner Link";
				if(linkPlace === "null"){
					bannerLink.style.display = "none"
				}
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.milestones){
			meanScoreBack()
		};
		if(useScripts.profileBackground){
			profileBackground()
		};
		if(useScripts.customCSS){
			addCustomCSS()
		}
	}
	else{
		customStyle.textContent = ""
	}
	if(
		url.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)
	){
		if(useScripts.forumComments){
			enhanceForum()
		}
		if(useScripts.embedHentai){
			embedHentai()
		};
		forumLikes()
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/)
	){
		if(useScripts.myThreads){
			addMyThreadsLink()
		}
	}
	else if(
		url.includes("https://anilist.co/forum/recent?media=")
	){
		addForumMedia()
	}
	else if(url.match(/^https:\/\/anilist\.co\/staff\/.*/)){
		if(useScripts.staffPages){
			enhanceStaff()
		}
		if(useScripts.replaceStaffRoles){
			replaceStaffRoles()
		}
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/character\/.*/)
		&& useScripts.characterFavouriteCount
	){
		enhanceCharacter()
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/studio\/.*/)
	){
		if(useScripts.studioFavouriteCount){
			enhanceStudio()
		}
		if(useScripts.CSScompactBrowse){
			addStudioBrowseSwitch()
		};
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/edit/)
		&& useScripts.enumerateSubmissionStaff
	){
		enumerateSubmissionStaff()
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/.*\/social/)
	){
		if(useScripts.CSSfollowCounter){
			addFollowCount()
		}
		addSocialThemeSwitch();
	};
	if(
		url.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/)
	){
		drawListStuff();
		if(useScripts.viewAdvancedScores){
			viewAdvancedScores(url)
		}
		if(useScripts.yearStepper){
			yearStepper()
		}
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/)
		&& useScripts.comparissionPage
	){
		addComparissionPage()
	}
	else{
		let possibleHohCompareRemaining = document.querySelector(".hohCompare");
		if(possibleHohCompareRemaining){
			possibleHohCompareRemaining.remove()
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/search/)){
		if(useScripts.CSScompactBrowse){
			addCompactBrowseSwitch()
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/search\/characters/)){
		if(useScripts.characterFavouriteCount){
			enhanceCharacterBrowse()
		};
		document.title = "Find Characters · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/staff/)){
		if(useScripts.staffPages){
			enhanceStaffBrowse()
		};
		document.title = "Find Staff · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/studios/)){
		document.title = "Find Studios · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/anime/)){
		document.title = "Find Anime · AniList";
		setTimeout(() => {
			if(document.URL.match(/^https:\/\/anilist\.co\/search\/anime/)){
				document.title = "Find Anime · AniList"
			}
		},100);
		if(useScripts.browseFilters){
			addBrowseFilters("anime")
		}
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/manga/)){
		document.title = "Find Manga · AniList";
		if(useScripts.browseFilters){
			addBrowseFilters("manga");
		};
	};
	let mangaAnimeMatch = url.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
	if(mangaAnimeMatch){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/?/)){
				return
			};
			let banner = document.querySelector(".banner");
			if(banner){
				let bannerLink = create("a","hohDownload","⭳",banner);
				bannerLink.href = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.tagDescriptions){
			enhanceTags()
		};
		if(useScripts.subTitleInfo){
			addSubTitleInfo()
		}
		if(useScripts.dubMarker && mangaAnimeMatch[1] === "anime"){
			dubMarker()
		}
		else if(useScripts.mangaGuess && mangaAnimeMatch[1] === "manga"){
			mangaGuess(false,parseInt(mangaAnimeMatch[2]))
		};
		if(useScripts.mangaGuess && mangaAnimeMatch[1] === "anime"){
			mangaGuess(true)
		};
		if(useScripts.MALscore || useScripts.MALserial || useScripts.MALrecs){
			addMALscore(mangaAnimeMatch[1],mangaAnimeMatch[2])
		};
		if(useScripts.accessToken){
			addRelationStatusDot(mangaAnimeMatch[2])
		};
		if(useScripts.entryScore && whoAmI){
			addEntryScore(mangaAnimeMatch[2])
		};
		if(useScripts.SFWmode){
			cencorMediaPage(mangaAnimeMatch[2])
		};
		let titleAliases = JSON.parse(localStorage.getItem("titleAliases"));
		if(useScripts.shortRomaji){
			titleAliases = shortRomaji.concat(titleAliases);
		};
		if(document.getElementById("hohAliasHeading")){
			document.getElementById("hohAliasHeading").nextSibling.style.display = "block";
			document.getElementById("hohAliasHeading").remove();
		};
		if(titleAliases){
			const urlID = mangaAnimeMatch[2];
			titleAliases.forEach(alias => {//can't just use a find, the latest alias takes priority (find in reverse?)
				if(alias[0] === "css/"){
					return;
				};
				if(alias[0].substring(7,alias[0].length-1) === urlID){
					let newState = "/" + mangaAnimeMatch[1] + "/" + urlID + "/" + safeURL(alias[1]) + "/";
					if(mangaAnimeMatch[4]){
						newState += mangaAnimeMatch[4]
					};
					history.replaceState({},"",newState);
					current = document.URL;
					let titleReplacer = () => {
						if(urlChangedDependence === false){//I have to kill these global flags with fire some day
							return;
						};
						let mainTitle = document.querySelector("h1");//fragile, just like your heterosexuality
						if(mainTitle){
							let newHeading = create("h1","#hohAliasHeading",alias[1]);
							mainTitle.parentNode.insertBefore(newHeading,mainTitle);
							mainTitle.style.display = "none";
							//mainTitle.innerText = alias[1];
							return;
						}
						else{
							urlChangedDependence = true;
							setTimeout(titleReplacer,100);
						}
					};
					urlChangedDependence = true;
					titleReplacer();
				};
			});
		};
		if(useScripts.socialTab){
			scoreOverviewFixer()
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/home\/?$/)){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		};
		if(useScripts.betterListPreview && whoAmI && useScripts.accessToken && (!useScripts.mobileFriendly)){
			betterListPreview()
		};
		if(useScripts.progressBar){
			addProgressBar()
		};
		if(
			(useScripts.feedCommentFilter && (!useScripts.mobileFriendly))
			|| localStorage.getItem("blockList")
			|| useScripts.blockWord
			|| useScripts.statusBorder
		){
			addFeedFilters()
		};
		if(useScripts.expandRight){
			expandRight()
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.hideAWC){
			addForumMediaNoAWC()
		}
		else if(useScripts.forumMedia){
			addForumMedia()
		};
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		};
		if(useScripts.dblclickZoom){
			addDblclickZoom()
		};
		if(useScripts.hideGlobalFeed){
			hideGlobalFeed()
		};
		if(useScripts.betterReviewRatings){
			betterReviewRatings()
		};
		if(useScripts.homeScroll){
			let homeButton = document.querySelector(".nav .link[href=\"/home\"]");
			if(homeButton){
				homeButton.onclick = () => {
					if(document.URL.match(/^https:\/\/anilist\.co\/home\/?$/)){
						window.scrollTo({top: 0,behavior: "smooth"})
					}
				}
			}
		};
		linkFixer();
	}
	let activityMatch = url.match(/^https:\/\/anilist\.co\/activity\/(\d+)/);
	if(activityMatch){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		};
		if(useScripts.activityTimeline){
			addActivityLinks(activityMatch[1])
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.showMarkdown){
			showMarkdown(activityMatch[1])
		};
		singleActivityReplyLikes(parseInt(activityMatch[1]))
	};
	if(url.match(/^https:\/\/anilist\.co\/edit/)){//seems to give mixed results. At least it's better than nothing
		window.onbeforeunload = function(){
			return "Page refresh has been intercepted to avoid an accidental loss of work"
		}
	};
	if(useScripts.notifications && useScripts.accessToken && !useScripts.mobileFriendly){
		notificationCake()
	}
};

const useScriptsDefinitions = [
{id: "notifications",
	description: "Improve notifications",
	categories: ["Notifications","Login"]
},{id: "hideLikes",
	description: "Hide like notifications. Will not affect the notification count",
	categories: ["Notifications"]
},{id: "settingsTip",
	description: "Show a notice on the notification page for where the script settings can be found",
	categories: ["Notifications"]
},{id: "dismissDot",
	description: "Show a spec to dismiss notifications when signed in",
	categories: ["Notifications","Login"]
},{id: "socialTab",
	description: "Media social tab average score, progress and notes",
	categories: ["Media"]
},{id: "forumComments",
	description: "Add a button to collapse comment threads in the forum",
	categories: ["Forum"]
},{id: "forumMedia",
	description: "Add the tagged media to the forum preview on the home page",
	categories: ["Forum"]
},{id: "mangaBrowse",
	description: "Make browse default to manga",
	categories: ["Browse"]
},{id: "ALbuttonReload",
	description: "Make the 'AL' button reload the feeds on the homepage",
	categories: ["Navigation"]
},{id: "draw3x3",
	description: "Add a button to lists to create 3x3's from list entries. Click the button, and then select nine entries",
	categories: ["Lists"]
},{id: "aniscriptsAPI",
	description: "Enable an API for other scripts to control automail [Don't enable this unless you know what you are doing]",
	categories: ["Script","Login"]
},{id: "mobileFriendly",
	description: "Mobile Friendly mode. Disables some modules not working properly on mobile, and adjusts others",
	categories: ["Navigation","Script"]
},{id: "tagDescriptions",
	description: "Show the definitions of tags when adding new ones to an entry",
	categories: ["Media"]
},{id: "MALscore",
	description: "Add MAL scores to media",
	categories: ["Media"]
},{id: "MALserial",
	description: "Add MAL serialization info to manga",
	categories: ["Media"]
},{id: "MALrecs",
	description: "Add MAL recs to media",
	categories: ["Media"]
},{id: "subTitleInfo",
	description: "Add basic data below the title on media pages",
	categories: ["Media"]
},{id: "entryScore",
	description: "Add your score and progress to anime pages",
	categories: ["Media","Login"]
},{id: "reviewConfidence",
	description: "Add confidence scores to reviews"
},{id: "betterReviewRatings",
	description: "Add the total number of ratings to review ratings on the home page"
},{id: "activityTimeline",
	description: "Link your activities in the social tab of media, and between individual activities",
	categories: ["Media","Navigation"]
},{id: "browseFilters",
	description: "Add more sorting options to browse",
	categories: ["Browse"]
},{id: "enumerateSubmissionStaff",
	description: "Enumerate the multiple credits for staff in the submission form to help avoid duplicates",
	categories: ["Submissions","Profiles"]
},{id: "replaceStaffRoles",
	description: "Add sorting to staff pages",
	categories: ["Media","Login"]
},{id: "completedScore",
	description: "Show the score on the activity when people complete something",
	categories: ["Feeds"]
},{id: "droppedScore",
	description: "Show the score on the activity when people drop something",
	categories: ["Feeds"]
},{id: "tagIndex",
	description: "Show an index of custom tags on anime and manga lists",
	categories: ["Lists"]
},{id: "yearStepper",
	description: "Add buttons to step the year slider up and down",
	categories: ["Lists"]
},{id: "CSSfollowCounter",
	description: "Follow count on social page",
	categories: ["Profiles"],
},{
	id: "dubMarker",
	subSettings: ["dubMarkerLanguage"],
	description: "Add a notice on top of the other data on an anime page if a dub is available (works by checking for voice actors)",
	categories: ["Media"]
},{
	id: "dubMarkerLanguage",
	requires: ["dubMarker"],
	description: "",
	type: "select",
	categories: ["Media"],
	values: ["English","German","Italian","Spanish","French","Korean","Portuguese","Hebrew","Hungarian"]
},{id: "mangaGuess",
	description: "Make a guess for the number of chapters for releasing manga",
	categories: ["Media"]
},{id: "CSSmobileTags",
	description: "Don't hide tags from media pages on mobile",
	categories: ["Media"]
},{id: "moreStats",
	description: "Show an additional tab on the stats page",
	categories: ["Stats"]
},{id: "replaceNativeTags",
	description: "Full lists for tags, staff and studios in stats",
	categories: ["Stats"]
},{id: "allStudios",
	description: "Include companies that aren't animation studios in the extended studio table",
	categories: ["Stats"]
},{id: "noRewatches",
	description: "Don't include progress from rewatches/rereads in stats",
	categories: ["Stats"]
},{id: "hideCustomTags",
	description: "Hide the custom tags tables by default",
	categories: ["Stats"]
},{id: "negativeCustomList",
	description: "Add an entry in the custom tag tables with all media not on a custom list",
	categories: ["Stats"]
},{id: "globalCustomList",
	description: "Add an entry in the custom tag tables with all media",
	categories: ["Stats"]
},{id: "timeToCompleteColumn",
	description: "Add 'time to complete' info to the tag tables",
	categories: ["Stats"]
},{id: "comparissionPage",
	description: "Replace the native comparison feature",
	categories: ["Lists","Profiles"]
},{id: "CSSsmileyScore",
	description: "Give smiley ratings distinct colours [from userstyle]",
	categories: ["Lists","Media"]
},{id: "CSSexpandFeedFilters",
	description: "Expand the feed filters",
	categories: ["Feeds"]
},{id: "hideGlobalFeed",
	description: "Hide the global feed",
	categories: ["Feeds"]
},{id: "feedCommentFilter",
	description: "Add filter options to the feeds to hide posts with few comments or likes",
	categories: ["Feeds"]
},{id: "statusBorder",
	description: "Colour code the right border of activities by status",
	categories: ["Feeds"]
},{id: "blockWord",
	description: "Hide status posts containing this word:",
	categories: ["Feeds"]
},{
	id: "blockWordValue",
	requires: ["blockWord"],
	description: "",
	type: "text",
	categories: ["Feeds"]
},{id: "profileBackground",
	description: "Enable profile backgrounds",
	categories: ["Profiles","Login"]
},{
	id: "profileBackgroundValue",
	requires: ["profileBackground"],
	description: "",
	visible: false,
	type: "text",
	categories: ["Profiles"]
},{id: "colourPicker",
	description: "Add a colour picker in the footer for adjusting the site themes",
	categories: ["Script"]
},{id: "progressBar",
	description: "Add progress bars to the list previews",
	categories: ["Feeds"]
},{id: "tweets",
	description: "Embed linked tweets",
	categories: ["Feeds"]
},{id: "embedHentai",
	description: "Make cards for links to age restricted content",
	categories: ["Feeds"]
},{id: "betterListPreview",
	description: "Alternative list preview",
	categories: ["Feeds","Lists","Login"]
},{id: "homeScroll",
	description: "Make the 'home' button scroll to the top on the home feed",
	categories: ["Feeds"]
},{id: "CSSfavs",
	description: "Use 5-width favourite layout [from userstyle]",
	categories: ["Profiles"]
},{id: "CSScompactBrowse",
	description: "Use a compact view in the browse section. Also makes various list views available",
	categories: ["Browse"]
},{id: "customCSS",
	description: "Enable custom profile CSS",
	categories: ["Profiles","Login"]
},{id: "CSSgreenManga",
	description: "Green titles for manga",
	categories: ["Media","Feeds"]
},{id: "cleanSocial",
	description: "Give a better space to the following list on the social tab [under development]",
	categories: ["Media"]
},{id: "limitProgress10",
	description: "Limit the 'in progress' sections to 10 entries",
	categories: ["Feeds"]
},{id: "limitProgress8",
	description: "Limit the 'in progress' sections to 8 entries",
	categories: ["Feeds"]
},{id: "expandDescriptions",
	description: "Automatically expand descriptions",
	categories: ["Media"]
},{id: "showRecVotes",
	description: "Always show the recommendation voting data",
	categories: ["Media"]
},{id: "myThreads",
	description: "Add a 'my threads' link in the forum",
	categories: ["Forum","Profiles"]
},{id: "hideAWC",
	description: "Hide AWC threads from the forum preview on the home page. Number of AWC-free threads to display:",
	categories: ["Forum"]
},{
	id: "forumPreviewNumber",
	requires: ["hideAWC"],
	description: "",
	type: "number",
	"min": 0,
	"max": 50,
	categories: ["Forum"]
},{id: "expandRight",
	description: "Load the expanded view of 'in progress' in the usual place instead of full width if left in that state [weird hack]",
	categories: ["Feeds"]
},{id: "noImagePolyfill",
	description: "Add fallback text for missing images in the sidebar and favourite sections",
	categories: ["Feeds","Profiles"]
},{id: "dropdownOnHover",
	description: "Expand the user menu in the nav on hover instead of click",
	categories: ["Navigation"]
},{id: "shortRomaji",
	description: "Short romaji titles for everyday use. Life is too short for light novel titles",
	categories: ["Feeds","Profiles","Lists"]
},{id: "CSSprofileClutter",
	description: "Remove clutter from profiles (milestones, history chart, genres)",
	categories: ["Profiles"]
},{id: "CSSdecimalPoint",
	description: "Give whole numbers a \".0\" suffix when using the 10 point decimal scoring system",
	categories: ["Lists"]
},{id: "viewAdvancedScores",
	description: "View advanced scores",
	categories: ["Lists"]
},{id: "dblclickZoom",
	description: "Double click activities to zoom",
	categories: ["Feeds"]
},{id: "youtubeFullscreen",
	description: "Allow Youtube videos to play in fullscreen mode",
	categories: ["Script"]
},{id: "termsFeed",
	description: "Add a low bandwidth feed to the https://anilist.co/terms page",
	categories: ["Feeds","Login"]
},{id: "termsFeedNoImages",
	description: "Do not load images on the low bandwidth feed",
	categories: ["Feeds","Login"]
},{id: "CSSbannerShadow",
	description: "Remove banner shadows",
	categories: ["Profiles","Media"]
},{id: "milestones",
	description: "Add total episodes and volumes to profile milestones",
	categories: ["Profiles"]
},{id: "CSSdarkDropdown",
	description: "Use a dark menu dropdown in dark mode",
	categories: ["Navigation"]
},{id: "moreImports",
	description: "Add more list import and list export options",
	categories: ["Script","Login"]
},{id: "plussMinus",
	description: "Add + and - buttons to quickly change scores on your list",
	categories: ["Lists","Login"]
},{id: "SFWmode",
	description: "A less flashy version of the site for school or the workplace [under development]",
	categories: ["Script"]
},{id: "CSSverticalNav",
	description: "Alternative browse mode [with vertical navbar by Kuwabara]",
	categories: ["Navigation"]
}
];
let current = "";
let mainLoop = setInterval(() => {
	if(document.URL !== current){
		urlChangedDependence = false;
		let oldURL = current + "";
		current = document.URL;
		handleScripts(current,oldURL)
	};
	if(useScripts.expandDescriptions){
		let expandPossible = document.querySelector(".description-length-toggle");
		if(expandPossible){
			expandPossible.click()
		}
	}
},200);
let tagDescriptions = {};
let expired = true;
let tagCache = localStorage.getItem("hohTagCache");
if(tagCache){
	tagCache = JSON.parse(tagCache);
	expired = (NOW() - tagCache.updated) > 3*60*60*1000//three hours
};
if(expired){
	generalAPIcall("query{MediaTagCollection{name description}}",{},data => {
		data.data.MediaTagCollection.forEach(tag => {
			tagDescriptions[tag.name] = tag.description
		});
		localStorage.setItem("hohTagCache",JSON.stringify({
			tags: tagDescriptions,
			updated: NOW()
		}))
	})
}
else{
	tagDescriptions = tagCache.tags
};
console.log("Automail " + scriptInfo.version);
Object.keys(localStorage).forEach(key => {
	if(key.includes("hohListActivityCall")){
		let cacheItem = JSON.parse(localStorage.getItem(key));
		if(cacheItem){
			if(NOW() > cacheItem.time + cacheItem.duration){
				localStorage.removeItem(key)
			}
		}
	}
	else if(key === "aniscriptsUsed"){
		localStorage.removeItem(key)
	}
});

if(useScripts.aniscriptsAPI){
	if(document.aniscriptsAPI){
		console.warn("Multiple copies of Automail running? Shutting down this instance.");
		clearInterval(mainLoop);
		clearInterval(likeLoop);
	}
	document.aniscriptsAPI = {
		scriptInfo: scriptInfo,
		generalAPIcall: generalAPIcall,//query,variables,callback[,cacheKey[,timeFresh[,useLocalStorage]]]
		authAPIcall: authAPIcall,
		queryPacker: queryPacker,
		settings: useScripts,
		logOut: function(){useScripts.accessToken = "";useScripts.save()}
	}
}

})();
