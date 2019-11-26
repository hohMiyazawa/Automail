let titleObserver = new MutationObserver(function(mutations){
	let title = document.querySelector("head > title").textContent;
	let titleMatch = title.match(/(.*)\s\((\d+)\)\s\((.*)\s\(\2\)\)(.*)/);//ugly nested paranthesis like "Tetsuwan Atom (1980) (Astro Boy (1980)) · AniList"
	if(titleMatch){
		//change to the form "Tetsuwan Atom (Astro Boy 1980) · AniList"
		document.title = titleMatch[1] + " (" + titleMatch[3] + " " + titleMatch[2] + ")" + titleMatch[4];
	}
	if(document.URL.match(/^https:\/\/anilist\.co\/search\/characters/) && title !== "Find Characters · AniList"){
		document.title = "Find Characters · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/staff/) && title !== "Find Staff · AniList"){
		document.title = "Find Staff · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/studios/) && title !== "Find Studios · AniList"){
		document.title = "Find Studios · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/anime/) && title !== "Find Anime · AniList"){
		document.title = "Find Anime · AniList"
	}
	else if(document.URL.match(/^https:\/\/anilist\.co\/search\/manga/) && title !== "Find Manga · AniList"){
		document.title = "Find Manga · AniList"
	};
	if(useScripts.SFWmode && title !== "Table of Contents"){
		document.title = "Table of Contents"
	}
});
if(document.title){
	titleObserver.observe(document.querySelector("head > title"),{subtree: true, characterData: true, childList: true })
}
