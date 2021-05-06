if(useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .link[href^="/user/"]`);
		if(navThingy){
			navThingy.style.position = "relative";
			let hackContainer = create("div","subMenuContainer",false,false,"position:relative;width:100%;min-height:50px;z-index:134;display:inline-flex;");
			navThingy.parentNode.insertBefore(hackContainer,navThingy);
			hackContainer.appendChild(navThingy);
			let subMenu = create("div","hohSubMenu",false,hackContainer);
			let linkStats = create("a","hohSubMenuLink",translate("$submenu_stats"),subMenu);
			if(useScripts.mangaBrowse){
				linkStats.href = "/user/" + whoAmI + "/stats/manga/overview"
			}
			else{
				linkStats.href = "/user/" + whoAmI + "/stats/anime/overview"
			}
			create("a","hohSubMenuLink",translate("$submenu_social"),subMenu)
				.href = "/user/" + whoAmI + "/social";
			create("a","hohSubMenuLink",translate("$submenu_reviews"),subMenu)
				.href = "/user/" + whoAmI + "/reviews";
			create("a","hohSubMenuLink",translate("$submenu_favourites"),subMenu)
				.href = "/user/" + whoAmI + "/favorites";
			create("a","hohSubMenuLink",translate("$submenu_submissions"),subMenu)
				.href = "/user/" + whoAmI + "/submissions";
			hackContainer.onmouseenter = function(){
				subMenu.style.display = "inline";
			}
			hackContainer.onmouseleave = function(){
				subMenu.style.display = "none";
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover();
}
