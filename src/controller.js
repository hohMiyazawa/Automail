let modules = [];

function handleScripts(url,oldUrl){
	modules.forEach(module => {
		if(useScripts[module.id] && module.urlMatch(url,oldUrl)){
			module.code()
		}
	})
	if(url === "https://anilist.co/settings/apps"){
		settingsPage()
	}
	else if(url === "https://anilist.co/notifications" && useScripts.notifications){
		enhanceNotifications();
		return;
	}
	else if(url === "https://anilist.co/reviews" && useScripts.reviewConfidence){
		addReviewConfidence();
		return;
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
	else if(url === "https://anilist.co/site-stats"){
		randomButtons()
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
		if(useScripts.replaceStaffRoles){
			replaceStaffRoles()
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
			addBrowseFilters("manga");
		};
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
					return;
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
							return;
						};
						let mainTitle = document.querySelector("h1");//fragile, just like your heterosexuality
						if(mainTitle){
							let newHeading = create("h1","#hohAliasHeading",alias[1]);
							mainTitle.parentNode.insertBefore(newHeading,mainTitle);
							mainTitle.style.display = "none";
							//mainTitle.innerText = alias[1];
							return;
						}
						else{
							urlChangedDependence = true;
							setTimeout(titleReplacer,100);
						}
					};
					urlChangedDependence = true;
					titleReplacer();
				};
			});
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

