exportModule({
	id: "notifications",
	description: "Improve notifications",
	extendedDescription: `
Performs several changes to notifications:

- Similar consecutive notifications are grouped.
- Notifications get tagged with the cover image of the media they apply to. (or profile picture, if it's a status post)
- Notifications may have a preview of the comments on the activity.

If you for any reason need the default look, you can click the "Show default notifications" to the left on the page.
	`,
	isDefault: true,
	importance: 10,
	categories: ["Notifications","Login"],
	visible: true
})

let prevLength = 0;
let displayMode = "hoh";

function enhanceNotifications(){
	//method: the real notifications are parsed, then hidden and a new list of notifications are created using a mix of parsed data and API calls.
	//alternative method: auth
	setTimeout(function(){
		if((location.pathname === "/notifications" || location.pathname === "/notifications#") && !(useScripts.accessToken && false)){
			enhanceNotifications()
		}
		else{
			prevLength = 0;
			displayMode = "hoh"
		}
	},300);
	if(displayMode === "native"){
		return
	};
	if(document.getElementById("hohNotifications")){
		return
	}
	let possibleButton = document.querySelector(".reset-btn");
	if(possibleButton){
		if(!possibleButton.flag){
			possibleButton.flag = true;
			possibleButton.onclick = function(){
				Array.from(
					document.getElementById("hohNotifications").children
				).forEach(child => {
					child.classList.remove("hohUnread")
				})
			};
			let setting = create("p");
			let checkbox = createCheckbox(setting);
			checkbox.checked = useScripts["hideLikes"];
			checkbox.targetSetting = "hideLikes";
			checkbox.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				forceRebuildFlag = true;
				if(useScripts.accessToken && false){//fixme, that doesn't look right
					enhanceNotifications()
				}
			};
			let description = create("span",false,"Hide like notifications",setting);
			setting.style.fontSize = "small";
			if(useScripts.settingsTip){
				create("p",false,
`You can turn parts of the script on and off:
settings > apps.

You can also turn off this notice there.`,setting);
			};
			let regularNotifications = create("span",false,svgAssets.envelope + " Show default notifications");
			regularNotifications.style.cursor = "pointer";
			regularNotifications.style.fontSize = "small";
			regularNotifications.onclick = function(){
				if(displayMode === "hoh"){
					displayMode = "native";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "none";
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "grid"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show hoh notifications";
					setting.style.display = "none";
				}
				else{
					displayMode = "hoh";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "block"
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "none"
					})
					regularNotifications.innerText = svgAssets.envelope + " Show default notifications";
					setting.style.display = ""
				};
			};
			possibleButton.parentNode.appendChild(regularNotifications);
			possibleButton.parentNode.appendChild(setting);
			try{
				document.querySelector(".group-header + .link").onclick = function(){
					enhanceNotifications()
				}
			}
			catch(e){
				console.warn("Unexpected Anilist UI. Is Automail up to date?")
			}
		}
	};
	let commentCallback = function(data){
		let listOfComments = Array.from(document.getElementsByClassName("b" + data.data.Activity.id));
		listOfComments.forEach(function(comment){
			removeChildren(comment.children[1])
			comment.children[0].style.display = "block";
			data.data.Activity.replies.slice(
				(data.data.Activity.replies.length <= 50 ? 0 : data.data.Activity.replies.length - 30),
				data.data.Activity.replies.length
			).forEach(function(reply){
				let quickCom = create("div","hohQuickCom",false,comment.children[1]);
				let quickComName = create("span","hohQuickComName",reply.user.name,quickCom);
				if(reply.user.name === whoAmI){
					quickComName.classList.add("hohThisIsMe")
				};
				let quickComContent = create("span","hohQuickComContent",false,quickCom);
				quickComContent.innerHTML = DOMPurify.sanitize(reply.text) //reason for innerHTML: preparsed sanitized HTML from the Anilist API
				let quickComLikes = create("span","hohQuickComLikes","♥",quickCom);
				if(reply.likes.length > 0){
					quickComLikes.innerText = reply.likes.length + "♥";
					quickComLikes.title = reply.likes.map(a => a.name).join("\n")
				}
				reply.likes.forEach(like => {
					if(like.name === whoAmI){
						quickComLikes.classList.add("hohILikeThis")
					}
				});
				if(useScripts.accessToken){
					quickComLikes.style.cursor = "pointer";
					quickComLikes.onclick = function(){
						authAPIcall(
							"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
							{id: reply.id},
							function(data){
								if(!data){
									authAPIcall(//try again once if it fails
										"mutation($id:Int){ToggleLike(id:$id,type:ACTIVITY_REPLY){id}}",
										{id: reply.id},
										data => {}
									)
								}
							}
						);
						if(reply.likes.some(like => like.name === whoAmI)){
							reply.likes.splice(reply.likes.findIndex(user => user.name === whoAmI),1);
							quickComLikes.classList.remove("hohILikeThis");
							if(reply.likes.length > 0){
								quickComLikes.innerText = reply.likes.length + "♥"
							}
							else{
								quickComLikes.innerText = "♥"
							}
						}
						else{
							reply.likes.push({name: whoAmI});
							quickComLikes.classList.add("hohILikeThis");
							quickComLikes.innerText = reply.likes.length + "♥"
						};
						quickComLikes.title = reply.likes.map(a => a.name).join("\n")
					}
				}
			});
			let loading = create("div",false,false,comment.children[1]);
			let statusInput = create("div",false,false,comment.children[1]);
			let inputArea = create("textarea",false,false,statusInput,"width: 99%;border-width: 1px;padding: 4px;border-radius: 2px;color: rgb(159, 173, 189);");
			let cancelButton = create("button",["hohButton","button"],"Cancel",statusInput,"background:rgb(31,35,45);display:none;color: rgb(159, 173, 189);");
			let publishButton = create("button",["hohButton","button"],"Publish",statusInput,"display:none;");
			inputArea.placeholder = "Write a reply...";
			inputArea.onfocus = function(){
				cancelButton.style.display = "inline";
				publishButton.style.display = "inline"
			};
			cancelButton.onclick = function(){
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
			};
			publishButton.onclick = function(){
				loading.innerText = "Publishing reply...";
				authAPIcall(
					`mutation($text: String,$activityId: Int){
						SaveActivityReply(text: $text,activityId: $activityId){
							id
							user{name}
							likes{name}
							text(asHtml: true)
							createdAt
						}
					}`,
					{text: inputArea.value,activityId: data.data.Activity.id},
					function(retur){
						loading.innerText = "";
						data.data.Activity.replies.push({
							text: retur.data.SaveActivityReply.text,
							user: retur.data.SaveActivityReply.user,
							likes: retur.data.SaveActivityReply.likes,
							id: retur.data.SaveActivityReply.id
						});
						let saltedHam = JSON.stringify({
							data: data,
							time: NOW(),
							duration: 24*60*60*1000
						});
						localStorage.setItem("hohListActivityCall" + data.data.Activity.id,saltedHam);
						commentCallback(data);
					}
				);
				inputArea.value = "";
				cancelButton.style.display = "none";
				publishButton.style.display = "none";
				document.activeElement.blur()
			}
		})
	};
	let notificationDrawer = function(activities){
		let newContainer = document.getElementById("hohNotifications")
		if(newContainer){
			newContainer.remove()
		};
		newContainer = create("div","#hohNotifications");
		let notificationsContainer = document.querySelector(".notifications");
		if(!notificationsContainer){
			return
		}
		notificationsContainer.insertBefore(newContainer,notificationsContainer.firstChild);
		for(let i=0;i<activities.length;i++){
			if(useScripts.hideLikes && (activities[i].type === "likeReply" || activities[i].type === "like")){
				continue
			};
			let newNotification = create("div");
			newNotification.onclick = function(){
				this.classList.remove("hohUnread");
				let notiCount = document.getElementsByClassName("notification-dot");
				if(notiCount.length){
					const actualCount = parseInt(notiCount[0].textContent);
					if(actualCount < 2){
						if(possibleButton){
							possibleButton.click()
						}
					}
					else{
						notiCount[0].innerText = (actualCount - 1)
					}
				}
			};
			if(activities[i].unread){
				newNotification.classList.add("hohUnread")
			};
			newNotification.classList.add("hohNotification");
			let notImage = create("a","hohUserImage"); //container for profile images
			notImage.href = activities[i].href;
			notImage.style.backgroundImage = activities[i].image;
			let notNotImageContainer = create("span","hohMediaImageContainer"); //container for series images
			let text = create("a","hohMessageText");
			let textName = create("span");
			let textSpan = create("span");
			textName.style.color = "rgb(var(--color-blue))";
			let counter = 1;
			if(activities[i].type === "like"){
				for(
					counter = 0;
					i + counter < activities.length
					&& activities[i + counter].type === "like"
					&& activities[i + counter].href === activities[i].href;
					counter++
				){//one person likes several of your media activities
					let notNotImage = create("a",false,false,notNotImageContainer);
					create("img",["hohMediaImage",activities[i + counter].link],false,notNotImage);
					notNotImage.href = activities[i + counter].directLink;
				};
				text.href = activities[i].directLink;
				textSpan.innerText = activities[i].textSpan;
				if(counter > 1){
					textSpan.innerText = " liked your activities."
				};
				if(counter === 1){
					while(
						i + counter < activities.length
						&& activities[i + counter].type === "like"
						&& activities[i + counter].link === activities[i].link
					){//several people likes one of your activities
						let miniImageWidth = 40;
						let miniImage = create("a","hohUserImageSmall",false,newNotification);
						miniImage.href = activities[i + counter].href;
						miniImage.title = activities[i + counter].textName;
						miniImage.style.backgroundImage = activities[i + counter].image;
						miniImage.style.height = miniImageWidth + "px";
						miniImage.style.width = miniImageWidth + "px";
						miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
						if(counter >= 8){
							miniImage.style.height = miniImageWidth/2 + "px";
							miniImage.style.width = miniImageWidth/2 + "px";
							miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
							if(counter % 2 === 1){
								miniImage.style.top = miniImageWidth/2 + "px"
							}
						};
						counter++;
					}
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter - 1)
					}
				}
				else{
					newNotification.classList.add("hohCombined")
				};
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "reply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "reply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px"
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false
					};
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					}
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1)
					}
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(activities[i].type === "replyReply" ){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "replyReply"
					&& activities[i + counter].link === activities[i].link
				){
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter-1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px"
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false;
					}
					counter++;
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
					}
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
					}
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " replied to activity you're subscribed to.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "likeReply"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				let samePerson = true;
				while(
					i + counter < activities.length
					&& activities[i + counter].type === "likeReply"
					&& activities[i + counter].link === activities[i].link
				){//several people likes one of your activity replies
					let miniImageWidth = 40;
					let miniImage = create("a","hohUserImageSmall",false,newNotification);
					miniImage.href = activities[i + counter].href;
					miniImage.title = activities[i + counter].textName;
					miniImage.style.backgroundImage = activities[i + counter].image;
					miniImage.style.height = miniImageWidth + "px";
					miniImage.style.width = miniImageWidth + "px";
					miniImage.style.left = (72 + (counter - 1)*miniImageWidth) + "px";
					if(counter >= 8){
						miniImage.style.height = miniImageWidth/2 + "px";
						miniImage.style.width = miniImageWidth/2 + "px";
						miniImage.style.left = (72 + 7*miniImageWidth + Math.ceil((counter - 9)/2)/2 * miniImageWidth) + "px";
						if(counter % 2 === 1){
							miniImage.style.top = miniImageWidth/2 + "px"
						}
					}
					if(activities[i].textName !== activities[i + counter].textName){
						samePerson = false
					}
					counter++
				}
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter
					}
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1)
					}
				};
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = " liked your activity reply.";
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1;
			}
			else if(
				activities[i].type === "message"
				|| activities[i].type === "mention"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "airing"){
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				text.appendChild(textSpan);
			}
			else if(activities[i].type === "follow"){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
			}
			else if(
				activities[i].type === "forumCommentLike"
				|| activities[i].type === "forumSubscribedComment"
				|| activities[i].type === "forumCommentReply"
				|| activities[i].type === "forumLike"
				|| activities[i].type === "forumMention"
			){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan);
				let textSpan2 = create("span",false,activities[i].text,text,"color:rgb(var(--color-blue));");
				if(activities[i].text === ""){
					if(activities[i].type === "forumSubscribedComment"){
						textSpan.innerText = " commented in your subscribed forum thread "
					}
					else if(activities[i].type === "forumCommentLike"){
						textSpan.innerText = " liked your comment, in a "
					}
					else if(activities[i].type === "forumCommentReply"){
						textSpan.innerText = " replied to your comment, in a "
					}
					else if(activities[i].type === "forumLike"){
						textSpan.innerText = " liked your "
					}
					else if(activities[i].type === "forumMention"){
						textSpan.innerText = " mentioned you, in a "
					}
					textSpan2.innerText = "[deleted thread]";
					text.href = "#"
				}
				text.style.maxWidth = "none";
				text.style.marginTop = "17px"
			}
			else if(activities[i].type === "newMedia"){
				textSpan.classList.add("hohNewMedia");
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);
				text.appendChild(textSpan);
				notImage.style.width = "51px"
			}
			else{//display as-is
				textSpan.classList.add("hohUnhandledSpecial");
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				text.appendChild(textSpan)
			};
			let time = create("div","hohTime");
			time.innerHTML = activities[i - counter + 1].time;//does not depend on user input
			newNotification.appendChild(notImage);
			newNotification.appendChild(text);
			newNotification.appendChild(notNotImageContainer);
			newNotification.appendChild(time);
			if(i < 25){
				let commentsContainer = create("div",["hohCommentsContainer","b" + activities[i].link]);
				let comments = create("a",["hohComments","link"],"comments",commentsContainer);
				create("span","hohMonospace","+",comments);
				comments.onclick = function(){
					if(this.children[0].innerText === "+"){
						this.children[0].innerText = "-";
						this.parentNode.children[1].style.display = "inline-block";
						let variables = {
							id: +this.parentNode.classList[1].substring(1)
						};
						generalAPIcall(queryActivity,variables,commentCallback,"hohListActivityCall" + variables.id,24*60*60*1000,true,true)
					}
					else{
						this.children[0].innerText = "+";
						this.parentNode.children[1].style.display = "none"
					};
				};
				let commentsArea = create("div","hohCommentsArea",false,commentsContainer);
				newNotification.appendChild(commentsContainer)
			}
			newContainer.appendChild(newNotification)
		}
	};
	let activities = [];
	let notifications = document.getElementsByClassName("notification");//collect the "real" notifications
	if(notifications.length === prevLength && forceRebuildFlag === false){
		return
	}
	else{
		prevLength = notifications.length;
		forceRebuildFlag = false;
	};
	const activityTypes = {
		" liked your activity." :                           "like",
		" replied to your activity." :                      "reply",
		" sent you a message." :                            "message",
		" liked your activity reply." :                     "likeReply",
		" mentioned you in their activity." :               "mention",
		" replied to activity you're subscribed to." :      "replyReply",
		" liked your comment, in the forum thread " :       "forumCommentLike",
		" commented in your subscribed forum thread " :     "forumSubscribedComment",
		" replied to your comment, in the forum thread " :  "forumCommentReply",
		" liked your forum thread, " :                      "forumLike",
		" mentioned you, in the forum thread " :            "forumMention"
	};
	Array.from(notifications).forEach(function(notification){//parse real notifications
		notification.already = true;
		notification.style.display = "none";
		let active = {
			type: "special",
			unread: false,
			link: "aaa",//fixme. Edit 2019: I have no idea
			image: notification.children[0].style.backgroundImage,
			href: notification.children[0].href
		};
		if(
			notification.classList.length > 1
			&& notification.classList[1] !== "hasMedia"
		){//"notification unread" classlist
			active.unread = true
		}
		if(//check if we can query that
			notification.children.length >= 2
			&& notification.children[1].children.length
			&& notification.children[1].children[0].children.length
			&& notification.children[1].children[0].children[0].children.length
		){
			const info = notification.children[1].children[0].children[0];
			active.directLink = info.href
			active.text =       info.innerHTML;//does not depend on user input
			active.textName =   (info.childNodes[0] || {textContent: ""}).textContent.trim();
			active.textSpan =   (info.childNodes[1] || {textContent: ""}).textContent;
			let linkMatch =     info.href.match(/activity\/(\d+)/);
			if(linkMatch){
				active.link = linkMatch[1]
			};
			let testType = info.children[0].textContent;
			active.type = activityTypes[testType];
			if(!active.type){
				active.type = "special"; //by default every activity is some weird thing we are displaying as-is
			}
			else if(
				active.type === "forumCommentLike"
				|| active.type === "forumSubscribedComment"
				|| active.type === "forumCommentReply"
				|| active.type === "forumLike"
				|| active.type === "forumMention"
			){
				active.text = (info.children[1] || {textContent: ""}).textContent
			}
		}
		else{
			if(notification.innerText.includes("was recently added to the site")){
				active.type = "newMedia";
				active.text = notification.children[1].innerHTML
			}
		}
		if(active.type === "special"){
			active.text = notification.children[1].innerHTML;//does not depend on user input
			if(notification.children[1].children.length){
				const info = notification.children[1].children[0];
				if(
					info.children.length >= 2
					&& (info.children[1] || {textContent: ""}).textContent === " started following you."
				){
					active.type = "follow";
					active.directLink = info.children[0].href;
					active.text =       info.children[0].innerHTML;//does not depend on user input
					active.textName =   (info.children[0] || {textContent: ""}).textContent.trim();
					active.textSpan =   (info.children[1] || {textContent: ""}).textContent;
				}
				else if(
					info.children.length >= 4
					&& (info.children[3] || {textContent: ""}).textContent === " aired."
				){
					active.type = "airing";
					active.directLink = info.children[0].href;
					active.text = info.innerHTML;//does not depend on user input
				}
			}
		};
		if(
			notification.children.length > 1
			&& notification.children[1].children.length > 1
		){
			active.time = notification.children[1].children[1].innerHTML//does not depend on user input
		}
		else{
			active.time = create("span")
		};
		activities.push(active)
	});
	notificationDrawer(activities);
	for(let i=0;APIcallsUsed < (APIlimit - 5);i++){//heavy
		if(!activities.length || i >= activities.length){//loading is difficult to predict. There may be nothing there when this runs
			break
		};
		let imageCallBack = function(data){
			if(!data){
				return
			}
			pending[data.data.Activity.id + ""] = false;
			let type = data.data.Activity.type;
			if(type === "ANIME_LIST" || type === "MANGA_LIST"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundColor = data.data.Activity.media.coverImage.color || "rgb(var(--color-foreground))";
					stuff.style.backgroundImage = "url(" + data.data.Activity.media.coverImage.large + ")";
					stuff.classList.add("hohBackgroundCover");
					if(data.data.Activity.media.title){
						stuff.parentNode.title = data.data.Activity.media.title.romaji
					}
				})
			}
			else if(type === "TEXT"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.style.backgroundImage = "url(" + data.data.Activity.user.avatar.large + ")";
					stuff.classList.add("hohBackgroundUserCover")
				})
			};
			if(data.data.Activity.replies.length){
				commentCallback(data)
			}
		};
		let vars = {
			find: i
		};
		if(activities[i].link[0] !== "a"){//activities with post link
			let variables = {
				id: +activities[i].link
			};
			if(!pending[activities[i].link]){
				pending[activities[i].link] = true;
				generalAPIcall(queryActivity,variables,imageCallBack,"hohListActivityCall" + variables.id,24*60*60*1000,true)
			}
		}
	}
};//end enhanceNotifications

