exportModule({
	id: "notifications",
	description: "$setting_notifications",
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

function enhanceNotifications(forceFlag){
	//method: the real notifications are parsed, then hidden and a new list of notifications are created using a mix of parsed data and API calls.
	//alternative method: auth (not implemented)
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
	if(document.getElementById("hohNotifications") && !forceFlag){
		return
	}
	let possibleButton = document.querySelector(".reset-btn");
	if(possibleButton){
		if(!possibleButton.flag){
			possibleButton.flag = true;
			if(useScripts.additionalTranslation){
				possibleButton.childNodes[0].textContent = translate("$notifications_button_reset")
			}
			possibleButton.onclick = function(){
				Array.from(
					document.getElementById("hohNotifications").children
				).forEach(child => {
					child.classList.remove("hohUnread")
				})
			};
			let regularNotifications = create("span",false,svgAssets.envelope + " " + translate("$notifications_showDefault"),possibleButton.parentNode,"cursor: pointer;font-size: small");
			let setting = create("p",false,false,possibleButton.parentNode,"cursor: pointer;font-size: small");
			let checkbox = createCheckbox(setting);
			checkbox.checked = useScripts["hideLikes"];
			checkbox.targetSetting = "hideLikes";
			checkbox.onchange = function(){
				useScripts[this.targetSetting] = this.checked;
				useScripts.save();
				forceRebuildFlag = true;
				enhanceNotifications(true)
			};
			let description = create("span",false,translate("$notifications_hideLike"),setting);
			setting.style.fontSize = "small";
			let softBlockSpan = create("span",false,translate("$notifications_softBlock"),possibleButton.parentNode,"cursor: pointer;font-size: small;display: block;margin: 10px 0px;");
			softBlockSpan.onclick = function(){
				let manager = createDisplayBox("width:600px;height:500px;top:100px;left:220px","Soft block");
				create("p",false,"Hide notifications from specific people. A much less drastic solution than blocking them entirely (if that's what you actually want, this is the wrong place).",manager);
				create("p",false,"The notifications aren't gone, just hidden. 'Show default notifications' should make them visible. Un-soft-blocking will also bring them back. You may also be interested in the 'Notification Dot Colours' and 'Block stuff in the home feed' sections on the settings page.",manager);
				create("p",false,"As an arbitrary decision, I made these people will still show up when grouping similar notifications, since that's not extra spam.",manager);
				let form = create("div",false,false,manager);
				create("span",false,"Username: ",form);
				let userInput = create("input","hohNativeInput",false,form);
				let userAdd = create("button","hohButton","Add",form,"margin-left: 10px");
				let userList = create("div",false,false,manager);
				let renderSoftBlock = function(){
					removeChildren(userList);
					useScripts.softBlock.forEach((user,index) => {
						let item = create("p",false,false,userList,"position: relative");
						create("span",false,user,item);
						let removeButton = create("span","hohDisplayBoxClose",svgAssets.cross,item,"top: 0px");
						removeButton.onclick = function(){
							useScripts.softBlock.splice(index,1);
							useScripts.save();
							renderSoftBlock();
							forceRebuildFlag = true;
							enhanceNotifications(true)
						}
					})
				}
				renderSoftBlock();
				userAdd.onclick = function(){
					if(userInput.value){
						useScripts.softBlock.push(userInput.value);
						renderSoftBlock();
						useScripts.save();
						userInput.value = "";
						forceRebuildFlag = true;
						enhanceNotifications(true)
					}
				}
			}
			if(useScripts.settingsTip){
				create("p",false,
`You can turn parts of the script on and off:
settings > apps.

You can also turn off this notice there.`,setting)
			};
			regularNotifications.onclick = function(){
				if(displayMode === "hoh"){
					displayMode = "native";
					let hohNotsToToggle = document.getElementById("hohNotifications");
					if(hohNotsToToggle){
						hohNotsToToggle.style.display = "none"
					};
					Array.from(
						document.getElementsByClassName("notification")
					).forEach(elem => {
						elem.style.display = "grid"
					})
					regularNotifications.innerText = svgAssets.envelope + " " + translate("$notifications_showHoh");
					setting.style.display = "none"
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
					regularNotifications.innerText = svgAssets.envelope + " " + translate("$notifications_showDefault");
					setting.style.display = ""
				}
			};
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
			inputArea.placeholder = translate("$placeholder_reply");
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
				loading.innerText = translate("$publishingReply");
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
	let findAct = function(act){
		let modi = document.querySelector("#hohNotifications [href='" + act.href + "'");
		if(modi){
			modi.parentNode.querySelector(".hohDataChange").innerHTML = DOMPurify.sanitize(act.text)
		}
	}
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
		activities = activities.filter(
			activity => !(
				activity.textName
				&& useScripts.softBlock.includes(activity.textName)
			)
		);
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
					let possibleDirect = activities[i + counter].directLink.match(/activity\/(\d+)/);
					if(possibleDirect){
						cheapReload(notNotImage,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
					}
				};
				text.href = activities[i].directLink;
				let possibleDirect = activities[i].directLink.match(/activity\/(\d+)/);
				if(possibleDirect){
					cheapReload(text,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
				}
				textSpan.innerText = translate("$notification_likeActivity_1person_1activity");
				if(counter > 1){
					textSpan.innerText = translate("$notification_likeActivity_1person_Mactivity")
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
						activities[i].textName += " & " + activities[i+1].textName;
						textSpan.innerText = translate("$notification_likeActivity_2person_1activity")
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter - 1);
						textSpan.innerText = translate("$notification_likeActivity_Mperson_1activity")
					}
				}
				else{
					newNotification.classList.add("hohCombined")
				};
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1
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
					counter++
				}
				textSpan.innerText = translate("$notification_reply_1person_1reply");
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
						textSpan.innerText = translate("$notification_reply_1person_1reply")
					}
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
						textSpan.innerText = translate("$notification_reply_2person_1reply")
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
						textSpan.innerText = translate("$notification_reply_Mperson_1reply")
					}
				};
				text.href = activities[i].directLink;
				let possibleDirect = activities[i].directLink.match(/activity\/(\d+)/);
				if(possibleDirect){
					cheapReload(text,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
					cheapReload(notNotImage,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
				}
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1
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
					miniImage.title = activities[i + counter].textName;
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
						samePerson = false
					}
					counter++
				}
				textSpan.innerText = translate("$notification_replyReply_1person_1reply");
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
				let possibleDirect = activities[i].directLink.match(/activity\/(\d+)/);
				if(possibleDirect){
					cheapReload(text,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
					cheapReload(notNotImage,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
				}
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1
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
				textSpan.innerText = translate("$notification_likeReply_1person_1reply");
				if(samePerson){
					if(counter > 1){
						text.style.marginTop = "45px";
						activities[i].textName += " x" + counter;
						textSpan.innerText = translate("$notification_likeReply_1person_Mreply")
					}
				}
				else{
					if(counter === 2){
						text.style.marginTop = "45px";
						activities[i].textName += " & " + activities[i+1].textName;
						textSpan.innerText = translate("$notification_likeReply_2person_1reply")
					}
					else if(counter > 2){
						text.style.marginTop = "45px";
						activities[i].textName += " +" + (counter-1);
						textSpan.innerText = translate("$notification_likeReply_Mperson_1reply")
					}
				};
				text.href = activities[i].directLink;
				let possibleDirect = activities[i].directLink.match(/activity\/(\d+)/);
				if(possibleDirect){
					cheapReload(text,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
					cheapReload(notNotImage,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
				}
				textName.innerText = activities[i].textName;
				text.appendChild(textName);
				text.appendChild(textSpan);
				i += counter -1
			}
			else if(
				activities[i].type === "message"
				|| activities[i].type === "mention"
			){
				let notNotImage = create("a",false,false,notNotImageContainer);
				create("img",["hohMediaImage",activities[i].link],false,notNotImage);
				notNotImage.href = activities[i].directLink;
				text.href = activities[i].directLink;
				let possibleDirect = activities[i].directLink.match(/activity\/(\d+)/);
				if(possibleDirect){
					cheapReload(text,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
					cheapReload(notNotImage,{name: "Activity", params: {id: parseInt(possibleDirect[1])}});
				}
				textName.innerText = activities[i].textName;
				if(activities[i].type === "message"){
					textSpan.innerText = translate("$notification_message")
				}
				else{
					textSpan.innerText = translate("$notification_mention")
				}
				text.appendChild(textName);
				text.appendChild(textSpan)
			}
			else if(activities[i].type === "airing"){
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				text.appendChild(textSpan);
				if(useScripts.partialLocalisationLanguage !== "English"){
					let episodeNumber = parseInt(textSpan.childNodes[1].textContent.trim());
					let episodeLink = textSpan.childNodes[4].outerHTML;
					if(episodeNumber){
						textSpan.innerHTML = DOMPurify.sanitize(translate("$notification_airing",[episodeNumber,episodeLink]));//reason for innerHTML: preparsed sanitized HTML from the Anilist API
					}
				}
			}
			else if(activities[i].type === "follow"){
				text.href = activities[i].directLink;
				textName.innerText = activities[i].textName;
				textSpan.innerText = activities[i].textSpan;
				text.appendChild(textName);
				text.appendChild(textSpan)
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
				if(activities[i].type === "forumCommentLike"){
					textSpan.innerText = translate("$notification_forumCommentLike")
				}
				else if(activities[i].type === "forumMention"){
					textSpan.innerText = translate("$notification_forumMention")
				}
				text.style.maxWidth = "none";
				text.style.marginTop = "17px"
			}
			else if(activities[i].type === "newMedia"){
				textSpan.classList.add("hohNewMedia");
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);
				textSpan.querySelector(".context").innerText = translate("$notification_newMedia");
				text.appendChild(textSpan);
				notImage.style.width = "51px";
				text.href = activities[i].href
			}
			else if(activities[i].type === "dataChange"){
				textSpan.classList.add("hohDataChange");
				text.href = activities[i].href;
				notImage.classList.remove("hohUserImage");
				notImage.classList.add("hohBackgroundCover");
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				text.style.marginTop = "10px";
				text.style.marginLeft = "10px";
				text.appendChild(textSpan)
			}
			else{//display as-is
				textSpan.classList.add("hohUnhandledSpecial");
				textSpan.innerHTML = DOMPurify.sanitize(activities[i].text);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
				text.appendChild(textSpan)
			};
			newNotification.appendChild(notImage);
			newNotification.appendChild(text);
			newNotification.appendChild(notNotImageContainer);
			let time = create("div","hohTime");
			if(activities[i - counter + 1].time){
				time.appendChild(nativeTimeElement(activities[i - counter + 1].time))
			}
			newNotification.appendChild(time);
			let commentsContainer = create("div",["hohCommentsContainer","b" + activities[i].link]);
			let comments = create("a",["hohComments","link"],translate("$notifications_comments"),commentsContainer);
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
				}
			};
			let commentsArea = create("div","hohCommentsArea",false,commentsContainer);
			newNotification.appendChild(commentsContainer)
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
		forceRebuildFlag = false
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
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: false
	};
	let observer = new MutationObserver(function(){
		enhanceNotifications(true)
	});
	observer.observe(document.querySelector(".page-content .notifications"),mutationConfig);
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
			//TODO replace this with document.querySelector?
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
				active.type = "special"
				//by default every activity is some weird thing we are displaying as-is
				//makes the transition more smooth every time Anilist introduces a new type of notification
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
			else if(notification.innerText.includes("received site data changes")){
				active.type = "dataChange";
				notification.querySelector(".expand-reason").click();
				setTimeout(function(){
					active.text = notification.children[1].innerHTML;
					findAct(active);
				},100);
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
					active.textSpan =   translate("$notification_follow")
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
			notification.querySelector("time")
		){
			active.time = (new Date(notification.querySelector("time").dateTime).valueOf())/1000
		}
		else{
			active.time = null
		};
		activities.push(active)
	});
	notificationDrawer(activities);
	let alreadyRenderedComments = new Set();
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
					stuff.src = data.data.Activity.media.coverImage.large;
					stuff.classList.add("hohBackgroundCover");
					if(data.data.Activity.media.title){
						stuff.parentNode.title = data.data.Activity.media.title.romaji
					}
				})
			}
			else if(type === "TEXT"){
				Array.from(document.getElementsByClassName(data.data.Activity.id)).forEach(stuff => {
					stuff.src = data.data.Activity.user.avatar.large;
					stuff.classList.add("hohBackgroundUserCover");
					stuff.parentNode.style.background = "none"
				})
			};
			if(data.data.Activity.replies.length){
				if(!alreadyRenderedComments.has(data.data.Activity.id)){
					alreadyRenderedComments.add(data.data.Activity.id);
					commentCallback(data)
				}
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
}

