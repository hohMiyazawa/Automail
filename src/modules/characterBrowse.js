exportModule({
	id: "characterBrowseFavouriteCount",
	description: "Add favourite counts to character browse pages",
	isDefault: true,
	categories: ["Browse"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/search\/characters/)
	},
	code: async function(){
		if(
			!document.URL.match(/\/search\/characters\/?(favorites)?$/)
		){
			return
		}
		const query = `
query($page: Int!){
	Page(page: $page,perPage: 20){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
		let favCallback = async function(data,page){
			if(!document.URL.match(/\/search\/characters\/?(favorites)?$/)){
				return
			}
			let resultsToTag = document.querySelectorAll(".results.cover .staff-card,.landing-section.characters .staff-card");
			if(resultsToTag.length < page*data.Page.characters.length){
				setTimeout(function(){
					favCallback(data,page)
				},200);//may take some time to load
				return;
			}
			data = data.Page.characters;
			data.forEach((character,index) => create(
				"span",
				"hohFavCountBrowse",
				character.favourites,
				resultsToTag[(page - 1)*data.length + index]
			).title = translate("$characterBrowseTooltip"));
			const {ndata, errors} = await anilistAPI(query, {
				variables: {page: page + 1}
			})
			if(errors){
				return;
			}
			return favCallback(ndata, page + 1);
		};
		const {data, errors} = await anilistAPI(query, {
			variables: {page: 1}
		})
		if(errors){
			return;
		}
		return favCallback(data, 1);
	},
	css: `
.hohFavCountBrowse{
	color: rgb(var(--color-text-lighter));
	position: absolute;
	right: 2px;
	font-size: 60%;
	opacity: 0.7;
	top: -10px;
}`
})
