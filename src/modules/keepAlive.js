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

//by default, allow all refreshes
let allowRefresh = true;

let getSessionToken = function(){
	//block all refreshes while we get the token
	allowRefresh = false;

	// keep this for later, in case we fail to get a new token
	let oldSessionReload = localStorage.getItem("session-reload");

	// set timestamp immediately, so Anilist doesn't reload the page
	localStorage.setItem("session-reload", Date.now());

	// Get the new al_token
	fetch("index.html").then(function(response){
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

		//allow refreshes again, since there's a valid token in place
		allowRefresh = true;
	}).catch(function(){
		//fail silently, but clean up, trust Anilist to do the right thing by default
		localStorage.setItem("session-reload", oldSessionReload);
		allowRefresh = true;
	})
}

new MutationObserver(function(){
	let messages = Array.from(document.querySelectorAll(".el-message--error.is-closable"));
	if(messages.some(message => message.textContent === "Session expired, please refresh")){
		message.querySelector(".el-message__closeBtn").click()
		getSessionToken();
	}
}).observe(
	document.body,
	{attributes: false, childList: true, subtree: false}
)

addEventListener("beforeunload", function(e){
	if(allowRefresh){
		let currentTime = Date.now();
		let tokenTime   = parseInt(localStorage.getItem("session-reload"));

		//check if the token is invalid
		if(!(tokenTime && tokenTime > currentTime - 6e4)){
			e.preventDefault();
			getSessionToken();
			// Return something because browser demand it despite no longer showing the string.
			return e.returnValue = "we don't do that here";
		}
	}
	else{
		return e.returnValue = "we don't do that here";
	}
});
