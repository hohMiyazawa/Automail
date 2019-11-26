//not useful?
function addReviewConfidence(){
	generalAPIcall("query{Page(page:1,perPage:30){reviews(sort:ID_DESC){id rating ratingAmount}}}",{},function(data){
		let adder = function(){
			if(location.pathname !== "/reviews"){
				return
			}
			let locationForIt = document.querySelector(".recent-reviews .review-wrap");
			if(!locationForIt){
				setTimeout(adder,200);
				return;
			}
			data.data.Page.reviews.forEach((review,index) => {
				let wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
				let extraScore = create("span",false,"~" + Math.round(100*wilsonLowerBound));
				extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
				extraScore.style.marginRight = "3px";
				let parent = locationForIt.children[index].querySelector(".votes");
				parent.insertBefore(extraScore,parent.firstChild);
				if(wilsonLowerBound < 0.05){
					locationForIt.children[index].style.opacity = "0.5"
				}
			})
		};adder();
	},"hohRecentReviews",30*1000);
}
