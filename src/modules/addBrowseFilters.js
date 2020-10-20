function addBrowseFilters(type){
	if(! /^\/search/.test(location.pathname)){
		return
	};
	let sorts = document.querySelector(".hohAlready");
	if(!sorts){
		sorts = document.querySelector(".sort-wrap.sort-select");
		if(!sorts){
			setTimeout(function(){addBrowseFilters(type)},200);
			return
		};
		sorts.classList.add("hohAlready")
	};

	let applySorts = function(){
		if(! /^\/search/.test(location.pathname)){
			return
		};
		let dropdown = sorts.querySelector(".dropdown");
		if(!dropdown){
			setTimeout(applySorts,200);
			return
		}
		let alreadyAdded = document.querySelectorAll(".hohSorts");
		alreadyAdded.forEach(aready => aready.remove());
		let URLredirect = function(property,value){
			let url = new URLSearchParams(location.search);
			url.set(property,value);
			if(location.pathname.match(/\/top-manhwa$/)){
				url.set("country of origin","KR")
			}
			window.location.href = location.protocol
			+ "//"
			+ location.host
			+ location.pathname.replace(
				/\/(popular|top-100|next-season|this-season|trending|top-manhwa)$/,
				""
			)
			+ "?" + url.toString()
		};
		if(type === "anime"){
			let episodeSort = create("div",["option","hohSorts"],"Episodes ↓",dropdown);
			let episodeSortb = create("div",["option","hohSorts"],"Episodes ↑",dropdown);
			episodeSort.onclick = function(){
				URLredirect("sort","EPISODES_DESC")
			};
			episodeSortb.onclick = function(){
				URLredirect("sort","EPISODES")
			}
		}
		else if(type === "manga"){
			let chapterSort = create("div",["option","hohSorts"],"Chapters ↓",dropdown);
			let chapterSortb = create("div",["option","hohSorts"],"Chapters ↑",dropdown);
			let volumeSort = create("div",["option","hohSorts"],"Volumes ↓",dropdown);
			let volumeSortb = create("div",["option","hohSorts"],"Volumes ↑",dropdown);
			chapterSort.onclick = function(){
				URLredirect("sort","CHAPTERS_DESC")
			};
			chapterSortb.onclick = function(){
				URLredirect("sort","CHAPTERS")
			};
			volumeSort.onclick = function(){
				URLredirect("sort","VOLUMES_DESC")
			};
			volumeSortb.onclick = function(){
				URLredirect("sort","VOLUMES")
			}
		}
	}
	sorts.onclick = applySorts();
}
