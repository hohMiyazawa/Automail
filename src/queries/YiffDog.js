{name: "YiffDog officer",setup: function(){
	create("p",false,"Welcome to YiffDog. He's a relative of BroomCat, focused on the social aspect of the site. This police dog is just out of beta, so he doesn't have many options yet.",miscOptions);
	create("p",false,"(If you're reading this, it's probably not even usable yet).",miscOptions);
	create("p","danger","Do not needlessly interact with what's flagged here, limit that to honest mistakes. Silently report, or send mod messages when appropriate.",miscOptions);
	createCheckbox(miscOptions,"activities",true);
	create("span",false,"Activities",miscOptions);
	createCheckbox(miscOptions,"messages",true);
	create("span",false,"Messages",miscOptions);
	createCheckbox(miscOptions,"forum",true);
	create("span",false,"Forum",miscOptions);
	createCheckbox(miscOptions,"reviews",true);
	create("span",false,"Reviews",miscOptions);
	create("h3",false,"Config",miscOptions);
	let conf = function(description,id,defaultValue,titleText){
		let option = create("p",false,false,miscOptions);
		let check = createCheckbox(option,id);
		let descriptionText = create("span",false,description + " ",option);
		if(defaultValue){
			check.checked = defaultValue
		}
		if(titleText){
			descriptionText.title = titleText
		}
	};
	[
		["Link-only","linkOnly",true],
		["Bad words","badWords",true,"I'm not claiming all or any of the words in the internal list are inheritely bad, they are just a useful heuristic"],
		["Piracy links","piracy",true],
		["High activity","highActivity",true],
		["Weird markup","weirdMarkup",true]
	
	].forEach(ig => conf(...ig));
},code: function(){
	let checkActivities = document.getElementById("activities").checked;
	let checkMessages = document.getElementById("messages").checked;
	let checkForum = document.getElementById("forum").checked;
	let checkReviews = document.getElementById("reviews").checked;
	if(checkActivities || checkMessages || checkForum || checkReviews){
		let activitiesQuery = `activities1:Page(page:1){
					activities(type:TEXT,sort:ID_DESC){
						... on TextActivity{
							siteUrl
							text(asHtml: true)
							user{name}
						}
					}
				}
				activities2:Page(page:2){
					activities(type:TEXT,sort:ID_DESC){
						... on TextActivity{
							siteUrl
							text(asHtml: true)
							user{name}
						}
					}
				}`;
		let messagesQuery = `messages:Page(page:1){
					activities(type:MESSAGE,sort:ID_DESC){
						... on MessageActivity{
							siteUrl
							message(asHtml: true)
							messenger{name}
						}
					}
				}`;
		generalAPIcall(
			`query{
				${(checkActivities ? activitiesQuery : "")}
				${(checkMessages ? messagesQuery : "")}
			}`,
			{},
			function(data){
				miscResults.innerText = "";
				let createResultRow = function(siteUrl,label,text){
					let row = create("p",false,false,miscResults);
					create("a",["link","newTab"],siteUrl,row,"width:440px;display:inline-block;")
						.href = siteUrl;
					create("span",false,label,row);
					create("p",false,false,row).innerText = entityUnescape(text)
				}
				let allActivities = data.data.activities1.activities.concat(data.data.activities2.activities);
				if(document.getElementById("linkOnly").checked){
					if(checkActivities){
						allActivities.forEach(activity => {
							if(activity.text.match(/^<p><a\shref=".*?<\/a><\/p>$/)){
								createResultRow(activity.siteUrl,"Link-only post. Spam?",activity.text)
							}
						})
					}
					if(checkMessages){
						data.data.messages.activities.forEach(activity => {
							if(activity.message.match(/^<p><a\shref=".*?<\/a><\/p>$/)){
								createResultRow(activity.siteUrl,"Link-only message. Spam?",activity.message)
							}
						})
					}
				}
				if(document.getElementById("piracy").checked){
					const badDomains = m4_include(data/badDomains.json)
					if(checkActivities){
						allActivities.forEach(activity => {
							(activity.text.match(/<a href=\".*?\"/g) || []).forEach(link => {
								let linker = (
									new URL(
										(link.match(/\"(.*?)\"/) || ["",""])[1]
									)
								).host;
								if(linker && linker.split(".").length >= 2){
									linker = linker.split(".")[linker.split(".").length - 2];
									if(
										badDomains.includes(hashCode(linker))
									){
										createResultRow(activity.siteUrl,"Possible piracy link",activity.text)
									}
								}
							})
						})
					}
					if(checkMessages){
						data.data.messages.activities.forEach(activity => {
							(activity.message.match(/<a href=\".*?\"/g) || []).forEach(link => {
								let linker = (
									new URL(
										(link.match(/\"(.*?)\"/) || ["",""])[1]
									)
								).host;
								if(linker && linker.split(".").length >= 2){
									linker = linker.split(".")[linker.split(".").length - 2];
									if(
										badDomains.includes(hashCode(linker))
									){
										createResultRow(activity.siteUrl,"Possible piracy link",activity.message)
									}
								}
							})
						})
					}
				}
				if(document.getElementById("badWords").checked){
					if(checkActivities){
						allActivities.forEach(activity => {
							let badList = badWords.filter(word => activity.text.toUpperCase().includes(word.toUpperCase()))
							if(badList.length){
								createResultRow(activity.siteUrl,"Word match [" + badList.join("],[") + "]",activity.text)
							}
						})
						data.data.messages.activities.forEach(activity => {
							let badList = badWords.filter(word => activity.message.toUpperCase().includes(word.toUpperCase()))
							if(badList.length){
								createResultRow(activity.siteUrl,"Word match [" + badList.join("],[") + "]",activity.message)
							}
						})
					}
				}
				if(document.getElementById("highActivity").checked){
					if(checkActivities){
						let countMap = new Map();
						allActivities.map(act => act.user.name).forEach(person => {
							countMap.set(person,(countMap.get(person) || 0) + 1)
						})
						countMap.forEach((value,key) => {
							if(value >= allActivities.length/10){
								createResultRow("https://anilist.co/user/" + key,value + " posts in the " + allActivities.length + " most recent posts","")
							}
						})
					}
				}
				if(document.getElementById("weirdMarkup").checked){
					if(checkActivities){
						allActivities.forEach(activity => {
							if(activity.text.length > 50 && LZString.compress(activity.text).length/activity.text.length < 0.1){
								createResultRow(activity.siteUrl,"Low entropy",activity.text)
							}
						})
					}
				}
				if(miscResults.innerText === ""){
					miscResults.innerText = "Inspection completed. Nothing unusual found."
				}
			}
		)
	}
}},
