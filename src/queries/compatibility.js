{name: "Check compatibility with all following (slow)",setup: function(){
	create("span",false,"List Type: ",miscOptions);
	let select = create("select","#typeSelect",false,miscOptions);
	let animeOption = create("option",false,"Anime",select);
	let mangaOption = create("option",false,"Manga",select);
	animeOption.value = "ANIME";
	mangaOption.value = "MANGA";
},code: function(){
	miscResults.innerText = "";
	let loadingStatus = create("p",false,false,miscResults);
	loadingStatus.innerText = "Looking up ID...";
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		let userId = data.data.User.id;
		let currentLocation = location.pathname;
		loadingStatus.innerText = "Loading media list...";
		let typeList = document.getElementById("typeSelect").value + "";
		generalAPIcall(
			queryMediaListCompat,
			{
				name: user,
				listType: typeList
			},
			function(data){
				loadingStatus.innerText = "Loading users...";
				let comDisplay = create("div","hohComDisplay",false,miscResults);
				let list = returnList(data).filter(element => element.scoreRaw);
				let comCache = [];
				let drawComCache = function(){
					removeChildren(comDisplay)
					comCache.forEach(function(friend){
						let userRow = create("p",false,false,comDisplay);
						let differenceSpan = create("span",false,
							(friend.difference.toPrecision(3).includes("e") ? "0.000" : friend.difference.toPrecision(3)),
							userRow,"min-width:50px;display:inline-block;"
						);
						if(friend.difference < 0.9){
							differenceSpan.style.color = "green"
						}
						else if(friend.difference > 1.1){
							differenceSpan.style.color = "red"
						};
						userRow.appendChild(document.createTextNode(" "))
						let friendLink = create("a","newTab",friend.user,userRow,"color:rgb(var(--color-blue))");
						friendLink.href = "/user/" + friend.user;
						create("span",false,", " + friend.shared + " shared.",userRow)
					})
				};
				let friendsCaller = function(page){
					if(document.getElementById("typeSelect").value !== typeList){
						loadingStatus.innerText = "Query aborted";
						return
					}
					generalAPIcall(
						`query($id: Int!,$page: Int){
							Page(page: $page){
								pageInfo{
									lastPage
								}
								following(userId: $id,sort: USERNAME){
									name
								}
							}
						}`,
						{id: userId,page: page},
						function(data){
							let index = 0;
							let delayer = function(){
								if(location.pathname !== currentLocation){
									return
								}
								if(document.getElementById("typeSelect").value !== typeList){
									loadingStatus.innerText = "Query aborted";
									return
								}
								loadingStatus.innerText = "Comparing with " + data.data.Page.following[index].name + "...";
								compatCheck(list,data.data.Page.following[index].name,typeList,function(data){
									if(data.difference){
										comCache.push(data);
										comCache.sort((a,b) => a.difference - b.difference);
										drawComCache();
									}
								});
								if(++index < data.data.Page.following.length){
									setTimeout(delayer,1000)
								}
								else{
									if(page < data.data.Page.pageInfo.lastPage){
										friendsCaller(page + 1)
									}
									else{
										loadingStatus.innerText = ""
									}
								}
							};delayer(index);
						}
					)
				};friendsCaller(1);
			},"hohCompat" + typeList + user,5*60*1000
		);
	},"hohIDlookup" + user.toLowerCase());
}},
