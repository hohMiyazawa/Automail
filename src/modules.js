
//Morimasa code https://greasyfork.org/en/scripts/375622-betterfollowinglist
const stats = {
	element: null,
	count: 0,
	scoreSum: 0,
	scoreCount: 0
}

const scoreColors = e => {
	let el = e.querySelector("span") || e.querySelector("svg");
	let light = document.body.classList.contains("site-theme-dark") ? 45 : 38;
	if(!el){
		return null
	}
	el.classList.add("score");
	if(el.nodeName === "svg"){
		// smiley
		if(el.dataset.icon === "meh"){
			el.childNodes[0].setAttribute("fill",`hsl(60, 100%, ${light}%)`)
		};
		return {
			scoreCount: 0.5,//weight those scores lower because of the precision
			scoreSum: ({"smile": 85,"meh": 60,"frown": 35}[el.dataset.icon])*0.5
		}
	}
	else if(el.nodeName === "SPAN"){
		let score = el.innerText.split("/").map(num => parseFloat(num));
		if(score.length === 1){// convert stars, 10 point and 10 point decimal to 100 point
			score = score[0]*20-10
		}
		else{
			if(score[1] === 10){
				score = score[0]*10
			}
			else{
				score = score[0]
			}
		}
		el.style.color = `hsl(${score*1.2}, 100%, ${light}%)`;
		return {
			scoreCount: 1,
			scoreSum: score,
		}
	}
}

const handler = (data,target,idMap) => {
	if(!target){
		return
	}
	data.forEach(e => {
		target[idMap[e.user.id]].style.gridTemplateColumns = "30px 1.3fr .7fr .6fr .2fr .2fr .5fr"; //css is my passion
		const progress = create("div","progress",e.progress);
		if(e.media.chapters || e.media.episodes){
			progress.innerText = `${e.progress}/${e.media.chapters || e.media.episodes}`;
		}
		target[idMap[e.user.id]].insertBefore(progress,target[idMap[e.user.id]].children[2])
		let notesEL = create("span","notes") // notes
		if(e.notes){
			notesEL.innerHTML = svgAssets.notes;
			notesEL.title = e.notes;
		}
		let dateString = [
			e.startedAt.year,
			e.startedAt.month,
			e.startedAt.day
		].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-") + " - " + [
			e.completedAt.year,
			e.completedAt.month,
			e.completedAt.day
		].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-");
		if(
			(e.media.chapters || e.media.episodes) === 1
			&& !e.startedAt.year
			&& e.completedAt.year
		){
			dateString = [
				e.completedAt.year,
				e.completedAt.month,
				e.completedAt.day
			].filter(TRUTHY).map(a => ((a + "").length === 1 ? "0" + a : "" + a)).join("-");
		}
		if(dateString !== " - "){
			target[idMap[e.user.id]].children[3].title = dateString;
		}
		target[idMap[e.user.id]].insertBefore(
			notesEL,target[idMap[e.user.id]].children[4]
		)
		let rewatchEL = create("span","repeat");
		if(e.repeat){
			rewatchEL.innerHTML = svgAssets.repeat;
			rewatchEL.title = e.repeat;
		}
		target[idMap[e.user.id]].insertBefore(
			rewatchEL,target[idMap[e.user.id]].children[4]
		)
	})
}

const MakeStats = () => {
	if(stats.element){
		stats.element.remove()
	}
	let main = create("h2");
	const createStat = (text, number) => {
		let el = create("span",false,text);
		create("span",false,number,el);
		return el
	}
	let count = createStat("Users: ",stats.count);
	main.append(count);
	let avg = createStat("Avg: ",0);
	avg.style.float = "right";
	main.append(avg);
	const parent = document.querySelector(".following");
	parent.prepend(main);
	stats.element = main
}

function enhanceSocialTab(){
	if(!location.pathname.match(/^\/(anime|manga)\/\d*\/[\w\-]*\/social/)){
		return
	}
	let listOfFollowers = Array.from(document.getElementsByClassName("follow"));
	if(!listOfFollowers.length){
		setTimeout(enhanceSocialTab,100);
		return
	};
	MakeStats();
	let idmap = {};
	listOfFollowers.forEach(function(e,i){
		if(!e.dataset.changed){
			const avatarURL = e.querySelector(".avatar").dataset.src;
			if(!avatarURL || avatarURL === "https://s4.anilist.co/file/anilistcdn/user/avatar/large/default.png"){
				return
			}
			const id = avatarURL.split("/").pop().match(/\d+/g)[0];
			idmap[id] = i;
			let change = scoreColors(e);
			if(change){
				stats.scoreCount += change.scoreCount;
				stats.scoreSum += change.scoreSum
			}
			++stats.count;
			e.dataset.changed = true
		}
	})
	if(Object.keys(idmap).length){
		const mediaID = window.location.pathname.split("/")[2];
		generalAPIcall(
			`query($users:[Int],$media:Int){
				Page{
					mediaList(userId_in: $users,mediaId: $media){
						progress notes repeat user{id}
						startedAt{year month day}
						completedAt{year month day}
						media{chapters episodes}
					}
				}
			}`,
			{users: Object.keys(idmap), media: mediaID},
			function(res){
				handler(res.data.Page.mediaList,listOfFollowers,idmap)
			}
		)
		let statsElements = stats.element.querySelectorAll("span > span");
		statsElements[0].innerText = stats.count;
		const avgScore = Math.round(stats.scoreSum/stats.scoreCount || 0);
		if(avgScore){
			statsElements[1].style.color = `hsl(${avgScore*1.2}, 100%, 40%)`;
			statsElements[1].innerText = `${avgScore}%`;
			statsElements[1].title = (stats.scoreSum/stats.scoreCount).toPrecision(4)
		}
		else{
			statsElements[1].parentNode.remove() // no need if no scores
		}
		statsElements[1].onclick = function(){
			statsElements[1].classList.toggle("toggled");
			Array.from(root.querySelectorAll(".follow")).forEach(function(item){
				if(item.querySelector(".score") || !statsElements[1].classList.contains("toggled")){
					item.style.display = "grid"
				}
				else{
					item.style.display = "none"
				}
			})
		}
	}
/*add average score to social tab*/
	let root = listOfFollowers[0].parentNode;
	let distribution = {};
	Object.keys(distributionColours).forEach(
		status => distribution[status] = 0
	);
	listOfFollowers.forEach(function(follower){
		let statusType = follower.querySelector(".status").innerText.toUpperCase();
		if(statusType === "WATCHING" || statusType === "READING"){
			statusType = "CURRENT"
		};
		distribution[statusType]++
	});
	if(
		Object.keys(distributionColours).some(status => distribution[status] > 0)
	){
		let locationForIt = document.getElementById("averageScore");
		let dataList = document.getElementById("socialUsers");
		let statusList = document.getElementById("statusList");
		if(!locationForIt){
			let insertLocation = document.querySelector(".following");
			insertLocation.parentNode.style.marginTop = "5px";
			insertLocation.parentNode.style.position = "relative";
			locationForIt = create("span","#averageScore");
			insertLocation.insertBefore(
				locationForIt,
				insertLocation.children[0]
			);
			statusList = create("span","#statusList",false,false,"position:absolute;right:0px;top:5px;");
			insertLocation.insertBefore(
				statusList,
				insertLocation.children[0]
			);
			dataList = create("datalist","#socialUsers");
			insertLocation.insertBefore(
				dataList,
				insertLocation.children[0]
			)
		}
		locationForIt.nextSibling.style.marginTop = "5px";
		if(dataList.childElementCount < listOfFollowers.length){
			listOfFollowers.slice(dataList.childElementCount).forEach(
				follower => create("option",false,false,dataList)
					.value = follower.children[1].innerText
			)
		}
		removeChildren(statusList)
		Object.keys(distributionColours).sort().forEach(function(status){
			if(distribution[status]){
				let statusSumDot = create("div","hohSumableStatus",distribution[status],statusList,"cursor:pointer;");
				statusSumDot.style.background = distributionColours[status];
				statusSumDot.title = distribution[status] + " " + capitalize(status.toLowerCase());
				if(distribution[status] > 99){
					statusSumDot.style.fontSize = "8px"
				}
				if(distribution[status] > 999){
					statusSumDot.style.fontSize = "6px"
				};
				statusSumDot.onclick = function(){
					Array.from(root.querySelectorAll(".follow .status")).forEach(function(item){
						if(item.innerText.toUpperCase() === status || (["WATCHING","READING"].includes(item.innerText.toUpperCase()) && status === "CURRENT")){
							item.parentNode.style.display = "grid"
						}
						else{
							item.parentNode.style.display = "none"
						}
					})
				}
			}
		});
	};
	let waiter = function(){
		setTimeout(function(){
			if(root.childElementCount !== listOfFollowers.length){
				enhanceSocialTab()
			}
			else{
				waiter()
			}
		},100);
	};waiter()
}

function enhanceSocialTabFeed(){
	let URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w\-]*\/social/);
	if(!URLstuff){
		return
	}
	let feedLocation = document.querySelector(".activity-feed");
	if(!feedLocation){
		setTimeout(enhanceSocialTabFeed,100);
		return
	};
	let hohFeed = create("div","hohSocialFeed");
	feedLocation.insertBefore(hohFeed,feedLocation.children[0]);
	let optionsContainer = create("div",false,false,hohFeed,"position:absolute;top:0px;right:0px;");
	let hasReplies = createCheckbox(optionsContainer);
	create("span",false,"Has Replies",optionsContainer,"margin-right:7px;");
	let isFollowing = createCheckbox(optionsContainer);
	create("span",false,"Following",optionsContainer);
	let feedHeader = create("h2",false,"Recent Activity",hohFeed,"display:none;");
	let feedContent = create("div",false,false,hohFeed,"display:none;");
	let loadMore = create("div","load-more","Load More",hohFeed,"display:none;background: rgb(var(--color-foreground));border-radius: 4px;cursor: pointer;font-size: 1.4rem;margin-top: 20px;padding: 14px;text-align: center;transition: .2s;");
	let query = "";
	let buildFeed = function(page){
		authAPIcall(
			query,
			{
				page: page,
				mediaId: parseInt(URLstuff[2])
			},
			function(data){
				if(data.data.Page.pageInfo.lastPage > page){
					loadMore.style.display = "block";
					loadMore.onclick = function(){
						buildFeed(page + 1);
					}
				}
				else{
					loadMore.style.display = "none";
				}
				const randomData = "data-v-b1fca210";
				data.data.Page.activities.forEach(act => {
					let activityEntry = create("div",["activity-entry","activity-" + URLstuff[1] + "_list"],false,feedContent);activityEntry.setAttribute(randomData,"");
						let wrap = create("div","wrap",false,activityEntry);wrap.setAttribute(randomData,"");
							let list = create("div","list",false,wrap);list.setAttribute(randomData,"");
								let cover = create("a",["cover","router-link-active"],false,list);cover.setAttribute(randomData,"");
								cover.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
								cover.style.backgroundImage = `url("${act.media.coverImage.medium}")`;
								let details = create("div","details",false,list);details.setAttribute(randomData,"");
									let name = create("a","name",act.user.name,details);name.setAttribute(randomData,"");
									name.href = "/user/" + act.user.name;
									details.appendChild(document.createTextNode(" "));
									let status = create("div","status",act.status + (act.progress ? " " + act.progress + " of " : " "),details);status.setAttribute(randomData,"");
										let link = create("a",["title","router-link-active"]," " + act.media.title.userPreferred,status);link.setAttribute(randomData,"")
											link.href = "/" + URLstuff[1] + "/" + URLstuff[2] + "/" + safeURL(act.media.title.userPreferred);
									let avatar = create("a","avatar",false,details);avatar.setAttribute(randomData,"");
									avatar.href = "/user/" + act.user.name;
									avatar.style.backgroundImage = `url("${act.user.avatar.medium}")`;
							let timeWrapper = create("div","time",false,wrap);timeWrapper.setAttribute(randomData,"");
								let action = create("a","action",false,timeWrapper);action.setAttribute(randomData,"");
								action.innerHTML = svgAssets.link;
								action.href = "/activity/" + act.id;
								let time = nativeTimeElement(act.createdAt);timeWrapper.appendChild(time);time.setAttribute(randomData,"");
							let actions = create("div","actions",false,wrap);actions.setAttribute(randomData,"");
								let actionReplies = create("div",["action","replies"],false,actions);actionReplies.setAttribute(randomData,"");
									if(act.replies.length){
										let replyCount = create("span","count",act.replies.length,actionReplies);replyCount.setAttribute(randomData,"");
										actionReplies.appendChild(document.createTextNode(" "));
									};
									actionReplies.innerHTML += svgAssets.reply;
								actions.appendChild(document.createTextNode(" "));
								let actionLikes = create("div",["action","likes"],false,actions);actionLikes.setAttribute(randomData,"");
								const randomData2 = "data-v-977827fa";
									let likeWrap = create("div","like-wrap",false,actionLikes);likeWrap.setAttribute(randomData,"");likeWrap.setAttribute(randomData2,"");
										let likeButton = create("div","button",false,actionLikes);likeButton.setAttribute(randomData2,"");
											let likeCount = create("span","count",act.likes.length || "",likeButton);likeCount.setAttribute(randomData2,"");
											likeButton.appendChild(document.createTextNode(" "));
											likeButton.innerHTML += svgAssets.likeNative;
										likeButton.title = act.likes.map(a => a.name).join("\n");
										if(act.likes.some(like => like.name === whoAmI)){
											likeButton.classList.add("liked")
										};
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
											};
											likeButton.title = act.likes.map(a => a.name).join("\n")
										};
						let replyWrap = create("div","reply-wrap",false,activityEntry,"display:none;");replyWrap.setAttribute(randomData,"");
						actionReplies.onclick = function(){
							if(replyWrap.style.display === "none"){
								replyWrap.style.display = "block"
							}
							else{
								replyWrap.style.display = "none"
							}
						};
						const randomDataReplies = "data-v-7ce9ffb8";
						let activityReplies = create("div","activity-replies",false,replyWrap);activityReplies.setAttribute(randomData,"");activityReplies.setAttribute(randomDataReplies,"");
						const rnd = "data-v-0664fa9f";
						act.replies.forEach(rep => {
							let reply = create("div","reply",false,activityReplies);reply.setAttribute(randomDataReplies,"");reply.setAttribute(rnd,"");
								let header = create("div","header",false,reply);header.setAttribute(rnd,"");
									let repAvatar = create("a","avatar",false,header);repAvatar.setAttribute(rnd,"");
									repAvatar.href = "/user/" + rep.user.name;
									repAvatar.style.backgroundImage = `url("${rep.user.avatar.medium}")`;
									header.appendChild(document.createTextNode(" "));
									let repName = create("a","name",rep.user.name,header);repName.setAttribute(rnd,"");
									repName.href = "/user/" + rep.user.name;
									let cornerWrapper = create("div","actions",false,header);cornerWrapper.setAttribute(rnd,"");
										let repActionLikes = create("div",["action","likes"],false,cornerWrapper);repActionLikes.setAttribute(rnd,"");
											const randomDataHate = "data-v-977827fa";
											let repLikeWrap = create("div","like-wrap",false,repActionLikes);repLikeWrap.setAttribute(rnd,"");likeWrap.setAttribute(randomDataHate,"");
												let repLikeButton = create("div","button",false,repActionLikes);likeButton.setAttribute(randomDataHate,"");
													let repLikeCount = create("span","count",rep.likes.length || "",repLikeButton);repLikeCount.setAttribute(randomDataHate,"");
													repLikeButton.appendChild(document.createTextNode(" "));
													repLikeButton.innerHTML += svgAssets.likeNative;
												repLikeButton.title = rep.likes.map(a => a.name).join("\n");
												if(rep.likes.some(like => like.name === whoAmI)){
													repLikeButton.classList.add("liked")
												};
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
													};
													repLikeButton.title = rep.likes.map(a => a.name).join("\n")
												};
										let repActionTime = create("div",["action","time"],false,cornerWrapper);repActionTime.setAttribute(rnd,"");
											let repTime = nativeTimeElement(rep.createdAt);repActionTime.appendChild(repTime);repTime.setAttribute(randomData,"");
								let replyMarkdown = create("div","reply-markdown",false,reply);replyMarkdown.setAttribute(rnd,"");
									let markdown = create("div","markdown",false,replyMarkdown);markdown.setAttribute(rnd,"");
									markdown.innerHTML = rep.text;
						});
				})
			}
		);
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
	Page(page: $page){
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
	Page(page: $page){
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
	Page(page: $page){
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
			};
			buildFeed(1);
		}
		else{
			feedLocation.classList.remove("hohReplaceFeed");
			feedContent.style.display = "none";
			feedHeader.style.display = "none";
			loadMore.style.display = "none";
		}
	}
}

function enhanceForum(){//purpose: reddit-style comment three collapse button
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)){
		return
	}
	let comments = Array.from(document.getElementsByClassName("comment-wrap"));
	comments.forEach(comment => {
		if(!comment.hasOwnProperty("hohVisited")){
			comment.hohVisited = true;
			let hider = create("span","hohForumHider","[-]");
			hider.onclick = function(){
				let parentComment = hider.parentNode.parentNode;
				if(hider.innerText === "[-]"){
					hider.innerText = "[+]";
					parentComment.children[1].style.display = "none";
					parentComment.parentNode.classList.add("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "none"
					}
				}
				else{
					hider.innerText = "[-]";
					parentComment.children[1].style.display = "block";
					parentComment.parentNode.classList.remove("hohCommentHidden");
					if(parentComment.parentNode.children.length > 1){
						parentComment.parentNode.children[1].style.display = "block"
					}
				}
			};
			hider.onmouseenter = function(){
				hider.parentNode.parentNode.parentNode.classList.add("hohCommentSelected")
			}
			hider.onmouseleave = function(){
				hider.parentNode.parentNode.parentNode.classList.remove("hohCommentSelected")
			}
			comment.children[0].children[0].insertBefore(
				hider,
				comment.children[0].children[0].children[0]
			)
		}
	});
	setTimeout(enhanceForum,100)
}

function dubMarker(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
		return
	}
	if(document.getElementById("dubNotice")){
		return
	}
	const variables = {
		id: document.URL.match(/\/anime\/(\d+)\//)[1],
		page: 1,
		language: useScripts.dubMarkerLanguage.toUpperCase()
	};
	const query = `
query($id: Int!, $type: MediaType, $page: Int = 1, $language: StaffLanguage){
	Media(id: $id, type: $type){
		characters(page: $page, sort: [ROLE], role: MAIN){
			edges {
				node{id}
				voiceActors(language: $language){language}
			}
		}
	}
}`;
	let dubCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/anime\/.*/)){
			return
		};
		let dubNoticeLocation = document.querySelector(".sidebar");
		if(!dubNoticeLocation){
			setTimeout(function(){
				dubCallback(data)
			},200);
			return
		}
		if(data.data.Media.characters.edges.reduce(
			(actors,a) => actors + a.voiceActors.length,0
		)){//any voice actors for this language?
			if(document.getElementById("dubNotice")){
				return
			}
			let dubNotice = create("p","#dubNotice",useScripts.dubMarkerLanguage + " dub available");
			dubNoticeLocation.insertBefore(dubNotice,dubNoticeLocation.firstChild)
		}
	};
	generalAPIcall(query,variables,dubCallback,"hohDubInfo" + variables.id + variables.language)
}

function addSubTitleInfo(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/.*/);
	if(!URLstuff){
		return
	}
	else if(document.querySelector(".hohExtraBox")){
		document.querySelector(".hohExtraBox").remove()
	};
	let sidebar = document.querySelector(".sidebar");
	if(!sidebar){
		setTimeout(addSubTitleInfo,200);
		return
	};
	let infoNeeded = {};
	Array.from(sidebar.querySelectorAll(".data-set .type")).forEach(pair => {
		if(pair.innerText === "Native"){
			infoNeeded.native = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "Romaji"){
			infoNeeded.romaji = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "English"){
			infoNeeded.english = pair.nextElementSibling.innerText
		}
		else if(pair.innerText === "Format"){
			infoNeeded.format = pair.nextElementSibling.innerText;
			if(infoNeeded.format === "Manga (Chinese)"){
				infoNeeded.format = "Manhua"
			}
			else if(infoNeeded.format === "Manga (Korean)"){
				infoNeeded.format = "Manhwa"
			}
		}
		else if(pair.innerText === "Release Date" || pair.innerText === "Start Date"){
			infoNeeded.year = pair.nextElementSibling.innerText.match(/\d{4}/)[0]
		}
		else if(pair.innerText === "Studios"){
			infoNeeded.studios = pair.nextElementSibling.innerText.split("\n");
			infoNeeded.studiosLinks = Array.from(
				pair.nextElementSibling.querySelectorAll("a")
			).map(a => a.href);
		}
	});
	if(!infoNeeded.romaji){//guaranteed to exist, so a good check for if the sidebar has loaded
		setTimeout(addSubTitleInfo,200);
		return
	}
	let title = document.querySelector(".content > h1:not(#hohAliasHeading)");
	let extraBox = create("div","hohExtraBox");
	title.parentNode.insertBefore(extraBox,title.nextElementSibling);
	let subTitle = create("p","value","",extraBox,"margin:2px;font-style:italic;");
	if(useScripts.titleLanguage === "NATIVE"){
		if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.native){
			subTitle.innerText = infoNeeded.romaji
		}
		else if(infoNeeded.english && infoNeeded.english !== infoNeeded.native){
			subTitle.innerText = infoNeeded.english
		}
	}
	else if(useScripts.titleLanguage === "ENGLISH"){
		if(infoNeeded.native && infoNeeded.native !== infoNeeded.english){
			subTitle.innerText = infoNeeded.native
		}
		else if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.english){
			subTitle.innerText = infoNeeded.romaji
		}
	}
	else{
		if(
			infoNeeded.native
			&& infoNeeded.native.replace(//convert fullwidth to regular before comparing
				/[\uff01-\uff5e]/g,
				ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
			) !== infoNeeded.romaji
		){
			subTitle.innerText = infoNeeded.native
		}
	}
	if(infoNeeded.year){
		create("a","value",infoNeeded.year,extraBox,"margin-right:10px;")
			.href = "/search/" + URLstuff[1] + "\?year=" + infoNeeded.year + "%25"
	}
	if(infoNeeded.format && infoNeeded.format !== "Manga"){
		create("span","value",infoNeeded.format,extraBox,"margin-right:10px;")
	}
	if(infoNeeded.studios){
		let studioBox = create("span","value",false,extraBox);
		infoNeeded.studios.forEach((studio,i) => {
			let studiolink = create("a",false,studio,studioBox);
			studiolink.href = infoNeeded.studiosLinks[i];
			if(i < infoNeeded.studios.length - 1){
				create("span",false,", ",studioBox)
			}
		})
	}
}

function enhanceStaff(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
		return
	}
	if(document.querySelector(".hohFavCount")){
		return
	};
	const variables = {id: document.URL.match(/\/staff\/(\d+)\/?/)[1]};
	const query = "query($id: Int!){Staff(id: $id){favourites}}";
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
			return
		}
		let favCount = document.querySelector(".favourite .count");
		if(favCount){
			favCount.parentNode.onclick = function(){
				if(favCount.parentNode.classList.contains("isFavourite")){
					favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
				}
				else{
					favCount.innerText = parseInt(favCount.innerText) + 1
				}
			};
			if(data.data.Staff.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Staff.favourites + 1
			}
			else{
				favCount.innerText = data.data.Staff.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200)
		}
	};
	generalAPIcall(query,variables,favCallback,"hohStaffFavs" + variables.id,60*60*1000)
}

