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
	let compactListView = create("span",false,false,themeSwitch);
	let listView = create("span",false,false,themeSwitch);
	let compactView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	compactListView.innerHTML = svgAssets.listView;
	listView.innerHTML = svgAssets.bigListView;
	compactView.innerHTML = svgAssets.compactView;
	cardView.innerHTML = svgAssets.cardView;
	compactView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactView.classList.add("active");
		target.classList.remove("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.remove("compactListView");
	}
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		target.classList.add("cardView");
		target.classList.add("listView");
		target.classList.remove("compactListView");
	}
	compactListView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		compactListView.classList.add("active");
		target.classList.add("cardView");
		target.classList.remove("listView");
		target.classList.add("compactListView");
	}
}
