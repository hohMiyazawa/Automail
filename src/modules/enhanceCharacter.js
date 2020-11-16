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
		}
	};
	const variables = {id: parseInt(document.URL.match(/\/character\/(\d+)\/?/)[1])};
	generalAPIcall(
		`query($id: Int!){
			Character(id: $id){
				favourites
			}
		}`,
		variables,
		favCallback,
		"hohCharacterFavs" + variables.id + "page1",
		60*60*1000
	)
};
