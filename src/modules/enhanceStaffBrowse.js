function enhanceStaffBrowse(){
	if(!document.URL.match(/\/search\/staff\/?(favorites)?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page,perPage: 30){
		staff(sort: [FAVOURITES_DESC]){
			id
			favourites
			anime:staffMedia(type:ANIME){
				pageInfo{
					total
				}
			}
			manga:staffMedia(type:MANGA){
				pageInfo{
					total
				}
			}
			characters{
				pageInfo{
					total
				}
			}
		}
	}
}`;
	let favCallback = function(data,page){
		if(!document.URL.match(/\/search\/staff\/?(favorites)?$/)){
			return
		};
		let resultsToTag = document.querySelectorAll(".results.cover .staff-card,.landing-section.staff .staff-card");
		if(resultsToTag.length < page*data.data.Page.staff.length){
			setTimeout(function(){
				favCallback(data,page)
			},200);//may take some time to load
			return
		};
		data = data.data.Page.staff;
		data.forEach(function(staff,index){
			create("span","hohFavCountBrowse",staff.favourites,resultsToTag[(page - 1)*data.length + index]).title = "Favourites";
			if(staff.anime.pageInfo.total + staff.manga.pageInfo.total > staff.characters.pageInfo.total){
				let roleLine = create("div","hohRoleLine",false,resultsToTag[(page - 1)*data.length + index]);
				roleLine.style.backgroundImage =
				"linear-gradient(to right,hsla(" + Math.round(
					120*(1 + staff.anime.pageInfo.total/(staff.anime.pageInfo.total + staff.manga.pageInfo.total))
				) + ",100%,50%,0.8),rgba(var(--color-overlay),0.8))";
				let animePercentage = Math.round(100*staff.anime.pageInfo.total/(staff.anime.pageInfo.total + staff.manga.pageInfo.total));
				if(animePercentage === 100){
					roleLine.title = "100% anime"
				}
				else if(animePercentage === 0){
					roleLine.title = "100% manga"
				}
				else if(animePercentage >= 50){
					roleLine.title = animePercentage + "% anime, " + (100 - animePercentage) + "% manga"
				}
				else{
					roleLine.title = (100 - animePercentage) + "% manga, " + animePercentage + "% anime"
				}
			}
		});
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1))
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1))
};
