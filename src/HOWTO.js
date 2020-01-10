//create your own module
//make a javascript file, called yourModule.js, in the directory "modules"
//include the following code:

exportModule({
	id: "howto",//an unique identified for your module
	description: "what your module does",
	isDefault: false,
	categories: ["Script"],//what categories your module belongs in
	visible: false,//if the module should be visible in the settings
	urlMatch: function(url,oldUrl){//a function that returns true when on the parts of the site you want it to run. url is the current url, oldUrl is the previos page
		//example: return url === "https://anilist.co/reviews"
		return false;
	},
	code: function(){
		//your code goes here
	}
})
//your module can also have extra code and utility functions
})()