function replaceStaffRoles(){
	let URLstuff = location.pathname.match(/^\/staff\/(\d+)\/?.*/);
	if(!URLstuff){
		return
	};
	let possibleGarbage = document.getElementById("hoh-media-roles");
	if(possibleGarbage){
		if(possibleGarbage.dataset.staffId === URLstuff[1]){
			return
		}
		else{
			possibleGarbage.remove();
			let possibleFilterBar = document.querySelector(".hohFilterBar");
			if(possibleFilterBar){
				possibleFilterBar.remove()
			}
		}
	};
	let insertParent = document.querySelector(".media-roles");
	let insertParentCharacters = document.querySelector(".character-roles");
	if(!insertParent && !insertParentCharacters){
		setTimeout(replaceStaffRoles,200);
		return;
	};
	let substitution = false;
	if(!insertParent){
		insertParent = create("div",["media-roles","container","substitution"],false,insertParentCharacters.parentNode);
		substitution = true
	}
	else{
		insertParent.classList.add("substitution")
	};
	insertParent.parentNode.classList.add("substitution");
	let hohCharacterRolesBox = create("div","#hoh-character-roles");
	let hohCharacterRolesHeader = create("h4",false,"Character Voice Roles",hohCharacterRolesBox);
	hohCharacterRolesHeader.style.display = "none";
	let hohCharacterRoles = create("div","grid-wrap",false,hohCharacterRolesBox);
	hohCharacterRoles.style.margin = "10px";

	let hohMediaRoles = create("div","#hoh-media-roles");
	hohMediaRoles.dataset.staffId = URLstuff[1];
	let hohMediaRolesAnimeHeader = create("h4",false,"Anime Staff Roles",hohMediaRoles);
	hohMediaRolesAnimeHeader.style.display = "none";
	let hohMediaRolesAnime = create("div","grid-wrap",false,hohMediaRoles);
	hohMediaRolesAnime.style.margin = "10px";

	let hohMediaRolesMangaHeader = create("h4",false,"Manga Staff Roles",hohMediaRoles);
	hohMediaRolesMangaHeader.style.display = "none";
	let hohMediaRolesManga = create("div","grid-wrap",false,hohMediaRoles);
	hohMediaRolesManga.style.margin = "10px";
//sort
	let hohMediaSort = create("div",["container","hohFilterBar"]);
	let sortText = create("span",false,"Sort",hohMediaSort);
	let sortSelect = create("select",false,false,hohMediaSort);
	sortSelect.style.marginLeft = "5px";
	let filterSelect = create("input",false,false,hohMediaSort,"color:rgb(var(--color-text));");
	filterSelect.setAttribute("list","staffRoles");
	filterSelect.placeholder = "Filter by title, role, etc.";
	let filterExplanation = create("abbr",false,"?",hohMediaSort,"margin-left:5px;cursor:pointer;");
	filterExplanation.onclick = function(){
		let scrollableContent = createDisplayBox("min-width:400px;width:700px;");
		scrollableContent.innerText = `
Text in the field will be matched against all titles, roles, genres tags, your status, the media format and the start year. If it matches one of them, the media is displayed.

Regular expressions are permitted for titles.

If you want to limit it to just one filter type, you can do it like "genre:mecha" or "status:watching"
(status filtering only works if you have granted Automail permission to view your list data)

The start year can also be a range like "2000-2005"`
	};
	let dataList = create("datalist",false,false,hohMediaSort);
	dataList.id = "staffRoles";
	let digestStats = create("span",false,false,hohMediaSort,"margin-left:100px;position:relative;");
	let sortOptionAlpha = create("option",false,"Alphabetical",sortSelect);
	sortOptionAlpha.value = "alphabetical";
	let sortOptionChrono = create("option",false,"Chronological",sortSelect);
	sortOptionChrono.value = "chronological";
	let sortOptionPopularity = create("option",false,"Popularity",sortSelect);
	sortOptionPopularity.value = "popularity";
	let sortOptionLength = create("option",false,"Length",sortSelect);
	sortOptionLength.value = "length";
	let sortOptionScore = create("option",false,"Score",sortSelect);
	sortOptionScore.value = "score";
	if(useScripts.accessToken){
		create("option",false,"My Score",sortSelect)
			.value = "myScore"
		create("option",false,"My Progress",sortSelect)
			.value = "myProgress"
	}
	let autocomplete = new Set();
	sortSelect.value = useScripts.staffRoleOrder;
	hohMediaSort.style.marginBottom = "10px";
	hohMediaSort.style.marginTop = "3px";
//end sort
	let initPerformed = false;
	let UIinit = function(){
		initPerformed = true;
		insertParent.parentNode.insertBefore(hohMediaSort,insertParentCharacters);
		insertParent.insertBefore(hohMediaRoles,insertParent.children[0]);
		insertParentCharacters.insertBefore(hohCharacterRolesBox,insertParentCharacters.children[0]);
	};
	let animeRolesList = [];
	let mangaRolesList = [];
	let voiceRolesList = [];
	const animeValueFunction = function(anime){
		if(!anime.myStatus){
			return -1
		}
		let entryDuration = (anime.duration || 1)*(anime.myStatus.progress || 0);//current round
		if(useScripts.noRewatches && anime.myStatus.repeat){
			entryDuration = Math.max(
				1,
				anime.episodes || 0,
				anime.myStatus.progress || 0
			) * (anime.duration || 1);//first round
		}
		else{
			entryDuration += (anime.myStatus.repeat || 0) * Math.max(
				1,
				anime.episodes || 0,
				anime.myStatus.progress || 0
			) * (anime.duration || 1);//repeats
		}
		if(anime.listJSON && anime.listJSON.adjustValue){
			entryDuration = Math.max(0,entryDuration + anime.listJSON.adjustValue*(anime.duration || 1))
		}
		return entryDuration
	}
	const mangaValueFunction = function(manga){
		if(!manga.myStatus){
			return -1
		}
		let chaptersRead = 0;
		let volumesRead = 0;
		if(manga.myStatus.status === "COMPLETED"){//if it's completed, we can make some safe assumptions
			chaptersRead = Math.max(//chapter progress on the current read
				manga.chapters,//in most cases, it has a chapter count
				manga.volumes,//if not, there's at least 1 chapter per volume
				manga.myStatus.progress,//if it doesn't have a volume count either, the current progress is probably not out of date
				manga.myStatus.progressVolumes,//if it doesn't have a chapter progress, count at least 1 chapter per volume
				1//finally, an entry has at least 1 chapter
			);
			volumesRead += Math.max(
				manga.myStatus.progressVolumes,
				manga.volumes
			)
		}
		else{//we may only assume what's on the user's list.
			chaptersRead += Math.max(
				manga.myStatus.progress,
				manga.myStatus.progressVolumes
			);
			volumesRead += manga.myStatus.progressVolumes;
		};
		if(useScripts.noRewatches && (manga.myStatus.repeat || 0)){//if they have a reread, they have at least completed it
			chaptersRead = Math.max(//first round
				manga.chapters,
				manga.volumes,
				manga.myStatus.progress,
				manga.myStatus.progressVolumes,
				1
			);
			volumesRead = Math.max(
				manga.volumes,
				manga.myStatus.progressVolumes
			)
		}
		else{
			chaptersRead += (manga.myStatus.repeat || 0) * Math.max(//chapters from rereads
				manga.chapters,
				manga.volumes,
				manga.myStatus.progress,
				manga.myStatus.progressVolumes,
				1
			);
			volumesRead += (manga.myStatus.repeat || 0) * Math.max(
				manga.volumes,
				manga.myStatus.progressVolumes
			)
		};
		if(manga.listJSON && manga.listJSON.adjustValue){
			chaptersRead = Math.max(0,chaptersRead + manga.listJSON.adjustValue)
		}
		return {
			chapters: chaptersRead,
			volumes: volumesRead
		}
	}
	let listRenderer = function(){
		if(!initPerformed){
			UIinit()
		};
		useScripts.staffRoleOrder = sortSelect.value;
		useScripts.save();
		if(sortSelect.value === "alphabetical"){
			animeRolesList.sort(ALPHABETICAL(a => a.title));
			mangaRolesList.sort(ALPHABETICAL(a => a.title));
			voiceRolesList.sort(ALPHABETICAL(a => a.title))
		}
		else if(sortSelect.value === "chronological"){
			const yearSorter = (a,b) => {
				let aTime = a.startDate;
				let bTime = b.startDate;
				if(!aTime.year){
					aTime = a.endDate
				}
				if(!bTime.year){
					bTime = b.endDate
				}
				if(!aTime.year){
					if(!bTime.year){
						if(b.status === "NOT_YET_RELEASED" && a.status === "NOT_YET_RELEASED"){
							return 0
						}
						else if(a.status === "NOT_YET_RELEASED"){
							return -1
						}
					}
					return 1;
				}
				else if(!bTime.year){
					return -1
				}
				return aTime.year - bTime.year
					|| aTime.month - bTime.month
					|| aTime.day - bTime.day
					|| a.endDate.year - b.endDate.year
					|| a.endDate.month - b.endDate.month
					|| a.endDate.day - b.endDate.day
					|| 0
			};
			animeRolesList.sort(yearSorter);
			mangaRolesList.sort(yearSorter);
			voiceRolesList.sort(yearSorter)
		}
		else if(sortSelect.value === "popularity"){
			const popSorter = (b,a) => a.popularity - b.popularity || a.score - b.score;
			animeRolesList.sort(popSorter);
			mangaRolesList.sort(popSorter);
			voiceRolesList.sort(popSorter)
		}
		else if(sortSelect.value === "score"){
			const scoreSorter = (b,a) => a.score - b.score || a.popularity - b.popularity;
			animeRolesList.sort(scoreSorter);
			mangaRolesList.sort(scoreSorter);
			voiceRolesList.sort(scoreSorter)
		}
		else if(sortSelect.value === "length"){
			animeRolesList.sort(
				(b,a) => a.episodes - b.episodes || a.duration - b.duration || b.title.localeCompare(a.title)
			);
			voiceRolesList.sort(
				(b,a) => a.episodes - b.episodes || a.duration - b.duration || b.title.localeCompare(a.title)
			);
			mangaRolesList.sort(
				(b,a) => a.chapters - b.chapters || a.volumes - b.volumes || b.title.localeCompare(a.title)
			)
		}
		else if(sortSelect.value === "myScore"){
			let scoreSorter = function(b,a){
				let scoreTier = (a.myStatus ? a.myStatus.scoreRaw : 0) - (b.myStatus ? b.myStatus.scoreRaw : 0);
				if(scoreTier !== 0){
					return scoreTier
				}
				let progressTier = (a.myStatus ? a.myStatus.progress : -1) - (b.myStatus ? b.myStatus.progress : -1);
				if(progressTier !== 0){
					return progressTier
				}
				return a.popularity - b.popularity
			}
			animeRolesList.sort(scoreSorter);
			mangaRolesList.sort(scoreSorter);
			voiceRolesList.sort(scoreSorter);
		}
		else if(sortSelect.value === "myProgress"){
			const animeSorter = (b,a) => animeValueFunction(a) - animeValueFunction(b) || b.title.localeCompare(a.title);
			const mangaSorter = (b,a) => {
				const aval = mangaValueFunction(a);
				const bval = mangaValueFunction(b);
				return aval.chapters - bval.chapters || aval.volumes - bval.volumes|| b.title.localeCompare(a.title)
			}
			animeRolesList.sort(animeSorter);
			voiceRolesList.sort(animeSorter);
			mangaRolesList.sort(mangaSorter);
		}
		hohMediaRolesAnimeHeader.style.display = "none";
		hohMediaRolesMangaHeader.style.display = "none";
		hohCharacterRolesHeader.style.display = "none";
		if(animeRolesList.length){
			hohMediaRolesAnimeHeader.style.display = "inline"
		}
		if(mangaRolesList.length){
			hohMediaRolesMangaHeader.style.display = "inline"
		}
		if(voiceRolesList.length){
			hohCharacterRolesHeader.style.display = "inline"
		}
		let createRoleCard = function(media,type){
			let roleCard = create("div",["role-card","view-media"]);
			roleCard.style.position = "relative";
			let mediaA = create("div","media",false,roleCard);
			let cover = create("a","cover",false,mediaA);
			cover.href = "/" + type + "/" + media.id + "/" + safeURL(media.title);
			cover.style.backgroundImage = "url(" + media.image + ")";
			let content = create("a","content",false,mediaA);
			content.href = "/" + type + "/" + media.id + "/" + safeURL(media.title);
			let name = create("div","name",media.title,content);
			let role = create("div","role",media.role.join(", "),content);
			if(media.myStatus){
				let statusDot = create("div",["hohStatusDot","hohStatusDotRight"],false,roleCard);
				statusDot.style.background = distributionColours[media.myStatus.status];
				statusDot.title = media.myStatus.status.toLowerCase();
				if(media.myStatus.status === "CURRENT"){
					statusDot.title += " (" + media.myStatus.progress + ")"
				}
			};
			return roleCard;
		};
		let sumDuration = 0;
		let sumChapters = 0;
		let sumVolumes = 0;
		let sumScores = 0;
		let amount = 0;
		let animeCurrentFlag = false;
		let mangaCurrentFlag = false;
		let distribution = {};
		Object.keys(distributionColours).forEach(
			status => distribution[status] = 0
		);
		removeChildren(hohCharacterRoles)
		Array.from(insertParentCharacters.children).forEach(child => {
			if(child.id !== "hoh-character-roles"){
				child.style.display = "none";
			}
		})
		Array.from(insertParent.children).forEach(child => {
			if(child.id !== "hoh-media-roles"){
				child.style.display = "none"
			}
		})
		const mediaMatcher = {
			"title-romaji": (query,media) => media.titleRomaji && (
				media.titleRomaji.toLowerCase().match(query.toLowerCase())
				|| media.titleRomaji.toLowerCase().includes(query.toLowerCase())
			),
			"title-english": (query,media) => media.titleEnglish && (
				media.titleEnglish.toLowerCase().match(query.toLowerCase())
				|| media.titleEnglish.toLowerCase().includes(query.toLowerCase())
			),
			"title-native": (query,media) => media.titleNative && (
				media.titleNative.toLowerCase().match(query.toLowerCase())
				|| media.titleNative.toLowerCase().includes(query.toLowerCase())
			),
			"format": (query,media) => (media.format || "").replace("_","").toLowerCase().match(
				query.toLowerCase().replace(/\s|-|_/,"")
			),
			"status": (query,media) => media.myStatus && (
				media.myStatus.status.toLowerCase() === query.toLowerCase()
				|| media.myStatus.status === "CURRENT"  && ["reading","watching"].includes(query.toLowerCase())
				|| media.myStatus.status === "PLANNING" && ["plan to watch","plan to read"].includes(query.toLowerCase())
			),
			"year": (query,media) => {
				const rangeMatch = query.trim().match(/^(\d\d\d\d)\s?\-\s?(\d\d\d\d)$/);
				return parseInt(query) === (media.startDate.year || media.endDate.year)
					|| rangeMatch && parseInt(rangeMatch[1]) <= media.startDate.year && parseInt(rangeMatch[2]) >= media.startDate.year
			},
			"genre": (query,media) => media.genres.some(
				genre => genre === query.toLowerCase()
			),
			"tag": (query,media) => media.tags.some(
				tag => tag === query.toLowerCase()
			),
			"role": (query,media) => media.role.some(
				role => role.toLowerCase().match(query.toLowerCase())
			),
			"title": (query,media) => mediaMatcher["title-romaji"](query,media)
				|| mediaMatcher["title-english"](query,media)
				|| mediaMatcher["title-native"](query,media)
		}
		voiceRolesList.forEach(function(anime){
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],anime)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,anime)
					)
					|| anime.character.name.toLowerCase().match(filterSelect.value.toLowerCase())
					|| anime.character.name.toLowerCase().includes(filterSelect.value.toLowerCase())
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(anime,"anime");
				roleCard.classList.add("view-media-character");
				roleCard.classList.remove("view-media");
				let character = create("div","character",false,false,"grid-area: character;grid-template-columns: auto 60px;grid-template-areas: 'content image'");
				let cover = create("a","cover",false,character);
				cover.href = "/character/" + anime.character.id + "/" + safeURL(anime.character.name);
				cover.style.backgroundImage = "url(" + anime.character.image + ")";
				let content = create("a","content",false,character,"text-align: right;");
				content.href = "/character/" + anime.character.id + "/" + safeURL(anime.character.name);
				let name = create("a","name",anime.character.name,content);
				roleCard.insertBefore(character,roleCard.children[0]);
				hohCharacterRoles.appendChild(roleCard);
				if(anime.myStatus){
					distribution[anime.myStatus.status]++;
					if(anime.myStatus.status === "CURRENT"){
						animeCurrentFlag = true
					}
					sumDuration += animeValueFunction(anime);
					if(anime.myStatus.scoreRaw){
						sumScores += anime.myStatus.scoreRaw;
						amount++;
					}
				}
			}
		});
		removeChildren(hohMediaRolesAnime)
		animeRolesList.forEach(anime => {
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],anime)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,anime)
					)
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(anime,"anime");
				hohMediaRolesAnime.appendChild(roleCard);
				if(anime.myStatus){
					distribution[anime.myStatus.status]++;
					if(anime.myStatus.status === "CURRENT"){
						animeCurrentFlag = true
					}
					sumDuration += animeValueFunction(anime);
					if(anime.myStatus.scoreRaw){
						sumScores += anime.myStatus.scoreRaw;
						amount++;
					}
				}
			}
		});
		removeChildren(hohMediaRolesManga)
		mangaRolesList.forEach(manga => {
			let foundRole = filterSelect.value === "";
			if(!foundRole){
				let specificMatch = filterSelect.value.toLowerCase().match(/^\s*(.*?)\s*:\s*(.*)/);
				if(specificMatch && Object.keys(mediaMatcher).includes(specificMatch[1])){
					foundRole = mediaMatcher[specificMatch[1]](specificMatch[2],manga)
				}
				else{
					foundRole = Object.keys(mediaMatcher).some(
						key => mediaMatcher[key](filterSelect.value,manga)
					)
				}
			}
			if(foundRole){
				let roleCard = createRoleCard(manga,"manga");
				hohMediaRolesManga.appendChild(roleCard);
				if(manga.myStatus){
					distribution[manga.myStatus.status]++;
					if(manga.myStatus.status === "CURRENT"){
						mangaCurrentFlag = true
					}
					const mangaValue = mangaValueFunction(manga);
					sumChapters += mangaValue.chapters;
					sumVolumes += mangaValue.volumes;
					if(manga.myStatus.scoreRaw){
						sumScores += manga.myStatus.scoreRaw;
						amount++
					}
				}
			}
		});
		if(sumDuration || sumChapters || sumVolumes || sumScores){
			removeChildren(digestStats)
			if(sumDuration){
				create("span",false,"Hours Watched: ",digestStats);
				create("span",false,(sumDuration/60).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))")
			};
			if(sumChapters){
				create("span",false," Chapters Read: ",digestStats);
				create("span",false,sumChapters,digestStats,"color:rgb(var(--color-blue))")
			};
			if(sumVolumes){
				create("span",false," Volumes Read: ",digestStats);
				create("span",false,sumVolumes,digestStats,"color:rgb(var(--color-blue))")
			};
			if(amount){
				create("span",false," Mean Score: ",digestStats);
				let averageNode = create("span",false,(sumScores/amount).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))");
				if((sumScores/amount) === 10 && userObject.mediaListOptions.scoreFormat === "POINT_10"){//https://anilist.co/activity/49407649
					averageNode.innerText += "/100"
				}
			};
			let statusList = create("span","#statusList",false,digestStats,"position: absolute;top: -2px;margin-left: 20px;width: 300px;");
			Object.keys(distributionColours).sort().forEach(status => {
				if(distribution[status]){
					let statusSumDot = create("div","hohSumableStatus",distribution[status],statusList,"cursor:pointer;");
					statusSumDot.style.background = distributionColours[status];
					let title = capitalize(status.toLowerCase());
					if(status === "CURRENT" && !animeCurrentFlag){
						title = "Reading"
					}
					else if(status === "CURRENT" && !mangaCurrentFlag){
						title = "Watching"
					}
					statusSumDot.title = distribution[status] + " " + title;
					if(distribution[status] > 99){
						statusSumDot.style.fontSize = "8px"
					}
					if(distribution[status] > 999){
						statusSumDot.style.fontSize = "6px"
					}
				}
			})
		};
	};
	sortSelect.oninput = listRenderer;
	filterSelect.oninput = listRenderer;
	let refreshAutocomplete = function(){
		removeChildren(dataList)
		autocomplete.forEach(
			value => create("option",false,false,dataList).value = value
		)
	};
	let animeHandler = function(data){
		if(data.data.Staff.staffMedia.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.staffMedia.pageInfo.lastPage;i++){
				authAPIcall(
					staffQuery,
					{
						page: i,
						type: "ANIME",
						id: URLstuff[1]
					},
					animeHandler
				)
			}
		};
		data.data.Staff.staffMedia.edges.forEach(edge => {
			let anime = {
				role: [edge.staffRole],
				format: edge.node.format,
				title: titlePicker(edge.node),
				titleRomaji: edge.node.title.romaji,
				titleEnglish: edge.node.title.english,
				titleNative: edge.node.title.native,
				image: edge.node.coverImage.large,
				startDate: edge.node.startDate,
				endDate: edge.node.endDate,
				id: edge.node.id,
				episodes: edge.node.episodes,
				popularity: edge.node.popularity,
				duration: edge.node.duration || 1,
				status: edge.node.status,
				score: edge.node.averageScore,
				genres: edge.node.genres.map(genre => genre.toLowerCase()),
				tags: edge.node.tags.map(tag => tag.name.toLowerCase()),
				myStatus: edge.node.mediaListEntry,
				listJSON: edge.node.mediaListEntry ? parseListJSON(edge.node.mediaListEntry.notes) : null
			};
			if(anime.myStatus && anime.myStatus.status === "REPEATING" && anime.myStatus.repeat === 0){
				anime.myStatus.repeat = 1
			}
			autocomplete.add(anime.title);
			autocomplete.add(edge.staffRole);
			animeRolesList.push(anime)
		});
		animeRolesList = removeGroupedDuplicates(
			animeRolesList,
			e => e.id,
			(oldElement,newElement) => {
				newElement.role = newElement.role.concat(oldElement.role)
			}
		);
		refreshAutocomplete();
		listRenderer();
	};
	let mangaHandler = function(data){
		if(data.data.Staff.staffMedia.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.staffMedia.pageInfo.lastPage;i++){
				authAPIcall(
					staffQuery,
					{
						page: i,
						type: "MANGA",
						id: URLstuff[1]
					},
					mangaHandler
				)
			}
		};
		data.data.Staff.staffMedia.edges.forEach(edge => {
			let manga = {
				role: [edge.staffRole],
				format: edge.node.format,
				title: titlePicker(edge.node),
				titleRomaji: edge.node.title.romaji,
				titleEnglish: edge.node.title.english,
				titleNative: edge.node.title.native,
				image: edge.node.coverImage.large,
				startDate: edge.node.startDate,
				endDate: edge.node.endDate,
				id: edge.node.id,
				chapters: edge.node.chapters,
				volumes: edge.node.volumes,
				popularity: edge.node.popularity,
				status: edge.node.status,
				score: edge.node.averageScore,
				genres: edge.node.genres.map(genre => genre.toLowerCase()),
				tags: edge.node.tags.map(tag => tag.name.toLowerCase()),
				myStatus: edge.node.mediaListEntry,
				listJSON: edge.node.mediaListEntry ? parseListJSON(edge.node.mediaListEntry.notes) : null
			};
			if(manga.myStatus && manga.myStatus.status === "REPEATING" && manga.myStatus.repeat === 0){
				manga.myStatus.repeat = 1
			}
			autocomplete.add(manga.title);
			autocomplete.add(edge.staffRole);
			mangaRolesList.push(manga)
		});
		mangaRolesList = removeGroupedDuplicates(
			mangaRolesList,
			e => e.id,
			(oldElement,newElement) => {
				newElement.role = newElement.role.concat(oldElement.role)
			}
		);
		refreshAutocomplete();
		listRenderer()
	};
	let voiceHandler = function(data){
		if(data.data.Staff.characters.pageInfo.currentPage === 1){
			for(let i=2;i<=data.data.Staff.characters.pageInfo.lastPage;i++){
				authAPIcall(
					staffVoice,
					{
						page: i,
						id: URLstuff[1]
					},
					voiceHandler
				)
			}
		};
		data.data.Staff.characters.edges.forEach(edge => {
			edge.role = capitalize(edge.role.toLowerCase());
			let character = {
				image: edge.node.image.large,
				id: edge.node.id
			}
			if(useScripts.titleLanguage === "NATIVE" && edge.node.name.native){
				character.name = edge.node.name.native
			}
			else{
				character.name = (edge.node.name.first || "") + " " + (edge.node.name.last || "")
			};
			autocomplete.add(edge.role);
			edge.media.forEach(thingy => {
				let anime = {
					role: [edge.role],
					format: thingy.format,
					title: titlePicker(thingy),
					titleRomaji: thingy.title.romaji,
					titleEnglish: thingy.title.english,
					titleNative: thingy.title.native,
					image: thingy.coverImage.large,
					startDate: thingy.startDate,
					endDate: thingy.endDate,
					id: thingy.id,
					episodes: thingy.episodes,
					popularity: thingy.popularity,
					duration: thingy.duration || 1,
					status: thingy.status,
					score: thingy.averageScore,
					myStatus: thingy.mediaListEntry,
					character: character,
					genres: thingy.genres.map(genre => genre.toLowerCase()),
					tags: thingy.tags.map(tag => tag.name.toLowerCase()),
					listJSON: thingy.mediaListEntry ? parseListJSON(thingy.mediaListEntry.notes) : null
				};
				if(anime.myStatus && anime.myStatus.status === "REPEATING" && anime.myStatus.repeat === 0){
					anime.myStatus.repeat = 1;
				}
				autocomplete.add(anime.title);
				voiceRolesList.push(anime)
			})
		});
		refreshAutocomplete();
		listRenderer();
	};
	const staffQuery = `
query($id: Int,$page: Int,$type: MediaType){
	Staff(id: $id){
		staffMedia(
			sort: POPULARITY_DESC,
			type: $type,
			page: $page
		){
			edges{
				staffRole
				node{
					id
					format
					episodes
					chapters
					volumes
					popularity
					duration
					status
					averageScore
					coverImage{large}
					startDate{year month day}
					endDate{year month day}
					title{romaji native english}
					tags{name}
					genres
					mediaListEntry{
						status
						progress
						progressVolumes
						repeat
						notes
						scoreRaw: score(format: POINT_100)
					}
				}
			}
			pageInfo{
				currentPage
				lastPage
			}
		}
	}
}`;
	const staffVoice = `
query($id: Int,$page: Int){
	Staff(id: $id){
		characters(
			sort: ID,
			page: $page
		){
			edges{
				node{
					id
					image{large}
					name{first last native}
				}
				role
				media{
					id
					format
					episodes
					chapters
					volumes
					popularity
					duration
					status
					averageScore
					coverImage{large}
					startDate{year month day}
					endDate{year month day}
					title{romaji native english}
					tags{name}
					genres
					mediaListEntry{
						status
						progress
						progressVolumes
						repeat
						notes
						scoreRaw: score(format: POINT_100)
					}
				}
			}
			pageInfo{
				currentPage
				lastPage
			}
		}
	}
}`;
	let variables = {
		page: 1,
		type: "ANIME",
		id: URLstuff[1]
	};
	authAPIcall(staffQuery,variables,animeHandler);
	variables.type = "MANGA";
	authAPIcall(staffQuery,variables,mangaHandler);
	authAPIcall(staffVoice,variables,voiceHandler);
}

function addCompletedScores(){
	if(!location.pathname.match(/^\/(home|user|activity)\/?([\w\-]+)?\/?$/)){
		return
	}
	setTimeout(addCompletedScores,1000);
	let bigQuery = [];
	let statusCollection = document.querySelectorAll(".status");
	statusCollection.forEach(function(status){
		if(
			(useScripts.completedScore && status.innerText.match(/^completed/i))
			|| (useScripts.droppedScore && status.innerText.match(/^dropped/i))
			|| location.pathname.match(/^\/activity/)
		){
			if(!status.hasOwnProperty("hohScoreMatched")){
				status.hohScoreMatched = true;
				let scoreInfo = create("span",false,false,status);
				const mediaId = /\/(\d+)\//.exec(status.children[0].href);
				if(!mediaId || !mediaId.length){
					return
				};
				scoreInfo.style.display = "none";
				let callback = function(data){
					if(!data){
						return
					};
					data = data.data.MediaList;
					let scoreSuffix = scoreFormatter(
						data.score,
						data.user.mediaListOptions.scoreFormat,
						data.user.name
					);
					let noteContent = parseListJSON(data.notes);
					let noteSuffix = "";
					if(noteContent){
						if(noteContent.hasOwnProperty("message")){
							noteSuffix += " " + noteContent.message
						}
					};
					let rewatchSuffix = "";
					if(data.repeat > 0){
						if(data.media.type === "ANIME"){
							rewatchSuffix = " [rewatch"
						}
						else{
							rewatchSuffix = " [reread"
						}
						if(data.repeat === 1){
							rewatchSuffix += "]"
						}
						else{
							rewatchSuffix += " " + data.repeat + "]"
						}
					};
					if(data.score){
						if(status.innerText.match(/^completed/i)){
							scoreInfo.innerHTML = scoreSuffix;
							create("span",false,noteSuffix,scoreInfo);
							create("span",false,rewatchSuffix,scoreInfo);
						}
						else{
							scoreInfo.innerHTML = scoreSuffix;
							create("span",false,noteSuffix,scoreInfo);
						};
						scoreInfo.style.display = "inline"
					}
				};
				const variables = {
					userName: status.parentNode.children[0].innerText.trim(),
					mediaId: +mediaId[1]
				};
				const query = `
query($userName: String,$mediaId: Int){
	MediaList(
		userName: $userName,
		mediaId: $mediaId
	){
		score
		mediaId
		notes
		repeat
		media{type}
		user{
			name
			mediaListOptions{scoreFormat}
		}
	}
}`;
				//generalAPIcall(query,variables,callback,"hohCompletedScores" + variables.mediaId + variables.userName,60*1000)
				bigQuery.push({
					query: query,
					variables: variables,
					callback: callback,
					cacheKey: "hohCompletedScores" + variables.mediaId + variables.userName,
					duration: 60*1000
				})
			}
		}
		else if(status.children.length === 2 && !status.classList.contains("form")){
			status.children[1].remove()
		}
	});
	queryPacker(bigQuery)
};

function enhanceTags(){//show tag definition in drop down menu when adding tags
	if(!location.pathname.match(/^\/(anime|manga)\/.*/)){
		return
	};
	setTimeout(enhanceTags,400);
	let possibleTagContainers = Array.from(document.querySelectorAll(".el-select-dropdown__list"));
	let bestGuess = possibleTagContainers.find(
		elem => elem.children.length > 205//horrible test, but we have no markup to go from. Assumes the tag dropdown is the only one with more than that number of children
	)
	if(!bestGuess){
		return
	};
	if(bestGuess.hasOwnProperty("hohMarked")){
		return
	}
	else{
		bestGuess.hohMarked = true
	};
	let superBody = document.getElementsByClassName("el-dialog__body")[0];
	let descriptionTarget = create("span","#hohDescription");
	superBody.insertBefore(descriptionTarget,superBody.children[2]);
	Array.from(bestGuess.children).forEach(child => {
		child.onmouseover = function(){
			if(tagDescriptions[child.children[0].innerText]){
				document.getElementById("hohDescription").innerText = tagDescriptions[child.children[0].innerText];
			}
			else{
				document.getElementById("hohDescription").innerText = "Message hoh to get this description added";//should never happen anymore
			}
		};
		child.onmouseout = function(){
			document.getElementById("hohDescription").innerText = ""
		}
	})
};

let prevLength = 0;
let displayMode = "hoh";

