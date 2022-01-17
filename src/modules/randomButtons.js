exportModule({
	id: "randomButtons",
	description: "Make the headings on the site stats page lead to random entries",
	isDefault: true,
	categories: ["Script"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url === "https://anilist.co/site-stats";
	},
	code: function(){
		let list = [
			{data:"users",single:"user"},
			{data:"media(type: ANIME)",single:"anime"},
			{data:"media(type: MANGA)",single:"manga"},
			{data:"characters",single:"character"},
			{data:"staff",single:"staff"},
			{data:"reviews",single:"review"}
		];
		list.forEach(function(item,index){
			let adder = function(data){
				let place = document.querySelectorAll("section > .heading > h3");
				if(place.length <= index){
					setTimeout(function(){adder(data)},200);
					return;
				}
				let currentText = place[index].innerText;
				place[index].innerText = "";
				let link = create("a","link",currentText,place[index],"cursor:pointer;");
				link.title = "Click to pick one at random";
				let selected = Math.floor(Math.random()*data.data.Page.pageInfo.total);
				link.onclick = function(){
					generalAPIcall(
						`query($page:Int){
							Page(page:$page){
								${item.data}{id}
							}
						}`,
						{page: Math.ceil(selected / 50)},
						function(data){
							window.location.href = "https://anilist.co/" + item.single + "/" + data.data.Page[item.data.replace(/\(.*\)/,"")][selected % 50].id + "/";
						}
					);
				}
			};
			generalAPIcall(
				`query($page:Int){
					Page(page:$page){
						pageInfo{total}
						${item.data}{id}
					}
				}`,
				{page: 1},
				adder
			)
		});
		let speedAdder = function(data){
			if(!data){
				return
			}
			let place = document.querySelector(".page-content .container section");
			if(!place){
				setTimeout(function(){speedAdder(data)},200);
				return;
			}
			let activityContainer = create("div",false,false,place.parentNode);
			create("h3","heading","Current Activity",activityContainer);
			create("p",false,Math.round((3600*199/(data.data.act1.activities[0].createdAt - data.data.act2.activities[data.data.act2.activities.length - 1].createdAt))) + " activities/hour",activityContainer);
			let activities = data.data.text.activities;
			create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " status posts/hour",activityContainer);
			activities = data.data.message.activities;
			create("p",false,(3600*(activities.length - 1)/(activities[0].createdAt - activities[activities.length - 1].createdAt)).roundPlaces(1) + " messages/hour",activityContainer);
			
		};
		generalAPIcall(
			`query{
				act1:Page(page: 1,perPage:10){
					activities(sort:ID_DESC){
						... on TextActivity{createdAt}
						... on MessageActivity{createdAt}
						... on ListActivity{createdAt}
					}
				}
				act2:Page(page: 20,perPage:10){
					activities(sort:ID_DESC){
						... on TextActivity{createdAt}
						... on MessageActivity{createdAt}
						... on ListActivity{createdAt}
					}
				}
				text:Page{
					activities(sort:ID_DESC,type:TEXT){
						... on TextActivity{createdAt}
					}
				}
				message:Page{
					activities(sort:ID_DESC,type:MESSAGE){
						... on MessageActivity{createdAt}
					}
				}
			}`,
			{},
			speedAdder
		)
	}
})
