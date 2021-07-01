// see https://github.com/hohMiyazawa/Automail/issues/65
// many thanks to Koopz for reverse engineering this

exportModule({
	id: "keepAlive",
	description: "Keep connections alive to prevent 'Session expired' errors",
	extendedDescription: `Info: https://github.com/hohMiyazawa/Automail/issues/65`,
	isDefault: true,
	importance: 0,
	categories: ["Script","Newly Added"],
	visible: true
})
// keep this for later, in case we fail to get a new token
let oldSessionReload = localStorage.getItem("session-reload");
localStorage.setItem("session-reload", Date.now() + 24*60*60*1000);

let getSessionToken = function(){
	fetch("home").then(function(response){
		return response.text()
	}).then(function(html){
		html.match(/window\.al_token\ =\ "([a-zA-Z0-9]+)";/);
		console.log("token",token);
		if(!token){
			//idk, stuff changed, better clean up after the failed attempt
			throw "no token found"
		}
		window.eval('window.al_token = "' + token[1] + '";');
		//alert the other tabs so they don't have to do the same
		aniCast.postMessage({type:"sessionToken",value:token[1]});
	}).catch(function(){
		//fail silently, but clean up, trust Anilist to do the right thing by default
		localStorage.setItem("session-reload", oldSessionReload);
	})
}

let checkToken = setInterval(
	getSessionToken,
	5*60*1000
)

new MutationObserver(function(){
	let messages = Array.from(document.querySelectorAll(".el-message--error.is-closable"));
	if(messages.some(message => message.textContent === "Session expired, please refresh")){
		getSessionToken();
		messages.forEach(message => {
			if(message.textContent === "Session expired, please refresh"){
				message.querySelector(".el-message__closeBtn").click()
			}
		})
	}
}).observe(
	document.body,
	{attributes: false, childList: true, subtree: false}
)
