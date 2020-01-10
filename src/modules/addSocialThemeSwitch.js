function addSocialThemeSwitch(){
	let URLstuff = location.pathname.match(/^\/user\/(.*)\/social/)
	if(!URLstuff){
		return
	};
	if(document.querySelector(".filters .hohThemeSwitch")){
		return
	};
	let target = document.querySelector(".filters");
	if(!target){
		setTimeout(addSocialThemeSwitch,100);
		return;
	}
	let themeSwitch = create("div",["theme-switch","hohThemeSwitch"],false,target,"width:70px;");
	let listView = create("span",false,false,themeSwitch);
	let cardView = create("span","active",false,themeSwitch);
	listView.appendChild(svgAssets2.listView.cloneNode(true));
	cardView.appendChild(svgAssets2.cardView.cloneNode(true));
	listView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		listView.classList.add("active");
		document.querySelector(".user-social").classList.add("listView");
	}
	cardView.onclick = function(){
		document.querySelector(".hohThemeSwitch .active").classList.remove("active");
		cardView.classList.add("active");
		document.querySelector(".user-social.listView").classList.remove("listView");
	}
	let traitorTracer = create("button",["button","hohButton"],"⇌",target,"padding:5px;");
	traitorTracer.title = "Check who follows back. (will not be accurate if there are more than 600)";
	traitorTracer.onclick = function(){
		traitorTracer.setAttribute("disabled","disabled");
		let query = `
		query($userId: Int!){
			${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){following(userId: $userId,sort: USERNAME){name}}").join("\n")}
		}`;
		let traitorText = traitorTracer.parentNode.querySelector(".filter-group .active").childNodes[0].textContent.trim();
		if(traitorText === "Following"){
			query = `
			query($userId: Int!){
				${new Array(12).fill(0).map((foo,index) => "a" + index + ":Page(page:" + index + "){followers(userId: $userId,sort: USERNAME){name}}").join("\n")}
			}`
		}
		else if(traitorText !== "Followers"){
			return
		};
		generalAPIcall("query($name:String){User(name:$name){id}}",{name: decodeURIComponent(URLstuff[1])},function(data){
			generalAPIcall(
				query,
				{userId: data.data.User.id},
				function(people){
					traitorTracer.removeAttribute("disabled");
					let users = new Set(
						[].concat(
							...Object.keys(people.data).map(
								a => people.data[a].following || people.data[a].followers
							)
						).map(a => a.name)
					);
					document.querySelectorAll(".user-follow .follow-card .name").forEach(function(place){
						if(!users.has(place.textContent.trim())){
							place.parentNode.style.border = "7px solid red"
						}
					})
				}
			)
		},"hohIDlookup" + decodeURIComponent(URLstuff[1]).toLowerCase());
	}
}