function enhanceNotifications(){
	//method: the real notifications are parsed, then hidden and a new list of notifications are created using a mix of parsed data and API calls.
	//alternative method: auth
	setTimeout(function(){
		if(location.pathname === "/notifications" && !(useScripts.accessToken && false)){
			enhanceNotifications()
		}
		else{
			prevLength = 0;
			displayMode = "hoh";
		}
	},300);
	if(displayMode === "native"){
		return
	};
	let possibleButton = document.querySelector(".reset-btn");
	if(possibleButton){
		if(!possibleButton.flag){
			possibleButton.flag = true;
			possibleButton.onclick = function(){
				Array.from(
					document.getElementById("hohNotifications").children
				).forEach(child => {
					child.classList.remove("hohUnread")
				})
			};
			let setting = create("p");
			let checkbox = createCheckbox(setting);
			checkbox.checked = useScripts["hideLikes"];
			checkbox.targetSetting = "hideLikes";
			checkbox.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				forceRebuildFlag = true;
				if(useScripts.accessToken && false){//fixme, that doesn't look right
					enhanceNotifications()
				}
			};
			let description = create("span",false,"Hide like notifications",setting);
			setting.style.fontSize = "small";
			if(useScripts.settingsTip){
				create("p",false,
`You can turn parts of the script on and off:
settings > apps.

You can also turn off this notice there.`,setting);
			};
			let regularNotifications = create("span",false,svgAssets.envelope + " Show default notifications");
			regularNotifications.style.cursor = "pointer";
			regularNotifications.style.fontSize = "small";
			regularNotifications.onclick = function(){
				if(displayMode === "hoh"){
					displayMode = "native";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "none";
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "grid"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show hoh notifications";
					setting.style.display = "none";
				}
				else{
					displayMode = "hoh";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "block"
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "none"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show default notifications";
					setting.style.display = ""
				};
			};
			possibleButton.parentNode.appendChild(regularNotifications);
			possibleButton.parentNode.appendChild(setting);
		};
	};
	let commentCallback = function(data){
		let listOfComments = Array.from(document.getElementsByClassName("b" + data.data.Activity.id));
		listOfComments.forEach(function(comment){
			removeChildren(comment.children[1])
			comment.children[0].style.display = "block";
			data.data.Activity.replies.slice(
				(data.data.Activity.replies.length <= 50 ? 0 : data.data.Activity.replies.length - 30),
				data.data.Activity.replies.length
			).forEach(function(reply){
				let quickCom = create("div","hohQuickCom",false,comment.children[1]);
				let quickComName = create("span","hohQuickComName",reply.user.name,quickCom);
				if(reply.user.name === whoAmI){
					quickComName.classList.add("hohThisIsMe")
				};
				let quickComContent = create("span","hohQuickComContent",false,quickCom);
				quickComContent.innerHTML = reply.text.replace(/src='http:/g,"src='https:");//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				let quickComLikes = create("span","hohQuickComLikes","♥",quickCom);
				if(reply.likes.length > 0){
					quickComLikes.innerText = reply.likes.length + "♥";
					quickComLikes.title = reply.likes.map(a => a.name).join("\n")
				}
				reply.likes.forEach(like => {
					if(like.name === whoAmI){
						quickComLikes.classList.add("hohILikeThis")
					}
				});
				if(useScripts.accessToken){
					quickComLikes.style.cursor = "pointer";
					quickComLikes.onclick = function(){
						authAPIcall(
							"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
							{id: reply.id},
							function(data){
								if(!data){
									authAPIcall(//try again once if it fails
										"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
										{id: reply.id},
										data => {}
									)
								}
							}
						);
						if(reply.likes.some(like => like.name === whoAmI)){
							reply.likes.splice(reply.likes.findIndex(user => user.name === whoAmI),1);
							quickComLikes.classList.remove("hohILikeThis");
							if(reply.likes.length > 0){
								quickComLikes.innerText = reply.likes.length + "♥"
							}
							else{
								quickComLikes.innerText = "♥"
							}
						}
						else{
							reply.likes.push({name: whoAmI});
							quickComLikes.classList.add("hohILikeThis");
							quickComLikes.innerText = reply.likes.length + "♥";
						};
						quickComLikes.title = reply.likes.map(a => a.name).join("\n");
					};
				}
			});
			let loading = create("div",false,false,comment.children[1]);
			let statusInput = create("div",false,false,comment.children[1]);
			let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);");
			let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
			let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
			inputArea.placeholder = "Write a reply...";
			inputArea.onfocus = function(){
				cancelButton.style.display = "inline";
				publishButton.style.display = "inline"
			};
			cancelButton.onclick = function(){
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
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
					{text: inputArea.value,activityId: data.data.Activity.id},
					function(retur){
						loading.innerText = "";
						data.data.Activity.replies.push({
							text: retur.data.SaveActivityReply.text,
							user: retur.data.SaveActivityReply.user,
							likes: retur.data.SaveActivityReply.likes,
							id: retur.data.SaveActivityReply.id
						});
						let saltedHam = JSON.stringify({
							data: data,
							time: NOW(),
							duration: 24*60*60*1000
						});
						localStorage.setItem("hohListActivityCall" + data.data.Activity.id,saltedHam);
						commentCallback(data);
					}
				);
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
			}
		})
	};
	let notificationDrawer = function(activities){
		let newContainer = document.getElementById("hohNotifications")
		if(newContainer){
			newContainer.remove()
		};
		newContainer = create("div","#hohNotifications");
		let notificationsContainer = document.querySelector(".notifications");
		if(!notificationsContainer){
			return
		}
		notificationsContainer.insertBefore(newContainer,notificationsContainer.firstChild);
		for(var i=0;i<activities.length;i++){
			if(useScripts.hideLikes && (activities[i].type === "likeReply" || activities[i].type === "like")){
				continue
			};
			let newNotification = create("div");
			newNotification.onclick = function(){
				this.classList.remove("hohUnread");
				let notiCount = document.getElementsByClassName("notification-dot");
				if(notiCount.length){
					const actualCount = parseInt(notiCount[0].textContent);
					if(actualCount < 2){
						if(possibleButton){
							possibleButton.click();
						};
					}
					else{
						notiCount[0].innerText = (actualCount - 1);
					};
				};
			};
			if(activities[i].unread){
				newNotification.classList.add("hohUnread")
			};
			newNotification.classList.add("hohNotification");
			let notImage = create("a","hohUserImage"); //container for profile images
			notImage.href = activities[i].href;
			notImage.style.backgroundImage = activities[i].image;
			let notNotImageContainer = create("span","hohMediaImageContainer"); //container for series images
			let text = create("a","hohMessageText");
			let textName = create("span");
			let textSpan = create("span");
			textName.style.color = "rgb(var(--color-blue))";
			let counter = 1;
			if(activities[i].type === "like"){
				for(
					counter = 0;
					i + counter < activities.length
					&& activities[i + counter].type === "like"
					&& activities[i + counter].href === activities[i].href;
					counter++
				){//one person likes several of your media activities
					let notNotImage = create("a",false,false,notNotImageContainer);
					create("img",["hohMediaImage",activities[i + counter].link],false,notNotImage);
					notNotImage.href = activities[i + counter].directLink;
				};
				text.href = activities[i].directLink;
				textSpan.innerText = activities[i].textSpan;
				if(counter > 1){
					textSpan.innerText = " liked your activities."
				};
				if(counter === 1){
					while(
						i + counter < activities.length
						&& activities[i + counter].type === "like"
						&& activities[i + counter].link === activities[i].link
					){//several people likes one of your activities
						let miniImageWidth = 40;
						let miniImage = create("a","hohUserImageSmall",false,newNotification);
						miniImage.href = activities[i + counter].href;
						miniImage.title = activities[i + counter].textName;
						miniImage.style.backgroundImage = activities[i + counter].image;
						miniImage.style.height = miniImageWidth + "px";
						miniImage.style.width = miniImageWidth + "px";
						miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
						if(counter >= 8){
							miniImage.style.height = miniImageWidth/2 + "px";
							miniImage.style.width = miniImageWidth/2 + "px";
							miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
							if(counter % 2 === 1){
								miniImage.style.top = miniImageWidth/2 + "px";
							}
						};
						counter++;
					}
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter - 1);
					};
				}
				else{
					newNotification.classList.add("hohCombined")
				};
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "reply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "reply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					};
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "replyReply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "replyReply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter-1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					}
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " replied to activity you're subscribed to.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "likeReply"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "likeReply"
					&& activities[i + counter].link === activities[i].link
				){//several people likes one of your activity replies
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.title = activities[i + counter].textName;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px";
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					}
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					};
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					};
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " liked your activity reply.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "message"
				|| activities[i].type === "mention"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "airing"){
				textSpan.innerHTML = activities[i].text;//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "follow"){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(
				activities[i].type === "forumCommentLike"
				|| activities[i].type === "forumSubscribedComment"
				|| activities[i].type === "forumCommentReply"
				|| activities[i].type === "forumLike"
				|| activities[i].type === "forumMention"
			){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				let textSpan2 = create("span",false,activities[i].text,text,"color:rgb(var(--color-blue));");
				text.style.maxWidth = "none";
				text.style.marginTop = "17px";
			}
			else{//display as-is
				textSpan.classList.add("hohUnhandledSpecial");
				textSpan.innerHTML = activities[i].text;//The Anilist API's parsed markdown. Any XSS vulnerability would also apply to Anilist native
				text.appendChild(textSpan);
			};
			let time = create("div","hohTime");
			time.innerHTML = activities[i - counter + 1].time;//does not depend on user input
			newNotification.appendChild(notImage);
			newNotification.appendChild(text);
			newNotification.appendChild(notNotImageContainer);
			newNotification.appendChild(time);
			if(i < 25){
				let commentsContainer = create("div",["hohCommentsContainer","b" + activities[i].link]);
				let comments = create("a",["hohComments","link"],"comments",commentsContainer);
				create("span","hohMonospace","+",comments);
				comments.onclick = function(){
					if(this.children[0].innerText === "+"){
						this.children[0].innerText = "-";
						this.parentNode.children[1].style.display = "inline-block";
						let variables = {
							id: +this.parentNode.classList[1].substring(1)
						};
						generalAPIcall(queryActivity,variables,commentCallback,"hohListActivityCall" + variables.id,24*60*60*1000,true,true);
					}
					else{
						this.children[0].innerText = "+";
						this.parentNode.children[1].style.display = "none";
					};
				};
				let commentsArea = create("div","hohCommentsArea",false,commentsContainer);
				newNotification.appendChild(commentsContainer);
			}
			newContainer.appendChild(newNotification);
		};
	};
	let activities = [];
	let notifications = document.getElementsByClassName("notification");//collect the "real" notifications
	if(notifications.length === prevLength && forceRebuildFlag === false){
		return;
	}
	else{
		prevLength = notifications.length;
		forceRebuildFlag = false;
	};
	const activityTypes = {
		" liked your activity." :                           "like",
		" replied to your activity." :                      "reply",
		" sent you a message." :                            "message",
		" liked your activity reply." :                     "likeReply",
		" mentioned you in their activity." :               "mention",
		" replied to activity you're subscribed to." :      "replyReply",
		" liked your comment, in the forum thread " :       "forumCommentLike",
		" commented in your subscribed forum thread " :     "forumSubscribedComment",
		" replied to your comment, in the forum thread " :  "forumCommentReply",
		" liked your forum thread, " :                      "forumLike",
		" mentioned you, in the forum thread " :            "forumMention"
	};
	Array.from(notifications).forEach(function(notification){//parse real notifications
		notification.already = true;
		notification.style.display = "none";
		let active = {
			type: "special",
			unread: false,
			link: "aaa",//fixme. Edit 2019: I have no idea
			image: notification.children[0].style.backgroundImage,
			href: notification.children[0].href
		};
		if(
			notification.classList.length > 1
			&& notification.classList[1] != "hasMedia"
		){//"notification unread" classlist
			active.unread = true
		}
		if(//check if we can query that
			notification.children.length >= 2
			&& notification.children[1].children.length
			&& notification.children[1].children[0].children.length
			&& notification.children[1].children[0].children[0].children.length
		){
			const info = notification.children[1].children[0].children[0];
			active.directLink = info.href
			active.text =       info.innerHTML;//does not depend on user input
			active.textName =   (info.childNodes[0] || {textContent: ""}).textContent.trim();
			active.textSpan =   (info.childNodes[1] || {textContent: ""}).textContent;
			let linkMatch =     info.href.match(/activity\/(\d+)/);
			if(linkMatch){
				active.link = linkMatch[1];
			};
			var testType = info.children[0].textContent;
			active.type = activityTypes[testType];
			if(!active.type){
				active.type = "special"; //by default every activity is some weird thing we are displaying as-is
			}
			else if(
				active.type === "forumCommentLike"
				|| active.type === "forumSubscribedComment"
				|| active.type === "forumCommentReply"
				|| active.type === "forumLike"
				|| active.type === "forumMention"
			){
				active.text = (info.children[1] || {textContent: ""}).textContent
			}
		};
		if(active.type === "special"){
			active.text = notification.children[1].innerHTML;//does not depend on user input
			if(notification.children[1].children.length){
				const info = notification.children[1].children[0];
				if(
					info.children.length >= 2
					&& (info.children[1] || {textContent: ""}).textContent === " started following you."
				){
					active.type = "follow";
					active.directLink = info.children[0].href;
					active.text =       info.children[0].innerHTML;//does not depend on user input
					active.textName =   (info.children[0] || {textContent: ""}).textContent.trim();
					active.textSpan =   (info.children[1] || {textContent: ""}).textContent;
				}
				else if(
					info.children.length >= 4
					&& (info.children[3] || {textContent: ""}).textContent === " aired."
				){
					active.type = "airing";
					active.directLink = info.children[0].href;
					active.text = info.innerHTML;//does not depend on user input
				};
			};
		};
		if(
			notification.children.length > 1
			&& notification.children[1].children.length > 1
		){
			active.time = notification.children[1].children[1].innerHTML//does not depend on user input
		}
		else{
			active.time = create("span")
		};
		activities.push(active);
	});
	notificationDrawer(activities);
	for(var i=0;APIcallsUsed < (APIlimit - 5);i++){//heavy
		if(!activities.length || i >= activities.length){//loading is difficult to predict. There may be nothing there when this runs
			break
		};
		let imageCallBack = function(data){
			if(!data){
				return
			}
			pending[data.data.Activity.id + ""] = false;
			let type = data.data.Activity.type;
			if(type === "ANIME_LIST" || type === "MANGA_LIST"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundColor = data.data.Activity.media.coverImage.color || "rgb(var(--color-foreground))";
					stuff.style.backgroundImage = "url(" + data.data.Activity.media.coverImage.large + ")";
					stuff.classList.add("hohBackgroundCover");
					if(data.data.Activity.media.title){
						stuff.parentNode.title = data.data.Activity.media.title.romaji
					}
				})
			}
			else if(type === "TEXT"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundImage = "url(" + data.data.Activity.user.avatar.large + ")";
					stuff.classList.add("hohBackgroundUserCover");
				})
			};
			if(data.data.Activity.replies.length){
				commentCallback(data)
			}
		};
		let vars = {
			find: i
		};
		if(activities[i].link[0] != "a"){//activities with post link
			let variables = {
				id: +activities[i].link
			};
			if(!pending[activities[i].link]){
				pending[activities[i].link] = true;
				generalAPIcall(queryActivity,variables,imageCallBack,"hohListActivityCall" + variables.id,24*60*60*1000,true);
			}
		}
	}
};//end enhanceNotifications

function enhanceCharacterBrowse(){
	if(!document.URL.match(/\/search\/characters\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
	let favCallback = function(data,page){
		let resultsToTag = document.querySelectorAll("div.results.characters .character");
		if(resultsToTag.length < page*data.data.Page.characters.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/characters/)){
					return;
				};
				favCallback(data,page);
			},200);//may take some time to load
			return;
		};
		data = data.data.Page.characters;
		data.forEach((character,index) => create(
			"span",
			"hohFavCountBrowse",
			character.favourites,
			resultsToTag[(page - 1)*data.length + index].children[0]
		));
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1));
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1));
};

