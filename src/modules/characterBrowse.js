exportModule({
	id: "characterBrowseFavouriteCount",
	description: "Add favourite counts to character browse pages",
	isDefault: true,
	categories: ["Browse"],
	visible: false,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/search\/characters\/?(favorites)?$/.test(url)
	},
	code: function(){
		let pageCount = 0;
		let perPage = 30;
		const query = `
query($page: Int!,$perPage: Int!){
	Page(page: $page,perPage: $perPage){
		characters(sort: [FAVOURITES_DESC]){
			id
			favourites
		}
	}
}`;
		const results = document.querySelector(".landing-section.characters > .results, .results.cover");
		let charCount = results.childElementCount;

		const insertFavs = function(data){
			const chars = data.Page.characters;
			chars.forEach((character,index) => create(
				"span",
				"hohFavCountBrowse",
				character.favourites,
				results.children[(pageCount - 1)*chars.length + index]
			).title = translate("$characterBrowseTooltip"));
		}

		const getFavs = async function(){
			pageCount++
			const {data, errors} = await anilistAPI(query, {
				variables: {page: pageCount, perPage}
			})
			if(errors){
				return;
			}
			return insertFavs(data);
		}

		if(!/\/search\/characters\/?$/.test(location.pathname)){ // full favorites page
			perPage = 20;
			new MutationObserver((_mutations) => {
				if(results.childElementCount !== charCount && results.childElementCount % 20 === 0){
					charCount = results.childElementCount;
					getFavs();
				}
			}).observe(results, { subtree: true, childList: true })
		}

		getFavs();
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
