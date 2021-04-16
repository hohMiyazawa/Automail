function addActivityLinks(activityID){
	let arrowCallback = function(data){
		if(!data){
			return
		}
		let adder = function(link){
			if(!location.pathname.includes("/activity/" + activityID)){
				return;
			};
			let activityLocation = document.querySelector(".activity-entry");
			if(activityLocation){
				activityLocation.appendChild(link);
				return;
			}
			else{
				setTimeout(function(){adder(link)},200);
			}
		};
		let queryPrevious;
		let queryNext;
		let variables = {
			userId: data.data.Activity.userId || data.data.Activity.recipientId,
			createdAt: data.data.Activity.createdAt
		};
		if(data.data.Activity.type === "ANIME_LIST" || data.data.Activity.type === "MANGA_LIST"){
			variables.mediaId = data.data.Activity.media.id;
			queryPrevious = `
query ($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$mediaId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		mediaId: $mediaId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on ListActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "TEXT"){
			queryPrevious = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: TEXT,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on TextActivity{siteUrl createdAt id}
	}
}`;
		}
		else if(data.data.Activity.type === "MESSAGE"){
			let link = create("a","hohPostLink","↑",false,"left:-25px;top:25px;");
			link.href = "/user/" + data.data.Activity.recipient.name + "/";
			link.title = data.data.Activity.recipient.name + "'s profile";
			adder(link);
			variables.messengerId = data.data.Activity.messengerId;
			queryPrevious = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_lesser: $createdAt,
		sort: ID_DESC
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
			queryNext = `
query($userId: Int,$messengerId: Int,$createdAt: Int){
	Activity(
		userId: $userId,
		type: MESSAGE,
		messengerId: $messengerId,
		createdAt_greater: $createdAt,
		sort: ID
	){
		... on MessageActivity{siteUrl createdAt id}
	}
}`;
		}
		else{//unknown new types of activities
			return;
		};
		if(data.previous){
			if(data.previous !== "FIRST"){
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.href = data.previous;
				link.rel = "prev";
				link.title = "Previous activity";
				adder(link);
			}
		}
		else{
			data.previous = "FIRST";
			generalAPIcall(queryPrevious,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","←",false,"left:-25px;");
				link.title = "Previous activity";
				link.rel = "prev";
				link.href = pdata.data.Activity.siteUrl;
				adder(link);
				data.previous = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.next = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		}
		if(data.next){
			let link = create("a","hohPostLink","→",false,"right:-25px;");
			link.href = data.next;
			link.rel = "next";
			link.title = "Next activity";
			adder(link);
		}
		else{
			generalAPIcall(queryNext,variables,function(pdata){
				if(!pdata){
					return;
				}
				let link = create("a","hohPostLink","→",false,"right:-25px;");
				link.href = pdata.data.Activity.siteUrl;
				link.rel = "next";
				link.title = "Next activity";
				adder(link);
				data.next = pdata.data.Activity.siteUrl;
				sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
				pdata.data.Activity.type = data.data.Activity.type;
				pdata.data.Activity.userId = variables.userId;
				pdata.data.Activity.media = data.data.Activity.media;
				pdata.data.Activity.messengerId = data.data.Activity.messengerId;
				pdata.data.Activity.recipientId = data.data.Activity.recipientId;
				pdata.data.Activity.recipient = data.data.Activity.recipient;
				pdata.previous = document.URL;
				sessionStorage.setItem("hohActivity" + pdata.data.Activity.id,JSON.stringify(pdata));
			});
		};
		sessionStorage.setItem("hohActivity" + activityID,JSON.stringify(data));
	}
	let possibleCache = sessionStorage.getItem("hohActivity" + activityID);
	if(possibleCache){
		arrowCallback(JSON.parse(possibleCache));
	}
	else{
		//has to be auth now that private messages are a thing
		authAPIcall(`
query($id: Int){
	Activity(id: $id){
		... on ListActivity{
			type
			userId
			createdAt
			media{id}
		}
		... on TextActivity{
			type
			userId
			createdAt
		}
		... on MessageActivity{
			type
			recipientId
			recipient{name}
			messengerId
			createdAt
		}
	}
}`,{id:activityID},arrowCallback);
	}
}
