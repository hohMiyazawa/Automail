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
		const linkHandler = function(elem, sort){
			elem.onclick = () => {
				sorts.__vue__.setSort(sort);
				sorts.__vue__.close();
			}
		};
		if(type === "anime"){
			let episodeSort = create("div",["option","hohSorts"],"Episodes ↓",dropdown);
			let episodeSortb = create("div",["option","hohSorts"],"Episodes ↑",dropdown);
			linkHandler(episodeSort, "EPISODES_DESC")
			linkHandler(episodeSortb, "EPISODES")
		}
		else if(type === "manga"){
			let chapterSort = create("div",["option","hohSorts"],"Chapters ↓",dropdown);
			let chapterSortb = create("div",["option","hohSorts"],"Chapters ↑",dropdown);
			let volumeSort = create("div",["option","hohSorts"],"Volumes ↓",dropdown);
			let volumeSortb = create("div",["option","hohSorts"],"Volumes ↑",dropdown);
			linkHandler(chapterSort, "CHAPTERS_DESC")
			linkHandler(chapterSortb, "CHAPTERS")
			linkHandler(volumeSort, "VOLUMES_DESC")
			linkHandler(volumeSortb, "VOLUMES")
		}
	}
	sorts.addEventListener("click", applySorts)
}
