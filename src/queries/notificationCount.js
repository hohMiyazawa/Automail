{name: "Notification count",code: function(){
	if(useScripts.accessToken){
		authAPIcall("query{Page{pageInfo{total}notifications{...on AiringNotification{id}}}}",{},function(data){
			miscResults.innerText = 
`${data.data.Page.pageInfo.total} notifications.
This is your notification count. The notifications of other users are private.`
		})
	}
	else{
		miscResults.innerText = 
`Error: Not signed in with the script. Automail can't read notifications without being granted additional permissions.
You can sign in with the script from the bottom of the settings page.`;
		create("a",false,"https://anilist.co/settings/apps",miscResults).href = "https://anilist.co/settings/apps"
	}
}},
