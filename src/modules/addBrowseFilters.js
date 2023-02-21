function addBrowseFilters(type){
	if(! /^\/search/.test(location.pathname)){
		return
	}
	let sorts = document.querySelector(".hohAlready");
	if(!sorts){
		sorts = document.querySelector(".sort-wrap.sort-select");
		if(!sorts){
			setTimeout(function(){addBrowseFilters(type)},200);
			return
		}
		sorts.classList.add("hohAlready")
	}
	const customSorts = {
		TITLE_ROMAJI: "Title ↑", TITLE_ROMAJI_DESC: "Title ↓",
		POPULARITY_DESC: "Popularity ↓", POPULARITY: "Popularity ↑",
		SCORE_DESC: "Average Score ↓", SCORE: "Average Score ↑",
		FAVOURITES_DESC: "Favorites ↓", FAVOURITES: "Favorites ↑",
		ID_DESC: "Date Added ↓", ID: "Date Added ↑",
		START_DATE_DESC: "Release Date ↓", START_DATE: "Release Date ↑"
	};
	const customAnime = {EPISODES_DESC: "Episodes ↓", EPISODES: "Episodes ↑", DURATION_DESC: "Duration ↓", DURATION: "Duration ↑"};
	const customManga = {CHAPTERS_DESC: "Chapters ↓", CHAPTERS: "Chapters ↑", VOLUMES_DESC: "Volumes ↓", VOLUMES: "Volumes ↑"};
	if(type === "anime"){
		Object.keys(customManga).forEach(key => delete sorts.__vue__.sortOptions[key])
		Object.assign(sorts.__vue__.sortOptions, customSorts, customAnime)
	}
	else if(type === "manga"){
		Object.keys(customAnime).forEach(key => delete sorts.__vue__.sortOptions[key])
		Object.assign(sorts.__vue__.sortOptions, customSorts, customManga)
	}
}
