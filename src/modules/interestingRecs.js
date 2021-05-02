exportModule({
	id: "interestingRecs",
	description: "Add a 'For You' filter to the recommendations page",
	isDefault: true,
	categories: ["Login"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/https:\/\/anilist\.co\/recommendations/) && useScripts.accessToken
	},
	code: function(){
		let buttonInserter = function(){
			if(!document.URL.match(/https:\/\/anilist\.co\/recommendations/)){
				return
			}
			let switchL = document.querySelector(".page-content .switch:not(.list-switch) .options");
			if(switchL && document.querySelector(".recommendations-wrap")){
				switchL.parentNode.classList.add("hohRecsSwitch");
				let optionWrapper = create("div","option",false,switchL);
				let option = create("span",false,translate("$recs_forYou"),optionWrapper);
				option.title = translate("$recs_description");
				let fakeContent = create("div",["recommendations-wrap","substitute"],false,false,"display:none;");
				let realNode = document.querySelector(".recommendations-wrap");
				realNode.parentNode.insertBefore(fakeContent,realNode);
				optionWrapper.onclick = function(){
					switchL.querySelector(".active").classList.remove("active");
					fakeContent.style.display = "grid";
					realNode.style.display = "none";
					optionWrapper.classList.add("active");
					if(fakeContent.childElementCount){
						return
					}
					authAPIcall(`
query($id: Int){
	Page{
		mediaList(status:COMPLETED,sort:SCORE_DESC,userId:$id){
			... stuff
		}
	}
	Page2:Page(page:2){
		mediaList(status:COMPLETED,sort:SCORE_DESC,userId:$id){
			... stuff
		}
	}
}

fragment stuff on MediaList{
	rawScore:score(format:POINT_100)
	media{
		id
		siteUrl
		coverImage{large color}
		title{romaji native english}
		recommendations(sort:RATING_DESC){
			nodes{
				rating
				userRating
				mediaRecommendation{
					id
					siteUrl
					averageScore
					coverImage{large color}
					title{romaji native english}
					mediaListEntry{
						status
					}
				}
			}
		}
	}
}
`,
						{id: whoAmIid},
						function(data){
							let possRecs = [];
							data.data.Page.mediaList.concat(data.data.Page2.mediaList).forEach(entry => {
								entry.media.recommendations.nodes.forEach(node => {
									possRecs.push({
										first: {
											id: entry.media.id,
											score: entry.rawScore,
											title: entry.media.title,
											siteUrl: entry.media.siteUrl,
											coverImage: entry.media.coverImage
										},
										second: {
											id: node.mediaRecommendation.id,
											mediaListEntry: node.mediaRecommendation.mediaListEntry,
											title: node.mediaRecommendation.title,
											siteUrl: node.mediaRecommendation.siteUrl,
											averageScore: node.mediaRecommendation.averageScore,
											coverImage: node.mediaRecommendation.coverImage
										},
										rating: node.rating,
										userRating: node.userRating
									})
								})
							});
							possRecs.filter(
								rec => ((!rec.second.mediaListEntry) || rec.second.mediaListEntry.status === "PLANNING")
									&& rec.rating > 0
									&& rec.userRating !== "RATE_DOWN"//don't count this recommendation if the user has actively stated it is bad
							).sort(
								(b,a) => (a.first.score + a.second.averageScore || 41) * (1 - 1/(a.rating + 1))
									- (b.first.score + b.second.averageScore || 41) * (1 - 1/(b.rating + 1))
							).forEach(rec => {
								let pairCard = create("div","recommendation-pair-card",false,fakeContent);
									let first = create("a","media",false,pairCard);
									first.href = rec.first.siteUrl;
										let firstCover = create("div","cover",false,first);
										firstCover.style.backgroundColor = rec.first.coverImage.color;
										firstCover.style.backgroundImage = "url(\"" + rec.first.coverImage.large + "\")";
										let firstTitle = create("div","title",false,first);
											let firstTitleSpan = create("span",false,titlePicker(rec.first),firstTitle);
									let second = create("a","media",false,pairCard);
									second.href = rec.second.siteUrl;
										let secondCover = create("div","cover",false,second);
										secondCover.style.backgroundColor = rec.second.coverImage.color;
										secondCover.style.backgroundImage = "url(\"" + rec.second.coverImage.large + "\")";
										let secondTitle = create("div","title",false,second);
											let secondTitleSpan = create("span",false,titlePicker(rec.second),secondTitle);
									let ratingWrap = create("div","rating-wrap",false,pairCard);
										let actions = create("div","actions",false,ratingWrap);
											let thumbsDownWrap = create("div",["icon","thumbs-down"],false,actions,"margin-right:10px;");
											thumbsDownWrap.appendChild(svgAssets2.thumbsDown.cloneNode(true));
											if(rec.userRating === "RATE_DOWN"){
												thumbsDownWrap.style.color = "rgb(var(--color-red))"
											}
											let thumbsUpWrap = create("div",["icon","thumbs-up"],false,actions);
											if(rec.userRating === "RATE_UP"){
												thumbsUpWrap.style.color = "rgb(var(--color-green))"
											}
											thumbsUpWrap.appendChild(svgAssets2.thumbsUp.cloneNode(true));
										let rating = create("div","rating",0,ratingWrap);
										if(rec.rating > 0){
											rating.innerText = "+" + rec.rating
										}
								thumbsDownWrap.onclick = function(){
									if(rec.userRating === "NO_RATING" || rec.userRating === "RATE_UP"){
										authAPIcall(
											`mutation{SaveRecommendation(mediaId:${rec.first.id},mediaRecommendationId:${rec.second.id},rating:RATE_DOWN){id}}`,
											{},
											data => {
												if(data.data){
													thumbsDownWrap.style.color = "rgb(var(--color-red))";
													if(rec.userRating = rec.userRating === "RATE_UP"){
														thumbsUpWrap.style.color = "inherit";
														rec.rating--;
													}
													rec.userRating = "RATE_DOWN";
													rec.rating--;
													if(rec.rating > 0){
														rating.innerText = "+" + rec.rating
													}
													else{
														rating.innerText = 0
													}
												}
											}
										)
									}
									else{
										authAPIcall(
											`mutation{SaveRecommendation(mediaId:${rec.first.id},mediaRecommendationId:${rec.second.id},rating:NO_RATING){id}}`,
											{},
											data => {
												if(data.data){
													thumbsDownWrap.style.color = "inherit";
													rec.userRating = "NO_RATING";
													rec.rating++;
													rating.innerText = "+" + rec.rating
												}
											}
										)
									}
								}
								thumbsUpWrap.onclick = function(){
									if(rec.userRating === "NO_RATING" || rec.userRating === "RATE_DOWN"){
										authAPIcall(
											`mutation{SaveRecommendation(mediaId:${rec.first.id},mediaRecommendationId:${rec.second.id},rating:RATE_UP){id}}`,
											{},
											data => {
												if(data.data){
													thumbsUpWrap.style.color = "rgb(var(--color-green))";
													if(rec.userRating = rec.userRating === "RATE_UP"){
														thumbsDownWrap.style.color = "inherit";
														rec.rating++;
													}
													rec.userRating = "RATE_UP";
													rec.rating++;
													rating.innerText = "+" + rec.rating
												}
											}
										)
									}
									else{
										authAPIcall(
											`mutation{SaveRecommendation(mediaId:${rec.first.id},mediaRecommendationId:${rec.second.id},rating:NO_RATING){id}}`,
											{},
											data => {
												if(data.data){
													thumbsUpWrap.style.color = "inherit";
													rec.userRating = "NO_RATING";
													rec.rating--;
													if(rec.rating > 0){
														rating.innerText = "+" + rec.rating
													}
													else{
														rating.innerText = 0
													}
												}
											}
										)
									}
								}
							})
						}
					)
				};
				let normal = function(event){
					optionWrapper.classList.remove("active");
					fakeContent.style.display = "none";
					realNode.style.display = "grid";
					if(event.target.classList.contains("option")){
						event.target.classList.add("active")
					}
					else{
						event.target.parentNode.classList.add("active")
					}
				}
				switchL.children[0].addEventListener("click",normal);
				switchL.children[1].addEventListener("click",normal);
				switchL.children[2].addEventListener("click",normal);
			}
			else{
				setTimeout(buttonInserter,200)
			}
		};buttonInserter()
	}
})