function enhanceStaffBrowse(){
	if(!document.URL.match(/\/search\/staff\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
		staff(sort: [FAVOURITES_DESC]){
			id
			favourites
			anime:staffMedia(type:ANIME){
				pageInfo{
					total
				}
			}
			manga:staffMedia(type:MANGA){
				pageInfo{
					total
				}
			}
			characters{
				pageInfo{
					total
				}
			}
		}
	}
}`;
	let favCallback = function(data,page){
		let resultsToTag = document.querySelectorAll("div.results.staff .staff");
		if(resultsToTag.length < page*data.data.Page.staff.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/staff/)){
					return
				};
				favCallback(data,page);
			},200);//may take some time to load
			return
		};
		data = data.data.Page.staff;
		data.forEach(function(staff,index){
			create("span","hohFavCountBrowse",staff.favourites,resultsToTag[(page - 1)*data.length + index].children[0]);
			if(staff.anime.pageInfo.total + staff.manga.pageInfo.total > staff.characters.pageInfo.total){
				resultsToTag[(page - 1)*data.length + index].children[0].children[0].style.backgroundImage =
				"linear-gradient(to right,rgba(var(--color-overlay),0.8),hsla(" + Math.round(
					120*(1 + staff.anime.pageInfo.total/(staff.anime.pageInfo.total + staff.manga.pageInfo.total))
				) + ",100%,50%,0.8),rgba(var(--color-overlay),0.8))"
			}
		});
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1))
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1))
};

function addProgressBar(){
	if(location.pathname != "/home"){
		return
	};
	let mediaCards = document.querySelectorAll(".media-preview-card .content .info:not(.hasMeter) > div");
	if(!mediaCards.length){
		setTimeout(function(){
			addProgressBar()
		},200);//may take some time to load
		return
	};
	mediaCards.forEach(card => {
		const progressInformation = card.innerText.match(/Progress:\ (\d+)\/(\d+)/);
		if(progressInformation){
			let pBar = create("meter");
			pBar.value = progressInformation[1];
			pBar.min = 0;
			pBar.max = progressInformation[2];
			card.parentNode.insertBefore(pBar,card);
			card.parentNode.parentNode.parentNode.querySelector(".plus-progress").onclick = function(){
				pBar.value++;
				setTimeout(function(){
					pBar.value = card.innerText.match(/Progress:\ (\d+)\/(\d+)/)[1]
				},1000)
			}
		}
	});
	document.querySelector(".size-toggle").onclick = function(){
		setTimeout(function(){
			addProgressBar()
		},200);
	}
}

function enhanceCharacter(){//adds a favourite count on every character page
	if(!location.pathname.match(/^\/character(\/.*)?/)){
		return
	};
	if(document.getElementById("hohFavCount")){
		return
	};
	let oldData = false;
	let favCallback = function(data){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/character\/.*/)){
				return
			}
			let favCount = document.querySelector(".favourite .count");
			if(favCount){
				favCount.parentNode.onclick = function(){
					if(favCount.parentNode.classList.contains("isFavourite")){
						favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
					}
					else{
						favCount.innerText = parseInt(favCount.innerText) + 1
					}
				};
				if(data.data.Character.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
					favCount.innerText = data.data.Character.favourites + 1
				}
				else{
					favCount.innerText = data.data.Character.favourites
				}
			}
			else{
				setTimeout(adder,200);
			}
		};
		if(data.data.Character.favourites){
			adder()
		};
		let languages = new Set(
			data.data.Character.media.edges.map(
				edge => edge.voiceActors.map(actor => actor.language)
			).flat()
		);
		let rolesBuilder = function(){
			if(data.data.Character.media.pageInfo.lastPage > 1){
				if(data.data.Character.media.pageInfo.currentPage === 1){
					oldData = data;
					for(let i = 2;i<=data.data.Character.media.pageInfo.lastPage;i++){
						generalAPIcall(
							`query($id: Int!,$page: Int){
								Character(id: $id){
									media(page:$page,sort:POPULARITY_DESC){
										pageInfo{currentPage lastPage}
										edges{
											characterRole
											voiceActors{
												siteUrl
												name{full native}
												language
												image{large}
											}
											node{
												id
												siteUrl
												popularity
												title{romaji english native}
												coverImage{large}
											}
										}
									}
								}
							}`,
							{
								id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1]),
								page: i
							},
							favCallback,
							"hohCharacterFavs" + variables.id + "page" + i,
							60*60*1000
						);
					}
				}
				else if(data.data.Character.media.pageInfo.currentPage){
					data.data.Character.media.edges = data.data.Character.media.edges.concat(oldData.data.Character.media.edges);
					oldData = data;
				}
			}
			if(languages.size < 2){
				if(!data.data.Character.media.edges.some(
					edge => edge.voiceActors.length > 1
				) && !data.data.Character.media.isSplit){
					return//no need to replace the page.
				}
			}
			let location = document.querySelector(".container.grid-wrap");
			if(!location || !location.childElementCount){
				setTimeout(rolesBuilder,200);
				return;
			};
			location.classList.add("hohCharacter");
			if(document.querySelector(".scroller")){
				document.querySelector(".scroller").remove()
			}
			removeChildren(location)
			let badLocation = location.cloneNode(true);
			location.parentNode.replaceChild(
				badLocation,
				location
			);
			location = badLocation;
			if(document.querySelector(".hohInputContainer")){
				document.querySelector(".hohInputContainer").remove()
			};
			let inputContainer = create("div","hohInputContainer",false,location.previousElementSibling,"position:relative;");
			let selector = create("select",false,false,inputContainer,"position:absolute;right:0px;bottom:5px;");
			if(languages.size < 2){
				selector.style.display = "none";
			}
			Array.from(languages).sort(
				(a,b) => {
					if(a === "JAPANESE"){
						return -1
					}
					if(b === "JAPANESE"){
						return 1
					}
					if(a === "KOREAN"){
						return 1
					}
					if(b === "KOREAN"){
						return -1
					}
					return a.localeCompare(b);
				}
			).forEach(language => {
				create("option",false,capitalize(language.toLowerCase()),selector)
					.value = language
			});
			let listBuilder = function(){
				removeChildren(location)
				if(data.data.Character.media.edges.length === 1){//spread multiple voice actors when we have the space
					data.data.Character.media.edges = data.data.Character.media.edges[0].voiceActors.filter(
						actor => actor.language === selector.value
					).map(
						actor => {
							return {
								node: data.data.Character.media.edges[0].node,
								characterRole: data.data.Character.media.edges[0].characterRole,
								voiceActors: [actor]
							}
						}
					);
					data.data.Character.media.isSplit = true;
				}
				data.data.Character.media.edges.sort(
					(b,a) => {
						const roleValue = {
							"MAIN": 3,
							"SUPPORTING": 2,
							"BACKGROUND": 1
						};
						return roleValue[a.characterRole] - roleValue[b.characterRole] || a.node.popularity - b.node.popularity
					}
				).forEach(edge => {
					let card = create("div",["role-card","view-media-staff"],false,location,"position:relative");
					let staff = edge.voiceActors.filter(actor => actor.language === selector.value);
					if(staff.length){
						let staffSide = create("div","staff",false,card);
						let staffCover = create("a","cover",false,staffSide);
						staffCover.href = staff[0].siteUrl.replace("https://anilist.co","");;
						staffCover.style.backgroundImage = "url(\"" + staff[0].image.large + "\")";
						let staffContent = create("a","content",false,staffSide);
						staffContent.href = staff[0].siteUrl.replace("https://anilist.co","");;
						let staffName = staff[0].name.full
						if(useScripts.titleLanguage === "NATIVE" && staff[0].name.native){
							staffName = staff[0].name.native
						}
						create("div","name",staffName,staffContent);
						create("div","role",capitalize(staff[0].language.toLowerCase()),staffContent);
						if(staff.length === 2){
							staffSide.style.marginRight = "65px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");;
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
						}
						else if(staff.length > 2){
							staffSide.style.marginRight = "130px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:65px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");;
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
							let thirdCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							thirdCover.href = staff[2].siteUrl.replace("https://anilist.co","");;
							let thirdName = staff[2].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[2].name.native){
								thirdName = staff[2].name.native
							}
							thirdCover.title = thirdName;
							thirdCover.style.backgroundImage = "url(\"" + staff[2].image.large + "\")";
						}
					};
					let mediaSide = create("div","media",false,card);
					let mediaCover = create("a","cover",false,mediaSide);
					mediaCover.href = edge.node.siteUrl.replace("https://anilist.co","");;
					mediaCover.style.backgroundImage = "url(\"" + edge.node.coverImage.large + "\")";
					let mediaContent = create("a","content",false,mediaSide);
					mediaContent.href = edge.node.siteUrl.replace("https://anilist.co","");
					let title = edge.node.title.romaji;
					if(useScripts.titleLanguage === "NATIVE" && edge.node.title.native){
						title = edge.node.title.native
					}
					else if(useScripts.titleLanguage === "ENGLISH" && edge.node.title.english){
						title= edge.node.title.english
					};
					if(aliases.has(edge.node.id)){
						title = aliases.get(edge.node.id)
					}
					create("div","name",title,mediaContent);
					create("div","role",capitalize(edge.characterRole.toLowerCase()),mediaContent);
				})
			};listBuilder();
			selector.onchange = listBuilder;
		};rolesBuilder();
	};
	const variables = {id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1])};
	generalAPIcall(
		`query($id: Int!){
			Character(id: $id){
				favourites
				media(page:1,sort:POPULARITY_DESC){
					pageInfo{currentPage lastPage}
					edges{
						characterRole
						voiceActors{
							siteUrl
							name{full native}
							language
							image{large}
						}
						node{
							id
							siteUrl
							popularity
							title{romaji english native}
							coverImage{large}
						}
					}
				}
			}
		}`,
		variables,
		favCallback,
		"hohCharacterFavs" + variables.id + "page1",
		60*60*1000
	);
};

function enhanceStudio(){//adds a favourite count to every studio page
	if(!location.pathname.match(/^\/studio(\/.*)?/)){
		return
	};
	let filterGroup = document.querySelector(".container.header");
	if(!filterGroup){
		setTimeout(enhanceStudio,200);//may take some time to load
		return;
	};
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/studio\/.*/)){
			return
		}
		let favCount = document.querySelector(".favourite .count");
		if(favCount){
			favCount.parentNode.onclick = function(){
				if(favCount.parentNode.classList.contains("isFavourite")){
					favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
				}
				else{
					favCount.innerText = parseInt(favCount.innerText) + 1
				}
			};
			if(data.data.Studio.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Studio.favourites + 1
			}
			else{
				favCount.innerText = data.data.Studio.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200);
		}
		let scoreSum = 0;
		let amount = 0;
		data.data.Studio.media.nodes.forEach(media => {
			if(media.meanScore){
				scoreSum += media.meanScore;
				amount++
			}
		});
		if(amount){
			let scoreAverage = create("span","#hohFavCount",
				(scoreSum/amount).roundPlaces(1) + "%",
				filterGroup,"top:45px;color:rgb(var(--color-blue));z-index:45;font-size:1.2rem;"
			)
		}
	};
	const variables = {id: location.pathname.match(/\/studio\/(\d+)\/?/)[1]};
	generalAPIcall(
		`
query($id: Int!){
	Studio(id: $id){
		favourites
		media(isMain:true,sort:POPULARITY_DESC){
			nodes{
				meanScore
			}
		}
	}
}`,
		variables,favCallback,"hohStudioFavs" + variables.id,60*60*1000
	);
};

function returnList(list,skipProcessing){
	if(!list){
		return null
	};
	let retl = [];
	list.data.MediaListCollection.lists.forEach(mediaList => {
		mediaList.entries.forEach(entry => {
			if(!skipProcessing){
				entry.isCustomList = mediaList.isCustomList;
				if(entry.isCustomList){
					entry.listLocations = [mediaList.name]
				}
				else{
					entry.listLocations = []
				};
				entry.scoreRaw = Math.min(entry.scoreRaw,100);
				if(!entry.media.episodes && entry.media.nextAiringEpisode){
					entry.media.episodes = entry.media.nextAiringEpisode.episode - 1
				}
				if(entry.notes){
					entry.listJSON = parseListJSON(entry.notes)
				};
				if(entry.media.a){
					entry.media.staff = removeGroupedDuplicates(
						entry.media.a.nodes.concat(
							entry.media.b.nodes
						),
						e => e.id
					);
					delete entry.media.a;
					delete entry.media.b;
				}
				if(entry.repeat > 10000){//counting eps as repeat, 10x One Piece as the plausibility baseline
					entry.repeat = 0
				}
				if(entry.status === "REPEATING" && entry.repeat === 0){
					entry.repeat = 1
				}
			};
			retl.push(entry);
		})
	})
	return removeGroupedDuplicates(
		retl,
		e => e.mediaId,
		(oldElement,newElement) => {
			if(!skipProcessing){
				newElement.listLocations = newElement.listLocations.concat(oldElement.listLocations);
				newElement.isCustomList = oldElement.isCustomList || newElement.isCustomList;
			}
		}
	)
};

function parseListJSON(listNote){
	if(!listNote){
		return null
	};
	let commandMatches = listNote.match(/\$({.*})\$/);
	if(commandMatches){
		try{
			let noteContent = JSON.parse(commandMatches[1]);
			noteContent.adjustValue = noteContent.adjust ? noteContent.adjust : 0;
			let rangeParser = function(thing){
				if(typeof thing === "number"){
					return 1
				}
				else if(typeof thing === "string"){
					thing = thing.split(",")
				};
				return thing.reduce(function(acc,item){
					if(typeof item === "number"){
						return acc + 1
					};
					let multiplierPresent = item.split("x");
					let value = 1;
					let rangePresent = multiplierPresent[0].split("-");
					if(rangePresent.length === 2){//range
						let minRange = parseFloat(rangePresent[0]);
						let maxRange = parseFloat(rangePresent[1]);
						if(minRange && maxRange){
							value = maxRange - minRange + 1
						}
					}
					if(multiplierPresent.length === 1){//no multiplier
						return acc + value
					}
					if(multiplierPresent.length === 2){//possible multiplier
						let multiplier = parseFloat(multiplierPresent[1]);
						if(multiplier || multiplier === 0){
							return acc + value*multiplier
						}
						else{
							return acc + 1
						}
					}
					else{//unparsable
						return acc + 1
					}
				},0);
			};
			if(noteContent.more){
				noteContent.adjustValue += rangeParser(noteContent.more)
			};
			if(noteContent.skip){
				noteContent.adjustValue -= rangeParser(noteContent.skip)
			};
			return noteContent;
		}
		catch(e){
			console.warn("Unable to parse JSON in list note",commandMatches)
		}
	}
	else{
		return null
	}
};

function formatCompat(compatData,targetLocation){
	let differenceSpan = create("span",false,compatData.difference.roundPlaces(3));
	if(compatData.difference < 0.9){
		differenceSpan.style.color = "green"
	}
	else if(compatData.difference > 1.1){
		differenceSpan.style.color = "red"
	};
	targetLocation.innerText = "";
	targetLocation.appendChild(differenceSpan);
	let countSpan = create("span",false," based on " + compatData.shared + " shared entries. Lower is better. 0.8 - 1.1 is common",targetLocation);
	let canvas = create("canvas",false,false,targetLocation,"display:block;");
	canvas.width = 200;
	canvas.height = 100;
	let r1 = Math.sqrt(compatData.list1/(compatData.list1 + compatData.list2));
	let r2 = Math.sqrt(compatData.list2/(compatData.list1 + compatData.list2));
	let distance;
	if(compatData.shared === compatData.list1 || compatData.shared === compatData.list2){
		distance = Math.abs(r1 - r2)
	}
	else if(compatData.shared === 0){
		distance = r1 + r2
	}
	else{
		let areaOfIntersection = function(d,r0,r1){
			let rr0 = r0 * r0;
			let rr1 = r1 * r1;
			let phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
			let theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
			let area1 = (theta * rr1 - rr1 * Math.sin(theta))/2;
			let area2 = (phi * rr0 - rr0 * Math.sin(phi))/2;
			return area1 + area2;
		};
		let overlapArea = Math.PI*compatData.shared/(compatData.list1 + compatData.list2);
		let pivot0 = Math.abs(r1 - r2);
		let pivot1 = r1 + r2;
		while(pivot1 - pivot0 > (r1 + r2)/100){
			distance = (pivot0 + pivot1)/2;
			if(areaOfIntersection(distance,r1,r2) > overlapArea){
				pivot0 = distance
			}
			else{
				pivot1 = distance
			}
		}
	}
	let ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(250,122,122)";
	ctx.arc(50 + 50*distance,50,50*r2,0,2*Math.PI);
	ctx.fill();
	ctx.beginPath();
	ctx.fillStyle = "rgb(61,180,242,0.5)";
	ctx.arc(50,50,50*r1,0,2*Math.PI);
	ctx.fill();
}

function compatCheck(list,name,type,callback){
	const variables = {
		name: name,
		listType: type
	};
	generalAPIcall(queryMediaListCompat,variables,function(data){
		list.sort((a,b) => a.mediaId - b.mediaId);
		let list2 = returnList(data).filter(element => element.scoreRaw);
		let list3 = [];
		let indeks1 = 0;
		let indeks2 = 0;
		while(indeks1 < list.length && indeks2 < list2.length){
			if(list2[indeks2].mediaId > list[indeks1].mediaId){
				indeks1++;
				continue
			};
			if(list2[indeks2].mediaId < list[indeks1].mediaId){
				indeks2++;
				continue
			};
			if(list2[indeks2].mediaId === list[indeks1].mediaId){
				list3.push({
					mediaId: list[indeks1].mediaId,
					score1: list[indeks1].scoreRaw,
					score2: list2[indeks2].scoreRaw
				});
				indeks1++;
				indeks2++
			}
		};
		let average1 = 0;
		let average2 = 0;
		list3.forEach(item => {
			average1 += item.score1;
			average2 += item.score2;
			item.sdiff = item.score1 - item.score2
		});
		average1 = average1/list3.length;
		average2 = average2/list3.length;
		let standev1 = 0;
		let standev2 = 0;
		list3.forEach(item => {
			standev1 += Math.pow(item.score1 - average1,2);
			standev2 += Math.pow(item.score2 - average2,2)
		});
		standev1 = Math.sqrt(standev1/(list3.length - 1));
		standev2 = Math.sqrt(standev2/(list3.length - 1));
		let difference = 0;
		list3.forEach(item => {
			difference += Math.abs(
				(item.score1 - average1)/standev1
				- (item.score2 - average2)/standev2
			)
		});
		difference = difference/list3.length;
		callback({
			difference: difference,
			shared: list3.length,
			list1: list.length,
			list2: list2.length,
			user: name
		})
	})
}

//used by the stats module, and to safeguard the manga chapter guesses
const commonUnfinishedManga = {
	"53390":{//aot
		chapters:116,
		volumes:26
	},
	"30002":{//berserk
		chapters:359,
		volumes:40
	},
	"30013":{//one piece
		chapters:960,
		volumes:92
	},
	"85486":{//mha
		chapters:202,
		volumes:20
	},
	"74347":{//opm
		chapters:119,
		volumes:17
	},
	"30026":{//HxH
		chapters:390,
		volumes:36
	},
	"30656":{//vagabond
		chapters:327,
		volumes:37
	},
	"30105":{//yotsuba&
		chapters:106,
		volumes:14
	}
};
if(NOW() - new Date(2019,10,1) > 365*24*60*60*1000){
	console.log("remind hoh to update the commonUnfinishedManga list")
};

function settingsPage(){
	if(location.pathname !== "/settings/apps"){
		return
	};
	if(document.getElementById("hohSettings")){
		return
	};
	let targetLocation = document.querySelector(".settings.container .content");
	let hohSettings = create("div","#hohSettings",false,targetLocation);
	hohSettings.classList.add("all");
	let scriptStatsHead = create("h1",false,"Automail Settings",hohSettings);
	let scriptStats = create("div",false,false,hohSettings);
	let sVersion = create("p",false,false,scriptStats);
	create("span",false,"Version: ",sVersion);
	create("span","hohStatValue",scriptInfo.version,sVersion);
	let sHome = create("p",false,"Homepage: ",scriptStats);
	let sHomeLink = create("a",false,scriptInfo.link,sHome);
	let sHome2 = create("p",false,"Repository: ",scriptStats);
	let sHomeLink2 = create("a",false,scriptInfo.repo,sHome2);
	if(!useScripts.accessToken){
		create("p",false,"Faded options only have limited functionallity without signing in to the script",scriptStats)
	}
	sHomeLink.href = scriptInfo.link;
	sHomeLink2.href = scriptInfo.repo;
	let categories = create("div",["container","hohCategories"],false,scriptStats);
	let catList = ["Notifications","Feeds","Forum","Lists","Profiles","Stats","Media","Navigation","Browse","Script","Login"];
	let activeCategory = "";
	catList.forEach(function(category){
		let catBox = create("div","hohCategory",category,categories);
		catBox.onclick = function(){
			hohSettings.className = "";
			if(activeCategory === category){
				catBox.classList.remove("active");
				activeCategory = "";
				hohSettings.classList.add("all");
			}
			else{
				if(activeCategory !== ""){
					categories.querySelector(".hohCategory.active").classList.remove("active")
				};
				catBox.classList.add("active");
				hohSettings.classList.add(category);
				activeCategory = category
			}
		}
	});
	let scriptSettings = create("div",false,false,hohSettings);
	if(!useScripts.accessToken){
		scriptSettings.classList.add("noLogin")
	}
	useScriptsDefinitions.forEach(function(def){
		let setting = create("p","hohSetting");
		if(def.visible === false){
			setting.style.display = "none"
		};
		if(def.hasOwnProperty("type")){//other kinds of input
			let input;
			if(def.type === "select"){
				input = create("select",false,false,setting);
				def.values.forEach(
					value => create("option",false,value,input)
						.value = value
				)
			}
			else if(def.type === "text"){
				input = create("input",false,false,setting)
			}
			else if(def.type === "number"){
				input = create("input",false,false,setting);
				input.type = "number";
				if(def.min !== undefined){
					input.setAttribute("min",def.min)
				}
				if(def.max){
					input.setAttribute("max",def.max)
				}
			}
			if(def.type != "heading"){
				input.targetSetting = def.id;
				input.value = useScripts[def.id];
				input.onchange = function(){
					useScripts[this.targetSetting] = this.value;
					useScripts.save();
				}
			}
		}
		else{//default: a checkbox
			let input = createCheckbox(setting);
			input.targetSetting = def.id;
			input.checked = useScripts[def.id];
			input.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				initCSS();
			}
		};
		if(def.categories){
			def.categories.forEach(
				category => setting.classList.add(category)
			)
		};
		create("span",false,def.description,setting);
		scriptSettings.appendChild(setting);
	});
	let titleAliasSettings = create("div");
	let titleAliasInstructions = create("p");
	titleAliasInstructions.innerText = `
Add title aliases. Use the format /type/id/alias , one per line. Examples:

/anime/5114/Fullmetal Alchemist
/manga/30651/Nausicaä

Changes take effect on reload.`;
	let titleAliasInput = create("textarea","#titleAliasInput");
	(
		JSON.parse(localStorage.getItem("titleAliases")) || []
	).forEach(
		alias => titleAliasInput.value += alias[0] + alias[1] + "\n"
	);
	titleAliasInput.rows = "6";
	titleAliasInput.cols = "50";
	let titleAliasChange = create("button",["hohButton","button"],"Submit");
	titleAliasChange.onclick = function(){
		let newAliases = [];
		let aliasContent = titleAliasInput.value.split("\n");
		let aliasRegex = /^(\/(anime|manga)\/\d+\/)(.*)/;
		let cssAlias = /^(css\/)(.*)/;
		aliasContent.forEach(content => {
			let matches = content.match(aliasRegex);
			if(!matches){
				let cssMatches = content.match(cssAlias);
				if(cssMatches){
					newAliases.push([cssMatches[1],cssMatches[2]])
				};
				return;
			};
			newAliases.push([matches[1],matches[3]]);
		});
		localStorage.setItem("titleAliases",JSON.stringify(newAliases));
	};
	titleAliasSettings.appendChild(create("hr"));
	titleAliasSettings.appendChild(titleAliasInstructions);
	titleAliasSettings.appendChild(titleAliasInput);
	create("br",false,false,titleAliasSettings);
	titleAliasSettings.appendChild(titleAliasChange);
	titleAliasSettings.appendChild(create("hr"));
	hohSettings.appendChild(titleAliasSettings);
	//
	let notificationColour = create("div");
	if(useScripts.accessToken){
		const notificationTypes = [
			"ACTIVITY_MESSAGE",
			"ACTIVITY_REPLY",
			"FOLLOWING",
			"ACTIVITY_MENTION",
			"THREAD_COMMENT_MENTION",
			"THREAD_SUBSCRIBED",
			"THREAD_COMMENT_REPLY",
			"AIRING",
			"ACTIVITY_LIKE",
			"ACTIVITY_REPLY_LIKE",
			"THREAD_LIKE",
			"THREAD_COMMENT_LIKE"
		];
		const supportedColours = [
			{name:"Transparent",value:"rgb(0,0,0,0)"},
			{name:"Blue",value:"rgb(61,180,242)"},
			{name:"White",value:"rgb(255,255,255)"},
			{name:"Black",value:"rgb(0,0,0)"},
			{name:"Red",value:"rgb(232,93,117)"},
			{name:"Peach",value:"rgb(250,122,122)"},
			{name:"Orange",value:"rgb(247,154,99)"},
			{name:"Yellow",value:"rgb(247,191,99)"},
			{name:"Green",value:"rgb(123,213,85)"}
		];
		create("p",false,"Notification Dot Colours",notificationColour);
		let nColourType = create("select",false,false,notificationColour);
		let nColourValue = create("select",false,false,notificationColour);
		let supressOption = createCheckbox(notificationColour);
		let supressOptionText = create("span",false,"Don't show dot",notificationColour);
		notificationTypes.forEach(
			type => create("option",false,type,nColourType)
				.value = type
		);
		supportedColours.forEach(
			colour => create("option",false,colour.name,nColourValue)
				.value = colour.value
		);
		create("br",false,false,notificationColour);
		let resetAll = create("button",["hohButton","button"],"Reset all",notificationColour);
		resetAll.onclick = function(){
			useScripts.notificationColours = notificationColourDefaults;
			useScripts.save();
		};
		nColourType.oninput = function(){
			nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
			supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
		};
		nColourValue.oninput = function(){
			useScripts.notificationColours[nColourType.value].colour = nColourValue.value;
			useScripts.save();
		};
		supressOption.oninput = function(){
			useScripts.notificationColours[nColourType.value].supress = supressOption.checked;
			useScripts.save();
		};
		nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
		supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
		hohSettings.appendChild(notificationColour);
	}
	hohSettings.appendChild(create("hr"));
	let blockList = localStorage.getItem("blockList");
	if(blockList){
		blockList = JSON.parse(blockList)
	}
	else{
		blockList = []
	};
	let blockSettings = create("div");
	let blockInstructions = create("p",false,false,blockSettings);
	blockInstructions.innerText = `
Block stuff in the home feed.

Changes take effect on reload.`;
	let blockInput = create("div","#blockInput",false,blockSettings);
	create("span",false,"User: ",blockInput);
	let blockUserInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
	blockUserInput.value = "";
	create("span",false," Status: ",blockInput);
	let blockStatusInput = create("select",false,false,blockInput,"margin-right:10px;");
	const blockStatuses = ["","all","status","progress","anime","manga","planning","watching","reading","pausing","dropping","rewatching","rereading"];
	blockStatuses.forEach(
		status => create("option",false,capitalize(status),blockStatusInput)
			.value = status
	);
	blockStatusInput.value = "";
	create("span",false," Media ID: ",blockInput);
	let blockMediaInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
	blockMediaInput.type = "number";
	blockMediaInput.value = "";
	blockMediaInput.min = 0;
	let blockAddInput = create("button",["button","hohButton"],"Add",blockInput);
	let blockVisual = create("div",false,false,blockSettings);
	let drawBlockList = function(){
		removeChildren(blockVisual)
		blockList.forEach(function(blockItem,index){;
				let item = create("div","hohBlock",false,blockVisual);
				let cross = create("span","hohBlockCross",svgAssets.cross,item);
				cross.onclick = function(){
					blockList.splice(index,1);
					localStorage.setItem("blockList",JSON.stringify(blockList));
					drawBlockList();
				};
				if(blockItem.user){
					create("span","hohBlockSpec",blockItem.user,item)
				}
				if(blockItem.status){
					create("span","hohBlockSpec",capitalize(blockItem.status),item)
				}
				if(blockItem.media){
					create("span","hohBlockSpec","ID:" + blockItem.media,item)
				}
		});
	};drawBlockList();
	blockAddInput.onclick = function(){
		let newBlock = {
			user: false,
			status: false,
			media: false
		};
		if(blockUserInput.value){
			newBlock.user = blockUserInput.value
		}
		if(blockStatusInput.value){
			newBlock.status = blockStatusInput.value
		}
		if(blockMediaInput.value){
			newBlock.media = blockMediaInput.value
		}
		if(newBlock.user || newBlock.status || newBlock.media){
			blockList.push(newBlock);
			localStorage.setItem("blockList",JSON.stringify(blockList));
			drawBlockList();
		}
	};
	hohSettings.appendChild(blockSettings);
	//
	hohSettings.appendChild(create("hr"));
	if(useScripts.profileBackground && useScripts.accessToken){
		let backgroundSettings = create("div",false,false,hohSettings);
		create("p","hohMonospace",
`Set a profile background, like this:
	red
	#640064
	url(https://www.example.com/myBackground.jpg)
	<any css background shorthand>

	Tip: Use a colour with transparancy set, to respect light and dark themes. Example: rgb(100,0,100,0.4)

	Tip2: Do you want a faded image, staying fixed in place, and filling the screen? This is how:
	linear-gradient(rgb(var(--color-background),0.8),rgb(var(--color-background),0.8)),url(https://www.example.com/myBackground.jpg) center/100% fixed
`,
		backgroundSettings);
		let inputField = create("input",false,false,backgroundSettings);
		inputField.value = useScripts.profileBackgroundValue;
		create("br",false,false,backgroundSettings);
		let backgroundChange = create("button",["hohButton","button"],"Submit",backgroundSettings);
		backgroundChange.onclick = function(){
			useScripts.profileBackgroundValue = inputField.value;
			useScripts.save();
			let jsonMatch = userObject.about.match(/^<!--(\{.*})-->/);
			let profileJson = {};
			if(jsonMatch){
				try{
					profileJson = JSON.parse(jsonMatch[1])
				}
				catch(e){
					console.warn("Invalid profile JSON")
				}
			}
			profileJson.background = useScripts.profileBackgroundValue;
			let newDescription = "<!--" + JSON.stringify(profileJson) + "-->" + (userObject.about.replace(/^<!--\{.*}-->/,""));
			authAPIcall(
				`mutation($about: String){
					UpdateUser(about: $about){
						about
					}
				}`,
				{about: newDescription},function(data){/*later*/}
			)
		};
		hohSettings.appendChild(create("hr"));
	};
	if(useScripts.customCSS && useScripts.accessToken){
		let backgroundSettings = create("div",false,false,hohSettings);
		create("p",false,"Add custom CSS to your profile. This will be visible to others.",backgroundSettings);
		let inputField = create("textarea",false,false,backgroundSettings);
		inputField.value = useScripts.customCSSValue;
		create("br",false,false,backgroundSettings);
		let backgroundChange = create("button",["hohButton","button"],"Submit",backgroundSettings);
		backgroundChange.onclick = function(){
			useScripts.customCSSValue = inputField.value;
			useScripts.save();
			let jsonMatch = userObject.about.match(/^<!--(\{.*})-->/);
			let profileJson = {};
			if(jsonMatch){
				try{
					profileJson = JSON.parse(jsonMatch[1])
				}
				catch(e){
					console.warn("Invalid profile JSON")
				}
			}
			profileJson.customCSS = useScripts.customCSSValue;
			let newDescription = "<!--" + JSON.stringify(profileJson) + "-->" + (userObject.about.replace(/^<!--\{.*}-->/,""));
			authAPIcall(
				`mutation($about: String){
					UpdateUser(about: $about){
						about
					}
				}`,
				{about: newDescription},function(data){/*later*/}
			)
		};
		hohSettings.appendChild(create("hr"));
	};

	create("p",false,"Delete all custom settings. Re-installing the script will not do that by itself.",hohSettings);
	let cleanEverything= create("button",["hohButton","button","danger"],"Default Settings",hohSettings);
	cleanEverything.onclick = function(){
		localStorage.removeItem("hohSettings");
		window.location.reload(false);
	}
	create("hr","hohSeparator",false,hohSettings);
	let loginURL = create("a",false,"Sign in with the script",hohSettings);
	loginURL.href = authUrl;
	loginURL.style.color = "rgb(var(--color-blue))";
	create("p",false,"Enables or improves every module in the \"Login\" tab, improves those greyed out.",hohSettings);
}

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
								newElem.innerHTML += message.message;
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
											create("p",false,false,row).innerHTML = activity.text;
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
													create("p",false,false,row).innerHTML = activity.text;
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
			{name: "Autorecs",code: function(){
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
								newDate.innerHTML += act.text;
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
//gather some stats

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
					columnTitle.innerHTML += " " + svgAssets.angleDown
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
								cel.innerHTML = svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML = svgAssets.repeat + data[index].repeat
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
						.innerHTML = comment
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
				singleText += "<a href='https://anilist.co/anime/" + longestDuration.id + "'>" + longestDuration.name + "</a>";
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
								cel.innerHTML += svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML += svgAssets.repeat + data[index].repeat
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
							countCel.innerHTML += svgAssets.repeat
						}
						else if(top.repeat > 1){
							countCel.innerHTML += svgAssets.repeat + top.repeat
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
					newStatComment.innerHTML = comment;
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
						" (weighted by chapters)"
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
								cel.innerHTML = svgAssets.repeat
							}
							else if(data[index].repeat > 1){
								cel.innerHTML = svgAssets.repeat + data[index].repeat
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

function drawListStuff(){
	const URLstuff = location.pathname.match(/^\/user\/(.+)\/(animelist|mangalist)/);
	if(!URLstuff){
		return
	};
	if(document.querySelector(".hohExtraFilters")){
		return
	};
	let filters = document.querySelector(".filters-wrap");
	if(!filters){
		setTimeout(drawListStuff,200);
		return
	};
	let extraFilters = create("div","hohExtraFilters");
	extraFilters.style.marginTop = "15px";
	if(useScripts.draw3x3){
		let buttonDraw3x3 = create("span","#hohDraw3x3","3x3",extraFilters);
		buttonDraw3x3.title = "Create a 3x3 from 9 selected entries";
		buttonDraw3x3.onclick = function(){
			this.style.color = "rgb(var(--color-blue))";
			let counter = 0;
			let linkList = [];
			let cardList = document.querySelectorAll(".entry-card.row,.entry.row");
			cardList.forEach(function(card){
				card.onclick = function(){
					if(this.draw3x3selected){
						counter--;
						linkList[this.draw3x3selected - 1] = "";
						this.draw3x3selected = false;
						this.style.borderStyle = "none";
					}
					else{
						counter++;
						linkList.push(this.querySelector(".cover .image").style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',""));
						this.draw3x3selected = +linkList.length;
						this.style.borderStyle = "solid";
						if(counter === 9){
							linkList = linkList.filter(e => e !== "");
							let displayBox = createDisplayBox();
							create("p",false,"Save the image below:",displayBox);
							displayBox.querySelector(".hohDisplayBoxClose").onclick = function(){
								displayBox.remove();
								cardList.forEach(function(card){
									card.draw3x3selected = false;
									card.style.borderStyle = "none";
								});
								counter = 0;
								linkList = [];
							};
							create("div",false,false,displayBox);
							let finalCanvas = create("canvas",false,false,displayBox);
							finalCanvas.width = 230*3;
							finalCanvas.height = 345*3;
							let ctx = finalCanvas.getContext("2d");
							let drawStuff = function(image,x,y,width,height){
								let img = new Image();
								img.onload = function(){
									ctx.drawImage(img,x,y,width,height);
								}
								img.src = image;
							};
							for(var i=0;i<3;i++){
								for(var j=0;j<3;j++){
									drawStuff(linkList[i*3+j],j*230,i*345,230,345);
								};
							};
						}
					}
				};
			});
		}
	}
	if(useScripts.newChapters && URLstuff[2] === "mangalist"){
		let buttonFindChapters = create("button",["hohButton","button"],"New Chapters",extraFilters,"display:block;");
		buttonFindChapters.onclick = function(){
			let scrollableContent = createDisplayBox("min-width:400px;height:500px;");
			let loader = create("p",false,"Scanning...",scrollableContent);
			generalAPIcall(`
			query($name: String!){
				MediaListCollection(userName: $name, type: MANGA){
					lists{
						entries{
							mediaId
							status
							media{
								status
							}
						}
					}
				}
			}`,
			{name: decodeURIComponent(URLstuff[1])},
			function(data){
				let list = returnList(data,true).filter(a => a.status === "CURRENT" && a.media.status === "RELEASING");
				let returnedItems = 0;
				let goodItems = [];
				let checkListing = function(data){
					returnedItems++;
					if(returnedItems === list.length){
						loader.innerText = "";
						if(!goodItems.length){
							loader.innerText = "No new items found :(";
						};
					};
					let guesses = [];
					let userIdCache = new Set();
					data.data.Page.activities.forEach(function(activity){
						if(activity.progress){
							let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
							if(!userIdCache.has(activity.userId)){
								guesses.push(chapterMatch);
								userIdCache.add(activity.userId);
							};
						};
					});
					guesses.sort(VALUE_DESC);
					if(guesses.length){
						let bestGuess = guesses[0];
						if(guesses.length > 2){
							let diff = guesses[0] - guesses[1];
							let inverseDiff = 1 + Math.ceil(20/(diff+1));
							if(guesses.length >= inverseDiff){
								if(guesses[1] === guesses[inverseDiff]){
									bestGuess = guesses[1];
								}
							};
						};
						if(commonUnfinishedManga.hasOwnProperty(data.data.MediaList.media.id)){
							if(bestGuess < commonUnfinishedManga[data.data.MediaList.media.id].chapters){
								bestGuess = commonUnfinishedManga[data.data.MediaList.media.id].chapters;
							};
						};
						let bestDiff = bestGuess - data.data.MediaList.progress;
						if(bestDiff > 0 && bestDiff < 30){
							goodItems.push({data:data,bestGuess:bestGuess});
							removeChildren(scrollableContent)
							goodItems.sort((b,a) => a.data.data.MediaList.score - b.data.data.MediaList.score);
							goodItems.forEach(function(item){
								let listing = create("p","hohNewChapter",false,scrollableContent);
								let title = item.data.data.MediaList.media.title.romaji;
								if(useScripts.titleLanguage === "NATIVE" && item.data.data.MediaList.media.title.native){
									title = item.data.data.MediaList.media.title.native;
								}
								else if(useScripts.titleLanguage === "ENGLISH" && item.data.data.MediaList.media.title.english){
									title = item.data.data.MediaList.media.title.english;
								};
								let countPlace = create("span",false,false,listing,"width:110px;display:inline-block;");
								let progress = create("span",false,item.data.data.MediaList.progress + " ",countPlace);
								let guess = create("span",false,"+" + (item.bestGuess - item.data.data.MediaList.progress),countPlace,"color:rgb(var(--color-green));");
								if(useScripts.accessToken){
									progress.style.cursor = "pointer";
									progress.title = "Increase progress by 1";
									progress.onclick = function(){
										item.data.data.MediaList.progress++;
										authAPIcall(
											`mutation($id: Int,$progress: Int){
												SaveMediaListEntry(mediaId: $id,progress: $progress){id}
											}`,
											{
												id: item.data.data.MediaList.media.id,
												progress: item.data.data.MediaList.progress
											},
											function(fib){}
										);
										progress.innerText = item.data.data.MediaList.progress + " ";
										if(item.bestGuess - item.data.data.MediaList.progress > 0){
											guess.innerText = "+" + (item.bestGuess - item.data.data.MediaList.progress);
										}
										else{
											guess.innerText = "";
										}
									}
								};
								create("a",["link","newTab"],title,listing)
									.href = "/manga/" + item.data.data.MediaList.media.id + "/" + safeURL(title) + "/";
								let chapterClose = create("span","hohDisplayBoxClose",svgAssets.cross,listing);
								chapterClose.onclick = function(){
									listing.remove();
								};
							});
						}
					};
				};
				let bigQuery = [];
				list.forEach(function(entry,index){
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
					});
					if((index % 20) === 0){
						queryPacker(bigQuery);
						bigQuery = [];
					};
				});
				queryPacker(bigQuery);
			});
		};
	};
	if(useScripts.tagIndex && (!useScripts.mobileFriendly)){
		let tagIndex = create("div","tagIndex",false,extraFilters);
		let collectNotes = function(data){
			let customTags = new Map();	
			let listData = returnList(data,true);
			listData.forEach(function(entry){
				if(entry.notes){
					(
						entry.notes.match(/(#(\\\s|\S)+)/g) || []
					).filter(
						tagMatch => !tagMatch.match(/^#039/)
					).map(
						tagMatch => evalBackslash(tagMatch)
					).forEach(tagMatch => {
						if(!customTags.has(tagMatch)){
							customTags.set(tagMatch,{name: tagMatch,count: 0})
						}
						customTags.get(tagMatch).count++
					})
					let noteContent = parseListJSON(entry.notes);
					if(noteContent && noteContent.lists){
						noteContent.lists.forEach(function(list){
							if(list.name && list.info){
								let titles = document.querySelectorAll("h3.section-name");
								for(var i=0;i<titles.length;i++){
									if(titles[i].innerText === list.name){
										let descriptionNode = create("p",false,list.info);
										titles[i].parentNode.insertBefore(descriptionNode,titles[i].nextSibling);
										break;
									}
								}
							}
						})
					}
				}
			});
			if(customTags.has("##STRICT")){
				customTags.delete("##STRICT")
			}
			customTags = [...customTags].map(pair => pair[1]);
			customTags.sort((b,a) => a.count - b.count || b.name.localeCompare(a.name));
			removeChildren(tagIndex)
			customTags.forEach(tag => {
				let tagElement = create("p",false,tag.name,tagIndex);
				create("span","count",tag.count,tagElement);
				tagElement.onclick = function(){
					let filterBox = document.querySelector(".entry-filter input");
					filterBox.value = tag.name;
					filterBox.dispatchEvent(new Event("input"));
					if(filterBox.scrollIntoView){
						filterBox.scrollIntoView({"behavior": "smooth","block": "start"})
					}
					else{
						document.body.scrollTop = document.documentElement.scrollTop = 0
					}
				}
			})
		};
		let variables = {
			name: decodeURIComponent(URLstuff[1]),
			listType: "ANIME"
		};
		if(URLstuff[2] === "mangalist"){
			variables.listType = "MANGA"
		};
		generalAPIcall(queryMediaListNotes,variables,collectNotes,"hohCustomTagIndex" + variables.listType + variables.name,60*1000);
	}
	filters.appendChild(extraFilters);
	let filterBox = document.querySelector(".entry-filter input");
	let searchParams = new URLSearchParams(location.search);
	let paramSearch = searchParams.get("search");
	if(paramSearch){
		filterBox.value = decodeURIComponent(paramSearch);
		let event = new Event("input");
		filterBox.dispatchEvent(event);
	}
	let filterChange = function(){
		let newURL = location.protocol + "//" + location.host + location.pathname 
		if(filterBox.value === ""){
			searchParams.delete("search")
		}
		else{
			searchParams.set("search",encodeURIComponent(filterBox.value));
			newURL += "?" + searchParams.toString();
		}
		current = newURL;
		history.replaceState({},"",newURL);
		if(document.querySelector(".el-icon-circle-close")){
			document.querySelector(".el-icon-circle-close").onclick = filterChange
		}
	}
	filterBox.oninput = filterChange;
	filterChange();
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: true
	};
	if(
		decodeURIComponent(URLstuff[1]) === whoAmI
		&& useScripts.accessToken
		&& useScripts.plussMinus
		&& (
			document.querySelector(".medialist").classList.contains("POINT_100")
			|| document.querySelector(".medialist").classList.contains("POINT_10")
			|| document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")
		)
	){
		let minScore = 1;
		let maxScore = 100;
		let stepSize = 1;
		if(document.querySelector(".medialist").classList.contains("POINT_10") || document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			maxScore = 10;
		}
		if(document.querySelector(".medialist").classList.contains("POINT_10_DECIMAL")){
			stepSize = 0.1;
		}
		let scoreChanger = function(){
			observer.disconnect();
			lists.querySelectorAll(".list-entries .row .score").forEach(function(entry){
				if(!entry.childElementCount){
					let updateScore = function(isUp){
						let score = parseFloat(entry.attributes.score.value);
						if(isUp){
							score += stepSize;
						}
						else{
							score -= stepSize;
						}
						if(score >= minScore && score <= maxScore){
							let id = parseInt(entry.previousElementSibling.children[0].href.match(/(anime|manga)\/(\d+)/)[2]);
							lists.querySelectorAll("[href=\"" + entry.previousElementSibling.children[0].attributes.href.value + "\"]").forEach(function(rItem){
								rItem.parentNode.nextElementSibling.attributes.score.value = score.roundPlaces(1);
								rItem.parentNode.nextElementSibling.childNodes[1].textContent = " " + score.roundPlaces(1) + " ";
							});
							authAPIcall(
								`mutation($id:Int,$score:Float){
									SaveMediaListEntry(mediaId:$id,score:$score){
										score
									}
								}`,
								{id:id,score:score},function(data){/*later*/}
							);
						};
					};
					let changeMinus = create("span","hohChangeScore","-");
					entry.insertBefore(changeMinus,entry.firstChild);
					let changePluss = create("span","hohChangeScore","+",entry);
					changeMinus.onclick = function(){updateScore(false)};
					changePluss.onclick = function(){updateScore(true)};
				}
			});
			observer.observe(lists,mutationConfig);
		}
		let lists = document.querySelector(".lists");
		let observer = new MutationObserver(scoreChanger);
		observer.observe(lists,mutationConfig);
		scoreChanger();
	}
};

function addDblclickZoom(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addDblclickZoom,200);
		return;
	};
	activityFeedWrap.addEventListener("dblclick",function(e){
		e = e || window.event;
		let target = e.target || e.srcElement;
	 	while(target.classList){
			if(target.classList.contains("activity-entry")){
				target.classList.toggle("hohZoom");
				break;
			};
			target = target.parentNode;
		}  
	},false);
}

function addFeedFilters(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let filterBox = document.querySelector(".hohFeedFilter");
	if(filterBox){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addFeedFilters,100);
		return;
	};
	let activityFeed = activityFeedWrap.querySelector(".activity-feed");
	if(!activityFeed){
		setTimeout(addFeedFilters,100);
		return;
	};
	let commentFilterBoxInput;
	let commentFilterBoxLabel;
	let likeFilterBoxInput;
	let likeFilterBoxLabel;
	let allFilterBox;
	let blockList = localStorage.getItem("blockList");
	if(blockList){
		blockList = JSON.parse(blockList)
	}
	else{
		blockList = []
	};
	let postRemover = function(){
		if(!location.pathname.match(/^\/home\/?$/)){
			return
		};
		for(var i=0;i<activityFeed.children.length;i++){
			if(activityFeed.children[i].querySelector(".el-dialog__wrapper")){
				continue
			};
			let actionLikes = activityFeed.children[i].querySelector(".action.likes .button .count");
			if(actionLikes){
				actionLikes = parseInt(actionLikes.innerText);
			}
			else{
				actionLikes = 0
			};
			let actionReplies = activityFeed.children[i].querySelector(".action.replies .count");
			if(actionReplies){
				actionReplies = parseInt(actionReplies.innerText);
			}
			else{
				actionReplies = 0
			};
			let blockRequire = true;
			if(useScripts.blockWord && activityFeed.children[i].classList.contains("activity-text")){
				try{
					if(activityFeed.children[i].innerText.match(new RegExp(blockWordValue,"i"))){
						blockRequire = false
					}
				}
				catch(err){
					if(activityFeed.children[i].innerText.toLowerCase().match(useScripts.blockWordValue.toLowerCase())){
						blockRequire = false
					}
				}
			}
			if(useScripts.statusBorder){
				if(activityFeed.children[i].classList.contains("activity-anime_list") || activityFeed.children[i].classList.contains("activity-manga_list")){
					let blockerMap = {
						"plans": "PLANNING",
						"Plans": "PLANNING",
						"watched": "CURRENT",
						"Watched": "CURRENT",
						"read": "CURRENT",
						"Read": "CURRENT",
						"completed": "COMPLETED",
						"Completed": "COMPLETED",
						"paused": "PAUSED",
						"Paused": "PAUSED",
						"dropped": "DROPPED",
						"Dropped": "DROPPED",
						"rewatched": "REPEATING",
						"Rewatched": "REPEATING",
						"reread": "REPEATING",
						"Reread": "REPEATING"
					};
					let status = blockerMap[
						Object.keys(blockerMap).find(
							key => activityFeed.children[i].querySelector(".status").innerText.includes(key)
						)
					]
					if(status === "CURRENT"){
						activityFeed.children[i].style.borderRightWidth = "0px"
					}
					else if(status === "COMPLETED"){
						activityFeed.children[i].style.borderRightStyle = "solid";
						activityFeed.children[i].style.borderRightWidth = "5px";
						if(useScripts.CSSgreenManga && activityFeed.children[i].classList.contains("activity-anime_list")){
							activityFeed.children[i].style.borderRightColor = "rgb(var(--color-blue))";
						}
						else{
							activityFeed.children[i].style.borderRightColor = "rgb(var(--color-green))";
						}
					}
					else{
						activityFeed.children[i].style.borderRightStyle = "solid";
						activityFeed.children[i].style.borderRightWidth = "5px";
						activityFeed.children[i].style.borderRightColor = distributionColours[status];
					}
				}		
			}
			const statusCheck = {
				"planning": /^plans/i,
				"watching": /^watched/i,
				"reading": /^read/i,
				"completing": /^completed/i,
				"pausing": /^paused/i,
				"dropping": /^dropped/i,
				"rewatching": /^rewatched/i,
				"rereading": /^reread/i
			}
			if(
				(!useScripts.feedCommentFilter || (
					actionLikes >= likeFilterBoxInput.value
					&& (likeFilterBoxInput.value >= 0 || actionLikes < -likeFilterBoxInput.value)
					&& actionReplies >= commentFilterBoxInput.value
					&& (commentFilterBoxInput.value >= 0 || actionReplies < -commentFilterBoxInput.value)
				))
				&& blockRequire
				&& blockList.every(
					blocker => (
						blocker.user
						&& activityFeed.children[i].querySelector(".name").textContent.trim().toLowerCase() !== blocker.user.toLowerCase()
					)
					|| (
						blocker.media
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| activityFeed.children[i].querySelector(".status .title").href.match(/\/(anime|manga)\/(\d+)/)[2] !== blocker.media
						)
					)
					|| (
						blocker.status
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| blocker.status == "status"
							|| (
								blocker.status === "anime"
								&& !activityFeed.children[i].classList.contains("activity-anime_list")
							)
							|| (
								blocker.status === "manga"
								&& !activityFeed.children[i].classList.contains("activity-manga_list")
							)
							|| (
								statusCheck[blocker.status]
								&& !activityFeed.children[i].querySelector(".status").textContent.trim().match(statusCheck[blocker.status])
							)
						)
					)
				)
			){
				if(
					useScripts.SFWmode
					&& activityFeed.children[i].classList.contains("activity-text")
					&& badWords.some(word => activityFeed.children[i].querySelector(".activity-markdown").innerText.match(word))
				){
					activityFeed.children[i].style.opacity= 0.5
				}
				else{
					activityFeed.children[i].style.display = ""
				}
			}
			else{
				activityFeed.children[i].style.display = "none"
			}
		};
	};
	if(useScripts.feedCommentFilter){
		filterBox = create("div","hohFeedFilter",false,activityFeedWrap);
		create("span","hohDescription","At least ",filterBox);
		activityFeedWrap.style.position = "relative";
		activityFeedWrap.children[0].childNodes[0].nodeValue = "";
		commentFilterBoxInput = create("input",false,false,filterBox);
		commentFilterBoxInput.type = "number";
		commentFilterBoxInput.value = useScripts.feedCommentComments;
		commentFilterBoxLabel = create("span",false," comments, ",filterBox);
		likeFilterBoxInput = create("input",false,false,filterBox);
		likeFilterBoxInput.type = "number";
		likeFilterBoxInput.value = useScripts.feedCommentLikes;
		likeFilterBoxLabel = create("span",false," likes",filterBox);
		allFilterBox = create("button",false,"⟳",filterBox,"padding:0px;");
		commentFilterBoxInput.onchange = function(){
			useScripts.feedCommentComments = commentFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		likeFilterBoxInput.onchange = function(){
			useScripts.feedCommentLikes = likeFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		allFilterBox.onclick = function(){
			commentFilterBoxInput.value = 0;
			likeFilterBoxInput.value = 0;
			useScripts.feedCommentComments = 0;
			useScripts.feedCommentLikes = 0;
			useScripts.save();
			postRemover();
		};
	}
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: false
	};
	let observer = new MutationObserver(function(){
		postRemover();
		setTimeout(postRemover,500);
	});
	observer.observe(activityFeed,mutationConfig);
	let observerObserver = new MutationObserver(function(){//Who police police? The police police police police
		activityFeed = activityFeedWrap.querySelector(".activity-feed");
		if(activityFeed){
			observer.disconnect();
			observer = new MutationObserver(function(){
				postRemover();
				setTimeout(postRemover,500);
			});
			observer.observe(activityFeed,mutationConfig);
		}
	});
	observerObserver.observe(activityFeedWrap,mutationConfig);
	postRemover();
	let waiter = function(){
		setTimeout(function(){
			if(location.pathname.match(/^\/home\/?$/)){
				postRemover();
				waiter();
			};
		},5*1000);
	};waiter();
};

function expandRight(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let possibleFullWidth = document.querySelector(".home.full-width");
	if(possibleFullWidth){
		let homeContainer = possibleFullWidth.parentNode;
		let sideBar = document.querySelector(".activity-feed-wrap")
		if(!sideBar){
			setTimeout(expandRight,100);
			return;
		};
		sideBar = sideBar.nextElementSibling;
		sideBar.insertBefore(possibleFullWidth,sideBar.firstChild);
		let setSemantics = function(){
			let toggle = document.querySelector(".size-toggle.fa-compress");
			if(toggle){
				toggle.onclick = function(){
					homeContainer.insertBefore(possibleFullWidth,homeContainer.firstChild)
				}
			}
			else{
				setTimeout(setSemantics,200)
			};
		};setSemantics();
	}
}

function mangaGuess(cleanAnime,id){
	let possibleMangaGuess = document.querySelector(".data-set .value[data-media-id]");
	if(possibleMangaGuess){
		if(cleanAnime){
			removeChildren(possibleMangaGuess)
		}
		else if(id !== parseInt(possibleMangaGuess.dataset.mediaId)){
			removeChildren(possibleMangaGuess)
		}
	};
	if(cleanAnime){
		return
	};
	let URLstuff = location.pathname.match(/^\/manga\/(\d+)\/?(.*)?/);
	if(!URLstuff){
		return;
	};
	let possibleReleaseStatus = Array.from(
		document.querySelectorAll(".data-set .value")
	).find(
		element => element.innerText.match(/^Releasing/)
	);
	if(!possibleReleaseStatus){
		setTimeout(mangaGuess,200);
		return;
	}
	if(possibleReleaseStatus.dataset.mediaId === URLstuff[1]){
		if(possibleReleaseStatus.children.length !== 0){
			return
		}
	}
	else{
		removeChildren(possibleReleaseStatus)
	};
	possibleReleaseStatus.dataset.mediaId = URLstuff[1];
	const variables = {id: parseInt(URLstuff[1]),userName: whoAmI};
	let query = `
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
	}
}`;
	let possibleMyStatus = document.querySelector(".actions .list .add");
	const simpleQuery = !possibleMyStatus || possibleMyStatus.innerText === "Add to List" || possibleMyStatus.innerText === "Planning";
	if(simpleQuery){
		query = `
query($id: Int){
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
}`;
	};
	let highestChapterFinder = function(data){
		if(possibleReleaseStatus.children.length !== 0){
			return;
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
				let inverseDiff = 1 + Math.ceil(25/(diff+1));
				if(guesses.length >= inverseDiff){
					if(guesses[1] === guesses[inverseDiff]){
						bestGuess = guesses[1]
					}
				}
			};
			if(commonUnfinishedManga.hasOwnProperty(variables.id)){
				if(bestGuess < commonUnfinishedManga[variables.id].chapters){
					bestGuess = commonUnfinishedManga[variables.id].chapters
				}
			};
			if(simpleQuery){
				if(bestGuess){
					create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus);
				}
			}
			else{
				bestGuess = Math.max(bestGuess,data.data.MediaList.progress);
				if(bestGuess){
					if(bestGuess === data.data.MediaList.progress){
						create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus,"color:rgb(var(--color-green));");
					}
					else{
						create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus);
						create("span","hohGuess"," [+" + (bestGuess - data.data.MediaList.progress) + "]",possibleReleaseStatus,"color:rgb(var(--color-red));");
					}
				}
			};
		};
	};
	try{
		generalAPIcall(query,variables,highestChapterFinder,"hohMangaGuess" + variables.id,30*60*1000);
	}
	catch(e){
		sessionStorage.removeItem("hohMangaGuess" + variables.id);
	}
}

if(useScripts.ALbuttonReload){
	let logo = document.querySelector(".logo");
	if(logo){
		logo.onclick = function(){
			if(location.pathname.match(/\/home\/?$/)){//we only want this behaviour here
				window.location.reload(false);//reload page, but use cache if possible
			}
		}
	}
}

function enumerateSubmissionStaff(){
	if(!location.pathname.match(/^\/edit/)){
		return;
	};
	setTimeout(enumerateSubmissionStaff,500);
	let staffFound = [];
	let staffEntries = document.querySelectorAll(".staff-row .col > .image");
	Array.from(staffEntries).forEach(function(staff){
		let enumerate = staffFound.filter(a => a === staff.href).length;
		if(enumerate === 1){
			let firstStaff = document.querySelector(".staff-row .col > .image[href=\"" + staff.href.replace("https://anilist.co","") + "\"]");
			if(!firstStaff.previousSibling){
				firstStaff.parentNode.insertBefore(
					create("span","hohEnumerateStaff",1),
					firstStaff
				)
			};
		}
		if(enumerate > 0){
			if(staff.previousSibling){
				staff.previousSibling.innerText = enumerate + 1;
			}
			else{
				staff.parentNode.insertBefore(
					create("span","hohEnumerateStaff",(enumerate + 1)),
					staff
				)
			}
		};
		staffFound.push(staff.href);
	});
}

function addMALscore(type,id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return;
	};
	let MALscore = document.getElementById("hohMALscore");
	if(MALscore){
		if(parseInt(MALscore.dataset.id) === id){
			return;
		}
		else{
			MALscore.remove();
		}
	};
	let MALserial = document.getElementById("hohMALserialization");
	if(MALserial){
		if(parseInt(MALserial.dataset.id) === id){
			return;
		}
		else{
			MALserial.remove();
		}
	};
	let possibleReleaseStatus = Array.from(document.querySelectorAll(".data-set .type"));
	const MALlocation = possibleReleaseStatus.find(element => element.innerText === "Mean Score");
	if(MALlocation){
		MALscore = create("div","data-set");
		MALscore.id = "hohMALscore";
		MALscore.dataset.id = id;
		MALlocation.parentNode.parentNode.insertBefore(MALscore,MALlocation.parentNode.nextSibling);
		if(type === "manga"){
			MALserial = create("div","data-set");
			MALserial.id = "hohMALserialization";
			MALserial.dataset.id = id;
			MALlocation.parentNode.parentNode.insertBefore(MALserial,MALlocation.parentNode.nextSibling.nextSibling);
		}
		generalAPIcall("query($id:Int){Media(id:$id){idMal}}",{id:id},function(data){
			if(data.data.Media.idMal){
				let handler = function(response){
					let score = response.responseText.match(/ratingValue.+?(\d+\.\d+)/);
					if(score && useScripts.MALscore){
						MALscore.style.paddingBottom = "14px";
						create("a",["type","newTab","external"],"MAL Score",MALscore)
							.href = "https://myanimelist.net/" + type + "/" + data.data.Media.idMal;
						create("div","value",score[1],MALscore);
					}
					if(type === "manga" && useScripts.MALserial){
						let serialization = response.responseText.match(/Serialization:<\/span>\n.*?href="(.*?)"\stitle="(.*?)"/);
						if(serialization){
							MALserial.style.paddingBottom = "14px";
							create("div","type","Serialization",MALserial);
							let link = create("a",["value","newTab","external"],serialization[2].replace("&#039;","'"),MALserial)
							link.href = "https://myanimelist.net" + serialization[1];
						}
					}
					let adder = function(){
						let possibleOverview = document.querySelector(".overview .grid-section-wrap:last-child");
						if(!possibleOverview){
							setTimeout(adder,500);
							return;
						}
						(possibleOverview.querySelector(".hohRecContainer") || {remove: ()=>{}}).remove();
						let recContainer = create("div",["grid-section-wrap","hohRecContainer"],false,possibleOverview);
						create("h2",false,"MAL recs",recContainer);
						let pattern = /class="picSurround"><a href="https:\/\/myanimelist.net\/(anime|manga)\/(\d+)\/(.|\n)*?detail\-user\-recs\-text.*?">(.*?)<\/div>/g;
						let matching = [];
						let matchingItem;
						while((matchingItem = pattern.exec(response.responseText)) && matching.length < 5){//single "=" is intended, we are setting the value of each match, not comparing
							matching.push(matchingItem)
						}
						if(!matching.length){
							recContainer.style.display = "none"
						}
						matching.forEach(function(item){
							let idMal = item[2];
							let description = item[4];
							let rec = create("div","hohRec",false,recContainer);
							let recImage = create("a","hohBackgroundCover",false,rec,"border-radius: 3px;");
							let recTitle = create("a","title",false,rec,"position:absolute;top:35px;left:80px;color:rgb(var(--color-blue));");
							recTitle.innerText = "MAL ID " + idMal;
							let recDescription = create("p",false,false,rec,"font-size: 1.4rem;line-height: 1.5;");
							recDescription.innerHTML = description;
							generalAPIcall("query($idMal:Int,$type:MediaType){Media(idMal:$idMal,type:$type){id title{romaji native english} coverImage{large color} siteUrl}}",{idMal:idMal,type:item[1].toUpperCase()},function(data){
								if(!data){
									return;
								};
								recImage.style.backgroundColor = data.data.Media.coverImage.color || "rgb(var(--color-foreground))";
								recImage.style.backgroundImage = "url(\"" + data.data.Media.coverImage.large + "\")";
								recImage.href = data.data.Media.siteUrl;
								if(useScripts.titleLanguage === "NATIVE" && data.data.Media.title.native){
									recTitle.innerText = data.data.Media.title.native;
								}
								else if(useScripts.titleLanguage === "ENGLISH" && data.data.Media.title.english){
									recTitle.innerText = data.data.Media.title.english;
								}
								else{
									recTitle.innerText = data.data.Media.title.romaji;
								}
								recTitle.href = data.data.Media.siteUrl;
							},"hohIDmalReverse" + idMal);
						})
					};
					if(useScripts.MALrecs){
						adder()
					}
				}
				if(window.GM_xmlhttpRequest){
					GM_xmlhttpRequest({
						method: "GET",
						anonymous: true,
						url: "https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs",
						onload: function(response){handler(response)}
					})
				}
				else{
					let oReq = new XMLHttpRequest();
					oReq.addEventListener("load",function(){handler(this)});
					oReq.open("GET","https://myanimelist.net/" + type + "/" + data.data.Media.idMal + "/placeholder/userrecs");
					oReq.send();
				}
			}
		},"hohIDmal" + id);
	}
	else{
		setTimeout(() => {addMALscore(type,id)},200)
	}
}

function cencorMediaPage(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let possibleLocation = document.querySelectorAll(".tags .tag .name");
	if(possibleLocation.length){
		if(possibleLocation.some(
			tag => badTags.some(
				bad => tag.innerText.toLowerCase().includes(bad)
			)
		)){
			let content = document.querySelector(".page-content");
			if(content){
				content.classList.add("hohCencor")
			}
		}
	}
	else{
		setTimeout(() => {cencorMediaPage(id)},200)
	}
}

function addEntryScore(id,tries){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return
	};
	let existing = document.getElementById("hohEntryScore");
	if(existing){
		if(existing.dataset.mediaId === id && !tries){
			return
		}
		else{
			existing.remove()
		}
	};
	let possibleLocation = document.querySelector(".actions .list .add");
	if(possibleLocation){
		let miniHolder = create("div","#hohEntryScore",false,possibleLocation.parentNode.parentNode,"position:relative;");
		miniHolder.dataset.mediaId = id;
		let type = possibleLocation.innerText;
		if(type === "Reading" || type === "Completed" || type === "Watching" || type === "Paused" || type === "Repeating" || type === "Dropped"){
			generalAPIcall(
				"query($id:Int,$name:String){MediaList(mediaId:$id,userName:$name){score progress}}",
				{id: id,name: whoAmI},
				function(data){
					let MediaList = data.data.MediaList;
					let scoreSpanContainer = create("div","hohMediaScore",false,miniHolder);
					let scoreSpan = create("span",false,false,scoreSpanContainer);
					let minScore = 1;
					let maxScore = 100;
					let stepSize = 1;
					if(["POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
						maxScore = 10
					}
					if(userObject.mediaListOptions.scoreFormat === "POINT_10_DECIMAL"){
						stepSize = 0.1
					}
					if(MediaList.score){
						scoreSpan.innerHTML = scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat,whoAmI);
						if(useScripts.accessToken && ["POINT_100","POINT_10","POINT_10_DECIMAL"].includes(userObject.mediaListOptions.scoreFormat)){
							let updateScore = function(isUp){
								let score = MediaList.score;
								if(isUp){
									MediaList.score += stepSize
								}
								else{
									MediaList.score -= stepSize
								}
								if(MediaList.score >= minScore && MediaList.score <= maxScore){
									scoreSpan.innerHTML = scoreFormatter(MediaList.score,userObject.mediaListOptions.scoreFormat,whoAmI);
									authAPIcall(
										`mutation($id:Int,$score:Float){
											SaveMediaListEntry(mediaId:$id,score:$score){
												score
											}
										}`,
										{id: id,score: MediaList.score},
										data => {}
									);
									let blockingCache = JSON.parse(sessionStorage.getItem("hohEntryScore" + id + whoAmI));
									blockingCache.data.data.MediaList.score = MediaList.score.roundPlaces(1);
									blockingCache.time = NOW();
									sessionStorage.setItem("hohEntryScore" + id + whoAmI,JSON.stringify(blockingCache));
								}
								else if(MediaList.score < minScore){
									MediaList.score = minScore
								}
								else if(MediaList.score > maxScore){
									MediaList.score = maxScore
								}
							};
							let changeMinus = create("span","hohChangeScore","-",false,"padding:2px;position:absolute;left:-1px;top:-2.5px;");
							scoreSpanContainer.insertBefore(changeMinus,scoreSpanContainer.firstChild);
							let changePluss = create("span","hohChangeScore","+",scoreSpanContainer,"padding:2px;");
							changeMinus.onclick = function(){updateScore(false)};
							changePluss.onclick = function(){updateScore(true)};
						}
					};
					if(type !== "Completed"){
						let progressPlace = create("span","hohMediaScore",false,miniHolder,"right:0px;");
						let progressVal = create("span",false,MediaList.progress,progressPlace);
						if(useScripts.accessToken){
							let changePluss = create("span","hohChangeScore","+",progressPlace,"padding:2px;position:absolute;top:-2.5px;");
							changePluss.onclick = function(){
								MediaList.progress++;
								authAPIcall(
									`mutation($id:Int,$progress:Int){
										SaveMediaListEntry(mediaId:$id,progress:$progress){
											progress
										}
									}`,
									{id: id,progress: MediaList.progress},
									data => {}
								);
								progressVal.innerText = MediaList.progress;
							};
						}
					};
				},
				"hohEntryScore" + id + whoAmI,30*1000
			);
		}
		else if(type === "Add to List" && (tries || 0) < 10){
			setTimeout(function(){addEntryScore(id,(tries || 0) + 1)},200);
		}
	}
	else{
		setTimeout(function(){addEntryScore(id)},200);
	}
}

function notificationCake(){
	let notificationDot = document.querySelector(".notification-dot");
	if(notificationDot && (!notificationDot.childElementCount)){
		authAPIcall(
			queryAuthNotifications,
			{page:1,name:whoAmI},
			function(data){
				let Page = data.data.Page;
				let User = data.data.User;
				let types = [];
				let names = [];
				for(var i=0;i<Page.notifications.length && i<User.unreadNotificationCount;i++){
					if(!Page.notifications[i].type){
						Page.notifications[i].type = "THREAD_SUBSCRIBED";
					};
					if(Page.notifications[i].user){
						names.push(Page.notifications[i].user.name);
					};
					if(!useScripts.notificationColours[Page.notifications[i].type].supress){
						types.push(Page.notifications[i].type);
					};
				};
				if(types.length){
					let notificationCake = create("canvas","hohNotificationCake");
					notificationCake.width = 120;
					notificationCake.height = 120;
					notificationCake.style.width = "30px";
					notificationCake.style.height = "30px";
					notificationDot.innerText = "";
					notificationDot.style.background = "none";
					notificationDot.style.width = "30px";
					notificationDot.style.height = "30px";
					notificationDot.style.borderRadius = "0";
					notificationDot.style.left = "5px";
					notificationDot.style.marginRight = "-3px";
					notificationDot.appendChild(notificationCake);
					let cakeCtx = notificationCake.getContext("2d");
					cakeCtx.fillStyle = "red";
					cakeCtx.textAlign = "center";
					cakeCtx.fontWeight = "500";
					cakeCtx.font = 50 + "px sans-serif";
					types.forEach(function(type,i){
						cakeCtx.fillStyle = useScripts.notificationColours[type].colour;
						cakeCtx.beginPath();
						cakeCtx.arc(
							60,60,
							40,
							Math.PI * (2*i/types.length - 0.5),
							Math.PI * (2*(i+1)/types.length - 0.5)
						);
						cakeCtx.lineTo(60,60);
						cakeCtx.closePath();
						cakeCtx.fill();
					});
					cakeCtx.fillStyle = "#fff2f2";
					cakeCtx.fillText(User.unreadNotificationCount,60,76);
					notificationCake.innerText = User.unreadNotificationCount;
					notificationCake.title = names.join("\n");
					let poller = function(){
						if(!document.querySelector(".hohNotificationCake")){
							try{
								notificationCake();
							}catch(err){};
						}
						else{
							setTimeout(poller,4000);
						};
					};poller();
					if(!document.querySelector(".hohDismiss") && useScripts.dismissDot){
						let dismisser = create("span","hohDismiss",".",notificationDot.parentNode);
						dismisser.onclick = function(){
							authAPIcall("query{Notification(resetNotificationCount:true){... on ActivityLikeNotification{id}}}",{},function(data){
								dismisser.previousSibling.style.display = "none";
								dismisser.style.display = "none";
							});
						};
					}
				}
				else{
					notificationDot.style.display = "none";
				};
			}
		);
	}
}

if(useScripts.accessToken && !useScripts.mobileFriendly){
	setInterval(notificationCake,4*1000);
};

function addActivityTimeline(){
	let URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w\-]*\/social/);
	if(!URLstuff){
		return;
	};
	if(document.getElementById("activityTimeline")){
		return;
	};
	if(!whoAmIid){
		generalAPIcall(
			"query($name:String){User(name:$name){id}}",
			{name: whoAmI},
			function(data){
				whoAmIid = data.data.User.id;
				addActivityTimeline();
			},
			"hohIDlookup" + whoAmI.toLowerCase()
		);
		return;
	};
	let followingLocation = document.querySelector(".following");
	if(!followingLocation){
		setTimeout(addActivityTimeline,200);
		return;
	};
	const status = document.querySelector(".actions .list .add").innerText;
	let activityTimeline = create("div","#activityTimeline",false,followingLocation.parentNode);
	let variables = {
		mediaId: URLstuff[2],
		userId: whoAmIid,
		page: 1
	};
	const query = `
query($userId: Int,$mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
		}
		activities(userId: $userId, mediaId: $mediaId, sort: ID){
			... on ListActivity{
				siteUrl
				createdAt
				status
				progress
				replyCount
			}
		}
	}
}`;
	let lineCaller = function(query,variables){
		generalAPIcall(query,variables,function(data){
			if(data.data.Page.pageInfo.currentPage === 1){
				removeChildren(activityTimeline)
				if(data.data.Page.activities.length){
					create("h2",false,"Activity Timeline",activityTimeline);
				}
			};
			data.data.Page.activities.forEach(function(activity){
				let activityEntry = create("div","hohTimelineEntry",false,activityTimeline);
				if(activity.replyCount){
					activityEntry.style.color = "rgb(var(--color-blue))";
				};
				let activityContext = create("a","newTab",capitalize(activity.status),activityEntry);
				activityContext.href = activity.siteUrl;
				if(["watched episode","read chapter","rewatched episode","reread chapter"].includes(activity.status)){
					activityContext.innerText += " " + activity.progress;
				};
				create("span",false,
					" " + (new Date(activity.createdAt*1000)).toDateString(),
					activityEntry,
					"position:absolute;right:7px;"
				);
			});
			if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage){
				variables.page++;
				lineCaller(query,variables);
			}
		},"hohMediaTimeline" + variables.mediaId + "u" + variables.userId + "p" + variables.page,120*1000);
	};
	if(status !== "Add To List"){
		lineCaller(query,variables);
	};
	let lookingElse = create("div",false,false,followingLocation.parentNode,"margin-top:30px;");
	create("div",false,"Looking for the activities of someone else? ",lookingElse);
	let lookingElseInput = create("input",false,false,lookingElse);
	lookingElseInput.placeholder = "User";
	lookingElseInput.setAttribute("list","socialUsers");
	let lookingElseButton= create("button",["button","hohButton"],"Search",lookingElse);
	let lookingElseError= create("span",false,"",lookingElse);
	lookingElseButton.onclick = function(){
		if(lookingElseInput.value){
			lookingElseError.innerText = "...";
			generalAPIcall(
				"query($name:String){User(name:$name){id}}",
				{name: lookingElseInput.value},
				function(data){
					if(!data){
						lookingElseError.innerText = "User not found";
						return;
					};
					lookingElseError.innerText = "";
					variables.userId = data.data.User.id;
					variables.page = 1;
					lineCaller(query,variables);
				},
				"hohIDlookup" + lookingElseInput.value.toLowerCase()
			);
		};
	}
}

function showMarkdown(id){
	if(!location.pathname.match(id)){
		return;
	}
	if(document.querySelector(".hohGetMarkdown")){
		return;
	}
	let timeContainer = document.querySelector(".activity-text .time,.activity-message .time");
	if(!timeContainer){
		setTimeout(function(){showMarkdown(id)},200);
		return;
	};
	let codeLink = create("span",["action","hohGetMarkdown"],"</>",false,"font-weight:bolder;");
	timeContainer.insertBefore(codeLink,timeContainer.firstChild);
	codeLink.onclick = function(){
		let activityMarkdown = document.querySelector(".activity-markdown");
		if(activityMarkdown.style.display === "none"){
			document.querySelector(".hohMarkdownSource").style.display = "none";
			activityMarkdown.style.display = "initial";
		}
		else{
			activityMarkdown.style.display = "none";
			let markdownSource = document.querySelector(".hohMarkdownSource");
			if(markdownSource){
				markdownSource.style.display = "initial";
			}
			else{
				generalAPIcall("query($id:Int){Activity(id:$id){...on MessageActivity{text:message}...on TextActivity{text}}}",{id:id},function(data){
					if(!location.pathname.match(id) || !data){
						return;
					};
					markdownSource = create("div",["activity-markdown","hohMarkdownSource"],data.data.Activity.text,activityMarkdown.parentNode);
				},"hohGetMarkdown" + id,20*1000);
			}
		}
	}
}

function addActivityLinks(activityID){
	let arrowCallback = function(data){
		let adder = function(link){
			if(!location.pathname.includes("/activity/" + activityID)){
				return;
			};
			let activityLocation = document.querySelector(".activity-entry");
			if(activityLocation){
				activityLocation.appendChild(link);
				return;
			}
			else{
				setTimeout(function(){adder(link)},200);
			}
		};
		let queryPrevious;
		let queryNext;
		let variables = {
			userId: data.data.Activity.userId || data.data.Activity.recipientId,
			createdAt: data.data.Activity.createdAt
		};
		if(data.data.Activity.type === "ANIME_LIST" || data.data.Activity.type === "MANGA_LIST"){
			variables.mediaId = data.data.Activity.media.id;
			queryPrevious = `
