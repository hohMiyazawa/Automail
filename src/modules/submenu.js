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
				linkStats.href = "/user/" + whoAmI + "/stats/manga/overview";
				cheapReload(linkStats,{path: "/user/" + whoAmI + "/stats/manga/overview"});
			}
			else{
				linkStats.href = "/user/" + whoAmI + "/stats/anime/overview";
				cheapReload(linkStats,{path: "/user/" + whoAmI + "/stats/anime/overview"});
			}
			[
				{
					text: "$submenu_social",
					href: "/user/" + whoAmI + "/social",
					vue: {path: "/user/" + whoAmI + "/social"}
				},
				{
					text: "$submenu_reviews",
					href: "/user/" + whoAmI + "/reviews",
					vue: {path: "/user/" + whoAmI + "/reviews"}
				},
				{
					text: "$submenu_favourites",
					href: "/user/" + whoAmI + "/favorites",
					vue: {path: "/user/" + whoAmI + "/favorites"}
				},
				{
					text: "$submenu_submissions",
					href: "/user/" + whoAmI + "/submissions",
					vue: {path: "/user/" + whoAmI + "/submissions"}
				}
			].forEach(link => {
				let element = create("a","hohSubMenuLink",translate(link.text),subMenu);
				element.href = link.href;
				if(link.vue){
					cheapReload(element,link.vue)
				}
			})
			hackContainer.onmouseenter = function(){
				subMenu.style.display = "inline"
			}
			hackContainer.onmouseleave = function(){
				subMenu.style.display = "none"
			}
		}
		else{
			setTimeout(addMouseover,500)
		}
	};addMouseover()
}
