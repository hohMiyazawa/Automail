function enhanceStaffBrowse(){
	if(!document.URL.match(/\/search\/staff\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
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
		let resultsToTag = document.querySelectorAll("div.results.staff .staff");
		if(resultsToTag.length < page*data.data.Page.staff.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/staff/)){
					return
				};
				favCallback(data,page);
			},200);//may take some time to load
			return
		};
		data = data.data.Page.staff;
		data.forEach(function(staff,index){
			create("span","hohFavCountBrowse",staff.favourites,resultsToTag[(page - 1)*data.length + index].children[0]);
			if(staff.anime.pageInfo.total + staff.manga.pageInfo.total > staff.characters.pageInfo.total){
				resultsToTag[(page - 1)*data.length + index].children[0].children[0].style.backgroundImage =
				"linear-gradient(to right,rgba(var(--color-overlay),0.8),hsla(" + Math.round(
					120*(1 + staff.anime.pageInfo.total/(staff.anime.pageInfo.total + staff.manga.pageInfo.total))
				) + ",100%,50%,0.8),rgba(var(--color-overlay),0.8))"
			}
		});
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1))
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1))
};
