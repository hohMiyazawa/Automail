exportModule({
	id: "extraFavs",
	description: "Make scrollable favourite sections on profiles",
	extendedDescription: `
Work in progress. Only anime and manga so far.`,
	isDefault: true,
	importance: 0,
	categories: ["Profiles"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/user\/(.*?)\/?$/)
	},
	code: function(){
		let finder = function(){
			const URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*?)\/?$/);
			if(!URLstuff){
				return
			}
			const favSection = document.querySelector(".favourites-wrap.anime");
			if(!favSection){
				setTimeout(finder,1000);
				return
			}
			if(favSection.classList.contains("hohExtraFavs")){
				if(favSection.dataset.user === decodeURIComponent(URLstuff[1])){
					return
				}
				else{
					Array.from(favSection.querySelectorAll(".hohExtraFav")).forEach(fav => fav.remove())
				}
			}
			favSection.dataset.user = decodeURIComponent(URLstuff[1]);
			if(favSection.children.length === 0){
				setTimeout(finder,1000);
				return
			}
			if(
				favSection.children.length < 25 //user has all favs on profile
				|| favSection.children.length > 25 //if I have messed up somehow
			){
				return
			}
			favSection.classList.add("hohExtraFavs");
			generalAPIcall(//private users will not be able to use this on themselves, funnily enough.
`
query($user: String!){
	User(name: $user){
		favourites{
			anime1:anime(page:2){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
			anime2:anime(page:3){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
			anime3:anime(page:4){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
		}
	}
}
`,//top 100 is enough in most cases
				{
					user: decodeURIComponent(URLstuff[1]),
				},
				function(data){
					favSection.style.maxHeight = (favSection.clientHeight || 615) + "px";
					if(!data){
						return//could be a private profile
					}
					const firstFav = favSection.children[0].getAttributeNames();
					const dataAttrs = firstFav.filter((attr) => attr.includes("data"));
					let findTooltip = function(){
						let possibleTooltip = document.querySelector(".tooltip.visible.animate-position");
						if(
							!possibleTooltip
							|| !possibleTooltip.querySelector(".content")
						){
							let candidates = Array.from(document.querySelectorAll(".tooltip.animate-position")).filter(
								tooltip => tooltip.querySelector(".content") && !tooltip.innerText.match(/Manga$/)
							)
							if(candidates.length){
								possibleTooltip = candidates[0]
							}
						}
						return possibleTooltip
					}
					let elderText = null;
					let elderRestorer = function(){
						let possibleTooltip = findTooltip();
						if(possibleTooltip){
							possibleTooltip.children[0].childNodes[0].textContent = elderText.title;
							possibleTooltip.children[1].childNodes[0].textContent = elderText.extra;
							possibleTooltip.style.transform = elderText.position;
							elderText = null;
							possibleTooltip.style.pointerEvents = "none"
						}
					}
					data.data.User.favourites.anime1.nodes.concat(
						data.data.User.favourites.anime2.nodes
					).concat(
						data.data.User.favourites.anime3.nodes
					).forEach(fav => {
						let element = create("a",["favourite","media","hohExtraFav"],false,favSection,'background-image: url("' + fav.coverImage.large + '")');
						dataAttrs.forEach(attr => element.setAttribute(attr, ""))
						element.href = "/anime/" + fav.id + "/" + safeURL(titlePicker(fav));
						cheapReload(element,{path: element.pathname})
						element.onmouseover = function(){
							let possibleTooltip = findTooltip();
							if(possibleTooltip){
								possibleTooltip.classList.add("visible");
								if(!elderText){
									elderText = {
										title: possibleTooltip.children[0].childNodes[0].textContent,
										extra: possibleTooltip.children[1].childNodes[0].textContent,
										position: possibleTooltip.style.transform
									}
									possibleTooltip.addEventListener("mouseenter",elderRestorer,{once: true});
									possibleTooltip.style.pointerEvents = "unset"
								}
								possibleTooltip.children[0].childNodes[0].textContent = titlePicker(fav);
								possibleTooltip.children[1].childNodes[0].textContent = [fav.startDate ? (fav.startDate.year || "") : "", distributionFormats[fav.format] || ""].join(" ")
								let pos = element.getBoundingClientRect();
								let pos2 = possibleTooltip.getBoundingClientRect();
								let x_offset = Math.round(pos.left + window.scrollX - pos2.width/2 + pos.width/2);
								let y_offset = Math.round(pos.top + window.scrollY - pos2.height - 10);
								possibleTooltip.style.transform = "translate(" + x_offset + "px, " + y_offset + "px)"
							}
							else{
								element.title = titlePicker(fav)
							}
						}
						element.onmouseout = function(){
							let possibleTooltip = findTooltip();
							if(possibleTooltip){
								possibleTooltip.classList.remove("visible");
							}
						}
					})
				},
				"hohExtraFavs" + URLstuff[1],
				60*60*1000//cache for an hour
			)
		};finder()
		let finder2 = function(){
			const URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.*?)\/?$/);
			if(!URLstuff){
				return
			}
			const favSection = document.querySelector(".favourites-wrap.manga");
			if(!favSection){
				setTimeout(finder2,1000);
				return
			}
			if(favSection.classList.contains("hohExtraFavs")){
				return
			}
			if(favSection.children.length === 0){
				setTimeout(finder2,1000);
				return
			}
			if(
				favSection.children.length < 25 //user has all favs on profile
				|| favSection.children.length > 25 //if I have messed up somehow
			){
				return
			}
			favSection.classList.add("hohExtraFavs");
			generalAPIcall(
`
query($user: String!){
	User(name: $user){
		favourites{
			manga1:manga(page:2){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
			manga2:manga(page:3){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
			manga3:manga(page:4){
				nodes{
					id
					coverImage{large}
					startDate{year}
					format
					title{romaji native english}
				}
			}
		}
	}
}
`,//top 100 is enough in most cases
				{
					user: decodeURIComponent(URLstuff[1]),
				},
				function(data){
					favSection.style.maxHeight = (favSection.clientHeight || 615) + "px";
					if(!data){
						return//could be a private profile
					}
					const firstFav = favSection.children[0].getAttributeNames();
					const dataAttrs = firstFav.filter((attr) => attr.includes("data"));
					let findTooltip = function(){
						let possibleTooltip = document.querySelector(".tooltip.visible.animate-position");
						if(possibleTooltip.innerText.match(/(TV|Movie)$/)){
							possibleTooltip = null
						}
						if(
							!possibleTooltip
							|| !possibleTooltip.querySelector(".content")
						){
							let candidates = Array.from(document.querySelectorAll(".tooltip.animate-position")).filter(
								tooltip => tooltip.querySelector(".content") && !tooltip.innerText.match(/(TV|Movie)$/)
							)
							if(candidates.length){
								possibleTooltip = candidates[0]
							}
						}
						return possibleTooltip
					}
					let elderText = null;
					let elderRestorer = function(){
						let possibleTooltip = findTooltip();
						if(possibleTooltip){
							possibleTooltip.children[0].childNodes[0].textContent = elderText.title;
							possibleTooltip.children[1].childNodes[0].textContent = elderText.extra;
							possibleTooltip.style.transform = elderText.position;
							elderText = null;
							possibleTooltip.style.pointerEvents = "none"
						}
					}
					data.data.User.favourites.manga1.nodes.concat(
						data.data.User.favourites.manga2.nodes
					).concat(
						data.data.User.favourites.manga3.nodes
					).forEach(fav => {
						let element = create("a",["favourite","media","hohExtraFav"],false,favSection,'background-image: url("' + fav.coverImage.large + '")');
						dataAttrs.forEach(attr => element.setAttribute(attr, ""))
						element.href = "/manga/" + fav.id + "/" + safeURL(titlePicker(fav));
						cheapReload(element,{path: element.pathname})
						element.onmouseover = function(){
							let possibleTooltip = findTooltip();
							if(possibleTooltip){
								possibleTooltip.classList.add("visible");
								if(!elderText){
									elderText = {
										title: possibleTooltip.children[0].childNodes[0].textContent,
										extra: possibleTooltip.children[1].childNodes[0].textContent,
										position: possibleTooltip.style.transform
									}
									possibleTooltip.addEventListener("mouseenter",elderRestorer,{once: true});
									possibleTooltip.style.pointerEvents = "unset"
								}
								possibleTooltip.children[0].childNodes[0].textContent = titlePicker(fav);
								possibleTooltip.children[1].childNodes[0].textContent = [fav.startDate ? (fav.startDate.year || "") : "", distributionFormats[fav.format] || ""].join(" ")
								let pos = element.getBoundingClientRect();
								let pos2 = possibleTooltip.getBoundingClientRect();
								let x_offset = Math.round(pos.left + window.scrollX - pos2.width/2 + pos.width/2);
								let y_offset = Math.round(pos.top + window.scrollY - pos2.height - 10);
								possibleTooltip.style.transform = "translate(" + x_offset + "px, " + y_offset + "px)"
							}
							else{
								element.title = titlePicker(fav)
							}
						}
						element.onmouseout = function(){
							let possibleTooltip = findTooltip();
							if(possibleTooltip){
								possibleTooltip.classList.remove("visible");
							}
						}
					})
				},
				"hohExtraFavsManga" + URLstuff[1],
				60*60*1000//cache for an hour
			)
		};finder2()
	},
	css: `
.hohExtraFavs:hover{
	overflow-y: auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}
.hohExtraFavs:hover::-webkit-scrollbar{
	width: 0;
	height: 0;
}
`
})
