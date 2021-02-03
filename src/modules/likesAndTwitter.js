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
	if(useScripts.tweets){//not enabled by default
		document.querySelectorAll(
			`.markdown a[href^="https://twitter.com/"][href*="/status/"]`
		).forEach(tweet => {
			if(tweet.classList.contains("hohEmbedded")){
				return
			};
			let tweetMatch = tweet.href.match(/^https:\/\/twitter\.com\/(.+?)\/status\/\d+/)
			if(!tweetMatch || tweet.href !== tweet.innerText){
				return
			}
			tweet.classList.add("hohEmbedded");
			let tweetBlockQuote = create("blockquote",false,false,tweet);
			tweetBlockQuote.classList.add("twitter-tweet");
			if(document.body.classList.contains("site-theme-dark")){
				tweetBlockQuote.setAttribute("data-theme","dark")
			}
			let tweetBlockQuoteInner = create("p",false,false,tweetBlockQuote);
			tweetBlockQuoteInner.setAttribute("lang","en");
			tweetBlockQuoteInner.setAttribute("dir","ltr");
			let tweetBlockQuoteInnerInner = create("a","hohEmbedded","Loading tweet by " + tweetMatch[1] + "...",tweetBlockQuoteInner)
				.href = tweet.href;
			if(window.GM_xmlhttpRequest){
				/*
					Only fetch external script if running in userscript mode (window.GM_xmlhttpRequest is only available inside a userscript manager)
					This is not allowed for Firefox addons, even if this setting is disabled by default.
					Hence this check
				*/
				if(document.getElementById("automailTwitterEmbed")){
					document.getElementById("automailTwitterEmbed").remove()
					//rerun the embed script if we encounter multiple tweets. Likely not efficient
					//https://github.com/hohMiyazawa/Automail/issues/52
				}
				let script = document.createElement("script");
				script.setAttribute("src","https://platform.twitter.com/widgets.js");
				script.setAttribute("async","");
				script.id = "automailTwitterEmbed";
				document.head.appendChild(script)
			}
		})
	}
},400);
