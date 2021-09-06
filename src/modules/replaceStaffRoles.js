exportModule({
	id: "replaceStaffRoles",
	description: "Hoh's version of sortable staff pages",
	isDefault: !!useScripts.accessToken,
	categories: ["Media","Login"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/staff\/.*/)
	},
	code: function(){
let selfcaller = function(){
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
	setTimeout(selfcaller	,200);
	return;
};
insertParentCharacters.classList.add("hohSubstitute");
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
let hohCharacterRolesHeader = create("h4",false,translate("$staff_voiceRoles"),hohCharacterRolesBox);
hohCharacterRolesHeader.style.display = "none";
let hohCharacterRoles = create("div","grid-wrap",false,hohCharacterRolesBox);
hohCharacterRoles.style.margin = "10px";

let hohMediaRoles = create("div","#hoh-media-roles");
hohMediaRoles.dataset.staffId = URLstuff[1];
let hohMediaRolesAnimeHeader = create("h4",false,translate("$staff_animeRoles"),hohMediaRoles);
hohMediaRolesAnimeHeader.style.display = "none";
let hohMediaRolesAnime = create("div","grid-wrap",false,hohMediaRoles);
hohMediaRolesAnime.style.margin = "10px";

let hohMediaRolesMangaHeader = create("h4",false,translate("$staff_mangaRoles"),hohMediaRoles);
hohMediaRolesMangaHeader.style.display = "none";
let hohMediaRolesManga = create("div","grid-wrap",false,hohMediaRoles);
hohMediaRolesManga.style.margin = "10px";
//sort
let hohMediaSort = create("div",["container","hohFilterBar"]);
let sortText = create("span",false,translate("$staff_sort"),hohMediaSort);
let sortSelect = create("select",false,false,hohMediaSort);
sortSelect.style.marginLeft = "5px";
let filterSelect = create("input",false,false,hohMediaSort);
filterSelect.setAttribute("list","staffRoles");
filterSelect.placeholder = translate("$staff_filter_placeholder");
let filterExplanation = create("abbr",false,"?",hohMediaSort,"margin-left:5px;cursor:pointer;");
filterExplanation.title = translate("$staff_filterHelp");
filterExplanation.onclick = function(){
	let scrollableContent = createDisplayBox("min-width:400px;width:700px;");
	scrollableContent.innerText = `
Text in the field will be matched against all titles, roles, genres tags, your status, the media format and the start year. If it matches one of them, the media is displayed.

Regular expressions are permitted for titles.

If you want to limit it to just one filter type, you can do it like "genre:mecha" or "status:watching"
(status filtering only works if you have granted Automail permission to view your list data)

The start year can also be a range like "2000-2005"`
};
let dataList = create("datalist","#staffRoles",false,hohMediaSort);
let digestStats = create("span",false,false,hohMediaSort,"margin-left:100px;position:relative;");
let sortOptionAlpha = create("option",false,translate("$sort_alphabetical"),sortSelect);
sortOptionAlpha.value = "alphabetical";
let sortOptionChrono2 = create("option",false,translate("$sort_newest"),sortSelect);
sortOptionChrono2.value = "chronological2";
let sortOptionChrono = create("option",false,translate("$sort_oldest"),sortSelect);
sortOptionChrono.value = "chronological";
let sortOptionPopularity = create("option",false,translate("$sort_popularity"),sortSelect);
sortOptionPopularity.value = "popularity";
let sortOptionLength = create("option",false,translate("$sort_length"),sortSelect);
sortOptionLength.value = "length";
let sortOptionScore = create("option",false,translate("$sort_score"),sortSelect);
sortOptionScore.value = "score";
if(useScripts.accessToken){
	create("option",false,translate("$sort_myScore"),sortSelect)
		.value = "myScore"
	create("option",false,translate("$sort_myProgress"),sortSelect)
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
	if(document.querySelector(".filters.container")){
		document.querySelector(".filters.container").remove()
	}
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
		return {
			chapters: 0,
			volumes: 0
		}
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
	else if(sortSelect.value === "chronological2"){
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
			return bTime.year - aTime.year
				|| bTime.month - aTime.month
				|| bTime.day - aTime.day
				|| b.endDate.year - a.endDate.year
				|| b.endDate.month - a.endDate.month
				|| b.endDate.day - a.endDate.day
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
			return aval.chapters - bval.chapters || aval.volumes - bval.volumes || b.title.localeCompare(a.title)
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
		let roleValues = {//default role value is 0, so positive values are important, negative less important
			"Director": 2,
			"Original Creator": 1.9,//important that this is early
			"Script": 1.8,
			"Storyboard": 1.75,
			"Art Director": 1.7,//personal bias :)
			"Character Design": 1.65,
			"Animation Director": 1.6,
			"Assistant Director": 1,
			"Episode Director": 1,
			"Key Animation": 0,
			"Animation": -0.1,
			"2nd Key Animation": -0.5,
			"In-Between Animation": -1
		}
		media.role.sort((b,a) => {
			let amatch = roleValues[a.match(/^(.*?)(\s*\(.*\))?$/)[1]] || 0;
			let bmatch = roleValues[b.match(/^(.*?)(\s*\(.*\))?$/)[1]] || 0;
			return amatch - bmatch
		})
		let role = create("div","role",media.role.map(word => {
			let parts = word.match(/^(.*?)(\s+\(.*\))?$/);
			let t_role = translate("$role_" + parts[1]);
			if(t_role.substring(0,6) === "$role_"){
				return word
			}
			return t_role + (parts[2] || "")
		}).join(", "),content);
		role.title = media.role.join("\n");
		if(sortSelect.value === "popularity"){
			create("span","hohStaffPageData",media.popularity,content).title = "Popularity"
		}
		else if(sortSelect.value === "score"){
			create("span","hohStaffPageData",media.score || "",content).title = "Score"
		}
		else if(sortSelect.value === "length"){
			create("span","hohStaffPageData",media.episodes || media.chapers || media.volumes || "",content).title = "Length"
		}
		else if(sortSelect.value === "myProgress"){
			let staffPageData = create("span","hohStaffPageData",false,content)
			staffPageData.title = "Progress";
			if(type === "manga"){
				staffPageData.innerText = mangaValueFunction(media).chapters || ""
			}
			else{
				let animeVal = animeValueFunction(media);
				if(animeVal > 0){
					staffPageData.innerText = (animeVal/60).roundPlaces(1) + "h";
				}
			}
		}
		else if(sortSelect.value === "myScore"){
			create("span","hohStaffPageData",(media.myStatus ? media.myStatus.scoreRaw : null) || "",content).title = "My Score"
		}
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
	let sumScoresAnime = 0;
	let sumScoresManga = 0;
	let amountAnime = 0;
	let amountManga = 0;
	let animeCurrentFlag = false;
	let mangaCurrentFlag = false;
	let distribution = {};
	let alreadyCounted = new Set();
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
			|| media.myStatus.status === "PLANNING" && ["plan to watch","plan to read","planning"].includes(query.toLowerCase())
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
			role => {
				let parts = role.match(/^(.*?)(\s+\(.*\))?$/);
				let t_role = translate("$role_" + parts[1]);
				if(t_role.substring(0,6) !== "$role_" && t_role.toLowerCase().match(query.toLowerCase())){
					return true
				}
				return role.toLowerCase().match(query.toLowerCase())
			}
		),
		"title": (query,media) => mediaMatcher["title-romaji"](query,media)
			|| mediaMatcher["title-english"](query,media)
			|| mediaMatcher["title-native"](query,media)
	}
	let voiceYear = 0;
	if(sortSelect.value === "chronological2"){
		voiceYear = 3000//Y3k, here we goooo
	}
	voiceRolesList.forEach(anime => {
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
				|| looseMatcher(anime.character.name,filterSelect.value)
			}
		}
		if(foundRole){
			if(sortSelect.value === "chronological"){
				if((anime.startDate.year || anime.endDate.year) > voiceYear){
					voiceYear = anime.startDate.year || anime.endDate.year;
					create("h3","hohYearHeading",voiceYear,hohCharacterRoles)
				}
				else if(!(anime.startDate.year || anime.endDate.year) && voiceYear > 0){
					animeYear = 0;
					create("h3","hohYearHeading","No date",hohCharacterRoles)
				}
			}
			else if(sortSelect.value === "chronological2"){
				if((anime.startDate.year || anime.endDate.year) < voiceYear){
					voiceYear = anime.startDate.year || anime.endDate.year;
					create("h3","hohYearHeading",voiceYear,hohCharacterRoles)
				}
				else if(!(anime.startDate.year || anime.endDate.year) && voiceYear > 0){
					animeYear = 0;
					create("h3","hohYearHeading","No date",hohCharacterRoles)
				}
			}
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
			if(anime.myStatus && !alreadyCounted.has(anime.id)){
				distribution[anime.myStatus.status]++;
				if(anime.myStatus.status === "CURRENT"){
					animeCurrentFlag = true
				}
				sumDuration += Math.max(animeValueFunction(anime),0);
				if(anime.myStatus.scoreRaw){
					sumScoresAnime += anime.myStatus.scoreRaw;
					amountAnime++;
				}
				alreadyCounted.add(anime.id)
			}
		}
	});
	removeChildren(hohMediaRolesAnime)
	let animeYear = 0;
	if(sortSelect.value === "chronological2"){
		animeYear = 3000
	}
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
			if(sortSelect.value === "chronological"){
				if((anime.startDate.year || anime.endDate.year) > animeYear){
					animeYear = anime.startDate.year || anime.endDate.year;
					create("h3","hohYearHeading",animeYear,hohMediaRolesAnime)
				}
				else if(!(anime.startDate.year || anime.endDate.year) && animeYear > 0){
					animeYear = 0;
					create("h3","hohYearHeading","No date",hohMediaRolesAnime)
				}
			}
			else if(sortSelect.value === "chronological2"){
				if((anime.startDate.year || anime.endDate.year) < animeYear){
					animeYear = anime.startDate.year || anime.endDate.year;
					create("h3","hohYearHeading",animeYear,hohMediaRolesAnime)
				}
				else if(!(anime.startDate.year || anime.endDate.year) && animeYear > 0){
					animeYear = 0;
					create("h3","hohYearHeading","No date",hohMediaRolesAnime)
				}
			}
			let roleCard = createRoleCard(anime,"anime");
			hohMediaRolesAnime.appendChild(roleCard);
			if(anime.myStatus && !alreadyCounted.has(anime.id)){
				distribution[anime.myStatus.status]++;
				if(anime.myStatus.status === "CURRENT"){
					animeCurrentFlag = true
				}
				sumDuration += Math.max(animeValueFunction(anime),0);
				if(anime.myStatus.scoreRaw){
					sumScoresAnime += anime.myStatus.scoreRaw;
					amountAnime++;
				}
				alreadyCounted.add(anime.id)
			}
		}
	});
	removeChildren(hohMediaRolesManga);
	let mangaYear = 0;
	if(sortSelect.value === "chronological2"){
		mangaYear = 3000
	}
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
			if(sortSelect.value === "chronological"){
				if((manga.startDate.year || manga.endDate.year) > mangaYear){
					mangaYear = manga.startDate.year || manga.endDate.year;
					create("h3","hohYearHeading",mangaYear,hohMediaRolesManga)
				}
				else if(!(manga.startDate.year || manga.endDate.year) && mangaYear > 0){
					mangaYear = 0;
					create("h3","hohYearHeading","No date",hohMediaRolesManga)
				}
			}
			else if(sortSelect.value === "chronological2"){
				if((manga.startDate.year || manga.endDate.year) < mangaYear){
					mangaYear = manga.startDate.year || manga.endDate.year;
					create("h3","hohYearHeading",mangaYear,hohMediaRolesManga)
				}
				else if(!(manga.startDate.year || manga.endDate.year) && mangaYear > 0){
					mangaYear = 0;
					create("h3","hohYearHeading","No date",hohMediaRolesManga)
				}
			}
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
					sumScoresManga += manga.myStatus.scoreRaw;
					amountManga++
				}
			}
		}
	});
	if(sumDuration || sumChapters || sumVolumes || (sumScoresAnime + sumScoresManga)){
		removeChildren(digestStats)
		if(sumDuration){
			create("span",false,translate("$staff_hoursWatched"),digestStats);
			create("span",false,(sumDuration/60).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))")
		};
		if(sumChapters){
			create("span",false,translate("$staff_chaptersRead"),digestStats);
			create("span",false,sumChapters,digestStats,"color:rgb(var(--color-blue))")
		};
		if(sumVolumes){
			create("span",false,translate("$staff_volumesRead"),digestStats);
			create("span",false,sumVolumes,digestStats,"color:rgb(var(--color-blue))")
		};
		if(amountAnime + amountManga){
			create("span",false,translate("$staff_meanScore"),digestStats);
			let averageNode = create("span",false,((sumScoresAnime + sumScoresManga)/(amountAnime + amountManga)).roundPlaces(1),digestStats,"color:rgb(var(--color-blue))");
			if(((sumScoresAnime + sumScoresManga)/(amountAnime + amountManga)) === 10 && userObject.mediaListOptions.scoreFormat === "POINT_10"){//https://anilist.co/activity/49407649
				averageNode.innerText += "/100"
			}
			if(sumScoresAnime && sumScoresManga){
				averageNode.title = "Anime: " + (sumScoresAnime/amountAnime).roundPlaces(1) + "\nManga: " + (sumScoresManga/amountManga).roundPlaces(1);
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
				statusSumDot.onclick = function(){
					if(filterSelect.value === "status:" + status.toLowerCase()){
						filterSelect.value = ""
					}
					else{
						filterSelect.value = "status:" + status.toLowerCase()
					}
					filterSelect.dispatchEvent(new Event("input",{bubbles: true}))
				}
			}
		})
	}
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
		autocomplete.add(distributionFormats[anime.format]);
		autocomplete.add(edge.staffRole);
		let parts = edge.staffRole.match(/^(.*?)(\s+\(.*\))?$/);
		let t_role = translate("$role_" + parts[1]);
		if(t_role.substring(0,6) !== "$role_"){
			autocomplete.add(t_role + (parts[2] || ""))
		}
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
		autocomplete.add(distributionFormats[manga.format]);
		autocomplete.add(edge.staffRole);
		let parts = edge.staffRole.match(/^(.*?)(\s+\(.*\))?$/);
		let t_role = translate("$role_" + parts[1]);
		if(t_role.substring(0,6) !== "$role_"){
			autocomplete.add(t_role + (parts[2] || ""))
		}
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
		let parts = edge.role.match(/^(.*?)(\s+\(.*\))?$/);
		let t_role = translate("$role_" + parts[1]);
		if(t_role.substring(0,6) !== "$role_"){
			autocomplete.add(t_role + (parts[2] || ""))
		}
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
authAPIcall(staffVoice,variables,voiceHandler)
};
selfcaller();
	}
})
