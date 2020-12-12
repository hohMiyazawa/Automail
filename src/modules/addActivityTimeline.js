function addActivityTimeline(){
	const URLstuff = location.pathname.match(/^\/(anime|manga)\/(\d+)\/[\w\-]*\/social/);
	if(!URLstuff){
		return
	};
	if(document.getElementById("activityTimeline")){
		return
	};
	if(!whoAmIid){
		generalAPIcall(
			"query($name:String){User(name:$name){id}}",
			{name: whoAmI},
			function(data){
				whoAmIid = data.data.User.id;
				addActivityTimeline()
			},
			"hohIDlookup" + whoAmI.toLowerCase()
		);
		return
	};
	let followingLocation = document.querySelector(".following");
	if(!followingLocation){
		setTimeout(addActivityTimeline,200);
		return
	};
	const status = document.querySelector(".actions .list .add").innerText;
	let activityTimeline = create("div","#activityTimeline",false,followingLocation.parentNode);
	let variables = {
		mediaId: URLstuff[2],
		userId: whoAmIid,
		page: 1
	};
	const query = `
query($userId: Int,$mediaId: Int,$page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			lastPage
			total
		}
		activities(userId: $userId, mediaId: $mediaId, sort: ID){
			... on ListActivity{
				siteUrl
				createdAt
				status
				progress
				replyCount
			}
		}
	}
}`;
	const lineCaller = function(query,variables){
		generalAPIcall(query,variables,function(data){
			if(data.data.Page.pageInfo.currentPage === 1){
				removeChildren(activityTimeline)
				if(data.data.Page.activities.length){
					create("h2",false,"Activity Timeline",activityTimeline)
				}
			};
			data.data.Page.activities.forEach(function(activity){
				let activityEntry = create("div","hohTimelineEntry",false,activityTimeline);
				if(activity.replyCount){
					activityEntry.style.color = "rgb(var(--color-blue))"
				};
				let activityContext = create("a","newTab",capitalize(activity.status),activityEntry);
				activityContext.href = activity.siteUrl;
				if(["watched episode","read chapter","rewatched episode","reread chapter"].includes(activity.status)){
					activityContext.innerText += " " + activity.progress
				};
				create("span",false,
					" " + (new Date(activity.createdAt*1000)).toDateString(),
					activityEntry,
					"position:absolute;right:7px;"
				).title = (new Date(activity.createdAt*1000)).toLocaleString()
			});
			if(data.data.Page.pageInfo.currentPage < data.data.Page.pageInfo.lastPage && data.data.Page.pageInfo.currentPage < 10){//yet another workaround fro broken API
				variables.page++;
				lineCaller(query,variables)
			}
		},"hohMediaTimeline" + variables.mediaId + "u" + variables.userId + "p" + variables.page,120*1000);
	};
	if(status !== "Add To List"){
		lineCaller(query,variables)
	};
	let lookingElse = create("div",false,false,followingLocation.parentNode,"margin-top:30px;");
	create("div",false,"Looking for the activities of someone else? ",lookingElse);
	let lookingElseInput = create("input",false,false,lookingElse);
	lookingElseInput.placeholder = "User";
	lookingElseInput.setAttribute("list","socialUsers");
	let lookingElseButton = create("button",["button","hohButton"],"Search",lookingElse);
	let lookingElseError = create("span",false,"",lookingElse);
	lookingElseButton.onclick = function(){
		if(lookingElseInput.value){
			lookingElseError.innerText = "...";
			generalAPIcall(
				"query($name:String){User(name:$name){id}}",
				{name: lookingElseInput.value},
				function(data){
					if(!data){
						lookingElseError.innerText = "User not found";
						return
					};
					lookingElseError.innerText = "";
					variables.userId = data.data.User.id;
					variables.page = 1;
					lineCaller(query,variables)
				},
				"hohIDlookup" + lookingElseInput.value.toLowerCase()
			)
		}
	}
}