let useScriptsDefinitions = [
{id: "notifications",
	description: "Improve notifications",
	categories: ["Notifications","Login"]
},{id: "hideLikes",
	description: "Hide like notifications. Will not affect the notification count",
	categories: ["Notifications"]
},{id: "settingsTip",
	description: "Show a notice on the notification page for where the script settings can be found",
	categories: ["Notifications"]
},{id: "dismissDot",
	description: "Show a spec to dismiss notifications when signed in",
	categories: ["Notifications","Login"]
},{id: "socialTab",
	description: "Media social tab average score, progress and notes",
	categories: ["Media"]
},{id: "forumComments",
	description: "Add a button to collapse comment threads in the forum",
	categories: ["Forum"]
},{id: "forumMedia",
	description: "Add the tagged media to the forum preview on the home page",
	categories: ["Forum"]
},{id: "mangaBrowse",
	description: "Make browse default to manga",
	categories: ["Browse"]
},{id: "ALbuttonReload",
	description: "Make the 'AL' button reload the feeds on the homepage",
	categories: ["Navigation"]
},{id: "draw3x3",
	description: "Add a button to lists to create 3x3's from list entries. Click the button, and then select nine entries",
	categories: ["Lists"]
},{id: "aniscriptsAPI",
	description: "Enable an API for other scripts to control automail [Don't enable this unless you know what you are doing]",
	categories: ["Script","Login"]
},{id: "mobileFriendly",
	description: "Mobile Friendly mode. Disables some modules not working properly on mobile, and adjusts others",
	categories: ["Navigation","Script"]
},{id: "tagDescriptions",
	description: "Show the definitions of tags when adding new ones to an entry",
	categories: ["Media"]
},{id: "MALscore",
	description: "Add MAL scores to media",
	categories: ["Media"]
},{id: "MALserial",
	description: "Add MAL serialization info to manga",
	categories: ["Media"]
},{id: "MALrecs",
	description: "Add MAL recs to media",
	categories: ["Media"]
},{id: "subTitleInfo",
	description: "Add basic data below the title on media pages",
	categories: ["Media"]
},{id: "infoTable",
	description: "Use a two-column table layout for info on media pages",
	categories: ["Media","Newly Added"]
},{id: "entryScore",
	description: "Add your score and progress to anime pages",
	categories: ["Media","Login"]
},{id: "reviewConfidence",
	description: "Add confidence scores to reviews"
},{id: "betterReviewRatings",
	description: "Add the total number of ratings to review ratings on the home page"
},{id: "activityTimeline",
	description: "Link your activities in the social tab of media, and between individual activities",
	categories: ["Media","Navigation"]
},{id: "browseFilters",
	description: "Add more sorting options to browse",
	categories: ["Browse"]
},{id: "enumerateSubmissionStaff",
	description: "Enumerate the multiple credits for staff in the submission form to help avoid duplicates",
	categories: ["Submissions","Profiles"]
},{id: "replaceStaffRoles",
	description: "Add sorting to staff pages",
	categories: ["Media","Login"]
},{id: "completedScore",
	description: "Show the score on the activity when people complete something",
	categories: ["Feeds"]
},{id: "droppedScore",
	description: "Show the score on the activity when people drop something",
	categories: ["Feeds"]
},{id: "tagIndex",
	description: "Show an index of custom tags on anime and manga lists",
	categories: ["Lists"]
},{id: "yearStepper",
	description: "Add buttons to step the year slider up and down",
	categories: ["Lists"]
},{id: "CSSfollowCounter",
	description: "Follow count on social page",
	categories: ["Profiles"],
},{
	id: "dubMarker",
	subSettings: ["dubMarkerLanguage"],
	description: "Add a notice on top of the other data on an anime page if a dub is available (works by checking for voice actors)",
	categories: ["Media"]
},{
	id: "dubMarkerLanguage",
	requires: ["dubMarker"],
	description: "",
	type: "select",
	categories: ["Media"],
	values: ["English","German","Italian","Spanish","French","Korean","Portuguese","Hebrew","Hungarian"]
},{id: "mangaGuess",
	description: "Make a guess for the number of chapters for releasing manga",
	categories: ["Media"]
},{id: "CSSmobileTags",
	description: "Don't hide tags from media pages on mobile",
	categories: ["Media"]
},{id: "moreStats",
	description: "Show an additional tab on the stats page",
	categories: ["Stats"]
},{id: "replaceNativeTags",
	description: "Full lists for tags, staff and studios in stats",
	categories: ["Stats"]
},{id: "allStudios",
	description: "Include companies that aren't animation studios in the extended studio table",
	categories: ["Stats"]
},{id: "noRewatches",
	description: "Don't include progress from rewatches/rereads in stats",
	categories: ["Stats"]
},{id: "hideCustomTags",
	description: "Hide the custom tags tables by default",
	categories: ["Stats"]
},{id: "negativeCustomList",
	description: "Add an entry in the custom tag tables with all media not on a custom list",
	categories: ["Stats"]
},{id: "globalCustomList",
	description: "Add an entry in the custom tag tables with all media",
	categories: ["Stats"]
},{id: "timeToCompleteColumn",
	description: "Add 'time to complete' info to the tag tables",
	categories: ["Stats"]
},{id: "comparissionPage",
	description: "Replace the native comparison feature",
	categories: ["Lists","Profiles"]
},{id: "CSSsmileyScore",
	description: "Give smiley ratings distinct colours [from userstyle]",
	categories: ["Lists","Media"]
},{id: "CSSexpandFeedFilters",
	description: "Expand the feed filters",
	categories: ["Feeds"]
},{id: "hideGlobalFeed",
	description: "Hide the global feed",
	categories: ["Feeds"]
},{id: "feedCommentFilter",
	description: "Add filter options to the feeds to hide posts with few comments or likes",
	categories: ["Feeds"]
},{id: "statusBorder",
	description: "Colour code the right border of activities by status",
	categories: ["Feeds"]
},{id: "blockWord",
	description: "Hide status posts containing this word:",
	categories: ["Feeds"]
},{
	id: "blockWordValue",
	requires: ["blockWord"],
	description: "",
	type: "text",
	categories: ["Feeds"]
},{id: "profileBackground",
	description: "Enable profile backgrounds",
	categories: ["Profiles","Login"]
},{
	id: "profileBackgroundValue",
	requires: ["profileBackground"],
	description: "",
	visible: false,
	type: "text",
	categories: ["Profiles"]
},{id: "colourPicker",
	description: "Add a colour picker in the footer for adjusting the site themes",
	categories: ["Script"]
},{id: "progressBar",
	description: "Add progress bars to the list previews",
	categories: ["Feeds"]
},{id: "tweets",
	description: "Embed linked tweets",
	categories: ["Feeds"]
},{id: "embedHentai",
	description: "Make cards for links to age restricted content",
	categories: ["Feeds"]
},{id: "betterListPreview",
	description: "Alternative list preview",
	categories: ["Feeds","Lists","Login"]
},{id: "homeScroll",
	description: "Make the 'home' button scroll to the top on the home feed",
	categories: ["Feeds"]
},{id: "CSSfavs",
	description: "Use 5-width favourite layout [from userstyle]",
	categories: ["Profiles"]
},{id: "CSScompactBrowse",
	description: "Use a compact view in the browse section. Also makes various list views available",
	categories: ["Browse"]
},{id: "customCSS",
	description: "Enable custom profile CSS",
	categories: ["Profiles","Login"]
},{id: "CSSgreenManga",
	description: "Green titles for manga",
	categories: ["Media","Feeds"]
},{id: "cleanSocial",
	description: "Give a better space to the following list on the social tab [under development]",
	categories: ["Media"]
},{id: "limitProgress10",
	description: "Limit the 'in progress' sections to 10 entries",
	categories: ["Feeds"]
},{id: "limitProgress8",
	description: "Limit the 'in progress' sections to 8 entries",
	categories: ["Feeds"]
},{id: "expandDescriptions",
	description: "Automatically expand descriptions",
	categories: ["Media"]
},{id: "showRecVotes",
	description: "Always show the recommendation voting data",
	categories: ["Media"]
},{id: "myThreads",
	description: "Add a 'my threads' link in the forum",
	categories: ["Forum","Profiles"]
},{id: "hideAWC",
	description: "Hide AWC threads from the forum preview on the home page. Number of AWC-free threads to display:",
	categories: ["Forum","Newly Added"]
},{
	id: "forumPreviewNumber",
	requires: ["hideAWC"],
	description: "",
	type: "number",
	"min": 0,
	"max": 50,
	categories: ["Forum","Newly Added"]
},{id: "expandRight",
	description: "Load the expanded view of 'in progress' in the usual place instead of full width if left in that state [weird hack]",
	categories: ["Feeds"]
},{id: "noImagePolyfill",
	description: "Add fallback text for missing images in the sidebar and favourite sections",
	categories: ["Feeds","Profiles"]
},{id: "dropdownOnHover",
	description: "Expand the user menu in the nav on hover instead of click",
	categories: ["Navigation"]
},{id: "shortRomaji",
	description: "Short romaji titles for everyday use. Life is too short for light novel titles",
	categories: ["Feeds","Profiles","Lists"]
},{id: "CSSprofileClutter",
	description: "Remove clutter from profiles (milestones, history chart, genres)",
	categories: ["Profiles"]
},{id: "CSSdecimalPoint",
	description: "Give whole numbers a \".0\" suffix when using the 10 point decimal scoring system",
	categories: ["Lists"]
},{id: "viewAdvancedScores",
	description: "View advanced scores",
	categories: ["Lists"]
},{id: "dblclickZoom",
	description: "Double click activities to zoom",
	categories: ["Feeds"]
},{id: "youtubeFullscreen",
	description: "Allow Youtube videos to play in fullscreen mode",
	categories: ["Script"]
},{id: "rightToLeft",
	description: "Support for right-to-left flow [under development]",
	categories: ["Script","Newly Added"]
},{id: "termsFeed",
	description: "Add a low bandwidth feed to the https://anilist.co/terms page",
	categories: ["Feeds","Login"]
},{id: "termsFeedNoImages",
	description: "Do not load images on the low bandwidth feed",
	categories: ["Feeds","Login"]
},{id: "CSSbannerShadow",
	description: "Remove banner shadows",
	categories: ["Profiles","Media"]
},{id: "milestones",
	description: "Add total episodes and volumes to profile milestones",
	categories: ["Profiles"]
},{id: "CSSdarkDropdown",
	description: "Use a dark menu dropdown in dark mode",
	categories: ["Navigation"]
},{id: "moreImports",
	description: "Add more list import and list export options",
	categories: ["Script","Login"]
},{id: "plussMinus",
	description: "Add + and - buttons to quickly change scores on your list",
	categories: ["Lists","Login"]
},{id: "SFWmode",
	description: "A less flashy version of the site for school or the workplace [under development]",
	categories: ["Script"]
},{id: "CSSverticalNav",
	description: "Alternative browse mode [with vertical navbar by Kuwabara]",
	categories: ["Navigation"]
}
];
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
