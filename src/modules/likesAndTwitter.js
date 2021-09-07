//TODO split these?
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
	document.querySelectorAll(
		".forum-thread .comment .actions .like-wrap.thread_comment:not(.hohHandledLike)"
	).forEach(thingy => {
		thingy.classList.add("hohHandledLike");
		let updateLikes = function(){
			let idLink = thingy.parentNode.querySelector('.hidden[href^="/forum/thread/"]');
			if(!idLink){
				return
			}
			const id = parseInt(idLink.href.match(/\d+$/));
//wow, this API sucks!
			generalAPIcall(`
query($id: Int){
	ThreadComment(id:$id){
		id
		likes{
			name
			avatar{large}
		}
		childComments
	}
}`,
				{id: id},
				data => {
					if(!data){
						return
					}
					//TODO: be more efficient and update other comments too
					let seeker = function(comment){
						if(comment.id === id){
							let userList = thingy.querySelector(".users");
							let waitForAnilist = function(tries){
								tries--;
								if(!userList.children.length && tries){
									setTimeout(function(){waitForAnilist(tries)},200);
									return
								}
								for(let i=5;i<comment.likes.length;i++){
									let newEle = userList.children[0].cloneNode();//to be up to date with those random attributes
									newEle.href = "/user/" + comment.likes[i].name + "/";
									newEle.style.backgroundImage = 'url("' + comment.likes[i].avatar.large + '")';
									userList.appendChild(newEle)
								}
							};waitForAnilist(20);
							return true
						}
						else if(comment.childComments){
							for(let i=0;i<comment.childComments.length;i++){
								if(seeker(comment.childComments[i])){
									return true
								}
							}
						}
						return false
					}
					seeker(data.data.ThreadComment[0])
				}
			)
		}
		thingy.onmouseover = function(){
			if(!thingy.querySelector(".count")){
				return
			}
			let likeCount = parseInt(thingy.querySelector(".count").innerText);
			if(likeCount <= 5){
				return
			}
			if(thingy.classList.contains("hohLoadedLikes")){
				return
			}
			thingy.classList.add("hohLoadedLikes");
			updateLikes()
		}
		thingy.onclick = function(){
			//TODO handle this locally
			setTimeout(updateLikes,2000)
		}
	});
	let thingy = document.querySelector(".forum-thread .body .actions .like-wrap.thread:not(.hohHandledLike)");
	if(thingy){
		thingy.classList.add("hohHandledLike");
		let shortlist = null;
		let updateLikes = function(){
			if(shortlist && shortlist.data.Page.likes.length >= 25 && !shortlist.data.Page.likes.map(like => like.name).includes(whoAmI)){
				return
			}
			let [,threadId] = location.pathname.match(/^\/forum\/thread\/(\d+)/);
			if(!threadId){
				return
			}
			const id = parseInt(threadId);
			generalAPIcall(`
query ($id: Int, $type: LikeableType) {
	Page(perPage: 20) {
		likes(likeableId: $id, type: $type) {
			name
			avatar {
				large
			}
		}
	}
}`,
				{id, type: "THREAD"},
				data => {
					if(!data){
						return
					}
					shortlist = data;
					let seeker = function(comment){
						let userList = thingy.querySelector(".users");
						let waitForAnilist = function(tries){
							tries--;
							if(!userList.children.length && tries){
								setTimeout(function(){waitForAnilist(tries)},200);
								return
							}
							for(let i=5;i<comment.likes.length;i++){
								let newEle = userList.children[0].cloneNode();//to be up to date with those random attributes
								newEle.href = "/user/" + comment.likes[i].name + "/";
								newEle.style.backgroundImage = 'url("' + comment.likes[i].avatar.large + '")';
								userList.appendChild(newEle)
							}
						};waitForAnilist(20);
						return true
					}
					seeker(data.data.Page)
				}
			)
		}
		thingy.onmouseover = function(){
			if(!thingy.querySelector(".count")){
				return
			}
			let likeCount = parseInt(thingy.querySelector(".count").innerText);
			if(likeCount <= 5){
				return
			}
			if(thingy.classList.contains("hohLoadedLikes")){
				return
			}
			thingy.classList.add("hohLoadedLikes");
			updateLikes()
		}
		thingy.onclick = function(){
			//TODO handle this locally
			setTimeout(updateLikes,2000)
		}
	}
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
				if(document.getElementById("automailTwitterEmbed") && window.twttr){
					window.twttr.widgets.load(tweet)
				}
				else{
					let script = document.createElement("script");
					script.setAttribute("src","https://platform.twitter.com/widgets.js");
					script.setAttribute("async","");
					script.id = "automailTwitterEmbed";
					document.head.appendChild(script)
				}
			}
		})
	}
},400);
