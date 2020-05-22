function addCustomCSS(){
	if(useScripts.SFWmode){
		return
	};
	let URLstuff = location.pathname.match(/^\/user\/([^/]*)\/?/);
	if(!customStyle.textContent || (decodeURIComponent(URLstuff[1]) !== currentUserCSS)){
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
			customStyle.textContent = "";
			let external = document.getElementById("customExternalCSS");
			if(external){
				external.remove()
			}
			if(!data){
				return;
			};
			let jsonMatch = (data.data.User.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
			if(!jsonMatch){
				return
			};
			try{
				let jsonData;
				try{
					jsonData = JSON.parse(atob(jsonMatch[1]))
				}
				catch(e){
					jsonData = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
				}
				if(jsonData.customCSS){
					if(jsonData.customCSS.match(/^https.*\.css$/)){
						let styleRef = document.createElement("link");
						styleRef.id = "customExternalCSS";
						styleRef.rel = "stylesheet";
						styleRef.type = "text/css";
						styleRef.href = jsonData.customCSS;
						document.getElementsByTagName("head")[0].appendChild(styleRef)
					}
					else{
						customStyle.textContent = jsonData.customCSS
					}
					currentUserCSS = decodeURIComponent(URLstuff[1]);
				}
			}
			catch(e){
				console.warn("Invalid profile JSON for " + variables.userName + ". Aborting.");
				console.log(atob(jsonMatch[1]));
			}
		},"hohProfileBackground" + variables.userName,25*1000);
	}
}
