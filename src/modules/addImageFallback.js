function addImageFallback(){
	if(!document.URL.match(/(\/home|\/user\/)/)){
		return
	}
	setTimeout(addImageFallback,1000);
	let mediaImages = document.querySelectorAll(".media-preview-card:not(.hohFallback) .content .title");
	mediaImages.forEach(cover => {
		cover.parentNode.parentNode.classList.add("hohFallback");
		if(cover.parentNode.parentNode.querySelector(".hohFallback")){
			return
		};
		let fallback = create("span","hohFallback",cover.textContent,cover.parentNode.parentNode);
		if(useScripts.titleLanguage === "ROMAJI"){
			fallback.innerHTML = cover.textContent.replace(/\S{3}(a|\(|☆|\-|e|i|ou|(o|u)(?!u|\s)|n(?!a|e|i|o|u))(?![a-z]($|[^a-z]))/gi,m => m + "<wbr>");
			/*	create word break opportunities for 'break-word' in nice places in romaji
				- after vowels, or 'ou' or 'uu'. Those pairs should not be broken
				- If there's a 'n' from 'ん', the break opportunity should be delayed to after it.
				- 'ん' is determined by 'n' not followed by a vowel. This doesn't work in cases of '[...]んお[...]' vs '[...]の[...]', but that's a shortcomming of romaji
				- don't break early in words, that just looks awkward. just before the last character also looks weird.
				- don't break off punctuation or numbers at the end of words*/
		}
	})
}
