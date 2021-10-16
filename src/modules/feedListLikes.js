exportModule({
	id: "feedListLikes",
	description: "Add a full list of likes to feed posts",
	isDefault: true,
	categories: ["Feeds"],
	visible: false
})

let likeLoop = setInterval(function(){
	document.querySelectorAll(
		".activity-entry > .wrap > .actions .action.likes:not(.hohHandledLike)"
	).forEach(thingy => {
		thingy.classList.add("hohHandledLike");
		thingy.onmouseover = function(){
			if(!thingy.querySelector(".count")){
				return
			}
			let likeCount = parseInt(thingy.querySelector(".count").innerText);
			if(likeCount <= 5){
				return
			}
			if(thingy.classList.contains("hohLoadedLikes")){
				let dataSetCache = parseInt(thingy.dataset.cacheLikeCount);
				if(isNaN(dataSetCache)){//API query already in progress
					return
				}
				if(dataSetCache === likeCount){//nothing changed
					return
					//in theory, someone *could* have retracted a like, and someone else been added, but it doesn't really happen all that often.
					//at least, this is better than what was previously done, namely never refetching the data at all, even if the count changed
				}
			}
			thingy.classList.add("hohLoadedLikes");
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
				data => {
					thingy.title = data.data.Activity.likes.map(like => like.name).join("\n");
					thingy.dataset.cacheLikeCount = data.data.Activity.likes.length
				}
			)
		}
	});
},400);
