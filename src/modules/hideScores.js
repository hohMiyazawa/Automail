exportModule({
	id: "hideScores",
	description: "$hideScores_description",
	extendedDescription: "$hideScores_extendedDescription",
	isDefault: false,
	importance: 0,
	categories: ["Feeds","Forum","Media","Browse","Newly Added"],
	visible: true,
	urlMatch: function(url){
		return /^https:\/\/anilist\.co\/home\/?$/.test(url) || /^https:\/\/anilist\.co\/(anime|manga|user)\/.*/.test(url) || /^https:\/\/anilist\.co\/forum\/thread\/.*/.test(url)
	},
	code: async function(){
		if(/^\/(anime|manga)\/.*/.test(location.pathname)){
			const sidebarNode = document.querySelector(".sidebar .data") || await watchElem(".sidebar .data");
			let existing = Array.from(sidebarNode.querySelectorAll(".altSpoiler"));
			if (existing.length){
				existing.forEach(oldRow => {
					oldRow.classList.remove("altSpoiler");
					oldRow.removeAttribute("onclick");
					oldRow.removeAttribute("data-click")
				})
			}
			let scoreSpoiler = function(mutations,observer){
				let sidebarData = Array.from(sidebarNode.querySelectorAll(".data-set .type"));
				if(!sidebarData.length){
					return
				};
				let status = sidebarData.find(element => element.innerText === "Status");
				if(!status || status.parentNode.childElementCount != 2){
					return
				}
				if(status.parentNode.children[1].firstChild.nodeValue === "Not Yet Released"){
					observer && observer.disconnect();
					return true
				}
				let scoreNode = new Array();
				let findAvg = sidebarData.find(element => element.innerText === "Average Score");
				let findMean = sidebarData.find(element => element.innerText === "Mean Score");
				findAvg && scoreNode.push(findAvg);
				findMean && scoreNode.push(findMean);
				findAvg && findMean && observer && observer.disconnect();
				if(scoreNode.length){
					scoreNode.forEach(score => {
						!score.parentNode.children[1].classList.contains("altSpoiler") && score.parentNode.children[1].classList.add("altSpoiler");
						score.parentNode.children[1].onclick = function(event){
							event.stopPropagation();
							this.hasAttribute("data-click") ? this.removeAttribute("data-click") : this.setAttribute("data-click","1")
						}
					})
				}
				if(findAvg && findMean){
					return true
				}
			};
			let mutationConfig = {
				attributes: false,
				childList: true,
				subtree: true
			};
			let observer = new MutationObserver(scoreSpoiler);
			!scoreSpoiler() && observer.observe(sidebarNode,mutationConfig)
		}
		if(/^\/home\/?$/.test(location.pathname) || /^\/forum\/thread\/.*/.test(location.pathname) || /^\/user\/.*/.test(location.pathname)){
			let pNode;
			if(/^\/home\/?$/.test(location.pathname) || /^\/user\/.*/.test(location.pathname)){
				pNode = document.querySelector(".activity-feed-wrap") || await watchElem(".activity-feed-wrap");
			}
			else{
				pNode = document.querySelector(".forum-thread") || await watchElem(".forum-thread");
			}
			let removeEmbedScore = function(mutations,observer){
				let embed = Array.from(pNode.querySelectorAll(".embed .wrap .info:not(.hohEmbedHiddenScore)"));
				if(embed.length){
					embed.forEach(element => {
						if(element.children[2] && element.children[2].innerText.includes("Not Yet Released")){
							element.classList.add("hohEmbedHiddenScore");
						}
						if(element.children[4] && /^([1-9][0-9]?|100)%$/.test(element.children[4].innerText.trim().slice(-3))){
							element.children[4].innerText = "";
							element.classList.add("hohEmbedHiddenScore")
						}
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
			observer.observe(pNode,mutationConfig)
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
	.value.altSpoiler{
		background-color: rgba(var(--color-black),0.5);
		color: transparent;
		padding: 0px 10px;
		border-radius: 3px;
		user-select: none;
		cursor: pointer;
	}
	.value.altSpoiler:hover, .value.altSpoiler[data-click]{
		color: white;
	}
	`
})
