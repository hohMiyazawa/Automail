if(useScripts.browseSubmenu && useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .browse-wrap`);
		if(navThingy){
			navThingy.classList.add("subMenuContainer");
			let subMenu = create("div","hohSubMenu",false,navThingy);
			create("a","hohSubMenuLink",translate("$submenu_anime"),subMenu)
				.href = "/search/anime";
			create("a","hohSubMenuLink",translate("$submenu_manga"),subMenu)
				.href = "/search/manga";
			create("a","hohSubMenuLink",translate("$submenu_staff"),subMenu)
				.href = "/search/staff";
			create("a","hohSubMenuLink",translate("$submenu_characters"),subMenu)
				.href = "/search/characters";
			create("a","hohSubMenuLink",translate("$submenu_reviews"),subMenu)
				.href = "/reviews";
			create("a","hohSubMenuLink",translate("$submenu_recommendations"),subMenu)
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
