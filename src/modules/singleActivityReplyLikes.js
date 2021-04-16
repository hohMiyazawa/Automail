exportModule({
	id: "singleActivityReplyLikes",
	description: "Add like tooltips to all replies when viewing a single activity",
	isDefault: true,
	categories: ["Feeds"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/activity\/(\d+)/)
	},
	code: function singleActivityReplyLikes(){
		let id = parseInt(document.URL.match(/^https:\/\/anilist\.co\/activity\/(\d+)/)[1])
		let adder = function(data){
			if(!data){
				return//private actitivites, mostly. Doesn't matter as there aren't many people there.
			}
			if(!document.URL.includes("activity/" + id || !data)){
				return
			};
			let post = document.querySelector(".activity-entry > .wrap > .actions .action.likes");
			if(!post){
				setTimeout(function(){adder(data)},200);
				return
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
					return
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
		)
	}
})
