function notificationCake(){
	let notificationDot = document.querySelector(".notification-dot");
	if(notificationDot && (!notificationDot.childElementCount)){
		authAPIcall(
			queryAuthNotifications,
			{page:1,name:whoAmI},
			function(data){
				let Page = data.data.Page;
				let User = data.data.User;
				let types = [];
				let names = [];
				for(var i=0;i<Page.notifications.length && i<User.unreadNotificationCount;i++){
					if(!Page.notifications[i].type){//probably obsolete, remove later
						Page.notifications[i].type = "THREAD_SUBSCRIBED"
					};
					if(Page.notifications[i].user && !useScripts.notificationColours[Page.notifications[i].type].supress){
						if(useScripts.softBlock.indexOf(Page.notifications[i].user.name) === -1){
							names.push(Page.notifications[i].user.name)
						}
					};
					if(!useScripts.notificationColours[Page.notifications[i].type] || !useScripts.notificationColours[Page.notifications[i].type].supress){
						if(useScripts.softBlock.indexOf(Page.notifications[i].user.name) === -1){
							types.push(Page.notifications[i].type)
						}
					}
				};
				if(types.length){
					let notificationCake = create("canvas","hohNotificationCake");
					notificationCake.width = 120;
					notificationCake.height = 120;
					notificationCake.style.width = "30px";
					notificationCake.style.height = "30px";
					notificationDot.innerText = "";
					notificationDot.style.background = "none";
					notificationDot.style.width = "30px";
					notificationDot.style.height = "30px";
					notificationDot.style.borderRadius = "0";
					notificationDot.style.left = "5px";
					notificationDot.style.marginRight = "-3px";
					notificationDot.appendChild(notificationCake);
					let cakeCtx = notificationCake.getContext("2d");
					cakeCtx.fillStyle = "red";
					cakeCtx.textAlign = "center";
					cakeCtx.fontWeight = "500";
					cakeCtx.font = 50 + "px sans-serif";
					types.forEach(function(type,i){
						cakeCtx.fillStyle = (useScripts.notificationColours[type] || {"colour":"rgb(247,191,99)","supress":false}).colour;
						cakeCtx.beginPath();
						cakeCtx.arc(
							60,60,
							40,
							Math.PI * (2*i/types.length - 0.5),
							Math.PI * (2*(i+1)/types.length - 0.5)
						);
						cakeCtx.lineTo(60,60);
						cakeCtx.closePath();
						cakeCtx.fill()
					});
					cakeCtx.fillStyle = "#fff2f2";
					cakeCtx.fillText(User.unreadNotificationCount,60,76);
					notificationCake.innerText = User.unreadNotificationCount;
					notificationCake.title = names.join("\n");
					let poller = function(){
						if(!document.querySelector(".hohNotificationCake")){
							try{
								notificationCake();
							}catch(err){};
						}
						else{
							setTimeout(poller,4000);
						};
					};poller();
					if(!document.querySelector(".hohDismiss") && useScripts.dismissDot){
						let dismisser = create("span","hohDismiss",".",notificationDot.parentNode);
						dismisser.title = "Dismiss notifications";
						dismisser.onclick = function(){
							authAPIcall("query{Notification(resetNotificationCount:true){... on ActivityLikeNotification{id}}}",{},function(data){
								dismisser.previousSibling.style.display = "none";
								dismisser.style.display = "none"
							})
						}
					}
				}
				else{
					notificationDot.style.display = "none"
				}
			}
		)
	}
}

if(useScripts.accessToken && !useScripts.mobileFriendly){
	setInterval(notificationCake,4*1000)
};
