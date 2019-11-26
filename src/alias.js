let createAlias = function(alias){
	if(alias[0] === "css/"){
		moreStyle.textContent += alias[1]
	}
	else{
		const dataSelect = `[href^="${alias[0]}"]`;
		const targetName = alias[1].substring(0,Math.min(100,alias[1].length));
		moreStyle.textContent += `
.title > a${dataSelect}
,a.title${dataSelect}
,.overlay > a.title${dataSelect}
,.media-preview-card a.title${dataSelect}
,.quick-search-results .el-select-dropdown__item a${dataSelect}> span
,.media-embed${dataSelect} .title
,.status > a.title${dataSelect}
,.role-card a.content${dataSelect} > .name{
	visibility: hidden;
	line-height: 0px;
}
.results.media a.title${dataSelect}
,.home .status > a.title${dataSelect}{
	font-size: 2%;
}

a.title${dataSelect}::before
,.quick-search-results .el-select-dropdown__item a${dataSelect} > span::before
,.role-card a.content${dataSelect} > .name::before
,.home .status > a.title${dataSelect}::before
,.media-embed${dataSelect} .title::before
,.overlay > a.title${dataSelect}::before
,.media-preview-card a.title${dataSelect}::before
,.title > a${dataSelect}::before{
	content:"${targetName}";
	visibility: visible;
}`;
	}
}

const shortRomaji = (useScripts.shortRomaji ? [
["/anime/30/","Evangelion"],
["/anime/32/","End of Evangelion"],
["/anime/5114/","Fullmetal Alchemist: Brotherhood"],
["/anime/10620/","Mirai Nikki"],
["/anime/1575/","Code Geass"],
["/anime/2904/","Code Geass R2"],
["/anime/21355/","Re:Zero"],
["/anime/2001/","Gurren Lagann"],
["/anime/21202/","Konosuba!"],
["/anime/21699/","Konosuba! 2"],
["/anime/21574/","Konosuba!: Kono Subarashii Choker ni Shufuku wo!"],
["/anime/9756/","Madoka★Magica"],
["/anime/9989/","AnoHana"],
["/anime/20623/","Kiseijuu"],
["/anime/14741/","Chuunibyou!"],
["/anime/18671/","Chuunibyou! 2"],
["/anime/14813/","OreGairu"],
["/anime/20920/","Danmachi"],
["/anime/8074/","HIGHSCHOOL OF THE DEAD"],
["/anime/849/","Haruhi"],
["/anime/4382/","Haruhi (2009)"],
["/anime/19603/","Unlimited Blade Works"],
["/anime/20792/","Unlimited Blade Works 2"],
["/anime/8769/","OreImo"],
["/anime/10020/","OreImo Specials"],
["/anime/13659/","OreImo 2"],
["/anime/18857/","OreImo 2 Specials"],
["/anime/2025/","Darker than BLACK"],
["/anime/20698/","OreGairu 2"],
["/anime/16592/","Danganronpa"],
["/anime/16742/","WataMote"],
["/anime/101291/","Bunny Girl-senpai"],
["/anime/104157/","Bunny Girl-senpai Movie"],
["/anime/19221/","NouKome"],
["/anime/45/","Rurouni Kenshin"],
["/anime/8795/","Panty & Stocking"],
["/anime/21860/","Sukasuka"],
["/anime/33/","Berserk"],
["/anime/97938/","Boruto"],
["/anime/97907/","Death March"],
["/anime/100183/","Gun Gale Online"],
["/anime/20474/","JoJo: Stardust Crusaders"],
["/anime/20799/","JoJo: Stardust Crusaders - Egypt-hen"],
["/anime/21450/","JoJo: Diamond wa Kudakenai"],
["/anime/102883/","JoJo: Ougon no Kaze"],
["/anime/101921/","Kaguya-sama wa Kokuraseta"],
["/anime/101166/","Danmachi: Orion no Ya"],
["/anime/20791/","Heaven’s Feel I. presage flower"],
["/anime/21718/","Heaven’s Feel II. lost butterfly"],
["/anime/21719/","Heaven’s Feel III. spring song"],
["/anime/1089/","Macross: Ai Oboete Imasu ka"],
["/anime/572/","Nausicaä"],
["/anime/513/","Laputa"],
["/anime/44/","Rurouni Kenshin: Tsuioku-hen"],
["/anime/528/","Mewtwo no Gyakushuu"],
["/anime/530/","Sailor Moon"],
["/anime/740/","Sailor Moon R"],
["/anime/532/","Sailor Moon S"],
["/anime/1239/","Sailor Moon SuperS"],
["/anime/996/","Sailor Moon Sailor Stars"],
["/anime/949/","Gunbuster!"],
["/anime/18677/","Yuushibu"],
["/manga/86635/","Kaguya-sama wa Kokurasetai"],
["/anime/17074/","Monogatari Second Season"],
["/anime/20910/","Shimoseka"],
["/anime/100182/","SAO: Alicization"],
["/anime/108759/","SAO: War of Underworld"],
["/anime/105156/","Shinchou Yuusha"]
] : []);
