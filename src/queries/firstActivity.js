{name: "First Activity",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		let userId = data.data.User.id;
		let userFirstQuery =
		`query ($userId: Int) {
			Activity(sort: ID,userId: $userId){
				... on MessageActivity {
					id
					createdAt
				}
				... on TextActivity {
					id
					createdAt
				}
				... on ListActivity {
					id
					createdAt
				}
			}
		}`;
		generalAPIcall(userFirstQuery,{userId: userId},function(data){
			miscResults.innerText = "";
			let newPage = create("a",false,"https://anilist.co/activity/" + data.data.Activity.id,miscResults,"color:rgb(var(--color-blue));padding-right:30px;");
			newPage.href = "/activity/" + data.data.Activity.id;
			let createdAt = data.data.Activity.createdAt;
			create("span",false," " + (new Date(createdAt*1000)),miscResults);
			let possibleOlder = create("p",false,false,miscResults);
			for(var i=1;i<=15;i++){
				generalAPIcall(userFirstQuery,{userId: userId + i},function(data){
					if(!data){return};
					if(data.data.Activity.createdAt < createdAt){
						createdAt = data.data.Activity.createdAt;
						possibleOlder.innerText = "But the account is known to exist already at " + (new Date(createdAt * 1000));
					}
				})
			}
		},"hohFirstActivity" + data.data.User.id,60*1000);
	},"hohIDlookup" + user.toLowerCase());
}},
