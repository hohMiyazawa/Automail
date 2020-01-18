{name: "Reviews",code: function(){
	miscResults.innerText = "";
	let dataHeader = create("div",false,false,miscResults);
	create("span",false,"There are ",dataHeader);
	let data_amount = create("span",false,"[loading...]",dataHeader);
	create("span",false," reviews on Anilist, with ",dataHeader);
	let data_ratingAmount = create("span",false,"[loading...]",dataHeader);
	create("span",false," ratings (",dataHeader);
	let data_ratingPositive = create("span",false,"[loading...]",dataHeader);
	create("span",false,"% positive)",dataHeader);
	generalAPIcall(
		`query ($page: Int) {
			Page (page: $page) {
				pageInfo {
					total
					perPage
					currentPage
					lastPage
					hasNextPage
				}
				reviews {
					id
				}
			}
		}`,
		{page: 1},
		function(data){
			data_amount.innerText = data.data.Page.pageInfo.total;
			let list = [];
			for(var i=1;i<=data.data.Page.pageInfo.lastPage;i++){
				generalAPIcall(
					`query ($page: Int){
						Page (page: $page){
							pageInfo{
								total
								perPage
								currentPage
								lastPage
								hasNextPage
							}
							reviews{
								id
								rating
								ratingAmount
								score
								user{
									name
									id
								}
								media{
									id
									title{romaji}
								}
							}
						}
					}`,
					{page: i},
					function(reviewData){
						list = list.concat(reviewData.data.Page.reviews);
						if(list.length !== reviewData.data.Page.pageInfo.total){
							return
						};
						list.sort((b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left);
						create("h3",false,"100 best reviews on Anilist",miscResults);
						let datalist1 = create("div",false,false,miscResults);
						list.slice(0,100).forEach((review,index) => {
							let dataCel = create("p",false,false,datalist1);
							create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
							create("span","hohMonospace",wilson(review.rating,review.ratingAmount).left.toPrecision(3) + " ",dataCel);
							let userName = "[error]";
							if(review.user){
								if(review.user.name){
									userName = review.user.name
								}
							};
							create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
								.href = "/review/" + review.id
						});
						list.sort((a,b)=>wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
						create("h3",false,"100 worst reviews on Anilist",miscResults);
						let datalist2 = create("div",false,false,miscResults);
						list.slice(0,100).forEach((review,index) => {
							let dataCel = create("p",false,false,datalist2);
							create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
							create("span","hohMonospace",wilson(review.rating,review.ratingAmount).right.toPrecision(3) + " ",dataCel);
							let userName = "[error]";
							if(review.user){
								if(review.user.name){
									userName = review.user.name
								}
							};
							create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
								.href = "/review/" + review.id
						});
						let reviewers = new Map();
						let ratings = 0;
						let positiveRatings = 0;
						list.forEach(rev => {
							ratings += rev.ratingAmount;
							positiveRatings += rev.rating;
							if(rev.user){
								if(rev.user.id){
									if(!reviewers.has(rev.user.id)){
										reviewers.set(rev.user.id,{
											id: rev.user.id,
											name: rev.user.name,
											rating: 0,
											ratingAmount: 0,
											amount: 0
										});
									}
									let person = reviewers.get(rev.user.id);
									person.rating += rev.rating;
									person.ratingAmount += rev.ratingAmount;
									person.amount++;
								};
							};
						});
						data_ratingAmount.innerText = ratings;
						data_ratingPositive.innerText = Math.round(100 * positiveRatings/ratings);
						reviewers = [...reviewers].map(
							pair => pair[1]
						).sort(
							(b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left
						);
						create("h3",false,"10 best reviewers on Anilist",miscResults);
						let datalist3 = create("div",false,false,miscResults);
						reviewers.slice(0,10).forEach((rev,index) => {
							let dataCel = create("p",false,false,datalist3);
							create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
							create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).left.toPrecision(3) + " ",dataCel);
							let userName = rev.name || "[private or deleted]";
							let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
							link.href = "/user/" + rev.name || "removed"
						});
						reviewers.sort((a,b) => wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
						create("h3",false,"10 worst reviewers on Anilist",miscResults);
						let datalist4 = create("div",false,false,miscResults);
						reviewers.slice(0,10).forEach((rev,index) => {
							let dataCel = create("p",false,false,datalist4);
							create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
							create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).right.toPrecision(3) + " ",dataCel);
							let userName = rev.name || "[private or deleted]";
							let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
							link.href = "/user/" + rev.name || "removed"
						});
						reviewers.sort(function(b,a){
							if(a.amount === b.amount){//rating as tie-breaker
								return a.rating/a.ratingAmount - b.rating/b.ratingAmount;
							}
							else{
								return a.amount - b.amount
							}
						});
						create("h3",false,"25 most prolific reviewers on Anilist",miscResults);
						let datalist5 = create("div",false,false,miscResults);
						let profilicSum = 0;
						reviewers.slice(0,25).forEach((rev,index) => {
							profilicSum += rev.amount;
							let dataCel = create("p",false,false,datalist5);
							create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
							create("span","hohMonospace",rev.amount + " ",dataCel);
							let userName = rev.name || "[private or deleted]";
							let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
							link.href = "/user/" + rev.name || "removed";
							create("span",false," average rating: " + (100*rev.rating/rev.ratingAmount).toPrecision(2) + "%",dataCel);
						});
						create("p",false,"That's " + Math.round(100*profilicSum/list.length) + "% of all reviews on Anilist",miscResults);
						let average = (data.data.Page.pageInfo.total/reviewers.length).toPrecision(2);
						let median = Stats.median(reviewers.map(e => e.amount));
						let mode = Stats.mode(reviewers.map(e => e.amount));
						create("p",false,`${reviewers.length} users have contributed reviews (${average} reviews each on average, median ${median}, mode ${mode})`,miscResults);
						let lowRatingRating = 0;
						let lowRatingAmount = 0;
						let lowRatingCount = 0;
						let highRatingRating = 0;
						let highRatingAmount = 0;
						let highRatingCount = 0;
						let topRatingRating = 0;
						let topRatingAmount = 0;
						let topRatingCount = 0;
						let distribution = new Array(101).fill(0);//0 to 100 inclusive, since 0 is a valid review score
						create("hr",false,false,miscResults);
						list.forEach(review => {
							distribution[review.score]++;
							if(review.score <= 50){
								lowRatingRating += review.rating;
								lowRatingAmount+= review.ratingAmount;
								lowRatingCount++;
							}
							else{
								highRatingRating += review.rating;
								highRatingAmount+= review.ratingAmount;
								highRatingCount++;
								if(review.score == 100){
									topRatingRating += review.rating;
									topRatingAmount+= review.ratingAmount;
									topRatingCount++;
								}
							}
						});
						create("p",false,"The " + lowRatingCount + " reviews with a score 0-50 are rated " + (100*lowRatingRating/lowRatingAmount).toPrecision(2) + "% on average.",miscResults);
						create("p",false,"The " + highRatingCount + " reviews with a score 51-100 are rated " + (100*highRatingRating/highRatingAmount).toPrecision(2) + "% on average.",miscResults);
						create("p",false,"The " + topRatingCount + " reviews with a score 100/100 are rated " + (100*topRatingRating/topRatingAmount).toPrecision(2) + "% on average.",miscResults);

						create("p",false,"The average score for a review to give is " + Stats.average(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
						create("p",false,"The median score for a review to give is " + Stats.median(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
						create("p",false,"The most common score for a review to give is " + Stats.mode(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
						const height = 250;
						const width = 700;
						let dia = svgShape("svg",miscResults,{
							width: width,
							height: height,
							viewBox: "0 0 " + width + " " + height
						});
						dia.style.borderRadius = "3px";
						let background = svgShape("rect",dia,{
							fill: "rgb(var(--color-foreground))",
							x: 0,
							y: 0,
							width: "100%",
							height: "100%"
						});
						let margin = {
							bottom: 30,
							top: 30,
							left: 20,
							right: 20
						};
						const bars = 101;
						const barWidth = 0.74 * (width - margin.left - margin.right)/bars;
						const barSpacing = 0.24 * (width - margin.left - margin.right)/bars;
						let maxVal = Math.max(...distribution);
						let magnitude = Math.pow(10,Math.floor(Math.log10(maxVal)));
						let mantissa = maxVal/magnitude;
						if(mantissa < 1.95){
							maxVal = 2*magnitude
						}
						else if(mantissa < 2.95){
							maxVal = 3*magnitude
						}
						else if(mantissa < 4.9){
							maxVal = 5*magnitude
						}
						else if(mantissa < 9.8){
							maxVal = 10*magnitude
						}
						else{
							maxVal = 15*magnitude
						};
						let valueFunction = function(val){
							return height - margin.bottom - (val/maxVal) * (height - margin.bottom - margin.top)
						};
						let title = svgShape("text",dia,{
							x: 10,
							y: 20,
							fill: "rgb(var(--color-text))"
						});
						title.textContent = "Review score distribution";
						distribution.forEach((val,index) => {
							if(!val){
								return;
							}
							let colour = "rgb(var(--color-text))";
							if(index % 10 === 0){
								colour = "rgb(61,180,242)";
								let text = svgShape("text",dia,{
									x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
									y: valueFunction(val) - barWidth,
									fill: colour,
									"text-anchor": "middle",
								});
								text.textContent = val;
								let text2 = svgShape("text",dia,{
									x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
									y: height - margin.bottom + 3*barWidth,
									fill: colour,
									"text-anchor": "middle",
								});
								text2.textContent = index;
							}
							else if(index % 10 === 5){
								colour = "rgb(123,213,85)"
							}
							svgShape("rect",dia,{
								x: margin.left + index*barWidth + index*barSpacing,
								y: valueFunction(val),
								width: barWidth,
								height: height - valueFunction(val) - margin.bottom,
								fill: colour
							})
						})
					}
				)
			};
		}
	);
}},
