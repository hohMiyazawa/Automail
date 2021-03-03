function addStudioBrowseSwitch(){
	let URLstuff = location.pathname.match(/^\/studio\//)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".studio-page-unscoped .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".studio-page-unscoped");
	if(!target){
		setTimeout(addStudioBrowseSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target);
	target.classList.add("cardView");
	let listView = create("span",false,false,themeSwitch);
	listView.title = "List View";
	let cardView = create("span","active",false,themeSwitch);
	cardView.title = "Card View";
	listView.appendChild(svgAssets2.bigListView.cloneNode(true));
	cardView.appendChild(svgAssets2.compactView.cloneNode(true));
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.add("listView");
	}
}
