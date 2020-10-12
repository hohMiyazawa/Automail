{name: "Most popular favourites of friends",code: function(){
	generalAPIcall("query($name:String){User(name:$name){id}}",{name: user},function(data){
		generalAPIcall(
			`
query($userId: Int!){
a1:Page(page:1){following(userId: $userId,sort: ID){... stuff}}
a2:Page(page:2){following(userId: $userId,sort: ID){... stuff}}
a3:Page(page:3){following(userId: $userId,sort: ID){... stuff}}
a4:Page(page:4){following(userId: $userId,sort: ID){... stuff}}
a5:Page(page:5){following(userId: $userId,sort: ID){... stuff}}
a6:Page(page:6){following(userId: $userId,sort: ID){... stuff}}
a7:Page(page:7){following(userId: $userId,sort: ID){... stuff}}
a8:Page(page:8){following(userId: $userId,sort: ID){... stuff}}
a9:Page(page:9){following(userId: $userId,sort: ID){... stuff}}
a10:Page(page:10){following(userId: $userId,sort: ID){... stuff}}
User(id: $userId){... stuff}
}

fragment stuff on User{
	name
	favourites{
		anime1:anime(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		anime2:anime(page:2){
			nodes{
				id
				title{romaji}
			}
		}
		manga1:manga(page:1){
			nodes{
				id
				title{romaji}
			}
		}
		manga2:manga(page:2){
			nodes{
				id
				title{romaji}
			}
		}
	}
}`,
			{userId: data.data.User.id},
			function(foll){
				let userList = [].concat(
					...Object.keys(foll.data).map(
						a => foll.data[a].following || []
					)
				);
				let me = foll.data.User;
				me.favourites.anime = me.favourites.anime1.nodes.concat(me.favourites.anime2.nodes);
				delete me.favourites.anime1;
				delete me.favourites.anime2;
				me.favourites.manga = me.favourites.manga1.nodes.concat(me.favourites.manga2.nodes);
				delete me.favourites.manga1;
				delete me.favourites.manga2;
				let animeFavs = {};
				let mangaFavs = {};
				userList.forEach(function(user){
					user.favourites.anime = user.favourites.anime1.nodes.concat(user.favourites.anime2.nodes);
					delete user.favourites.anime1;
					delete user.favourites.anime2;
					user.favourites.anime.forEach(fav => {
						if(animeFavs[fav.id]){
							animeFavs[fav.id].count++
						}
						else{
							animeFavs[fav.id] = {
								count: 1,
								title: fav.title.romaji
							}
						}
					});
					user.favourites.manga = user.favourites.manga1.nodes.concat(user.favourites.manga2.nodes);
					delete user.favourites.manga1;
					delete user.favourites.manga2;
					user.favourites.manga.forEach(fav => {
						if(mangaFavs[fav.id]){
							mangaFavs[fav.id].count++
						}
						else{
							mangaFavs[fav.id] = {
								count: 1,
								title: fav.title.romaji
							}
						}
					})
				});
				miscResults.innerText = "";
				create("h1",false,"Anime:",miscResults,"color:rgb(var(--color-blue))");
				Object.keys(animeFavs).map(key => animeFavs[key]).sort((b,a) => a.count - b.count).slice(0,25).forEach(function(entry){
					create("p",false,entry.count + ": " + entry.title,miscResults)
				});
				create("h1",false,"Manga:",miscResults,"color:rgb(var(--color-blue))");
				Object.keys(mangaFavs).map(key => mangaFavs[key]).sort((b,a) => a.count - b.count).slice(0,25).forEach(function(entry){
					create("p",false,entry.count + ": " + entry.title,miscResults)
				});
				create("h1",false,"Similar favs:",miscResults,"color:rgb(var(--color-blue))");
				let sharePerc = user => {
					let total = user.favourites.anime.length + user.favourites.manga.length + me.favourites.anime.length + me.favourites.manga.length;
					let shared = user.favourites.anime.filter(
						a => me.favourites.anime.some(
							b => a.id === b.id
						)
					).length + user.favourites.manga.filter(
						a => me.favourites.manga.some(
							b => a.id === b.id
						)
					).length;
					return shared/total;
				};
				userList.sort((b,a) => sharePerc(a) - sharePerc(b));
				userList.slice(0,10).forEach(entry => {
					let row = create("p",false,false,miscResults,"position: relative");
					create("a","newTab",entry.name,row)
						.href = "/user/" + entry.name;
					create("span",false,(sharePerc(entry)*200).toPrecision(3) + "%",row,"left: 300px;position: absolute")
				})
			}
		)
	},"hohIDlookup" + user.toLowerCase())
}},
