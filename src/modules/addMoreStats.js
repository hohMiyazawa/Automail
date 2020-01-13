function addMoreStats(){
	if(!document.URL.match(/\/stats\/?/)){
		return
	};
	if(document.querySelector(".hohStatsTrigger")){
		return
	};
	let filterGroup = document.querySelector(".filter-wrap");
	if(!filterGroup){
		setTimeout(function(){
			addMoreStats()
		},200);//takes some time to load
		return;
	};
	let hohStats;
	let hohGenres;
	let regularGenresTable;
	let regularTagsTable;
	let regularAnimeTable;
	let regularMangaTable;
	let animeStaff;
	let mangaStaff;
	let animeStudios;
	let hohStatsTrigger = create("span","hohStatsTrigger","More stats",filterGroup);
	let hohGenresTrigger = create("span","hohStatsTrigger","Genres & Tags",filterGroup);
	let hohSiteStats = create("a","hohStatsTrigger","Site Stats",filterGroup);
	hohSiteStats.href = "/site-stats";
	let generateStatPage = function(){
		let personalStats = create("div","#personalStats","loading anime list...",hohStats);
		let personalStatsManga = create("div","#personalStatsManga","loading manga list...",hohStats);
		let miscQueries = create("div","#miscQueries",false,hohStats);
		create("hr","hohSeparator",false,miscQueries);
		create("h1","hohStatHeading","Various queries",miscQueries);
		let miscInput = create("div",false,false,miscQueries,"padding-top:10px;padding-bottom:10px;");
		let miscOptions = create("div","#queryOptions",false,miscQueries);
		let miscResults = create("div","#queryResults",false,miscQueries);
		let user = decodeURIComponent(document.URL.match(/user\/(.+)\/stats\/?/)[1]);
		const loginMessage = "Requires being signed in to the script. You can do that at the bottom of the settings page https://anilist.co/settings/apps";
		let availableQueries = [
			{name: "First Activity",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let userFirstQuery =
					`query ($userId: Int) {
						Activity(sort: ID,userId: $userId){
							... on MessageActivity {
								id
								createdAt
							}
							... on TextActivity {
								id
								createdAt
							}
							... on ListActivity {
								id
								createdAt
							}
						}
					}`;
					generalAPIcall(userFirstQuery,{userId: userId},function(data){
						miscResults.innerText = "";
						let newPage = create("a",false,"https://anilist.co/activity/" + data.data.Activity.id,miscResults,"color:rgb(var(--color-blue));padding-right:30px;");
						newPage.href = "/activity/" + data.data.Activity.id;
						let createdAt = data.data.Activity.createdAt;
						create("span",false," " + (new Date(createdAt*1000)),miscResults);
						let possibleOlder = create("p",false,false,miscResults);
						for(var i=1;i<=15;i++){
							generalAPIcall(userFirstQuery,{userId: userId + i},function(data){
								if(!data){return};
								if(data.data.Activity.createdAt < createdAt){
									createdAt = data.data.Activity.createdAt;
									possibleOlder.innerText = "But the account is known to exist already at " + (new Date(createdAt * 1000));
								}
							})
						}
					},"hohFirstActivity" + data.data.User.id,60*1000);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Rank",code: function(){
				generalAPIcall(
					"query($name:String){User(name:$name){name stats{watchedTime chaptersRead}}}",
					{name: user},
					function(data){
						miscResults.innerText = "";
						create("p",false,"NOTE: Due to an unfixed bug in the Anilist API, these results are increasingly out of date. This query is just kept here in case future changes allows it to work properly again.",miscResults);
						create("p",false,"Time watched: " + (data.data.User.stats.watchedTime/(60*24)).roundPlaces(1) + " days",miscResults);
						create("p",false,"Chapters read: " + data.data.User.stats.chaptersRead,miscResults);
						let ranks = {
							"anime": create("p",false,false,miscResults),
							"manga": create("p",false,false,miscResults)
						};
						let recursiveCall = function(userName,amount,currentPage,minPage,maxPage,type){
							ranks[type].innerText = capitalize(type) + " rank: [calculating...] range " + ((minPage - 1)*50 + 1) + " - " + (maxPage ? maxPage*50 : "");
							generalAPIcall(
								`
query($page:Int){
	Page(page:$page){
		pageInfo{lastPage}
		users(sort:${type === "anime" ? "WATCHED_TIME_DESC" : "CHAPTERS_READ_DESC"}){
			stats{${type === "anime" ? "watchedTime" : "chaptersRead"}}
		}
	}
}`,
								{page: currentPage},
								function(data){
									if(!maxPage){
										maxPage = data.data.Page.pageInfo.lastPage
									}
									let block = (
										type === "anime"
										? Array.from(data.data.Page.users,(a) => a.stats.watchedTime)
										: Array.from(data.data.Page.users,(a) => a.stats.chaptersRead)
									);
									if(block[block.length - 1] > amount){
										recursiveCall(userName,amount,Math.floor((currentPage + 1 + maxPage)/2),currentPage + 1,maxPage,type);
										return;
									}
									else if(block[0] > amount){
										block.forEach(function(item,index){
											if(amount === item){
												ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage - 1)*50 + index + 1);
												return;
											}
										})
									}
									else if(block[0] === amount){
										if(minPage === currentPage){
											ranks[type].innerText = capitalize(type) + " rank: " + ((currentPage-1)*50 + 1)
										}
										else{
											recursiveCall(userName,amount,Math.floor((minPage + currentPage)/2),minPage,currentPage,type)
										};
										return;
									}
									else{
										recursiveCall(userName,amount,Math.floor((minPage + currentPage - 1)/2),minPage,currentPage - 1,type);
										return;
									};
								},"hohRank" + type + currentPage,60*60*1000
							);
						};
						recursiveCall(user,data.data.User.stats.watchedTime,1000,1,undefined,"anime");
						recursiveCall(user,data.data.User.stats.chaptersRead,500,1,undefined,"manga");
					},"hohRankStats" + user,2*60*1000
				);
			}},
			{name: "Hidden media entries",code: function(){
				miscResults.innerText = "";
				let pageCounter = create("p",false,false,miscResults);
				let pager = function(page,user){
					generalAPIcall(
`query ($userName: String,$page:Int) {
	Page(page:$page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(userName:$userName){
			hiddenFromStatusLists
			mediaId
			media{
				type
				title{romaji}
			}
			customLists(asArray:true)
		}
	}
}`,
						{
						  	page: page,
							userName: user
						},
						function(data){
							if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage){
								setTimeout(function(){
									pager(data.data.Page.pageInfo.currentPage + 1,user)
								},800);
							}
							pageCounter.innerText = "Searching page " + data.data.Page.pageInfo.currentPage + " of " + data.data.Page.pageInfo.lastPage;
							data.data.Page.mediaList.forEach(function(media){
								if(
									media.hiddenFromStatusLists
									&& media.customLists.every(cl => cl.enabled === false)
								){
									create("a","newTab",media.media.title.romaji,miscResults,"display:block;")
										.href = "/" + media.media.type.toLowerCase() + "/" + media.mediaId
								}
							})
						}
					);
				};pager(1,user);
			}},
			{name: "Notification count",code: function(){
				if(useScripts.accessToken){
					authAPIcall("query{Page{pageInfo{total}notifications{...on AiringNotification{id}}}}",{},function(data){
						miscResults.innerText = 
`${data.data.Page.pageInfo.total} notifications.
This is your notification count. The notifications of other users are private.`
					})
				}
				else{
					miscResults.innerText = 
`Error: Not signed in with the script. Reading notifications requires AUTH permissions.
You can sign in with the script from the settings page.`
				}
			}},
			{name: "Message Stats",code: function(){
				generalAPIcall(
					``,
					{name: user},
					data => {}
				)
			}},
			{name: "Related anime not on list",code: function(){
				generalAPIcall(
`query($name: String!){
	MediaListCollection(userName: $name,type: ANIME){
		lists{
			entries{
				mediaId
				score
				status
				media{
					relations{
						nodes{
							id
							title{romaji}
							type
						}
					}
				}
			}
		}
	}
}`,
				{name: user},function(data){
					let list = returnList(data,true);
					let listEntries = new Set(list.map(a => a.mediaId));
					let found = [];
					list.forEach(function(media){
						if(media.status !== "PLANNING"){
							media.media.relations.nodes.forEach(function(relation){
								if(!listEntries.has(relation.id) && relation.type === "ANIME"){
									relation.host = media.score;
									found.push(relation);
								}
							})
						}
					});
					found = removeGroupedDuplicates(
						found,
						e => e.id,
						(oldElement,newElement) => {
							newElement.host = Math.max(oldElement.host,newElement.host)
						}
					).sort(
						(b,a) => a.host - b.host
					);
					miscResults.innerText = "Found " + found.length + " shows:";
					found.forEach(
						item => create("a",["link","newTab"],item.title.romaji,miscResults,"display:block;padding:5px;")
							.href = "/anime/" + item.id
					)
				})
			}},
			{name: "Check compatibility with all following (slow)",setup: function(){
				create("span",false,"List Type: ",miscOptions);
				let select = create("select","#typeSelect",false,miscOptions);
				let animeOption = create("option",false,"Anime",select);
				let mangaOption = create("option",false,"Manga",select);
				animeOption.value = "ANIME";
				mangaOption.value = "MANGA";
			},code: function(){
				miscResults.innerText = "";
				let loadingStatus = create("p",false,false,miscResults);
				loadingStatus.innerText = "Looking up ID...";
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let currentLocation = location.pathname;
					loadingStatus.innerText = "Loading media list...";
					let typeList = document.getElementById("typeSelect").value;
					generalAPIcall(
						queryMediaListCompat,
						{
							name: user,
							listType: typeList
						},
						function(data){
							loadingStatus.innerText = "Loading users...";
							let comDisplay = create("div",false,false,miscResults);
							let list = returnList(data).filter(element => element.scoreRaw);
							let comCache = [];
							let drawComCache = function(){
								removeChildren(comDisplay)
								comCache.forEach(function(friend){
									let userRow = create("p",false,false,comDisplay);
									let differenceSpan = create("span",false,friend.difference.toPrecision(3),userRow,"min-width:60px;display:inline-block;");
									if(friend.difference < 0.9){
										differenceSpan.style.color = "green"
									}
									else if(friend.difference > 1.1){
										differenceSpan.style.color = "red"
									};
									let friendLink = create("a","newTab",friend.user,userRow,"color:rgb(var(--color-blue))");
									friendLink.href = "/user/" + friend.user;
									create("span",false,", " + friend.shared + " shared.",userRow);
								})
							};
							let friendsCaller = function(page){
								generalAPIcall(
									`query($id: Int!,$page: Int){
										Page(page: $page){
											pageInfo{
												lastPage
											}
											following(userId: $id,sort: USERNAME){
												name
											}
										}
									}`,
									{id: userId,page: page},
									function(data){
										let index = 0;
										let delayer = function(){
											if(location.pathname !== currentLocation){
												return
											}
											loadingStatus.innerText = "Comparing with " + data.data.Page.following[index].name + "...";
											compatCheck(list,data.data.Page.following[index].name,typeList,function(data){
												if(data.difference){
													comCache.push(data);
													comCache.sort((a,b) => a.difference - b.difference);
													drawComCache();
												}
											});
											if(++index < data.data.Page.following.length){
												setTimeout(delayer,1000)
											}
											else{
												if(page < data.data.Page.pageInfo.lastPage){
													friendsCaller(page + 1)
												}
												else{
													loadingStatus.innerText = ""
												}
											}
										};delayer(index);
									}
								)
							};friendsCaller(1);
						},"hohCompatANIME" + user,5*60*1000
					);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Message spy",code: function(){
				miscResults.innerText = "";
				let page = 1;
				let results = create("div",false,false,miscResults);
				let moreButton = create("button",["button","hohButton"],"Load more",miscResults);
				let getPage = function(page){
					generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(type: MESSAGE,sort: ID_DESC){
			... on MessageActivity{
				id
				recipient{name}
				message(asHtml: true)
				pure:message(asHtml: false)
				createdAt
				messenger{name}
			}
		}
	}
}`,
						{page: page},
						data => {
							data.data.Page.activities.forEach(function(message){
								if(
									message.pure.includes("AWC")
									|| message.pure.match(/^.{0,8}(thanks|tha?n?x|thank|ty).*follow.{0,10}(http.*(jpg|png|gif))?.{0,10}$/i)
									|| message.pure.match(/for( the)? follow/i)
								){
									return
								};
								let time = new Date(message.createdAt*1000);
								let newElem = create("div","message",false,results);
								create("span","time",time.toISOString().match(/^(.*)\.000Z$/)[1] + " ",newElem);
								let user = create("a",["link","newTab"],message.messenger.name,newElem,"color:rgb(var(--color-blue))");
								user.href = "/user/" + message.messenger.name;
								create("span",false," sent a message to ",newElem);
								let user2 = create("a",["link","newTab"],message.recipient.name,newElem,"color:rgb(var(--color-blue))");
								user2.href = "/user/" + message.recipient.name;
								let link = create("a",["link","newTab"]," Link",newElem);
								link.href = "/activity/" + message.id;
								newElem.innerHTML += DOMPurify.sanitize(message.message);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
								create("hr",false,false,results);
							})
						}
					);
				};getPage(page);
				moreButton.onclick = function(){
					page++;
					getPage(page);
				}
			}},
			{name: "Media statistics of friends",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					generalAPIcall(
						`
query($userId: Int!){
	a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
	a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
	a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
	a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
	a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
	a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
	a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
	a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
	a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
	a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
	User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	statistics{
		anime{
			count
			minutesWatched
		}
		manga{
			count
			chaptersRead
			volumesRead
		}
	}
	stats{
		watchedTime
		chaptersRead
	}
}`,
						{userId: data.data.User.id},
						function(stats){
							let userList = [].concat(
								...Object.keys(stats.data).map(
									a => stats.data[a].following || []
								)
							);
							userList.push(stats.data.User);
							//API error polyfill
							userList.forEach(function(wrong){
								if(!wrong.statistics.anime.minutesWatched){
									wrong.statistics.anime.minutesWatched = wrong.stats.watchedTime
								}
								if(!wrong.statistics.manga.chaptersRead){
									wrong.statistics.manga.chaptersRead = wrong.stats.chaptersRead
								}
							});
							userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
							miscResults.innerText = "";
							let drawUserList = function(){
								removeChildren(miscResults)
								let table = create("div",["table","hohTable","hohNoPointer","good"],false,miscResults);
								let headerRow = create("div",["header","row"],false,table);
								let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
								let animeCountHeading = create("div",false,"Anime Count",headerRow,"cursor:pointer;");
								let animeTimeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
								let mangaCountHeading = create("div",false,"Manga Count",headerRow,"cursor:pointer;");
								let mangaChapterHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
								let mangaVolumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
								userList.forEach(function(user,index){
									let row = create("div","row",false,table);
									if(user.name === stats.data.User.name || user.name === whoAmI){
										row.style.color = "rgb(var(--color-blue))";
										row.style.background = "rgb(var(--color-background))";
									}
									let nameCel = create("div",false,(index + 1) + " ",row);
									let userLink = create("a",["link","newTab"],user.name,nameCel);
									userLink.href = "/user/" + user.name;
									create("div",false,user.statistics.anime.count,row);
									let timeString = formatTime(user.statistics.anime.minutesWatched*60);
									if(!user.statistics.anime.minutesWatched){
										timeString = "-"
									}
									create("div",false,timeString,row);
									create("div",false,user.statistics.manga.count,row);
									if(user.statistics.manga.chaptersRead){
										create("div",false,user.statistics.manga.chaptersRead,row)
									}
									else{
										create("div",false,"-",row)
									}
									if(user.statistics.manga.volumesRead){
										create("div",false,user.statistics.manga.volumesRead,row)
									}
									else{
										create("div",false,"-",row)
									}
								});
								nameHeading.onclick = function(){
									userList.sort(ALPHABETICAL(a => a.name));
									drawUserList();
								};
								animeCountHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.anime.count - b.statistics.anime.count);
									drawUserList();
								};
								animeTimeHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.anime.minutesWatched - b.statistics.anime.minutesWatched);
									drawUserList();
								};
								mangaCountHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.count - b.statistics.manga.count);
									drawUserList();
								};
								mangaChapterHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.chaptersRead - b.statistics.manga.chaptersRead);
									drawUserList();
								};
								mangaVolumeHeading.onclick = function(){
									userList.sort((b,a) => a.statistics.manga.volumesRead - b.statistics.manga.volumesRead);
									drawUserList();
								};
							};drawUserList();
						}
					)
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Most popular favourites of friends",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					generalAPIcall(
						`
query($userId: Int!){
	a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
	a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
	a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
	a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
	a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
	a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
	a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
	a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
	a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
	a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
	User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	favourites{
		anime1:anime(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		anime2:anime(page:2){
			nodes{
				id
				title{romaji}
			}
		}
		manga1:manga(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		manga2:manga(page:2){
			nodes{
				id
				title{romaji}
			}
		}
	}
}`,
						{userId: data.data.User.id},
						function(foll){
							let userList = [].concat(
								...Object.keys(foll.data).map(
									a => foll.data[a].following || []
								)
							);
							let me = foll.data.User;
							me.favourites.anime = me.favourites.anime1.nodes.concat(me.favourites.anime2.nodes);
							delete me.favourites.anime1;
							delete me.favourites.anime2;
							me.favourites.manga = me.favourites.manga1.nodes.concat(me.favourites.manga2.nodes);
							delete me.favourites.manga1;
							delete me.favourites.manga2;
							let animeFavs = {};
							let mangaFavs = {};
							userList.forEach(function(user){
								user.favourites.anime = user.favourites.anime1.nodes.concat(user.favourites.anime2.nodes);
								delete user.favourites.anime1;
								delete user.favourites.anime2;
								user.favourites.anime.forEach(fav => {
									if(animeFavs[fav.id]){
										animeFavs[fav.id].count++
									}
									else{
										animeFavs[fav.id] = {
											count: 1,
											title: fav.title.romaji
										}
									}
								});
								user.favourites.manga = user.favourites.manga1.nodes.concat(user.favourites.manga2.nodes);
								delete user.favourites.manga1;
								delete user.favourites.manga2;
								user.favourites.manga.forEach(fav => {
									if(mangaFavs[fav.id]){
										mangaFavs[fav.id].count++
									}
									else{
										mangaFavs[fav.id] = {
											count: 1,
											title: fav.title.romaji
										}
									}
								})
							});
							miscResults.innerText = "";
							create("h1",false,"Anime:",miscResults,"color:rgb(var(--color-blue))");
							Object.keys(animeFavs).map(key => animeFavs[key]).sort((b,a) => a.count - b.count).slice(0,20).forEach(function(entry){
								create("p",false,entry.count + ": " + entry.title,miscResults)
							});
							create("h1",false,"Manga:",miscResults,"color:rgb(var(--color-blue))");
							Object.keys(mangaFavs).map(key => mangaFavs[key]).sort((b,a) => a.count - b.count).slice(0,20).forEach(function(entry){
								create("p",false,entry.count + ": " + entry.title,miscResults)
							});
							create("h1",false,"Similar favs:",miscResults,"color:rgb(var(--color-blue))");
							let sharePerc = user => {
								let total = user.favourites.anime.length + user.favourites.manga.length + me.favourites.anime.length + me.favourites.manga.length;
								let shared = user.favourites.anime.filter(
									a => me.favourites.anime.some(
										b => a.id === b.id
									)
								).length + user.favourites.manga.filter(
									a => me.favourites.manga.some(
										b => a.id === b.id
									)
								).length;
								return shared/total;
							};
							userList.sort((b,a) => sharePerc(a) - sharePerc(b));
							userList.slice(0,10).forEach(entry => {
								let row = create("p",false,false,miscResults);
								create("a","newTab",entry.name,row)
									.href = "/user/" + entry.name
							});
						}
					)
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Fix your dating mess",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
					let delay = 0;
					miscResults.innerText = "";
					removeChildren(miscResults)
					removeChildren(miscOptions)
					let config = [
						{
							description: "Completion date before start date",
							code: media => fuzzyDateCompare(media.startedAt,media.completedAt) === 0
						},{
							description: "Completion date before official end date",
							code: media => fuzzyDateCompare(media.media.endDate,media.completedAt) === 0
						},{
							description: "Start date before official release date",
							code: media => fuzzyDateCompare(media.media.startDate,media.startedAt) === 0
						},{
							description: "Status completed but no completion date set",
							code: media => media.status === "COMPLETED" && !media.completedAt.year
						},{
							description: "Status completed but no start date set",
							code: media => media.status === "COMPLETED" && !media.startedAt.year
						},{
							description: "Status dropped but no start date set",
							code: media => media.status === "DROPPED" && !media.startedAt.year
						},{
							description: "Status current but no start date set",
							code: media => media.status === "CURRENT" && !media.startedAt.year
						},{
							description: "Planning entry with start date",
							code: media => media.status === "PLANNING" && media.startedAt.year
						},{
							description: "Dates in the far future or past",
							code: media => (
									media.startedAt.year && (media.startedAt.year < 1960 || media.startedAt.year > (new Date().getFullYear() + 3))
								) || (
									media.completedAt.year && (media.completedAt.year < 1960 || media.completedAt.year > (new Date().getFullYear() + 3))
								)
						}
					];
					config.forEach(function(setting){
						let row = create("p",false,false,miscOptions);
						let checkBox = createCheckbox(row);
						let label = create("span",false,setting.description,row);
						checkBox.checked = true;
						checkBox.onchange = function(){
							Array.from(miscResults.children).forEach(res => {
								if(res.children[1].innerText === setting.description){
									if(checkBox.checked){
										res.style.display = "block"
									}
									else{
										res.style.display = "none"
									}
								}
							})
						}
					});
					let proc = function(data){
						let list = returnList(data,true);
						list.forEach(function(item){
							let matches = [];
							config.forEach(setting => {
								if(setting.code(item)){
									matches.push(setting.description)
								}
							});
							if(matches.length){
								let row = create("p",false,false,miscResults);
								let link = create("a",["link","newTab"],item.media.title.romaji,row,"width:440px;display:inline-block;");
								link.href = "/" + item.media.type.toLowerCase() + "/" + item.mediaId + "/" + safeURL(item.media.title.romaji);
								create("span",false,matches.join(", "),row);
								let chance = create("p",false,false,row,"margin-left:20px;margin-top: 2px;");
								create("span",false,"Entry created: " + (new Date(item.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
								if(
									(new Date(item.createdAt*1000)).toISOString().split("T")[0]
									!== (new Date(item.updatedAt*1000)).toISOString().split("T")[0]
								){
									create("span",false,"Entry updated: " + (new Date(item.updatedAt*1000)).toISOString().split("T")[0] + " \n",chance);
								}
								if(item.repeat){
									create("span",false,"Repeats: " + item.repeat + " \n",chance);
								}
								setTimeout(function(){
									generalAPIcall(
										`
										query($userId: Int,$mediaId: Int){
											first:Activity(userId: $userId,mediaId: $mediaId,sort: ID){... on ListActivity{createdAt siteUrl status progress}}
											last:Activity(userId: $userId,mediaId: $mediaId,sort: ID_DESC){... on ListActivity{createdAt siteUrl status progress}}
										}
										`,
										{
											userId: iddata.data.User.id,
											mediaId: item.mediaId
										},
										function(act){
											if(!act){return};
											let progressFirst = [act.data.first.status,act.data.first.progress].filter(TRUTHY).join(" ");
											progressFirst = (progressFirst ? " (" + progressFirst + ")" : "");
											let progressLast = [act.data.last.status,act.data.last.progress].filter(TRUTHY).join(" ");
											progressLast = (progressLast ? " (" + progressLast + ")" : "");
											if(act.data.first.siteUrl === act.data.last.siteUrl){
												let firstLink = create("a",["link","newTab"],"Only activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
												firstLink.href = act.data.first.siteUrl;
												create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
											}
											else{
												let firstLink = create("a",["link","newTab"],"First activity" + progressFirst + ": ",chance,"color:rgb(var(--color-blue));");
												firstLink.href = act.data.first.siteUrl;
												create("span",false,(new Date(act.data.first.createdAt*1000)).toISOString().split("T")[0] + " \n",chance);
												let lastLink = create("a",["link","newTab"],"Last activity" + progressLast + ": ",chance,"color:rgb(var(--color-blue));");
												lastLink.href = act.data.last.siteUrl;
												create("span",false,(new Date(act.data.last.createdAt*1000)).toISOString().split("T")[0] + " ",chance);
											}
										}
									);
								},delay);
								delay += 1000;
							}
						})
					};
					const query = `query($name: String!, $listType: MediaType){
							MediaListCollection(userName: $name, type: $listType){
								lists{
									entries{
										startedAt{year month day}
										completedAt{year month day}
										mediaId
										status
										createdAt
										updatedAt
										repeat
										media{
											title{romaji english native}
											startDate{year month day}
											endDate{year month day}
											type
										}
									}
								}
							}
						}`;
					generalAPIcall(
						query,
						{
							name: user,
							listType: "MANGA"
						},
						proc
					);
					generalAPIcall(
						query,
						{
							name: user,
							listType: "ANIME"
						},
						proc
					);
				},"hohIDlookup" + user.toLowerCase());
			}},
			{name: "Fix your dating mess [Dangerous edition]",setup: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				};
				if(user.toLowerCase() !== whoAmI.toLowerCase()){
					miscResults.innerText = "This is the profile of\"" + user + "\", but currently signed in as \"" + whoAmI + "\". Are you sure this is right?";
					return
				};
				let warning = create("b",false,"Clicking on red buttons means changes to your data!",miscResults);
				let description = create("p",false,"When run, this will do the following:",miscResults);
				create("p",false,"- Completed entries with 1 episode/chapter, no rewatches, no start date, but a completion date will have the start date set equal to the completion date",miscResults);
				create("p",false,"- A list of all the changes will be printed.",miscResults);
				create("p",false,"- This will run slowly, and can be stopped at any time.",miscResults);
				let dryRun = create("button",["button","hohButton"],"Dry run",miscResults);
				let dryRunDesc = create("span",false,"(no changes made)",miscResults);
				create("hr",false,false,miscResults);
				let fullRun = create("button",["button","hohButton","danger"],"RUN",miscResults);
				let stopRun = create("button",["button","hohButton"],"Abort!",miscResults);
				create("hr",false,false,miscResults);
				let changeLog = create("div",false,false,miscResults);
				let allowRunner = true;
				let allowRun = true;
				let isDryRun = true;
				let list = [];
				let firstTime = true;
				let runner = function(){
					if(!allowRunner){
						return
					}
					allowRunner = false;
					fullRun.disabled = true;	
					dryRun.disabled = true;
					generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata){
						let proc = function(data){
							list = list.concat((returnList(data,true) || []).filter(
								item => item.status === "COMPLETED" && (item.media.episodes || item.media.chapters) === 1 && (!item.startedAt.year) && item.completedAt.year && !item.repeat
							));
							if(firstTime){
								firstTime = false;
								return
							};
							if(isDryRun){
								create("p",false,"DRY RUN",changeLog)
							};
							if(!list.length){
								changeLog.innerText = "No such entries found";
								return
							};
							create("p",false,"Found " + list.length + " entries.",changeLog);
							let changer = function(index){
								if(!allowRun){
									return
								};
								create("p",false,list[index].media.title.romaji + " start date set to " + list[index].completedAt.year + "-" + list[index].completedAt.month + "-" + list[index].completedAt.day,changeLog);
								if(!isDryRun){
									authAPIcall(
										`mutation($date: FuzzyDateInput,$mediaId: Int){
											SaveMediaListEntry(startedAt: $date,mediaId: $mediaId){
												id
											}
										}`,
										{mediaId: list[index].mediaId,date: list[index].completedAt},
										data => {}
									)
								};
								index++;
								if(index < list.length){
									setTimeout(function(){changer(index)},1000)
								};
							};changer(0);
						};
						const query = `query($name: String!, $listType: MediaType){
								MediaListCollection(userName: $name, type: $listType){
									lists{
										entries{
											startedAt{year month day}
											completedAt{year month day}
											mediaId
											status
											repeat
											media{
												title{romaji english native}
												chapters
												episodes
											}
										}
									}
								}
							}`;
						generalAPIcall(
							query,
							{
								name: user,
								listType: "MANGA"
							},
							proc
						);
						generalAPIcall(
							query,
							{
								name: user,
								listType: "ANIME"
							},
							proc
						);
					},"hohIDlookup" + user.toLowerCase())
				};
				stopRun.onclick = function(){
					allowRun = false;
					stopRun.disable = true;
					alert("Stopped!")
				};
				fullRun.onclick = function(){
					isDryRun = false;
					runner()
				};
				dryRun.onclick = function(){
					runner()
				};
			},code: function(){
				miscResults.innerText = "Read the description first!"
			}},
			{name: "Reviews",code: function(){
				miscResults.innerText = "";
				let dataHeader = create("div",false,false,miscResults);
				create("span",false,"There are ",dataHeader);
				let data_amount = create("span",false,"[loading...]",dataHeader);
				create("span",false," reviews on Anilist, with ",dataHeader);
				let data_ratingAmount = create("span",false,"[loading...]",dataHeader);
				create("span",false," ratings (",dataHeader);
				let data_ratingPositive = create("span",false,"[loading...]",dataHeader);
				create("span",false,"% positive)",dataHeader);
				generalAPIcall(
					`query ($page: Int) {
						Page (page: $page) {
							pageInfo {
								total
								perPage
								currentPage
								lastPage
								hasNextPage
							}
							reviews {
								id
							}
						}
					}`,
					{page: 1},
					function(data){
						data_amount.innerText = data.data.Page.pageInfo.total;
						let list = [];
						for(var i=1;i<=data.data.Page.pageInfo.lastPage;i++){
							generalAPIcall(
								`query ($page: Int){
									Page (page: $page){
										pageInfo{
											total
											perPage
											currentPage
											lastPage
											hasNextPage
										}
										reviews{
											id
											rating
											ratingAmount
											score
											user{
												name
												id
											}
											media{
												id
												title{romaji}
											}
										}
									}
								}`,
								{page: i},
								function(reviewData){
									list = list.concat(reviewData.data.Page.reviews);
									if(list.length !== reviewData.data.Page.pageInfo.total){
										return
									};
									list.sort((b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left);
									create("h3",false,"100 best reviews on Anilist",miscResults);
									let datalist1 = create("div",false,false,miscResults);
									list.slice(0,100).forEach((review,index) => {
										let dataCel = create("p",false,false,datalist1);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(review.rating,review.ratingAmount).left.toPrecision(3) + " ",dataCel);
										let userName = "[error]";
										if(review.user){
											if(review.user.name){
												userName = review.user.name
											}
										};
										create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
											.href = "/review/" + review.id
									});
									list.sort((a,b)=>wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
									create("h3",false,"100 worst reviews on Anilist",miscResults);
									let datalist2 = create("div",false,false,miscResults);
									list.slice(0,100).forEach((review,index) => {
										let dataCel = create("p",false,false,datalist2);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(review.rating,review.ratingAmount).right.toPrecision(3) + " ",dataCel);
										let userName = "[error]";
										if(review.user){
											if(review.user.name){
												userName = review.user.name
											}
										};
										create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
											.href = "/review/" + review.id
									});
									let reviewers = new Map();
									let ratings = 0;
									let positiveRatings = 0;
									list.forEach(rev => {
										ratings += rev.ratingAmount;
										positiveRatings += rev.rating;
										if(rev.user){
											if(rev.user.id){
												if(!reviewers.has(rev.user.id)){
													reviewers.set(rev.user.id,{
														id: rev.user.id,
														name: rev.user.name,
														rating: 0,
														ratingAmount: 0,
														amount: 0
													});
												}
												let person = reviewers.get(rev.user.id);
												person.rating += rev.rating;
												person.ratingAmount += rev.ratingAmount;
												person.amount++;
											};
										};
									});
									data_ratingAmount.innerText = ratings;
									data_ratingPositive.innerText = Math.round(100 * positiveRatings/ratings);
									reviewers = [...reviewers].map(
										pair => pair[1]
									).sort(
										(b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left
									);
									create("h3",false,"10 best reviewers on Anilist",miscResults);
									let datalist3 = create("div",false,false,miscResults);
									reviewers.slice(0,10).forEach((rev,index) => {
										let dataCel = create("p",false,false,datalist3);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).left.toPrecision(3) + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed"
									});
									reviewers.sort((a,b) => wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
									create("h3",false,"10 worst reviewers on Anilist",miscResults);
									let datalist4 = create("div",false,false,miscResults);
									reviewers.slice(0,10).forEach((rev,index) => {
										let dataCel = create("p",false,false,datalist4);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).right.toPrecision(3) + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed"
									});
									reviewers.sort(function(b,a){
										if(a.amount === b.amount){//rating as tie-breaker
											return a.rating/a.ratingAmount - b.rating/b.ratingAmount;
										}
										else{
											return a.amount - b.amount
										}
									});
									create("h3",false,"25 most prolific reviewers on Anilist",miscResults);
									let datalist5 = create("div",false,false,miscResults);
									let profilicSum = 0;
									reviewers.slice(0,25).forEach((rev,index) => {
										profilicSum += rev.amount;
										let dataCel = create("p",false,false,datalist5);
										create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
										create("span","hohMonospace",rev.amount + " ",dataCel);
										let userName = rev.name || "[private or deleted]";
										let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
										link.href = "/user/" + rev.name || "removed";
										create("span",false," average rating: " + (100*rev.rating/rev.ratingAmount).toPrecision(2) + "%",dataCel);
									});
									create("p",false,"That's " + Math.round(100*profilicSum/list.length) + "% of all reviews on Anilist",miscResults);
									let average = (data.data.Page.pageInfo.total/reviewers.length).toPrecision(2);
									let median = Stats.median(reviewers.map(e => e.amount));
									let mode = Stats.mode(reviewers.map(e => e.amount));
									create("p",false,`${reviewers.length} users have contributed reviews (${average} reviews each on average, median ${median}, mode ${mode})`,miscResults);
									let lowRatingRating = 0;
									let lowRatingAmount = 0;
									let lowRatingCount = 0;
									let highRatingRating = 0;
									let highRatingAmount = 0;
									let highRatingCount = 0;
									let topRatingRating = 0;
									let topRatingAmount = 0;
									let topRatingCount = 0;
									let distribution = new Array(101).fill(0);//0 to 100 inclusive, since 0 is a valid review score
									create("hr",false,false,miscResults);
									list.forEach(review => {
										distribution[review.score]++;
										if(review.score <= 50){
											lowRatingRating += review.rating;
											lowRatingAmount+= review.ratingAmount;
											lowRatingCount++;
										}
										else{
											highRatingRating += review.rating;
											highRatingAmount+= review.ratingAmount;
											highRatingCount++;
											if(review.score == 100){
												topRatingRating += review.rating;
												topRatingAmount+= review.ratingAmount;
												topRatingCount++;
											}
										}
									});
									create("p",false,"The " + lowRatingCount + " reviews with a score 0-50 are rated " + (100*lowRatingRating/lowRatingAmount).toPrecision(2) + "% on average.",miscResults);
									create("p",false,"The " + highRatingCount + " reviews with a score 51-100 are rated " + (100*highRatingRating/highRatingAmount).toPrecision(2) + "% on average.",miscResults);
									create("p",false,"The " + topRatingCount + " reviews with a score 100/100 are rated " + (100*topRatingRating/topRatingAmount).toPrecision(2) + "% on average.",miscResults);

									create("p",false,"The average score for a review to give is " + Stats.average(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									create("p",false,"The median score for a review to give is " + Stats.median(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									create("p",false,"The most common score for a review to give is " + Stats.mode(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
									const height = 250;
									const width = 700;
									let dia = svgShape("svg",miscResults,{
										width: width,
										height: height,
										viewBox: "0 0 " + width + " " + height
									});
									dia.style.borderRadius = "3px";
									let background = svgShape("rect",dia,{
										fill: "rgb(var(--color-foreground))",
										x: 0,
										y: 0,
										width: "100%",
										height: "100%"
									});
									let margin = {
										bottom: 30,
										top: 30,
										left: 20,
										right: 20
									};
									const bars = 101;
									const barWidth = 0.74 * (width - margin.left - margin.right)/bars;
									const barSpacing = 0.24 * (width - margin.left - margin.right)/bars;
									let maxVal = Math.max(...distribution);
									let magnitude = Math.pow(10,Math.floor(Math.log10(maxVal)));
									let mantissa = maxVal/magnitude;
									if(mantissa < 1.95){
										maxVal = 2*magnitude
									}
									else if(mantissa < 2.95){
										maxVal = 3*magnitude
									}
									else if(mantissa < 4.9){
										maxVal = 5*magnitude
									}
									else if(mantissa < 9.8){
										maxVal = 10*magnitude
									}
									else{
										maxVal = 15*magnitude
									};
									let valueFunction = function(val){
										return height - margin.bottom - (val/maxVal) * (height - margin.bottom - margin.top)
									};
									let title = svgShape("text",dia,{
										x: 10,
										y: 20,
										fill: "rgb(var(--color-text))"
									});
									title.textContent = "Review score distribution";
									distribution.forEach((val,index) => {
										if(!val){
											return;
										}
										let colour = "rgb(var(--color-text))";
										if(index % 10 === 0){
											colour = "rgb(61,180,242)";
											let text = svgShape("text",dia,{
												x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
												y: valueFunction(val) - barWidth,
												fill: colour,
												"text-anchor": "middle",
											});
											text.textContent = val;
											let text2 = svgShape("text",dia,{
												x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
												y: height - margin.bottom + 3*barWidth,
												fill: colour,
												"text-anchor": "middle",
											});
											text2.textContent = index;
										}
										else if(index % 10 === 5){
											colour = "rgb(123,213,85)"
										}
										svgShape("rect",dia,{
											x: margin.left + index*barWidth + index*barSpacing,
											y: valueFunction(val),
											width: barWidth,
											height: height - valueFunction(val) - margin.bottom,
											fill: colour
										})
									})
								}
							)
						};
					}
				);
			}},
			{name: "How many people have blocked you",code: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				}
				authAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data){
					generalAPIcall("query{Page{pageInfo{total}users{id}}}",{},function(data2){
						miscResults.innerText = "This only applies to you, regardless of what stats page you ran this query from.";
						if(data.data.Page.pageInfo.total === data2.data.Page.pageInfo.total){
							create("p",false,"No users have blocked you",miscResults)
						}
						else if((data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) < 0){
							create("p",false,"Error: The elevated privileges of moderators makes this query fail",miscResults)
						}
						else{
							create("p",false,(data2.data.Page.pageInfo.total - data.data.Page.pageInfo.total) + " users have blocked you",miscResults)
						}
					})
				})
			}},
			{name: "Find people you have blocked/are blocked by",code: function(){
				if(!useScripts.accessToken){
					miscResults.innerText = loginMessage;
					return
				}
				miscResults.innerText = `This only applies to you, regardless of what stats page you ran this query from. Furthermore, it probably won't find everyone.
Use the other query if you just want the number.`;
				let flag = true;
				let stopButton = create("button",["button","hohButton"],"Stop",miscResults,"display:block");
				let progress = create("p",false,false,miscResults);
				stopButton.onclick = function(){
					flag = false
				};
				let blocks = new Set();
				progress.innerText = "1 try..."
				let caller = function(page,page2){
					generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
				user{name}
			}
		}
	}
}`,
					{page: page},function(data){
						progress.innerText = (page + 1) + " tries...";
						authAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
			}
		}
	}
}`,						{page: page2},function(data2){
							let offset = 0;
							while(data2.data.Page.activities[offset].id > data.data.Page.activities[0].id){
								offset++
							};
							while(data2.data.Page.activities[0].id < data.data.Page.activities[-offset].id){
								offset--
							};
							for(var k=Math.max(-offset,0);k<data.data.Page.activities.length && (k + offset)<data2.data.Page.activities.length;k++){
								if(data.data.Page.activities[k].id !== data2.data.Page.activities[k + offset].id){
									offset--;
									if(!blocks.has(data.data.Page.activities[k].user.name)){
										let row = create("p",false,false,miscResults);
										let link = create("a",["link","newTab"],data.data.Page.activities[k].user.name,row);
										link.href = "/user/" + data.data.Page.activities[k].user.name;
										blocks.add(data.data.Page.activities[k].user.name)
									}
								};
							};
							if(flag){
								if(offset < -50){
									page2--
								};
								setTimeout(function(){caller(page + 1,page2 + 1)},2000)
							}
						})
					});
				};caller(1,1);
			}},
			{name: "BroomCat linter",setup: function(){
				create("p",false,"Welcome to BroomCat. It will help you find stray database items",miscOptions);
				let select = create("select","#typeSelect",false,miscOptions);
				let animeOption = create("option",false,"Anime",select);
				let mangaOption = create("option",false,"Manga",select);
				animeOption.value = "ANIME";
				mangaOption.value = "MANGA";
				createCheckbox(miscOptions,"restrictToList");
				create("span",false,"Restrict to personal list",miscOptions);
				create("h3",false,"Config",miscOptions);
				let conf = function(description,id,defaultValue,titleText){
					let option = create("p",false,false,miscOptions);
					let check = createCheckbox(option,id);
					let descriptionText = create("span",false,description + " ",option);
					if(defaultValue){
						check.checked = defaultValue
					}
					if(titleText){
						descriptionText.title = titleText
					}
				};
				[
					["End date before start date","startEnd",true],
					["Dates before 1900","earlyDates",true],
					["Missing dates","missingDates",true],
					["Incomplete dates","incompleteDates"],
					["No tags","noTags"],
					["No genres","noGenres"],
					["Has tag below 20%","lowTag",false,"Tags start out at 20%, so if it's below it's controversial"],
					["Has invalid genre","badGenre",true,"There's a fixed list of 19 genres, so anything else must be wrong"],
					["Missing banner","noBanner"],
					["Oneshot without one chapter","oneshot",false,"This is a requirement in the documentation"],
					["Missing MAL ID","idMal",false,"Anilist stores MAL IDs to make list imports and interactions between databases simpler"],
					["Duplicated MAL ID","duplicatedMALID"],
					["Missing native title","nativeTitle",true,"Everything has a native title, even if it's the same"],
					["Missing english title","englishTitle",false,"Not necessarily wrong, not everything is licensed"],
					["No duration","noDuration",true],
					["No chapter or episode count","noLength",true],
					["Multiple demographic tags","demographics"],
					["No studios","noStudios"],
					["Unusual length","unusualLength",true,"Doesn't have to be wrong, just check them"],
					["No source","noSource"],
					["Source = other","otherSource",false,"Anilist introduced new sources, so some of these may need to be changed"],
					["Source = original, but has source relation","badOriginalSource"],
					["More than one source","moreSource",false,"Doesn't have to be wrong, but many of these are"],
					["Adaptation older than source","newSource"],
					["Source field not equal to source media format","formatSource"],
					["Hentai with isAdult = false","nonAdultHentai"],
					["Synonym equal to title","redundantSynonym",true],
					["No extraLarge cover image","extraLarge"],
					["Temporary title","tempTitle",true,"Common for manga announcements"],
					["Romaji inconsistencies","badRomaji",true,"Catches some common romanisation errors"],
					["Weird spacing in title","weirdSpace",true],
					["TV/TV Short mixup","tvShort"],
					["Duplicated studio","duplicatedStudio"],
					["Has Twitter hashtag","hashtag",false,"Keep up with news"],
					["Releasing manga with non-zero chapter or volume count","releasingZero"],
					["Bad character encoding in description","badEncoding"],
					["Commonly misspelled words in description","badSpelling",true],
					["No description (or very short)","noDescription",true],
					["Very long description","longDescription"],
					["Likely outdated description","outdatedDescription",true,"Checks if the description appears to have been written before the series aired"]
				].forEach(ig => conf(...ig));
			},code: function(){
				let type = document.getElementById("typeSelect").value;
				let restrict = document.getElementById("restrictToList").checked;
				let require = new Set();
				let malIDs = new Set();
				let config = [
					{name: "startEnd",description: "End date before start date",code: function(media){
						if(!media.startDate.year || !media.endDate.year){
							return false
						}
						if(media.startDate.year > media.endDate.year){
							return true
						}
						else if(media.startDate.year < media.endDate.year){
							return false
						}
						if(!media.startDate.month || !media.endDate.month){
							return false
						}
						if(media.startDate.month > media.endDate.month){
							return true
						}
						else if(media.startDate.month < media.endDate.month){
							return false
						}
						if(!media.startDate.day || !media.endDate.day){
							return false
						}
						if(media.startDate.day > media.endDate.day){
							return true
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}"]},
					{name: "earlyDates",description: "Dates before 1900",code: function(media){
						return (media.startDate.year && media.startDate.year < 1900) || (media.endDate.year && media.endDate.year < 1900)
					},require: ["startDate{year month day}","endDate{year month day}"]},
					{name: "missingDates",description: "Missing dates",code: function(media){
						if(media.status === "FINISHED"){
							return (!media.startDate.year) || (!media.endDate.year);
						}
						else if(media.status === "RELEASING"){
							return !media.startDate.year;
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}","status"]}
,
					{name: "incompleteDates",description: "Incomplete dates",code: function(media){
						if(media.status === "FINISHED"){
							return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day) || (!media.endDate.year) || (!media.endDate.month) || (!media.endDate.day);
						}
						else if(media.status === "RELEASING"){
							return (!media.startDate.year) || (!media.startDate.month) || (!media.startDate.day)
						}
						return false;
					},require: ["startDate{year month day}","endDate{year month day}","status"]},
					{name: "noTags",description: "No tags",code: function(media){
						return media.tags.length === 0;
					},require: ["tags{rank name}"]},
					{name: "noGenres",description: "No genres",code: function(media){
						return media.genres.length === 0;
					},require: ["genres"]},
					{name: "lowTag",description: "Has tag below 20%",code: function(media){
						return media.tags.some(tag => tag.rank < 20);
					},require: ["tags{rank name}"]},
					{name: "demographics",description: "Multiple demographic tags",code: function(media){
						return media.tags.filter(tag => ["Shounen","Shoujo","Josei","Seinen","Kids"].includes(tag.name)).length > 1;
					},require: ["tags{rank name}"]},
					{name: "badGenre",description: "Has invalid genre",code: function(media){
						return media.genres.some(genre => !["Action","Adventure","Comedy","Drama","Ecchi","Fantasy","Hentai","Horror","Mahou Shoujo","Mecha","Music","Mystery","Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"].includes(genre));
					},require: ["genres"]},
					{name: "noBanner",description: "Missing banner",code: function(media){
						return !media.bannerImage
					},require: ["bannerImage"]},
					{name: "oneshot",description: "Oneshot without one chapter",code: function(media){
						return media.format === "ONE_SHOT" && media.chapters !== 1;
					},require: ["chapters"]},
					{name: "idMal",description: "Missing MAL ID",code: function(media){
						return !media.idMal
					},require: ["idMal"]},
					{name: "duplicatedMALID",description: "Duplicated MAL ID",code: function(media){
						if(media.idMal){
							if(malIDs.has(media.idMal)){
								return true
							}
							else{
								malIDs.add(media.idMal)
								return false
							}
						}
					},require: ["idMal"]},
					{name: "nativeTitle",description: "Missing native title",code: function(media){
						return !media.title.native
					}},
					{name: "englishTitle",description: "Missing english title",code: function(media){
						return !media.title.english
					}},
					{name: "noDuration",description: "No duration",code: function(media){
						return media.type === "ANIME" && media.status !== "NOT_YET_RELEASED" && !media.duration;
					},require: ["type","duration","status"]},
					{name: "noLength",description: "No chapter or episode count",code: function(media){
						if(media.status !== "FINISHED"){
							return false
						}
						if(media.type === "ANIME"){
							return !media.episodes
						}
						else{
							return !media.chapters
						}
					},require: ["type","chapters","episodes","status"]},
					{name: "noStudios",description: "No studios",code: function(media){
						return media.type === "ANIME" && !media.studios.nodes.length;
					},require: ["type","studios{nodes{id}}"]},
					{name: "unusualLength",description: "Unusual Length",code: function(media){
						if(media.type === "ANIME"){
							return (media.episodes && media.episodes > 1000) || (media.duration && media.duration > 180);
						}
						else{
							return (media.cahpters && media.chapters > 2000) || (media.volumes && media.volumes > 150);
						}
					},require: ["type","chapters","volumes","duration","episodes"]},
					{name: "noSource",description: "No source",code: function(media){
						return !media.source;
					},require: ["source(version: 2)"]},
					{name: "otherSource",description: "Source = other",code: function(media){
						return (media.source && media.source === "OTHER");
					},require: ["source(version: 2)"]},
					{name: "badOriginalSource",description: "Source = original, but has source relation",code: function(media){
						let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
						return source.length && (media.source && media.source === "ORIGINAL")
					},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{name: "redundantSynonym",description: "Synonym equal to title",code: function(media){
						return media.synonyms.some(
							word => word === media.title.romaji
						)
						|| (media.title.native && media.synonyms.some(
							word => word === media.title.native
						))
						|| (media.title.english && media.synonyms.some(
							word => word === media.title.english
						));
					},require: ["synonyms"]},
					{name: "hashtag",description: "Has Twitter hashtag",code: function(media){
						return !!media.hashtag;
					},require: ["hashtag"]},
					{name: "nonAdultHentai",description: "Hentai with isAdult = false",code: function(media){
						return (media.genres.includes("Hentai") && !media.isAdult);
					},require: ["genres","isAdult"]},
					{name: "extraLarge",description: "No extraLarge cover image",code: function(media){
						return media.coverImage.large && media.coverImage.large === media.coverImage.extraLarge;
					},require: ["coverImage{large extraLarge}"]},
					{name: "tempTitle",description: "Temporary title",code: function(media){
						return media.title.romaji.toLowerCase() === "(Title to be Announced)".toLowerCase()
							|| (media.title.native && media.title.native.toLowerCase() === "(Title to be Announced)".toLowerCase())
							|| media.title.romaji.includes("(Provisional Title)")
							|| (media.title.native && media.title.native.includes("（仮）"));
					}},
					{name: "badRomaji",description: "Romaji inconsistencies",code: media =>
						["～","「","」","ō","ū","。","！","？","Toukyou","Oosaka"].some(
							char => media.title.romaji.includes(char)
						) || (
							media.title.native && (
								(media.title.native.includes("っち") && media.title.romaji.includes("tchi"))
								|| (media.title.native.includes("っちゃ") && media.title.romaji.includes("tcha"))
								|| (media.title.native.includes("っちょ") && media.title.romaji.includes("tcho"))
								|| (media.title.native.includes("☆") && !media.title.romaji.includes("☆"))
								|| (media.title.native.includes("♪") && !media.title.romaji.includes("♪"))
							)
						)
					},
					{name: "weirdSpace",description: "Weird spacing in title",code: function(media){
						return (
							(media.title.native || "").trim().replace("  "," ") !== (media.title.native || "")
							|| (media.title.romaji || "").trim().replace("  "," ") !== (media.title.romaji || "")
							|| (media.title.english || "").trim().replace("  "," ") !== (media.title.english || "")
						)
					},require: ["duration"]},
					{name: "tvShort",description: "TV/TV Short mixup",code: function(media){
						if(media.duration){
							return (media.format === "TV" && media.duration < 15) || (media.format === "TV_SHORT" && media.duration >= 15)
						}
						return false;
					},require: ["duration"]},
					{name: "newSource",description: "Adaptation older than source",code: function(media){
						return media.sourcing.edges.some(function(edge){
							if(edge.relationType === "SOURCE"){
								return fuzzyDateCompare(edge.node.startDate,media.startDate) === 0
							}
							return false
						})
					},require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{
						name: "moreSource",
						description: "More than one source",
						code: media => media.sourcing.edges.filter(edge => edge.relationType === "SOURCE").length > 1
							&& ![477,6].includes(media.id),//aria, trigun
						require: ["startDate{year month day}","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]
					},
					{name: "formatSource",description: "Source field not equal to source media format",code: function(media){
						let source = media.sourcing.edges.filter(edge => edge.relationType === "SOURCE");
						return source.length && media.source
							&& (
								(source[0].node.format !== media.source)
								&& !(source[0].node.format === "NOVEL" && media.source === "LIGHT_NOVEL")
							)
					},require: ["source(version: 2)","sourcing:relations{edges{relationType(version: 2) node{format startDate{year month day}}}}"]},
					{name: "releasingZero",description: "Releasing manga with non-zero chapter or volume count",code: function(media){
						return media.format === "MANGA" && media.status === "RELEASING" && (media.chapters || media.volumes)
					},require: ["status","chapters","volumes"]},
					{name: "duplicatedStudio",description: "Duplicated studio",code: function(media){
						return (new Set(media.studios.nodes)).size !== media.studios.nodes.length;
					},require: ["studios{nodes{id}}"]},
					{
						name: "badEncoding",
						description: "Bad character encoding in description",
						code: media => {
							return ["</br>","&#39","[1]","[2]","â€™"].some(error => media.description.includes(error))
						},
						require: ["description"]
					},
					{
						name: "badSpelling",
						description: "Bad character encoding in description",
						code: media => {
							return ["animes ","mangas "].some(error => media.description.includes(error))
						},
						require: ["description"]
					},
					{
						name: "noDescription",
						description: "No description",
						code: media => media.description.length < 15,
						require: ["description"]
					},
					{
						name: "longDescription",
						description: "Very long description",
						code: media => media.description.length > 4000,
						require: ["description"]
					},
					{
						name: "outdatedDescription",
						description: "Likely outdated description",
						code: media => [
"upcoming adaptation","will cover","sceduled for","next year","will adapt","announced","will air"," tba"
						].some(text => media.description.toLowerCase().includes(text)) && media.status === "FINISHED",
						require: ["description","status"]
					}
				];
				config.forEach(function(setting){
					setting.active = document.getElementById(setting.name).checked;
					if(setting.active && setting.require){
						setting.require.forEach(field => require.add(field))
					}
				});
				let query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		media(type: $type,sort: POPULARITY_DESC){
			id
			title{romaji native english}
			format
			${[...require].join(" ")}
		}
	}
}`;
				if(restrict){
					query = `
query($type: MediaType,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		mediaList(type: $type,sort: MEDIA_ID,userName: "${user}"){
			media{
				id
				title{romaji native english}
				format
				${[...require].join(" ")}
			}
		}
	}
}`;
				}
				miscResults.innerText = "";
				let flag = true;
				let stopButton = create("button",["button","hohButton"],"Stop",miscResults);
				let progress = create("p",false,false,miscResults);
				stopButton.onclick = function(){
					flag = false;
				};
				let caller = function(page){
					generalAPIcall(query,{type: type,page: page},function(data){
						data = data.data.Page;
						if(data.mediaList){
							data.media = data.mediaList.map(item => item.media);
						};
						data.media.forEach(media => {
							progress.innerText = "Page " + page + " of " + data.pageInfo.lastPage;
							let matches = config.filter(
								setting => setting.active && setting.code(media)
							).map(setting => setting.description);
							if(matches.length){
								let row = create("p",false,false,miscResults);
								create("a",["link","newTab"],"[" + media.format + "] " + media.title.romaji,row,"width:440px;display:inline-block;")
									.href = "/" + type.toLowerCase() + "/" + media.id;
								create("span",false,matches.join(", "),row);
							};
						});
						if(flag && data.pageInfo.currentPage < data.pageInfo.lastPage && document.getElementById("queryOptions")){
							setTimeout(function(){caller(page + 1)},1000)
						}
					});
				};caller(1);
			}},
			{name: "YiffDog officer",setup: function(){
				create("p",false,"Welcome to YiffDog. He's a relative of BroomCat, focused on the social aspect of the site. This police dog is just out of beta, so he doesn't have many options yet.",miscOptions);
				create("p",false,"(If you're reading this, it's probably not even usable yet).",miscOptions);
				create("p","danger","Do not needlessly interact with what's flagged here, limit that to honest mistakes. Silently report, or send mod messages when appropriate.",miscOptions);
				createCheckbox(miscOptions,"activities",true);
				create("span",false,"Activities",miscOptions);
				createCheckbox(miscOptions,"messages",true);
				create("span",false,"Messages",miscOptions);
				createCheckbox(miscOptions,"forum",true);
				create("span",false,"Forum",miscOptions);
				createCheckbox(miscOptions,"reviews",true);
				create("span",false,"Reviews",miscOptions);
				create("h3",false,"Config",miscOptions);
				let conf = function(description,id,defaultValue,titleText){
					let option = create("p",false,false,miscOptions);
					let check = createCheckbox(option,id);
					let descriptionText = create("span",false,description + " ",option);
					if(defaultValue){
						check.checked = defaultValue;
					}
					if(titleText){
						descriptionText.title = titleText;
					}
				};
				[
					["Link-only","linkOnly",true],
					["Bad words","badWords",true,"I'm not claiming all or any of the words in the internal list are inheritely bad, they are just a useful heuristic"],
					["Piracy links","piracy",true],
					["High activity","highActivity",true]
				
				].forEach(ig => conf(...ig));
			},code: function(){
				let checkActivities = document.getElementById("activities").checked;
				let checkMessages = document.getElementById("messages").checked;
				let checkForum = document.getElementById("forum").checked;
				let checkReviews = document.getElementById("reviews").checked;
				if(checkActivities || checkMessages || checkForum || checkReviews){
					let activitiesQuery = `activities1:Page(page:1){
								activities(type:TEXT,sort:ID_DESC){
									... on TextActivity{
										siteUrl
										text(asHtml: true)
										user{name}
									}
								}
							}
							activities2:Page(page:2){
								activities(type:TEXT,sort:ID_DESC){
									... on TextActivity{
										siteUrl
										text(asHtml: true)
										user{name}
									}
								}
							}`;
					let messagesQuery = `messages:Page(page:1){
								activities(type:MESSAGE,sort:ID_DESC){
									... on MessageActivity{
										siteUrl
										message
										messenger{name}
									}
								}
							}`;
					generalAPIcall(
						`query{
							${(checkActivities ? activitiesQuery : "")}
							${(checkMessages ? messagesQuery : "")}
						}`,
						{},
						function(data){
							miscResults.innerText = "";
							if(document.getElementById("linkOnly").checked){
								if(checkActivities){
									data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
										if(activity.text.match(/^<p><a\shref=".*?<\/a><\/p>$/)){
											let row = create("p",false,false,miscResults);
											create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
												.href = activity.siteUrl;
											create("span",false,"Link-only post. Spam?",row);
											create("p",false,false,row).innerText = entityUnescape(activity.text);
										}
									})
								}
							}
							if(document.getElementById("piracy").checked){
								if(checkActivities){
									data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
										(activity.text.match(/<a href=\".*?\"/g) || []).forEach(link => {
											let linker = (
												new URL(
													(link.match(/\"(.*?)\"/) || ["",""])[1]
												)
											).host;
											if(linker && linker.split(".").length >= 2){
												linker = linker.split(".")[linker.split(".").length - 2];
												if(
									[556415734,1724824539,-779421562,-1111399772,-93654449,1120312799,-781704176,-1550515495,3396395,567115318,-307082983,1954992241,-307211474,-307390044,1222804306,-795095039,-1014860289,403785740].includes(hashCode(linker))
												){
													let row = create("p",false,false,miscResults);
													create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
														.href = activity.siteUrl;
													create("span",false,"Possible piracy link",row);
													create("p",false,false,row).innerText = entityUnescape(activity.text);
												}
											};
										});
									})
								}
							}
							if(miscResults.innerText === ""){
								miscResults.innerText = "Inspection completed. Nothing unusual found.";
							}
						}
					)
				}
			}},
			{name: "Autorecs (anime)",code: function(){
				miscResults.innerText = "Collecting list data...";
				generalAPIcall(
					`query($name: String!){
						User(name: $name){
							statistics{
								anime{
									meanScore
									standardDeviation
								}
							}
						}
						MediaListCollection(userName: $name,type: ANIME,status_not: PLANNING){
							lists{
								entries{
									mediaId
									score(format: POINT_100)
									status
									media{
										recommendations(sort:RATING_DESC,perPage:5){
											nodes{
												rating
												mediaRecommendation{
													id
													title{romaji native english}
												}
											}
										}
									}
								}
							}
						}
					}`,
					{name: user},function(data){
						miscResults.innerText = "Processing...";
						const list = returnList(data,true).filter(
							media => media.status !== "PLANNING"
						);
						const existingSet = new Set(
							list.map(media => media.mediaId)
						);
						const statistics = data.data.User.statistics.anime;
						const recsMap = new Map();
						list.filter(
							media => media.score
						).forEach(media => {
							let adjustedScore = (media.score - statistics.meanScore)/statistics.standardDeviation;
							media.media.recommendations.nodes.forEach(rec => {
								if(
									!existingSet.has(rec.mediaRecommendation.id)
									&& rec.rating > 0
								){
									if(!recsMap.has(rec.mediaRecommendation.id)){
										recsMap.set(
											rec.mediaRecommendation.id,
											{title: titlePicker(rec.mediaRecommendation),score: 0}
										)
									}
									recsMap.get(rec.mediaRecommendation.id).score += (1 + Math.log(rec.rating)) * adjustedScore
								}
							})
						});
						miscResults.innerText = "";
						[...recsMap].map(
							pair => ({
								id: pair[0],
								title: pair[1].title,
								score: pair[1].score
							})
						).sort(
							(b,a) => a.score - b.score
						).slice(0,25).forEach(rec => {
							let card = create("p",false,false,miscResults);
							let score = create("span","hohMonospace",rec.score.toPrecision(3) + " ",card,"margin-right:10px;");
							create("a",false,rec.title,card)
								.href = "/anime/" + rec.id + "/"
						})
					}
				)
			}},
			{name: "Autorecs (manga)",code: function(){
				miscResults.innerText = "Collecting list data...";
				generalAPIcall(
					`query($name: String!){
						User(name: $name){
							statistics{
								manga{
									meanScore
									standardDeviation
								}
							}
						}
						MediaListCollection(userName: $name,type: MANGA,status_not: PLANNING){
							lists{
								entries{
									mediaId
									score(format: POINT_100)
									status
									media{
										recommendations(sort:RATING_DESC,perPage:5){
											nodes{
												rating
												mediaRecommendation{
													id
													title{romaji native english}
												}
											}
										}
									}
								}
							}
						}
					}`,
					{name: user},function(data){
						miscResults.innerText = "Processing...";
						const list = returnList(data,true).filter(
							media => media.status !== "PLANNING"
						);
						const existingSet = new Set(
							list.map(media => media.mediaId)
						);
						const statistics = data.data.User.statistics.manga;
						const recsMap = new Map();
						list.filter(
							media => media.score
						).forEach(media => {
							let adjustedScore = (media.score - statistics.meanScore)/statistics.standardDeviation;
							media.media.recommendations.nodes.forEach(rec => {
								if(
									!existingSet.has(rec.mediaRecommendation.id)
									&& rec.rating > 0
								){
									if(!recsMap.has(rec.mediaRecommendation.id)){
										recsMap.set(
											rec.mediaRecommendation.id,
											{title: titlePicker(rec.mediaRecommendation),score: 0}
										)
									}
									recsMap.get(rec.mediaRecommendation.id).score += (1 + Math.log(rec.rating)) * adjustedScore
								}
							})
						});
						miscResults.innerText = "";
						[...recsMap].map(
							pair => ({
								id: pair[0],
								title: pair[1].title,
								score: pair[1].score
							})
						).sort(
							(b,a) => a.score - b.score
						).slice(0,25).forEach(rec => {
							let card = create("p",false,false,miscResults);
							let score = create("span","hohMonospace",rec.score.toPrecision(3) + " ",card,"margin-right:10px;");
							create("a",false,rec.title,card)
								.href = "/manga/" + rec.id + "/"
						})
					}
				)
			}},
			{name: "Find a status",setup: function(){
				let input = create("input","#searchInput",false,miscOptions);
				input.placeholder = "text or regex to match";
			},code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					miscResults.innerText = "";
					let posts = 0;
					let progress = create("p",false,false,miscResults);
					let results = create("p",false,false,miscResults);
					let searchQuery = document.getElementById("searchInput").value;
					const query = `
					query($userId: Int,$page: Int){
						Page(page: $page){
							pageInfo{
								currentPage
								total
								lastPage
							}
							activities (userId: $userId, sort: ID_DESC, type: TEXT){
								... on TextActivity{
									siteUrl
									text(asHtml: true)
								}
							}
						}
					}`;
					let addNewUserData = function(data){
						if(data.data.Page.pageInfo.currentPage === 1){
							for(var i=2;i<=data.data.Page.pageInfo.lastPage;i++){
								generalAPIcall(query,{userId: userId,page: i},addNewUserData)
							}
						};
						posts += data.data.Page.activities.length;
						progress.innerText = "Searching status post " + posts + "/" + data.data.Page.pageInfo.total;
						data.data.Page.activities.forEach(function(act){
							if(act.text.match(new RegExp(searchQuery,"i"))){
								let newDate = create("p",false,false,results,"font-family:monospace;margin-right:10px;");
								let newPage = create("a","newTab",act.siteUrl,newDate,"color:rgb(var(--color-blue));");
								newPage.href = act.siteUrl;
								newDate.innerHTML += DOMPurify.sanitize(act.text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
								create("hr",false,false,results)
							}
						})
					};
					generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
				},"hohIDlookup" + user.toLowerCase())
			}},
			{name: "Most liked status posts",code: function(){
				generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
					let userId = data.data.User.id;
					let list = [];
					miscResults.innerText = "";
					let progress = create("p",false,false,miscResults);
					let results = create("p",false,false,miscResults);
					const query = `
					query($userId: Int,$page: Int){
						Page(page: $page){
							pageInfo{
								currentPage
								total
								lastPage
							}
							activities (userId: $userId, sort: ID_DESC, type: TEXT){
								... on TextActivity{
									siteUrl
									likes{id}
								}
							}
						}
					}`;
					let addNewUserData = function(data){
						list = list.concat(data.data.Page.activities);
						if(data.data.Page.pageInfo.currentPage === 1){
							for(var i=2;i<=data.data.Page.pageInfo.lastPage;i++){
								generalAPIcall(query,{userId: userId,page: i},addNewUserData);
							};
						};
						list.sort(function(b,a){return a.likes.length - b.likes.length});
						progress.innerText = "Searching status post " + list.length + "/" + data.data.Page.pageInfo.total;
						removeChildren(results)
						for(var i=0;i<20;i++){
							let newDate = create("p",false,list[i].likes.length + " likes ",results,"font-family:monospace;margin-right:10px;");
							let newPage = create("a","newTab",list[i].siteUrl,newDate,"color:rgb(var(--color-blue));");
							newPage.href = list[i].siteUrl;
						};
					};
					generalAPIcall(query,{userId: userId,page: 1},addNewUserData);
				},"hohIDlookup" + user.toLowerCase());
			}}
		];
		let miscInputSelect = create("select",false,false,miscInput);
		let miscInputButton = create("button",["button","hohButton"],"Run",miscInput);
		availableQueries.forEach(function(que){
			let option = create("option",false,que.name,miscInputSelect);
			option.value = que.name
		});
		miscInputSelect.oninput = function(){
			miscOptions.innerText = "";
			let relevant = availableQueries.find(que => que.name === miscInputSelect.value);
			if(relevant.setup){
				miscResults.innerText = "";
				relevant.setup()
			}
		};
		miscInputButton.onclick = function(){
			miscResults.innerText = "Loading...";
			availableQueries.find(que => que.name === miscInputSelect.value).code()
		}

		let customTagsCollection = function(list,title,fields){
			let customTags = new Map();
			let regularTags = new Map();
			let customLists = new Map();
			(
				JSON.parse(localStorage.getItem("regularTags" + title)) || []
			).forEach(
				tag => regularTags.set(tag,{
					name : tag,
					list : []
				})
			);
			customLists.set("Not on custom list",{name: "Not on custom list",list: []});
			customLists.set("All media",{name: "All media",list: []});
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				if(media.notes){
					(
						media.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					});
					(//candidates for multi word tags, which we try to detect even if they are not allowed
						media.notes.match(/(#\S+\ [^#]\S+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,list: []})
						}
						customTags.get(tagMatch).list.push(item)
					})
				};
				media.media.tags.forEach(mediaTag => {
					if(regularTags.has(mediaTag.name)){
						regularTags.get(mediaTag.name).list.push(item)
					}
				});
				if(media.isCustomList){
					media.listLocations.forEach(location => {
						if(!customLists.has(location)){
							customLists.set(location,{name: location,list: []})
						}
						customLists.get(location).list.push(item)
					})
				}
				else if(useScripts.negativeCustomList){
					customLists.get("Not on custom list").list.push(item)
				};
				if(useScripts.globalCustomList){
					customLists.get("All media").list.push(item)
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			else{
				for(let [key,value] of customTags){//filter our multi word candidates
					if(key.includes(" ")){
						if(value.list.length === 1){//if it's just one of them, the prefix tag takes priority
							customTags.delete(key)
						}
						else{
							let prefix = key.split(" ")[0];
							if(customTags.has(prefix)){
								if(customTags.get(prefix).list.length === value.list.length){
									customTags.delete(prefix)
								}
								else{
									customTags.delete(key)
								}
							}
						}
					}
				}
				for(let [key,value] of customTags){//fix the basic casing error, like #shoujo vs #Shoujo. Will only merge if one is of length 1
					if(key[1] === key[1].toUpperCase()){
						let lowerCaseKey = "#" + key[1].toLowerCase() + key.slice(2);
						let lowerCaseValue = customTags.get(lowerCaseKey);
						if(lowerCaseValue){
							if(value.list.length === 1){
								lowerCaseValue.list = lowerCaseValue.list.concat(value.list);
								customTags.delete(key)
							}
							else if(lowerCaseValue.list.length === 1){
								value.list = value.list.concat(lowerCaseValue.list);
								customTags.delete(lowerCaseKey)
							}
						}
					}
				}
			}
			if(!customLists.get("Not on custom list").list.length){
				customLists.delete("Not on custom list")
			};
			if(!customLists.get("All media").list.length){
				customLists.delete("All media")
			};
			return [...customTags, ...regularTags, ...customLists].map(
				pair => pair[1]
			).map(tag => {
				let amountCount = 0;
				let average = 0;
				tag.list.forEach(item => {
					if(item.score !== 0){
						amountCount++;
						average += item.score;
					};
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key]);
						}
					})
				});
				tag.average = average/amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score);
				return tag;
			}).sort(
				(b,a) => a.list.length - b.list.length || b.name.localeCompare(a.name)
			)
		};
		let regularTagsCollection = function(list,fields,extracter){
			let tags = new Map();
			list.forEach(media => {
				let item = {};
				fields.forEach(field => {
					item[field.key] = field.method(media)
				});
				extracter(media).forEach(tag => {
					if(useScripts.SFWmode && tag.name === "Hentai"){
						return
					}
					if(!tags.has(tag.name)){
						tags.set(tag.name,{name: tag.name,list: []})
					}
					tags.get(tag.name).list.push(item)
				})
			});
			tags.forEach(tag => {
				tag.amountCount = 0;
				tag.average = 0;
				tag.list.forEach(item => {
					if(item.score){
						tag.amountCount++;
						tag.average += item.score;
					};
					fields.forEach(field => {
						if(field.sumable){
							tag[field.key] = field.sumable(tag[field.key],item[field.key])
						}
					})
				});
				tag.average = tag.average/tag.amountCount || 0;
				tag.list.sort((b,a) => a.score - b.score)
			});
			return [...tags].map(
				tag => tag[1]
			).sort(
				(b,a) => (a.average*a.amountCount + ANILIST_WEIGHT)/(a.amountCount + 1) - (b.average*b.amountCount + ANILIST_WEIGHT)/(b.amountCount + 1) || a.list.length - b.list.length
			)
		};
		let drawTable = function(data,formatter,tableLocation,isTag,autoHide){
			removeChildren(tableLocation)
			tableLocation.innerText = "";
			let hasScores = data.some(elem => elem.average);
			let header = create("p",false,formatter.title);
			let tableContent = create("div",["table","hohTable"]);
			let headerRow = create("div",["header","row"],false,tableContent);
			let indexAccumulator = 0;
			formatter.headings.forEach(function(heading){
				if(!hasScores && heading === "Mean Score"){
					return
				};
				let columnTitle = create("div",false,heading,headerRow);
				if(heading === "Tag" && !isTag && formatter.isMixed){
					columnTitle.innerText = "Genre"
				}
				if(formatter.focus === indexAccumulator){
					columnTitle.innerText += " ";
					columnTitle.appendChild(svgAssets2.angleDown.cloneNode(true))
				};
				columnTitle.index = +indexAccumulator;
				columnTitle.addEventListener("click",function(){
					formatter.focus = this.index;
					data.sort(formatter.sorting[this.index]);
					drawTable(data,formatter,tableLocation,isTag,autoHide)
				});
				indexAccumulator++;
			});
			for(var i=0;i<data.length;i++){
				let row = create("div","row");
				formatter.celData.forEach(function(celData,index){
					if(index === 2 && !hasScores){
						return
					};
					let cel = create("div");
					celData(cel,data,i,true,isTag);
					row.appendChild(cel)
				});
				row.onclick = function(){
					if(this.nextSibling.style.display === "none"){
						this.nextSibling.style.display = "block"
					}
					else{
						this.nextSibling.style.display = "none"
					}
				};
				tableContent.appendChild(row);
				let showList = create("div");
				if(formatter.focus === 1){//sorting by count is meaningless, sort alphabetically instead
					data[i].list.sort(formatter.sorting[0])
				}
				else if(formatter.focus === 2){//average != score
					data[i].list.sort((b,a) => a.score - b.score)
				}
				else if(formatter.focus === -1){//average != score
					//nothing, duh
				}
				else{
					data[i].list.sort(formatter.sorting[formatter.focus]);
				}
				data[i].list.forEach((nil,ind) => {
					let secondaryRow = create("div",["row","hohSecondaryRow"]);
					formatter.celData.forEach(celData => {
						let cel = create("div");
						celData(cel,data[i].list,ind,false,isTag);
						secondaryRow.appendChild(cel)
					});
					showList.appendChild(secondaryRow)
				});
				showList.style.display = "none";
				tableContent.insertBefore(showList,row.nextSibling);
			};
			tableLocation.appendChild(header);
			tableLocation.appendChild(tableContent);
			if(autoHide){
				let tableHider = create("span",["hohMonospace","hohTableHider"],"[-]",header);
				let regularTagsSetting = create("p",false,false,tableLocation);
				let regularTagsSettingLabel = create("span",false," Regular tags included (applied on reload): ",regularTagsSetting);
				let regularTagsSettingContent = create("span",false,false,regularTagsSetting);
				let regularTagsSettingNew = create("input",false,false,regularTagsSetting);
				let regularTagsSettingAdd = create("button",["hohButton","button"],"+",regularTagsSetting);
				let regularTags = JSON.parse(localStorage.getItem("regularTags" + formatter.title)) || [];
				for(var i=0;i<regularTags.length;i++){
					let tag = create("span","hohRegularTag",false,regularTagsSettingContent);
					let tagContent = create("span",false,regularTags[i],tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = regularTags[i] + "";
					tagCross.addEventListener("click",function(){
						for(var j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						};
						this.parentNode.remove();
					})
				};
				regularTagsSettingAdd.addEventListener("click",function(){
					let newTagName = this.previousSibling.value;
					if(!newTagName){
						return
					};
					newTagName = capitalize(newTagName);
					regularTags.push(newTagName);
					let tag = create("span","hohRegularTag");
					let tagContent = create("span",false,newTagName,tag);
					let tagCross = create("span","hohCross",svgAssets.cross,tag);
					tagCross.regularTag = newTagName + "";
					tagCross.addEventListener("click",function(){
						for(var j=0;j<regularTags.length;j++){
							if(regularTags[j] === this.regularTag){
								regularTags.splice(j,1);
								localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
								break
							}
						}
						this.parentNode.remove();
					});
					this.previousSibling.previousSibling.appendChild(tag);
					localStorage.setItem("regularTags" + formatter.title,JSON.stringify(regularTags));
				});
				tableHider.onclick = function(){
					if(this.innerText === "[-]"){
						tableHider.innerText = "[+]";
						tableContent.style.display = "none";
						regularTagsSetting.style.display = "none";
						formatter.display = false
					}
					else{
						tableHider.innerText = "[-]";
						tableContent.style.display = "block";
						regularTagsSetting.style.display = "block";
						formatter.display = true
					}
				};
				if(!formatter.display){
					tableHider.innerText = "[+]";
					tableContent.style.display = "none";
					regularTagsSetting.style.display = "none";
				}
			};
		};
		let semaPhoreAnime = false;//I have no idea what "semaphore" means in software
		let semaPhoreManga = false;//but it sounds cool so this is a semaphore
//
		let nativeTagsReplacer = function(){
			if(useScripts.replaceNativeTags === false || semaPhoreAnime === false || semaPhoreManga === false){
				return
			};
			const mixedFields = [
				{
					key : "name",
					method : function(media){
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native;
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english;
						}
						return media.media.title.romaji;
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0;
							})
						}
						acc[val]++;
						return acc;
					},
					method : media => media.status
				},{
					key : "type",
					method : function(media){
						if(!media.progressVolumes && !(media.progressVolumes === 0)){
							return "ANIME";
						}
						else{
							return "MANGA";
						}
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration || 0
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead || 0
				}
			];
			let mixedFormatter = {
				title : "",
				display : true,
				isMixed : true,
				headings : ["Tag","Count","Mean Score","Time Watched","Chapters Read"],
				focus : -1,
				celData : [
					function(cel,data,index,isPrimary,isTag){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							if(isTag){
								nameCellTag.href = "/search/anime?includedTags=" + data[index].name + "&onList=true"
							}
							else{
								nameCellTag.href = "/search/anime?includedGenres=" + data[index].name + "&onList=true"
							}
							if(tagDescriptions[data[index].name]){
								nameCellTag.title = tagDescriptions[data[index].name]
							}
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										});
									}
								}
							})
						}
						else{
							let nameCellTag = create("a",["title","hohNameCel"],data[index].name,cel);
							if(data[index].type === "ANIME"){
								nameCellTag.href = "/anime/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-blue))";
							}
							else{
								nameCellTag.href = "/manga/" + data[index].mediaId + "/";
								nameCellTag.style.color = "rgb(var(--color-green))";
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent";//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = (data[index].average).roundPlaces(1) || "-"
						}
						else{
							cel.innerText = (data[index].score).roundPlaces(1) || "-"
						}
					},
					function(cel,data,index,isPrimary){
						if(!isPrimary && data[index].type === "MANGA"){
							cel.innerText = "-"
						}
						else if(data[index].duration === 0){
							cel.innerText = "-"
						}
						else if(data[index].duration < 60){
							cel.innerText = Math.round(data[index].duration) + "min"
						}
						else{
							cel.innerText = Math.round(data[index].duration/60) + "h"
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary || data[index].type === "MANGA"){
							cel.innerText = data[index].chaptersRead;
						}
						else{
							cel.innerText = "-"
						}
					}
				],
				sorting : [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.chaptersRead - b.chaptersRead
				]
			};
			let collectedMedia = semaPhoreAnime.concat(semaPhoreManga);
			let listOfTags = regularTagsCollection(collectedMedia,mixedFields,media => media.media.tags);
			if(listOfTags.length > 50){//restrict to 3 or more only if the user has many tags
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			if(!document.URL.match(/\/stats/)){
				return
			};
			let drawer = function(){
				drawTable(listOfTags,mixedFormatter,regularTagsTable,true);
				//recycle most of the formatter for genres
				drawTable(
					regularTagsCollection(
						collectedMedia,
						mixedFields,
						media => media.media.genres.map(a => ({name: a}))
					),
					mixedFormatter,
					regularGenresTable
				);
				hohGenresTrigger.removeEventListener("mouseover",drawer);
			}
			hohGenresTrigger.addEventListener("mouseover",drawer);
			if(hohGenresTrigger.classList.contains("hohActive")){
				drawer()
			}
		};