query ($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "TEXT"){
			queryPrevious = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "MESSAGE"){
			let link = create("a","hohPostLink","↑",false,"left:-25px;top:25px;");
			link.href = "/user/" + data.data.Activity.recipient.name + "/";
			link.title = data.data.Activity.recipient.name + "'s profile";
			adder(link);
			variables.messengerId = data.data.Activity.messengerId;
			queryPrevious = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
		}
		else{//unknown new types of activities
			return;
		};
		if(data.previous){
			if(data.previous !== "FIRST"){
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.href = data.previous;
				link.rel = "prev";
				link.title = "Previous activity";
				adder(link);
			}
		}
		else{
			data.previous = "FIRST";
			generalAPIcall(queryPrevious,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.title = "Previous activity";
				link.rel = "prev";
				link.href = pdata.data.Activity.siteUrl;
				adder(link);
				data.previous = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.next = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		}
		if(data.next){
			let link = create("a","hohPostLink","→",false,"right:-25px;");
			link.href = data.next;
			link.rel = "next";
			link.title = "Next activity";
			adder(link);
		}
		else{
			generalAPIcall(queryNext,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","→",false,"right:-25px;");
				link.href = pdata.data.Activity.siteUrl;
				link.rel = "next";
				link.title = "Next activity";
				adder(link);
				data.next = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.previous = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		};
		sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
	}
	let possibleCache = sessionStorage.getItem("hohActivity" + activityID);
	if(possibleCache){
		arrowCallback(JSON.parse(possibleCache));
	}
	else{
		generalAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on ListActivity{
			type
			userId
			createdAt
			media{id}
		}
		... on TextActivity{
			type
			userId
			createdAt
		}
		... on MessageActivity{
			type
			recipientId
			recipient{name}
			messengerId
			createdAt
		}
	}
}`,{id:activityID},arrowCallback);
	}
}

function addBrowseFilters(type){
	if(!location.pathname.match(/^\/search/)){
		return;
	};
	let sorts = document.querySelector(".hohAlready");
	if(!sorts){
		sorts = document.querySelector(".filter-group .el-select-dropdown .el-select-dropdown__list");
		if(!sorts){
			setTimeout(function(){addBrowseFilters(type)},200);
			return;
		};
		sorts.classList.add("hohAlready");
	};
	let alreadyAdded = document.querySelectorAll(".hohSorts");
	alreadyAdded.forEach(function(already){
		already.remove();
	});
	let URLredirect = function(property,value){
		let url = new URLSearchParams(location.search);
		url.set(property,value);
		window.location.href = location.protocol + "//" + location.host + location.pathname + "?" + url.toString();
	};
	if(type === "anime"){
		let episodeSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Episodes ↓",episodeSort);
		let episodeSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Episodes ↑",episodeSortb);
		for(var i=0;i<sorts.children.length;i++){
			sorts.children[i].onmouseover = function(){
				let currentHover = sorts.querySelector(".hover");
				if(currentHover){
					currentHover.classList.remove("hover");
				};
				this.classList.add("hover");
			};
		};
		episodeSort.onclick = function(){
			URLredirect("sort","EPISODES_DESC");
		};
		episodeSortb.onclick = function(){
			URLredirect("sort","EPISODES");
		};
	}
	else if(type === "manga"){
		let chapterSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Chapters ↓",chapterSort);
		let chapterSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Chapters ↑",chapterSortb);
		let volumeSort = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Volumes ↓",volumeSort);
		let volumeSortb = create("li",["el-select-dropdown__item","hohSorts"],false,sorts);
		create("span",false,"Volumes ↑",volumeSortb);
		for(var i=0;i<sorts.children.length;i++){
			sorts.children[i].onmouseover = function(){
				let currentHover = sorts.querySelector(".hover");
				if(currentHover){
					currentHover.classList.remove("hover");
				};
				this.classList.add("hover");
			};
		};
		chapterSort.onclick = function(){
			URLredirect("sort","CHAPTERS_DESC");
		};
		chapterSortb.onclick = function(){
			URLredirect("sort","CHAPTERS");
		};
		volumeSort.onclick = function(){
			URLredirect("sort","VOLUMES_DESC");
		};
		volumeSortb.onclick = function(){
			URLredirect("sort","VOLUMES");
		};
	};
}

function addComparissionPage(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/);
	if(!URLstuff){
		return;
	};
	let userA = decodeURIComponent(URLstuff[1]);
	let type = URLstuff[2];
	let compareLocation = document.querySelector(".compare");
	let nativeCompareExists = true;
	if(!compareLocation){
		nativeCompareExists = false;
		compareLocation = document.querySelector(".medialist");
		if(!compareLocation){
			setTimeout(addComparissionPage,200);
			return;
		};
	};
	if(document.querySelector(".hohCompare")){
		return;
	};
	compareLocation.style.display = "none";
	let compareArea = create("div","hohCompare",false,compareLocation.parentNode);
	if(nativeCompareExists){
		let switchButton = create("span",false,"Show default compare",compareLocation.parentNode,"position:absolute;top:0px;right:0px;cursor:pointer;z-index:100;");
		switchButton.onclick = function(){
			if(switchButton.innerText === "Show default compare"){
				switchButton.innerText ="Show hoh compare";
				compareLocation.style.display = "";
				compareArea.style.display = "none";
				switchButton.style.top = "-30px";
			}
			else{
				switchButton.innerText ="Show default compare";
				compareLocation.style.display = "none";
				compareArea.style.display = "";
				switchButton.style.top = "0px";
			}
		};
		compareLocation.parentNode.style.position = "relative";
	};
	let formatFilterLabel = create("span",false,"Filter:",compareArea);
	formatFilterLabel.style.padding = "5px";
	let formatFilter = create("select",false,false,compareArea);
	let addOption = function(value,text){
		let newOption = create("option",false,text,formatFilter);
		newOption.value = value;
	};
	addOption("all","All");
	if(type === "anime"){
		addOption("TV","TV");
		addOption("MOVIE","Movie");
		addOption("TV_SHORT","TV Short");
		addOption("OVA","OVA");
		addOption("ONA","ONA");
		addOption("SPECIAL","Special");
		addOption("MUSIC","Music");
	}
	else if(type === "manga"){
		addOption("MANGA","Manga");
		addOption("NOVEL","Novel");
		addOption("ONE_SHOT","One Shot");
	};
	let ratingFilterLabel = create("span",false,"Min. ratings:",compareArea);
	ratingFilterLabel.style.padding = "5px";
	let ratingFilter = create("input",false,false,compareArea,"width:45px;color:rgb(var(--color-text))");
	ratingFilter.type = "number";
	ratingFilter.value = 1;
	ratingFilter.min = 0;
	let systemFilterLabel = create("span",false,"Individual rating systems:",compareArea,"padding:5px;");
	let systemFilter = createCheckbox(compareArea);
	systemFilter.checked = false;
	let colourLabel = create("span",false,"Colour entire cell:",compareArea,"padding:5px;");
	let colourFilter = createCheckbox(compareArea);
	colourFilter.checked = false;			
	let tableContainer = create("table",false,false,compareArea);
	let table = create("tbody",false,false,tableContainer);
	let digestSelect = {value:"average"};//placeholder
	let shows = [];//the stuff we are displaying in the table
	let users = [];
	let listCache = {};//storing raw anime data
	let ratingMode = "average";let guser = 0;let inverse = false;
	let csvButton = create("button",["csvExport","button","hohButton"],"CSV data",compareLocation.parentNode,"margin-top:10px;");
	let jsonButton = create("button",["jsonExport","button","hohButton"],"JSON data",compareLocation.parentNode,"margin-top:10px;");
	csvButton.onclick = function(){
		let csvContent = "Title," + digestSelect.selectedOptions[0].text + "," + users.map(user => user.name).join(",") + "\n";
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			csvContent += csvEscape(show.title) + "," + show.digest + "," + show.score.join(",") + "\n";
		});
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".csv";
		saveAs(csvContent,filename,true);
	};
	jsonButton.onclick = function(){
		let jsonData = {
			users: users,
			formatFilter: formatFilter.value,
			digestValue: digestSelect.value,
			type: capitalize(type),
			version: "1.00",
			scriptInfo: scriptInfo,
			url: document.URL,
			timeStamp: NOW(),
			media: shows
		}
		let filename = capitalize(type) + " table";
		if(users.length === 1){
			filename += " for " + users[0].name;
		}
		else if(users.length === 2){
			filename += " for " + users[0].name + " and " + users[1].name;
		}
		else if(users.length > 2){
			filename += " for " + users[0].name + ", " + users[1].name + " and others";
		}
		filename += ".json";
		saveAs(jsonData,filename);
	}
	let sortShows = function(){
		let averageCalc = function(scoreArray,weight){
			let sum = 0;
			let dividents = 0;
			scoreArray.forEach(function(score){
				if(score){
					sum += score;
					dividents++;
				};
			});
			return {
				average: ((dividents + (weight || 0)) ? (sum/(dividents + (weight || 0))) : 0),
				dividents: dividents
			};
		};
		let sortingModes = {
			"average": function(show){
				show.digest = averageCalc(show.score).average;
			},
			"average0": function(show){
				show.digest = averageCalc(show.score,1).average;
			},
			"standardDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.pow(score - average.average,2);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"absoluteDeviation": function(show){
				let average = averageCalc(show.score);
				let variance = 0;
				show.digest = 0;
				if(average.dividents){
					show.score.forEach(function(score){
						if(score){
							variance += Math.abs(score - average.average);
						};
					});
					variance = variance/average.dividents;
					show.digest = Math.sqrt(variance);
				};
			},
			"max": function(show){
				show.digest = Math.max(...show.score);
			},
			"min": function(show){
				show.digest = Math.min(...show.score.filter(TRUTHY)) || 0;
			},
			"difference": function(show){
				let mini = Math.min(...show.score.filter(TRUTHY)) || 0;
				let maks = Math.max(...show.score);
				show.digest = maks - mini;
			},
			"ratings": function(show){
				show.digest = show.score.filter(TRUTHY).length;
			},
			"planned": function(show){
				show.digest = show.status.filter(value => value === "PLANNING").length;
			},
			"current": function(show){
				show.digest = show.status.filter(value => (value === "CURRENT" || value === "REPEATING")).length;
			},
			"favourites": function(show){
				show.digest = show.favourite.filter(TRUTHY).length;
			},
			"median": function(show){
				let newScores = show.score.filter(TRUTHY);
				if(newScores.length === 0){
					show.digest = 0;
				}
				else{
					show.digest = Stats.median(newScores);
				};
			},
			"popularity": function(show){
				show.digest = show.popularity;
			},
			"averageScore": function(show){
				show.digest = show.averageScore;
			},
			"averageScoreDiff": function(show){
				if(!show.averageScore){
					show.digest = 0;
					return;
				};
				show.digest = averageCalc(show.score).average - show.averageScore;
			}
		};
		if(ratingMode === "user"){
			shows.sort(
				(a,b) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "userInverse"){
			shows.sort(
				(b,a) => b.score[guser] - a.score[guser]
			)
		}
		else if(ratingMode === "title"){
			shows.sort(ALPHABETICAL(a => a.title))
		}
		else if(ratingMode === "titleInverse"){
			shows = shows.sort(ALPHABETICAL(a => a.title)).reverse()
		}
		else{
			shows.forEach(sortingModes[ratingMode]);
			if(inverse){
				shows.sort((b,a) => b.digest - a.digest)
			}
			else{
				shows.sort((a,b) => b.digest - a.digest)
			}
		}
	};
	let drawTable = function(){
		while(table.childElementCount > 2){
			table.lastChild.remove()
		};
		let columnAmounts = [];
		users.forEach(function(element){
			columnAmounts.push({sum:0,amount:0});
		})
		shows.forEach(function(show){
			let display = users.every(function(user,index){
				if(user.demand === 1 && show.score[index] === 0){
					return false;
				}
				else if(user.demand === -1 && show.score[index] !== 0){
					return false;
				};
				return (!user.status || show.status[index] === user.status);
			});
			if(formatFilter.value !== "all"){
				if(formatFilter.value !== show.format){
					display = false;
				};
			};
			if(show.numberWatched < ratingFilter.value){
				display = false;
			};
			if(!display){
				return;
			};
			let row = create("tr","hohAnimeTable");
			row.onclick = function(){
				if(this.style.background === "rgb(var(--color-blue),0.5)"){
					this.style.background = "unset";
				}
				else{
					this.style.background = "rgb(var(--color-blue),0.5)";
				}
			}
			let showID = create("td",false,false,false,"max-width:250px;");
			create("a","newTab",show.title,showID)
				.href = "/" + type + "/" + show.id + "/" + safeURL(show.title);
			let showAverage = create("td");
			if(show.digest){
				let fractional = show.digest % 1;
				showAverage.innerText = show.digest.roundPlaces(3);
				[
					{s:"½",v:1/2},
					{s:"⅓",v:1/3},
					{s:"¼",v:1/4},
					{s:"¾",v:3/4},
					{s:"⅔",v:2/3},
					{s:"⅙",v:1/6},
					{s:"⅚",v:5/6},
					{s:"⅐",v:1/7}
				].find(symbol => {
					if(Math.abs(fractional - symbol.v) < 0.0001){
						showAverage.innerText = Math.floor(show.digest) + " " + symbol.s;
						return true;
					}
					return false;
				});
			};
			row.appendChild(showID);
			row.appendChild(showAverage);
			for(var i=0;i<show.score.length;i++){
				let showUserScore = create("td",false,false,row);
				if(show.score[i]){
					if(systemFilter.checked){
						showUserScore.innerHTML = scoreFormatter(show.scorePersonal[i],users[i].system,users[i].name);
					}
					else{
						showUserScore.innerText = show.score[i];
					};
					columnAmounts[i].sum += show.score[i];
					columnAmounts[i].amount++;
				}
				else{
					if(show.status[i] === "NOT"){
						showUserScore.innerText = " ";
					}
					else{
						showUserScore.innerText = "–";//n-dash
					};
				};
				if(show.status[i] !== "NOT"){
					if(colourFilter.checked){
						showUserScore.style.backgroundImage = "linear-gradient(to right,rgb(0,0,0,0)," + distributionColours[show.status[i]] + ")";
					}
					else{
						let statusDot = create("div","hohStatusDot",false,showUserScore);
						statusDot.style.background = distributionColours[show.status[i]];
						statusDot.title = show.status[i].toLowerCase();
					};
				};
				if(show.progress[i]){
					create("span","hohStatusProgress",show.progress[i],showUserScore);
				};
				if(show.favourite[i]){
					let favStar = create("span",false,false,showUserScore,"color:gold;font-size:1rem;vertical-align:middle;padding-bottom:2px;");
					favStar.innerHTML = svgAssets.star;
				};
			};
			table.appendChild(row);
		});
		if(columnAmounts.some(amount => amount.amount > 0)){
			let lastRow = create("tr",false,false,table);
			create("td",false,false,lastRow);
			create("td",false,false,lastRow);
			columnAmounts.forEach(amount => {
				let averageCel = create("td",false,"–",lastRow);
				if(amount.amount){
					averageCel.innerText = (amount.sum/amount.amount).roundPlaces(2);
				}
			})
		}
	};
	let changeUserURL = function(){
		const baseState = location.protocol + "//" + location.host + location.pathname;
		let params = "";
		if(users.length){
			params += "&users=" + users.map(user => user.name + (user.demand ? (user.demand === -1 ? "-" : "*") : "")).join(",");
		}
		if(formatFilter.value !== "all"){
			params += "&filter=" + encodeURIComponent(formatFilter.value);
		};
		if(ratingFilter.value !== 1){
			params += "&minRatings=" + encodeURIComponent(ratingFilter.value);
		};
		if(systemFilter.checked){
			params += "&ratingSystems=true";
		};
		if(colourFilter.checked){;
			params += "&fullColour=true";
		};
		if(ratingMode !== "average"){;
			params += "&sort=" + ratingMode;
		};
		if(params.length){
			params = "?" + params.substring(1);
		}
		current = baseState + params;
		history.replaceState({},"",baseState + params);
	};
	let drawUsers = function(){
		removeChildren(table)
		let userRow = create("tr");
		let resetCel = create("td",false,false,userRow);
		let resetButton = create("button",["hohButton","button"],"Reset",resetCel,"margin-top:0px;");
		resetButton.onclick = function(){
			users = [];
			shows = [];
			drawUsers();
			changeUserURL();
		};
		let digestCel = create("td");
		digestSelect = create("select");
		let addOption = (value,text) => {
			create("option",false,text,digestSelect)
				.value = value;
		};
		addOption("average","Average");
		addOption("median","Median");
		addOption("average0","Average~0");
		addOption("min","Minimum");
		addOption("max","Maximum");
		addOption("difference","Difference");
		addOption("standardDeviation","Std. Deviation");
		addOption("absoluteDeviation","Abs. Deviation");
		addOption("ratings","#Ratings");
		addOption("planned","#Planning");
		addOption("current","#Current");
		addOption("favourites","#Favourites");
		addOption("popularity","$Popularity");
		addOption("averageScore","$Score");
		addOption("averageScoreDiff","$Score diff.");
		if(["title","titleInverse","user","userInverse"].includes(ratingMode)){
			digestSelect.value = ratingMode;
		};
		digestSelect.oninput = function(){
			ratingMode = digestSelect.value;
			sortShows();
			drawTable();
			changeUserURL();
		};
		digestCel.appendChild(digestSelect);
		userRow.appendChild(digestCel);
		users.forEach(function(user,index){
			let userCel = create("td",false,false,userRow);
			let avatar = create("img",false,false,userCel);
			avatar.src = listCache[user.name].data.MediaListCollection.user.avatar.medium;
			let name = create("span",false,user.name,userCel);
			name.style.padding = "8px";
			let remove = create("span","hohAnimeTableRemove","✕",userCel);
			remove.onclick = function(){
				deleteUser(index)
			}
		});
		let addCel = create("td");
		let addInput = create("input",false,false,addCel);
		let addButton = create("button",["button","hohButton"],"Add",addCel,"margin-top:0px;");
		addButton.style.cursor = "pointer";
		addButton.onclick = function(){
			if(addInput.value !== ""){
				addUser(addInput.value);
				addButton.innerText = "...";
				addButton.disabled = true;
				addInput.readOnly = true;
			}
		};
		userRow.appendChild(addCel);
		let headerRow = create("tr");
		let typeCel = create("th");
		let downArrowa = create("span","hohArrowSort","▼",typeCel);
		downArrowa.onclick = function(){
			ratingMode = "title";
			sortShows();
			drawTable();
		};
		let typeCelLabel = create("span",false,capitalize(type),typeCel);
		let upArrowa = create("span","hohArrowSort","▲",typeCel);
		upArrowa.onclick = function(){
			ratingMode = "titleInverse";
			sortShows();
			drawTable();
		};
		headerRow.appendChild(typeCel);
		let digestSortCel = create("td");
		digestSortCel.style.textAlign = "center";
		let downArrow = create("span","hohArrowSort","▼",digestSortCel);
		downArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = false;
			sortShows(digestSelect.value);
			drawTable();
		};
		let upArrow = create("span","hohArrowSort","▲",digestSortCel);
		upArrow.onclick = function(){
			ratingMode = digestSelect.value;
			inverse = true;
			sortShows();
			drawTable();
		};
		headerRow.appendChild(digestSortCel);
		users.forEach(function(user,index){
			let userCel = create("td");
			userCel.style.textAlign = "center";
			userCel.style.position = "relative";
			let filter = create("span");
			if(user.demand === 0){
				filter.innerText = "☵"
			}
			else if(user.demand === 1){
				filter.innerText = "✓";
				filter.style.color = "green";
			}
			else{
				filter.innerText = "✕";
				filter.style.color = "red";
			};
			filter.classList.add("hohFilterSort");
			filter.onclick = function(){
				if(filter.innerText === "☵"){
					filter.innerText = "✓";
					filter.style.color = "green";
					user.demand = 1;
				}
				else if(filter.innerText === "✓"){
					filter.innerText = "✕";
					filter.style.color = "red";
					user.demand = -1;
				}
				else{
					filter.innerText = "☵";
					filter.style.color = "";
					user.demand = 0;
				};
				drawTable();
				changeUserURL();
			};
			let downArrow = create("span","hohArrowSort","▼");
			downArrow.onclick = function(){
				ratingMode = "user";
				guser = index;
				sortShows();
				drawTable();
			};
			let upArrow = create("span","hohArrowSort","▲");
			upArrow.onclick = function(){
				ratingMode = "userInverse";
				guser = index;
				sortShows();
				drawTable();
			};
			let statusFilterDot = create("div","hohStatusDot");
			const stati = ["COMPLETED","CURRENT","PLANNING","PAUSED","DROPPED","REPEATING","NOT"];
			statusFilterDot.onclick = function(){
				if(user.status === "NOT"){
					user.status = false;
					statusFilterDot.style.background = "rgb(var(--color-background))";
					statusFilterDot.title = "all";
				}
				else if(user.status === "REPEATING"){
					user.status = "NOT";
					statusFilterDot.style.background = `center / contain no-repeat url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 10 10"><line stroke="red" x1="0" y1="0" x2="10" y2="10"/><line x1="0" y1="10" x2="10" y2="0" stroke="red"/></svg>')`;
					statusFilterDot.title = "no status";
				}
				else if(user.status === false){
					user.status = "COMPLETED";
					statusFilterDot.style.background = distributionColours["COMPLETED"];
					statusFilterDot.title = "completed";
				}
				else{
					user.status = stati[stati.indexOf(user.status) + 1];
					statusFilterDot.style.background = distributionColours[user.status];
					statusFilterDot.title = user.status.toLowerCase();
				};
				drawTable();
			};
			userCel.appendChild(downArrow);
			userCel.appendChild(filter);
			userCel.appendChild(upArrow);
			userCel.appendChild(statusFilterDot);
			headerRow.appendChild(userCel);
		});
		userRow.classList.add("hohUserRow");
		headerRow.classList.add("hohHeaderRow");
		table.appendChild(userRow);
		table.appendChild(headerRow);
	};
	let addUser = function(userName,paramDemand){
		let handleData = function(data,cached){
			users.push({
				name: userName,
				demand: (paramDemand ? (paramDemand === "-" ? -1 : 1) : 0),
				system: data.data.MediaListCollection.user.mediaListOptions.scoreFormat,
				status: false
			});
			let list = returnList(data,true);
			if(!cached){
				list.forEach(function(alia){
					alia.media.id = alia.mediaId;
					alia.media.title = titlePicker(alia.media);
					alia.scoreRaw = convertScore(alia.score,data.data.MediaListCollection.user.mediaListOptions.scoreFormat);
				})
			};
			shows.sort(function(a,b){return a.id - b.id;});
			let listPointer = 0;
			let userIndeks = 0;
			if(shows.length){
				userIndeks = shows[0].score.length
			};
			let favs = data.data.MediaListCollection.user.favourites.fav.nodes.concat(
				data.data.MediaListCollection.user.favourites.fav2.nodes
			).concat(
				data.data.MediaListCollection.user.favourites.fav3.nodes
			).map(media => media.id);
			let createEntry = function(mediaEntry){
				let entry = {
					id: mediaEntry.mediaId,
					average: mediaEntry.scoreRaw,
					title: mediaEntry.media.title,
					format: mediaEntry.media.format,
					score: Array(userIndeks).fill(0),
					scorePersonal: Array(userIndeks).fill(0),
					status: Array(userIndeks).fill("NOT"),
					progress: Array(userIndeks).fill(false),
					numberWatched: mediaEntry.scoreRaw ? 1 : 0,
					favourite: Array(userIndeks).fill(false),
					averageScore: mediaEntry.media.averageScore,
					popularity: mediaEntry.media.popularity
				};
				entry.score.push(mediaEntry.scoreRaw);
				entry.scorePersonal.push(mediaEntry.score);
				entry.status.push(mediaEntry.status);
				if(mediaEntry.status !== "PLANNING" && mediaEntry.status !== "COMPLETED"){
					entry.progress.push(mediaEntry.progress + "/" + (mediaEntry.media.chapters || mediaEntry.media.episodes || ""))
				}
				else{
					entry.progress.push(false)
				}
				entry.favourite.push(favs.includes(entry.id));
				return entry;
			};
			shows.forEach(function(show){
				show.score.push(0);
				show.scorePersonal.push(0);
				show.status.push("NOT");
				show.progress.push(false);
				show.favourite.push(false);
			});
			for(var i=0;i<shows.length && listPointer < list.length;i++){
				if(shows[i].id < list[listPointer].mediaId){
					continue;
				}
				else if(shows[i].id === list[listPointer].mediaId){
					shows[i].score[userIndeks] = list[listPointer].scoreRaw;
					shows[i].scorePersonal[userIndeks] = list[listPointer].score;
					shows[i].status[userIndeks] = list[listPointer].status;
					if(list[listPointer].scoreRaw){
						shows[i].numberWatched++
					};
					if(list[listPointer].status !== "PLANNING" && list[listPointer].status !== "COMPLETED"){
						shows[i].progress[userIndeks] = list[listPointer].progress + "/" + (list[listPointer].media.chapters || list[listPointer].media.episodes || "");
					}
					else{
						shows[i].progress[userIndeks] = false
					};
					shows[i].favourite[userIndeks] = favs.includes(shows[i].id);
					listPointer++;
				}
				else{
					shows.splice(i,0,createEntry(list[listPointer]));
					listPointer++;
				};
			};
			for(;listPointer < list.length;listPointer++){
				shows.push(createEntry(list[listPointer]));
			};
			sortShows();
			drawUsers();
			drawTable();
			changeUserURL();
		};
		if(listCache.hasOwnProperty(userName)){
			handleData(listCache[userName],true)
		}
		else{
			generalAPIcall(
`query($name: String, $listType: MediaType){
	MediaListCollection(userName: $name, type: $listType){
		lists{
			entries{
			... mediaListEntry
			}
		}
		user{
			id
			name
			avatar{medium}
			mediaListOptions{scoreFormat}
			favourites{
				fav:${type.toLowerCase()}(page:1){
					nodes{
						id
					}
				}
				fav2:${type.toLowerCase()}(page:2){
					nodes{
						id
					}
				}
				fav3:${type.toLowerCase()}(page:3){
					nodes{
						id
					}
				}
			}
		}
	}
}

fragment mediaListEntry on MediaList{
	mediaId
	status
	progress
	score
	media{
		episodes
		chapters
		format
		title{romaji native english}
		averageScore
		popularity
	}
}`,
				{name:userName,listType:type.toUpperCase()},
				function(data){
					listCache[userName] = data;
					handleData(data,false);
				}
			);
		};
	};
	let deleteUser = function(index){
		users.splice(index,1);
		shows.forEach(function(show){
			show.score.splice(index,1);
			show.scorePersonal.splice(index,1);
			show.status.splice(index,1);
			show.progress.splice(index,1);
			show.favourite.splice(index,1);
		});
		shows = shows.filter(function(show){
			return !show.status.every(status => status === "NOT")
		});
		if(guser === index){
			guser = false
		}
		else if(guser > index){
			guser--
		};
		sortShows();
		drawUsers();
		drawTable();
		changeUserURL();
	};
	formatFilter.oninput = function(){drawTable();changeUserURL()};
	ratingFilter.oninput = function(){drawTable();changeUserURL()};
	systemFilter.onclick = function(){drawTable();changeUserURL()};
	colourFilter.onclick = function(){drawTable();changeUserURL()};
	let searchParams = new URLSearchParams(location.search);
	let paramFormat = searchParams.get("filter");
	if(paramFormat){
		formatFilter.value = paramFormat
	};
	let paramRating = searchParams.get("minRatings");
	if(paramRating){
		ratingFilter.value = paramRating
	};
	let paramSystem = searchParams.get("ratingSystems");
	if(paramSystem){
		systemFilter.checked = (paramSystem === "true")
	};
	let paramColour = searchParams.get("fullColour");
	if(paramColour){
		colourFilter.checked = (paramColour === "true")
	};
	let paramSort = searchParams.get("sort");
	if(paramSort){
		ratingMode = paramSort
	};
	let paramUsers = searchParams.get("users");
	if(paramUsers){
		paramUsers.split(",").forEach(user => {
			let paramDemand = user.match(/(\*|\-)$/);
			if(paramDemand){
				paramDemand = paramDemand[0]
			}
			user = user.replace(/(\*|\-)$/,"");
			if(user === "~"){
				addUser(whoAmI,paramDemand)
			}
			else{
				addUser(user,paramDemand)
			}
		})
	}
	else{
		addUser(whoAmI);
		addUser(userA);
	}
}

