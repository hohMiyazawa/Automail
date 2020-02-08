let modules = [];

function handleScripts(url,oldUrl){
	modules.forEach(module => {
		if(useScripts[module.id] && module.urlMatch && module.urlMatch(url,oldUrl)){
			module.code()
		}
	})
	if(url === "https://anilist.co/notifications" && useScripts.notifications){
		enhanceNotifications();
		return
	}
	else if(url === "https://anilist.co/reviews" && useScripts.reviewConfidence){
		addReviewConfidence();
		return
	}
	else if(url === "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		selectMyThreads()
	}
	else if(url === "https://anilist.co/settings/import" && useScripts.moreImports){
		moreImports()
	}
	else if(url === "https://anilist.co/terms" && useScripts.termsFeed){
		termsFeed()
	}
	else if(url === "https://anilist.co/404"){
		possibleBlocked(oldUrl)
	}
	if(url.match(/^https:\/\/anilist\.co\/(anime|manga)\/\d*\/[\w\-]*\/social/)){
		if(useScripts.socialTab){
			enhanceSocialTab();
			if(useScripts.accessToken){
				enhanceSocialTabFeed()
			}
		};
		if(useScripts.activityTimeline){
			addActivityTimeline()
		}
	}
	else{
		stats.element = null;
		stats.count = 0;
		stats.scoreSum = 0;
		stats.scoreCount = 0;
	}
	if(
		url.match(/\/stats\/?/)
		&& useScripts.moreStats
	){
		addMoreStats()
	};
	if(
		url.match(/^https:\/\/anilist\.co\/home#access_token/)
	){
		let tokenList = location.hash.split("&").map(a => a.split("="));
		useScripts.accessToken = tokenList[0][1];
		useScripts.save();
		location.replace(location.protocol + "//" + location.hostname + location.pathname);
	};
	if(
		url.match(/^https:\/\/anilist\.co\/home#aniscripts-login/)
	){
		if(useScripts.accessToken){
			alert("Already authorized. You can rewoke this under 'apps' in your Anilist settings")
		}
		else{
			location.href = authUrl
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/user/)){
		if(useScripts.completedScore || useScripts.droppedScore){//we also want this script to run on user pages
			addCompletedScores()
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		};
		let adder = function(){
			let banner = document.querySelector(".banner");
			if(banner && banner.style.backgroundImage !== "url(\"undefined\")"){
				let bannerLink = create("a","hohDownload","⭳",banner);
				const linkPlace = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
				bannerLink.href = linkPlace;
				bannerLink.title = "Banner Link";
				if(linkPlace === "null"){
					bannerLink.style.display = "none"
				}
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.milestones){
			meanScoreBack()
		};
		if(useScripts.profileBackground){
			profileBackground()
		};
		if(useScripts.customCSS){
			addCustomCSS()
		}
	}
	else{
		customStyle.textContent = ""
	}
	if(
		url.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)
	){
		if(useScripts.forumComments){
			enhanceForum()
		}
		if(useScripts.embedHentai){
			embedHentai()
		}
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/)
	){
		if(useScripts.myThreads){
			addMyThreadsLink()
		}
	}
	else if(
		url.includes("https://anilist.co/forum/recent?media=")
	){
		addForumMedia()
	}
	else if(url.match(/^https:\/\/anilist\.co\/staff\/.*/)){
		if(useScripts.staffPages){
			enhanceStaff()
		}
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/character\/.*/)
		&& useScripts.characterFavouriteCount
	){
		enhanceCharacter()
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/studio\/.*/)
	){
		if(useScripts.studioFavouriteCount){
			enhanceStudio()
		}
		if(useScripts.CSScompactBrowse){
			addStudioBrowseSwitch()
		};
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/edit/)
		&& useScripts.enumerateSubmissionStaff
	){
		enumerateSubmissionStaff()
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/.*\/social/)
	){
		if(useScripts.CSSfollowCounter){
			addFollowCount()
		}
		addSocialThemeSwitch();
	};
	if(
		url.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/)
	){
		drawListStuff();
		if(useScripts.viewAdvancedScores){
			viewAdvancedScores(url)
		}
		if(useScripts.yearStepper){
			yearStepper()
		}
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/)
		&& useScripts.comparissionPage
	){
		addComparissionPage()
	}
	else{
		let possibleHohCompareRemaining = document.querySelector(".hohCompare");
		if(possibleHohCompareRemaining){
			possibleHohCompareRemaining.remove()
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/search/)){
		if(useScripts.CSScompactBrowse){
			addCompactBrowseSwitch()
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/search\/characters/)){
		if(useScripts.characterFavouriteCount){
			enhanceCharacterBrowse()
		};
		document.title = "Find Characters · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/staff/)){
		if(useScripts.staffPages){
			enhanceStaffBrowse()
		};
		document.title = "Find Staff · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/studios/)){
		document.title = "Find Studios · AniList";
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/anime/)){
		document.title = "Find Anime · AniList";
		setTimeout(() => {
			if(document.URL.match(/^https:\/\/anilist\.co\/search\/anime/)){
				document.title = "Find Anime · AniList"
			}
		},100);
		if(useScripts.browseFilters){
			addBrowseFilters("anime")
		}
	}
	else if(url.match(/^https:\/\/anilist\.co\/search\/manga/)){
		document.title = "Find Manga · AniList";
		if(useScripts.browseFilters){
			addBrowseFilters("manga")
		}
	};
	let mangaAnimeMatch = url.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
	if(mangaAnimeMatch){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/?/)){
				return
			};
			let banner = document.querySelector(".banner");
			if(banner){
				let bannerLink = create("a","hohDownload","⭳",banner);
				bannerLink.href = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.tagDescriptions){
			enhanceTags()
		};
		if(useScripts.subTitleInfo){
			addSubTitleInfo()
		}
		if(useScripts.dubMarker && mangaAnimeMatch[1] === "anime"){
			dubMarker()
		}
		else if(useScripts.mangaGuess && mangaAnimeMatch[1] === "manga"){
			mangaGuess(false,parseInt(mangaAnimeMatch[2]))
		};
		if(useScripts.mangaGuess && mangaAnimeMatch[1] === "anime"){
			mangaGuess(true)
		};
		if(useScripts.MALscore || useScripts.MALserial || useScripts.MALrecs){
			addMALscore(mangaAnimeMatch[1],mangaAnimeMatch[2])
		};
		if(useScripts.accessToken){
			addRelationStatusDot(mangaAnimeMatch[2])
		};
		if(useScripts.entryScore && whoAmI){
			addEntryScore(mangaAnimeMatch[2])
		};
		if(useScripts.SFWmode){
			cencorMediaPage(mangaAnimeMatch[2])
		};
		let titleAliases = JSON.parse(localStorage.getItem("titleAliases"));
		if(useScripts.shortRomaji){
			titleAliases = shortRomaji.concat(titleAliases);
		};
		if(document.getElementById("hohAliasHeading")){
			document.getElementById("hohAliasHeading").nextSibling.style.display = "block";
			document.getElementById("hohAliasHeading").remove();
		};
		if(titleAliases){
			const urlID = mangaAnimeMatch[2];
			titleAliases.forEach(alias => {//can't just use a find, the latest alias takes priority (find in reverse?)
				if(alias[0] === "css/"){
					return
				};
				if(alias[0].substring(7,alias[0].length-1) === urlID){
					let newState = "/" + mangaAnimeMatch[1] + "/" + urlID + "/" + safeURL(alias[1]) + "/";
					if(mangaAnimeMatch[4]){
						newState += mangaAnimeMatch[4]
					};
					history.replaceState({},"",newState);
					current = document.URL;
					let titleReplacer = () => {
						if(urlChangedDependence === false){//I have to kill these global flags with fire some day
							return
						};
						let mainTitle = document.querySelector("h1");//fragile, just like your heterosexuality
						if(mainTitle){
							let newHeading = create("h1","#hohAliasHeading",alias[1]);
							mainTitle.parentNode.insertBefore(newHeading,mainTitle);
							mainTitle.style.display = "none";
							//mainTitle.innerText = alias[1];
							return
						}
						else{
							urlChangedDependence = true;
							setTimeout(titleReplacer,100)
						}
					};
					urlChangedDependence = true;
					titleReplacer()
				}
			})
		};
		if(useScripts.socialTab){
			scoreOverviewFixer()
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/home\/?$/)){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		};
		if(useScripts.betterListPreview && whoAmI && useScripts.accessToken && (!useScripts.mobileFriendly)){
			betterListPreview()
		};
		if(useScripts.progressBar){
			addProgressBar()
		};
		if(
			(useScripts.feedCommentFilter && (!useScripts.mobileFriendly))
			|| localStorage.getItem("blockList")
			|| useScripts.blockWord
			|| useScripts.statusBorder
		){
			addFeedFilters()
		};
		if(useScripts.expandRight){
			expandRight()
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.hideAWC){
			addForumMediaNoAWC()
		}
		else if(useScripts.forumMedia){
			addForumMediaTitle()
		};
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		};
		if(useScripts.dblclickZoom){
			addDblclickZoom()
		};
		if(useScripts.hideGlobalFeed){
			hideGlobalFeed()
		};
		if(useScripts.betterReviewRatings){
			betterReviewRatings()
		};
		if(useScripts.homeScroll){
			let homeButton = document.querySelector(".nav .link[href=\"/home\"]");
			if(homeButton){
				homeButton.onclick = () => {
					if(document.URL.match(/^https:\/\/anilist\.co\/home\/?$/)){
						window.scrollTo({top: 0,behavior: "smooth"})
					}
				}
			}
		};
		linkFixer();
	}
	let activityMatch = url.match(/^https:\/\/anilist\.co\/activity\/(\d+)/);
	if(activityMatch){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		};
		if(useScripts.activityTimeline){
			addActivityLinks(activityMatch[1])
		};
		if(useScripts.embedHentai){
			embedHentai()
		};
		if(useScripts.showMarkdown){
			showMarkdown(activityMatch[1])
		}
	};
	if(url.match(/^https:\/\/anilist\.co\/edit/)){//seems to give mixed results. At least it's better than nothing
		window.onbeforeunload = function(){
			return "Page refresh has been intercepted to avoid an accidental loss of work"
		}
	};
	if(useScripts.notifications && useScripts.accessToken && !useScripts.mobileFriendly){
		notificationCake()
	}
};

