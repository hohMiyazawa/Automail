let likeLoop = setInterval(function(){
	document.querySelectorAll(
		".activity-entry > .wrap > .actions .action.likes:not(.hohHandledLike)"
	).forEach(thingy => {
		thingy.classList.add("hohHandledLike");
		thingy.onmouseover = function(){
			if(thingy.classList.contains("hohLoadedLikes")){
				return
			}
			thingy.classList.add("hohLoadedLikes");
			if(!thingy.querySelector(".count")){
				return
			}
			if(parseInt(thingy.querySelector(".count").innerText) <= 5){
				return
			}
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
				data => thingy.title = data.data.Activity.likes.map(like => like.name).join("\n")
			)
		}
	});
	if(useScripts.tweets){
		document.querySelectorAll(
			`.markdown a[href^="https://twitter.com/"]`
		).forEach(tweet => {
			if(tweet.classList.contains("hohEmbedded")){
				return
			};
			let tweetMatch = tweet.href.match(/^https:\/\/twitter\.com\/(.+?)\/status\/\d+/)
			if(!tweetMatch || tweet.href !== tweet.innerText){
				return
			}
			tweet.classList.add("hohEmbedded");
			tweet.innerHTML += `<blockquote class="twitter-tweet"${(document.body.classList.contains("site-theme-dark") ? " data-theme=\"dark\"" : "")}><p lang="en" dir="ltr"><a class="hohEmbedded" href="${tweet.href}">Loading tweet by ${tweetMatch[1]}...</p></blockquote>`;
			if(document.getElementById("automailTwitterEmbed")){
				document.getElementById("automailTwitterEmbed").remove()
			}
			let script = document.createElement("script");
			script.setAttribute("src","https://platform.twitter.com/widgets.js");
			script.setAttribute("async","");
			script.id = "automailTwitterEmbed";
			document.head.appendChild(script);
		})
	}
},400);
