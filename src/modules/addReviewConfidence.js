exportModule({
	id: "reviewConfidence",
	description: "Add confidence scores to reviews",
	isDefault: true,
	categories: ["Browse"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/reviews/.test(url)
	},
	code: function(){
		let pageCount = 0;
		const adultContent = userObject ? userObject.options.displayAdultContent : false;

		function watchElem(selector, parent) {
			return new Promise(resolve => {
				new MutationObserver((_mutations, observer) => {
					const elem = (parent || document).querySelector(selector);
					if (elem) {
						observer.disconnect()
						resolve(elem)
					}
				}).observe(parent || document.body, { subtree: true, childList: true })
			})
		}

		const addReviewConfidence = async function(){
			pageCount++
			const {data, errors} = await anilistAPI("query($page:Int){Page(page:$page,perPage:30){reviews(sort:ID_DESC){id rating ratingAmount}}}", {
				variables: {page: pageCount},
				cacheKey: "hohRecentReviewsPage" + pageCount,
				duration: 30*1000,
				auth: adultContent // api doesn't return reviews for adult content unless authed + have the option enabled
			})
			if(errors){
				return;
			}
			const locationForIt = document.querySelector(".recent-reviews");
			if(!locationForIt){
				return;
			}
			const reviewWrap = locationForIt.querySelector(".review-wrap") || await watchElem(".review-wrap", locationForIt);
			data.Page.reviews.forEach(async (review) => {
				const wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
				const extraScore = create("span","wilson","~" + Math.round(100*wilsonLowerBound));
				extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
				extraScore.style.marginRight = "3px";
				const votes = `[href="/review/${review.id}"] .votes`;
				const parent = reviewWrap.querySelector(votes) || await watchElem(votes, reviewWrap);
				if(parent.querySelector(".wilson")){
					return;
				}
				parent.insertBefore(extraScore,parent.firstChild);
				if(wilsonLowerBound < 0.05){
					parent.parentNode.parentNode.style.opacity = "0.5" // dim review-card
				}
				return;
			})
			return;
		}

		const checkMore = async function(){
			const container = document.querySelector(".recent-reviews");
			if(!container){
				return;
			}
			const loadMore = container.querySelector(".load-more") || await watchElem(".load-more", container);
			addReviewConfidence()
			loadMore.addEventListener("click", () => {
				addReviewConfidence()
				checkMore() // a different load more button is created, so the listener needs to be reattached
			})
			return;
		};checkMore();
	},
	css: `
	.recent-reviews .review-wrap .review-card .summary {
		margin-bottom: 15px;
	}
	`
})
