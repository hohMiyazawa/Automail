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

	let applySorts = function(){
		if(! /^\/search/.test(location.pathname)){
			return
		}
		let dropdown = sorts.querySelector(".dropdown");
		if(!dropdown){
			setTimeout(applySorts,200);
			return
		}
		let alreadyAdded = document.querySelectorAll(".hohSorts");
		alreadyAdded.forEach(aready => aready.remove());
		const linkHandler = function(elem, query){
			const pageQuery = Object.fromEntries(new URLSearchParams(location.search));
			if(/\/top-manhwa$/.test(location.pathname)){
				pageQuery["country of origin"] = "KR";
			}
			cheapReload(elem, {...{name: "Search", params: {type}}, ...{query: pageQuery}, ...query})
		};
		if(type === "anime"){
			let episodeSort = create("div",["option","hohSorts"],"Episodes ↓",dropdown);
			let episodeSortb = create("div",["option","hohSorts"],"Episodes ↑",dropdown);
			linkHandler(episodeSort, {query: {sort: "EPISODES_DESC"}})
			linkHandler(episodeSortb, {query: {sort: "EPISODES"}})
		}
		else if(type === "manga"){
			let chapterSort = create("div",["option","hohSorts"],"Chapters ↓",dropdown);
			let chapterSortb = create("div",["option","hohSorts"],"Chapters ↑",dropdown);
			let volumeSort = create("div",["option","hohSorts"],"Volumes ↓",dropdown);
			let volumeSortb = create("div",["option","hohSorts"],"Volumes ↑",dropdown);
			linkHandler(chapterSort, {query: {sort: "CHAPTERS_DESC"}})
			linkHandler(chapterSortb, {query: {sort: "CHAPTERS"}})
			linkHandler(volumeSort, {query: {sort: "VOLUMES_DESC"}})
			linkHandler(volumeSortb, {query: {sort: "VOLUMES"}})
		}
	}
	sorts.addEventListener("click", applySorts)
}
