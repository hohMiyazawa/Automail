function enhanceSocialTabFeed(){
	let URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w-]*\/social/);
	if(!URLstuff){
		return
	}
	let feedLocation = document.querySelector(".activity-feed");
	if(!feedLocation){
		setTimeout(enhanceSocialTabFeed,100);
		return
	}
	let hohFeed = create("div","hohSocialFeed");
	feedLocation.insertBefore(hohFeed,feedLocation.children[0]);
	let optionsContainer = create("div",false,false,hohFeed,"position:absolute;top:0px;right:0px;");
	let hasReplies = createCheckbox(optionsContainer);
	create("span",false,translate("$filter_replies"),optionsContainer,"margin-right:7px;");
	let isFollowing = createCheckbox(optionsContainer);
	if(useScripts.accessToken){
		create("span",false,translate("$filter_following"),optionsContainer)
	}
	else{
		isFollowing.parentNode.style.display = "none"
	}
	let feedHeader = create("h2",false,"Recent Activity",hohFeed,"display:none;");
	let feedContent = create("div",false,false,hohFeed,"display:none;");
	let loadMore = create("div","load-more",translate("$load_more"),hohFeed);
	let query = "";
	let buildFeed = function(page){
		authAPIcall(//use also when accessToken is not available, since it will fall back to a regular API call
			query,
			{
				page: page,
				mediaId: parseInt(URLstuff[2])
			},
			function(data){
				if(!data){//restore regular feed
					feedLocation.classList.remove("hohReplaceFeed");
					feedContent.style.display = "none";
					feedHeader.style.display = "none";
					loadMore.style.display = "none";
					return
				}
				if(
					data.data.Page.pageInfo.lastPage > page
					&& (
						data.data.Page.activities.length === 25
						|| data.data.Page.activities.length === 24//since pageInfo is kill, it's better with some false positives than missing the button too often
					)
				){
					loadMore.style.display = "block";
					loadMore.onclick = function(){
						buildFeed(page + 1)
					}
				}
				else{
					loadMore.style.display = "none"
				}
				if(data.data.Page.activities.length === 0){
					create("div","activity-entry",translate("$socialTabFeed_noActivities"),feedContent)
				}
				data.data.Page.activities.forEach(act => {
					let activityEntry = create("div",["activity-entry","activity-" + URLstuff[1] + "_list"],false,feedContent);
					let wrap = create("div","wrap",false,activityEntry);
						let list = create("div","list",false,wrap);
							let cover = create("a",["cover","router-link-active"],false,list);
							cover.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
							cover.style.backgroundImage = `url("${act.media.coverImage.medium}")`;
							let details = create("div","details",false,list);
								let name = create("a","name",act.user.name,details);
								name.href = "/user/" + act.user.name;
								details.appendChild(document.createTextNode(" "));
								if(!act.status){//old "null" values from the API
									if(URLstuff[1] === "manga"){
										act.status = "read"
									}
									else{
										act.status = "watched"
									}
								}
								let status = create("div","status",act.status + (act.progress ? " " + act.progress + " of " : " "),details);
								if(URLstuff[1] === "manga"){
									if(act.status === "read chapter" && act.progress){
										status.innerText = translate("$listActivity_MreadChapter",act.progress)
									}
									else if(act.status === "reread"){
										status.innerText = translate("$listActivity_repeatedManga")
									}
									else if(act.status === "reread chapter" && act.progress){
										status.innerText = translate("$listActivity_MrepeatingManga",act.progress)
									}
									else if(act.status === "dropped" && act.progress){
										status.innerText = " " + translate("$listActivity_MdroppedManga",act.progress)
									}
									else if(act.status === "completed"){
										status.innerText = translate("$listActivity_completedManga")
									}
									else if(act.status === "plans to read"){
										status.innerText = translate("$listActivity_planningManga")
									}
									else if(act.status === "paused reading"){
										status.innerText = translate("$listActivity_pausedManga")
									}
									else{
										console.warn("Missing listActivity translation key for:",act.status)
									}
								}
								else{
									if(act.status === "watched episode" && act.progress){
										status.innerText = translate("$listActivity_MwatchedEpisode",act.progress)
									}
									else if(act.status === "rewatched"){
										status.innerText = translate("$listActivity_repeatedAnime")
									}
									else if(act.status === "rewatched episode" && act.progress){
										status.innerText = translate("$listActivity_MrepeatingAnime",act.progress)
									}
									else if(act.status === "dropped" && act.progress){
										status.innerText = " " + translate("$listActivity_MdroppedAnime",act.progress)
									}
									else if(act.status === "completed"){
										status.innerText = translate("$listActivity_completedAnime")
									}
									else if(act.status === "plans to watch"){
										status.innerText = translate("$listActivity_planningAnime")
									}
									else if(act.status === "paused watching"){
										status.innerText = translate("$listActivity_pausedAnime")
									}
									else{
										console.warn("Missing listActivity translation key for:",act.status)
									}
								}
								let link = create("a",["title","router-link-active"]," " + act.media.title.userPreferred,status);
									link.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
								let avatar = create("a","avatar",false,details);
								avatar.href = "/user/" + act.user.name;
								avatar.style.backgroundImage = `url("${act.user.avatar.medium}")`;
						let timeWrapper = create("div","time",false,wrap);
							let action = create("a","action",false,timeWrapper);
							action.appendChild(svgAssets2.link.cloneNode(true));
							action.href = "/activity/" + act.id;
							cheapReload(action,{name: "Activity", params: {id: act.id}});
							let time = nativeTimeElement(act.createdAt);timeWrapper.appendChild(time);
						let actions = create("div","actions",false,wrap);
							let actionReplies = create("div",["action","replies"],false,actions);
								if(act.replies.length){
									let replyCount = create("span","count",act.replies.length,actionReplies);
									actionReplies.appendChild(document.createTextNode(" "));
								}
								actionReplies.appendChild(svgAssets2.reply.cloneNode(true));
							actions.appendChild(document.createTextNode(" "));
							let actionLikes = create("div",["action","likes"],false,actions);
								let likeWrap = create("div","like-wrap",false,actionLikes);
									let likeButton = create("div","button",false,likeWrap);
										let likeCount = create("span","count",act.likes.length || "",likeButton);
										likeButton.appendChild(document.createTextNode(" "));
										likeButton.appendChild(svgAssets2.likeNative.cloneNode(true));
									likeButton.title = act.likes.map(a => a.name).join("\n");
									if(act.likes.some(like => like.name === whoAmI)){
										likeButton.classList.add("liked")
									}
									likeButton.onclick = function(){
										authAPIcall(
											"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
											{id: act.id},
											function(data2){
												if(!data2){
													authAPIcall(//try again once if it fails
														"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
														{id: act.id},
														function(data3){}
													)
												}
											}
										);
										if(act.likes.some(like => like.name === whoAmI)){
											act.likes.splice(act.likes.findIndex(user => user.name === whoAmI),1);
											likeButton.classList.remove("liked");
											if(act.likes.length > 0){
												likeButton.querySelector(".count").innerText = act.likes.length
											}
											else{
												likeButton.querySelector(".count").innerText = ""
											}
										}
										else{
											act.likes.push({name: whoAmI});
											likeButton.classList.add("liked");
											likeButton.querySelector(".count").innerText = act.likes.length;
										}
										likeButton.title = act.likes.map(a => a.name).join("\n")
									};
					let replyWrap = create("div","reply-wrap",false,activityEntry,"display:none;");
					actionReplies.onclick = function(){
						if(replyWrap.style.display === "none"){
							replyWrap.style.display = "block"
						}
						else{
							replyWrap.style.display = "none"
						}
					};
					let activityReplies = create("div","activity-replies",false,replyWrap);
					act.replies.forEach(rep => {
						let reply = create("div","reply",false,activityReplies);
							let header = create("div","header",false,reply);
								let repAvatar = create("a","avatar",false,header);
								repAvatar.href = "/user/" + rep.user.name;
								repAvatar.style.backgroundImage = `url("${rep.user.avatar.medium}")`;
								header.appendChild(document.createTextNode(" "));
								let repName = create("a","name",rep.user.name,header);
								repName.href = "/user/" + rep.user.name;
								let cornerWrapper = create("div","actions",false,header);
									let repActionLikes = create("div",["action","likes"],false,cornerWrapper,"display: inline-block");
										const randomDataHate = "data-v-977827fa";
										let repLikeWrap = create("div","like-wrap",false,repActionLikes);
											let repLikeButton = create("div","button",false,repLikeWrap);
												let repLikeCount = create("span","count",rep.likes.length || "",repLikeButton);
												repLikeButton.appendChild(document.createTextNode(" "));
												repLikeButton.appendChild(svgAssets2.likeNative.cloneNode(true));
											repLikeButton.title = rep.likes.map(a => a.name).join("\n");
											if(rep.likes.some(like => like.name === whoAmI)){
												repLikeButton.classList.add("liked")
											}
											repLikeButton.onclick = function(){
												authAPIcall(
													"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
													{id: rep.id},
													function(data2){
														if(!data2){
															authAPIcall(//try again once if it fails
																"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
																{id: rep.id},
																function(data3){}
															)
														}
													}
												);
												if(rep.likes.some(like => like.name === whoAmI)){
													rep.likes.splice(rep.likes.findIndex(user => user.name === whoAmI),1);
													repLikeButton.classList.remove("liked");
													repLikeButton.classList.remove("hohILikeThis");
													if(rep.likes.length > 0){
														repLikeButton.querySelector(".count").innerText = rep.likes.length
													}
													else{
														repLikeButton.querySelector(".count").innerText = ""
													}
												}
												else{
													rep.likes.push({name: whoAmI});
													repLikeButton.classList.add("liked");
													repLikeButton.classList.add("hohILikeThis");
													repLikeButton.querySelector(".count").innerText = rep.likes.length;
												}
												repLikeButton.title = rep.likes.map(a => a.name).join("\n")
											};
									let repActionTime = create("div",["action","time"],false,cornerWrapper,"display: inline-block");
										let repTime = nativeTimeElement(rep.createdAt);repActionTime.appendChild(repTime);
							let replyMarkdown = create("div","reply-markdown",false,reply);
								let markdown = create("div","markdown",false,replyMarkdown);
								markdown.innerHTML = rep.text;//reason for inner HTML: preparsed sanitized HTML from the Anilist API
					})
				})
			}
		)
	};
	hasReplies.oninput = isFollowing.oninput = function(){
		if(hasReplies.checked || isFollowing.checked){
			feedLocation.classList.add("hohReplaceFeed");
			feedContent.style.display = "block";
			feedHeader.style.display = "block";
			removeChildren(feedContent)
			if(hasReplies.checked && isFollowing.checked){
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page,perPage: 25){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,hasReplies:true,isFollowing:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			}
			else if(hasReplies.checked){
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page,perPage: 25){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,hasReplies:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			}
			else{
				query = `
query($mediaId: Int,$page: Int){
	Page(page: $page,perPage: 25){
		pageInfo{lastPage}
		activities(mediaId: $mediaId,isFollowing:true,sort:ID_DESC){
			... on ListActivity{
				id
				status
				progress
				createdAt
				user{
					name
					avatar{
						medium
					}
				}
				media{
					title{
						userPreferred
					}
					coverImage{medium}
				}
				replies{
					id
					text(asHtml: true)
					createdAt
					user{
						name
						avatar{
							medium
						}
					}
					likes{
						name
					}
				}
				likes{
					name
				}
			}
		}
	}
}`;
			}
			buildFeed(1)
		}
		else{
			feedLocation.classList.remove("hohReplaceFeed");
			feedContent.style.display = "none";
			feedHeader .style.display = "none";
			loadMore   .style.display = "none"
		}
	}
}
