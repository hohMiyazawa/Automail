async function enhanceCharacter(){//adds an exact favourite count on every character page
	if(!location.pathname.match(/^\/character(\/.*)?/)){
		return
	}
	const favWrap = document.querySelector(".favourite") || await watchElem(".favourite");
	const favCount = favWrap.querySelector(".count");
	if(!favCount){
		return;
	}
	if(!isNaN(favCount.textContent)){
		return; // abort early since the site already displays exact fav count if under 1000
	}
	const favCallback = function(data){
		favWrap.onclick = function(){
			if(favWrap.classList.contains("isFavourite")){
				favCount.textContent = parseInt(favCount.textContent) - 1;
			}
			else{
				favCount.textContent = parseInt(favCount.textContent) + 1;
			}
		};
		if(data.Character.favourites){
			favCount.textContent = data.Character.favourites;
		}
	};
	const query = `query($id: Int!){
		Character(id: $id){
			favourites
		}
	}`;
	const variables = {id: parseInt(location.pathname.match(/\/character\/(\d+)\/?/)[1])};
	const {data, errors} = await anilistAPI(query, {
		variables,
		cacheKey: "hohCharacterFavs" + variables.id,
		duration: 60*60*1000
	});
	if(errors){
		return;
	}
	return favCallback(data);
}
