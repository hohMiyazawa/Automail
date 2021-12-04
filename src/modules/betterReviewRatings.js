function betterReviewRatings(){
	if(!location.pathname.match(/\/home/)){
		return
	}
	let reviews = document.querySelectorAll(".review-card .el-tooltip.votes");
	if(!reviews.length){
		setTimeout(betterReviewRatings,500);
		return;
	}
	// Basic idea: read the rating info from the tooltips to avoid an API call.
	document.body.classList.add("TMPreviewScore");//add a temporary class, which makes all tooltips
	reviews.forEach(likeElement => {//trigger creation of the tooltips (they don't exist before hover)
		likeElement.dispatchEvent(new Event("mouseenter"));
		likeElement.dispatchEvent(new Event("mouseleave"));
		//bonus: add some alias and localisation
		let showId;
		if(likeElement.parentNode.previousElementSibling.classList.contains("banner")){//unreliable: they load separately. But better than nothing
			let possibleRefId = likeElement.parentNode.previousElementSibling.style.backgroundImage.match(/banner\/n?(\d+)-/);
			if(possibleRefId){
				showId = parseInt(possibleRefId[1])
			}
		}
		if(useScripts.partialLocalisationLanguage !== "English" || aliases.has(showId)){
			let elements = likeElement.previousElementSibling.previousElementSibling.textContent.match(/Review of (.+) by (.+)$/);
			if(elements){
				likeElement.previousElementSibling.previousElementSibling.childNodes[0].textContent
					= translate(
						"$review_reviewTitle",[
							titlePicker({id: showId, title: {romaji: elements[1]}}),
							elements[2]
						]
					)
			}
		}
	});
	setTimeout(function(){//give anilist some time to generate them
		reviews.forEach(likeElement => {
			let likeExtra = document.getElementById(likeElement.attributes["aria-describedby"].value);
			if(likeExtra){
				let matches = likeExtra.innerText.match(/(\d+) out of (\d+)/);
				if(matches){
					likeElement.childNodes[1].textContent += "/" + matches[2];
					if(useScripts.additionalTranslation){
						likeExtra.childNodes[0].textContent = translate("$reviewLike_tooltip",[matches[1],matches[2]])
					}
				}
			}
			likeElement.style.bottom = "4px";
			likeElement.style.right = "7px";
		})
		document.body.classList.remove("TMPreviewScore");//make tooltips visible again
	},200);
}
