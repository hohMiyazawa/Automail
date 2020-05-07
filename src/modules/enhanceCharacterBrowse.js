function enhanceCharacterBrowse(){
	if(!document.URL.match(/\/search\/characters\/?(favorites)?$/)){
		return
	};
	const query = `
query($page: Int!){
	Page(page: $page,perPage: 20){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
	let favCallback = function(data,page){
		if(!document.URL.match(/\/search\/characters\/?(favorites)?$/)){
			return
		};
		let resultsToTag = document.querySelectorAll(".results .staff-card");
		if(resultsToTag.length < page*data.data.Page.characters.length){
			setTimeout(function(){
				favCallback(data,page)
			},200);//may take some time to load
			return;
		};
		data = data.data.Page.characters;
		data.forEach((character,index) => create(
			"span",
			"hohFavCountBrowse",
			character.favourites,
			resultsToTag[(page - 1)*data.length + index]
		).title = "Favourites");
		generalAPIcall(query,{page:page+1},data => favCallback(data,page+1));
	};
	generalAPIcall(query,{page:1},data => favCallback(data,1));
};

