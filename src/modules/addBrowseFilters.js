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
	const customAnime = {EPISODES_DESC: "Episodes ↓", EPISODES: "Episodes ↑"};
	const customManga = {CHAPTERS_DESC: "Chapters ↓", CHAPTERS: "Chapters ↑", VOLUMES_DESC: "Volumes ↓", VOLUMES: "Volumes ↑"};
	if(type === "anime"){
		Object.keys(customManga).forEach(key => delete sorts.__vue__.sortOptions[key])
		Object.assign(sorts.__vue__.sortOptions, customAnime)
	}
	else if(type === "manga"){
		Object.keys(customAnime).forEach(key => delete sorts.__vue__.sortOptions[key])
		Object.assign(sorts.__vue__.sortOptions, customManga)
	}
}
