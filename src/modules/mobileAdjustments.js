if(useScripts.mobileFriendly){
	let addReviewLink = function(){
		let footerPlace = document.querySelector(".footer .links section:last-child");
		if(footerPlace){
			let revLink = create("a",false,"Reviews",footerPlace,"display:block;padding:6px;");
			revLink.href = "/reviews/";
		}
		else{
			setTimeout(addReviewLink,500)
		}
	};addReviewLink();
}