//get anime list
		let personalStatsCallback = function(data){
			personalStats.innerText = "";
			create("hr","hohSeparator",false,personalStats)
			create("h1","hohStatHeading","Anime stats for " + user,personalStats);
			let list = returnList(data);
			let scoreList = list.filter(element => element.scoreRaw);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStats);
				let compatLocation = create("div","#hohCheckCompat",false,personalStats);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = "loading...";
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"ANIME",
						data => formatCompat(data,compatLocation)
					)
				};
			};
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStats);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					create("span",false,false,newStat)
						.innerText = comment
				}
			};
//first activity
			let oldest = list.filter(
				item => item.startedAt.year
			).map(
				item => item.startedAt
			).sort((b,a) =>
				(a.year < b.year)
				|| (a.year === b.year && a.month < b.month)
				|| (a.year === b.year && a.month === b.month && a.day < b.day)
			)[0];
//scoring stats
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let amount = scoreList.length;
			let sumWeight = 0;
			let sumEntriesWeight = 0;
			let average = 0;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumDuration = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let longestDuration = {
				time: 0,
				name: "",
				status: "",
				rewatch: 0,
				id: 0
			};
			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			list.forEach(item => {
				let entryDuration = (item.media.duration || 1)*(item.progress || 0);//current round
				item.episodes = item.progress || 0;
				if(useScripts.noRewatches && item.repeat){
					entryDuration = Math.max(
						item.progress || 0,
						item.media.episodes || 1,
					) * (item.media.duration || 1);//first round
					item.episodes = Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				else{
					entryDuration += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					) * (item.media.duration || 1);//repeats
					item.episodes += (item.repeat || 0) * Math.max(
						item.progress || 0,
						item.media.episodes || 1
					)
				}
				if(item.listJSON && item.listJSON.adjustValue){
					item.episodes = Math.max(0,item.episodes + item.listJSON.adjustValue);
					entryDuration = Math.max(0,entryDuration + item.listJSON.adjustValue*(item.media.duration || 1));
				};
				item.watchedDuration = entryDuration;
				sumDuration += entryDuration;
				if(entryDuration > longestDuration.time){
					longestDuration.time = entryDuration;
					longestDuration.name = item.media.title.romaji;
					longestDuration.status = item.status;
					longestDuration.rewatch = item.repeat;
					longestDuration.id = item.mediaId
				}
			});
			scoreList.forEach(item => {
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{
					runLength = 1;
					previouScore = item.scoreRaw;
				};
				sumWeight += (item.media.duration || 1) * (item.media.episodes || 0);
				sumEntriesWeight += item.scoreRaw*(item.media.duration || 1) * (item.media.episodes || 0);
			});
			if(amount){
				average = sumEntries/amount
			}
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum;
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2);
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore);
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
//display scoring stats
			addStat("Anime on list: ",list.length);
			addStat("Anime rated: ",amount);
			if(amount !== 0){//no scores
				if(amount === 1){
					addStat("Only one score given: ",maxRunLengthScore)
				}
				else{
					addStat(
						"Average score: ",
						average.toPrecision(4)
					);
					addStat(
						"Average score: ",
						(sumEntriesWeight/sumWeight).toPrecision(4),
						" (weighted by duration)"
					);
					addStat("Median score: ",median);
					addStat(
						"Global difference: ",
						publicDifference.roundPlaces(2),
						" (average difference from global average)"
					);
					addStat(
						"Global deviation: ",
						publicDeviation.roundPlaces(2),
						" (standard deviation from the global average of each entry)"
					);
					if(maxRunLength > 1){
						addStat("Most common score: ",maxRunLengthScore, " (" + maxRunLength + " instances)")
					}
					else{
						addStat("Most common score: ","","no two scores alike")
					}
				};
//longest activity
				let singleText = (100*longestDuration.time/sumDuration).roundPlaces(2) + "% is ";
				singleText += longestDuration.name;
				if(longestDuration.rewatch === 0){
					if(longestDuration.status === "CURRENT"){
						singleText += ". Currently watching."
					}
					else if(longestDuration.status === "PAUSED"){
						singleText += ". On hold."
					}
					else if(longestDuration.status === "DROPPED"){
						singleText += ". Dropped."
					}
				}
				else{
					if(longestDuration.status === "COMPLETED"){
						if(longestDuration.rewatch === 1){
							singleText += ". Rewatched once."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Rewatched twice."
						}
						else{
							singleText += ". Rewatched " + longestDuration.rewatch + " times."
						}
					}
					else if(longestDuration.status === "CURRENT" || status === "REPEATING"){
						if(longestDuration.rewatch === 1){
							singleText += ". First rewatch in progress."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Second rewatch in progress."
						}
						else{
							singleText += ". Rewatch number " + longestDuration.rewatch + " in progress."
						}
					}
					else if(longestDuration.status === "PAUSED"){
						if(longestDuration.rewatch === 1){
							singleText += ". First rewatch on hold."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Second rewatch on hold."
						}
						else{
							singleText += ". Rewatch number " + longestDuration.rewatch + " on hold."
						}
					}
					else if(longestDuration.status === "DROPPED"){
						if(longestDuration.rewatch === 1){
							singleText += ". Dropped on first rewatch."
						}
						else if(longestDuration.rewatch === 2){
							singleText += ". Dropped on second rewatch."
						}
						else{
							singleText += ". Dropped on rewatch number " + longestDuration.rewatch + "."
						}
					};
				};
				addStat(
					"Time watched: ",
					(sumDuration/(60*24)).roundPlaces(2),
					" days (" + singleText + ")"
				)
			};
			let TVepisodes = 0;
			let TVepisodesLeft = 0;
			list.filter(show => show.media.format === "TV").forEach(function(show){
				TVepisodes += show.progress;
				TVepisodes += show.repeat * Math.max(1,(show.media.episodes || 0),show.progress);
				if(show.status === "CURRENT"){
					TVepisodesLeft += Math.max((show.media.episodes || 0) - show.progress,0)
				}
			});
			addStat("TV episodes watched: ",TVepisodes);
			addStat("TV episodes remaining for current shows: ",TVepisodesLeft);
			if(oldest){
				create("p",false,"First logged anime: " + oldest.year + "-" + oldest.month + "-" + oldest.day + ". (users can change start dates)",personalStats)
			};
			let animeFormatter = {
				title: "Custom Anime Tags",
				display: !useScripts.hideCustomTags,
				headings: ["Tag","Count","Mean Score","Time Watched","Episodes","Eps remaining"],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							let nameCellTag = create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px";
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px";
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/anime/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-";
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1);
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-";
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1);
							}
						}
					},
					function(cel,data,index){
						cel.innerText = formatTime(data[index].duration*60,"short");
						cel.title = (data[index].duration/60).roundPlaces(1) + " hours";
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(!data[index].list.length){
								cel.innerText = "-";
							}
							else{
								cel.innerText = data[index].episodes;
							}
						}
						else{
							cel.innerText = data[index].episodes;
						}
					},
					function(cel,data,index,isPrimary){
						if(data[index].episodes === 0 && data[index].remaining === 0 || isPrimary && !data[index].list.length){
							cel.innerText = "-";
						}
						else if(data[index].remaining === 0){
							cel.innerText = "completed";
						}
						else{
							if(useScripts.timeToCompleteColumn){
								cel.innerText = data[index].remaining + " (" + formatTime(data[index].remainingTime*60,"short") + ")";
							}
							else{
								cel.innerText = data[index].remaining;
							}
						}
					}
				],
				sorting: [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.duration - b.duration,
					(b,a) => a.episodes - b.episodes,
					(b,a) => a.remaining - b.remaining
				]
			};
			const animeFields = [
				{
					key : "name",
					method : function(media){
						if(aliases.has(media.mediaId)){
							return aliases.get(media.mediaId);
						}
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native;
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english;
						};
						return media.media.title.romaji;
					}
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0;
							})
						}
						acc[val]++;
						return acc;
					},
					method : media => media.status
				},{
					key : "duration",
					sumable : ACCUMULATE,
					method : media => media.watchedDuration
				},{
					key : "episodes",
					sumable : ACCUMULATE,
					method : media => media.episodes
				},{
					key : "remaining",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max((media.media.episodes || 0) - media.progress,0);
					}
				},{
					key : "remainingTime",
					sumable : ACCUMULATE,
					method : function(media){
						return Math.max(((media.media.episodes || 0) - media.progress) * (media.media.duration || 1),0);
					}
				}
			];
			let customTags = customTagsCollection(list,animeFormatter.title,animeFields);
			if(customTags.length){
				let customTagsAnimeTable = create("div","#customTagsAnimeTable",false,personalStats);
				drawTable(customTags,animeFormatter,customTagsAnimeTable,true,true)
			};

			let listOfTags = regularTagsCollection(list,animeFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			drawTable(listOfTags,animeFormatter,regularAnimeTable,true,false);
			semaPhoreAnime = list;
			nativeTagsReplacer();
			generalAPIcall(queryMediaListStaff,{name: user,listType: "ANIME"},function(data){
				let rawStaff = returnList(data);
				rawStaff.forEach((raw,index) => {
					raw.status = list[index].status;
					raw.watchedDuration = list[index].watchedDuration;
					raw.scoreRaw = list[index].scoreRaw
				});
				let staffMap = {};
				rawStaff.filter(obj => obj.status !== "PLANNING").forEach(media => {
					media.media.staff.forEach(staff => {
						if(!staffMap[staff.id]){
							staffMap[staff.id] = {
								watchedDuration: 0,
								count: 0,
								scoreCount: 0,
								scoreSum: 0,
								id: staff.id,
								name: staff.name
							}
						};
						if(media.watchedDuration){
							staffMap[staff.id].watchedDuration += media.watchedDuration;
							staffMap[staff.id].count++
						};
						if(media.scoreRaw){
							staffMap[staff.id].scoreSum += media.scoreRaw;
							staffMap[staff.id].scoreCount++
						}
					})
				});
				let staffList = [];
				Object.keys(staffMap).forEach(
					key => staffList.push(staffMap[key])
				);
				staffList = staffList.filter(
					obj => obj.count >= 1
				).sort(
					(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
				);
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 3)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 5)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(obj => obj.count >= 10)
				};
				let hasScores = staffList.some(a => a.scoreCount);
				let drawStaffList = function(){
					removeChildren(animeStaff)
					animeStaff.innerText = "";
					let table        = create("div",["table","hohTable","hohNoPointer"],false,animeStaff);
					let headerRow    = create("div",["header","row","good"],false,table);
					let nameHeading  = create("div",false,"Name",headerRow,"cursor:pointer;");
					let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
					let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
					if(!hasScores){
						scoreHeading.style.display = "none"
					}
					let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
					staffList.forEach(function(staff,index){
						let row = create("div",["row","good"],false,table);
						let nameCel = create("div",false,(index + 1) + " ",row);
						let staffLink = create("a",["link","newTab"],(staff.name.first + " " + (staff.name.last || "")).trim(),nameCel);
						staffLink.href = "/staff/" + staff.id;
						create("div",false,staff.count,row);
						if(hasScores){
							create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row);
						}
						let timeCel = create("div",false,formatTime(staff.watchedDuration*60),row);
						timeCel.title = (staff.watchedDuration/60).roundPlaces(1) + " hours";
					});
					let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStaff,"margin-top:10px;");
					let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStaff,"margin-top:10px;");
					csvButton.onclick = function(){
						let csvContent = 'Staff,Count,"Mean Score","Time Watched"\n';
						staffList.forEach(staff => {
							csvContent += csvEscape(
								[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
							) + ",";
							csvContent += staff.count + ",";
							csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
							csvContent += (staff.watchedDuration/60).roundPlaces(1) + "\n"
						});
						saveAs(csvContent,"Anime staff stats for " + user + ".csv",true)
					};
					jsonButton.onclick = function(){
						saveAs({
							type: "ANIME",
							user: user,
							timeStamp: NOW(),
							version: "1.00",
							scriptInfo: scriptInfo,
							url: document.URL,
							description: "Anilist anime staff stats for " + user,
							fields: [
								{name: "name",   description: "The full name of the staff member, as firstname lastname"},
								{name: "staffID",description: "The staff member's database number in the Anilist database"},
								{name: "count",  description: "The total number of media this staff member has credits for, for the current user"},
								{name: "score",  description: "The current user's mean score for the staff member out of 100"},
								{name: "minutesWatched",description: "How many minutes of this staff member's credited media the current user has watched"}
							],
							data: staffList.map(staff => {
								return {
									name: (staff.name.first + " " + (staff.name.last || "")).trim(),
									staffID: staff.id,
									count: staff.count,
									score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
									minutesWatched: staff.watchedDuration
								}
							})
						},"Anime staff stats for " + user + ".json");
					}
					nameHeading.onclick = function(){
						staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
						drawStaffList()
					};
					countHeading.onclick = function(){
						staffList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
						drawStaffList()
					};
					scoreHeading.onclick = function(){
						staffList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
						drawStaffList()
					};
					timeHeading.onclick = function(){
						staffList.sort((b,a) => a.watchedDuration - b.watchedDuration);
						drawStaffList()
					}
				};
				let clickOnce = function(){
					drawStaffList();
					let place = document.querySelector(`[href$="/stats/anime/staff"]`);
					if(place){
						place.removeEventListener("click",clickOnce)
					}
				}
				let waiter = function(){
					if(location.pathname.includes("/stats/anime/staff")){
						clickOnce();
						return
					}
					let place = document.querySelector(`[href$="/stats/anime/staff"]`);
					if(place){
						place.addEventListener("click",clickOnce)
					}
					else{
						setTimeout(waiter,200)
					}
				};waiter();
			},"hohListCacheAnimeStaff" + user,15*60*1000);
			let studioMap = {};
			list.forEach(function(anime){
				anime.media.studios.nodes.forEach(function(studio){
					if(!useScripts.allStudios && !studio.isAnimationStudio){
						return
					}
					if(!studioMap[studio.name]){
						studioMap[studio.name] = {
							watchedDuration: 0,
							count: 0,
							scoreCount: 0,
							scoreSum: 0,
							id: studio.id,
							isAnimationStudio: studio.isAnimationStudio,
							name: studio.name,
							media: []
						}
					}
					if(anime.watchedDuration){
						studioMap[studio.name].watchedDuration += anime.watchedDuration;
						studioMap[studio.name].count++
					};
					if(anime.scoreRaw){
						studioMap[studio.name].scoreSum += anime.scoreRaw;
						studioMap[studio.name].scoreCount++
					};
					let title = anime.media.title.romaji;
					if(anime.status !== "PLANNING"){
						if(useScripts.titleLanguage === "NATIVE" && anime.media.title.native){
							title = anime.media.title.native
						}
						else if(useScripts.titleLanguage === "ENGLISH" && anime.media.title.english){
							title = anime.media.title.english
						}
						studioMap[studio.name].media.push({
							watchedDuration: anime.watchedDuration,
							score: anime.scoreRaw,
							title: title,
							id: anime.mediaId,
							repeat: anime.repeat,
							status: anime.status
						})
					}
				})
			});
			let studioList = [];
			Object.keys(studioMap).forEach(
				key => studioList.push(studioMap[key])
			);
			studioList = studioList.filter(
				studio => studio.count >= 1
			).sort(
				(b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration
			);
			studioList.forEach(
				studio => studio.media.sort((b,a) => a.score - b.score)
			);
			let hasScores = studioList.some(a => a.scoreCount);
			let drawStudioList = function(){
				removeChildren(animeStudios)
				animeStudios.innerText = "";
				let table = create("div",["table","hohTable"],false,animeStudios);
				let headerRow = create("div",["header","row","good"],false,table);
				let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
				let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
				let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
				if(!hasScores){
					scoreHeading.style.display = "none"
				}
				let timeHeading = create("div",false,"Time Watched",headerRow,"cursor:pointer;");
				studioList.forEach(function(studio,index){
					let row = create("div",["row","good"],false,table);
					let nameCel = create("div",false,(index + 1) + " ",row);
					let studioLink = create("a",["link","newTab"],studio.name,nameCel);
					studioLink.href = "/studio/" + studio.id;
					if(!studio.isAnimationStudio){
						studioLink.style.color = "rgb(var(--color-green))"
					};
					let nameCellStatus = create("span","hohSumableStatusContainer",false,nameCel);
					Object.keys(distributionColours).sort().forEach(status => {
						let statCount = studio.media.filter(media => media.status === status).length;
						if(statCount){
							let statusSumDot = create("div","hohSumableStatus",statCount,nameCellStatus);
							statusSumDot.style.background = distributionColours[status];
							statusSumDot.title = statCount + " " + capitalize(status.toLowerCase());
							if(statCount > 99){
								statusSumDot.style.fontSize = "8px"
							}
							if(statCount > 999){
								statusSumDot.style.fontSize = "6px"
							}
							statusSumDot.onclick = function(e){
								e.stopPropagation();
								Array.from(nameCel.parentNode.nextSibling.children).forEach(function(child){
									if(child.children[1].children[0].title === status.toLowerCase()){
										child.style.display = "grid"
									}
									else{
										child.style.display = "none"
									}
								})
							}
						}
					});
					create("div",false,studio.count,row);
					if(hasScores){
						let scoreCel = create("div",false,(studio.scoreSum/studio.scoreCount).roundPlaces(2),row);
						scoreCel.title = studio.scoreCount + " ratings";
					}
					let timeString = formatTime(studio.watchedDuration*60);
					let timeCel = create("div",false,timeString,row);
					timeCel.title = (studio.watchedDuration/60).roundPlaces(1) + " hours";
					let showRow = create("div",false,false,table,"display:none;");
					studio.media.forEach(top => {
						let secondRow = create("div",["row","hohSecondaryRow","good"],false,showRow);
						let titleCel = create("div",false,false,secondRow,"margin-left:50px;");
						let titleLink = create("a","link",top.title,titleCel);
						titleLink.href = "/anime/" + top.id + "/" + safeURL(top.title);
						let countCel = create("div",false,false,secondRow);
						let statusDot = create("div","hohStatusDot",false,countCel);
						statusDot.style.backgroundColor = distributionColours[top.status];
						statusDot.title = top.status.toLowerCase();
						if(top.status === "COMPLETED"){
							statusDot.style.backgroundColor = "transparent";//default case
						}
						if(top.repeat === 1){
							countCel.appendChild(svgAssets2.repeat.cloneNode(true));
						}
						else if(top.repeat > 1){
							countCel.appendChild(svgAssets2.repeat.cloneNode(true));
							create("span",false,top.repeat,countCel)
						}
						create("div",false,(top.score ? top.score : "-"),secondRow);
						let timeString = formatTime(top.watchedDuration*60);
						let timeCel = create("div",false,timeString,secondRow);
						timeCel.title = (top.watchedDuration/60).roundPlaces(1) + " hours";
					});
					row.onclick = function(){
						if(showRow.style.display === "none"){
							showRow.style.display = "block"
						}
						else{
							showRow.style.display = "none"
						}
					}
				});
				let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",animeStudios,"margin-top:10px;");
				let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",animeStudios,"margin-top:10px;");
				csvButton.onclick = function(){
					let csvContent = 'Studio,Count,"Mean Score","Time Watched"\n';
					studioList.forEach(function(studio){
						csvContent += csvEscape(studio.name) + ",";
						csvContent += studio.count + ",";
						csvContent += (studio.scoreSum/studio.scoreCount).roundPlaces(2) + ",";
						csvContent += (studio.watchedDuration/60).roundPlaces(1) + "\n";
					});
					saveAs(csvContent,"Anime studio stats for " + user + ".csv",true);
				};
				jsonButton.onclick = function(){
					saveAs({
						type: "ANIME",
						user: user,
						timeStamp: NOW(),
						version: "1.00",
						scriptInfo: scriptInfo,
						url: document.URL,
						description: "Anilist anime studio stats for " + user,
						fields: [
							{name: "studio",description: "The name of the studio. (Can also be other companies, depending on the user's settings)"},
							{name: "studioID",description: "The studio's database number in the Anilist database"},
							{name: "count",description: "The total number of media this studio has credits for, for the current user"},
							{name: "score",description: "The current user's mean score for the studio out of 100"},
							{name: "minutesWatched",description: "How many minutes of this studio's credited media the current user has watched"},
							{
								name: "media",
								description: "A list of the media associated with this studio",
								subSelection: [
									{name: "title",description: "The title of the media (language depends on user settings)"},
									{name: "ID",description: "The media's database number in the Anilist database"},
									{name: "score",description: "The current user's mean score for the media out of 100"},
									{name: "minutesWatched",description: "How many minutes of the media the current user has watched"},
									{name: "status",description: "The current user's watching status for the media"},
								]
							}
						],
						data: studioList.map(studio => {
							return {
								studio: studio.name,
								studioID: studio.id,
								count: studio.count,
								score: (studio.scoreSum/studio.scoreCount).roundPlaces(2),
								minutesWatched: studio.watchedDuration,
								media: studio.media.map(media => {
									return {
										title: media.title,
										ID: media.id,
										score: media.score,
										minutesWatched: media.watchedDuration,
										status: media.status
									}
								})
							}
						})
					},"Anime studio stats for " + user + ".json");
				}
				nameHeading.onclick = function(){
					studioList.sort(ALPHABETICAL(a => a.name));
					studioList.forEach(studio => {
						studio.media.sort(ALPHABETICAL(a => a.title))
					});
					drawStudioList();
				};
				countHeading.onclick = function(){
					studioList.sort((b,a) => a.count - b.count || a.watchedDuration - b.watchedDuration);
					drawStudioList();
				};
				scoreHeading.onclick = function(){
					studioList.sort((b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount);
					studioList.forEach(studio => {
						studio.media.sort((b,a) => a.score - b.score)
					});
					drawStudioList();
				};
				timeHeading.onclick = function(){
					studioList.sort((b,a) => a.watchedDuration - b.watchedDuration);
					studioList.forEach(function(studio){
						studio.media.sort((b,a) => a.watchedDuration - b.watchedDuration);
					});
					drawStudioList();
				};
			};
			let clickOnce = function(){
				drawStudioList();
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.removeEventListener("click",clickOnce)
				}
			}
			let waiter = function(){
				if(location.pathname.includes("/stats/anime/studios")){
					clickOnce();
					return;
				}
				let place = document.querySelector(`[href$="/stats/anime/studios"]`);
				if(place){
					place.addEventListener("click",clickOnce)
				}
				else{
					setTimeout(waiter,200)
				}
			};waiter();
		};
		if(user === whoAmI){
			generalAPIcall(
				queryMediaListAnime,
				{
					name: user,
					listType: "ANIME"
				},
				personalStatsCallback,"hohListCacheAnime",10*60*1000
			);
		}
		else{
			generalAPIcall(
				queryMediaListAnime,
				{
					name: user,
					listType: "ANIME"
				},
				personalStatsCallback
			);
		}
