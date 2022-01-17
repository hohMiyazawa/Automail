function notificationCake(){
	let notificationDot = document.querySelector(".notification-dot");
	if(notificationDot && (!notificationDot.childElementCount)){
		authAPIcall(
			queryAuthNotifications,
			{page:1,name:whoAmI},
			function(data){
				if(!data){
					return
				}
				let Page = data.data.Page;
				let User = data.data.User;
				let types = [];
				let names = [];
				Page.notifications.slice(0,User.unreadNotificationCount).forEach(notification => {
					if(!notification.type){//probably obsolete, remove later
						notification.type = "THREAD_SUBSCRIBED"
					}
					if(notification.user && !useScripts.notificationColours[notification.type].supress){
						if(!notification.user || useScripts.softBlock.indexOf(notification.user.name) === -1){
							names.push((notification.user || {name:""}).name)
						}
					}
					if(!useScripts.notificationColours[notification.type] || !useScripts.notificationColours[notification.type].supress){
						if(!notification.user || useScripts.softBlock.indexOf(notification.user.name) === -1){
							types.push(notification.type)
						}
					}
				})
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
					notificationCake.innerText = types.length;
					notificationCake.title = names.join("\n");
					let poller = function(){
						if(!document.querySelector(".hohNotificationCake")){
							try{
								notificationCake();
							}catch(err){}
						}
						else{
							setTimeout(poller,4000);
						}
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
					notificationDot.style.display = "none";
					if(User.unreadNotificationCount){
						authAPIcall("query{Notification(resetNotificationCount:true){... on ActivityLikeNotification{id}}}",{},function(data){})
					}
				}
			}
		)
	}
}

if(useScripts.accessToken && !useScripts.mobileFriendly){
	setInterval(notificationCake,4*1000)
}
