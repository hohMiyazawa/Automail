exportModule({
	id: "hideScores",
	description: "Hide scores on embedded cards, browse and media overview pages",
	extendedDescription: `
Scores and charts on media overview pages will be hidden within a spoiler (Hover to reveal)
Does not hide scores set by other Automail options
	`,
	isDefault: false,
	importance: 0,
	categories: ["Feeds","Forum","Media","Browse","Newly Added"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/home\/?$/.test(url) || /^https:\/\/anilist\.co\/(anime|manga|user)\/.*/.test(url) || /^https:\/\/anilist\.co\/forum\/thread\/.*/.test(url)
	},
	code: function(){
		if(/^\/(anime|manga)\/.*/.test(location.pathname)){
			let scoreSpoiler = function(){
				let sidebarNode = Array.from(document.querySelectorAll(".sidebar .data .data-set .type"));
				if(!sidebarNode.length){
					return
				};
				let scoreNode = new Array();
				let findAvg = sidebarNode.find(element => element.innerText === "Average Score");
				let findMean = sidebarNode.find(element => element.innerText === "Mean Score");
				findAvg && scoreNode.push(findAvg);
				findMean && scoreNode.push(findMean);
				if(scoreNode.length){
					scoreNode.forEach(score => {
						if(!score.parentNode.children[1].hasAttribute("data-click")){
							score.parentNode.children[1].style = "background-color: rgba(var(--color-black),0.5); color: transparent; padding: 0px 10px; border-radius: 3px; user-select: none; cursor: pointer;"
						};
						score.parentNode.children[1].onmouseover = function(){
							if(this.getAttribute("data-click") != "1"){
								this.style.color = 'white'
							}
						};
						score.parentNode.children[1].onmouseout = function(){
							if(this.getAttribute("data-click") != "1"){
								this.style.color = 'transparent'
							}
						};
						score.parentNode.children[1].onclick = function(event){
							event.stopPropagation();
							if(!this.hasAttribute("data-click") || this.getAttribute("data-click") == "0"){
								this.onmouseover = null;
								this.onmouseout = null;
								this.setAttribute("data-click","1");
								this.style.color = 'white'
							}
							else{
								this.onmouseover = function(){
									this.style.color = 'white'
								};
								this.onmouseout = function(){
									this.style.color = 'transparent'
								};
								this.setAttribute("data-click","0");
								this.style.color = 'transparent'
							}
						}
					})
				}
			};
			scoreSpoiler();
			let mutationConfig = {
				attributes: false,
				childList: true,
				subtree: true
			};
			let observer = new MutationObserver(scoreSpoiler);
			observer.observe(document.body,mutationConfig);
		};
		if(/^\/home\/?$/.test(location.pathname) || /^\/forum\/thread\/.*/.test(location.pathname) || /^\/user\/.*/.test(location.pathname)){
			let removeEmbedScore = function(){
				let embed = Array.from(document.querySelectorAll(".embed .wrap .info"));
				if(embed.length){
					embed.forEach(element => {
						if(element.children[4] && /^([1-9][0-9]?|100)%$/.test(element.children[4].innerText.trim().slice(-3))){
							element.children[4].innerText = ""
						};
						if(element.children[3] && element.children[3].innerText.trim().slice(-1) == "·"){
							element.children[3].innerText = element.children[3].innerText.replace("·","").trim()
						}
					})
				}
			};
			removeEmbedScore();
			let mutationConfig = {
				attributes: false,
				childList: true,
				subtree: true
			};
			let observer = new MutationObserver(removeEmbedScore);
			observer.observe(document.body,mutationConfig)
		}
	},
	css: `
	.overview .media-score-distribution:not(:hover){
		background-color: rgba(var(--color-black),0.5);
	}
	.overview .media-score-distribution .ct-chart-bar:not(:hover), .media-card .hover-data .score, .overview .follow .score:not(:hover), .table .media-card .score .icon:not(:hover), .media-card .data .score .icon:not(:hover){
		opacity: 0;
		user-select: none;
	}
	.overview .follow span, .table .media-card .score .percentage, .table .media-card .score .popularity, .media-card .data .score, .media-card .data .score .percentage{
		text-align: center;
		border-radius: 3px;
		background-color: rgba(var(--color-black),0.5);
		color: white;
		user-select: none;
	}
	.overview .follow span:not(:hover), .table .media-card .score .percentage:not(:hover), .table .media-card .score .popularity:not(:hover), .media-card .data .score .percentage:not(:hover){
		color: transparent;
	}
	`
})
