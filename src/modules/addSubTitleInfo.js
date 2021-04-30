function addSubTitleInfo(){
	let URLstuff = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/.*/);
	if(!URLstuff){
		return
	}
	else if(document.querySelector(".hohExtraBox")){
		document.querySelector(".hohExtraBox").remove()
	};
	let sidebar = document.querySelector(".sidebar");
	if(!sidebar){
		setTimeout(addSubTitleInfo,200);
		return
	};
	let infoNeeded = {};
	Array.from(sidebar.querySelectorAll(".data-set .type")).forEach(pair => {
		if(pair.innerText === "Native"){
			infoNeeded.native = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "Romaji"){
			infoNeeded.romaji = pair.nextElementSibling.innerText
		}
		if(pair.innerText === "English"){
			infoNeeded.english = pair.nextElementSibling.innerText
		}
		else if(pair.innerText === "Format"){
			infoNeeded.format = pair.nextElementSibling.innerText;
			if(infoNeeded.format === "Manga (Chinese)"){
				infoNeeded.format = "Manhua"
			}
			else if(infoNeeded.format === "Manga (Korean)"){
				infoNeeded.format = "Manhwa"
			}
		}
		else if(pair.innerText === "Release Date" || pair.innerText === "Start Date"){
			infoNeeded.year = pair.nextElementSibling.innerText.match(/\d{4}/)[0]
		}
		else if(pair.innerText === "Studios"){
			infoNeeded.studios = pair.nextElementSibling.innerText.split("\n");
			infoNeeded.studiosLinks = Array.from(
				pair.nextElementSibling.querySelectorAll("a")
			).map(a => a.href);
		}
	});
	if(!infoNeeded.romaji){//guaranteed to exist, so a good check for if the sidebar has loaded
		setTimeout(addSubTitleInfo,200);
		return
	}
	let title = document.querySelector(".content > h1");
	let extraBox = create("div","hohExtraBox");
	title.parentNode.insertBefore(extraBox,title.nextElementSibling);
	let subTitle = create("p","value","",extraBox,"margin:2px;font-style:italic;");
	if(useScripts.titleLanguage === "NATIVE"){
		if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.native){
			subTitle.innerText = infoNeeded.romaji
		}
		else if(infoNeeded.english && infoNeeded.english !== infoNeeded.native){
			subTitle.innerText = infoNeeded.english
		}
	}
	else if(useScripts.titleLanguage === "ENGLISH"){
		if(infoNeeded.native && infoNeeded.native !== infoNeeded.english){
			subTitle.innerText = infoNeeded.native
		}
		else if(infoNeeded.romaji && infoNeeded.romaji !== infoNeeded.english){
			subTitle.innerText = infoNeeded.romaji
		}
	}
	else{
		if(
			infoNeeded.native
			&& infoNeeded.native.replace(//convert fullwidth to regular before comparing
				/[\uff01-\uff5e]/g,
				ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
			) !== infoNeeded.romaji
		){
			subTitle.innerText = infoNeeded.native
		}
	}
	if(infoNeeded.year){
		create("a","value",infoNeeded.year,extraBox,"margin-right:10px;")
			.href = "/search/" + URLstuff[1] + "?year=" + infoNeeded.year + "%25"
	}
	if(infoNeeded.format && infoNeeded.format !== "Manga"){
		create("span","value",infoNeeded.format,extraBox,"margin-right:10px;")
	}
	if(infoNeeded.studios){
		let studioBox = create("span","value",false,extraBox);
		infoNeeded.studios.forEach((studio,i) => {
			let studiolink = create("a",false,studio,studioBox);
			studiolink.href = infoNeeded.studiosLinks[i];
			if(i < infoNeeded.studios.length - 1){
				create("span",false,", ",studioBox)
			}
		})
	}
}
