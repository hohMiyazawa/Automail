exportModule({
	id: "expandedListNotes",
	description: "Click list notes for an expanded view",
	extendedDescription: "For those who write entire essays in their list notes",
	isDefault: true,
	importance: 0,
	categories: ["Lists"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/)
	},
	code: function(){
		let clickHandler = function(){
			let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/user\/(.+)\/(anime|manga)list\/?/);
			let name = decodeURIComponent(URLstuff[1]);
			Array.from(document.querySelectorAll(".list-entries .notes")).forEach(note => {
				note.onclick = function(){
					//getting the title is tricky since the layouts vary
					let title_element = note.parentNode.querySelector(".title a");
					let id = title_element.href.match(/(anime|manga)\/(\d+)\//)[2];
					let title = titlePicker({//hack: pretend we have all this fancy API info
						title: {
							native: title_element.innerText,
							romaji: title_element.innerText,
							english: title_element.innerText
						},
						id: id
					});
					let floatyWindowThingy = createDisplayBox("min-width:400px;min-height:300px;",title);
					floatyWindowThingy.style.maxWidth = "80ch";
					floatyWindowThingy.style.lineHeight = "1.4";
					floatyWindowThingy.style.marginRight = "12px";
					create("p",false,note.getAttribute("label"),floatyWindowThingy,"margin-bottom: 30px;margin-top: 10px;background: rgb(var(--color-background));padding: 10px;border-radius: 5px;");
					//fancy stuff: find activities with replies
					generalAPIcall(
						"query($name:String){User(name:$name){id}}",
						{name: name},
						function(nameData){generalAPIcall(`
							query{
								Page{
									activities(userId: ${nameData.data.User.id},mediaId: ${id}, sort: ID_DESC){
										... on ListActivity{
											status
											progress
											siteUrl
											createdAt
											replies{
												user{name}
												text(asHtml: true)
											}
										}
									}
								}
							}`,
							{},
							function(data){
								data.data.Page.activities.forEach(activity => {
									create("hr",false,false,floatyWindowThingy);
									let activityEntry = create("div","hohTimelineEntry",false,floatyWindowThingy);
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
									if(activity.replies.length){
										let activityReplies = create("div",["hohTimelineEntry","replies"],false,floatyWindowThingy,"margin-left: 30px;");
										activity.replies.forEach(reply => {
											let reply_container = create("div","reply",false,activityReplies,"padding: 10px;margin: 2px;border-radius: 5px;background: rgb(var(--color-background));");
											create("span","name",reply.user.name + ": ",reply_container);
											let text = create("span",false,false,reply_container);
											text.innerHTML = DOMPurify.sanitize(reply.text)//reason for inner HTML: preparsed sanitized HTML from the Anilist API
										})
									}
								})
							}
						)},
						"hohIDlookup" + name.toLowerCase()
					)
				}
			})
			setTimeout(function(){
				if(document.URL.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/)){
					clickHandler()
				}
			},2000)
		};
		clickHandler()
	}
})
