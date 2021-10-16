exportModule({
	id: "forumVisualLikes",
	description: "Show more user avatars which liked a forum thread or comment",
	isDefault: true,
	categories: ["Forum"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return /^https:\/\/anilist\.co\/forum\/thread\/.*/.test(url)
	},
	code: function(){
		let likeLoop = setInterval(function(){
			// forum comments
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

			// forum threads
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
									for(let i=userList.children.length;i<comment.likes.length;i++){
										let newEle = userList.children[0].cloneNode();//to be up to date with those random attributes
										newEle.href = "/user/" + comment.likes[i].name + "/";
										newEle.style.backgroundImage = 'url("' + comment.likes[i].avatar.large + '")';
										userList.appendChild(newEle)
									}
									if(userList.children.length>comment.likes.length){
										for(let i=comment.likes.length;i<userList.children.length;i++){
											userList.children[i].remove();
										}
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
		},400);
	}
})
