exportModule({
	id: "forumLikes",
	description: "Add a full list of likes to forum threads",
	isDefault: true,
	categories: ["Forum"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return /^https:\/\/anilist\.co\/forum\/thread\/.*/.test(url)
	},
	code: function(){
		let URLstuff = location.pathname.match(/^\/forum\/thread\/(\d+)/);
		if(!URLstuff){
			return
		}
		let adder = function(data){
			if((!data) || (!location.pathname.includes("forum/thread/" + URLstuff[1]))){
				return
			}
			let button = document.querySelector(".footer .actions .like-wrap .button");
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
		)
	}
})