function addFollowCount(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} followers(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",false,followCount,target.children[2],"position:absolute;right:3px;");
			}
		});
		//these two must be separate calls, because they are allowed to fail individually (too many followers)
		generalAPIcall("query($id:Int!){Page(perPage:1){pageInfo{total} following(userId:$id){id}}}",{id:data.data.User.id},function(data){
			let target = document.querySelector(".filter-group");
			if(target){
				target.style.position = "relative";
				let followCount = "65536+";
				if(data){
					followCount = data.data.Page.pageInfo.total
				};
				create("span",false,followCount,target.children[1],"position:absolute;right:3px;");
			}
		});
	},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
}

function embedHentai(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(home|user|forum|activity)/)){
		return
	};
	if(useScripts.SFWmode){//saved you there
		return
	};
	setTimeout(embedHentai,1000);
	let mediaEmbeds = document.querySelectorAll(".media-embed");
	let bigQuery = [];//collects all on a page first so we only have to send 1 API query.
	mediaEmbeds.forEach(function(embed){
		if(embed.children.length === 0 && !embed.classList.contains("hohMediaEmbed")){//if( "not-rendered-natively" && "not-rendered-by-this sript" )
			embed.classList.add("hohMediaEmbed");
			let createEmbed = function(data){
				if(!data){
					return
				};
				embed.innerText = "";
				let eContainer = create("div",false,false,embed);
				let eEmbed = create("div","embed",false,eContainer);
				let eCover = create("div","cover",false,eEmbed);
				eCover.style.backgroundImage = "url(" + data.data.Media.coverImage.large + ")";
				let eWrap = create("div","wrap",false,eEmbed);
				let mediaTitle = titlePicker(data.data.Media);
				let eTitle = create("div","title",mediaTitle,eWrap);
				let eInfo = create("div","info",false,eWrap);
				let eGenres = create("div","genres",false,eInfo);
				data.data.Media.genres.forEach((genre,index) => {
					let eGenre = create("span",false,genre,eGenres);
					let comma = create("span",false,", ",eGenre);
					if(index === data.data.Media.genres.length - 1){
						comma.style.display = "none"
					}
				});
				create("span",false,distributionFormats[data.data.Media.format],eInfo);
				create("span",false," · " + distributionStatus[data.data.Media.status],eInfo);
				if(data.data.Media.season){
					create("span",false,
						" · " + capitalize(data.data.Media.season.toLowerCase()) + " " + data.data.Media.startDate.year,
						eInfo
					)
				}
				else if(data.data.Media.startDate.year){
					create("span",false,
						" · " + data.data.Media.startDate.year,
						eInfo
					)
				}
				if(data.data.Media.averageScore){
					create("span",false," · " + data.data.Media.averageScore + "%",eInfo)
				}
				else if(data.data.Media.meanScore){//fallback if it's not popular enough, better than nothing
					create("span",false," · " + data.data.Media.meanScore + "%",eInfo)
				}
			}
			bigQuery.push({
				query: "query($mediaId:Int,$type:MediaType){Media(id:$mediaId,type:$type){id title{romaji native english} coverImage{large} genres format status season meanScore averageScore startDate{year}}}",
				variables: {
					mediaId: +embed.dataset.mediaId,
					type: embed.dataset.mediaType.toUpperCase()
				},
				callback: createEmbed,
				cacheKey: "hohMedia" + embed.dataset.mediaId
			})
		};
	});
	queryPacker(bigQuery);
}

function addForumMedia(){
	if(location.pathname !== "/home"){
		return
	}
	let forumThreads = Array.from(document.querySelectorAll(".home .forum-wrap .thread-card .category"));
	if(!forumThreads.length){
		setTimeout(addForumMedia,200);
		return;
	};
	if(forumThreads.some(
		thread => thread && ["anime","manga"].includes(thread.innerText.toLowerCase())
	)){
		generalAPIcall("query{Page(perPage:3){threads(sort:REPLIED_AT_DESC){title mediaCategories{id title{romaji native english}}}}}",{},function(data){
			if(location.pathname !== "/home"){
				return
			}
			data.data.Page.threads.forEach((thread,index) => {
				if(thread.mediaCategories.length && ["anime","manga"].includes(forumThreads[index].innerText.toLowerCase())){
					let title = titlePicker(thread.mediaCategories[0]);
					if(title.length > 40){
						forumThreads[index].title = title;
						title = title.slice(0,35) + "…";
					};
					forumThreads[index].innerText = title;
				}
			})
		})
	}
}

function addForumMediaNoAWC(){
	if(location.pathname !== "/home"){
		return
	};
	let buildPreview = function(data){
		if(location.pathname !== "/home"){
			return
		}
		let forumPreview = document.querySelector(".recent-threads .forum-wrap");
		if(!(forumPreview && forumPreview.childElementCount)){
			setTimeout(function(){buildPreview(data)},400);
			return;
		};
		forumPreview.classList.add("hohNoAWC");
		removeChildren(forumPreview)
		data.data.Page.threads.filter(
			thread => !thread.title.match(/^(AWC|Anime\sWatching\s(Challenge|Club)|MRC)/)
		).slice(0,parseInt(useScripts.forumPreviewNumber)).forEach(thread => {
			let card = create("div",["thread-card","small"],false,forumPreview);
			create("a","title",thread.title,card).href = "/forum/thread/" + thread.id;
			let footer = create("div","footer",false,card);
			let avatar = create("a","avatar",false,footer);
			avatar.href = "/user/" + (thread.replyUser || thread.user).name;
			avatar.style.backgroundImage = "url(\"" + (thread.replyUser || thread.user).avatar.large + "\")";
			let name = create("div","name",false,footer);
			if(thread.replyCount === 0){
				let contextText = create("a",false,"By",name);
				name.appendChild(document.createTextNode(" "));
				let nameWrap = create("a",false,false,name);
				nameWrap.href = thread.replyUser.name;
				contextText.href = "/forum/thread/" + thread.id + "/comment/" + thread.replyCommentId;
				let nameInner = create("span",false,thread.replyUser.name,nameWrap);
			}
			else if(!thread.replyUser){
				let contextText = create("a",false,"By",name);
				name.appendChild(document.createTextNode(" "));
				let nameWrap = create("a",false,false,name);
				nameWrap.href = "/user/" + thread.user.name;
				contextText.href = "/forum/thread/" + thread.id;
				let nameInner = create("span",false,thread.user.name,nameWrap);
			}
			else{
				let nameWrap = create("a",false,false,name);
				nameWrap.href = "/user/" + thread.replyUser.name;
				let nameInner = create("span",false,thread.replyUser.name,nameWrap);
				name.appendChild(document.createTextNode(" "));
				let contextText = create("a",false,"replied ",name);
				contextText.href = "/forum/thread/" + thread.id + "/comment/" + thread.replyCommentId;
				contextText.appendChild(nativeTimeElement(thread.repliedAt));
			};
			let categories = create("div","categories",false,footer);
			if(thread.mediaCategories.length === 0){
				if(thread.categories.length){
					let catWrap = create("span",false,false,categories);
					let category = create("a","category",thread.categories[0].name,catWrap);
					category.href = "/forum/recent?category=" + thread.categories[0].id;
					category.style.background = (categoryColours.get(thread.categories[0].id) || "rgb(78, 163, 230)") + " none repeat scroll 0% 0%";
				}
			}
			else{
				let mediaTitle = titlePicker(thread.mediaCategories[0]);
				if(mediaTitle.length > 25){
					let lastIndex = mediaTitle.slice(0,25).lastIndexOf(" ");
					if(lastIndex > 20){
						mediaTitle.slice(0,lastIndex);
					}
					else{
						mediaTitle = mediaTitle.slice(0,20)
					}
				}
				let catWrap;
				if(thread.categories.length && thread.categories[0].id !== 1 && thread.categories[0].id !== 2){
					catWrap = create("span",false,false,categories);
					let category = create("a","category",thread.categories[0].name,catWrap);
					category.href = "/forum/recent?category=" + thread.categories[0].id;
					category.style.background = (categoryColours.get(thread.categories[0].id) || "rgb(78, 163, 230)") + " none repeat scroll 0% 0%";
				}
				catWrap = create("span",false,false,categories);
				let mediaCategory = create("a","category",mediaTitle,catWrap);
				mediaCategory.href = "/forum/recent?media=" + thread.mediaCategories[0].id;
				mediaCategory.style.background = (thread.mediaCategories[0].type === "ANIME" ? "rgb(var(--color-blue))" : "rgb(var(--color-green))") + " none repeat scroll 0% 0%";
			}
			let info = create("div","info",false,footer);
			let viewCount = create("span",false,false,info);
			viewCount.innerHTML = svgAssets.eye + " " + thread.viewCount;
			if(!thread.replyUser){
				thread.replyCount--;
			}
			if(thread.replyCount){
				info.appendChild(document.createTextNode(" "));
				let replyCount = create("span",false,false,info);
				replyCount.innerHTML = svgAssets.reply + " " + thread.replyCount;
			}
		})
	};
	if(useScripts.forumPreviewNumber > 0){
		generalAPIcall(
			`query{
				Page(perPage:${parseInt(useScripts.forumPreviewNumber) + 12},page:1){
					threads(sort:REPLIED_AT_DESC){
						id
						viewCount
						replyCount
						title
						repliedAt
						replyCommentId
						user{
							name
							avatar{large}
						}
						replyUser{
							name
							avatar{large}
						}
						categories{
							id
							name
						}
						mediaCategories{
							id
							type
							title{romaji native english}
						}
					}
				}
			}`,
			{},
			buildPreview
		)
	}
}

