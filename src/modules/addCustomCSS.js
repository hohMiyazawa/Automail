function addCustomCSS(){
	if(useScripts.SFWmode){
		return
	}
	let URLstuff = location.pathname.match(/^\/user\/([^/]*)\/?/);
	if(!customStyle.textContent || (decodeURIComponent(URLstuff[1]) !== currentUserCSS)){
		const query = `
		query($userName: String) {
			User(name: $userName){
				about
			}
		}`;
		let variables = {
			userName: decodeURIComponent(URLstuff[1])
		}
		let css_handler = function(data){
			customStyle.textContent = "";
			let external = document.getElementById("customExternalCSS");
			if(external){
				external.remove()
			}
			if(!data){
				return
			}
			if(!(/anilist\.co\/user\//.test(document.URL))){
				return
			}
			let jsonMatch = (data.data.User.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
			if(!jsonMatch){
				return
			}
			try{
				let jsonData;
				try{
					jsonData = JSON.parse(atob(jsonMatch[1]))
				}
				catch(e){
					jsonData = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
				}
				if(jsonData.customCSS){
					if(jsonData.customCSS.match(/^https.*\.css$/)){
						let styleRef = document.createElement("link");
						styleRef.id = "customExternalCSS";
						styleRef.rel = "stylesheet";
						styleRef.type = "text/css";
						styleRef.href = jsonData.customCSS;
						document.getElementsByTagName("head")[0].appendChild(styleRef)
					}
					else{
						customStyle.textContent = jsonData.customCSS
					}
					currentUserCSS = decodeURIComponent(URLstuff[1])
				}
				if(jsonData.pinned){
					try{
						generalAPIcall(
`
query{
	Activity(id: ${jsonData.pinned}){
		... on ListActivity{
			type
			id
			user{id name avatar{medium}}
			replyCount
			likes{name}
			status
			progress
			media{
				type
				title{native romaji english}
				id
				coverImage{large}
			}
			createdAt
		}
		... on MessageActivity{
			type
			id
			text:message(asHtml: false)
			user:messenger{id name avatar{medium}}
			replyCount
			likes{name}
			createdAt
		}
		... on TextActivity{
			type
			id
			text(asHtml: false)
			user{id name avatar{medium}}
			replyCount
			likes{name}
			createdAt
		}
	}
}
`,
							{},
							function(data){
								if(!data){
									return
								}
								let adder = function(){
									let URLstuff2 = location.pathname.match(/^\/user\/([^/]*)\/?/);
									if(!URLstuff2 || decodeURIComponent(URLstuff2[1]) !== decodeURIComponent(URLstuff[1])){
										return
									}
									let feed = document.querySelector(".activity-feed-wrap");
									if(feed){
										let entry = create("div",["activity-entry","hohPinned"]);
										feed.insertBefore(entry,feed.children[0]);
										let act = data.data.Activity;
										if(act.type === "TEXT"){
											entry.classList.add("activity-text")
										}
										else if(act.type === "MESSAGE"){
											entry.classList.add("activity-message")
										}
										else if(act.type === "ANIME_LIST"){
											entry.classList.add("activity-anime_list")
										}
										else if(act.type === "MANGA_LIST"){
											entry.classList.add("activity-manga_list")
										}
let wrap = create("div","wrap",false,entry);
	let content = create("div",false,false,wrap);
		if(act.type === "TEXT" || act.type === "MESSAGE"){
			content.classList.add("text");
			let header = create("div","header",false,content);
				let avatar = create("a",["avatar","router-link-exact-active","router-link-active"],false,header);
				avatar.href = "/user/" + act.user.name + "/";
				avatar.style.backgroundImage = 'url("' + act.user.avatar.medium + '")';
				let avatarName = create("a",["name","router-link-exact-active","router-link-active"],act.user.name,header);
				avatarName.href = "/user/" + act.user.name + "/";
			let markdownWrapper = create("div","activity-markdown",false,content);
				let markdown = create("div","markdown",false,markdownWrapper);
				markdown.innerHTML = DOMPurify.sanitize(makeHtml(act.text))
		}
		else if(act.type === "ANIME_LIST" || act.type === "MANGA_LIST"){
			content.classList.add("list");
			let cover = create("a","cover",false,content);
			const linkURL = "/" + (act.type === "ANIME_LIST" ? "anime" : "manga") + "/" + act.media.id + "/" + safeURL(titlePicker(act.media)) + "/";
			cover.href = linkURL;
			cover.style.backgroundImage = 'url("' + act.media.coverImage.large + '")';
			let details = create("div","details",false,content);
				if(act.user.name !== decodeURIComponent(URLstuff[1])){
					let name = create("a",["name","router-link-exact-active","router-link-active"],act.user.name,details);
					name.href = "/user/" + act.user.name + "/"
				}
				let status = create("div","status",act.status + (act.progress ? " " + act.progress + " of " : " "),details);
				let title = create("a","title",titlePicker(act.media),status);
				title.href = linkURL
		}
	let time = create("div","time",false,wrap);
		let postLink = create("a","icon",false,time,"margin-right: 10px;");
			postLink.appendChild(svgAssets2.link.cloneNode(true));
			postLink.href = "/activity/" + act.id + "/";
			cheapReload(postLink,{name: "Activity", params: {id: act.id}});
		time.appendChild(nativeTimeElement(act.createdAt));
	let actions = create("div","actions",false,wrap);
		let actionReplies = create("a",["action","replies"],false,actions);
			let replyCount = create("span",["count"],act.replyCount || "",actionReplies);
			replyCount.appendChild(document.createTextNode(" "));
			actionReplies.appendChild(svgAssets2.reply.cloneNode(true));
			actionReplies.href = "/activity/" + act.id + "/";
			cheapReload(actionReplies,{name: "Activity", params: {id: act.id}});
		actions.appendChild(document.createTextNode(" "));
		let actionLikes = create("div",["action","likes","hohHandledLike","hohLoadedLikes"],false,actions);
			actionLikes.title = act.likes.map(like => like.name).join("\n");
			let likeWrap = create("div",["like-wrap","activity"],false,actionLikes);
				let likeButton = create("div","button",false,likeWrap);
					let likeCount = create("span","count",act.likes.length || "",likeButton);
					likeButton.appendChild(document.createTextNode(" "));
					likeButton.appendChild(svgAssets2.likeNative.cloneNode(true));
					if(act.likes.findIndex(thing => thing.name === whoAmI) !== -1){
						likeButton.classList.add("liked")
					}
					if(useScripts.accessToken){
						likeButton.onclick = function(){
							let indexPlace = act.likes.findIndex(thing => thing.name === whoAmI);
							if(indexPlace === -1){
								act.likes.push({name: whoAmI});
								likeButton.classList.add("liked")
							}
							else{
								act.likes.splice(indexPlace,1);
								likeButton.classList.remove("liked")
							}
							likeCount.innerText = act.likes.length || "";
							authAPIcall(
								"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
								{id: act.id},
								function(data){
									if(!data){
										authAPIcall(//try again once if it fails
											"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY){id}}",
											{id: act.id},
											data => {}
										)
									}
								}
							);
							deleteCacheItem("hohPinned" + jsonData.pinned)
						}
					}
									}
									else{
										setTimeout(adder,500)
									}
								};
								adder()
							},"hohPinned" + jsonData.pinned,60*1000
						)
					}
					catch(e){
						console.warn("pinned activity error",jsonData.pinned,e)
					}
				}
				else{
					let carriedOver = document.querySelector(".hohPinned");
					if(carriedOver){
						carriedOver.remove()
					}
				}
			}
			catch(e){
				console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
				console.log(e);
				console.log(atob(jsonMatch[1]));
			}
		};
		if(variables.userName === whoAmI){
			authAPIcall(query,variables,css_handler,"hohProfileBackground" + variables.userName,5*60*1000)
		}
		else{
			generalAPIcall(query,variables,css_handler,"hohProfileBackground" + variables.userName,5*60*1000)
		}
	}
}
