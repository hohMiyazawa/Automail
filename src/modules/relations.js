exportModule({
	id: "relations",
	description: translate("$relations_description"),
	isDefault: true,
	categories: ["Profiles"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return /^https:\/\/anilist\.co\/user\/(.*)\/social/.test(url)
	},
	code: function(){
		let their_followers = null;
		let their_following = null;
		let my_followers = null;
		let my_following = null;
		let userID = null;
		let user = decodeURIComponent(document.URL.match(/^https:\/\/anilist\.co\/user\/(.*)\/social/)[1]);
		generalAPIcall(
			"query($name:String){User(name:$name){id}}",
			{name: user},
			function(data){
				userID = data.data.User.id
			},
			"hohIDlookup" + user.toLowerCase()
		);
		
		let adder = function(){
			let matching = location.pathname.match(/^\/user\/(.*)\/social/);
			if(!matching){
				return;
			}
			let target = document.querySelector(".filters .filter-group");
			if(!target){
				setTimeout(adder,500);
				return
			}
			let hohDisplay = create("div",["hohSocialContent","user-follow"],false,target.parentNode.parentNode);
			Array.from(target.children).forEach(child => {
				child.onclick = function(){
					let possibleActive = target.querySelector(".active");
					if(possibleActive){
						possibleActive.classList.remove("active");
					}
					possibleActive = target.querySelector(".active");
					if(possibleActive){
						possibleActive.classList.remove("active");
					}
					child.classList.add("active");
					target.parentNode.parentNode.children[1].style.display = "block";
					hohDisplay.style.display = "none";
				}
			})
			let followingOnly = create("span",false,translate("$relations_following_only"),target);
			let followingOnly_count = create("span","hohCount",false,followingOnly);
			let followersOnly = create("span",false,translate("$relations_followers_only"),target);
			let followersOnly_count = create("span","hohCount",false,followersOnly);
			let mutuals = create("span",false,translate("$relations_mutuals"),target);
			let mutuals_count = create("span","hohCount",false,mutuals);
			let sharedFollowing = create("span",false,translate("$relations_shared_following"),target);
			let sharedFollowing_count = create("span","hohCount",false,sharedFollowing);
			let sharedFollowers = create("span",false,translate("$relations_shared_followers"),target);
			let sharedFollowers_count = create("span","hohCount",false,sharedFollowers);
			if(user === whoAmI){
				sharedFollowing.style.display = "none";
				sharedFollowers.style.display = "none";
			}
			let commonUI = function(){
				let possibleActive = target.querySelector(".active");
				if(possibleActive){
					possibleActive.classList.remove("active");
				}
				possibleActive = target.querySelector(".active");
				if(possibleActive){
					possibleActive.classList.remove("active");
				}
				target.parentNode.parentNode.children[1].style.display = "none";
				hohDisplay.style.display = ""
			}

			let activeModule = "";

			let followingOnlyDisplay = function(){
				hohDisplay.innerText = "";
				let count = 0;
				their_following.forEach((user,key) => {
					if(!their_followers.has(key)){
						count++;
						if(activeModule === "followingOnly"){
							let card = create("div","follow-card",false,hohDisplay);
							let avatar = create("div","avatar",false,card);
							avatar.style.backgroundImage = 'url("' + user.avatar.large + '")';
							let name = create("a","name",user.name,avatar);
							name.href = "/user/" + user.name;
						}
					}
				})
				followingOnly_count.innerText = count
			}

			let followersOnlyDisplay = function(){
				hohDisplay.innerText = "";
				let count = 0;
				their_followers.forEach((user,key) => {
					if(!their_following.has(key)){
						count++;
						if(activeModule === "followersOnly"){
							let card = create("div","follow-card",false,hohDisplay);
							let avatar = create("div","avatar",false,card);
							avatar.style.backgroundImage = 'url("' + user.avatar.large + '")';
							let name = create("a","name",user.name,avatar);
							name.href = "/user/" + user.name;
						}
					}
				})
				followersOnly_count.innerText = count
			}

			let mutualDisplay = function(){
				hohDisplay.innerText = "";
				let count = 0;
				their_followers.forEach((user,key) => {
					if(their_following.has(key)){
						count++;
						if(activeModule === "mutuals"){
							let card = create("div","follow-card",false,hohDisplay);
							let avatar = create("div","avatar",false,card);
							avatar.style.backgroundImage = 'url("' + user.avatar.large + '")';
							let name = create("a","name",user.name,avatar);
							name.href = "/user/" + user.name;
						}
					}
				})
				mutuals_count.innerText = count
			}

			let sharedFollowingDisplay = function(){
				hohDisplay.innerText = "";
				let count = 0;
				their_following.forEach((user,key) => {
					if(my_following.has(key)){
						count++;
						if(activeModule === "sharedFollowing"){
							let card = create("div","follow-card",false,hohDisplay);
							let avatar = create("div","avatar",false,card);
							avatar.style.backgroundImage = 'url("' + user.avatar.large + '")';
							let name = create("a","name",user.name,avatar);
							name.href = "/user/" + user.name;
						}
					}
				})
				sharedFollowing_count.innerText = count
			}

			let sharedFollowersDisplay = function(){
				hohDisplay.innerText = "";
				let count = 0;
				their_followers.forEach((user,key) => {
					if(my_followers.has(key)){
						count++;
						if(activeModule === "sharedFollowers"){
							let card = create("div","follow-card",false,hohDisplay);
							let avatar = create("div","avatar",false,card);
							avatar.style.backgroundImage = 'url("' + user.avatar.large + '")';
							let name = create("a","name",user.name,avatar);
							name.href = "/user/" + user.name;
						}
					}
				})
				sharedFollowers_count.innerText = count
			}

			let collect_theirFollowing = function(page1,page2,id,displayer){
				generalAPIcall(
`query{
	page1:Page(page:${page1}){
		following(userId:${id}){
			id name avatar{large}
		}
	}
	page2:Page(page:${page2}){
		following(userId:${id}){
			id name avatar{large}
		}
	}
}`,
					{},
					function(data){
						if(!data){
							return;
						}
						data.data.page1.following.concat(data.data.page2.following).forEach(user => {
							their_following.set(user.id,user)
						})
						displayer();
						if(data.data.page2.following.length){
							collect_theirFollowing(page1 + 2,page2 + 2,id,displayer)
						}
					}
				);
			}
			let collect_theirFollowers = function(page1,page2,id,displayer){
				generalAPIcall(
`query{
	page1:Page(page:${page1}){
		followers(userId:${id}){
			id name avatar{large}
		}
	}
	page2:Page(page:${page2}){
		followers(userId:${id}){
			id name avatar{large}
		}
	}
}`,
					{},
					function(data){
						if(!data){
							return;
						}
						data.data.page1.followers.concat(data.data.page2.followers).forEach(user => {
							their_followers.set(user.id,user)
						})
						displayer();
						if(data.data.page2.followers.length){
							collect_theirFollowers(page1 + 2,page2 + 2,id,displayer)
						}
					}
				);
			}

			let collect_myFollowing = function(page1,page2,id,displayer){
				generalAPIcall(
`query{
	page1:Page(page:${page1}){
		following(userId:${id}){
			id name avatar{large}
		}
	}
	page2:Page(page:${page2}){
		following(userId:${id}){
			id name avatar{large}
		}
	}
}`,
					{},
					function(data){
						if(!data){
							return;
						}
						data.data.page1.following.concat(data.data.page2.following).forEach(user => {
							my_following.set(user.id,user)
						})
						displayer();
						if(data.data.page2.following.length){
							collect_myFollowing(page1 + 2,page2 + 2,id,displayer)
						}
					}
				);
			}
			let collect_myFollowers = function(page1,page2,id,displayer){
				generalAPIcall(
`query{
	page1:Page(page:${page1}){
		followers(userId:${id}){
			id name avatar{large}
		}
	}
	page2:Page(page:${page2}){
		followers(userId:${id}){
			id name avatar{large}
		}
	}
}`,
					{},
					function(data){
						if(!data){
							return;
						}
						data.data.page1.followers.concat(data.data.page2.followers).forEach(user => {
							my_followers.set(user.id,user)
						})
						displayer();
						if(data.data.page2.followers.length){
							collect_myFollowers(page1 + 2,page2 + 2,id,displayer)
						}
					}
				);
			}

			followingOnly.onclick = function(){
				commonUI();
				activeModule = "followingOnly";
				followingOnly.classList.add("active");
				if(their_followers && their_following){
					followingOnlyDisplay()
				}
				else if(their_followers && !their_following){
					their_following = new Map();
					collect_theirFollowing(1,2,userID,followingOnlyDisplay);
				}
				else if(!their_followers && their_following){
					their_followers = new Map();
					collect_theirFollowers(1,2,userID,followingOnlyDisplay);
				}
				else{
					their_following = new Map();
					their_followers = new Map();
					collect_theirFollowing(1,2,userID,followingOnlyDisplay);
					collect_theirFollowers(1,2,userID,followingOnlyDisplay);
				}
			}
			followersOnly.onclick = function(){
				commonUI();
				activeModule = "followersOnly";
				followersOnly.classList.add("active");
				if(their_followers && their_following){
					followersOnlyDisplay()
				}
				else if(their_followers && !their_following){
					their_following = new Map();
					collect_theirFollowing(1,2,userID,followersOnlyDisplay);
				}
				else if(!their_followers && their_following){
					their_followers = new Map();
					collect_theirFollowers(1,2,userID,followersOnlyDisplay);
				}
				else{
					their_following = new Map();
					their_followers = new Map();
					collect_theirFollowing(1,2,userID,followersOnlyDisplay);
					collect_theirFollowers(1,2,userID,followersOnlyDisplay);
				}
			}
			mutuals.onclick = function(){
				commonUI();
				activeModule = "mutuals";
				mutuals.classList.add("active");
				if(their_followers && their_following){
					mutualDisplay()
				}
				else if(their_followers && !their_following){
					their_following = new Map();
					collect_theirFollowing(1,2,userID,mutualDisplay);
				}
				else if(!their_followers && their_following){
					their_followers = new Map();
					collect_theirFollowers(1,2,userID,mutualDisplay);
				}
				else{
					their_following = new Map();
					their_followers = new Map();
					collect_theirFollowing(1,2,userID,mutualDisplay);
					collect_theirFollowers(1,2,userID,mutualDisplay);
				}
			}
			sharedFollowing.onclick = function(){
				commonUI();
				activeModule = "sharedFollowing";
				sharedFollowing.classList.add("active");
				if(their_following && my_following){
					sharedFollowingDisplay()
				}
				else if(their_following && !my_following){
					my_following = new Map();
					collect_myFollowing(1,2,userObject.id,sharedFollowingDisplay);
				}
				else if(!their_following && my_following){
					their_following = new Map();
					collect_theirFollowing(1,2,userID,sharedFollowingDisplay);
				}
				else{
					my_following = new Map();
					their_following = new Map();
					collect_myFollowing(1,2,userObject.id,sharedFollowingDisplay);
					collect_theirFollowing(1,2,userID,sharedFollowingDisplay);
				}
			}
			sharedFollowers.onclick = function(){
				commonUI();
				activeModule = "sharedFollowers";
				sharedFollowers.classList.add("active");
				if(their_followers && my_followers){
					sharedFollowersDisplay()
				}
				else if(their_followers && !my_followers){
					my_followers = new Map();
					collect_myFollowers(1,2,userObject.id,sharedFollowersDisplay);
				}
				else if(!their_followers && my_followers){
					their_followers = new Map();
					collect_theirFollowers(1,2,userID,sharedFollowersDisplay);
				}
				else{
					my_followers = new Map();
					their_followers = new Map();
					collect_myFollowers(1,2,userObject.id,sharedFollowersDisplay);
					collect_theirFollowers(1,2,userID,sharedFollowersDisplay);
				}
			}
		};adder()
	},
	css: `
.user-social .filter-group span{
	cursor: pointer;
	border-radius: 3px;
	color: rgb(var(--color-text-lighter));
	display: block;
	font-size: 1.4rem;
	margin-bottom: 8px;
	padding: 5px 10px;
}
.user-social .filter-group span.active{
	background: rgba(var(--color-foreground),.8);
	color: rgb(var(--color-text));
	font-weight: 500;
}
.hohSocialContent .follow-card{
	width: 80px;
	position: relative;
}
.hohSocialContent .avatar{
	width: 80px;
	height: 80px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: 50%;
	overflow: hidden;
	border-radius: 4px;
}
.hohSocialContent .avatar .name{
	font-family: Overpass,-apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
	align-items: flex-end;
	background: rgba(var(--color-shadow),.6);
	color: rgb(var(--color-white));
	display: flex;
	font-size: 1.3rem;
	font-weight: 700;
	height: 100%;
	justify-content: center;
	opacity: 0;
	padding: 10px 4px;
	text-align: center;
	transition: opacity .3s ease-in-out;
	width: 100%;
	word-break: break-all;
}
.hohSocialContent .avatar .name:hover{
	opacity: 1;
	color: rgb(var(--color-white));
}
.hohSocialContent{
	display: grid;
	grid-gap: 20px;
	grid-template-columns: repeat(auto-fill,80px);
	grid-template-rows: repeat(auto-fill,80px);
}
`
})
