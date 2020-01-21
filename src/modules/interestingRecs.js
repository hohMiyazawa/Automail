exportModule({
	id: "interestingRecs",
	description: "Add a 'interesting' filter to the recommendations page [under development]",
	isDefault: true,
	categories: ["Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/https:\/\/anilist\.co\/recommendations/)
	},
	code: function(){
		let buttonInserter = function(){
			if(!document.URL.match(/https:\/\/anilist\.co\/recommendations/)){
				return
			}
			let switchL = document.querySelector(".page-content .switch .options");
			if(switchL){
			}
			else{
				setTimeout(buttonInserter,200)
			}
		};buttonInserter()
	}
})
