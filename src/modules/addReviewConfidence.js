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
			const adder = function(){
				const locationForIt = document.querySelector(".recent-reviews .review-wrap");
				if(!locationForIt){
					setTimeout(adder,200);
					return;
				}
				data.Page.reviews.forEach(review => {
					const wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
					const extraScore = create("span",false,"~" + Math.round(100*wilsonLowerBound));
					extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
					extraScore.style.marginRight = "3px";
					const findParent = function(){
						const parent = locationForIt.querySelector('[href="/review/' + review.id + '"] .votes');
						if(!parent){
							setTimeout(findParent,200);
							return;
						}
						parent.insertBefore(extraScore,parent.firstChild);
						if(wilsonLowerBound < 0.05){
							parent.parentNode.parentNode.style.opacity = "0.5" // dim review-card
						}
					}; findParent();
				})
				return;
			};adder();
		}
		addReviewConfidence()

		const checkMore = function(){
			const loadMore = document.querySelector(".recent-reviews .load-more");
			if(!loadMore){
				setTimeout(checkMore,200);
				return;
			}
			loadMore.addEventListener("click", async () => {
				await addReviewConfidence() // run twice to counteract the offset created when scrolling
				await addReviewConfidence()
				checkMore() // a different load more button is created, so the listener needs to be reattached
				return;
			})
		};checkMore();
	},
	css: `
	.recent-reviews .review-wrap .review-card .summary {
		margin-bottom: 15px;
	}
	`
})
