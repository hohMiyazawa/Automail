exportModule({
	boneless_disable: true,
	id: "selfInsert",
	description: "add " + script_type + " to the apps page",
	isDefault: true,
	categories: ["Script"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url.match("https://anilist.co/apps")
	},
	code: function(){
		let waiter = function(){
			if(!document.URL.match("https://anilist.co/apps")){
				return
			}
			if(document.querySelector(".app.hohscript")){
				return
			}
			let location = document.querySelector("[href=\"https://www.animouto.moe/\"]");
			if(!location){
				setTimeout(waiter,500)
				return
			}
			if(
				location.parentNode.childNodes.length % 3 !== 0
				&& location.parentNode.childNodes.length % 2 !== 0
			){//two or three per row, so only fill the gap if we can make the symmetry pleasing
				let app = location.cloneNode(true);
				app.classList.add("hohscript");
				app.href = scriptInfo.link;
				app.children[0].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABkCAMAAAAL3/3yAAAA1VBMVEUfJjKXHyngDxb6AwXAGCH/AADBAAByAAA4AAAWAAAFAABzAADCAAAeJTEVGiMEBQkAAAAEBgkYHigFBwsFBwwUGSITGCEPExsUGiMZH5kLD+ECA/oAAP8AAMAAYgAAgAACfQULcRYZTykTGMIAAHEAOgATYiEAADcAHQAAABUADAAAAAYABAACA/kCfQYAADgAHgAAAHMAOwAAAMIAYwAVGiQFCAwYHikTGSLDwwB0dAA6OgAXFwAGBgB1dQDExAD//wD5+QX5+Qbg4RaXlynAwSH6+gXAOZK3AAABlUlEQVR42u3ZA4IsMRRG4b8tpW0+m2Nz/0t6rB7mZszzLeFUxQIA4K7E4olEPCaEKZn6KykExVL/xYSQeBQrLoQkolgJISQ1J4QQi1jEIhaxiAViEYtYxCIWsUAsYhGLWMQiFohFLGIRi1jEQjqTzeXzuWyhKJhK5Yqbq5ZLglet7k5o1ASPpjujJZyr7c7RFs7RcpHQv4Wa86gJp5QazqNeEk7qOK+ycFLFeVX1DHV7/YHP0BlGY5/JdKYn6cXA8NIZXo0Nr/UEdQeWN87wdmyZ6enpDSzvnOH92DLV09MfWD44w8exZaKn59Ntxfqsi2MYPrsJ/oszfLUn+Ge3dfjmDN/NrcPz25T+cIaf5qb0Gapy3Lm4svNaEE4qLd7AFQ2Xf0vCRa+Vl4U7fLDgKQy1hjthcUnwKi1U3Vx1oSSYVlbX1jc21tc2t4SQ7TkhhFjEIhaxiEUsEItYxCIWsYgFYhGLWMQiFrFALGIRi1jEIhZ2ola7QsheFGtPCNmPYu0LQQf/Wh1ICNvfOzzc2xcAAHfkF2ouxpBwdu2dAAAAAElFTkSuQmCC";
				app.children[1].textContent = script_type;
				location.parentNode.appendChild(app)
			}
		};
		waiter()
	}
})