let useScriptsDefinitions = m4_include(data/legacyModuleDescriptions.json)
let current = "";
let mainLoop = setInterval(() => {
	if(document.URL !== current){
		urlChangedDependence = false;
		let oldURL = current + "";
		current = document.URL;
		handleScripts(current,oldURL)
	};
	if(useScripts.expandDescriptions){
		let expandPossible = document.querySelector(".description-length-toggle");
		if(expandPossible){
			expandPossible.click()
		}
	}
},200);
let tagDescriptions = {};
let expired = true;
let tagCache = localStorage.getItem("hohTagCache");
if(tagCache){
	tagCache = JSON.parse(tagCache);
	expired = (NOW() - tagCache.updated) > 3*60*60*1000//three hours
};
if(expired){
	generalAPIcall("query{MediaTagCollection{name description}}",{},data => {
		data.data.MediaTagCollection.forEach(tag => {
			tagDescriptions[tag.name] = tag.description
		});
		localStorage.setItem("hohTagCache",JSON.stringify({
			tags: tagDescriptions,
			updated: NOW()
		}))
	})
}
else{
	tagDescriptions = tagCache.tags
};
console.log("Automail " + scriptInfo.version);
Object.keys(localStorage).forEach(key => {
	if(key.includes("hohListActivityCall")){
		let cacheItem = JSON.parse(localStorage.getItem(key));
		if(cacheItem){
			if(NOW() > cacheItem.time + cacheItem.duration){
				localStorage.removeItem(key)
			}
		}
	}
	else if(key === "aniscriptsUsed"){
		localStorage.removeItem(key)
	}
});

if(useScripts.automailAPI){
	if(document.automailAPI){
		console.warn("Multiple copies of Automail running? Shutting down this instance.");
		clearInterval(mainLoop);
		clearInterval(likeLoop);
	}
	document.automailAPI = {
		scriptInfo: scriptInfo,
		generalAPIcall: generalAPIcall,//query,variables,callback[,cacheKey[,timeFresh[,useLocalStorage]]]
		authAPIcall: authAPIcall,
		queryPacker: queryPacker,
		settings: useScripts,
		logOut: function(){useScripts.accessToken = "";useScripts.save()}
	}
}

function exportModule(module){
	useScriptsDefinitions.push({
		id: module.id,
		description: module.description,
		categories: module.categories,
		visible: module.visible
	});
	if(!useScripts.hasOwnProperty(module.id)){
		useScripts[module.id] = module.isDefault;
		useScripts.save()
	}
	modules.push(module)
}
