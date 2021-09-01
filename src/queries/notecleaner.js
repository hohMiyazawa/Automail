{name: "Note cleaner",
setup: function(){
	if(!useScripts.accessToken){
		miscResults.innerText = loginMessage;
		return
	};
	if(user.toLowerCase() !== whoAmI.toLowerCase()){
		miscResults.innerText = "This is the profile of\"" + user + "\", but currently signed in as \"" + whoAmI + "\". Are you sure this is right?";
		return
	};
	let warning = create("b",false,"Clicking on the red button means changes to your data!",miscResults);
	let description = create("p",false,"When run, this will remove all your list notes. You can not get them back",miscResults);
	create("hr",false,false,miscResults);
	let select = create("select","#typeSelect",false,miscOptions);
	let animeOption = create("option",false,"Anime",select);
	let mangaOption = create("option",false,"Manga",select);
	animeOption.value = "ANIME";
	mangaOption.value = "MANGA";
	let fullRun = create("button",["button","hohButton","danger"],"RUN",miscResults);
	create("hr",false,false,miscResults);
	let changeLog = create("div",false,false,miscResults);

	let runner = function(){
		authAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(iddata,error){
			if(!iddata){
				alert("ID lookup failed!");
				console.log(iddata,error);
				return
			}
			authAPIcall(` 
query ($type: MediaType $userId: Int) {
	MediaListCollection (type: $type userId: $userId ) {
		user {
			name
		}
		lists {
			entries {
				id
				notes
			}
		}
	}
}`,
			{type: select.value,userId: iddata.data.User.id},
			function(data){
				if(!data){
					alert("loading list failed!");
					return
				};
                   		let t = {};
				let mediaEntries = [];

				// Go through all lists
				data.data.MediaListCollection.lists.forEach((list) => {
					// Go through all entries of each list
					list.entries.forEach((entry) => {
						// If entry has notes, add it to the array
						if(entry.notes){
							mediaEntries.push(entry.id);
							t[entry.id] = entry.notes;
						}
					})
				});

				// Remove duplicates from the array
				mediaEntries = [... new Set(mediaEntries)];
				changeLog.innerText = JSON.stringify(t, null, 2);
				authAPIcall(
`mutation ($ids: [Int]) {
	UpdateMediaListEntries (ids: $ids notes: "") {
		id
		notes
	}
}`,
					{ids: mediaEntries},
					function(data){
						if(!data){
							alert("deleting notes failed!");
						}
						else{
							alert("notes deleted!");
						}
					}
				)
			})
		},"hohIDlookup" + user.toLowerCase())
	};
	fullRun.onclick = function(){
		runner()
	}
},code: function(){
	alert("Read the description first!")
}},
