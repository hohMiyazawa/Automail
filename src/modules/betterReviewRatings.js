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
	});
	setTimeout(function(){//give anilist some time to generate them
		reviews.forEach(likeElement => {
			let likeExtra = document.getElementById(likeElement.attributes["aria-describedby"].value);
			if(likeExtra){
				let matches = likeExtra.innerText.match(/out of (\d+)/);
				if(matches){
					likeElement.childNodes[1].textContent += "/" + matches[1]
				}
			}
			likeElement.style.bottom = "4px";
			likeElement.style.right = "7px";
		})
		document.body.classList.remove("TMPreviewScore");//make tooltips visible again
	},200);
}
