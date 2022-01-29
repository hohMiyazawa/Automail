exportModule({
	id: "addMediaReviewConfidence",
	description: "Add confidence scores to reviews on media pages",
	isDefault: true,
	categories: ["Media"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/(anime|manga)\/[0-9]+\/.*\/reviews/.test(url)
	},
	code: function(){
		const [,id] = location.pathname.match(/^\/(?:anime|manga)\/([0-9]+)\/.*\/reviews/)
		const query = `
query media($id: Int, $page: Int) {
	Media(id: $id) {
		reviews(page: $page, sort: [RATING_DESC, ID]) {
			pageInfo {
				total
				perPage
				hasNextPage
			}
			nodes {
				id
				rating
				ratingAmount
			}
		}
	}
}
`
		let pageCount = 0;
		let reviewCount = 0;

		const addConfidence = async function(){
			pageCount++
			const {data, errors} = await anilistAPI(query, {
				variables: {id, page: pageCount},
				cacheKey: "recentMediaReviews" + id + "Page" + pageCount,
				duration: 30*60*1000
			})
			if(errors){
				return;
			}
			const adder = function(){
				const reviewWrap = document.querySelector(".media-reviews .review-wrap");
				if(!reviewWrap){
					setTimeout(adder,200);
					return;
				}
				data.Media.reviews.nodes.forEach(review => {
					reviewCount++
					const wilsonLowerBound = wilson(review.rating,review.ratingAmount).left
					const extraScore = create("span",false,"~" + Math.round(100*wilsonLowerBound));
					extraScore.style.color = "hsl(" + wilsonLowerBound*120 + ",100%,50%)";
					extraScore.style.marginRight = "3px";
					const findParent = function(){
						const parent = reviewWrap.querySelector('[href="/review/' + review.id + '"] .votes');
						if(!parent){
							setTimeout(findParent,200);
							return;
						}
						parent.insertBefore(extraScore,parent.firstChild);
						if(wilsonLowerBound < 0.05){
							reviewWrap.children[reviewCount - 1].style.opacity = "0.5"
						}
					}; findParent();
				})
				return;
			};adder();
		}
		addConfidence()

		const checkMore = function(){
			const loadMore = document.querySelector(".media-reviews .load-more");
			if(!loadMore){
				setTimeout(checkMore,200);
				return;
			}
			loadMore.addEventListener("click", addConfidence)
		};checkMore();
	},
	css: `
	.media-reviews .review-wrap .review-card .summary {
		margin-bottom: 15px;
	}
	`
})
