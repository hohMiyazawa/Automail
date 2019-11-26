function enhanceStudio(){//adds a favourite count to every studio page
	if(!location.pathname.match(/^\/studio(\/.*)?/)){
		return
	};
	let filterGroup = document.querySelector(".container.header");
	if(!filterGroup){
		setTimeout(enhanceStudio,200);//may take some time to load
		return;
	};
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/studio\/.*/)){
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
			if(data.data.Studio.favourites === 0 && favButton[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Studio.favourites + 1
			}
			else{
				favCount.innerText = data.data.Studio.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200);
		}
		let scoreSum = 0;
		let amount = 0;
		data.data.Studio.media.nodes.forEach(media => {
			if(media.meanScore){
				scoreSum += media.meanScore;
				amount++
			}
		});
		if(amount){
			let scoreAverage = create("span","#hohFavCount",
				(scoreSum/amount).roundPlaces(1) + "%",
				filterGroup,"top:45px;color:rgb(var(--color-blue));z-index:45;font-size:1.2rem;"
			)
		}
	};
	const variables = {id: location.pathname.match(/\/studio\/(\d+)\/?/)[1]};
	generalAPIcall(
		`
query($id: Int!){
	Studio(id: $id){
		favourites
		media(isMain:true,sort:POPULARITY_DESC){
			nodes{
				meanScore
			}
		}
	}
}`,
		variables,favCallback,"hohStudioFavs" + variables.id,60*60*1000
	);
};
