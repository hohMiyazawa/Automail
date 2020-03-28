function addBrowseFilters(type){
	if(! /^\/search/.test(location.pathname)){
		return
	};
	let sorts = document.querySelector(".hohAlready");
	if(!sorts){
		sorts = document.querySelector(".filter-group .el-select-dropdown .el-select-dropdown__list");
		if(!sorts){
			setTimeout(function(){addBrowseFilters(type)},200);
			return
		};
		sorts.classList.add("hohAlready");
	};
	let alreadyAdded = document.querySelectorAll(".hohSorts");
	alreadyAdded.forEach(aready => aready.remove());
	let URLredirect = function(property,value){
		let url = new URLSearchParams(location.search);
		url.set(property,value);
		window.location.href = location.protocol + "//" + location.host + location.pathname + "?" + url.toString()
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
					currentHover.classList.remove("hover")
				};
				this.classList.add("hover")
			}
		};
		episodeSort.onclick = function(){
			URLredirect("sort","EPISODES_DESC")
		};
		episodeSortb.onclick = function(){
			URLredirect("sort","EPISODES")
		}
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
					currentHover.classList.remove("hover")
				};
				this.classList.add("hover")
			}
		};
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
