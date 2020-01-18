{name: "Message spy",code: function(){
	miscResults.innerText = "";
	let page = 1;
	let results = create("div",false,false,miscResults);
	let moreButton = create("button",["button","hohButton"],"Load more",miscResults);
	let getPage = function(page){
		generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(type: MESSAGE,sort: ID_DESC){
			... on MessageActivity{
				id
				recipient{name}
				message(asHtml: true)
				pure:message(asHtml: false)
				createdAt
				messenger{name}
			}
		}
	}
}`,
			{page: page},
			data => {
				data.data.Page.activities.forEach(function(message){
					if(
						message.pure.includes("AWC")
						|| message.pure.match(/^.{0,8}(thanks|tha?n?x|thank|ty).*follow.{0,10}(http.*(jpg|png|gif))?.{0,10}$/i)
						|| message.pure.match(/for( the)? follow/i)
					){
						return
					};
					let time = new Date(message.createdAt*1000);
					let newElem = create("div","message",false,results);
					create("span","time",time.toISOString().match(/^(.*)\.000Z$/)[1] + " ",newElem);
					let user = create("a",["link","newTab"],message.messenger.name,newElem,"color:rgb(var(--color-blue))");
					user.href = "/user/" + message.messenger.name;
					create("span",false," sent a message to ",newElem);
					let user2 = create("a",["link","newTab"],message.recipient.name,newElem,"color:rgb(var(--color-blue))");
					user2.href = "/user/" + message.recipient.name;
					let link = create("a",["link","newTab"]," Link",newElem);
					link.href = "/activity/" + message.id;
					newElem.innerHTML += DOMPurify.sanitize(message.message);//reason for innerHTML: preparsed sanitized HTML from the Anilist API
					create("hr",false,false,results);
				})
			}
		);
	};getPage(page);
	moreButton.onclick = function(){
		page++;
		getPage(page);
	}
}},
