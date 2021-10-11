if(useScripts.browseSubmenu && useScripts.CSSverticalNav && whoAmI && !useScripts.mobileFriendly){
	let addMouseover = function(){
		let navThingy = document.querySelector(`.nav .links .browse-wrap`);
		if(navThingy){
			navThingy.classList.add("subMenuContainer");
			let subMenu = create("div","hohSubMenu",false,navThingy);

			[
				{
					text: "$submenu_anime",
					href: "/search/anime",
					vue: { name: 'Search', params: {type:'anime'}}
				},
				{
					text: "$submenu_manga",
					href: "/search/manga",
					vue: { name: 'Search', params: {type:'manga'}}
				},
				{
					text: "$submenu_staff",
					href: "/search/staff",
					vue: { name: 'Search', params: {type:'staff'}}
				},
				{
					text: "$submenu_characters",
					href: "/search/characters",
					vue: { name: 'Search', params: {type:'characters'}}
				},
				{
					text: "$submenu_reviews",
					href: "/reviews",
					vue: { name: 'Reviews'}
				},
				{
					text: "$submenu_recommendations",
					href: "/recommendations",
					vue: { name: 'Recommendations'}
				}
			].forEach(link => {
				let element = create("a","hohSubMenuLink",translate(link.text),subMenu);
				element.href = link.href;
				if(link.vue){
					element.onclick = function(){
						try{
							document.getElementById('app').__vue__._router.push(link.vue);
							return false
						}
						catch(e){
							console.warn("vue routes are outdated!")
						}
					}
				}
			})
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
