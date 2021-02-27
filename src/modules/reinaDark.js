// To Reina: make changes to all places marked "TODO"
//TODO: remove the "TODO" instructions
// SPDX-FileCopyrightText: 2021 Reina
// SPDX-License-Identifier: MIT
/*
Copyright (c) 2021 Reina

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice (including the next paragraph) shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
exportModule({
	id: "reinaDark",
	description: "Add a High Contrast Dark a site theme [by Reina] [work in progress, CSS to be added]",//TODO remove the work-in-progress part
	isDefault: true,//NOTE: only enables if the switch is added. Wheter to actually use the mode is determined by useScripts.reinaDarkEnable
	importance: 1,
	categories: ["Script","Newly Added"],//what categories your module belongs in
	visible: false,//TODO flip this to true, so people can use this module
	urlMatch: function(url,oldUrl){return false},//dummy, not reserved for any page in particular
	code: function(){},//dummy, this has to run on startup anyway
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
TODO: add your style here
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
			let darkContrastSwitch = create("div",["el-tooltip","theme-preview","dark-contrast"],"A",siteThemeSwitch);
			darkContrastSwitch.title = "High Contrast Dark";//not quite the same as the native tooltip, but that's a minor issue that can be fixed later
			darkContrastSwitch.onclick = function(){
				if(useScripts.reinaDarkEnable){
					useScripts.reinaDarkEnable = false;
					useScripts.save();
					darkContrastStyle.textContent = ""
				}
				else{
					useScripts.reinaDarkEnable = true;
					useScripts.save();
					darkContrastStyle.textContent = style
				}
			}
		}
	};
	adder()
}
