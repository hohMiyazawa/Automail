function enhanceCharacterBrowse(){
	if(!document.URL.match(/\/search\/characters\/?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
	let favCallback = function(data,page){
		let resultsToTag = document.querySelectorAll("div.results.characters .character");
		if(resultsToTag.length < page*data.data.Page.characters.length){
			setTimeout(function(){
				if(!location.pathname.match(/^\/search\/characters/)){
					return;
				};
				favCallback(data,page);
			},200);//may take some time to load
			return;
		};
		data = data.data.Page.characters;
		data.forEach((character,index) => create(
			"span",
			"hohFavCountBrowse",
			character.favourites,
			resultsToTag[(page - 1)*data.length + index].children[0]
		));
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1));
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1));
};

