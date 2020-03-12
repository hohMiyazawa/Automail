m4_divert(-1)m4_dnl
m4_changequote(<m4<,>m4>)
m4_define(AUTOMAIL_VERSION,9.15)
m4_divert(0)m4_dnl
// ==UserScript==
// @name         Automail
// @namespace    http://tampermonkey.net/
// @version      AUTOMAIL_VERSION
// @description  Extra parts for Anilist.co
// @author       hoh
// @match        https://anilist.co/*
// @grant        GM_xmlhttpRequest
// @license      GPLv3
// ==/UserScript==
(function(){
"use strict";
const scriptInfo = {
	"version" : "AUTOMAIL_VERSION",
	"name" : "Automail",
	"link" : "https://greasyfork.org/en/scripts/370473-automail",
	"repo" : "https://github.com/hohMiyazawa/Automail",
	"firefox" : "https://addons.mozilla.org/en-US/firefox/addon/aniscripts/",
	"chrome" : "NO KNOWN BUILDS",
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
 1. Settings
 2. CSS
 3. tools and helper functions
 4. The modules, as individual callable functions
 5. The URL matcher, for making the modules run at the right sites
 6. Module descriptions
*/
m4_include(settings.js)
m4_include(alias.js)
//a shared style node for all the modules. Most custom classes are prefixed by "hoh" to avoid collisions with native Anilist classes
let style = document.createElement("style");
style.id = "aniscripts-styles";
style.type = "text/css";

//The default colour is rgb(var(--color-blue)) provided by Anilist, but rgb(var(--color-green)) is preferred for things related to manga
style.textContent = `
m4_include(css/global.css)
`;
let documentHead = document.querySelector("head");
if(documentHead){
	documentHead.appendChild(style)
}
else{
	return//xml documents or something. At least it's not a place where the script can run
}
m4_include(conditionalStyles.js)
m4_include(utilities.js)
m4_include(purify.js)
m4_include(graphql.js)
m4_include(localforage.js)
m4_include(cache.js)
m4_include(controller.js)
m4_include(build/userModules.js)
m4_include(HOWTO.js)
})()
