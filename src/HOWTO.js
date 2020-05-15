//create your own module
//make a javascript file, called yourModule.js, in the directory "modules"
//include the following code:

exportModule({
	id: "howto",//an unique identified for your module
	description: "what your module does",
	extendedDescription: `
A long description of what your module does.

This appears when people click the "more info" icon (🛈) on the settings page.
	`,
	isDefault: false,
	importance: 0,//a number, which determines the order of the settings page. Higher numbers are more important. Leave it as 0 if unsure.
	categories: ["Script"],//what categories your module belongs in
	//Notifications, Feeds, Forum, Lists, Profiles, Stats, Media, Navigation, Browse, Script, Login, Newly Added
	visible: false,//if the module should be visible in the settings
	urlMatch: function(url,oldUrl){//a function that returns true when on the parts of the site you want it to run. url is the current url, oldUrl is the previous page
		//example: return url === "https://anilist.co/reviews"
		return false;
	},
	code: function(){
		//your code goes here
	},
	css: ""//css rules you need
})

//your module can also have extra code and utility functions
