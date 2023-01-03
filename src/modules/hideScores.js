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
				let allNode = Array.from(document.querySelectorAll(".sidebar .data .data-set .type"));
				if(!allNode){
					return false
				};
				let avgNode = allNode.find(element => element.innerText === "Average Score");
				if(avgNode){
					avgNode.parentNode.children[1].style = "background-color: rgba(var(--color-black),0.5); color: transparent; padding: 0px 10px; border-radius: 3px; user-select: none; cursor: pointer;";
					avgNode.parentNode.children[1].onmouseover = function(){
						this.style.color = 'white'
					};
					avgNode.parentNode.children[1].onmouseout = function(){
						this.style.color = 'transparent'
					};
					avgNode.parentNode.children[1].onclick = function(){
						if(this.onmouseover){
							this.onmouseover = null;
							this.onmouseout = null;
							this.style.color = 'white'
						}
						else{
							this.onmouseover = function(){
								this.style.color = 'white'
							};
							this.onmouseout = function(){
								this.style.color = 'transparent'
							};
							this.style.color = 'transparent'
						}
					}
				};
				let meanNode = allNode.find(element => element.innerText === "Mean Score");
				if(meanNode){
					meanNode.parentNode.children[1].style = "background-color: rgba(var(--color-black),0.5); color: transparent; padding: 0px 10px; border-radius: 3px; user-select: none; cursor: pointer;";
					meanNode.parentNode.children[1].onmouseover = function(){
						this.style.color = 'white'
					};
					meanNode.parentNode.children[1].onmouseout = function(){
						this.style.color = 'transparent'
					}
                    meanNode.parentNode.children[1].onclick = function(){
						if(this.onmouseover){
							this.onmouseover = null;
							this.onmouseout = null;
							this.style.color = 'white'
						}
						else{
							this.onmouseover = function(){
								this.style.color = 'white'
							};
							this.onmouseout = function(){
								this.style.color = 'transparent'
							};
							this.style.color = 'transparent'
						}
					}
				};
				return (avgNode && meanNode ? true : false)
			};
			let mutationConfig = {
				attributes: false,
				childList: true,
				subtree: true
			};
			let observer = new MutationObserver(function(){
				scoreSpoiler() && observer.disconnect()
			});
			!scoreSpoiler() && observer.observe(document.body,mutationConfig)
		}
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
	.overview .media-score-distribution .ct-chart-bar:not(:hover), .media-card .score, .overview .follow .score:not(:hover){
		opacity: 0;
		user-select: none;
	}
	.overview .follow span{
		text-align: center;
		border-radius: 3px;
		background-color: rgba(var(--color-black),0.5);
		color: white;
		user-select: none;
	}
	.overview .follow span:not(:hover){
		color: transparent;
	}
	`
})
