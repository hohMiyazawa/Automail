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
			check.checked = defaultValue;
		}
		if(titleText){
			descriptionText.title = titleText;
		}
	};
	[
		["Link-only","linkOnly",true],
		["Bad words","badWords",true,"I'm not claiming all or any of the words in the internal list are inheritely bad, they are just a useful heuristic"],
		["Piracy links","piracy",true],
		["High activity","highActivity",true]
	
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
							message
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
				if(document.getElementById("linkOnly").checked){
					if(checkActivities){
						data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
							if(activity.text.match(/^<p><a\shref=".*?<\/a><\/p>$/)){
								let row = create("p",false,false,miscResults);
								create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
									.href = activity.siteUrl;
								create("span",false,"Link-only post. Spam?",row);
								create("p",false,false,row).innerText = entityUnescape(activity.text);
							}
						})
					}
				}
				if(document.getElementById("piracy").checked){
					if(checkActivities){
						data.data.activities1.activities.concat(data.data.activities2.activities).forEach(activity => {
							(activity.text.match(/<a href=\".*?\"/g) || []).forEach(link => {
								let linker = (
									new URL(
										(link.match(/\"(.*?)\"/) || ["",""])[1]
									)
								).host;
								if(linker && linker.split(".").length >= 2){
									linker = linker.split(".")[linker.split(".").length - 2];
									if(
										m4_include(data/badDomains.json).includes(hashCode(linker))
									){
										let row = create("p",false,false,miscResults);
										create("a",["link","newTab"],activity.siteUrl,row,"width:440px;display:inline-block;")
											.href = activity.siteUrl;
										create("span",false,"Possible piracy link",row);
										create("p",false,false,row).innerText = entityUnescape(activity.text);
									}
								};
							});
						})
					}
				}
				if(miscResults.innerText === ""){
					miscResults.innerText = "Inspection completed. Nothing unusual found.";
				}
			}
		)
	}
}},
