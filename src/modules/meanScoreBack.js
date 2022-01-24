//rename?
function meanScoreBack(){
	const userRegex = /^\/user\/([^/]+)\/?$/;
	let URLstuff = location.pathname.match(userRegex);
	if(!URLstuff){
		return
	}
	const query = `
	query($userName: String) {
		User(name: $userName){
			statistics{
				anime{
					episodesWatched
					meanScore
				}
				manga{
					volumesRead
					meanScore
				}
			}
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,function(data){
		if(!data){
			return;
		}
		let adder = function(){
			if(
				!userRegex.test(location.pathname)
				|| location.pathname.match(userRegex)[1] !== URLstuff[1]
			){
				return
			}
			let possibleStatsWrap = document.querySelectorAll(".stats-wrap .stats-wrap");
			if(possibleStatsWrap.length){
				if(possibleStatsWrap.length === 2 && possibleStatsWrap[0].childElementCount === 3){
					if(data.data.User.statistics.anime.meanScore){
						let statAnime = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.anime.episodesWatched,statAnime);
						create("div","label",translate("$milestones_totalEpisodes"),statAnime);
						let totalDays = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = translate("$milestones_daysWatched",totalDays);
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones")
					}
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[1]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label",translate("$milestones_totalVolumes"),statManga);
						let totalChapters = possibleStatsWrap[1].children[1].children[0].innerText;
						possibleStatsWrap[1].children[1].remove();
						possibleStatsWrap[1].parentNode.querySelector(".milestone:nth-child(2)").innerText = translate("$milestones_chaptersRead",totalChapters);
						possibleStatsWrap[1].parentNode.classList.add("hohMilestones")
					}
				}
				else if(possibleStatsWrap[0].innerText.includes("Total Manga")){
					if(data.data.User.statistics.manga.meanScore){
						let statManga = create("div","stat",false,possibleStatsWrap[0]);
						create("div","value",data.data.User.statistics.manga.volumesRead,statManga);
						create("div","label",translate("$milestones_totalVolumes"),statManga);
						let totalChapters = possibleStatsWrap[0].children[1].children[0].innerText;
						possibleStatsWrap[0].children[1].remove();
						possibleStatsWrap[0].parentNode.querySelector(".milestone:nth-child(2)").innerText = translate("$milestones_chaptersRead",totalChapters);
						possibleStatsWrap[0].parentNode.classList.add("hohMilestones")
					}
				}
			}
			else{
				setTimeout(adder,200)
			}
		};adder();
	},"hohMeanScoreBack" + variables.userName,60*1000)
}
