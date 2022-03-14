async function enhanceCharacter(){//adds an exact favourite count on every character page
	if(!location.pathname.match(/^\/character(\/.*)?/)){
		return
	}
	if(document.getElementById("hohFavCount")){
		return
	}
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
				if(data.Character.favourites === 0 && favCount[0].classList.contains("isFavourite")){//safe to assume
					favCount.innerText = data.Character.favourites + 1
				}
				else{
					favCount.innerText = data.Character.favourites
				}
			}
			else{
				setTimeout(adder,200)
			}
		};
		if(data.Character.favourites){
			adder()
		}
	};
	const query = `query($id: Int!){
		Character(id: $id){
			favourites
		}
	}`;
	const variables = {id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1])};
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
