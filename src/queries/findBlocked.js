{name: "Find people you have blocked/are blocked by",code: function(){
	if(!useScripts.accessToken){
		miscResults.innerText = loginMessage;
		return
	}
	miscResults.innerText = `This only applies to you, regardless of what stats page you ran this query from. Furthermore, it probably won't find everyone.
Use the other query if you just want the number.`;
	let flag = true;
	let stopButton = create("button",["button","hohButton"],"Stop",miscResults,"display:block");
	let progress = create("p",false,false,miscResults);
	stopButton.onclick = function(){
		flag = false
	};
	let blocks = new Set();
	progress.innerText = "1 try..."
	let caller = function(page,page2){
		generalAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
				user{name}
			}
		}
	}
}`,
		{page: page},function(data){
			progress.innerText = (page + 1) + " tries...";
			authAPIcall(`
query($page: Int){
	Page(page: $page){
		activities(sort: ID_DESC,type: TEXT){
			... on TextActivity{
				id
			}
		}
	}
}`,						{page: page2},function(data2){
				let offset = 0;
				while(data2.data.Page.activities[offset].id > data.data.Page.activities[0].id){
					offset++
				};
				while(data2.data.Page.activities[0].id < data.data.Page.activities[-offset].id){
					offset--
				};
				for(var k=Math.max(-offset,0);k<data.data.Page.activities.length && (k + offset)<data2.data.Page.activities.length;k++){
					if(data.data.Page.activities[k].id !== data2.data.Page.activities[k + offset].id){
						offset--;
						if(!blocks.has(data.data.Page.activities[k].user.name)){
							let row = create("p",false,false,miscResults);
							let link = create("a",["link","newTab"],data.data.Page.activities[k].user.name,row);
							link.href = "/user/" + data.data.Page.activities[k].user.name;
							blocks.add(data.data.Page.activities[k].user.name)
						}
					};
				};
				if(flag){
					if(offset < -50){
						page2--
					};
					setTimeout(function(){caller(page + 1,page2 + 1)},2000)
				}
			})
		});
	};caller(1,1);
}},