function addImageFallback(){
	if(!document.URL.match(/(\/home|\/user\/)/)){
		return
	}
	setTimeout(addImageFallback,1000);
	let mediaImages = document.querySelectorAll(".media-preview-card:not(.hohFallback) .content .title");
	mediaImages.forEach(cover => {
		cover.parentNode.parentNode.classList.add("hohFallback");
		if(cover.parentNode.parentNode.querySelector(".hohFallback")){
			return
		};
		let fallback = create("span","hohFallback",cover.textContent,cover.parentNode.parentNode);
		if(useScripts.titleLanguage === "ROMAJI"){
			fallback.innerHTML = cover.textContent.replace(/\S{3}(a|\(|☆|\-|e|i|ou|(o|u)(?!u|\s)|n(?!a|e|i|o|u))(?![a-z]($|[^a-z]))/gi,m => m + "<wbr>");
			/*	create word break opportunities for 'break-word' in nice places in romaji
				- after vowels, or 'ou' or 'uu'. Those pairs should not be broken
				- If there's a 'n' from 'ん', the break opportunity should be delayed to after it.
				- 'ん' is determined by 'n' not followed by a vowel. This doesn't work in cases of '[...]んお[...]' vs '[...]の[...]', but that's a shortcomming of romaji
				- don't break early in words, that just looks awkward. just before the last character also looks weird.
				- don't break off punctuation or numbers at the end of words*/
		}
	})
}

function linkFixer(){
	if(location.pathname !== "/home"){
		return
	}
	let recentReviews = document.querySelector(".recent-reviews h2.section-header");
	let recentThreads = document.querySelector(".recent-threads h2.section-header");
	if(recentReviews && recentThreads){
		recentReviews.innerText = "";
		create("a",false,"Recent Reviews",recentReviews)
			.href = "/reviews";
		recentThreads.innerText = "";
		create("a",false,"Forum Activity",recentThreads)
			.href = "/forum/overview";
	}
	else{
		setTimeout(linkFixer,2000)//invisible change, does not take priority
	}
}

function addReviewConfidence(){
	generalAPIcall("query{Page(page:1,perPage:30){reviews(sort:ID_DESC){id rating ratingAmount}}}",{},function(data){
		let adder = function(){
			if(location.pathname !== "/reviews"){
				return
			}
			let locationForIt = document.querySelector(".recent-reviews .review-wrap");
			if(!locationForIt){
				setTimeout(adder,200);
				return;
			}
			data.data.Page.reviews.forEach((review,index) => {
				let wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
				let extraScore = create("span",false,"~" + Math.round(100*wilsonLowerBound));
				extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
				extraScore.style.marginRight = "3px";
				let parent = locationForIt.children[index].querySelector(".votes");
				parent.insertBefore(extraScore,parent.firstChild);
				if(wilsonLowerBound < 0.05){
					locationForIt.children[index].style.opacity = "0.5"
				}
			})
		};adder();
	},"hohRecentReviews",30*1000);
}

function addRelationStatusDot(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return;
	};
	let relations = document.querySelector(".relations");
	if(relations){
		if(relations.classList.contains("hohRelationStatusDots")){
			return
		};
		relations.classList.add("hohRelationStatusDots");
	};
	authAPIcall(
`query($id: Int){
	Media(id:$id){
		relations{
			nodes{
				id
				type
				mediaListEntry{status}
			}
		}
		recommendations(sort:RATING_DESC){
			nodes{
				mediaRecommendation{
					id
					type
					mediaListEntry{status}
				}
			}
		}
	}
}`,
		{id: id},
		function(data){
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations){
						relations.classList.add("hohRelationStatusDots");
						relations.querySelectorAll(".hohStatusDot").forEach(dot => dot.remove());
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300);
					}
				}
			};adder();
			let recsAdder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				};
				let recs = data.data.Media.recommendations.nodes.map(
					item => item.mediaRecommendation
				).filter(
					item => item.mediaListEntry
				);
				if(recs.length){
					let findCard = document.querySelector(".recommendation-card");
					if(findCard){
						findCard = findCard.parentNode;
						let adder = function(){
							findCard.querySelectorAll(".hohStatusDot").forEach(
								dot => dot.remove()
							);
							recs.forEach(media => {
								let target = findCard.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
								if(target){
									let statusDot = create("div","hohStatusDot",false,target);
									statusDot.style.background = distributionColours[media.mediaListEntry.status];
									statusDot.title = media.mediaListEntry.status.toLowerCase();
								}
							});
						};adder();
						let toggle = findCard.parentNode.querySelector(".view-all .toggle");
						if(toggle){
							toggle.addEventListener("click",function(){
								setTimeout(adder,1000)
							})
						}
					}
					else{
						setTimeout(recsAdder,300)
					}
				}
			};recsAdder();
		},
		"hohRelationStatusDot" + id,2*60*1000,
		false,false,
		function(data){
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations && !relations.classList.contains("hohRelationStatusDots")){
						relations.classList.add("hohRelationStatusDots");
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300)
					}
				}
			};adder();
		}
	)
}

function selectMyThreads(){
	if(document.URL !== "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		return
	}
	let target = document.querySelector(".filter-group span:nth-child(4)");
	if(!target){
		setTimeout(selectMyThreads,100)
	}
	else{
		target.click()
	}
}

function addMyThreadsLink(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/)){
		return
	};
	if(document.querySelector(".hohMyThreads")){
		return
	};
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addMyThreadsLink,100)
	}
	else{
		create("a",["hohMyThreads","link"],"My Threads",target)
			.href = "https://anilist.co/user/" + whoAmI + "/social#my-threads"
	}
}

function moreImports(){
	if(document.URL !== "https://anilist.co/settings/import"){
		return
	}
	let target = document.querySelector(".content .import");
	if(!target){
		setTimeout(moreImports,200);
		return;
	};
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let apAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Anime List",apAnime);
	let apAnimeCheckboxContainer = create("label","el-checkbox",false,apAnime);
	let apAnimeOverwrite = createCheckbox(apAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",apAnimeCheckboxContainer);
	let apAnimeDropzone = create("div","dropbox",false,apAnime);
	let apAnimeInput = create("input","input-file",false,apAnimeDropzone);
	let apAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",apAnimeDropzone);
	apAnimeInput.type = "file";
	apAnimeInput.name = "json";
	apAnimeInput.accept = "application/json";
	let apManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anime-Planet: Import Manga List",apManga);
	let apMangaCheckboxContainer = create("label","el-checkbox",false,apManga);
	let apMangaOverwrite = createCheckbox(apMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",apMangaCheckboxContainer);
	let apMangaDropzone = create("div","dropbox",false,apManga);
	let apMangaInput = create("input","input-file",false,apMangaDropzone);
	let apMangaDropText = create("p",false,"Drop list JSON file here or click to upload",apMangaDropzone);
	apMangaInput.type = "file";
	apMangaInput.name = "json";
	apMangaInput.accept = "application/json";
	let resultsArea = create("div","importResults",false,target);
	let resultsErrors = create("div",false,false,resultsArea,"color:red;padding:5px;");
	let resultsWarnings = create("div",false,false,resultsArea,"color:orange;padding:5px;");
	let resultsStatus = create("div",false,false,resultsArea,"padding:5px;");
	let pushResults = create("button",["hohButton","button"],"Import all selected",resultsArea,"display:none;");
	let resultsTable = create("div",false,false,resultsArea);
	let apImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrors.innerText = "error parsing JSON";
			}
			if(data.export.type !== type){
				resultsErrors.innerText = "error wrong list";
				return;
			}
			if(data.user.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarnings.innerText = "List for \"" + data.user.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.export.date)) > 1000*86400*30){
				resultsWarnings.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.export.date)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			resultsStatus.innerText = "Trying to find matching media...";
			let shows = [];
			let drawShows = function(){
				removeChildren(resultsTable)
				shows.sort(
					(b,a) => a.titles[0].levDistance - b.titles[0].levDistance
				);
				shows.forEach(show => {
					let row = create("div","hohImportRow",false,resultsTable);
					if(show.isAnthology){
						create("div","hohImportEntry",show.apData.map(a => a.name).join(", "),row)
					}
					else{
						create("div","hohImportEntry",show.apData.name,row)
					}
					create("span","hohImportArrow","→",row);
					let aniEntry = create("div","hohImportEntry",false,row,"margin-left:50px");
					let aniLink = create("a",["link","newTab"],show.titles[0].title,aniEntry);
					aniLink.href = "/" + type + "/" + show.titles[0].id;
					let button = createCheckbox(row);
					row.style.backgroundColor = "hsl(" + (120 - Math.min(show.titles[0].levDistance,12)*10) + ",30%,50%)";
					if(show.titles[0].levDistance > 8){
						button.checked = false;
						show.toImport = false;
					}
					else{
						button.checked = true;
						show.toImport = true;
					}
					button.oninput = function(){
						show.toImport = button.checked
					}
				})
			};
			const apAnthologies = {
				"The Dragon Dentist": 20947,
				"Hill Climb Girl": 20947,
				"20min Walk From Nishi-Ogikubo Station": 20947,
				"Collection of Key Animation Films": 20947,
				"(Making of) Evangelion: Another Impact": 20947,
				"Sex and Violence with Mach Speed": 20947,
				"Memoirs of Amorous Gentlemen": 20947,
				"Denkou Choujin Gridman: boys invent great hero": 20947,
				"Evangelion: Another Impact": 20947,
				"Bureau of Proto Society": 20947,
				"Cassette Girl": 20947,
				"Bubu & Bubulina": 20947,
				"I can Friday by day!": 20947,
				"Three Fallen Witnesses": 20947,
				"Robot on the Road": 20947,
				"Comedy Skit 1989": 20947,
				"Power Plant No.33": 20947,
				"Me! Me! Me! Chronic": 20947,
				"Endless Night": 20947,
				"Neon Genesis IMPACTS": 20947,
				"Obake-chan": 20947,
				"Hammerhead": 20947,
				"Girl": 20947,
				"Yamadeloid": 20947,
				"Me! Me! Me!": 20947,
				"Ibuseki Yoruni": 20947,
				"Rapid Rouge": 20947,
				"Tomorrow from there": 20947,
				"The Diary of Ochibi": 20947,
				"until You come to me.": 20947,
				"Tsukikage no Tokio": 20947,
				"Carnage": 20947,
				"Iconic Field": 20947,
				"The Ultraman (2015)": 20947,
				"Kanoun": 20947,
				"Ragnarok": 20947,
				"Death Note Rewrite 1: Visions of a God": 2994,
				"Death Note Rewrite 2: L's Successors": 2994,
			}
			const apMappings = {
				"Rebuild of Evangelion: Final": 3786,
				"KonoSuba – God’s blessing on this wonderful world!! Movie: Legend of Crimson": 102976,
				"Puella Magi Madoka Magica: Magica Quartet x Nisioisin": 20891,
				"Kanye West: Good Morning": 8626,
				"Patlabor 2: The Movie": 1096,
				"She and Her Cat": 1004,
				"Star Blazers: Space Battleship Yamato 2199": 12029,
				"Digimon Season 3: Tamers": 874,
				"The Anthem of the Heart": 20968,
				"Digimon Movie 1: Digimon Adventure": 2961,
				"Love, Chunibyo & Other Delusions!: Sparkling... Slapstick Noel": 16934,
				"The Labyrinth of Grisaia Special": 21312,
				"Candy Boy EX01": 5116,
				"Candy Boy EX02": 6479,
				"Attack on Titan 3rd Season": 99147,
				"Attack on Titan 2nd Season": 20958,
				"Nichijou - My Ordinary Life: Episode 0": 8857,
				"March Comes in like a Lion 2nd Season": 98478,
				"KonoSuba – God’s blessing on this wonderful world!! 2 OVA": 97996,
				"KonoSuba – God’s blessing on this wonderful world!! OVA": 21574,
				"Laid-Back Camp Specials": 101206,
				"Spice and Wolf II OVA": 6007,
				"Mob Psycho 100 Specials": 102449
			}
			let bigQuery = [];
			let myFastMappings = [];
			data.entries.forEach(function(entry,index){
				if(entry.status === "won't watch"){
					return
				};
				if(apAnthologies[entry.name]){
					let already = myFastMappings.findIndex(function(mapping){
						return mapping.id === apAnthologies[entry.name]
					});
					if(already !== -1){
						myFastMappings[already].entries.push(entry)
					}
					else{
						myFastMappings.push({
							entries: [entry],
							isAnthology: true,
							id: apAnthologies[entry.name]
						})
					}
					return;
				}
				if(apMappings[entry.name]){
					myFastMappings.push({
						entries: [entry],
						id: apMappings[entry.name]
					})
					return;
				}
				bigQuery.push({
					query: `query($search:String){Page(perPage:3){media(type:${type.toUpperCase()},search:$search){title{romaji english native} id synonyms}}}`,
					variables: {search: entry.name},
					callback: function(dat){
						let show = {
							apData: entry,
							aniData: dat.data.Page.media
						}
						show.titles = [];
						show.aniData.forEach(function(hit){
							show.titles.push({
								title: hit.title.romaji,
								id: hit.id,
								levDistance: Math.min(
									levDist(show.apData.name,hit.title.romaji),
									levDist(show.apData.name,hit.title.romaji.toUpperCase()),
									levDist(show.apData.name,hit.title.romaji.toLowerCase())
								)
							});
							if(hit.title.native){
								show.titles.push({
									title: hit.title.native,
									id: hit.id,
									levDistance: levDist(show.apData.name,hit.title.native)
								});
							}
							if(hit.title.english){
								show.titles.push({
									title: hit.title.english,
									id: hit.id,
									levDistance: Math.min(
										levDist(show.apData.name,hit.title.english),
										levDist(show.apData.name,hit.title.english.toUpperCase()),
										levDist(show.apData.name,hit.title.english.toLowerCase())
									)
								});
							}
							hit.synonyms.forEach(
								synonym => show.titles.push({
									title: synonym,
									id: hit.id,
									levDistance: levDist(show.apData.name,synonym)
								})
							)
						});
						show.titles.sort(
							(a,b) => a.levDistance - b.levDistance
						);
						shows.push(show);
						drawShows();
					}
				});
				if(index % 40 === 0){
					queryPacker(bigQuery);
					bigQuery = [];
				}
			});
			let apStatusMap = {
				"want to read": "PLANNING",
				"stalled": "PAUSED",
				"read": "COMPLETED",
				"reading": "CURRENT",
				"watched": "COMPLETED",
				"want to watch": "PLANNING",
				"dropped": "DROPPED",
				"watching": "CURRENT"
			}
			queryPacker(bigQuery,function(){
				setTimeout(function(){
					resultsStatus.innerText = "Please review the media matches. The worst matches are on top.";
					pushResults.style.display = "inline";
					pushResults.onclick = function(){
						pushResults.style.display = "none";
						if(!useScripts.accessToken){
							alert("Not signed in to the script. Can't do any changes to your list\n Go to settings > apps to sign in");
							return;
						}
						authAPIcall(
						`query($name: String,$listType: MediaType){
							Viewer{name mediaListOptions{scoreFormat}}
							MediaListCollection(userName: $name, type: $listType){
								lists{
									entries{
										mediaId
									}
								}
							}
						}`,
						{
							listType: type.toUpperCase(),
							name: whoAmI
						},
						function(data){
							if(data.data.Viewer.name !== whoAmI){
								alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the scirpt again to fix this.");
								return;
							};
							let list = returnList(data,true).map(a => a.mediaId);
							shows = shows.filter(function(show){
								if(!show.toImport){
									return false;
								}
								if(type === "anime"){
									if(!apAnimeOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								else{
									if(!apMangaOverwrite.checked && list.includes(show.titles[0].id)){
										return false;
									}
								}
								return true;
							});
							if(!shows.length){
								return;
							};
							let mutater = function(show,index){
								if(index + 1 < shows.length){
									setTimeout(function(){
										mutater(shows[index + 1],index + 1);
									},1000);
								}
								let status = false;
								if(show.isAnthology){
									status = "CURRENT";
								}
								else{
									status = apStatusMap[show.apData.status];
								}
								if(!status){
									console.log("Unknown status: " + show.apData.status);
									return;
								}
								let score = 0;
								if(!show.isAnthology){
									score = show.apData.rating*2;
									if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_100"){
										score = show.apData.rating*20;
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_5"){
										score = Math.floor(show.apData.rating);
										if(show.apData.rating === 0.5){
											score = 1
										}
									}
									else if(data.data.Viewer.mediaListOptions.scoreFormat === "POINT_3"){
										if(show.apData.rating === 0){
											score = 0
										}
										else if(show.apData.rating < 2.5){
											score = 1
										}
										else if(show.apData.rating < 4){
											score = 2
										}
										else{
											score = 3
										}
									};
								};
								let progress = 0;
								let progressVolumes = 0;
								let repeat = 0;
								if(show.isAnthology){
									progress = show.apData.length
								}
								else{
									repeat = Math.max(0,show.apData.times - 1) || 0;
									if(status === "DROPPED" || status === "PAUSED" || status === "CURRENT"){
										if(type === "anime"){
											progress = show.apData.eps
										}
										else{
											progress = show.apData.ch
										}
									}
								}
								if(type === "manga"){
									progressVolumes = show.apData.vol
								}
								if(progress){
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$progress: Int,
											$progressVolumes: Int,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												progress: $progress,
												progressVolumes: $progressVolumes,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											progress: progress,
											progressVolumes: progressVolumes,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title + "\n"
											}
										}
									)
								}
								else{
									authAPIcall(
										`mutation(
											$mediaId: Int,
											$status: MediaListStatus,
											$score: Float,
											$repeat: Int
										){
											SaveMediaListEntry(
												mediaId: $mediaId,
												status: $status,
												score: $score,
												repeat: $repeat
											){
												id
											}
										}`,
										{
											mediaId: show.titles[0].id,
											status: status,
											score: score,
											repeat: repeat
										},
										data => {
											if(data.errors){
												resultsErrors.innerText += JSON.stringify(data.errors.map(e => e.validation)) + " " + show.titles[0].title +  "\n"
											}
										}
									)
								}
								resultsStatus.innerText = (index + 1) + " of " + shows.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(shows[0],0);
						})
					};
				},2000);
			});
			bigQuery = [];
			myFastMappings.forEach(function(entry){
				bigQuery.push({
					query: `query($id:Int){Media(type:${type.toUpperCase()},id:$id){title{romaji english native} id}}`,
					variables: {id: entry.id},
					callback: function(dat){
						if(entry.isAnthology){
							let show = {
								apData: entry.entries,
								directMapping: true,
								isAnthology: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
							}
							shows.push(show);
							drawShows();
						}
						else{
							let show = {
								apData: entry.entries[0],
								directMapping: true,
								aniData: dat.data.Media,
								titles: [{title: dat.data.Media.title.romaji,id: entry.id,levDistance: 0}]
							}
							shows.push(show);
							drawShows();
						}
					}
				})
			});
			queryPacker(bigQuery);
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	apAnimeInput.onchange = function(){
		apImport("anime",apAnimeInput.files[0])
	}
	apMangaInput.onchange = function(){
		apImport("manga",apMangaInput.files[0])
	}
	create("hr","hohSeparator",false,target,"margin-bottom:40px;");
	let alAnimeExp = create("div",["section","hohImport"],false,target);
	create("h2",false,"AniList: Export Anime List",alAnimeExp);
	let alAnimeButton = create("button",["button","hohButton"],"Export Anime",alAnimeExp);
	alAnimeButton.onclick = function(){
		generalAPIcall(
			`
	query($name: String!){
		MediaListCollection(userName: $name, type: ANIME){
			lists{
				name
				isCustomList
				isSplitCompletedList
				entries{
					... mediaListEntry
				}
			}
		}
		User(name: $name){
			name
			id
			mediaListOptions{
				scoreFormat
			}
		}
	}

	fragment mediaListEntry on MediaList{
		mediaId
		status
		progress
		repeat
		notes
		priority
		hiddenFromStatusLists
		customLists
		advancedScores
		startedAt{
			year
			month
			day
		}
		completedAt{
			year
			month
			day
		}
		updatedAt
		createdAt
		media{
			idMal
			title{romaji native english}
		}
		score
	}
	`,
			{name: whoAmI},
			function(data){
				data.data.version = "1.01";
				data.data.scriptInfo = scriptInfo;
				data.data.type = "ANIME";
				data.data.url = document.URL;
				data.data.timeStamp = NOW();
				saveAs(data.data,"AnilistAnimeList.json");
			}
		);
	}
	create("h2",false,"AniList: Export Manga List",alAnimeExp,"margin-top:20px;");
	let alMangaButton = create("button",["button","hohButton"],"Export Manga",alAnimeExp);
	alMangaButton.onclick = function(){
		generalAPIcall(
			`
	query($name: String!){
		MediaListCollection(userName: $name, type: MANGA){
			lists{
				name
				isCustomList
				isSplitCompletedList
				entries{
					... mediaListEntry
				}
			}
		}
		User(name: $name){
			name
			id
			mediaListOptions{
				scoreFormat
			}
		}
	}

	fragment mediaListEntry on MediaList{
		mediaId
		status
		progress
		progressVolumes
		repeat
		notes
		priority
		hiddenFromStatusLists
		customLists
		advancedScores
		startedAt{
			year
			month
			day
		}
		completedAt{
			year
			month
			day
		}
		updatedAt
		createdAt
		media{
			idMal
			title{romaji native english}
		}
		score
	}
	`,
			{name: whoAmI},
			function(data){
				data.data.version = "1.01";
				data.data.scriptInfo = scriptInfo;
				data.data.type = "MANGA";
				data.data.url = document.URL;
				data.data.timeStamp = NOW();
				saveAs(data.data,"AnilistMangaList.json");
			}
		);
	};
	let malExport = function(data,type){//maybe some time? But there's always malscraper, which does it better
		let xmlContent = "";
		saveAs(xmlContent,type.toLowerCase() + "list_0_-_0.xml",true);
	}
	let alAnime = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Anime List",alAnime);
	let alAnimeCheckboxContainer = create("label","el-checkbox",false,alAnime,"display:none;");
	let alAnimeOverwrite = createCheckbox(alAnimeCheckboxContainer);
	create("span","el-checkbox__label","Overwrite anime already on my list",alAnimeCheckboxContainer);
	let alAnimeDropzone = create("div","dropbox",false,alAnime);
	let alAnimeInput = create("input","input-file",false,alAnimeDropzone);
	let alAnimeDropText = create("p",false,"Drop list JSON file here or click to upload",alAnimeDropzone);
	alAnimeInput.type = "file";
	alAnimeInput.name = "json";
	alAnimeInput.accept = "application/json";
	let alManga = create("div",["section","hohImport"],false,target);
	create("h2",false,"Anilist JSON: Import Manga List",alManga);
	let alMangaCheckboxContainer = create("label","el-checkbox",false,alManga,"display:none;");
	let alMangaOverwrite = createCheckbox(alMangaCheckboxContainer);
	create("span","el-checkbox__label","Overwrite manga already on my list",alMangaCheckboxContainer);
	let alMangaDropzone = create("div","dropbox",false,alManga);
	let alMangaInput = create("input","input-file",false,alMangaDropzone);
	let alMangaDropText = create("p",false,"Drop list JSON file here or click to upload",alMangaDropzone);
	alMangaInput.type = "file";
	alMangaInput.name = "json";
	alMangaInput.accept = "application/json";
	let resultsAreaAL = create("div","importResults",false,target);
	let resultsErrorsAL = create("div",false,false,resultsAreaAL,"color:red;padding:5px;");
	let resultsWarningsAL = create("div",false,false,resultsAreaAL,"color:orange;padding:5px;");
	let resultsStatusAL = create("div",false,false,resultsAreaAL,"padding:5px;");
	let pushResultsAL = create("button",["hohButton","button"],"Import all",resultsAreaAL,"display:none;");
	let resultsTableAL = create("div",false,false,resultsAreaAL);
	let alImport = function(type,file){
		let reader = new FileReader();
		reader.readAsText(file,"UTF-8");
		reader.onload = function(evt){
			let data;
			try{
				data = JSON.parse(evt.target.result)
			}
			catch(e){
				resultsErrorsAL.innerText = "error parsing JSON";
			}
			if(parseFloat(data.version) > 1){//was not part of 1.00
				if(data.type !== type.toUpperCase()){
					resultsErrorsAL.innerText = "error wrong list type";
					return;
				}
			}
//
			if(data.User.name.toLowerCase() !== whoAmI.toLowerCase()){
				resultsWarningsAL.innerText = "List for \"" + data.User.name + "\" loaded, but currently signed in as \"" + whoAmI + "\". Are you sure this is right?"
			}
			if((new Date()) - (new Date(data.timeStamp)) > 1000*86400*30){
				resultsWarningsAL.innerText += "\nThis list is " + Math.round(((new Date()) - (new Date(data.timeStamp)))/(1000*86400)) + " days old. Did you upload the right one?"
			}
			resultsStatusAL.innerText = "Calculating list differences...";
			if((type === "anime" && alAnimeOverwrite.checked) || (type === "manga" && alMangaOverwrite.checked)){
			}
			else{
				authAPIcall(
					`query($name:String!,$listType:MediaType){
						Viewer{name mediaListOptions{scoreFormat}}
						MediaListCollection(userName:$name,type:$listType){
							lists{
								entries{mediaId}
							}
						}
					}`,
					{
						name: whoAmI,
						listType: type.toUpperCase()
					},
					data2 => {
						if(!data2){
							resultsErrorsAL.innerText = "Could not find the list of " + whoAmI;
							return;
						}
						if(data2.data.Viewer.name !== whoAmI){
							alert("Signed in as\"" + whoAmI + "\" to Anilist, but as \"" + data2.data.Viewer.name + "\" to the script.\n Go to settings > apps, revoke Aniscript's permissions, and sign in with the scirpt again to fix this.");
							return
						};
						let existing = new Set(data2.data.MediaListCollection.lists.map(list => list.entries).flat().map(entry => entry.mediaId));
						let dataList = returnList({data: data},true);
						let already = dataList.filter(entry => existing.has(entry.mediaId)).length;
						let notAlready = dataList.filter(entry => !existing.has(entry.mediaId));
						resultsStatusAL.innerText += "\n" + already + " of " + dataList.length + " entries already on list. Not modifying";
						if(notAlready.length > 0){
							resultsStatusAL.innerText += "\nThe " + notAlready.length + " entries below will be added:";
							pushResultsAL.style.display = "inline";
							notAlready.forEach(show => {
								let row = create("p",false,false,resultsTableAL);
								create("a",false,show.media.title.romaji,row)
									.href = "https://anilist.co/" + type + "/" + show.mediaId
							});
							pushResultsAL.onclick = function(){
								pushResultsAL.style.display = "none";



							let mutater = function(show,index){
								if(index + 1 < notAlready.length){
									setTimeout(function(){
										mutater(notAlready[index + 1],index + 1);
									},1000);
								}
								authAPIcall(
									`mutation($startedAt: FuzzyDateInput,$completedAt: FuzzyDateInput,$notes: String){
										SaveMediaListEntry(
											mediaId: ${show.mediaId},
											status: ${show.status},
											score: ${show.score},
											progress: ${show.progress},
											progressVolumes: ${show.progressVolumes || 0},
											repeat: ${show.repeat},
											priority: ${show.priority},
											notes: $notes,
											startedAt: $startedAt,
											completedAt: $completedAt
										){id}
									}`,
									{
										startedAt: show.startedAt,
										completedAt: show.completedAt,
										notes: show.notes
									},
									data => {}
								)
								resultsStatusAL.innerText = (index + 1) + " of " + notAlready.length + " entries imported. Closing this tab will stop the import.";
							};
							mutater(notAlready[0],0);



							}
						}
					}
				)
			}
		}
		reader.onerror = function(evt){
			resultsErrors.innerText = "error reading file"
		}
	}
	alAnimeInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("anime",alAnimeInput.files[0])
	}
	alMangaInput.onchange = function(){
		pushResultsAL.style.display = "none";
		removeChildren(resultsTableAL);
		alImport("manga",alMangaInput.files[0])
	}
}

function addSocialThemeSwitch(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".filters .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addSocialThemeSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target,"width:70px;");
	let listView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	listView.innerHTML = svgAssets.listView;
	cardView.innerHTML = svgAssets.cardView;
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		document.querySelector(".user-social").classList.add("listView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		document.querySelector(".user-social.listView").classList.remove("listView");
	}
	let traitorTracer = create("button",["button","hohButton"],"⇌",target,"padding:5px;");
	traitorTracer.title = "Check who follows back. (will not be accurate if there are more than 600)";
	traitorTracer.onclick = function(){
		traitorTracer.setAttribute("disabled","disabled");
		let query = `
		query($userId: Int!){
			${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){following(userId: $userId,sort: USERNAME){name}}").join("\n")}
		}`;
		let traitorText = traitorTracer.parentNode.querySelector(".filter-group .active").childNodes[0].textContent.trim();
		if(traitorText === "Following"){
			query = `
			query($userId: Int!){
				${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){followers(userId: $userId,sort: USERNAME){name}}").join("\n")}
			}`
		}
		else if(traitorText !== "Followers"){
			return
		};
		generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
			generalAPIcall(
				query,
				{userId: data.data.User.id},
				function(people){
					traitorTracer.removeAttribute("disabled");
					let users = new Set(
						[].concat(
							...Object.keys(people.data).map(
								a => people.data[a].following || people.data[a].followers
							)
						).map(a => a.name)
					);
					document.querySelectorAll(".user-follow .follow-card .name").forEach(function(place){
						if(!users.has(place.textContent.trim())){
							place.parentNode.style.border = "7px solid red"
						}
					})
				}
			)
		},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
	}
}

function addCompactBrowseSwitch(){
	let URLstuff = location.pathname.match(/^\/search\//)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".search-page-unscoped .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".search-page-unscoped");
	if(!target){
		setTimeout(addCompactBrowseSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target);
	let compactListView = create("span",false,false,themeSwitch);
	let listView = create("span",false,false,themeSwitch);
	let compactView = create("span","active",false,themeSwitch);
	let cardView = create("span",false,false,themeSwitch);
	compactListView.innerHTML = svgAssets.listView;
	listView.innerHTML = svgAssets.bigListView;
	compactView.innerHTML = svgAssets.compactView;
	cardView.innerHTML = svgAssets.cardView;
	compactView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.add("cardView");
		target.classList.add("listView");
		target.classList.remove("compactListView");
	}
	compactListView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactListView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.add("compactListView");
	}
}

function addStudioBrowseSwitch(){
	let URLstuff = location.pathname.match(/^\/studio\//)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".studio-page-unscoped .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".studio-page-unscoped");
	if(!target){
		setTimeout(addStudioBrowseSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target);
	target.classList.add("cardView");
	let compactListView = create("span",false,false,themeSwitch);
	let listView = create("span",false,false,themeSwitch);
	let compactView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	compactListView.innerHTML = svgAssets.listView;
	listView.innerHTML = svgAssets.bigListView;
	compactView.innerHTML = svgAssets.compactView;
	cardView.innerHTML = svgAssets.cardView;
	compactView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.add("cardView");
		target.classList.add("listView");
		target.classList.remove("compactListView");
	}
	compactListView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactListView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.add("compactListView");
	}
}

