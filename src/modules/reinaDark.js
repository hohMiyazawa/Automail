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
	description: "Add a High Contrast Dark a site theme [by Reina] [work in progress]",
	extendedDescription: `
More info and standalone versions: https://anilist.co/activity/136403139
`,
	isDefault: true,
	importance: 1,
	categories: ["Script","Newly Added"],
	visible: true,
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
  }
  #nav {
    background: rgb(20, 25, 31);
    color: #eaeeff!important;
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
  /* Small screens adjustment */
  .page-content > .container {
    @media screen and (max-width: 600px) {
      padding-left: 2px;
      padding-right: 2px;
    }
  }
  /* Coloured Text */
  .name[data-v-5e514b1e] {
    color: rgb(var(--color-blue));
  }
  .site-theme-dark .user-page-unscoped.pink {
    --color-blue: 252, 157, 214;
  }
  /* Dropdown menu */
  .el-dropdown-menu.el-popper.el-dropdown-menu--medium {
    width: 150px;
    text-align: center;
    background-color: rgb(var(--color-foreground-grey-dark))!important;
    box-shadow: 0 1px 10px 0 rgba(var(--color-shadow-blue));
  }
  .el-dropdown-menu.el-popper.el-dropdown-menu--medium .el-dropdown-menu__item:hover {
    background-color: rgb(var(--color-foreground-alt))!important;
  }
  .el-dropdown-menu.el-popper.el-dropdown-menu--medium .el-dropdown-menu__item--divided {
    border-top: 3px solid rgb(var(--color-foreground-alt));
    width: 90%;
    margin: auto;
  }
  .el-dropdown-menu.el-popper.el-dropdown-menu--medium .el-dropdown-menu__item--divided:before {
    background-color: rgb(var(--color-foreground-grey-dark))!important;
  }
  .el-dropdown-menu.el-popper.el-dropdown-menu--medium.activity-extras-dropdown {
    text-align: left;
  }
  /* Announcement */
  .announcement {
    background-color: rgb(var(--color-blue-800))!important;
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
			darkContrastSwitch.title = "High Contrast Dark";//not quite the same as the native tooltip, but that's a minor issue that can be fixed later
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
