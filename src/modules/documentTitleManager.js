let titleObserver = new MutationObserver(mutations => {
	let title = document.querySelector("head > title").textContent;
	let titleMatch = title.match(/(.*)\s\((\d+)\)\s\((.*)\s\(\2\)\)(.*)/);//ugly nested paranthesis like "Tetsuwan Atom (1980) (Astro Boy (1980)) · AniList"
	if(titleMatch){
		//change to the form "Tetsuwan Atom (Astro Boy 1980) · AniList"
		document.title = titleMatch[1] + " (" + titleMatch[3] + " " + titleMatch[2] + ")" + titleMatch[4];
	}
	let badApostropheMatch = title.match(/^(\S+?s)'s\sprofile(.*)/);
	if(badApostropheMatch){
		document.title = badApostropheMatch[1] + "' profile" + badApostropheMatch[2]
	}
		
	if(useScripts.SFWmode && title !== "Table of Contents"){//innocent looking
		document.title = "Table of Contents"
	}
});
if(document.title){
	titleObserver.observe(document.querySelector("head > title"),{subtree: true, characterData: true, childList: true })
}
