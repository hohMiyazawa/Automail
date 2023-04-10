function addRelationStatusDot(id){
	if(!location.pathname.match(/^\/(anime|manga)/)){
		return;
	}
	let relations = document.querySelector(".relations");
	if(relations){
		if(relations.classList.contains("hohRelationStatusDots")){
			return
		}
		relations.classList.add("hohRelationStatusDots");
	}
	authAPIcall(
`query($id: Int){
	Media(id:$id){
		relations{
			nodes{
				id
				type
				mediaListEntry{status}
			}
		}
		recommendations(sort:RATING_DESC){
			nodes{
				mediaRecommendation{
					id
					type
					mediaListEntry{status}
				}
			}
		}
	}
}`,
		{id: id},
		function(data){
			if(!data){
				return
			}
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations){
						relations.classList.add("hohRelationStatusDots");
						relations.querySelectorAll(".hohStatusDot").forEach(dot => dot.remove());
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300);
					}
				}
			};adder();
			let recsAdder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let recs = data.data.Media.recommendations.nodes.map(
					item => item.mediaRecommendation
				).filter(
					item => item.mediaListEntry
				);
				if(recs.length){
					let findCard = document.querySelector(".recommendation-card");
					if(findCard){
						findCard = findCard.parentNode;
						let adder = function(recs){
							recs.forEach(media => {
								let target = findCard.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
								if(target && !target.querySelector(".hohStatusDot")){
									let statusDot = create("div","hohStatusDot",false,target);
									statusDot.style.background = distributionColours[media.mediaListEntry.status];
									statusDot.title = media.mediaListEntry.status.toLowerCase();
								}
							});
						};adder(recs);
						let mutationConfig = {
							attributes: false,
							childList: true,
							subtree: false
						};
						let observer = new MutationObserver(function(){
							let recsCount = findCard.querySelectorAll(".recommendation-card").length
							if(recsCount > 25){
								let recs2 = [];
								let page = Math.trunc(recsCount/25);
								recsCount % 25 !== 0 && page++;
								authAPIcall(
`query($id: Int, $page: Int){
	Media(id:$id){
		recommendations(sort:RATING_DESC,page:$page){
			nodes{
				mediaRecommendation{
					id
					type
					mediaListEntry{status}
				}
			}
		}
	}
}`,
									{id: id, page: page},
									function(data){
										recs2 = data.data.Media.recommendations.nodes.map(
											item => item.mediaRecommendation
										).filter(
											item => item.mediaListEntry
										);
										adder(recs2)
									}
								)
							}
							else{
								adder(recs)
							}
						});
						observer.observe(findCard,mutationConfig)
					}
					else{
						setTimeout(recsAdder,300)
					}
				}
			};recsAdder();
		},
		"hohRelationStatusDot" + id,2*60*1000,
		false,false,
		function(data){
			let adder = function(){
				let mangaAnimeMatch = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch){
					return
				}
				if(mangaAnimeMatch[2] !== id){
					return
				}
				let rels = data.data.Media.relations.nodes.filter(media => media.mediaListEntry);
				if(rels){
					relations = document.querySelector(".relations");
					if(relations && !relations.classList.contains("hohRelationStatusDots")){
						relations.classList.add("hohRelationStatusDots");
						rels.forEach(media => {
							let target = relations.querySelector("[href^=\"/" + media.type.toLowerCase() + "/" + media.id + "/\"]");
							if(target){
								let statusDot = create("div","hohStatusDot",false,target);
								statusDot.style.background = distributionColours[media.mediaListEntry.status];
								statusDot.title = media.mediaListEntry.status.toLowerCase();
							}
						})
					}
					else{
						setTimeout(adder,300)
					}
				}
			};adder();
		}
	)
}
