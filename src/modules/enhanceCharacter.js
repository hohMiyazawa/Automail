function enhanceCharacter(){//adds a favourite count on every character page
	if(!location.pathname.match(/^\/character(\/.*)?/)){
		return
	};
	if(document.getElementById("hohFavCount")){
		return
	};
	let oldData = false;
	let favCallback = function(data){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/character\/.*/)){
				return
			}
			let favCount = document.querySelector(".favourite .count");
			if(favCount){
				favCount.parentNode.onclick = function(){
					if(favCount.parentNode.classList.contains("isFavourite")){
						favCount.innerText = Math.max(parseInt(favCount.innerText) - 1,0)//0 or above, just to avoid looking silly
					}
					else{
						favCount.innerText = parseInt(favCount.innerText) + 1
					}
				};
				if(data.data.Character.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
					favCount.innerText = data.data.Character.favourites + 1
				}
				else{
					favCount.innerText = data.data.Character.favourites
				}
			}
			else{
				setTimeout(adder,200)
			}
		};
		if(data.data.Character.favourites){
			adder()
		};
		let languages = new Set(
			data.data.Character.media.edges.map(
				edge => edge.voiceActors.map(actor => actor.language)
			).flat()
		);
		let rolesBuilder = function(){
			if(data.data.Character.media.pageInfo.lastPage > 1){
				if(data.data.Character.media.pageInfo.currentPage === 1){
					oldData = data;
					for(let i = 2;i<=data.data.Character.media.pageInfo.lastPage;i++){
						generalAPIcall(
							`query($id: Int!,$page: Int){
								Character(id: $id){
									media(page:$page,sort:POPULARITY_DESC){
										pageInfo{currentPage lastPage}
										edges{
											characterRole
											voiceActors{
												siteUrl
												name{full native}
												language
												image{large}
											}
											node{
												id
												siteUrl
												popularity
												title{romaji english native}
												coverImage{large}
											}
										}
									}
								}
							}`,
							{
								id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1]),
								page: i
							},
							favCallback,
							"hohCharacterFavs" + variables.id + "page" + i,
							60*60*1000
						)
					}
				}
				else if(data.data.Character.media.pageInfo.currentPage){
					data.data.Character.media.edges = data.data.Character.media.edges.concat(oldData.data.Character.media.edges);
					oldData = data
				}
			}
			if(languages.size < 2){
				if(!data.data.Character.media.edges.some(
					edge => edge.voiceActors.length > 1
				) && !data.data.Character.media.isSplit){
					return//no need to replace the page.
				}
			}
			let pageLocation = document.querySelector(".container.grid-wrap");
			if(!pageLocation || !pageLocation.childElementCount){
				setTimeout(rolesBuilder,200);
				return;
			};
			pageLocation.classList.add("hohCharacter");
			if(document.querySelector(".scroller")){
				document.querySelector(".scroller").remove()
			}
			removeChildren(pageLocation)
			let badLocation = pageLocation.cloneNode(true);
			pageLocation.parentNode.replaceChild(
				badLocation,
				pageLocation
			);
			pageLocation = badLocation;
			if(document.querySelector(".hohInputContainer")){
				document.querySelector(".hohInputContainer").remove()
			};
			let inputContainer = create("div","hohInputContainer",false,pageLocation.previousElementSibling,"position:relative;");
			let selector = create("select",false,false,inputContainer,"position:absolute;right:0px;bottom:5px;");
			if(languages.size < 2){
				selector.style.display = "none";
			}
			Array.from(languages).sort(
				(a,b) => {
					if(a === "JAPANESE"){
						return -1
					}
					if(b === "JAPANESE"){
						return 1
					}
					if(a === "KOREAN"){
						return 1
					}
					if(b === "KOREAN"){
						return -1
					}
					return a.localeCompare(b);
				}
			).forEach(language => {
				create("option",false,capitalize(language.toLowerCase()),selector)
					.value = language
			});
			let listBuilder = function(){
				removeChildren(pageLocation)
				if(data.data.Character.media.edges.length === 1 && languages.size < 2){//spread multiple voice actors when we have the space
					data.data.Character.media.edges = data.data.Character.media.edges[0].voiceActors.filter(
						actor => actor.language === selector.value
					).map(
						actor => {
							return {
								node: data.data.Character.media.edges[0].node,
								characterRole: data.data.Character.media.edges[0].characterRole,
								voiceActors: [actor]
							}
						}
					);
					data.data.Character.media.isSplit = true;
				}
				data.data.Character.media.edges.sort(
					(b,a) => {
						const roleValue = {
							"MAIN": 3,
							"SUPPORTING": 2,
							"BACKGROUND": 1
						};
						return roleValue[a.characterRole] - roleValue[b.characterRole] || a.node.popularity - b.node.popularity
					}
				).forEach(edge => {
					let card = create("div",["role-card","view-media-staff"],false,pageLocation,"position:relative");
					let staff = edge.voiceActors.filter(actor => actor.language === selector.value);
					if(staff.length){
						let staffSide = create("div","staff",false,card);
						let staffCover = create("a","cover",false,staffSide);
						staffCover.href = staff[0].siteUrl.replace("https://anilist.co","");
						staffCover.style.backgroundImage = "url(\"" + staff[0].image.large + "\")";
						let staffContent = create("a","content",false,staffSide);
						staffContent.href = staff[0].siteUrl.replace("https://anilist.co","");
						let staffName = staff[0].name.full
						if(useScripts.titleLanguage === "NATIVE" && staff[0].name.native){
							staffName = staff[0].name.native
						}
						let displayName = create("div","name",staffName,staffContent);
						staffCover.title = staffName;
						create("div","role",capitalize(staff[0].language.toLowerCase()),staffContent);
						if(staff.length === 2){
							staffSide.style.marginRight = "65px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
							secondCover.onmouseover = function(){
								displayName.innerText = secondName;
								staffContent.href = staff[1].siteUrl.replace("https://anilist.co","")
							}
							staffCover.onmouseover = function(){
								displayName.innerText = staffName;
								staffContent.href = staff[0].siteUrl.replace("https://anilist.co","")
							}
						}
						else if(staff.length > 2){
							staffSide.style.marginRight = "130px";
							let secondCover = create("a","cover",false,card,"position:absolute;right:65px;width:60px;height:100%;");
							secondCover.href = staff[1].siteUrl.replace("https://anilist.co","");
							let secondName = staff[1].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[1].name.native){
								secondName = staff[1].name.native
							}
							secondCover.title = secondName;
							secondCover.style.backgroundImage = "url(\"" + staff[1].image.large + "\")";
							let thirdCover = create("a","cover",false,card,"position:absolute;right:0px;width:60px;height:100%;");
							thirdCover.href = staff[2].siteUrl.replace("https://anilist.co","");
							let thirdName = staff[2].name.full
							if(useScripts.titleLanguage === "NATIVE" && staff[2].name.native){
								thirdName = staff[2].name.native
							}
							thirdCover.title = thirdName;
							thirdCover.style.backgroundImage = "url(\"" + staff[2].image.large + "\")";
							secondCover.onmouseover = function(){
								displayName.innerText = secondName;
								staffContent.href = staff[1].siteUrl.replace("https://anilist.co","")
							}
							thirdCover.onmouseover = function(){
								displayName.innerText = thirdName;
								staffContent.href = staff[2].siteUrl.replace("https://anilist.co","")
							}
							staffCover.onmouseover = function(){
								displayName.innerText = staffName;
								staffContent.href = staff[0].siteUrl.replace("https://anilist.co","")
							}
						}
					};
					let mediaSide = create("div","media",false,card);
					let mediaCover = create("a","cover",false,mediaSide);
					mediaCover.href = edge.node.siteUrl.replace("https://anilist.co","");;
					mediaCover.style.backgroundImage = "url(\"" + edge.node.coverImage.large + "\")";
					let mediaContent = create("a","content",false,mediaSide);
					mediaContent.href = edge.node.siteUrl.replace("https://anilist.co","");
					let title = edge.node.title.romaji;
					if(useScripts.titleLanguage === "NATIVE" && edge.node.title.native){
						title = edge.node.title.native
					}
					else if(useScripts.titleLanguage === "ENGLISH" && edge.node.title.english){
						title= edge.node.title.english
					};
					if(aliases.has(edge.node.id)){
						title = aliases.get(edge.node.id)
					}
					create("div","name",title,mediaContent);
					create("div","role",capitalize(edge.characterRole.toLowerCase()),mediaContent);
				})
			};listBuilder();
			selector.onchange = listBuilder;
		};rolesBuilder();
	};
	const variables = {id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1])};
	generalAPIcall(
		`query($id: Int!){
			Character(id: $id){
				favourites
				media(page:1,sort:POPULARITY_DESC){
					pageInfo{currentPage lastPage}
					edges{
						characterRole
						voiceActors{
							siteUrl
							name{full native}
							language
							image{large}
						}
						node{
							id
							siteUrl
							popularity
							title{romaji english native}
							coverImage{large}
						}
					}
				}
			}
		}`,
		variables,
		favCallback,
		"hohCharacterFavs" + variables.id + "page1",
		60*60*1000
	);
};
