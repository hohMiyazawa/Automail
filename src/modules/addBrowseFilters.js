exportModule({
	id: "browseFilters",
	description: "$browseFilters_description",
	isDefault: true,
	categories: ["Browse"],
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/search\/(anime|manga)/.test(url);
	},
	code: function(){
		const customSorts = {
			TITLE_ROMAJI: "Title ↑",
			TITLE_ROMAJI_DESC: "Title ↓",
			POPULARITY_DESC: "Popularity ↓",
			POPULARITY: "Popularity ↑",
			SCORE_DESC: "Average Score ↓",
			SCORE: "Average Score ↑",
			TRENDING_DESC: "Trending",
			FAVOURITES_DESC: "Favorites",
			ID_DESC: "Date Added",
			START_DATE_DESC: "Release Date ↓",
			START_DATE: "Release Date ↑"
		};
		const customAnime = {EPISODES_DESC: "Episodes ↓", EPISODES: "Episodes ↑", DURATION_DESC: "Duration ↓", DURATION: "Duration ↑"};
		const customManga = {CHAPTERS_DESC: "Chapters ↓", CHAPTERS: "Chapters ↑", VOLUMES_DESC: "Volumes ↓", VOLUMES: "Volumes ↑"};
		const sorts = document.querySelector(".sort-wrap.sort-select");
		function addSorts(){
			const type = location.pathname.match(/^\/search\/(anime|manga)/)[1];
			Object.keys(sorts.__vue__.sortOptions).forEach(key => delete sorts.__vue__.sortOptions[key])
			Object.assign(sorts.__vue__.sortOptions, customSorts, type === "anime" ? customAnime : customManga)
		}
		setTimeout(addSorts,200);
	}
})
