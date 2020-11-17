exportModule({
	id: "autoLogin",
	description: "Attempt automatic login when visiting anilist.co [read description]",
	extendedDescription: `
Normally, Automail will stay signed in even if you close your browser.

However, if you have all persistant storage turned off, that's not possible.
To use features that requires an Anilist login, you will normally have to click the "sign in" link on the settings page each time.

In those cases, this module tries to automatically sign in when first visiting the page, potentially saving you a few clicks.

IMPORTANT DETAILS FOR THIS MODULE TO WORK!

This module is off by default. In some cases of non-persistance storage, Automail will always load at default settings, thus checking this checkbox will do absolutely nothing.
To change the defaults:

Option a) When building from source edit "src/modules/autoLogin.js" so "isDefault" is set to true

Option b) Manually add your access token in the file "src/settings.js". It's a field in the "useScripts" object.

Option c) If you just have the compiled JS file "automail.js", search for "I EAT PANCAKES" in the code, and change "isDefault" line below to true
`,
	isDefault: false,
	categories: ["Script"],
	visible: true
})
