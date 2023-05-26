async function addActivityTimeline(){
	const URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)(\/[\w-]*)?\/social/);
	if(!URLstuff){
		return
	}
	if(document.getElementById("activityTimeline")){
		return
	}
	if(!whoAmIid){
		const {data, errors} = await anilistAPI("query($name:String){User(name:$name){id}}", {
			variables: {name: whoAmI},
			cacheKey: "hohIDlookup" + whoAmI.toLowerCase(),
			duration: 5*60*1000
		});
		if(errors){
			return
		}
		whoAmIid = data.User.id;
		addActivityTimeline()
		return
	}
	let followingLocation = document.querySelector(".following");
	if(!followingLocation){
		setTimeout(addActivityTimeline,200);
		return
	}
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
			hasNextPage
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
	let previousTime = null;
	const lineCaller = async function(query,variables){
		const data = await anilistAPI(query, {
			variables,
			cacheKey: `hohMediaTimeline${variables.mediaId}u${variables.userId}p${variables.page}`,
			duration: 120*1000
		});
		if(data.errors){
			return
		}
		if(data.data.Page.pageInfo.currentPage === 1){
			previousTime = null;
			removeChildren(activityTimeline)
			if(data.data.Page.activities.length){
				create("h2",false,translate("$timeline_title"),activityTimeline)
			}
		}
		data.data.Page.activities.forEach(function(activity){
			let diffTime = activity.createdAt - previousTime;
			if(previousTime && diffTime > 60*60*24*30*3){//three months
				create("div","hohTimelineGap","― " + formatTime(diffTime) + " ―",activityTimeline)
			}
			let activityEntry = create("div","hohTimelineEntry",false,activityTimeline);
			if(activity.replyCount){
				activityEntry.style.color = "rgb(var(--color-blue))"
			}
			let activityContext = create("a","newTab",capitalize(activity.status),activityEntry);
			if(URLstuff[1] === "manga"){
				if(activity.status === "read chapter" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MreadChapter_known",activity.progress))
				}
				else if(activity.status === "reread"){
					activityContext.innerText = capitalize(translate("$listActivity_repeatedManga_known"))
				}
				else if(activity.status === "reread chapter" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MrepeatingManga_known",activity.progress))
				}
				else if(activity.status === "dropped" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MdroppedManga_known",activity.progress))
				}
				else if(activity.status === "dropped"){
					activityContext.innerText = capitalize(translate("$listActivity_droppedManga_known",activity.progress))
				}
				else if(activity.status === "completed"){
					activityContext.innerText = capitalize(translate("$listActivity_completedManga_known"))
				}
				else if(activity.status === "plans to read"){
					activityContext.innerText = capitalize(translate("$listActivity_planningManga_known"))
				}
				else if(activity.status === "paused reading"){
					activityContext.innerText = capitalize(translate("$listActivity_pausedManga_known"))
				}
				else{
					console.warn("Missing listActivity translation key for:",activity.status)
				}
			}
			else{
				if(activity.status === "watched episode" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MwatchedEpisode_known",activity.progress))
				}
				else if(activity.status === "rewatched"){
					activityContext.innerText = capitalize(translate("$listActivity_repeatedAnime_known"))
				}
				else if(activity.status === "rewatched episode" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MrepeatingAnime_known",activity.progress))
				}
				else if(activity.status === "dropped" && activity.progress){
					activityContext.innerText = capitalize(translate("$listActivity_MdroppedAnime_known",activity.progress))
				}
				else if(activity.status === "dropped"){
					activityContext.innerText = capitalize(translate("$listActivity_droppedAnime_known",activity.progress))
				}
				else if(activity.status === "completed"){
					activityContext.innerText = capitalize(translate("$listActivity_completedAnime_known"))
				}
				else if(activity.status === "plans to watch"){
					activityContext.innerText = capitalize(translate("$listActivity_planningAnime_known"))
				}
				else if(activity.status === "paused watching"){
					activityContext.innerText = capitalize(translate("$listActivity_pausedAnime_known"))
				}
				else{
					console.warn("Missing listActivity translation key for:",activity.status)
				}
			}
			activityContext.href = activity.siteUrl;
			const options = {weekday: "short", year: "numeric", month: "short", day: "numeric"};
			let locale = languageFiles[useScripts.partialLocalisationLanguage].info.locale || "en-UK";
			let datestring = (new Date(activity.createdAt*1000)).toLocaleDateString(locale,options)
			create("span",false,
				" " + datestring,
				activityEntry
			).title = (new Date(activity.createdAt*1000)).toLocaleString();
			previousTime = activity.createdAt;
		});
		if(data.data.Page.pageInfo.hasNextPage === true){
			variables.page = data.data.Page.pageInfo.currentPage + 1;
			lineCaller(query,variables)
		}
		return
	};
	if(status !== "Add To List"){
		lineCaller(query,variables)
	}
	let lookingElse = create("div",false,false,followingLocation.parentNode,"margin-top:30px;");
	create("div",false,translate("$timeline_search_description"),lookingElse);
	let lookingElseInput = create("input",false,false,lookingElse);
	lookingElseInput.placeholder = translate("$input_user_placeholder");
	lookingElseInput.setAttribute("list","socialUsers");
	let lookingElseButton = create("button",["button","hohButton"],translate("$button_search"),lookingElse);
	let lookingElseError = create("span",false,"",lookingElse);
	lookingElseButton.onclick = async function(){
		if(lookingElseInput.value){
			lookingElseError.innerText = "...";
			const userName = lookingElseInput.value.trim();
			const {data, errors} = await anilistAPI("query($name:String){User(name:$name){id}}", {
				variables: {name: userName},
				cacheKey: "hohIDlookup" + userName.toLowerCase(),
				duration: 5*60*1000
			});
			if(errors){
				lookingElseError.innerText = translate("$error_userNotFound");
				return
			}
			lookingElseError.innerText = "";
			variables.userId = data.User.id;
			variables.page = 1;
			lineCaller(query,variables)
		}
		return
	}
	let favFindQuery = `query (
      $mediaId: Int,
      $page: Int
){
  Page (page: $page) {
    mediaList (mediaId: $mediaId, sort: SCORE_DESC) {
      scoreRaw: score(format: POINT_100) user {
        name favourites {${URLstuff[1]} {nodes {id}}
}}}}}
`;
	create("hr",false,false,followingLocation.parentNode);
	let findFavs = create("div",false,false,followingLocation.parentNode);
	let findFavsButton = create("button",["button","hohButton"],"People with this in favs",findFavs);
	findFavsButton.onclick = async function(){
		let resultsArea = create("div",false,false,findFavs);
		let searchStatus = create("div",false,"searching...",resultsArea);
		let searchResults = create("div",false,false,resultsArea);
		let userList = new Map();
		let caller = async function(page){
			const {data, errors} = await anilistAPI(favFindQuery, {
				variables: {page: page, mediaId: parseInt(URLstuff[2])},
				cacheKey: "hohFavFinder" + page + "id" + parseInt(URLstuff[2]),
				duration: 10*60*1000
			});
			if(errors){
				searchStatus.innerText = "error searching page " + page;
				return
			}
			else{
				searchStatus.innerText = "searching... page " + page;
				data.Page.mediaList.forEach(listing => {
					if(listing.user && listing.user.favourites){
						if(listing.user.favourites[URLstuff[1]].nodes.some(fav => fav.id === parseInt(URLstuff[2]))){
							userList.set(listing.user.name, {
								isFavourite: true,
								score: listing.scoreRaw,
								first: listing.user.favourites[URLstuff[1]].nodes[0].id === parseInt(URLstuff[2])
							})
						}
					}
				})
				removeChildren(searchResults);
				Array.from(userList).sort((b,a) => 
					(+a[1].first) - (+b[1].first)
					|| a[1].scoreRaw - b[1].scoreRaw
				).forEach(user => {
					let row = create("p",false,false,searchResults);
					create("a",false,user[0],row).href = "https://anilist.co/user/" + user[0];
					if(user[1].first){
						create("span",false," #1",row)
					}
				})
				if(data.Page.mediaList.length && (page < 15 || (userList.size < 3 && page < 20))){
					caller(page + 1)
				}
				else{
					if(userList.size === 0){
						searchStatus.innerText = "search completed. No users found."
					}
					else{
						searchStatus.innerText = "search completed."
					}
				}
			}
		}
		caller(1)
	}
}
