function profileBackground(){
	if(useScripts.SFWmode){//clearly not safe, users can upload anything
		return
	};
	let URLstuff = location.pathname.match(/^\/user\/(.*?)\/?$/);
	const query = `
	query($userName: String) {
		User(name: $userName){
			about
		}
	}`;
	let variables = {
		userName: decodeURIComponent(URLstuff[1])
	}
	generalAPIcall(query,variables,data => {
		if(!data){
			return;
		};
		let jsonMatch = (data.data.User.about || "").match(/^<!--(\{.*})-->/);
		if(!jsonMatch){
			let target = document.querySelector(".user-page-unscoped");
			if(target){
				target.style.background = "unset"
			}
			return;
		};
		try{
			let jsonData = JSON.parse(jsonMatch[1]);
			let adder = function(){
				if(!location.pathname.match(/^\/user\/(.*?)\/?$/)){
					return
				};
				let target = document.querySelector(".user-page-unscoped");
				if(target){
					target.style.background = jsonData.background || "none";
				}
				else{
					setTimeout(adder,200);
				}
			};adder();
		}
		catch(e){
			console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
			console.log(jsonMatch[1]);
		};
	},"hohProfileBackground" + variables.userName,30*1000);
}
