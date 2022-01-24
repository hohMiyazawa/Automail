exportModule({
	id: "keepAlive",
	description: "Keep connections alive to prevent 'Session expired' errors [EXPERIMENTAL]",
	extendedDescription: `Not perfectly working yet. Info: https://github.com/hohMiyazawa/Automail/issues/65`,
	isDefault: false,
	importance: 0,
	categories: ["Script"],
	visible: true
})

new MutationObserver(function(){
	let messages = Array.from(document.querySelectorAll(".el-message--error.is-closable"));
	if(messages.some(message => message.textContent === "Session expired, please refresh")){
		fetch("index.html").then(function(response){
			return response.text()
		}).then(function(html){
			let token = html.match(/window\.al_token = "([a-zA-Z0-9]+)";/);
			console.log("token",token);
			if(!token){
				return//idk, stuff changed, better do nothing
			}
			window.al_token = token;
			//alert the other tabs so they don't have to do the same
			aniCast.postMessage({type:"sessionToken",value:token});
			//fetch the alert list again, they may have piled up while fetching
			Array.from(document.querySelectorAll(".el-message--error.is-closable")).forEach(message => {
				if(message.textContent === "Session expired, please refresh"){
					message.querySelector(".el-message__closeBtn").click()
				}
			});
		}).catch(function(){})//fail silently, trust Anilist to do the right thing by default
	}
}).observe(
	document.body,
	{attributes: false, childList: true, subtree: false}
)
