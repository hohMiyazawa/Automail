function mangaGuess(cleanAnime,id){
	let sidebarData;
	let adder = function(mutations,observer){
		let URLstuff = location.pathname.match(/^\/manga\/(\d+)\/?(.*)?/);
		if(!URLstuff){
			return
		}
		sidebarData = document.querySelector(".sidebar .data");
		if(!sidebarData){
			setTimeout(adder,200);
			return
		}
		let possibleMangaGuess = sidebarData.querySelector(".data-set .value[data-media-id]");
		if(possibleMangaGuess && (
			cleanAnime
			|| id !== parseInt(possibleMangaGuess.dataset.mediaId)
		)){
			removeChildren(possibleMangaGuess)
		}
		if(cleanAnime){
			return
		}
		let status = Array.from(sidebarData.querySelectorAll(".data-set .type")).find(element => element.innerText === "Status" || element.innerText === translate("$dataSet_status"));
		if(!status || status.parentNode.childElementCount !== 2){
			return true
		}
		observer && observer.disconnect();
		let possibleReleaseStatus = status.parentNode.children[1];
		if(possibleReleaseStatus.firstChild.nodeValue !== "Releasing" && possibleReleaseStatus.firstChild.nodeValue !== "Hiatus"){
			return
		}
		if(
			possibleReleaseStatus.dataset.mediaId === URLstuff[1]
			&& possibleReleaseStatus.children.length !== 0
		){
			return
		}
		else{
			removeChildren(possibleReleaseStatus)
		}
		possibleReleaseStatus.dataset.mediaId = URLstuff[1];
		const variables = {id: parseInt(URLstuff[1]),userName: whoAmI};
		let query = `
query($id: Int,$userName: String){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
	MediaList(
		userName: $userName,
		mediaId: $id
	){
		progress
	}
}`;
		let possibleMyStatus = document.querySelector(".actions .list .add");
		const simpleQuery = !possibleMyStatus || possibleMyStatus.innerText === "Add to List" || possibleMyStatus.innerText === "Planning";
		if(simpleQuery){
			query = `
query($id: Int){
	Page(page: 1){
		activities(
			mediaId: $id,
			sort: ID_DESC
		){
			... on ListActivity{
				progress
				userId
			}
		}
	}
}`;
		}
		let highestChapterFinder = function(data){
			if(possibleReleaseStatus.children.length !== 0){
				return
			}
			let guesses = [];
			let userIdCache = new Set();
			data.data.Page.activities.forEach(activity => {
				if(activity.progress){
					let chapterMatch = parseInt(activity.progress.match(/\d+$/)[0]);
					if(!userIdCache.has(activity.userId) && chapterMatch !== 65535){
						guesses.push(chapterMatch);
						userIdCache.add(activity.userId)
					}
				}
			});
			guesses.sort(VALUE_DESC);
			if(guesses.length){
				let bestGuess = guesses[0];
				if(guesses.length > 2){
					if(guesses.filter(val => val < 7000).length){
						guesses = guesses.filter(val => val < 7000)
					}
					let diff = guesses[0] - guesses[1];
					let inverseDiff = 1 + Math.ceil(25/(diff+1));
					if(guesses.length >= inverseDiff){
						if(
							guesses[1] === guesses[inverseDiff]
							|| guesses[0] - guesses[1] > 500
							|| (guesses[0] - guesses[1] > 100 && guesses[1] >= guesses[inverseDiff] - 1)
						){
							bestGuess = guesses[1];
							if(guesses.length > 15 && guesses[1] - guesses[2] > 50 && guesses[2] === guesses[guesses.length - 1]){
								bestGuess = guesses[2]
							}
						}
					}
				}
				if(hasOwn(commonUnfinishedManga, variables.id)){
					if(bestGuess < commonUnfinishedManga[variables.id].chapters){
						bestGuess = commonUnfinishedManga[variables.id].chapters
					}
				}
				if(simpleQuery && bestGuess){
					create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus)
				}
				else{
					bestGuess = Math.max(bestGuess,data.data.MediaList.progress);
					if(bestGuess){
						if(bestGuess === data.data.MediaList.progress){
							create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus,"color:rgb(var(--color-green));")
						}
						else{
							create("span","hohGuess"," (" + bestGuess + "?)",possibleReleaseStatus);
							create("span","hohGuess"," [+" + (bestGuess - data.data.MediaList.progress) + "]",possibleReleaseStatus,"color:rgb(var(--color-red));")
						}
					}
				}
			}
		};
		try{
			generalAPIcall(query,variables,highestChapterFinder,"hohMangaGuess" + variables.id,30*60*1000)
		}
		catch(e){
			sessionStorage.removeItem("hohMangaGuess" + variables.id)
		}
	}
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: true
	};
	let observer = new MutationObserver(adder);
	adder();
	if(sidebarData){
		observer.observe(sidebarData,mutationConfig)
	}
}
