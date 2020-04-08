exportModule({
	id: "clickableActivityHistory",
	description: "Displays activities for an entry in the activity history",
	isDefault: true,
	categories: ["Navigation","Profiles"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match(/\/user\/[^/]+\/?$/);
	},
	code: function(){
		if(!useScripts.termsFeed){
			return
		}
		let waiter = function(){
			let activityHistory = document.querySelector(".activity-history");
			if(!activityHistory){
				setTimeout(waiter,1000);
				return
			};
			activityHistory.onclick = function(event){
				let target = event.target;
				if(target && target.classList.contains("history-day")){
					if(target.classList.contains("lv-0")){
						return
					}
					let offset = 1;
					while(target.nextSibling){
						offset++;
						target = target.nextSibling
					}
					let presentDayPresentTime = (new Date()).valueOf();
					presentDayPresentTime = new Date(presentDayPresentTime.valueOf() - offset * 24*60*60*1000);
					let year = presentDayPresentTime.getUTCFullYear();
					let month = presentDayPresentTime.getUTCMonth() + 1;
					let day = presentDayPresentTime.getUTCDate();
					let hour = presentDayPresentTime.getUTCHours();
					if(hour + 9 > 23){
						day++
					}
					window.location.href = "https://anilist.co/terms?user=" + encodeURIComponent(document.querySelector("h1.name").innerText) + "&date=" + year + "-" + month + "-" + day
				}
			}
		};waiter()
	}
})
