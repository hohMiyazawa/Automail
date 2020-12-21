function linkFixer(){
	if(location.pathname !== "/home"){
		return
	}
	let recentReviews = document.querySelector(".recent-reviews h2.section-header");
	let recentThreads = document.querySelector(".recent-threads h2.section-header");
	if(recentReviews && recentThreads){
		recentReviews.innerText = "";
		create("a",false,"Recent Reviews",recentReviews)
			.href = "/reviews";
		recentThreads.innerText = "";
		create("a",false,"Forum Activity",recentThreads)
			.href = "/forum/overview";
		let sectionHeaders = document.querySelectorAll(".section-header");
		Array.from(sectionHeaders).forEach(header => {
			if(header.innerText.match("Trending")){
				header.innerText = "";
				create("a",false,"Trending Anime",header)
					.href = "https://anilist.co/search/anime/trending";
				create("a","hover-manga"," & Manga",header)
					.href = "https://anilist.co/search/manga/trending"
			}
			else if(header.innerText.match("Newly Added Anime")){
				header.innerText = "";
				create("a",false,"Newly Added Anime",header)
					.href = "https://anilist.co/search/anime/new"
			}
			else if(header.innerText.match("Newly Added Manga")){
				header.innerText = "";
				create("a","hover-manga","Newly Added Manga",header)
					.href = "https://anilist.co/search/manga/new"
			}
		})
	}
	else{
		setTimeout(linkFixer,2000)//invisible change, does not take priority
	}
}
