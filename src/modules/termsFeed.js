function termsFeed(){
	let page = 1;
	let location = document.querySelector(".container");
	location.parentNode.style.background = "rgb(39,44,56)";
	location.parentNode.style.color = "rgb(159,173,189)";
	let terms = create("div",["container","termsFeed"],false,location.parentNode,"max-width: 1100px;margin-left:170px;margin-right:170px;");
	location.style.display = "none";
	let policy = create("button",["hohButton","button"],"View Privacy Policy instead",terms,"font-size:1rem;color:initial;");
	policy.onclick = function(){
		location.style.display = "initial";
		terms.style.display = "none";
	};
	if(!useScripts.accessToken){
		create("p",false,"This module does not work without signing in to the script",terms);
		let loginURL = create("a",false,"Sign in with the script",terms);
		loginURL.href = authUrl;
		loginURL.style.color = "rgb(61,180,242)";
		return;
	};
	let browseSettings = create("div",false,false,terms,"margin-top:10px;");
	let onlyGlobal = createCheckbox(browseSettings);
	create("span",false,"Global",browseSettings,"margin-right:5px;");
	let onlyStatus = createCheckbox(browseSettings);
	create("span",false,"Text posts",browseSettings,"margin-right:5px;");
	let onlyReplies = createCheckbox(browseSettings);
	create("span",false,"Has replies",browseSettings,"margin-right:5px;");
	let onlyForum = createCheckbox(browseSettings);
	create("span",false,"Forum",browseSettings,"margin-right:5px;");
	let onlyReviews = createCheckbox(browseSettings);
	create("span",false,"Reviews",browseSettings);
	create("br",false,false,browseSettings);
	create("br",false,false,browseSettings);
	let onlyUser = createCheckbox(browseSettings);
	create("span",false,"User",browseSettings,"margin-right:5px;");
	let onlyUserInput = create("input",false,false,browseSettings,"background:rgb(31,35,45);border-width:0px;margin-left:20px;border-radius:3px;color:rgb(159,173,189);margin-right: 10px;padding:3px;");
	let onlyMedia = createCheckbox(browseSettings);
	create("span",false,"Media",browseSettings,"margin-right:5px;");
	let onlyMediaResult = {id: 0,type: "ANIME"};
	let onlyMediaInput = create("input",false,false,browseSettings,"background:rgb(31,35,45);border-width:0px;margin-left:20px;border-radius:3px;color:rgb(159,173,189);margin-right: 10px;padding:3px;");
	let mediaDisplayResults = create("div",false,false,browseSettings,"margin-top:5px;");
	let dataUsers = new Set([whoAmI]);
	let dataMedia = new Set();
	let dataUsersList = create("datalist","#userDatalist",false,browseSettings);
	let dataMediaList = create("datalist","#userMedialist",false,browseSettings);
	onlyUserInput.setAttribute("list","userDatalist");
	onlyMediaInput.setAttribute("list","userMedialist");
	let feed = create("div","hohFeed",false,terms);
	let topNav = create("div",false,false,feed,"position:relative;min-height:60px;margin-bottom:15px;");
	let loading = create("p",false,"Loading...",topNav);
	let pageCount = create("p",false,"Page 1",topNav);
	let statusInput = create("div",false,false,topNav);
	let onlySpecificActivity = false;
	let statusInputTitle = create("input",false,false,statusInput,"display:none;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);background: rgb(var(--color-foreground));");
	statusInputTitle.placeholder = "Title";
	let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);resize: vertical;");
	create("br",false,false,statusInput);
	let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
	let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
	inputArea.placeholder = "Write a status...";
	let topPrevious = create("button",["hohButton","button"],"Refresh",topNav,"position:fixed;top:120px;left:calc(5% - 50px);z-index:50;");
	let topNext = create("button",["hohButton","button"],"Next →",topNav,"position:fixed;top:120px;right:calc(5% - 50px);z-index:50;");
	let feedContent = create("div",false,false,feed);
	let notiLink = create("a",["link","newTab"],"",topNav,"position:fixed;top:10px;right:10px;color:rgb(var(--color-blue));text-decoration:none;");
	notiLink.href = "/notifications";
	let lastUpdated = 0;
	let buildPage = function(activities,type,requestTime){
		if(requestTime < lastUpdated){
			return
		}
		lastUpdated = requestTime;
		loading.innerText = "";
		pageCount.innerText = "Page " + page;
		if(page === 1){
			topPrevious.innerText = "Refresh"
		}
		else{
			topPrevious.innerText = "← Previous"
		};
		removeChildren(feedContent)
		activities.forEach(function(activity){
			let act = create("div","activity",false,feedContent);
			let diff = NOW() - (new Date(activity.createdAt * 1000)).valueOf();
			let time = create("span",["time","hohMonospace"],formatTime(Math.round(diff/1000),"short"),act,"width:50px;position:absolute;left:1px;top:2px;");
			time.title = (new Date(activity.createdAt * 1000)).toLocaleString();
			let content = create("div",false,false,act,"margin-left:60px;position:relative;");
			if(!activity.user){
				return
			}
			let user = create("a",["link","newTab"],activity.user.name,content);
			user.href = "/user/" + activity.user.name + "/";
			let actions = create("div","actions",false,content,"position:absolute;text-align:right;");
			let replyWrap = create("span",["action","hohReplies"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
			let replyCount = create("span","count",(activity.replies.length || activity.replyCount ? activity.replies.length || activity.replyCount : " "),replyWrap);
			let replyIcon = create("span",false,false,replyWrap);
			replyIcon.appendChild(svgAssets2.reply.cloneNode(true));
			replyWrap.style.cursor = "pointer";
			replyIcon.children[0].style.width = "13px";
			replyIcon.stylemarginLeft = "-2px";
			let likeWrap = create("span",["action","hohLikes"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
			likeWrap.title = activity.likes.map(a => a.name).join("\n");
			let likeCount = create("span","count",(activity.likes.length ? activity.likes.length : " "),likeWrap);
			let heart = create("span",false,"♥",likeWrap,"position:relative;");
			let likeQuickView = create("div","hohLikeQuickView",false,heart);
			if(type === "review"){
				heart.innerText = activity.rating + "/" + activity.ratingAmount
			};
			likeWrap.style.cursor = "pointer";
			if(activity.likes.some(like => like.name === whoAmI)){
				likeWrap.classList.add("hohILikeThis");
			};
			let likeify = function(likes,likeQuickView){
				removeChildren(likeQuickView)
				if(likes.length === 0){}
				else if(likes.length === 1){
					create("span",false,likes[0].name,likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
				}
				else if(likes.length === 2){
					let name1 = create("span",false,likes[0].name.slice(0,(likes[0].name.length <= 6 ? likes[0].name.length : 4)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
					create("span",false," & ",likeQuickView);
					let name2 = create("span",false,likes[1].name.slice(0,(likes[1].name.length <= 6 ? likes[1].name.length : 4)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[1].name)) % 360},50%,50%)`);
					name1.onmouseover = function(){
						name1.innerText = likes[0].name
					}
					name2.onmouseover = function(){
						name2.innerText = likes[1].name
					}
				}
				else if(likes.length === 3){
					let name1 = create("span",false,likes[0].name.slice(0,(likes[0].name.length <= 3 ? likes[0].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[0].name)) % 360},50%,50%)`);
					create("span",false,", ",likeQuickView);
					let name2 = create("span",false,likes[1].name.slice(0,(likes[1].name.length <= 3 ? likes[1].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[1].name)) % 360},50%,50%)`);
					create("span",false," & ",likeQuickView);
					let name3 = create("span",false,likes[2].name.slice(0,(likes[2].name.length <= 3 ? likes[1].name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(likes[2].name)) % 360},50%,50%)`);
					name1.onmouseover = function(){
						name1.innerText = likes[0].name
					}
					name2.onmouseover = function(){
						name2.innerText = likes[1].name
					}
					name3.onmouseover = function(){
						name3.innerText = likes[2].name
					}
				}
				else if(likes.length === 4){
					likes.forEach(like => {
						let name = create("span",false,like.name.slice(0,(like.name.length <= 3 ? like.name.length : 2)),likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false,", ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name;
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length === 5 || likes.length === 6){
					likes.forEach(like => {
						let name = create("span",false,like.name.slice(0,2),likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false," ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name
						}
						name.onmouseout = function(){
							name.innerText = like.name.slice(0,2)
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length < 12){
					likes.forEach(like => {
						let name = create("span",false,like.name[0],likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						create("span",false," ",likeQuickView);
						name.onmouseover = function(){
							name.innerText = like.name
						}
						name.onmouseout = function(){
							name.innerText = like.name[0]
						}
					});
					likeQuickView.lastChild.remove();
				}
				else if(likes.length <= 20){
					likes.forEach(like => {
						let name = create("span",false,like.name[0],likeQuickView,`color: hsl(${Math.abs(hashCode(like.name)) % 360},50%,50%)`);
						name.onmouseover = function(){
							name.innerText = " " + like.name + " "
						}
						name.onmouseout = function(){
							name.innerText = like.name[0]
						}
					});
				}
			};
			likeify(activity.likes,likeQuickView);
			likeWrap.onclick = function(){
				authAPIcall(
					"mutation($id:Int){ToggleLike(id:$id,type:" + type.toUpperCase() + "){id}}",
					{id: activity.id},
					data => {}
				);
				if(likeWrap.classList.contains("hohILikeThis")){
					activity.likes.splice(activity.likes.findIndex(user => user.name === whoAmI),1);
					if(activity.likes.length === 0){
						likeCount.innerText = " "
					}
					else{
						likeCount.innerText = activity.likes.length
					}
				}
				else{
					activity.likes.push({name: whoAmI});
					likeCount.innerText = activity.likes.length;
				};
				likeWrap.classList.toggle("hohILikeThis");
				likeWrap.title = activity.likes.map(a => a.name).join("\n");
				likeify(activity.likes,likeQuickView);
			};
			replyWrap.onclick = function(){
				if(act.querySelector(".replies")){
					act.lastChild.remove();
				}
				else if(type === "thread"){
					window.location = "https://anilist.co/forum/thread/" + activity.id + "/";//remove when implemented
					let createReplies = data => {//what's happening here? Must look into it later
						let replies = create("div","replies",false,act);
						data.data.threadReplies.forEach(function(repy){
						});
					};
					//generalAPIcall(``,{},createReplies)
				}
				else{
					let createReplies = function(){
						let replies = create("div","replies",false,act);
						activity.replies.forEach(reply => {
							let rep = create("div","reply",false,replies);
							let ndiff = NOW() - (new Date(reply.createdAt * 1000)).valueOf();
							let time = create("span",["time","hohMonospace"],formatTime(Math.round(ndiff/1000),"short"),rep,"width:50px;position:absolute;left:1px;top:2px;");
							time.title = (new Date(activity.createdAt * 1000)).toLocaleString();
							let user = create("a",["link","newTab"],reply.user.name,rep,"margin-left: 60px;");
							user.href = "/user/" + reply.user.name + "/";
							let text = create("div","status",false,rep,"padding-bottom:10px;margin-left:5px;max-width:100%;");
							if(useScripts.termsFeedNoImages && !activity.renderingPermission){
								let imgText = reply.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
									let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
									return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
								})
								text.innerHTML = imgText//reason for inner HTML: preparsed sanitized HTML from the Anilist API
							}
							else{
								text.innerHTML = reply.text//reason for inner HTML: preparsed sanitized HTML from the Anilist API
							}
							Array.from(text.querySelectorAll(".youtube")).forEach(ytLink => {
								create("a",["link","newTab"],"Youtube " + ytLink.id,ytLink)
									.href = "https://www.youtube.com/watch?v=" + ytLink.id;
							});
							let actions = create("div","actions",false,rep,"position:absolute;text-align:right;right:4px;bottom:0px;");
							let likeWrap = create("span",["action","hohLikes"],false,actions,"display:inline-block;min-width:35px;margin-left:2px");
							likeWrap.title = reply.likes.map(a => a.name).join("\n");
							let likeCount = create("span","count",(reply.likes.length ? reply.likes.length : " "),likeWrap);
							let heart = create("span",false,"♥",likeWrap,"position:relative;");
							let likeQuickView = create("div","hohLikeQuickView",false,heart,"position:absolute;bottom:0px;left:30px;font-size:70%;white-space:nowrap;");
							likeWrap.style.cursor = "pointer";
							if(reply.likes.some(like => like.name === whoAmI)){
								likeWrap.classList.add("hohILikeThis");
							};
							likeify(reply.likes,likeQuickView);
							likeWrap.onclick = function(){
								authAPIcall(
									"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
									{id: reply.id},
									data => {}
								);
								if(likeWrap.classList.contains("hohILikeThis")){
									reply.likes.splice(reply.likes.findIndex(user => user.name === whoAmI),1);
									if(reply.likes.length === 0){
										likeCount.innerText = " ";
									}
									else{
										likeCount.innerText = reply.likes.length;
									};
								}
								else{
									reply.likes.push({name: whoAmI});
									likeCount.innerText = reply.likes.length;
								};
								likeWrap.classList.toggle("hohILikeThis");
								likeWrap.title = reply.likes.map(a => a.name).join("\n");
								likeify(reply.likes,likeQuickView);
							};
						});
						let statusInput = create("div",false,false,replies);
						let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);resize: vertical;");
						let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
						let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
						inputArea.placeholder = "Write a reply...";
						inputArea.onfocus = function(){
							cancelButton.style.display = "inline";
							publishButton.style.display = "inline";
						};
						cancelButton.onclick = function(){
							inputArea.value = "";
							cancelButton.style.display = "none";
							publishButton.style.display = "none";
							document.activeElement.blur();
						};
						publishButton.onclick = function(){
							loading.innerText = "Publishing reply...";
							authAPIcall(
								`mutation($text: String,$activityId: Int){
									SaveActivityReply(text: $text,activityId: $activityId){
										id
										user{name}
										likes{name}
										text(asHtml: true)
										createdAt
									}
								}`,
								{text: inputArea.value,activityId: activity.id},
								data => {
									loading.innerText = "";
									activity.replies.push(data.data.SaveActivityReply);
									replyCount.innerText = activity.replies.length;
									act.lastChild.remove();
									createReplies();
								}
							);
							inputArea.value = "";
							cancelButton.style.display = "none";
							publishButton.style.display = "none";
							document.activeElement.blur();
						};
					};createReplies();
				};
			};
			let status;
			if(activity.type === "TEXT" || activity.type === "MESSAGE"){
				status = create("div",false,false,content,"padding-bottom:10px;width:95%;overflow-wrap:anywhere;");
				if(useScripts.termsFeedNoImages){
					let imgText = activity.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
						let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					}).replace(/<video.*?video>/g,video => {
						let link = video.match(/src=("|')(.*?)("|')/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					})
					status.innerHTML = imgText;//reason for inner HTML: preparsed sanitized HTML from the Anilist API
					if(cleanText !== activity.text){
						let render = create("a",false,"IMG",act,"position:absolute;top:2px;right:50px;width:10px;cursor:pointer;");
						render.onclick = () => {
							activity.renderingPermission = true;
							status.innerHTML = activity.text;//reason for inner HTML: preparsed sanitized HTML from the Anilist API
							render.style.display = "none";
						}
					}
				}
				else{
					status.innerHTML = activity.text;//reason for inner HTML: preparsed sanitized HTML from the Anilist API
				}
				Array.from(status.querySelectorAll(".youtube")).forEach(ytLink => {
					create("a",["link","newTab"],ytLink.id,ytLink)
						.href = ytLink.id
				});
				if(activity.user.name === whoAmI && activity.type === "TEXT" && type !== "thread"){
					let edit = create("a",false,"Edit",act,"position:absolute;top:2px;right:40px;width:10px;cursor:pointer;font-size:small;color:inherit;");
					if(useScripts.termsFeedNoImages){
						edit.style.right = "80px"
					}
					edit.onclick = function(){
						loading.innerText = "Loading activity " + activity.id + "...";
						if(terms.scrollIntoView){
							terms.scrollIntoView({"behavior": "smooth","block": "start"})
						}
						else{
							document.body.scrollTop = document.documentElement.scrollTop = 0
						};
						authAPIcall(
							`query($id: Int){
								Activity(id: $id){
									... on TextActivity{
										text(asHtml: false)
									}
								}
							}`,
							{id: activity.id},
							data => {
								if(!data){
									onlySpecificActivity = false;
									loading.innerText = "Failed to load activity";
								}
								inputArea.focus();
								onlySpecificActivity = activity.id;
								loading.innerText = "Editing activity " + activity.id;
								inputArea.value = data.data.Activity.text;
							}
						)
					}
				}
				act.classList.add("text");
				actions.style.right = "21px";
				actions.style.bottom = "4px";
			}
			else{
				status = create("span",false," " + activity.status,content);
				if(activity.progress){
					create("span",false," " + activity.progress + " of",content);
				};
				let title = activity.media.title.romaji;
				if(useScripts.titleLanguage === "NATIVE" && activity.media.title.native){
					title = activity.media.title.native;
				}
				else if(useScripts.titleLanguage === "ENGLISH" && activity.media.title.english){
					title = activity.media.title.english;
				};
				dataMedia.add(title);
				title = titlePicker(activity.media);
				let media = create("a",["link","newTab"]," " + title,content);
				media.href = "/" + activity.media.type.toLowerCase() + "/" + activity.media.id + "/" + safeURL(title) + "/";
				if(activity.media.type === "MANGA" && useScripts.CSSgreenManga){
					media.style.color = "rgb(var(--color-green))";
				};
				act.classList.add("list");
				actions.style.right = "21px";
				actions.style.top = "2px";
				if(useScripts.statusBorder){
					let blockerMap = {
						"plans": "PLANNING",
						"watched": "CURRENT",
						"read": "CURRENT",
						"completed": "COMPLETED",
						"paused": "PAUSED",
						"dropped": "DROPPED",
						"rewatched": "REPEATING",
						"reread": "REPEATING"
					};
					let status = blockerMap[
						Object.keys(blockerMap).find(
							key => activity.status.includes(key)
						)
					]
					if(status === "CURRENT"){
						//nothing
					}
					else if(status === "COMPLETED"){
						act.style.borderLeftWidth = "3px";
						act.style.marginLeft = "-2px";
						if(useScripts.CSSgreenManga && activity.media.type === "ANIME"){
							act.style.borderLeftColor = "rgb(var(--color-blue))";
						}
						else{
							act.style.borderLeftColor = "rgb(var(--color-green))";
						}
					}
					else{
						act.style.borderLeftWidth = "3px";
						act.style.marginLeft = "-2px";
						act.style.borderLeftColor = distributionColours[status];
					}
				}
			};
			let link = create("a",["link","newTab"],false,act,"position:absolute;top:2px;right:4px;width:10px;");
			link.appendChild(svgAssets2.link.cloneNode(true));
			if(type === "thread"){
				link.href = "https://anilist.co/forum/thread/" + activity.id + "/"
			}
			else{
				link.href = "https://anilist.co/" + type + "/" + activity.id + "/"
			}
			if(activity.user.name === whoAmI){
				let deleteActivity = create("span","hohDeleteActivity",svgAssets.cross,act);
				deleteActivity.title = "Delete";
				deleteActivity.onclick = function(){
					authAPIcall(
						"mutation($id: Int){Delete" + capitalize(type) + "(id: $id){deleted}}",
						{id: activity.id},
						function(data){
							if(data.data.DeleteActivity.deleted){
								act.style.display = "none"
							}
						}
					)
				}
			}
			dataUsers.add(activity.user.name);
			activity.replies.forEach(reply => {
				dataUsers.add(reply.user.name);
				(reply.text.match(/@(.*?)</g) || []).forEach(user => {
					dataUsers.add(user.slice(1,user.length-1))
				})
			})
		});
		if(terms.scrollIntoView){
			terms.scrollIntoView({"behavior": "smooth","block": "start"})
		}
		else{
			document.body.scrollTop = document.documentElement.scrollTop = 0
		};
		removeChildren(dataUsersList)
		dataUsers.forEach(user => {
			create("option",false,false,dataUsersList)
				.value = user;
		});
		removeChildren(dataMediaList)
		dataMedia.forEach(media => {
			create("option",false,false,dataMediaList)
				.value = media;
		});
	};
	let requestPage = function(npage,userID){
		page = npage;
		let types = [];
		if(!onlyUser.checked){
			types.push("MESSAGE")
		}
		if(onlyStatus.checked){
			types.push("ANIME_LIST","MANGA_LIST")
		};
		let specificUser = onlyUserInput.value || whoAmI;
		if(onlyUser.checked && !userID){
			generalAPIcall("query($name:String){User(name:$name){id}}",{name: specificUser},function(data){
				if(data){
					requestPage(npage,data.data.User.id)
				}
				else{
					loading.innerText = "Not Found"
				}
			},"hohIDlookup" + specificUser.toLowerCase());
			return;
		};
		let requestTime = NOW();
		if(onlyForum.checked){
			authAPIcall(
				`
query($page: Int){
	Page(page: $page){
		threads(sort:REPLIED_AT_DESC${(onlyUser.checked ? ",userId: " + userID : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaCategoryId: " + onlyMediaResult.id : ""}){
			id
			createdAt
			user{name}
			text:body(asHtml: true)
			likes{name}
			title
			replyCount
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage},
				function(data){
					buildPage(data.data.Page.threads.map(thread => {
						thread.type = "TEXT";
						thread.replies = [];
						thread.text = "<h2>" + thread.title + "</h2>" + thread.text;
						return thread
					}).filter(thread => thread.replyCount || !onlyReplies.checked),"thread",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications"
						}
						else{
							notiLink.title = "no unread notifications"
						}
					};
				}
			);
		}
		else if(onlyReviews.checked){
			authAPIcall(
				`
query($page: Int){
	Page(page: $page,perPage: 20){
		reviews(sort:CREATED_AT_DESC${(onlyUser.checked ? ",userId: " + userID : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaId: " + onlyMediaResult.id : ""}){
			id
			createdAt
			user{name}
			media{
				id
				type
				title{romaji native english}
			}
			summary
			body(asHtml: true)
			rating
			ratingAmount
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage},
				function(data){
					buildPage(data.data.Page.reviews.map(review => {
						review.type = "TEXT";
						review.likes = [];
						review.replies = [{
							id: review.id,
							user: review.user,
							likes: [],
							text: review.body,
							createdAt: review.createdAt
						}];
						review.text = review.summary
						return review
					}),"review",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications";
						}
						else{
							notiLink.title = "no unread notifications";
						}
					};
				}
			);
		}
		else{
			authAPIcall(
				`
query($page: Int,$types: [ActivityType]){
	Page(page: $page){
		activities(${(onlyUser.checked || onlyGlobal.checked ? "" : "isFollowing: true,")}sort: ID_DESC,type_not_in: $types${(onlyReplies.checked ? ",hasReplies: true" : "")}${(onlyUser.checked ? ",userId: " + userID : "")}${(onlyGlobal.checked ? ",hasRepliesOrTypeText: true" : "")}${onlyMedia.checked && onlyMediaResult.id ? ",mediaId: " + onlyMediaResult.id : ""}){
			... on MessageActivity{
				id
				type
				createdAt
				user:messenger{name}
				text:message(asHtml: true)
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
			... on TextActivity{
				id
				type
				createdAt
				user{name}
				text(asHtml: true)
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
			... on ListActivity{
				id
				type
				createdAt
				user{name}
				status
				progress
				media{
					id
					type
					title{romaji native english}
				}
				likes{name}
				replies{
					id
					user{name}
					likes{name}
					text(asHtml: true)
					createdAt
				}
			}
		}
	}
	Viewer{unreadNotificationCount}
}`,
				{page: npage,types:types},
				function(data){
					buildPage(data.data.Page.activities,"activity",requestTime);
					if(data.data.Viewer){
						notiLink.innerText = data.data.Viewer.unreadNotificationCount;
						if(data.data.Viewer.unreadNotificationCount){
							notiLink.title = data.data.Viewer.unreadNotificationCount + " unread notifications";
						}
						else{
							notiLink.title = "no unread notifications";
						}
					};
				}
			);
		}
	};
	requestPage(page);
	let setInputs = function(){
		statusInputTitle.style.display = "none";
		if(onlyReviews.checked){
			inputArea.placeholder = "Writing reviews not supported yet...";
			publishButton.innerText = "Publish";
		}
		else if(onlyForum.checked){
			inputArea.placeholder = "Write a forum post...";
			statusInputTitle.style.display = "block";
			publishButton.innerText = "Publish";
		}
		else if(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase()){
			inputArea.placeholder = "Write a message...";
			publishButton.innerText = "Send";
		}
		else{
			inputArea.placeholder = "Write a status...";
			publishButton.innerText = "Publish";
		}
	};
	topPrevious.onclick = function(){
		loading.innerText = "Loading...";
		if(page === 1){
			requestPage(1)
		}
		else{
			requestPage(page - 1)
		}
	};
	topNext.onclick = function(){
		loading.innerText = "Loading...";
		requestPage(page + 1);
	};
	onlyGlobal.onchange = function(){
		loading.innerText = "Loading...";
		statusInputTitle.style.display = "none";
		inputArea.placeholder = "Write a status...";
		onlyUser.checked = false;
		onlyForum.checked = false;
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyStatus.onchange = function(){
		loading.innerText = "Loading...";
		onlyForum.checked = false;
		onlyReviews.checked = false;
		onlyMedia.checked = false;
		requestPage(1);
	};
	onlyReplies.onchange = function(){
		loading.innerText = "Loading...";
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyUser.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		onlyGlobal.checked = false;
		requestPage(1);
	};
	onlyForum.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		onlyGlobal.checked = false;
		onlyStatus.checked = false;
		onlyReviews.checked = false;
		requestPage(1);
	};
	onlyMedia.onchange = function(){
		setInputs();
		loading.innerText = "Loading...";
		requestPage(1);
	};
	onlyReviews.onchange = function(){
		setInputs();
		onlyGlobal.checked = false;
		onlyStatus.checked = false;
		onlyForum.checked = false;
		onlyReplies.checked = false;
		loading.innerText = "Loading...";
		requestPage(1);
	}
	let oldOnlyUser = "";
	onlyUserInput.onfocus = function(){
		oldOnlyUser = onlyUserInput.value
	};
	let oldOnlyMedia = "";
	onlyMediaInput.onfocus = function(){
		oldOnlyMedia = onlyMediaInput.value
	};
	onlyMediaInput.onblur = function(){
		if(onlyMediaInput.value === oldOnlyMedia){
			return;
		}
		if(onlyMediaInput.value === ""){
			removeChildren(mediaDisplayResults)
			onlyMediaResult.id = false;
		}
		else{
			if(!mediaDisplayResults.childElementCount){
				create("span",false,"Searching...",mediaDisplayResults);
			}
			generalAPIcall(`
				query($search: String){
					Page(page:1,perPage:5){
						media(search:$search,sort:SEARCH_MATCH){
							title{romaji}
							id
							type
						}
					}
				}`,
				{search: onlyMediaInput.value},
				function(data){
					removeChildren(mediaDisplayResults)
					data.data.Page.media.forEach((media,index) => {
						let result = create("span",["hohSearchResult",media.type.toLowerCase()],media.title.romaji,mediaDisplayResults);
						if(index === 0){
							result.classList.add("selected");
							onlyMediaResult.id = media.id;
							onlyMediaResult.type = media.type;
						}
						result.onclick = function(){
							mediaDisplayResults.querySelector(".selected").classList.toggle("selected");
							result.classList.add("selected");
							onlyMediaResult.id = media.id;
							onlyMediaResult.type = media.type;
							onlyMedia.checked = true;
							onlyStatus.checked = false;
							loading.innerText = "Loading...";
							requestPage(1);
						}
					});
					if(data.data.Page.media.length){
						onlyMedia.checked = true;
						onlyStatus.checked = false;
						loading.innerText = "Loading...";
						requestPage(1);
					}
					else{
						create("span",false,"No results found",mediaDisplayResults);
						onlyMediaResult.id = false;
					}
				}
			)
		};
	};
	onlyUserInput.onblur = function(){
		if(onlyForum.checked){
			inputArea.placeholder = "Write a forum post...";
			publishButton.innerText = "Publish";
		}
		else if(
			(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase())
			|| (oldOnlyUser !== onlyUserInput.value && onlyUserInput.value !== "")
		){
			inputArea.placeholder = "Write a message...";
			publishButton.innerText = "Send";	
		}
		else{
			inputArea.placeholder = "Write a status...";
			publishButton.innerText = "Publish";
		}
		if(oldOnlyUser !== onlyUserInput.value && onlyUserInput.value !== ""){
			loading.innerText = "Loading...";
			onlyUser.checked = true;
			requestPage(1);
		}
		else if(onlyUser.checked && oldOnlyUser !== onlyUserInput.value){
			loading.innerText = "Loading...";
			requestPage(1);
		}
	};
	onlyUserInput.addEventListener("keyup",function(event){
		if(event.key === "Enter"){
			onlyUserInput.blur();
		}
	});
	onlyMediaInput.addEventListener("keyup",function(event){
		if(event.key === "Enter"){
			onlyMediaInput.blur();
		}
	});
	inputArea.onfocus = function(){
		cancelButton.style.display = "inline";
		publishButton.style.display = "inline";
	};
	cancelButton.onclick = function(){
		inputArea.value = "";
		cancelButton.style.display = "none";
		publishButton.style.display = "none";
		loading.innerText = "";
		onlySpecificActivity = false;
		document.activeElement.blur();
	};
	publishButton.onclick = function(){
		if(onlyForum.checked){
			alert("Sorry, not implemented yet");
			//loading.innerText = "Publishing forum post...";
			return;
		}
		else if(onlyReviews.checked){
			alert("Sorry, not implemented yet");
			//loading.innerText = "Publishing review...";
			return;
		}
		else if(onlySpecificActivity){
			loading.innerText = "Publishing...";
			authAPIcall(
				"mutation($text: String,$id: Int){SaveTextActivity(id: $id,text: $text){id}}",
				{text: inputArea.value,id: onlySpecificActivity},
				function(data){
					onlySpecificActivity = false;
					requestPage(1);
				}
			);
		}
		else if(onlyUser.checked && onlyUserInput.value && onlyUserInput.value.toLowerCase() !== whoAmI.toLowerCase()){
			loading.innerText = "Sending Message...";
			generalAPIcall("query($name:String){User(name:$name){id}}",{name: onlyUserInput.value},function(data){
				if(data){
					authAPIcall(
						"mutation($text: String,$recipientId: Int){SaveMessageActivity(message: $text,recipientId: $recipientId){id}}",
						{
							text: inputArea.value,
							recipientId: data.data.User.id
						},
						function(data){
							requestPage(1);
						}
					)
				}
				else{
					loading.innerText = "Not Found";
				}
			},"hohIDlookup" + onlyUserInput.value.toLowerCase());
		}
		else{
			loading.innerText = "Publishing...";
			authAPIcall(
				"mutation($text: String){SaveTextActivity(text: $text){id}}",
				{text: inputArea.value},
				function(data){
					requestPage(1);
				}
			);
		}
		inputArea.value = "";
		cancelButton.style.display = "none";
		publishButton.style.display = "none";
		document.activeElement.blur();
	};
	let sideBarContent = create("div","sidebar",false,feed,"position:absolute;left:20px;top:200px;max-width:150px;");
	let buildPreview = function(data){
		if(!data){
			return;
		}
		removeChildren(sideBarContent)
		let mediaLists = data.data.Page.mediaList.map(mediaList => {
			if(aliases.has(mediaList.media.id)){
				mediaList.media.title.userPreferred = aliases.get(mediaList.media.id)
			}
			return mediaList
		});
		mediaLists.slice(0,20).forEach(mediaList => {
			let mediaEntry = create("div",false,false,sideBarContent,"border-bottom: solid;border-bottom-width: 1px;margin-bottom: 10px;border-radius: 3px;padding: 2px;");
			create("a","link",mediaList.media.title.userPreferred,mediaEntry,"min-height:40px;display:inline-block;")
				.href = "/anime/" + mediaList.media.id + "/" + safeURL(mediaList.media.title.userPreferred);
			let progress = create("div",false,false,mediaEntry,"font-size: small;");
			create("span",false,"Progress: ",progress);
			let number = create("span",false,mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : ""),progress);
			let plusProgress = create("span",false,"+",progress,"padding-left:5px;padding-right:5px;cursor:pointer;");
			let isBlocked = false;
			plusProgress.onclick = function(e){
				if(isBlocked){
					return
				};
				if(mediaList.media.episodes){
					if(mediaList.progress < mediaList.media.episodes){
						mediaList.progress++;
						number.innerText = mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : "");
						isBlocked = true;
						setTimeout(function(){
							isBlocked = false;
						},300);
						if(mediaList.progress === mediaList.media.episodes){
							plusProgress.innerText = "";
							if(mediaList.status === "REWATCHING"){//don't overwrite the existing end date
								authAPIcall(
									`mutation($progress: Int,$id: Int){
										SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED){id}
									}`,
									{id: mediaList.id,progress: mediaList.progress},
									data => {}
								);
							}
							else{
								authAPIcall(
									`mutation($progress: Int,$id: Int,$date:FuzzyDateInput){
										SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED,completedAt:$date){id}
									}`,
									{
										id: mediaList.id,
										progress: mediaList.progress,
										date: {
											year: (new Date()).getUTCFullYear(),
											month: (new Date()).getUTCMonth() + 1,
											day: (new Date()).getUTCDate(),
										}
									},
									data => {}
								);
							};
							mediaEntry.style.backgroundColor = "rgba(0,200,0,0.1)";
						}
						else{
							authAPIcall(
								`mutation($progress: Int,$id: Int){
									SaveMediaListEntry(progress: $progress,id:$id){id}
								}`,
								{id: mediaList.id,progress: mediaList.progress},
								data => {}
							);
						}
						localStorage.setItem("hohListPreview",JSON.stringify(data));
					}
				}
				else{
					mediaList.progress++;
					number.innerText = mediaList.progress + (mediaList.media.episodes ? "/" + mediaList.media.episodes : "");
					isBlocked = true;
					setTimeout(function(){
						isBlocked = false;
					},300);
					authAPIcall(
						`mutation($progress: Int,$id: Int){
							SaveMediaListEntry(progress: $progress,id:$id){id}
						}`,
						{id: mediaList.id,progress: mediaList.progress},
						data => {}
					);
					localStorage.setItem("hohListPreview",JSON.stringify(data));
				};
				e.stopPropagation();
				e.preventDefault();
				return false
			}
		});
	};
	authAPIcall(
		`query($name: String){
			Page(page:1){
				mediaList(type:ANIME,status_in:[CURRENT,REPEATING],userName:$name,sort:UPDATED_TIME_DESC){
					id
					priority
					scoreRaw: score(format: POINT_100)
					progress
					status
					media{
						id
						episodes
						coverImage{large color}
						title{userPreferred}
						nextAiringEpisode{episode timeUntilAiring}
					}
				}
			}
		}`,{name: whoAmI},function(data){
			localStorage.setItem("hohListPreview",JSON.stringify(data));
			buildPreview(data,true);
		}
	);
	buildPreview(JSON.parse(localStorage.getItem("hohListPreview")),false);
}