function viewAdvancedScores(url){
	let URLstuff = url.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/);
	let name = decodeURIComponent(URLstuff[1]);
	generalAPIcall(
		`query($name:String!){
			User(name:$name){
				mediaListOptions{
					animeList{advancedScoringEnabled}
					mangaList{advancedScoringEnabled}
				}
			}
		}`,
		{name: name},function(data){
		if(
			!(
				(URLstuff[2] === "anime" && data.data.User.mediaListOptions.animeList.advancedScoringEnabled)
				|| (URLstuff[2] === "manga" && data.data.User.mediaListOptions.mangaList.advancedScoringEnabled)
			)
		){
			return
		};
		generalAPIcall(
			`query($name:String!,$listType:MediaType){
				MediaListCollection(userName:$name,type:$listType){
					lists{
						entries{mediaId advancedScores}
					}
				}
			}`,
			{name: name,listType: URLstuff[2].toUpperCase()},
			function(data2){
				let list = new Map(returnList(data2,true).map(a => [a.mediaId,a.advancedScores]));
				let finder = function(){
					if(!document.URL.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/)){
						return
					};
					document.querySelectorAll(
						".list-entries .entry .title > a:not(.hohAdvanced)"
					).forEach(function(entry){
						entry.classList.add("hohAdvanced");
						let key = parseInt(entry.href.match(/\/(\d+)\//)[1]);
						let dollar = create("span","hohAdvancedDollar","$",entry.parentNode);
						let advanced = list.get(key);
						let reasonable = Object.keys(advanced).map(
							key => [key,advanced[key]]
						).filter(
							a => a[1]
						);
						dollar.title = reasonable.map(
							a => a[0] + ": " + a[1]
						).join("\n");
						if(!reasonable.length){
							dollar.style.display = "none"
						}
					});
					setTimeout(finder,1000);
				};finder();
			}
		)
	})
};

function randomButtons(){
	let list = [
		{data:"users",single:"user"},
		{data:"media(type: ANIME)",single:"anime"},
		{data:"media(type: MANGA)",single:"manga"},
		{data:"characters",single:"character"},
		{data:"staff",single:"staff"},
		{data:"reviews",single:"review"}
	];
	list.forEach(function(item,index){
		let adder = function(data){
			let place = document.querySelectorAll("section > .heading > h3");
			if(place.length <= index){
				setTimeout(function(){adder(data)},200);
				return;
			}
			let currentText = place[index].innerText;
			place[index].innerText = "";
			let link = create("a","link",currentText,place[index],"cursor:pointer;");
			let selected = Math.floor(Math.random()*data.data.Page.pageInfo.total);
			link.onclick = function(){
				generalAPIcall(
					`query($page:Int){
						Page(page:$page){
							${item.data}{id}
						}
					}`,
					{page: Math.ceil(selected / 50)},
					function(data){
						window.location.href = "https://anilist.co/" + item.single + "/" + data.data.Page[item.data.replace(/\(.*\)/,"")][selected % 50].id + "/";
					}
				);
			}
		};
		generalAPIcall(
			`query($page:Int){
				Page(page:$page){
					pageInfo{total}
					${item.data}{id}
				}
			}`,
			{page: 1},
			adder
		)
	});
	let speedAdder = function(data){
		if(!data){
			return
		}
		let place = document.querySelector(".page-content .container section");
		if(!place){
			setTimeout(function(){speedAdder(data)},200);
			return;
		};
		let activityContainer = create("div",false,false,place.parentNode);
		create("h3","heading","Current Activity",activityContainer);
		create("p",false,Math.round((3600*199/(data.data.act1.activities[0].createdAt - data.data.act2.activities[9].createdAt))) + " activities/hour",activityContainer);
		let activities = data.data.text.activities;
		create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " status posts/hour",activityContainer);
		activities = data.data.message.activities;
		create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " messages/hour",activityContainer);
		
	};
	generalAPIcall(
		`query{
			act1:Page(page: 1,perPage:10){
				activities(sort:ID_DESC){
					... on TextActivity{createdAt}
					... on MessageActivity{createdAt}
					... on ListActivity{createdAt}
				}
			}
			act2:Page(page: 20,perPage:10){
				activities(sort:ID_DESC){
					... on TextActivity{createdAt}
					... on MessageActivity{createdAt}
					... on ListActivity{createdAt}
				}
			}
			text:Page{
				activities(sort:ID_DESC,type:TEXT){
					... on TextActivity{createdAt}
				}
			}
			message:Page{
				activities(sort:ID_DESC,type:MESSAGE){
					... on MessageActivity{createdAt}
				}
			}
		}`,
		{},
		speedAdder
	)
}

function possibleBlocked(oldURL){
	let URLstuff = oldURL.match(/\/user\/(.*?)\/?$/);
	if(URLstuff){
		let name = decodeURIComponent(URLstuff[1]);
		const query = `
		query($userName: String) {
			User(name: $userName){
				id
			}
		}`;
		let variables = {
			userName: name
		}
		if(name !== whoAmI){
			generalAPIcall(query,variables,data => {
				let notFound = document.querySelector(".not-found");
				name = name.split("/")[0];
				if(notFound){
					if(name.includes("submissions")){
						notFound.innerText = "This submission was probably denied"
					}
					else if(data){
						notFound.innerText = name + " has blocked you"
					}
					else if(name === "ModChan"){
						notFound.innerText = "Nope."
					}
					else{
						notFound.innerText = name + " does not exist or has a private profile"
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			})
		}
		return
	}
	URLstuff = oldURL.match(/\/(anime|manga)\/(\d+)/);
	if(URLstuff){
		let type = URLstuff[1];
		let id = parseInt(URLstuff[2]);
		const query = `
		query($id: Int,$type: MediaType) {
			Media(id: $id,type: $type){
				genres
			}
		}`;
		let variables = {
			type: type.toUpperCase(),
			id: id
		}
		generalAPIcall(query,variables,data => {
			if(data.data.Media.genres.some(genre => genre === "Hentai")){
				let notFound = document.querySelector(".not-found");
				if(notFound){
					if(id === 320){
						notFound.innerText = `Kite isn't *really* hentai, but it kinda is too, and it's a bit complicated.

(You you enable 18+ content in settings > Anime & Manga)`
					}
					else{
						notFound.innerText = `That's one of them hentais.

(You you enable 18+ content in settings > Anime & Manga)`
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			}
		})
	}
}

function hideGlobalFeed(){
	if(!location.pathname.match(/^\/home/)){
		return
	};
	let toggle = document.querySelector(".feed-type-toggle");
	if(!toggle){
		setTimeout(hideGlobalFeed,100);
		return
	};
	toggle.children[1].style.display = "none";
	if(toggle.children[1].classList.contains("active")){
		toggle.children[0].click()
	}
};

function yearStepper(){
	if(!location.pathname.match(/\/user\/.*\/(anime|manga)list/)){
		return
	}
	let slider = document.querySelector(".el-slider");
	if(!slider){
		setTimeout(yearStepper,200);
		return
	};
	const maxYear = parseInt(slider.getAttribute("aria-valuemax"));
	const minYear = parseInt(slider.getAttribute("aria-valuemin"));
	const yearRange = maxYear - minYear;
	let clickSlider = function(year){//thanks, mator!
		let runway = slider.children[0];
		let r = runway.getBoundingClientRect();
		const x = r.left + r.width * ((year - minYear) / yearRange);
		const y = r.top + r.height / 2;
		runway.dispatchEvent(new MouseEvent("click",{
			clientX: x,
			clientY: y
		}))
	};
	let adjuster = function(delta){
		let heading = slider.previousElementSibling;
		if(heading.children.length === 0){
			if(delta === -1){
				clickSlider(maxYear)
			}
			else{
				clickSlider(minYear)
			}
		}
		else{
			let current = parseInt(heading.children[0].innerText);
			clickSlider(current + delta);
		}
	};
	if(document.querySelector(".hohStepper")){
		return
	};
	slider.style.position = "relative";
	let decButton = create("span","hohStepper","<",slider,"left:-27px;font-size:200%;top:0px;");
	let incButton = create("span","hohStepper",">",slider,"right:-27px;font-size:200%;top:0px;");
	decButton.onclick = function(){
		adjuster(-1)
	};
	incButton.onclick = function(){
		adjuster(1)
	}
}

function profileBackground(){
	if(useScripts.SFWmode){//clearly not safe, users can upload anything
		return
	};
	let URLstuff = location.pathname.match(/^\/user\/(.*?)\/?$/);
	const query = `
	query($userName: String) {
		User(name: $userName){
			about
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,data => {
		if(!data){
			return;
		};
		let jsonMatch = (data.data.User.about || "").match(/^<!--(\{.*})-->/);
		if(!jsonMatch){
			let target = document.querySelector(".user-page-unscoped");
			if(target){
				target.style.background = "unset"
			}
			return;
		};
		try{
			let jsonData = JSON.parse(jsonMatch[1]);
			let adder = function(){
				if(!location.pathname.match(/^\/user\/(.*?)\/?$/)){
					return
				};
				let target = document.querySelector(".user-page-unscoped");
				if(target){
					target.style.background = jsonData.background || "none";
				}
				else{
					setTimeout(adder,200);
				}
			};adder();
		}
		catch(e){
			console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
			console.log(jsonMatch[1]);
		};
	},"hohProfileBackground" + variables.userName,30*1000);
}

function addCustomCSS(){
	if(useScripts.SFWmode){
		return
	};
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
		generalAPIcall(query,variables,data => {
			customStyle.textContent = "";
			if(!data){
				return;
			};
			let jsonMatch = (data.data.User.about || "").match(/^<!--(\{.*})-->/);
			if(!jsonMatch){
				return
			};
			try{
				let jsonData = JSON.parse(jsonMatch[1]);
				if(jsonData.customCSS){
					customStyle.textContent = jsonData.customCSS;
					currentUserCSS = decodeURIComponent(URLstuff[1]);
				}
			}
			catch(e){
				console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
				console.log(jsonMatch[1]);
			}
		},"hohProfileBackground" + variables.userName,30*1000);
	}
}

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
			replyIcon.innerHTML = svgAssets.reply;
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
								let cleanText = reply.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
									let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
									return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
								})
								text.innerHTML = cleanText;
							}
							else{
								text.innerHTML = reply.text
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
					let cleanText = activity.text.replace(/<img.*?src=("|')(.*?)("|').*?>/g,img => {
						let link = img.match(/<img.*?src=("|')(.*?)("|').*?>/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					}).replace(/<video.*?video>/g,video => {
						let link = video.match(/src=("|')(.*?)("|')/)[2];
						return "[<a href=\"" + link + "\">" + (link.length > 200 ? link.slice(0,200) + "…" : link) + "</a>]";
					})
					status.innerHTML = cleanText;
					if(cleanText !== activity.text){
						let render = create("a",false,"IMG",act,"position:absolute;top:2px;right:50px;width:10px;cursor:pointer;");
						render.onclick = () => {
							activity.renderingPermission = true;
							status.innerHTML = activity.text;
							render.style.display = "none";
						}
					}
				}
				else{
					status.innerHTML = activity.text;
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
			link.innerHTML = svgAssets.link;
			if(type === "thread"){
				link.href = "https://anilist.co/forum/thread/" + activity.id + "/";
			}
			else{
				link.href = "https://anilist.co/" + type + "/" + activity.id + "/";
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

function scoreOverviewFixer(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\//)){
		return;
	}
	let overview = document.querySelector(".media .overview");
	if(!overview){
		setTimeout(scoreOverviewFixer,300);
		return;
	}
	let follows = overview.querySelectorAll(".follow");
	if(follows.length){
		follows.forEach(el => {
			scoreColors(el);
		});
	}
	else{
		setTimeout(scoreOverviewFixer,300);
	}
}

function meanScoreBack(){
	let URLstuff = location.pathname.match(/^\/user\/(.*?)\/?$/);
	const query = `
	query($userName: String) {
		User(name: $userName){
			statistics{
				anime{
					episodesWatched
					meanScore
				}
				manga{
					volumesRead
					meanScore
				}
			}
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,function(data){
		if(!data){
			return;
		}
		let adder = function(){
			if(!location.pathname.match(/^\/user\/(.*?)\/?$/)){
				return;
			}
			let possibleStatsWrap = document.querySelectorAll(".stats-wrap .stats-wrap");
			if(possibleStatsWrap.length){
				if(possibleStatsWrap.length === 2 && possibleStatsWrap[0].childElementCount === 3){
					if(data.data.User.statistics.anime.meanScore){
						let statAnime = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.anime.episodesWatched,statAnime);
						create("div","label","Total Episodes",statAnime);
						let totalDays = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalDays + " Days Watched";
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones");
					};
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[1]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label","Total Volumes",statManga);
						let totalChapters = possibleStatsWrap[1].children[1].children[0].innerText;
						possibleStatsWrap[1].children[1].remove();
						possibleStatsWrap[1].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalChapters + " Chapters Read";
						possibleStatsWrap[1].parentNode.classList.add("hohMilestones");
					};
				}
				else if(possibleStatsWrap[0].innerText.includes("Total Manga")){
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label","Total Volumes",statManga);
						let totalChapters = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = totalChapters + " Chapters Read";
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones");
					};
				}
			}
			else{
				setTimeout(adder,200);
			}
		};adder();
	},"hohMeanScoreBack" + variables.userName,60*1000);
}

function betterReviewRatings(){
	if(!location.pathname.match(/\/home/)){
		return
	}
	let reviews = document.querySelectorAll(".review-card .el-tooltip.votes");
	if(!reviews.length){
		setTimeout(betterReviewRatings,500);
		return;
	}
	// Basic idea: read the rating info from the tooltips to avoid an API call.
	document.body.classList.add("TMPreviewScore");//add a temporary class, which makes all tooltips
	reviews.forEach(likeElement => {//trigger creation of the tooltips (they don't exist before hover)
		likeElement.dispatchEvent(new Event("mouseenter"));
		likeElement.dispatchEvent(new Event("mouseleave"));
	});
	setTimeout(function(){//give anilist some time to generate them
		reviews.forEach(likeElement => {
			let likeExtra = document.getElementById(likeElement.attributes["aria-describedby"].value);
			if(likeExtra){
				let matches = likeExtra.innerText.match(/out of (\d+)/);
				if(matches){
					likeElement.childNodes[1].textContent += "/" + matches[1]
				}
			}
			likeElement.style.bottom = "4px";
			likeElement.style.right = "7px";
		})
		document.body.classList.remove("TMPreviewScore");//make tooltips visible again
	},200);
}

function addForumMedia(){
	let id = parseInt(document.URL.match(/\d+$/)[0]);
	let adder = function(data){
		if(!document.URL.includes(id) || !data){
			return
		}
		let feed = document.querySelector(".feed");
		if(!feed){
			setTimeout(function(){adder(data)},200);
			return
		}
		data.data.Media.id = id;
		let mediaLink = create("a",false,titlePicker(data.data.Media),false,"color:rgb(var(--color-blue));padding:10px;display:block;");
		mediaLink.href = data.data.Media.siteUrl;
		feed.insertBefore(mediaLink,feed.firstChild);
	}
	generalAPIcall(
		`query($id:Int){Media(id:$id){title{native english romaji} siteUrl}}`,
		{id: id},
		adder,
		"hohMediaLookup" + id
	)
}

function betterListPreview(){
	if(window.screen.availWidth && window.screen.availWidth <= 1040){
		return
	}
	let errorHandler = function(e){
		console.error(e);
		console.warn("Alternative list preview failed. Trying to bring back the native one");
		let hohListPreviewToRemove = document.getElementById("hohListPreview");
		if(hohListPreviewToRemove){
			hohListPreviewToRemove.remove()
		};
		document.querySelectorAll(".list-preview-wrap").forEach(wrap => {
			wrap.style.display = "block"
		})
	}
	try{//it's complex, and could go wrong. Furthermore, we want a specific behavour when it fails, namely bringing back the native preview
	let hohListPreview = document.getElementById("hohListPreview");
	if(hohListPreview){
		return;
	};
	let buildPreview = function(data,overWrite){try{
		if(!data){
			return;
		}
		if(!hohListPreview){
			overWrite = true;
			let listPreviews = document.querySelectorAll(".list-previews h2");
			if(!listPreviews.length){
				setTimeout(function(){buildPreview(data)},200);
				return
			};
			hohListPreview = create("div","#hohListPreview");
			listPreviews[0].parentNode.parentNode.parentNode.parentNode.insertBefore(hohListPreview,listPreviews[0].parentNode.parentNode.parentNode);
			listPreviews.forEach(heading => {
				if(!heading.innerText.includes("Manga")){
					heading.parentNode.parentNode.style.display = "none";
				}
			})
		};
		if(overWrite){
			let mediaLists = data.data.Page.mediaList.map((mediaList,index) => {
				mediaList.index = index;
				if(aliases.has(mediaList.media.id)){
					mediaList.media.title.userPreferred = aliases.get(mediaList.media.id)
				}
				return mediaList
			});
			let notAiring = mediaLists.filter(
				mediaList => !mediaList.media.nextAiringEpisode
			)
			let airing = mediaLists.filter(
				mediaList => mediaList.media.nextAiringEpisode
			).map(
				mediaList => {
					mediaList.points = 100/(mediaList.index + 1) + mediaList.priority/10 + (mediaList.scoreRaw || 60)/10;
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
						mediaList.points -= 100/(mediaList.index + 1);
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 1;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*3){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*1){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 3;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*10){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 5;
						}
						else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
							mediaList.points += 2;
						}
					}
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
						mediaList.points += 7;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 3;
							}
						}
					}
					else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 3){
						mediaList.points += 2;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 1;
							}
						}
					}
					return mediaList;
				}
			).sort(
				(b,a) => a.points - b.points
			);
			let airingImportant = mediaLists.filter(
				(mediaList,index) => mediaList.media.nextAiringEpisode && (
					index < 20
					|| mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*4
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1
					)
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6
						&& mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2
					)
				)
			).length;
			if(airingImportant > 3){
				airingImportant = Math.min(5*Math.ceil((airingImportant - 1)/5),airing.length)
			}
			removeChildren(hohListPreview)
			let drawSection = function(list,name,moveExpander){
				let airingSection = create("div","list-preview-wrap",false,hohListPreview,"margin-bottom: 20px;");
				let airingSectionHeader = create("div","section-header",false,airingSection);
				if(name === "Airing"){
					create("a","asHeading",name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
						.href = "https://anilist.co/airing"
				}
				else{
					create("h2",false,name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
				};
				if(moveExpander){
					airingSectionHeader.appendChild(document.querySelector(".size-toggle"))
				};
				let airingListPreview = create("div","list-preview",false,airingSection,"display:grid;grid-template-columns: repeat(5,85px);grid-template-rows: repeat(auto-fill,115px);grid-gap: 20px;padding: 20px;background: rgb(var(--color-foreground));");
				list.forEach((air,index) => {
					let card = create("div",["media-preview-card","small","hohFallback"],false,airingListPreview,"width: 85px;height: 115px;background: rgb(var(--color-foreground));border-radius: 3px;display: inline-grid;");
					if(air.media.coverImage.color){
						card.style.backgroundColor = air.media.coverImage.color
					};
					if(index % 5 > 1){
						card.classList.add("info-left")
					};
					let cover = create("a","cover",false,card,"background-position: 50%;background-repeat: no-repeat;background-size: cover;text-align: center;border-radius: 3px;");
					cover.style.backgroundImage = "url(\"" + air.media.coverImage.large + "\")";
					cover.href = "/anime/" + air.media.id + "/" + safeURL(air.media.title.userPreferred);
					if(air.media.nextAiringEpisode){
						let imageText = create("div","image-text",false,cover,"background: rgba(var(--color-overlay),.7);border-radius: 0 0 3px 3px;bottom: 0;color: rgba(var(--color-text-bright),.91);display: inline-block;font-weight: 400;left: 0;letter-spacing: .2px;margin-bottom: 0;position: absolute;transition: .3s;width: 100%;font-size: 1.1rem;line-height: 1.2;padding: 8px;");
						let imageTextWrapper = create("div","countdown",false,imageText);
						let createCountDown = function(){
							removeChildren(imageTextWrapper)
							create("span",false,"Ep " + air.media.nextAiringEpisode.episode + " - ",imageTextWrapper);
							if(air.media.nextAiringEpisode.timeUntilAiring <= 0){
								create("span",false,"Recently aired",imageTextWrapper);
								return;
							};
							let days = Math.floor(air.media.nextAiringEpisode.timeUntilAiring/(60*60*24));
							let hours = Math.floor((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24))/3600);
							let minutes = Math.round((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24) - hours*3600)/60);
							if(minutes === 60){
								hours++;
								minutes = 0;
								if(hours === 24){
									days++;
									hours = 0;
								}
							};
							if(days){
								create("span",false,days + "d ",imageTextWrapper)
							}
							if(hours){
								create("span",false,hours + "h ",imageTextWrapper)
							}
							if(minutes){
								create("span",false,minutes + "m",imageTextWrapper)
							}
							setTimeout(function(){
								air.media.nextAiringEpisode.timeUntilAiring -= 60;
								createCountDown();
							},60*1000);
						};createCountDown();
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							create("div","behind-accent",false,imageText,"background: rgb(var(--color-red));border-radius: 0 0 2px 2px;bottom: 0;height: 5px;left: 0;position: absolute;transition: .2s;width: 100%;")
						}
					}
					let imageOverlay = create("div","image-overlay",false,cover);
					let plusProgress = create("div","plus-progress",air.progress + " +",imageOverlay);
					let content = create("div","content",false,card);
					if(air.media.nextAiringEpisode){
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							let infoHeader = create("div","info-header",false,content,"color: rgb(var(--color-blue));font-size: 1.2rem;font-weight: 500;margin-bottom: 8px;");
							create("div",false,behind + " episode" + (behind > 1 ? "s" : "") + " behind",infoHeader);
						}
					}
					let title = create("a","title",air.media.title.userPreferred,content,"font-size: 1.4rem;");
					let info = create("div",["info","hasMeter"],false,content,"bottom: 12px;color: rgb(var(--color-text-lighter));font-size: 1.2rem;left: 12px;position: absolute;");
					let pBar;
					if(air.media.episodes && useScripts.progressBar){
						pBar = create("meter",false,false,info);
						pBar.value = air.progress;
						pBar.min = 0;
						pBar.max = air.media.episodes;
						if(air.media.nextAiringEpisode){
							pBar.low = air.media.nextAiringEpisode.episode - 2;
							pBar.high = air.media.nextAiringEpisode.episode - 1;
							pBar.optimum = air.media.nextAiringEpisode.episode - 1;
						}
					};
					let progress = create("div",false,"Progress: " + air.progress + (air.media.episodes ? "/" + air.media.episodes : ""),info);
					let isBlocked = false;
					plusProgress.onclick = function(e){
						if(isBlocked){
							return
						};
						if(air.media.episodes){
							if(air.progress < air.media.episodes){
								if(useScripts.progressBar){
									pBar.value++;
								}
								air.progress++;
								progress.innerText = "Progress: " + air.progress + (air.media.episodes ? "/" + air.media.episodes : "");
								isBlocked = true;
								setTimeout(function(){
									plusProgress.innerText = air.progress + " +";
									isBlocked = false;
								},300);
								if(air.progress === air.media.episodes){
									progress.innerText += " Completed";
									if(air.status === "REWATCHING"){//don't overwrite the existing end date
										authAPIcall(
											`mutation($progress: Int,$id: Int){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED){id}
											}`,
											{id: air.id,progress: air.progress},
											data => {}
										);
									}
									else{
										authAPIcall(
											`mutation($progress: Int,$id: Int,$date:FuzzyDateInput){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED,completedAt:$date){id}
											}`,
											{
												id: air.id,
												progress: air.progress,
												date: {
													year: (new Date()).getUTCFullYear(),
													month: (new Date()).getUTCMonth() + 1,
													day: (new Date()).getUTCDate(),
												}
											},
											data => {}
										);
									}
								}
								else{
									authAPIcall(
										`mutation($progress: Int,$id: Int){
											SaveMediaListEntry(progress: $progress,id:$id){id}
										}`,
										{id: air.id,progress: air.progress},
										data => {}
									);
								}
								localStorage.setItem("hohListPreview",JSON.stringify(data));
							}
						}
						else{
							air.progress++;
							plusProgress.innerText = air.progress + " +";
							isBlocked = true;
							setTimeout(function(){
								plusProgress.innerText = air.progress + " +";
								isBlocked = false;
							},300);
							authAPIcall(
								`mutation($progress: Int,$id: Int){
									SaveMediaListEntry(progress: $progress,id:$id){id}
								}`,
								{id: air.id,progress: air.progress},
								data => {}
							);
							localStorage.setItem("hohListPreview",JSON.stringify(data));
						};
						if(air.media.nextAiringEpisode){
							if(air.progress === air.media.nextAiringEpisode.episode - 1){
								if(card.querySelector(".behind-accent")){
									card.querySelector(".behind-accent").remove()
								}
							}
						}
						e.stopPropagation();
						e.preventDefault();
						return false
					}
					let fallback = create("span","hohFallback",air.media.title.userPreferred,card,"background-color: rgb(var(--color-foreground),0.6);padding: 3px;border-radius: 3px;");
					if(useScripts.titleLanguage === "ROMAJI"){
						fallback.innerHTML = air.media.title.userPreferred.replace(/\S{3}(a|\(|☆|\-|e|i|ou|(o|u)(?!u|\s)|n(?!a|e|i|o|u))(?![a-z]($|[^a-z]))/gi,m => m + "<wbr>");
					}
					
				});
			};
			if(airingImportant > 3){
				drawSection(
					airing.slice(0,airingImportant),"Airing",true
				);
				drawSection(
					notAiring.slice(0,5*Math.ceil((20 - airingImportant)/5)),"Anime in Progress"
				)
			}
			else{
				let remainderAiring = airing.slice(0,airingImportant).filter(air => air.index >= 20);
				drawSection(mediaLists.slice(0,20 - remainderAiring.length).concat(remainderAiring),"Anime in Progress",true);
			}
		}
	}catch(e){errorHandler(e)}}
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
	catch(e){
		errorHandler(e)
	}
}

let urlChangedDependence = false;

if(useScripts.dropdownOnHover && whoAmI){
	let addMouseover = function(){
		let navThingy = document.querySelector(".nav .user .el-dropdown-link");
		if(navThingy){
			navThingy.onmouseover = function(){
				let controls = document.getElementById(navThingy.attributes["aria-controls"].value);
				if(!controls || controls.style.display === "none"){
					navThingy.click()
				}
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover();
}

if(useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .link[href^="/user/"]`);
		if(navThingy){
			navThingy.style.position = "relative";
			let hackContainer = create("div","subMenuContainer",false,false,"position:relative;width:100%;min-height:50px;z-index:134;display:inline-flex;");
			navThingy.parentNode.insertBefore(hackContainer,navThingy);
			hackContainer.appendChild(navThingy);
			let subMenu = create("div","hohSubMenu",false,hackContainer);
			create("a","hohSubMenuLink","Favourites",subMenu)
				.href = "/user/" + whoAmI + "/favorites";
			let linkStats = create("a","hohSubMenuLink","Stats",subMenu);
			if(useScripts.mangaBrowse){
				linkStats.href = "/user/" + whoAmI + "/stats/manga/overview";
			}
			else{
				linkStats.href = "/user/" + whoAmI + "/stats/anime/overview";
			}
			create("a","hohSubMenuLink","Social",subMenu)
				.href = "/user/" + whoAmI + "/social";
			create("a","hohSubMenuLink","Reviews",subMenu)
				.href = "/user/" + whoAmI + "/reviews";
			create("a","hohSubMenuLink","Submissions",subMenu)
				.href = "/user/" + whoAmI + "/submissions";
			hackContainer.onmouseenter = function(){
				subMenu.style.display = "inline";
			}
			hackContainer.onmouseleave = function(){
				subMenu.style.display = "none";
			}
		}
		else{
			setTimeout(addMouseover,500);
		}
	};addMouseover();
}

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

function singleActivityReplyLikes(id){
	let adder = function(data){
		if(!document.URL.includes("activity/" + id || !data)){
			return
		};
		let post = document.querySelector(".activity-entry > .wrap > .actions .action.likes");
		if(!post){
			setTimeout(function(){adder(data)},200);
			return;
		};
		post.classList.add("hohLoadedLikes");
		post.classList.add("hohHandledLike");
		if(post.querySelector(".count") && !(parseInt(post.querySelector(".count").innerText) <= 5)){
			post.title = data.data.Activity.likes.map(like => like.name).join("\n")
		};
		let smallAdder = function(){
			if(!document.URL.includes("activity/" + id)){
				return
			};
			let actionLikes = document.querySelectorAll(".activity-replies .action.likes");
			if(!actionLikes.length){
				setTimeout(smallAdder,200);
				return;
			}
			actionLikes.forEach((node,index) => {
				if(node.querySelector(".count") && !(parseInt(node.querySelector(".count").innerText) <= 5)){
					node.title = data.data.Activity.replies[index].likes.map(like => like.name).join("\n")
				}
			});
		};
		if(data.data.Activity.replies.length){
			smallAdder()
		}
	}
	generalAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on TextActivity{
			likes{name}
			replies{likes{name}}
		}
		... on MessageActivity{
			likes{name}
			replies{likes{name}}
		}
		... on ListActivity{
			likes{name}
			replies{likes{name}}
		}
	}
}`,
		{id: id},
		adder
	);
}

if(useScripts.youtubeFullscreen){
	setInterval(function(){
		document.querySelectorAll(".youtube iframe").forEach(video => {
			if(!video.hasAttribute("allowfullscreen")){
				video.setAttribute("allowfullscreen","true");
			}
		});
	},1000);
}

if(useScripts.mobileFriendly){
	let addReviewLink = function(){
		let footerPlace = document.querySelector(".footer .links section:last-child");
		if(footerPlace){
			let revLink = create("a",false,"Reviews",footerPlace,"display:block;padding:6px;");
			revLink.href = "/reviews/";
		}
		else{
			setTimeout(addReviewLink,500)
		}
	};addReviewLink();
}

let titleObserver = new MutationObserver(function(mutations){
	let title = document.querySelector("head > title").textContent;
	let titleMatch = title.match(/(.*)\s\((\d+)\)\s\((.*)\s\(\2\)\)(.*)/);//ugly nested paranthesis like "Tetsuwan Atom (1980) (Astro Boy (1980)) · AniList"
	if(titleMatch){
		//change to the form "Tetsuwan Atom (Astro Boy 1980) · AniList"
		document.title = titleMatch[1] + " (" + titleMatch[3] + " " + titleMatch[2] + ")" + titleMatch[4];
	}
	if(document.URL.match(/^https:\/\/anilist\.co\/search\/characters/) && title !== "Find Characters · AniList"){
		document.title = "Find Characters · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/staff/) && title !== "Find Staff · AniList"){
		document.title = "Find Staff · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/studios/) && title !== "Find Studios · AniList"){
		document.title = "Find Studios · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/anime/) && title !== "Find Anime · AniList"){
		document.title = "Find Anime · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/manga/) && title !== "Find Manga · AniList"){
		document.title = "Find Manga · AniList"
	};
	if(useScripts.SFWmode && title !== "Table of Contents"){
		document.title = "Table of Contents"
	}
});
if(document.title){
	titleObserver.observe(document.querySelector("head > title"),{subtree: true, characterData: true, childList: true })
}
