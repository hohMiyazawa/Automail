let newChaptersInsertion = function(extraFilters){
//called from modules/drawListStuff.js
let buttonFindChapters = create("button",["hohButton","button"],translate("$button_newChapters"),extraFilters,"display:block;");
buttonFindChapters.title = "Check if there are new chapters available for things you are reading";
buttonFindChapters.onclick = function(){
	const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
	if(!URLstuff){
		return
	}
	let scrollableContent = createDisplayBox("min-width:400px;height:500px;");
	let loader = create("p",false,translate("$scanning"),scrollableContent,"cursor:wait;");
	let bannedEntries = new Set();
	if(useScripts.bannedUpdates){
		useScripts.bannedUpdates.forEach(item => {
			bannedEntries.add(item.id)
		})
	}
	let banMode = false;
	generalAPIcall(`
	query($name: String!){
		MediaListCollection(userName: $name, type: MANGA){
			lists{
				entries{
					mediaId
					status
					media{
						status(version: 2)
					}
				}
			}
		}
	}`,
	{name: decodeURIComponent(URLstuff[1])},
	function(data){
		if(!data){
			loader.innerText = translate("$error_connection");
			return
		}
		let list = returnList(data,true).filter(a => a.status === "CURRENT" && a.media.status === "RELEASING");
		let returnedItems = 0;
		let goodItems = [];
		let banContainer = create("div",false,false,scrollableContent.parentNode,"position:absolute;bottom:10px;left:10px");
		let banButton = create("button","hohButton","Ban items",banContainer);
		let banManager = create("button","hohButton","Manage bans",banContainer);
		banButton.onclick = function(){
			banMode = !banMode;
			if(banMode){
				banButton.innerText = "Click items to ban them";
				scrollableContent.classList.add("banMode")
			}
			else{
				banButton.innerText = "Ban items";
				scrollableContent.classList.remove("banMode")
			}
		}
		banManager.onclick = function(){
			let manager = createDisplayBox("min-width:400px;height:500px;top:100px;left:220px");
			create("h3",false,"Banned entries:",manager);
			if(!useScripts.bannedUpdates || useScripts.bannedUpdates.length == "0"){
				create("p",false,"no banned items",manager);
				return
			}
			useScripts.bannedUpdates.forEach(function(item){
				let listing = create("p","hohNewChapter",false,manager);
				create("a",["link","newTab"],item.title,listing)
					.href = "/manga/" + item.id + "/" + safeURL(item.title) + "/";
				let chapterClose = create("span","hohDisplayBoxClose",svgAssets.cross,listing);
				chapterClose.onclick = function(){
					listing.remove();
					bannedEntries.delete(item.id);
					useScripts.bannedUpdates.splice(useScripts.bannedUpdates.findIndex(a => a.id === item.id));
					useScripts.save()
				}
			})
		}
		let checkListing = function(data){
			returnedItems++;
			if(returnedItems === list.length){
				loader.innerText = "";
				if(!goodItems.length){
					loader.innerText = translate("$updates_noNewManga")
				}
			}
			if(!data){
				return
			}
			let guesses = [];
			let userIdCache = new Set();
			data.data.Page.activities.forEach(function(activity){
				if(activity.progress){
					let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
					if(!userIdCache.has(activity.userId)){
						guesses.push(chapterMatch);
						userIdCache.add(activity.userId)
					}
				}
			});
			guesses.sort(VALUE_DESC);
			if(guesses.length){
				let bestGuess = guesses[0];
				if(guesses.length > 2){
					let diff = guesses[0] - guesses[1];
					let inverseDiff = 1 + Math.ceil(20/(diff+1));
					if(guesses.length >= inverseDiff){
						if(guesses[1] === guesses[inverseDiff]){
							bestGuess = guesses[1]
						}
					}
				}
				if(hasOwn(commonUnfinishedManga, data.data.MediaList.media.id)){
					if(bestGuess < commonUnfinishedManga[data.data.MediaList.media.id].chapters){
						bestGuess = commonUnfinishedManga[data.data.MediaList.media.id].chapters
					}
				}
				let bestDiff = bestGuess - data.data.MediaList.progress;
				if(bestDiff > 0 && (bestDiff < 30 || list.length <= 30)){
					goodItems.push({data:data,bestGuess:bestGuess});
					removeChildren(scrollableContent)
					goodItems.sort((b,a) => a.data.data.MediaList.score - b.data.data.MediaList.score);
					goodItems.forEach(function(item){
						let media = item.data.data.MediaList.media;
						if(bannedEntries.has(media.id)){
							return
						}
						let listing = create("p","hohNewChapter",false,scrollableContent);
						let title = titlePicker(media);
						let countPlace = create("span","count",false,listing,"width:110px;display:inline-block;");
						let progress = create("span",false,item.data.data.MediaList.progress + " ",countPlace);
						let guess = create("span",false,"+" + (item.bestGuess - item.data.data.MediaList.progress),countPlace,"color:rgb(var(--color-green));");
						progress.style.cursor = "pointer";
						progress.title = "Open list editor";
						progress.onclick = function(){
							if(banMode){
								return
							}
							document.getElementById("app").__vue__.$store.dispatch("medialistEditor/open",media.id)
						}
						if(useScripts.accessToken){
							guess.style.cursor = "pointer";
							guess.title = "Increment progress by 1";
							guess.onclick = function(){
								if(banMode){
									return
								}
								item.data.data.MediaList.progress++;
								authAPIcall(
									`mutation($id: Int,$progress: Int){
										SaveMediaListEntry(mediaId: $id,progress: $progress){id}
									}`,
									{
										id: media.id,
										progress: item.data.data.MediaList.progress
									},
									function(fib){
										if(!fib){
											item.data.data.MediaList.progress--;
											progress.innerText = item.data.data.MediaList.progress + " ";
											guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress)
										}
									}
								);
								progress.innerText = item.data.data.MediaList.progress + " ";
								if(item.bestGuess - item.data.data.MediaList.progress > 0){
									guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress)
								}
								else{
									guess.innerText = ""
								}
							}
						}
						create("a",["link","newTab"],title,listing)
							.href = "/manga/" + media.id + "/" + safeURL(title) + "/";
						let chapterClose = create("span","hohDisplayBoxClose",svgAssets.cross,listing);
						chapterClose.onclick = function(){
							if(banMode){
								return
							}
							listing.remove();
							bannedEntries.add(media.id)
						};
						listing.onclick = function(){
							if(banMode){
								if(bannedEntries.has(media.id)){
									bannedEntries.delete(media.id);
									listing.style.background = "inherit";
									useScripts.bannedUpdates.splice(useScripts.bannedUpdates.findIndex(item => item.id === media.id),1)
								}
								else {
									bannedEntries.add(media.id);
									listing.style.background = "rgb(var(--color-peach))";
									if(!useScripts.bannedUpdates){
										useScripts.bannedUpdates = []
									}
									useScripts.bannedUpdates.push({
										id: media.id,
										title: title
									})
								}
								useScripts.save()
							}
						}
					})
					create("p","hohNewChapter",false,scrollableContent)//spacer
				}
			}
		};
		let bigQuery = [];
		let queryList = [];
		list.forEach(function(entry,index){
			if(!bannedEntries.has(entry.mediaId)){
				bigQuery.push({
					query: `
query($id: Int,$userName: String){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
	MediaList(
		userName: $userName,
		mediaId: $id
	){
		progress
		score
		media{
			id
			title{romaji native english}
		}
	}
}`,
					variables: {
						id: entry.mediaId,
						userName: decodeURIComponent(URLstuff[1])
					},
					callback: checkListing
				})
			}
			if((index % 2) === 0){
				queryList.push(bigQuery);
				bigQuery = []
			}
		});
		queryPacker(bigQuery);
		queryList.forEach((littleBig,index) => {
			setTimeout(function(){queryPacker(littleBig)},index * 100)
		})
	})
}
}
