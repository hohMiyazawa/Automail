function enhanceStaff(){
	if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
		return
	}
	if(document.querySelector(".hohFavCount")){
		return
	};
	const variables = {id: document.URL.match(/\/staff\/(\d+)\/?/)[1]};
	const query = "query($id: Int!){Staff(id: $id){favourites}}";
	let favCallback = function(data){
		if(!document.URL.match(/^https:\/\/anilist\.co\/staff\/.*/)){
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
			if(data.data.Staff.favourites === 0 && favCount[0].classList.contains("isFavourite")){//safe to assume
				favCount.innerText = data.data.Staff.favourites + 1
			}
			else{
				favCount.innerText = data.data.Staff.favourites
			}
		}
		else{
			setTimeout(function(){favCallback(data)},200)
		}
	};
	generalAPIcall(query,variables,favCallback,"hohStaffFavs" + variables.id,60*60*1000)
}
