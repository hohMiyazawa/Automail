function addFeedFilters(){
	if(!location.pathname.match(/^\/home\/?$/)){
		return
	};
	let filterBox = document.querySelector(".hohFeedFilter");
	if(filterBox){
		return
	};
	let activityFeedWrap = document.querySelector(".activity-feed-wrap");
	if(!activityFeedWrap){
		setTimeout(addFeedFilters,100);
		return
	};
	let activityFeed = activityFeedWrap.querySelector(".activity-feed");
	if(!activityFeed){
		setTimeout(addFeedFilters,100);
		return
	};
	let commentFilterBoxInput;
	let commentFilterBoxLabel;
	let likeFilterBoxInput;
	let likeFilterBoxLabel;
	let allFilterBox;
	let blockList = localStorage.getItem("blockList");
	if(blockList){
		blockList = JSON.parse(blockList)
	}
	else{
		blockList = []
	};
	let postRemover = function(){
		if(!location.pathname.match(/^\/home\/?$/)){
			return
		};
		for(var i=0;i<activityFeed.children.length;i++){
			if(activityFeed.children[i].querySelector(".el-dialog__wrapper")){
				continue
			};
			let actionLikes = activityFeed.children[i].querySelector(".action.likes .button .count");
			if(actionLikes){
				actionLikes = parseInt(actionLikes.innerText)
			}
			else{
				actionLikes = 0
			};
			let actionReplies = activityFeed.children[i].querySelector(".action.replies .count");
			if(actionReplies){
				actionReplies = parseInt(actionReplies.innerText)
			}
			else{
				actionReplies = 0
			};
			let blockRequire = true;
			if(useScripts.blockWord && activityFeed.children[i].classList.contains("activity-text")){
				try{
					if(activityFeed.children[i].innerText.match(new RegExp(blockWordValue,"i"))){
						blockRequire = false
					}
				}
				catch(err){
					if(activityFeed.children[i].innerText.toLowerCase().match(useScripts.blockWordValue.toLowerCase())){
						blockRequire = false
					}
				}
			}
			if(useScripts.statusBorder){
				if(activityFeed.children[i].classList.contains("activity-anime_list") || activityFeed.children[i].classList.contains("activity-manga_list")){
					let blockerMap = {
						"plans": "PLANNING",
						"watched": "CURRENT",
						"read": "CURRENT",
						"completed": "COMPLETED",
						"paused": "PAUSED",
						"dropped": "DROPPED",
						"rewatched": "REPEATING",
						"reread": "REPEATING"
					};
					let status = blockerMap[
						Object.keys(blockerMap).find(
							key => activityFeed.children[i].querySelector(".status").innerText.toLowerCase().includes(key)
						)
					]
					if(status === "CURRENT"){
						activityFeed.children[i].children[0].style.borderRightWidth = "0px";
						activityFeed.children[i].children[0].style.marginRight = "0px"
					}
					else if(status === "COMPLETED"){
						activityFeed.children[i].children[0].style.borderRightStyle = "solid";
						activityFeed.children[i].children[0].style.borderRightWidth = "5px";
						if(useScripts.CSSgreenManga && activityFeed.children[i].classList.contains("activity-anime_list")){
							activityFeed.children[i].children[0].style.borderRightColor = "rgb(var(--color-blue))"
						}
						else{
							activityFeed.children[i].children[0].style.borderRightColor = "rgb(var(--color-green))"
						}
						activityFeed.children[i].children[0].style.marginRight = "-5px"
					}
					else{
						activityFeed.children[i].children[0].style.borderRightStyle = "solid";
						activityFeed.children[i].children[0].style.borderRightWidth = "5px";
						activityFeed.children[i].children[0].style.marginRight = "-5px";
						activityFeed.children[i].children[0].style.borderRightColor = distributionColours[status];
					}
				}		
			}
			const statusCheck = {
				"planning": /^plans/i,
				"watching": /^watched/i,
				"reading": /^read/i,
				"completing": /^completed/i,
				"pausing": /^paused/i,
				"dropping": /^dropped/i,
				"rewatching": /^rewatched/i,
				"rereading": /^reread/i
			}
			if(
				(!useScripts.feedCommentFilter || (
					actionLikes >= likeFilterBoxInput.value
					&& (likeFilterBoxInput.value >= 0 || actionLikes < -likeFilterBoxInput.value)
					&& actionReplies >= commentFilterBoxInput.value
					&& (commentFilterBoxInput.value >= 0 || actionReplies < -commentFilterBoxInput.value)
				))
				&& blockRequire
				&& blockList.every(
					blocker => (
						blocker.user
						&& activityFeed.children[i].querySelector(".name").textContent.trim().toLowerCase() !== blocker.user.toLowerCase()
					)
					|| (
						blocker.media
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| activityFeed.children[i].querySelector(".status .title").href.match(/\/(anime|manga)\/(\d+)/)[2] !== blocker.media
						)
					)
					|| (
						blocker.status
						&& (
							activityFeed.children[i].classList.contains("activity-text")
							|| blocker.status == "status"
							|| (
								blocker.status === "anime"
								&& !activityFeed.children[i].classList.contains("activity-anime_list")
							)
							|| (
								blocker.status === "manga"
								&& !activityFeed.children[i].classList.contains("activity-manga_list")
							)
							|| (
								statusCheck[blocker.status]
								&& !activityFeed.children[i].querySelector(".status").textContent.trim().match(statusCheck[blocker.status])
							)
						)
					)
				)
			){
				if(
					useScripts.SFWmode
					&& activityFeed.children[i].classList.contains("activity-text")
					&& badWords.some(word => activityFeed.children[i].querySelector(".activity-markdown").innerText.match(word))
				){
					activityFeed.children[i].style.opacity= 0.5
				}
				else{
					activityFeed.children[i].style.display = ""
				}
			}
			else{
				activityFeed.children[i].style.display = "none"
			}
		};
	};
	if(useScripts.feedCommentFilter){
		filterBox = create("div","hohFeedFilter",false,activityFeedWrap);
		create("span","hohDescription","At least ",filterBox);
		activityFeedWrap.style.position = "relative";
		activityFeedWrap.children[0].childNodes[0].nodeValue = "";
		commentFilterBoxInput = create("input",false,false,filterBox);
		commentFilterBoxInput.type = "number";
		commentFilterBoxInput.value = useScripts.feedCommentComments;
		commentFilterBoxLabel = create("span",false," comments, ",filterBox);
		likeFilterBoxInput = create("input",false,false,filterBox);
		likeFilterBoxInput.type = "number";
		likeFilterBoxInput.value = useScripts.feedCommentLikes;
		likeFilterBoxLabel = create("span",false," likes",filterBox);
		allFilterBox = create("button",false,"⟳",filterBox,"padding:0px;");
		commentFilterBoxInput.onchange = function(){
			useScripts.feedCommentComments = commentFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		likeFilterBoxInput.onchange = function(){
			useScripts.feedCommentLikes = likeFilterBoxInput.value;
			useScripts.save();
			postRemover();
		};
		allFilterBox.onclick = function(){
			commentFilterBoxInput.value = 0;
			likeFilterBoxInput.value = 0;
			useScripts.feedCommentComments = 0;
			useScripts.feedCommentLikes = 0;
			useScripts.save();
			postRemover();
		};
	}
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: false
	};
	let observer = new MutationObserver(function(){
		postRemover();
		setTimeout(postRemover,500);
	});
	observer.observe(activityFeed,mutationConfig);
	let observerObserver = new MutationObserver(function(){//Who police police? The police police police police
		activityFeed = activityFeedWrap.querySelector(".activity-feed");
		if(activityFeed){
			observer.disconnect();
			observer = new MutationObserver(function(){
				postRemover();
				setTimeout(postRemover,500);
			});
			observer.observe(activityFeed,mutationConfig);
		}
	});
	observerObserver.observe(activityFeedWrap,mutationConfig);
	postRemover();
	let waiter = function(){
		setTimeout(function(){
			if(location.pathname.match(/^\/home\/?$/)){
				postRemover();
				waiter();
			};
		},5*1000);
	};waiter();
};