//manga stats
		let personalStatsMangaCallback = function(data){
			personalStatsManga.innerText = "";
			create("hr","hohSeparator",false,personalStatsManga);
			create("h1","hohStatHeading","Manga stats for " + user,personalStatsManga);
			let list = returnList(data);
			let scoreList = list.filter(element => element.scoreRaw);
			let personalStatsMangaContainer = create("div",false,false,personalStatsManga);
			if(whoAmI && whoAmI !== user){
				let compatabilityButton = create("button",["button","hohButton"],"Compatibility",personalStatsManga);
				let compatLocation = create("div","#hohCheckCompatManga",false,personalStatsManga);
				compatabilityButton.onclick = function(){
					compatLocation.innerText = "loading...";
					compatLocation.style.marginTop = "5px";
					compatCheck(
						scoreList,
						whoAmI,
						"MANGA",
						function(data){
							formatCompat(data,compatLocation)
						}
					)
				};
			};
			let addStat = function(text,value,comment){//value,value,html
				let newStat = create("p","hohStat",false,personalStatsManga);
				create("span",false,text,newStat);
				create("span","hohStatValue",value,newStat);
				if(comment){
					let newStatComment = create("span",false,false,newStat);
					newStatComment.innerText = comment;
				};
			};
			let chapters = 0;
			let volumes = 0;
			/*
			For most airing anime, Anilist provides "media.nextAiringEpisode.episode"
			Unfortunately, the same is not the case for releasing manga.
			THIS DOESN'T MATTER the first time a user is reading something, as we are then just using the current progress.
			But on a re-read, we need the total length to count all the chapters read.
			I can (and do) get a lower bound for this by using the current progress (this is what Anilist does),
			but this is not quite accurate, especially early in a re-read.
			The list below is to catch some of those exceptions
			*/
			let unfinishedLookup = function(mediaId,mode,mediaStatus,mediaProgress){//wow, this is a mess. But it works
				if(mediaStatus === "FINISHED"){
					return 0//it may have finished since the list was updated
				};
				if(commonUnfinishedManga.hasOwnProperty(mediaId)){
					if(mode === "chapters"){
						return commonUnfinishedManga[mediaId].chapters
					}
					else if(mode === "volumes"){
						return commonUnfinishedManga[mediaId].volumes
					}
					else if(mode === "volumesNow"){
						if(commonUnfinishedManga[mediaId].chapters <= mediaProgress){
							return commonUnfinishedManga[mediaId].volumes
						}
						else{
							return 0//conservative
						}
					};
					return 0;//fallback
				}
				else{
					return 0//not in our list
				}
			};
			list.forEach(function(item){
				let chaptersRead = 0;
				let volumesRead = 0;
				if(item.status === "COMPLETED"){//if it's completed, we can make some safe assumptions
					chaptersRead += Math.max(//chapter progress on the current read
						item.media.chapters,//in most cases, it has a chapter count
						item.media.volumes,//if not, there's at least 1 chapter per volume
						item.progress,//if it doesn't have a volume count either, the current progress is probably not out of date
						item.progressVolumes,//if it doesn't have a chapter progress, count at least 1 chapter per volume
						1//finally, an entry has at least 1 chapter
					);
					volumesRead += Math.max(
						item.progressVolumes,
						item.media.volumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)//if people have forgotten to update their volume count and have caught up.
					)
				}
				else{//we may only assume what's on the user's list.
					chaptersRead += Math.max(
						item.progress,
						item.progressVolumes
					);
					volumesRead += Math.max(
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumesNow",item.media.status,item.progress)
					)
				};
				if(useScripts.noRewatches && item.repeat){//if they have a reread, they have at least completed it
					chaptersRead = Math.max(//first round
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead = Math.max(
						item.media.volumes,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				}
				else{
					chaptersRead += item.repeat * Math.max(//chapters from rereads
						item.media.chapters,
						item.media.volumes,
						item.progress,
						item.progressVolumes,
						unfinishedLookup(item.mediaId+"","chapters",item.media.status),//use our lookup table
						1
					);
					volumesRead += item.repeat * Math.max(//many manga have no volumes, so we can't make all of the same assumptions
						item.media.volumes,
						item.progressVolumes,//better than nothing if a volume count is missing
						unfinishedLookup(item.mediaId+"","volumes",item.media.status)
					)
				};
				if(item.listJSON && item.listJSON.adjustValue){
					chaptersRead = Math.max(0,chaptersRead + item.listJSON.adjustValue)
				};
				chapters += chaptersRead;
				volumes += volumesRead;
				item.volumesRead = volumesRead;
				item.chaptersRead = chaptersRead;
			});
//
			let previouScore = 0;
			let maxRunLength = 0;
			let maxRunLengthScore = 0;
			let runLength = 0;
			let sumEntries = 0;
			let average = 0;
			let publicDeviation = 0;
			let publicDifference = 0;
			let amount = scoreList.length;
			let median = (scoreList.length ? Stats.median(scoreList.map(e => e.scoreRaw)) : 0);
			let sumWeight = 0;
			let sumEntriesWeight = 0;

			scoreList.sort((a,b) => a.scoreRaw - b.scoreRaw);
			scoreList.forEach(function(item){
				sumEntries += item.scoreRaw;
				if(item.scoreRaw === previouScore){
					runLength++;
					if(runLength > maxRunLength){
						maxRunLength = runLength;
						maxRunLengthScore = item.scoreRaw
					}
				}
				else{	
					runLength = 1;
					previouScore = item.scoreRaw
				};
				sumWeight += item.chaptersRead;
				sumEntriesWeight += item.scoreRaw * item.chaptersRead
			});
			addStat("Manga on list: ",list.length);
			addStat("Manga rated: ",amount);
			addStat("Total chapters: ",chapters);
			addStat("Total volumes: ",volumes);
			if(amount){
				average = sumEntries/amount
			};
			if(scoreList.length){
				publicDeviation = Math.sqrt(
					scoreList.reduce(function(accum,element){
						if(!element.media.meanScore){
							return accum
						}
						return accum + Math.pow(element.media.meanScore - element.scoreRaw,2);
					},0)/amount
				);
				publicDifference = scoreList.reduce(function(accum,element){
					if(!element.media.meanScore){
						return accum
					}
					return accum + (element.scoreRaw - element.media.meanScore);
				},0)/amount
			}
			list.sort((a,b) => a.mediaId - b.mediaId);
			if(amount){//no scores
				if(amount === 1){
					addStat(
						"Only one score given: ",
						maxRunLengthScore
					)
				}
				else{
					addStat(
						"Average score: ",
						average.toPrecision(4)
					);
					addStat(
						"Average score: ",
						(sumEntriesWeight/sumWeight).toPrecision(4),
						" (weighted by chapter count)"
					);
					addStat("Median score: ",median);
					addStat(
						"Global difference: ",
						publicDifference.roundPlaces(2),
						" (average difference from global average)"
					);
					addStat(
						"Global deviation: ",
						publicDeviation.roundPlaces(2),
						" (standard deviation from the global average of each entry)"
					);
					if(maxRunLength > 1){
						addStat("Most common score: ",maxRunLengthScore, " (" + maxRunLength + " instances)")
					}
					else{
						addStat("Most common score: ","","no two scores alike")
					}
				}
			};
//
			let mangaFormatter = {
				title: "Custom Manga Tags",
				display: !useScripts.hideCustomTags,
				headings: ["Tag","Count","Mean Score","Chapters","Volumes"],
				focus: -1,
				celData: [
					function(cel,data,index,isPrimary){
						if(isPrimary){
							let nameCellCount = create("div","count",(index+1),cel);
							create("a",false,data[index].name,cel,"cursor:pointer;");
							let nameCellStatus = create("span","hohSumableStatusContainer",false,cel);
							Object.keys(distributionColours).sort().forEach(function(status){
								if(data[index].status && data[index].status[status]){
									let statusSumDot = create("div","hohSumableStatus",data[index].status[status],nameCellStatus);
									statusSumDot.style.background = distributionColours[status];
									statusSumDot.title = data[index].status[status] + " " + capitalize(status.toLowerCase());
									if(data[index].status[status] > 99){
										statusSumDot.style.fontSize = "8px"
									}
									if(data[index].status[status] > 999){
										statusSumDot.style.fontSize = "6px"
									}
									statusSumDot.onclick = function(e){
										e.stopPropagation();
										Array.from(cel.parentNode.nextSibling.children).forEach(function(child){
											if(child.children[1].children[0].title === status.toLowerCase()){
												child.style.display = "grid"
											}
											else{
												child.style.display = "none"
											}
										})
									}
								}
							})
						}
						else{
							create("a","hohNameCel",data[index].name,cel)
								.href = "/manga/" + data[index].mediaId + "/" + safeURL(data[index].name)
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							cel.innerText = data[index].list.length
						}
						else{
							let statusDot = create("div","hohStatusDot",false,cel);
							statusDot.style.backgroundColor = distributionColours[data[index].status];
							statusDot.title = data[index].status.toLowerCase();
							if(data[index].status === "COMPLETED"){
								statusDot.style.backgroundColor = "transparent"//default case
							}
							if(data[index].repeat === 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
							}
							else if(data[index].repeat > 1){
								cel.appendChild(svgAssets2.repeat.cloneNode(true));
								create("span",false,data[index].repeat,cel)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary){
							if(data[index].average === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].average).roundPlaces(1)
							}
						}
						else{
							if(data[index].score === 0){
								cel.innerText = "-"
							}
							else{
								cel.innerText = (data[index].score).roundPlaces(1)
							}
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].chaptersRead
						}
					},
					function(cel,data,index,isPrimary){
						if(isPrimary && !data[index].list.length){
							cel.innerText = "-"
						}
						else{
							cel.innerText = data[index].volumesRead
						}
					}
				],
				sorting: [
					(a,b) => ALPHABETICAL(a => a.name),
					(b,a) => a.list.length - b.list.length,
					(b,a) => a.average - b.average,
					(b,a) => a.chaptersRead - b.chaptersRead,
					(b,a) => a.volumesRead - b.volumesRead
				]
			};
			const mangaFields = [
				{
					key : "name",
					method : function(media){
						if(aliases.has(media.mediaId)){
							return aliases.get(media.mediaId)
						}
						if(useScripts.titleLanguage === "NATIVE" && media.media.title.native){
							return media.media.title.native
						}
						else if(useScripts.titleLanguage === "ENGLISH" && media.media.title.english){
							return media.media.title.english
						}
						return media.media.title.romaji
					}
				},{
					key : "repeat",
					method : media => media.repeat
				},{
					key : "status",
					sumable : function(acc,val){
						if(!acc){
							acc = {};
							Object.keys(distributionColours).forEach(function(key){
								acc[key] = 0
							})
						}
						acc[val]++;
						return acc
					},
					method : media => media.status
				},{
					key : "mediaId",
					method : media => media.mediaId
				},{
					key : "score",
					method : media => media.scoreRaw
				},{
					key : "chaptersRead",
					sumable : ACCUMULATE,
					method : media => media.chaptersRead
				},{
					key : "volumesRead",
					sumable : ACCUMULATE,
					method : media => media.volumesRead
				}
			];
			let customTags = customTagsCollection(list,mangaFormatter.title,mangaFields);
			if(customTags.length){
				let customTagsMangaTable = create("div","#customTagsMangaTable",false,personalStatsManga);
				drawTable(customTags,mangaFormatter,customTagsMangaTable,true,true)
			};
			let listOfTags = regularTagsCollection(list,mangaFields,media => media.media.tags);
			if(listOfTags.length > 50){
				listOfTags = listOfTags.filter(a => a.list.length >= 3)
			}
			drawTable(listOfTags,mangaFormatter,regularMangaTable,true,false);
			semaPhoreManga = list;
			nativeTagsReplacer();
			generalAPIcall(queryMediaListStaff,{name: user,listType: "MANGA"},function(data){
				let rawStaff = returnList(data);
				rawStaff.forEach(function(raw,index){
					raw.status = list[index].status;
					raw.chaptersRead = list[index].chaptersRead;
					raw.volumesRead = list[index].volumesRead;
					raw.scoreRaw = list[index].scoreRaw
				});
				let staffMap = {};
				rawStaff.filter(obj => obj.status !== "PLANNING").forEach(function(media){
					media.media.staff.forEach(function(staff){
						if(!staffMap[staff.id]){
							staffMap[staff.id] = {
								chaptersRead: 0,
								volumesRead: 0,
								count: 0,
								scoreCount: 0,
								scoreSum: 0,
								id: staff.id,
								name: staff.name
							}
						}
						if(media.chaptersRead || media.volumesRead){
							staffMap[staff.id].volumesRead += media.volumesRead;
							staffMap[staff.id].chaptersRead += media.chaptersRead;
							staffMap[staff.id].count++
						};
						if(media.scoreRaw){
							staffMap[staff.id].scoreSum += media.scoreRaw;
							staffMap[staff.id].scoreCount++
						}
					})
				});
				let staffList = [];
				Object.keys(staffMap).forEach(
					key => staffList.push(staffMap[key])
				);
				staffList = staffList.filter(obj => obj.count >= 1).sort(
					(b,a) => a.count - b.count || a.chaptersRead - b.chaptersRead || a.volumesRead - b.volumesRead
				);
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 3
						|| (obj.count >= 2 && obj.chaptersRead > 100)
						|| obj.chaptersRead > 200
					)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 5
						|| (obj.count >= 2 && obj.chaptersRead > 200)
						|| obj.chaptersRead > 300
					)
				};
				if(staffList.length > 300){
					staffList = staffList.filter(
						obj => obj.count >= 10
						|| (obj.count >= 2 && obj.chaptersRead > 300)
						|| obj.chaptersRead > 400
					)
				};
				let hasScores = staffList.some(a => a.scoreCount);
				let drawStaffList = function(){
					removeChildren(mangaStaff)
					mangaStaff.innerText = "";
					let table = create("div",["table","hohTable","hohNoPointer"],false,mangaStaff);
					let headerRow = create("div",["header","row","good"],false,table);
					let nameHeading = create("div",false,"Name",headerRow,"cursor:pointer;");
					let countHeading = create("div",false,"Count",headerRow,"cursor:pointer;");
					let scoreHeading = create("div",false,"Mean Score",headerRow,"cursor:pointer;");
					if(!hasScores){
						scoreHeading.style.display = "none"
					}
					let timeHeading = create("div",false,"Chapters Read",headerRow,"cursor:pointer;");
					let volumeHeading = create("div",false,"Volumes Read",headerRow,"cursor:pointer;");
					staffList.forEach(function(staff,index){
						let row = create("div",["row","good"],false,table);
						let nameCel = create("div",false,(index + 1) + " ",row);
						create("a","newTab",staff.name.first + " " + (staff.name.last || ""),nameCel)
							.href = "/staff/" + staff.id;
						create("div",false,staff.count,row);
						if(hasScores){
							create("div",false,(staff.scoreSum/staff.scoreCount).roundPlaces(2),row)
						}
						create("div",false,staff.chaptersRead,row);
						create("div",false,staff.volumesRead,row)
					});
					let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",mangaStaff,"margin-top:10px;");
					let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",mangaStaff,"margin-top:10px;");
					csvButton.onclick = function(){
						let csvContent = 'Staff,Count,"Mean Score","Chapters Read","Volumes Read"\n';
						staffList.forEach(function(staff){
							csvContent += csvEscape(
								[staff.name.first,staff.name.last].filter(TRUTHY).join(" ")
							) + ",";
							csvContent += staff.count + ",";
							csvContent += (staff.scoreSum/staff.scoreCount).roundPlaces(2) + ",";
							csvContent += staff.chaptersRead + ",";
							csvContent += staff.volumesRead + "\n";
						});
						saveAs(csvContent,"Manga staff stats for " + user + ".csv",true)
					};
					jsonButton.onclick = function(){
						saveAs({
							type: "MANGA",
							user: user,
							timeStamp: NOW(),
							version: "1.00",
							scriptInfo: scriptInfo,
							url: document.URL,
							description: "Anilist manga staff stats for " + user,
							fields: [
								{name: "name",description: "The full name of the staff member, as firstname lastname"},
								{name: "staffID",description: "The staff member's database number in the Anilist database"},
								{name: "count",description: "The total number of media this staff member has credits for, for the current user"},
								{name: "score",description: "The current user's mean score for the staff member out of 100"},
								{name: "chaptersRead",description: "How many chapters of this staff member's credited media the current user has read"},
								{name: "volumesRead",description: "How many volumes of this staff member's credited media the current user has read"}
							],
							data: staffList.map(staff => {
								return {
									name: (staff.name.first + " " + (staff.name.last || "")).trim(),
									staffID: staff.id,
									count: staff.count,
									score: (staff.scoreSum/staff.scoreCount).roundPlaces(2),
									chaptersRead: staff.chaptersRead,
									volumesRead: staff.volumesRead
								}
							})
						},"Manga staff stats for " + user + ".json")
					}
					nameHeading.onclick = function(){
						staffList.sort(ALPHABETICAL(a => a.name.first + " " + (a.name.last || "")));
						drawStaffList()
					};
					countHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.count - b.count
								|| a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					};
					scoreHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
								|| a.count - b.count
								|| a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
						);
						drawStaffList()
					};
					timeHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.chaptersRead - b.chaptersRead
								|| a.volumesRead - b.volumesRead
								|| a.count - b.count
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					};
					volumeHeading.onclick = function(){
						staffList.sort(
							(b,a) => a.volumesRead - b.volumesRead
								|| a.chaptersRead - b.chaptersRead
								|| a.count - b.count
								|| a.scoreSum/a.scoreCount - b.scoreSum/b.scoreCount
						);
						drawStaffList()
					}
				};
				let clickOnce = function(){
					drawStaffList();
					let place = document.querySelector(`[href$="/stats/manga/staff"]`);
					if(place){
						place.removeEventListener("click",clickOnce)
					}
				}
				let waiter = function(){
					if(location.pathname.includes("/stats/manga/staff")){
						clickOnce();
						return
					}
					let place = document.querySelector(`[href$="/stats/manga/staff"]`);
					if(place){
						place.addEventListener("click",clickOnce)
					}
					else{
						setTimeout(waiter,200)
					}
				};waiter();
			},"hohListCacheMangaStaff" + user,10*60*1000);
		};
		if(user === whoAmI){
			generalAPIcall(
				queryMediaListManga,
				{
					name: user,
					listType: "MANGA"
				},
				personalStatsMangaCallback,"hohListCacheManga",10*60*1000
			)
		}
		else{
			generalAPIcall(
				queryMediaListManga,
				{
					name: user,
					listType: "MANGA"
				},
				personalStatsMangaCallback
			)
		}
	};
	let tabWaiter = function(){
		let tabMenu = filterGroup.querySelectorAll(".filter-group > a");
		tabMenu.forEach(function(tab){
			tab.onclick = function(){
				Array.from(document.querySelector(".stats-wrap").children).forEach(child => {
					child.style.display = "initial";
				});
				Array.from(document.getElementsByClassName("hohActive")).forEach(child => {
					child.classList.remove("hohActive");
				});
				document.getElementById("hohStats").style.display = "none";
				document.getElementById("hohGenres").style.display = "none";
				document.querySelector(".page-content .user").classList.remove("hohSpecialPage");
			};
		});
		if(!tabMenu.length){
			setTimeout(tabWaiter,200)
		}
	};tabWaiter();
	let statsWrap = document.querySelector(".stats-wrap");
	if(statsWrap){
		hohStats = create("div","#hohStats",false,statsWrap,"display:none;");
		hohGenres = create("div","#hohGenres",false,statsWrap,"display:none;");
		regularGenresTable = create("div","#regularGenresTable","loading...",hohGenres);
		regularTagsTable = create("div","#regularTagsTable","loading...",hohGenres);
		regularAnimeTable = create("div","#regularAnimeTable","loading...",statsWrap);
		regularMangaTable = create("div","#regularMangaTable","loading...",statsWrap);
		animeStaff = create("div","#animeStaff","loading...",statsWrap);
		mangaStaff = create("div","#mangaStaff","loading...",statsWrap);
		animeStudios = create("div","#animeStudios","loading...",statsWrap);
		hohStats.calculated = false;
		generateStatPage();
	};
	hohStatsTrigger.onclick = function(){
		hohStatsTrigger.classList.add("hohActive");
		hohGenresTrigger.classList.remove("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active");
		};
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "initial";
		hohGenres.style.display = "none"
	};
	hohGenresTrigger.onclick = function(){
		hohStatsTrigger.classList.remove("hohActive");
		hohGenresTrigger.classList.add("hohActive");
		document.querySelector(".page-content .user").classList.add("hohSpecialPage");
		let otherActive = filterGroup.querySelector(".router-link-active");
		if(otherActive){
			otherActive.classList.remove("router-link-active");
			otherActive.classList.remove("router-link-exact-active")
		};
		document.querySelectorAll(".stats-wrap > div").forEach(
			module => module.style.display = "none"
		);
		hohStats.style.display = "none";
		hohGenres.style.display = "initial";
	};
};
