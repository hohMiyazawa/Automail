if(useScripts.browseSubmenu && useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .browse-wrap`);
		if(navThingy){
			navThingy.classList.add("subMenuContainer");
			let subMenu = create("div","hohSubMenu",false,navThingy);
			create("a","hohSubMenuLink","Anime",subMenu)
				.href = "/search/anime";
			create("a","hohSubMenuLink","Manga",subMenu)
				.href = "/search/manga";
			create("a","hohSubMenuLink","Staff",subMenu)
				.href = "/search/staff";
			create("a","hohSubMenuLink","Characters",subMenu)
				.href = "/search/characters";
			create("a","hohSubMenuLink","Reviews",subMenu)
				.href = "/reviews";
			create("a","hohSubMenuLink","Recommendations",subMenu)
				.href = "/recommendations";
			navThingy.onmouseenter = function(){
				subMenu.style.display = "inline"
			}
			navThingy.onmouseleave = function(){
				subMenu.style.display = "none"
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover()
}
