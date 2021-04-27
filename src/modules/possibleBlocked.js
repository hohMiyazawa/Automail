function possibleBlocked(oldURL){
	let URLstuff = oldURL.match(/\/user\/(.*?)\/?$/);
	if(URLstuff){
		let name = decodeURIComponent(URLstuff[1]);
		const query = `
		query($userName: String) {
			User(name: $userName){
				id
			}
		}`;
		let variables = {
			userName: name
		}
		if(name !== whoAmI){
			generalAPIcall(query,variables,data => {
				let notFound = document.querySelector(".not-found");
				name = name.split("/")[0];
				if(notFound){
					if(name.includes("submissions")){
						notFound.innerText = "This submission was probably denied"
					}
					else if(data){
						notFound.innerText = name + " has blocked you"
					}
					else if(name === "ModChan"){
						notFound.innerText = "Nope."
					}
					else{
						notFound.innerText = name + " does not exist or has a private profile";
						for(let i=0;i<5;i++){
							generalAPIcall(
`
query($id: Int!,$page: Int){
	Page(page: $page){
		following(userId: $id,sort:USERNAME){
			name
		}
	}
}
`,
								{id: userObject.id,page: i},
								function(data){
									if(!data){
										return
									}
									data.data.Page.following.forEach(user => {
										if(user.name.toUpperCase() === name.toUpperCase()){
											notFound.innerText = name + " has a private profile"
										}
									})
								}
							)
						}
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			})
		}
		return
	}
	URLstuff = oldURL.match(/\/(anime|manga)\/(\d+)/);
	if(URLstuff){
		let type = URLstuff[1];
		let id = parseInt(URLstuff[2]);
		const query = `
		query($id: Int,$type: MediaType) {
			Media(id: $id,type: $type){
				genres
			}
		}`;
		let variables = {
			type: type.toUpperCase(),
			id: id
		}
		generalAPIcall(query,variables,data => {
			if(data.data.Media.genres.some(genre => genre === "Hentai")){
				let notFound = document.querySelector(".not-found");
				if(notFound){
					if(id === 320){
						notFound.innerText = `Kite isn't *really* hentai, but it kinda is too, and it's a bit complicated.

(You can enable 18+ content in settings > Anime & Manga)`
					}
					else{
						notFound.innerText = `That's one of them hentais.

(You can enable 18+ content in settings > Anime & Manga)`
					}
					notFound.style.paddingTop = "200px";
					notFound.style.fontSize = "2rem"
				}
			}
		})
	}
}
