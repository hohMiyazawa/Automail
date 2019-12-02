let moreStyle = create("style");
moreStyle.id = "conditional-aniscripts-styles";
moreStyle.type = "text/css";

function initCSS(){
moreStyle.textContent = "";

let aliasFlag = false;

if(useScripts.shortRomaji){
	shortRomaji.forEach(createAlias);
	aliasFlag = true;
}

const titleAliases = JSON.parse(localStorage.getItem("titleAliases"));
if(titleAliases){
	aliasFlag = true;
	titleAliases.forEach(createAlias);
}

if(aliasFlag){
	moreStyle.textContent += `
a.title::before
,.quick-search-results .el-select-dropdown__item a > span::before{
	visibility: visible;
	line-height: 1.15;
	margin-right: 2px;
}
.medialist.table .title > a::before{
	visibility: visible;
	font-size: 1.5rem;
	margin-right: 2px;
}
.medialist.compact .title > a::before
,.medialist.cards .title > a::before
,.home .status > a.title::before
,.media-embed .title::before{
	visibility: visible;
	font-size: 1.3rem;
	margin-right: 2px;
}
.role-card a.content > .name::before{
	visibility: visible;
	font-size: 1.2rem;
}
.overlay > a.title::before
,.media-preview-card a.title::before{
	visibility: visible;
	font-size: 1.4rem;
	line-height: 1.15;
}
.role-card a.content > .name{
	line-height: 1.3!important;
}`;
}

if(useScripts.CSSfavs){
/*adds a logo to most favourite studio entries. Add more if needed */
	const favStudios = [
[1,   "Studio-Pierrot",	"https://upload.wikimedia.org/wikipedia/en/thumb/1/10/Studio_Pierrot.jpg/220px-Studio_Pierrot.jpg"],
[2,   "Kyoto-Animation","https://upload.wikimedia.org/wikipedia/commons/b/bf/Kyoto_Animation_logo.svg"],
[3,   "GONZO",		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Gonzo_company.png/220px-Gonzo_company.png"],
[4,   "BONES",		"https://i.stack.imgur.com/7pRQn.png"],
[5,   "Bee-Train",	"https://upload.wikimedia.org/wikipedia/commons/4/45/Bee_Train.svg"],
[6,   "Gainax",		"https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/Gainax_logo.svg/220px-Gainax_logo.svg.png"],
[7,   "JC-Staff",	"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/J.C.Staff_Logo.svg/220px-J.C.Staff_Logo.svg.png"],
[8,   "Artland",	"https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Artland_logo.gif/200px-Artland_logo.gif"],
[10,  "Production-IG",	"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Production_I.G_Logo.svg/250px-Production_I.G_Logo.svg.png"],
[11,  "MADHOUSE",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Madhouse_studio_logo.svg/300px-Madhouse_studio_logo.svg.png"],
[13,  "Studio-4C",	"https://upload.wikimedia.org/wikipedia/en/e/ec/Studio_4C_logo.png"],
[14,  "Sunrise",	"https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Sunrise_company_logo.svg/220px-Sunrise_company_logo.svg.png"],
[17,  "Aniplex",	"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Aniplex_logo.svg/220px-Aniplex_logo.svg.png"],
[18,  "Toei-Animation",	"https://i.stack.imgur.com/AjzVI.png",76,30],
[21,  "Studio-Ghibli",	"https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Studio_Ghibli_logo.svg/220px-Studio_Ghibli_logo.svg.png",76,30],
[22,  "Nippon-Animation","https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Nippon.png/200px-Nippon.png"],
[25,  "Milky-Animation-Label","https://img.fireden.net/a/image/1467/16/1467164781976.png"],
[27,  "Xebec",		"https://upload.wikimedia.org/wikipedia/fr/b/bd/Logo_Xebec.svg"],
[28,  "Oriental-Light-and-Magic","https://i.stack.imgur.com/Sbllv.png"],
[32,  "Manglobe",	"https://i.imgur.com/W8U74wO.png"],
[34,  "Hal-Film-Maker",	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Hal_film_maker_logo.gif/220px-Hal_film_maker_logo.gif"],
[35,  "Seven-Arcs",	"https://upload.wikimedia.org/wikipedia/en/a/ac/Seven_Arcs_logo.png",76,25],
[36,  "Studio-Gallop",	"https://upload.wikimedia.org/wikipedia/commons/3/37/Studio_Gallop.png"],
[37,  "Studio-DEEN",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Studio_Deen_logo.svg/220px-Studio_Deen_logo.svg.png"],
[38,  "Arms",		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Arms_Corporation.png/200px-Arms_Corporation.png"],
[39,  "Daume",		"https://upload.wikimedia.org/wikipedia/commons/3/3e/Daume_studio_logo.png",70,35],
[41,  "Satelight",	"https://i.stack.imgur.com/qZVQg.png",76,30],
[43,  "ufotable",	"https://upload.wikimedia.org/wikipedia/en/5/56/Ufotable-Logo.png",76,30],
[44,  "Shaft",		"https://i.stack.imgur.com/tuqhK.png"],
[45,  "Pink-Pineapple",	"https://i.stack.imgur.com/2NMQ0.png"],
[47,  "Studio-Khara",	"https://i.stack.imgur.com/2d1TT.png",76,30],
[48,  "AIC",		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[51,  "diomeda",	"https://i.stack.imgur.com/ZHt3T.jpg"],
[53,  "Dentsu",		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Dentsu_logo.svg/200px-Dentsu_logo.svg.png"],
[58,  "Square-Enix",	"https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Square_Enix_logo.svg/230px-Square_Enix_logo.svg.png"],
[65,  "Tokyo-Movie-Shinsha","https://upload.wikimedia.org/wikipedia/en/2/22/Tokyo_Movie_Shinsha.png"],
[66,  "Key",		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Key_Visual_Arts_Logo.svg/167px-Key_Visual_Arts_Logo.svg.png",76,25],
[68,  "Mushi-Productions","https://i.stack.imgur.com/HmYdT.jpg"],
[73,  "TMS-Entertainment","https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TMS_Entertainment_logo.svg/220px-TMS_Entertainment_logo.svg.png"],
[79,  "Genco",		"https://www.thefilmcatalogue.com/assets/company-logos/5644/logo_en.png"],
[86,  "Group-TAC",	"https://upload.wikimedia.org/wikipedia/commons/b/b7/Group_TAC.png"],
[91,  "feel",		"https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Feel_%28company%29_logo.png/220px-Feel_%28company%29_logo.png",76,25],
[95,  "Doga-Kobo",	"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Doga_Kobo_Logo.svg/220px-Doga_Kobo_Logo.svg.png"],
[97,  "ADV-Films",	"https://upload.wikimedia.org/wikipedia/en/4/45/A.D._Vision_%28logo%29.png"],
[102, "FUNimation-Entertainment","https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Funimation_2016.svg/320px-Funimation_2016.svg.png"],
[103, "Tatsunoko-Production","https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Tatsunoko_2016_logo.png/300px-Tatsunoko_2016_logo.png"],
[104, "Lantis",		"https://upload.wikimedia.org/wikipedia/commons/3/39/Lantis_logo.png"],
[108, "Media-Factory",	"https://i.stack.imgur.com/rR7yU.png",76,25],
[112, "Brains-Base",	"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Brain%27s_Base_logo.png/200px-Brain%27s_Base_logo.png"],
[113, "Kadokawa-Shoten","https://i.stack.imgur.com/ZsUDR.gif"],
[119, "Viz-Media",	"https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Viz_Media_logo.png/220px-Viz_Media_logo.png"],
[132, "PA-Works",	"https://i.stack.imgur.com/7kjSn.png"],
[143, "Mainichi-Broadcasting","https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Mainichi_Broadcasting_System_logo.svg/200px-Mainichi_Broadcasting_System_logo.svg.png"],
[144, "Pony-Canyon",	"https://i.stack.imgur.com/9kkew.png"],
[145, "TBS",		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/TBS_logo.svg/200px-TBS_logo.svg.png"],
[150, "Sanrio",		"https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Sanrio_logo.svg/220px-Sanrio_logo.svg.png"],
[159, "Kodansha",	"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kodansha.png/200px-Kodansha.png"],
[166, "Movic",		"https://upload.wikimedia.org/wikipedia/commons/f/f3/Movic_logo.png"],
[167, "Sega",		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sega_logo.svg/200px-Sega_logo.svg.png"],
[169, "Fuji-TV",	"https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/Fuji_TV_logo.svg/225px-Fuji_TV_logo.svg.png",76,30],
[193, "Idea-Factory",	"https://upload.wikimedia.org/wikipedia/en/e/eb/Idea_factory.gif"],
[196, "Production-Reed","https://upload.wikimedia.org/wikipedia/fr/7/7d/Production_Reed_Logo.png"],
[199, "Studio-Nue",	"https://i.stack.imgur.com/azzKH.png"],
[200, "Tezuka-Productions","https://upload.wikimedia.org/wikipedia/fr/f/fe/Tezuka_Productions_Logo.png"],
[238, "ATX",		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/AT-X_logo.svg/150px-AT-X_logo.svg.png",76,30],
[247, "ShinEi-Animation","https://i.stack.imgur.com/b2lcL.png"],
[262, "Kadokawa-Pictures-USA","https://i.stack.imgur.com/ZsUDR.gif"],
[287, "David-Production","https://upload.wikimedia.org/wikipedia/en/thumb/7/75/David_production.jpg/220px-David_production.jpg",76,30],
[290, "Kinema-Citrus",	"https://upload.wikimedia.org/wikipedia/commons/c/c0/Kinema_Citrus_logo.png",76,25],
[291, "CoMix-Wave",	"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Cwflogo.png/150px-Cwflogo.png"],
[292, "AIC-Plus",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[300, "SILVER-LINK",	"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Silver_Link_Logo.svg/220px-Silver_Link_Logo.svg.png"],
[309, "GoHands",	"https://i.stack.imgur.com/pScIZ.jpg"],
[314, "White-Fox",	"https://i.stack.imgur.com/lwG1T.png",76,30],
[333, "TYO-Animations",	"https://i.stack.imgur.com/KRqAp.jpg",76,25],
[334, "Ordet",		"https://i.stack.imgur.com/evr12.png",76,30],
[346, "Hoods-Entertainment","https://i.stack.imgur.com/p7S0I.png"],
[352, "Kadokawa-Pictures-Japan","https://i.stack.imgur.com/ZsUDR.gif"],
[365, "PoRO",		"https://i.stack.imgur.com/3rlAh.png"],
[372, "NIS-America-Inc","https://upload.wikimedia.org/wikipedia/en/e/e7/Nis.png"],
[376, "Sentai-Filmworks","https://i.stack.imgur.com/JV8R6.png",74,30],
[397, "Bridge",		"https://i.imgur.com/4Qn4EmK.png"],
[418, "Studio-Gokumi",	"https://i.stack.imgur.com/w1y22.png"],
[436, "AIC-Build",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/AIC_logo.png/220px-AIC_logo.png"],
[437, "Kamikaze-Douga",	"https://img7.anidb.net/pics/anime/178777.jpg"],
[456, "Lerche",		"https://i.stack.imgur.com/gRQPc.png"],
[459, "Nitroplus",	"https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Nitroplus_logo.png/220px-Nitroplus_logo.png"],
[493, "Aniplex-of-America","https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Aniplex_logo.svg/220px-Aniplex_logo.svg.png"],
[503, "Nintendo-Co-Ltd","https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Nintendo.svg/220px-Nintendo.svg.png"],
[537, "SANZIGEN",	"https://i.stack.imgur.com/CkuqH.png",76,30],
[555, "Studio-Chizu",	"https://i.stack.imgur.com/h2RuH.gif"],
[561, "A1-Pictures",	"https://i.stack.imgur.com/nBUYo.png",76,30],
[569, "MAPPA",		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/MAPPA_Logo.svg/220px-MAPPA_Logo.svg.png"],
[681, "ASCII-Media-Works","https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/ASCII_Media_Works_logo.svg/220px-ASCII_Media_Works_logo.svg.png"],
[803, "Trigger",	"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Trigger_Logo.svg/220px-Trigger_Logo.svg.png"],
[783, "GKids",		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/GKIDS_logo.svg/150px-GKIDS_logo.svg.png"],
[839, "LIDENFILMS",	"https://upload.wikimedia.org/wikipedia/en/6/6e/LidenFilms.png",76,30],
[858, "Wit-Studio",	"https://i.stack.imgur.com/o3Rro.png",76,30],
[911, "Passione",	"https://i.stack.imgur.com/YyEGg.jpg"],
[4418,"8bit",		"https://upload.wikimedia.org/wikipedia/en/e/ea/8-Bit_Animation_Studio.png"],
[6069,"Studio-3Hz",	"https://i.stack.imgur.com/eD0oe.jpg"],
[6071,"Studio-Shuka",	"https://upload.wikimedia.org/wikipedia/commons/f/fa/Shuka_studio.jpg"],
[6077,"Orange",		"https://i.stack.imgur.com/ve9mm.gif"],
[6142,"Geno-Studio",	"https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Genostudio.jpg/220px-Genostudio.jpg",76,25],
[6145,"Science-SARU",	"https://i.stack.imgur.com/zo9Fx.png"],
[6148,"NUT",		"https://upload.wikimedia.org/wikipedia/en/b/b0/NUT_animation_studio_logo.png"],
[6222,"CloverWorks",	"https://i.stack.imgur.com/9Fvr7.jpg"],
[6225,"TriF-studio",	"https://i.stack.imgur.com/lL85s.png",60,50],
[6235,"SEK-Studio",	"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Flag_of_North_Korea.svg/125px-Flag_of_North_Korea.svg.png",74,25],
[6283,"Studio-Durian",	"https://studio-durian.jp/images/ROGO2opa.png"]
	];
	let favStudioString = "";
	if(useScripts.CSSfavs){
		favStudioString += `
.overview  .favourites > .favourites-wrap > div,
.overview  .favourites > .favourites-wrap > a{
/*make the spaces in the grid even*/
	margin-bottom: 0px!important;
	margin-right: 0px!important;
	column-gap: 10px!important;
}
.user .overview{
	grid-template-columns: 460px auto!important;
}
.overview .favourites > .favourites-wrap{
	display: grid!important;
	padding: 0px!important;
	display: grid;
	grid-gap: 10px;
	column-gap: 10px!important;
	grid-template-columns: repeat(auto-fill,85px);
	grid-template-rows: repeat(auto-fill,115px);
	background: rgb(0,0,0,0) !important;
	width: 470px;
}
.overview .favourite.studio{
	cursor: pointer;
	min-height: 115px;
	font-size: 15px;
	display: grid;
	grid-gap: 10px;
	padding: 2px!important;
	padding-top: 8px!important;
	background-color: rgba(var(--color-foreground))!important;
	text-align: center;
	align-content: center;
}
.site-theme-dark .overview  .favourite.studio{
	background-color: rgb(49,56,68)!important;
}
.preview .favourite.media,
.preview .favourite.staff,
.preview .favourite.character{
	background-color: rgb(var(--color-foreground));
}
.overview .favourite.studio::after{
	display: inline-block;
	background-repeat: no-repeat;
	content:"";
	margin-left:5px;
	background-size: 76px 19px;
	width: 76px;
	height: 19px;
}`;
		favStudios.forEach(studio => {
			if(studio[2] !== ""){
				favStudioString += `.favourite.studio[href="/studio/${studio[0]}/${studio[1]}"]::after{background-image: url("${studio[2]}");`;
				if(studio.length === 5){
					favStudioString += `background-size: ${studio[3]}px ${studio[4]}px;width: ${studio[3]}px;height: ${studio[4]}px;`;
				}
				favStudioString += "}";
			}
		});
	}
	moreStyle.textContent += favStudioString;
}

if(useScripts.CSScompactBrowse){
	moreStyle.textContent += `
.search-page-unscoped.container{
	padding-left: 10px;
	padding-right: 0px;
	position: relative;
}
.search-page-unscoped > .results.media{
	margin-top: 40px;
}
.search-page-unscoped.cardView .media-card,
.search-page-unscoped:not(.listView) .media-card,
.studio-page-unscoped.cardView .media-card,
.studio-page-unscoped:not(.listView) .media-card{
	overflow: visible;
}
.search-page-unscoped.cardView .list-status,
.studio-page-unscoped.cardView .list-status{
	transform: translate(-18px,-18px);
}
.search-page-unscoped:not(.listView) .list-status,
.studio-page-unscoped:not(.listView) .list-status{
	transform: translate(-20px,-20px);
}
.search-page-unscoped:not(.cardView) .description,
.studio-page-unscoped:not(.cardView) .description{
	display: none;
}
.search-page-unscoped .preview-section,
.search-page-unscoped,
.studio-page-unscoped,
.results > .studio{
	counter-reset: ranking;
}
.search-page-unscoped:not(.cardView) .character,
.search-page-unscoped:not(.cardView) .staff,
.studio-page-unscoped:not(.cardView) .character,
.studio-page-unscoped:not(.cardView) .staff{
	position: relative;
}
.search-page-unscoped .data::before,
.studio-page-unscoped .data::before,
.search-page-unscoped .results > .character .cover::before,
.search-page-unscoped .results > .staff .cover::before{
	left: 2px;
	opacity: 0.4;
	font-size: 70%;
	position: absolute;
	counter-increment: ranking;
	content: counter(ranking);
}
.search-page-unscoped:not(.cardView) .media-card,
.studio-page-unscoped:not(.cardView) .media-card{
	min-width: 150px!important;
	grid-template-columns: 150px auto!important;
	height: 297px!important;
	width: 150px !important;
}
.search-page-unscoped:not(.cardView) .cover .overlay,
.studio-page-unscoped:not(.cardView) .cover .overlay{
	padding-left: 8px!important;
	padding-right: 8px!important;
	padding-top: 4px!important;
	padding-bottom: 14px!important;
}
.search-page-unscoped:not(.cardView) .grid-wrap > .media-card,
.studio-page-unscoped:not(.cardView) .grid-wrap > .media-card{
	margin-left: 30px;
}
.search-page-unscoped:not(.cardView) .media-card .cover,
.studio-page-unscoped:not(.cardView) .media-card .cover{
	width: 150px;
	height: 215px;
	margin-top: 53px;
	z-index: 100;
}
.search-page-unscoped:not(.cardView) .data,
.studio-page-unscoped:not(.cardView) .data{
	margin-left: -150px;
}
.search-page-unscoped:not(.cardView) .genres,
.studio-page-unscoped:not(.cardView) .genres{
	min-height:29px;
	z-index: 101;
	padding: 8px 5px!important;
	padding-bottom: 2px !important;
	font-size: 1rem!important;
	line-height: 1.15;
}
.search-page-unscoped:not(.cardView) .list-edit,
.studio-page-unscoped:not(.cardView) .list-edit{
	z-index: 101;
}
.search-page-unscoped:not(.cardView) .airing-countdown,
.studio-page-unscoped:not(.cardView) .airing-countdown{
	padding: 5px!important;
}
.search-page-unscoped:not(.cardView) .grid-wrap,
.studio-page-unscoped:not(.cardView) .grid-wrap{
	grid-template-columns: repeat(auto-fill, 150px) !important;
}
.search-page-unscoped:not(.cardView) .media,
.studio-page-unscoped:not(.cardView) .media{
	grid-template-columns: repeat(auto-fill, 150px) !important;
	width:100%;
}
.search-page-unscoped:not(.cardView) .overlay .studio{
	margin-top: 2px!important;
	margin-bottom: -8px!important;
}
.search-page-unscoped:not(.cardView) .list-status,
.studio-page-unscoped:not(.cardView) .list-status{
	width: 20px!important;
	height: 20px!important;
}
.search-page-unscoped:not(.cardView) .media-card:nth-child(5){
	display: inline-grid!important;
}
.search-page-unscoped.listView .results.media,
.search-page-unscoped.compactListView .results.media,
.studio-page-unscoped.listView .container.grid-wrap,
.studio-page-unscoped.compactListView .container.grid-wrap{
	display: block!important;
}
.search-page-unscoped.listView .media-card,
.studio-page-unscoped.listView .media-card{
	margin-bottom: 10px;
	height: 195px;
	width: 95%;
}
.search-page-unscoped.listView .media-card .cover,
.studio-page-unscoped.listView .media-card .cover{
	height: 165px;
	width: 115px;
}
.search-page-unscoped.listView .media-card .cover .overlay,
.studio-page-unscoped.listView .media-card .cover .overlay{
	position: absolute;
	top: 0px;
	left: 115px;
	z-index: 5;
	background: none;
	width: 550px;
	padding: 10px;
	color: rgb(var(--color-text));
}
.search-page-unscoped.listView .media-card .cover .overlay .studio{
	margin-top: 15px;
}
.search-page-unscoped.listView .media-card .data,
.studio-page-unscoped.listView .media-card .data{
	margin-left: -70px;
	height: 195px;
}
.search-page-unscoped.listView .media-card .data .list-edit,
.studio-page-unscoped.listView .media-card .data .list-edit{
	display: inline;
	width: 115px;
	height: 30px;
	position: absolute;
	left: -115px;
	top: 165px;
}
.search-page-unscoped.listView .media-card .data .genres,
.studio-page-unscoped.listView .media-card .data .genres{
	display: inline;
}
.search-page-unscoped.listView .media-card .data .extra,
.studio-page-unscoped.listView .media-card .data .extra{
	padding-left: 50%;
}
.search-page-unscoped.listView .media-card .data .description,
.studio-page-unscoped.listView .media-card .data .description{
	height: 102px;
}
.search-page-unscoped.listView .media-card .data .airing-countdown,
.search-page-unscoped.compactListView .media-card .data .airing-countdown,
.studio-page-unscoped.listView .media-card .data .airing-countdown,
.studio-page-unscoped.compactListView .media-card .data .airing-countdown{
	text-align: right;
}
.search-page-unscoped.listView .media-card .data .list-edit .action,
.studio-page-unscoped.listView .media-card .data .list-edit .action{
	padding: 5px;
}
.search-page-unscoped.compactListView .media .media-card,
.studio-page-unscoped.compactListView .media-card{
	margin-bottom: 5px;
	height: 30px;
	width: 95%;
}
.search-page-unscoped.compactListView .media-card .data .description,
.studio-page-unscoped.compactListView .media-card .data .description{
	display: none;
}
.search-page-unscoped.compactListView .media-card .cover,
.studio-page-unscoped.compactListView .media-card .cover{
	background: none!important;
	height: 30px;
}
.search-page-unscoped.compactListView .media-card .cover .list-status,
.studio-page-unscoped.compactListView .media-card .cover .list-status{
	transform: translate(-3px,-3px);
	z-index: 51;
	box-shadow: none;
}
.search-page-unscoped.compactListView .media-card .cover .overlay,
.studio-page-unscoped.compactListView .media-card .cover .overlay{
	z-index: 49;
	background: none;
	position: absolute;
	top: 0px;
	left: 20px;
	padding: 6px;
	width: 600px;
	color: rgb(var(--color-text));
}
.search-page-unscoped.compactListView .media-card .cover .overlay .studio{
	display: none;
}
.search-page-unscoped.compactListView .media-card .data,
.studio-page-unscoped.compactListView .media-card .data{
	margin-left: -185px;
	position: relative;
}
.search-page-unscoped.compactListView .media-card .data .list-edit,
.studio-page-unscoped.compactListView .media-card .data .list-edit{
	position: absolute;
	top: 0px;
	width: 115px;
	left: calc(100% - 115px);
	background: none;
}
.search-page-unscoped.compactListView .media-card:hover .data .airing-countdown,
.studio-page-unscoped.compactListView .media-card:hover .data .airing-countdown{
	display: none;
}
.search-page-unscoped.compactListView .media-card .data .extra,
.studio-page-unscoped.compactListView .media-card .data .extra{
	position: absolute;
	left: calc(100% - 550px);
	top: 0px;
	background: none;
	width: 150px;
}
.search-page-unscoped.compactListView .media-card .data .genres,
.studio-page-unscoped.compactListView .media-card .data .genres{
	position: absolute;
	width: 200px;
	top: 6px;
	background: none;
	left: calc(100% - 350px);
	display: inline;
	padding: 0px;
	height: 30px;
	line-height: 10px;
}
.search-page-unscoped.compactListView .media-card .data .genres span,
.studio-page-unscoped.compactListView .media-card .data .genres span{
	vertical-align: middle;
}
.search-page-unscoped.compactListView .data::before,
.studio-page-unscoped.compactListView .data::before{
	font-size: 50%;
}
.search-page-unscoped.listView .data::before,
.studio-page-unscoped.listView .data::before{
	font-size: 60%;
}
.search-page-unscoped .hohThemeSwitch{
	width: 130px;
	position: absolute;
	right: 40px;
	top: -2px;
}
.studio-page-unscoped .hohThemeSwitch{
	width: 130px;
	position: absolute;
	top: 60px;
	left: 50%;
}
@media(max-width: 1040px){
	.search-page-unscoped{
		margin-top: 40px !important;
	}
	.search-page-unscoped .hohThemeSwitch{
		right: 55px;
		top: 45px;
	}
	.search-page-unscoped .filter-toggle{
		padding-top: 10px;
		margin-top: 2px;
		margin-left: 0px;
	}
	.search-page-unscoped > .results.media{
		margin-top: 44px;
	}
}
@media(max-width: 850px){
	.search-page-unscoped:not(.cardView) .results.media{
		display: inline-grid;
		grid-column-gap: 15px;
		grid-row-gap: 15px;
	}
}
@media(max-width: 760px){
	.search-page-unscoped.compactListView .media-card .data .genres{
		display: none;
	}
	.search-page-unscoped.compactListView .media-card .data .extra{
		left: calc(100% - 280px);
		width: 120px;
	}
	.search-page-unscoped.listView .media-card .data{
		margin-left: -45px;
	}
}
@media(max-width: 550px){
	.search-page-unscoped.compactListView .media-card .data .extra{
		display: none;
	}
}
	`;
}
if(useScripts.CSSprofileClutter){
	moreStyle.textContent += `
.overview .list-stats > .footer{
	display: none;
}
.overview > .section > .desktop:nth-child(2){
	display: none;
}
.overview > .section > .desktop:nth-child(3){
	display: none;
}
.overview > .section > .desktop.favourites{
	display: inherit;
}
	`;
}
if(useScripts.CSSbannerShadow){
	moreStyle.textContent += `
.banner .shadow{
	display: none;
}
	`;
}
if(useScripts.betterListPreview && !(window.screen.availWidth && window.screen.availWidth <= 1040)){
	moreStyle.textContent += `
.home{
	grid-template-columns: auto 545px!important;
}
@media(min-width: 1040px) and (max-width: 1540px){
	.page-content > .container{
		max-width: 1300px;
	}
	.list-preview{
		gap: 15px!important;
	}
	.home{
		grid-template-columns: auto 525px!important;
	}
}
#hohListPreview + .list-previews .list-preview-wrap{
	display: none;
}
#hohListPreview + .list-previews .list-preview-wrap:last-child{
	display: block;
}
	`;
}
if(useScripts.CSSgreenManga){
	moreStyle.textContent += `
.review-card:hover .banner[data-src*="/media/manga/"] + .content > .header{
	color: rgb(var(--color-green));
}
.review-card:hover .banner[data-src*="/media/anime/"] + .content > .header{
	color: rgb(var(--color-blue));
}
.user .review-card:hover .banner[data-src*="/media/anime/"] + .content > .header{
	color: rgb(61,180,242);
}
.activity-markdown a[href^="https://anilist.co/manga/"]{
	color: rgba(var(--color-green));
}
.activity-manga_list > div > div > div > div > .title{
	color: rgba(var(--color-green))!important;
}
.media .relations .cover[href^="/manga/"] + div div{
	color: rgba(var(--color-green));
}
.media .relations .cover[href^="/anime/"] + div div{
	color: rgba(var(--color-blue));
}
.media .relations .cover[href^="/manga/"]{
	border-bottom-style: solid;
	border-bottom-color: rgba(var(--color-green));
	border-bottom-width: 2px;
}
.character-page-unscoped .media .content:hover[href^="/manga/"] .name,
.media-roles .media .content:hover[href^="/manga/"] .name{
	color: rgb(var(--color-green));
}
.media .relations.small .cover[href^="/manga/"]::after{
	position:absolute;
	left:1px;
	bottom:3px;
	content:"";
	border-style: solid;
	border-color: rgba(var(--color-green));
	border-width: 2px;
}
.media .relations .cover[href^="/anime/"]{
	border-bottom-style: solid;
	border-bottom-color: rgba(var(--color-blue));
	border-bottom-width: 2px;
}
.media .relations .cover div.image-text{
	margin-bottom: 2px!important;
	border-radius: 0px!important;
	padding-bottom: 8px!important;
	padding-top: 8px!important;
	font-weight: 500!important;
}
.media-embed[data-media-type="manga"] .title{
	color: rgba(var(--color-green));
}
.media-manga .actions .list{
	background: rgba(var(--color-green));
}
.media-manga .sidebar .review.button{
	background: rgba(var(--color-green));
}
.media-manga .container .content .nav .link{
	color: rgba(var(--color-green));
}
.home .recent-reviews + div > div + div + div h2.section-header.link:hover{
	color: rgba(var(--color-green));
}
.home .recent-reviews + div .cover[href^="/manga/"] + .content .info-header{
	color: rgba(var(--color-green));
}
	`;
}
if(useScripts.CSSexpandFeedFilters && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
.home .activity-feed-wrap .section-header .el-dropdown-menu,
.user .activity-feed-wrap .section-header .el-dropdown-menu{
	background: none;
	position: static;
	display: inline !important;
	margin-right: 15px;
	box-shadow: none !important;
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item{
	font-weight: normal;
	color: rgb(var(--color-text-lighter));
	margin-left: -2px !important;
	display: inline;
	font-size: 1.2rem;
	padding: 4px 15px 5px 15px;
	border-radius: 3px;
	transition: .2s;
	background: none;
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item.active,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item.active{
	background: none!important;
	color: rgb(var(--color-blue));
}
.home .activity-feed-wrap .section-header .el-dropdown-menu__item:hover,
.user .activity-feed-wrap .section-header .el-dropdown-menu__item:hover{
	background: none!important;
	color: rgb(var(--color-blue));
}
.home .feed-select .feed-filter,
.user .section-header > .el-dropdown > .el-dropdown-selfdefine{
	display: none;
}
	`;
}
if(useScripts.showRecVotes){
	moreStyle.textContent += `
.recommendation-card .rating-wrap{
	opacity: 1;
}
`
}
if(useScripts.CSSverticalNav && (!useScripts.mobileFriendly)){
	moreStyle.textContent += `
.media .sidebar .tags .add-icon{
	opacity: 1;
}
#hohListPreview .content{
	width: 240px;
}
.details .donator-badge{/*overpass really doesn't look great for this. That's just like my opinion, so overriding it goes here, and not in the global CSS*/
	font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
}
.user .overview > .section:first-child{
	max-width: 555px;
}
.user .overview{
 	grid-template-columns: calc(25% + 200px) 55% !important;;
}
.media .activity-entry .cover{
	display: none;
}
.media .activity-entry .embed .cover{
	display: inline;
}
.media .activity-entry .details{
	min-width: 500px;
	margin-left: 30px;
}
.media .activity-entry .details > .avatar{
	position: absolute;
	top: 0px;
	left: 5px;
}
.media .activity-entry .list{
	min-height: 55px !important;
}
.media .activity-entry .replies .count,
.media .activity-entry .replies .count + svg{
	color: rgb(var(--color-red));
}
#app .tooltip.animate-position{
	transition: opacity .26s ease-in-out,transform 0s ease-in-out;
}
.studio .hohThemeSwitch{
	top: 30px;
}
.stats-wrap .stat-cards{
	grid-gap: 20px;
	grid-template-columns: repeat(auto-fill, 300px);
}
.stats-wrap .stat-cards.has-images{
	grid-gap: 20px;
	grid-template-columns: repeat(auto-fill, 600px);
}
.stats-wrap .stat-cards .stat-card{
	box-shadow: none;
	padding: 10px;
	padding-bottom: 0px;
}
.stats-wrap .stat-cards .stat-card > .title{
	font-size: 2rem;
}
.stats-wrap .stat-cards .stat-card.has-image > .wrap > .image{
	margin-top: -45px;
	height: 100px;
	width: 70px;
}
.stats-wrap .highlight .value{
	font-size: 2rem;
}
.stats-wrap .highlight .circle{
	box-shadow: none;
	height: 35px;
	width: 35px;
}
.stats-wrap .highlights{
	grid-gap: 30px 0px;
	margin-left: 1%;
	width: 98%;
	margin-top: 0px;
	grid-template-columns: repeat(6,1fr);	
	margin-bottom: 20px;
}
.stats-wrap .stat-cards .stat-card.has-image > .title{
	margin-left: 75px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap{
	padding: 5px 15px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relations{
	transition: transform .1s ease-in-out;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relation-card{
	margin-right: 5px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .relation-card .image{
	width: 70px;
	height: 100px;
}
.stats-wrap .stat-cards .stat-card .count.circle{
	top: 12px;
	right: 12px;
	height: 20px;
	width: 20px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .detail .value{
	font-size: 1.4rem;
	font-weight: 700;
	color: rgb(var(--color-blue));
}
.stats-wrap .stat-cards .stat-card .inner-wrap .detail .label{
	font-size: 1.1rem;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button{
	box-shadow: none;
	top: 40px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button.previous{
	left: 18px;
}
.stats-wrap .stat-cards .stat-card .inner-wrap .relations-wrap .button.next{
	right: 18px;
}
.user .desktop .genre-overview.content-wrap{
	font-size: 1.3rem;
}
.forum-thread .comment-wrap{
	border-left: solid!important;
	margin-bottom: 10px!important;
}
.forum-thread .comment-wrap.odd{
	border-left-style: double!important;
}
.forum-thread .comment-wrap.hohCommentSelected{
	border-left-color: rgb(var(--color-blue))!important;
}
.forum-thread .comment-wrap.hohCommentHidden{
	border-left-style: dotted!important;
}
.forum-feed .overview-header{
	color: rgba(var(--color-blue))!important;
	font-size: 2rem!important;
}
.forum-feed .thread-card{
	margin-bottom: 10px!important;
}
.forum-feed .filter-group > a{
	margin-bottom: 2px!important;
}
.activity-entry > .wrap > .actions{
	bottom: 0px!important;
}
.page-content > .container,
.notifications-feed,
.page-content > .studio{
	margin-top: 25px !important;
}
.logo{
	margin-left: -60px!important;
/*the compact layout uses more of the space to the side, so we line up the logo to the left*/
}
.footer{
	margin-top: 0px !important;
/*less space wasted over the footer*/
}
.hohUserRow td,
.hohUserRow th{
	top: 44px;
}
.container{
	padding-left: 10px;
	padding-right: 0px;
}
.hide{
	top: 0px!important;
/*stop that top bar from jumping all over the place*/
}
.notification{
	margin-bottom: 10px!important;
}
.media-embed + br{
	display: none;
}
/*Dropdown menus are site theme based*/
.quick-search .el-select .el-input .el-input__inner,
.quick-search .el-select .el-input.is-focus .el-input__inner,
.el-select-dropdown,
.el-dropdown-menu,
.el-dropdown-menu__item--divided::before{
	background: rgba(var(--color-foreground));
}
.el-select-dropdown__item.hover,
.el-select-dropdown__item:hover{
	background: rgba(159, 173, 189, .2);
}
.el-dropdown-menu__item--divided{
	border-color: rgba(var(--color-background));
}
.el-select-group__wrap:not(:last-of-type)::after{
	background: rgba(var(--color-foreground));
}
.el-popper[x-placement^="bottom"] .popper__arrow,
.el-popper[x-placement^="bottom"] .popper__arrow::after{
	border-bottom-color: rgba(var(--color-foreground));
}
.el-popper[x-placement^="top"] .popper__arrow,
.el-popper[x-placement^="top"] .popper__arrow::after{
	border-top-color: rgba(var(--color-foreground));
}
.wrap .link.router-link-exact-active.router-link-active,
.nav .link.router-link-exact-active.router-link-active{
	background: rgba(var(--color-foreground-grey));
	color: rgba(var(--color-blue));
}
/*--------------VERTICAL-NAV----------------*/
/*modified code from Kuwabara: https://userstyles.org/styles/161017/my-little-anilist-theme-can-not-be-this-cute*/
.hohDismiss{
	transform: translate(17.5px,-40px);
	margin-left: 0px!important;
}
#app > .nav {
	border-top: none !important;
}
#app div#nav.nav{
	width: 65px;
	height: 100%!important;
	position: fixed!important;
	top: 0!important;
	left: 0!important;
	transition: none!important;
}
div#nav.transparent{
	background: rgba(var(--color-nav))!important;
}
.nav .wrap .links{
	font-size: 1rem;
	height: 355px!important;
	margin-left: 0px;
	padding-left: 0px;
	width: 65px;
	min-width: 65px !important;
	flex-direction: column;
}
#app #nav.nav .wrap .links a.link{
	width: 65px;
	padding: 5px 0px;
	margin-bottom: 10px;
	text-align: center;
	height: unset!important;
	transition: 0.3s;
	padding-left: 0px!important;
}
div#nav.nav .link.router-link-exact-active.router-link-active,
#nav > div > div.links > a:hover{
	border-bottom-width: 0px!important;
}
.nav .wrap .links .link:hover{
	background: rgba(var(--color-blue),0.1);
}
.nav .wrap .links .link::before{
	display: block;
	content: "";
	height: 24px!important;
	width: 65px!important;
	background-size: 24px;
	margin-left: 0!important;
	margin-bottom: 3px!important;
	background-repeat: no-repeat;
	background-position: center;
	filter: grayscale(100%) brightness(1.4);
}
.nav .link[href*="/user/"]:hover::before,
.nav .link[href^="/forum/"]:hover::before,
.nav .link[href="/login"]::before,
.nav .link[href="/social"]::before,
.nav .link[href^="/search/"]:hover::before,
.nav .link[href^="/home"]:hover::before,
.site-theme-contrast .nav .link.router-link-active::before{
	filter: grayscale(0%);
}
.logo-full{
	display: none;
}
.nav .link[href="/home"]::before,
.nav .link[href="/login"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="m12 3l-10 9h3v8h5v-6h4v6h5v-8h3z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href^="/user/"]::before,
.nav .link[href="/social"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2zM12 6a3 3 0 0 0 0 6a3 3 0 0 0 0 -6zM6 18h12v-1a6 3 0 0 0 -12 0z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href*="/animelist"]::before,
.nav .link[href*="/mangalist"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M4 5h4v4h-4zM4 10h4v4h-4zM4 15h4v4h-4zM9 5h12v4h-12zM9 10h12v4h-12zM9 15h12v4h-12z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href^="/search/"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M4 5h5v13h-5zM10 5h11v6h-11zM10 12h5v6h-5zM16 12h5v6h-5z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href*="/forum"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><path d="M19 6h2a1 1 0 0 1 1 1v15l-4 -4h-11a1 1 0 0 1 -1 -1v-2h13zM3 2a1 1 0 0 0 -1 1v14l4 -4h10a1 1 0 0 0 1 -1v-9a1 1 0 0 0 -1 -1z" fill="rgb(61,180,242)"/></svg>');
}
.nav .link[href="/signup"]::before{
	background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="96" height="96" viewBox="0 0 24 24"><g fill="rgb(61,180,242)"><circle cx="15" cy="8" r="3"/><path d="M9 18h12v-1a6 3 0 0 0 -12 0z"/><text x="2" y="14" font-weight="bold" font-size="70%">+</text></g></svg>');
}
.landing .link{
	margin-left: unset!important;
}
#nav > div.wrap.guest > div.links a.link.login,
#nav > div.wrap.guest > div.links a.link.signup{
	padding: 5px 0px!important;
}
div#nav.transparent{
	background: #1f2631!important;
}
#app{
	margin-top: 0;
	padding-left: 65px;
}
.nav .user{
	position: fixed;
	top: 0;
	display: grid;
	grid-gap: 40px;
	width: 65px;
	grid-template-rows: 50px 20px;
}	
.search .dropdown.el-dropdown{
	font-size: 10px;
}
.search .el-dropdown-link svg{
	width: 65px;
	height: 23px;
	padding: 5px 0;
	background: rgba(0, 0, 0, 0.2);
}
.nav .search{
	width: 65px;
	margin: 0;
	text-align: center;
	position: fixed;
	top: 56px;
}
.quick-search-results{
	z-index: 999!important;
	top: 136px!important;
}
.user .avatar + .chevron{
	opacity: 0!important;
}
.hide{
	top:0px!important;
}
@media(max-width: 1040px){
	#app{
		padding-left: 0px;
	}
	.container{
		padding-left: 20px;
		padding-right: 20px;
	}
	.footer > .container{
		position: relative;
	}
	.hohColourPicker{
		top: 0px;
	}
	.hohDismiss{
		display: none;
	}
	.hohNotificationCake{
		margin-left: -9px;
	}
}
/*-------------------*/
::selection{
	background: rgba(var(--color-blue),0.4);
}
::-webkit-selection{
	background: rgba(var(--color-blue),0.4);
}
::-moz-selection{
	background: rgba(var(--color-blue),0.4);
}
::-webkit-scrollbar{
	width: 7px;
	height: 7px;
}
::-webkit-scrollbar-thumb{
	background: #4e4e4e!important;
}
#app{
	overflow:unset;
}
.user .header-wrap{
	position: sticky;
	top: -332px;
	z-index: 100;
}
.list-stats{
	margin-bottom:0px!important;
}
.activity-feed-wrap{
	margin-top:25px;
}
.logo{
	position: absolute;
	margin-bottom: -500px;
	display:none!important;
	margin-left: 0px !important;
}
/*home stuff*/

.reply .header a.name[href="/user/Abyss/"]::after{
	content: "Prima Undine";
	margin-left:10px;
	padding:3px;
	border-radius:2px;
	animation-duration: 20s;
	animation-iteration-count: infinite;
	animation-name: rainbow;
	animation-timing-function: ease-in-out;
	color: rgba(var(--color-white));
}
.reply .header a.name[href="/user/Taluun/"]::after{
	content: "Best Friend";
	margin-left:10px;
	padding:3px;
	border-radius:2px;
	animation-duration: 20s;
	animation-iteration-count: infinite;
	animation-name: rainbow;
	animation-timing-function: ease-in-out;
	color: rgba(var(--color-white));
}
.details > .donator-badge{
	left:105px!important;
	padding:2px!important;
	top: 100%!important;
	-ms-transform: translate(0px, -34px);
	-webkit-transform: translate(0px, -34px);
	transform: translate(0px, -34px);
}
.activity-text > div > div > div > .donator-badge{
	position:relative!important;
	display:inline-block!important;
	left:0px!important;
	top:0px!important;
	-ms-transform: translate(0px, 0px);
	-webkit-transform: translate(0px, 0px);
	transform: translate(0px, 0px);
}
.activity-replies{
	margin-top:5px!important;
	margin-left:30px!important;
	margin-right:0px!important;
}
.page-content > .container > .activity-entry .activity-replies{
	margin-top: 15px !important;
}
.activity-entry{
	margin-bottom: 10px!important;
}
.list-preview{
	grid-gap: 10px!important;
	padding:0px!important;
	background: rgb(0,0,0,0)!important;
}
.home{
	grid-column-gap: 30px!important;
	margin-top: 20px!important;
	grid-template-columns: auto 470px!important;
}
.activity-feed .reply{
	padding: 8px!important;
	margin-bottom: 5px!important;
}
.list .details{
	padding-left:10px!important;
	padding-top:5px!important;
	padding: 10px 16px!important;
	padding-bottom: 7px !important;
}
.search{
	margin-top:0px!important;
}
.emoji-spinner{
	display:none!important;
}
.wrap{
	border-radius: 2px!important;
}
.name{
	margin-left: 0px!important;
}
.activity-text > div > div > div > .name,
.activity-message > div > div > div > .name{
	margin-left: 12px!important;
}
.button{
	margin-right: 5px!important;
}
.actions{
	margin-bottom: 5px!important;
}
.status{
	display: inline-block!important;
}
.avatar{
	display: block!important;
}

/*https://anilist.co/activity/29333544*/
.activity-entry .header a:nth-child(1){
	display: inline-block!important;
}
.wrap > .list{
	min-height: 80px!important;
	grid-template-columns: 60px auto!important;
}
.popper__arrow{
	display: none!important;
}
.media-preview{
	grid-gap: 10px!important;
	padding: 0px!important;
	background: rgb(0,0,0,0)!important;
}
.media-preview-card{
	display: inline-grid!important;
}
.replies > .count{
	color: rgba(var(--color-blue));
}
.action.likes{
	color: unset;
}
.like-wrap > .button:hover{
	color: rgba(var(--color-red));
}
.replies > svg:nth-child(2){
	color: rgba(var(--color-blue));
}
.actions{
	cursor: default;
}
.activity-manga_list > div > div > div > div > .title{
	color: rgba(var(--color-green))!important;
}
.markdown-editor > [title="Image"],
.markdown-editor > [title="Youtube Video"],
.markdown-editor > [title="WebM Video"]{
	color: rgba(var(--color-red));
}
.markdown-editor > div > svg{
	min-width: 1em!important;
}
.feed-select .toggle > div.active{
	color: rgba(var(--color-blue))!important;
}
.home .details .status:first-letter,
.social .details .status:first-letter,
.activity-entry .details .status:first-letter{
	text-transform: lowercase;
}
.activity-edit .markdown-editor,
.activity-edit .input{
	margin-bottom: 10px!important;
}
.activity-edit .actions{
	margin-bottom: 25px!important;
}
.page-content .container .home.full-width{
	grid-template-columns: unset !important;
}
.activity-text .text {
	border-left: solid 5px rgba(var(--color-blue));
}
.section-header{
	padding-left:0px!important;
}
.cover[href="/anime/440/Shoujo-Kakumei-Utena/"] + .details{
	border-color: #eb609e;
	border-width: 4px;
	border-style: solid;
	border-left-width: 0px;
}
.sticky .avatar, .sticky .body-preview,
.sticky .categories, .sticky .name{
	display: none!important;
}
.search > .filter,
.search > .preview{
	margin-top: 20px;
}
.home .media-preview-card:nth-child(5n+3) .content{
	border-radius: 3px 0 0 3px;
	left: auto !important;
	right: 100%;
	text-align: right;
}
.home .media-preview-card:nth-child(5n+3) .content .info{
	right: 12px;
}
.link:hover .hohSubMenu{
	color: rgb(var(--color-text-bright));
}
.hohSubMenu{
	position: absolute;
	left: 64px;
	top: 0px;
	display: none;
	background: #1f2631;
	border-top-right-radius: 3px;
	border-bottom-right-radius: 3px;
	padding: 2px 0px;
}
.hohSubMenuLink{
	display: block;
	margin-left: 3px;
	padding: 4px;
	font-size: 130%;
	text-align: left;
	color: rgb(var(--color-text-bright));
}
@media(max-width: 1540px){
	.container{
		max-width: 1200px;
	}
}
.media .activity-feed .donator-badge{
	transform: translate(-70px,-25px);
}
.user .list.small .avatar{
	display: none!important;
}
.el-slider[aria-valuemin="1950"] .el-slider__runway::after{
	content: "";
	width: 101%;
	margin-left: -0.3%;
	height: 20px;
	display: block;
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="200" height="20" viewBox="0 0 200 20"><g fill="rgb(61,180,242)" stroke="rgb(61,180,242)"><line stroke-width="27" x1="0" y1="20" x2="200" y2="20" stroke-dasharray="1 27.4"/><text font-size="8" x="145" y="19">00</text><text font-size="6" x="88" y="19">LAMU</text><text font-size="6" x="31" y="19">ATOM</text></g></svg>');
	background-size: cover;
}
.user .el-slider[aria-valuemin="1950"] .el-slider__runway::after{
	background-size: contain;
}
	`;
}
if(useScripts.CSSdecimalPoint){
	moreStyle.textContent += `
.medialist.POINT_10_DECIMAL .score[score="10"]::after,
.medialist.POINT_10_DECIMAL .score[score="9"]::after,
.medialist.POINT_10_DECIMAL .score[score="8"]::after,
.medialist.POINT_10_DECIMAL .score[score="7"]::after,
.medialist.POINT_10_DECIMAL .score[score="6"]::after,
.medialist.POINT_10_DECIMAL .score[score="5"]::after,
.medialist.POINT_10_DECIMAL .score[score="4"]::after,
.medialist.POINT_10_DECIMAL .score[score="3"]::after,
.medialist.POINT_10_DECIMAL .score[score="2"]::after,
.medialist.POINT_10_DECIMAL .score[score="1"]::after{
	margin-left:-4px;
	content: ".0";
}
	`;
}
if(useScripts.CSSdarkDropdown){
	moreStyle.textContent += `
.site-theme-dark .quick-search.el-select .el-input.el-input__inner,
.site-theme-dark .quick-search .el-select .el-input.is-focus .el-input__inner,
.site-theme-dark .el-select-dropdown,
.site-theme-dark .el-dropdown-menu,
.site-theme-dark .el-dropdown-menu__item--divided::before{
	background: rgba(17, 22, 29);
}
.site-theme-dark .el-select-group__wrap:not(:last-of-type)::after{
	background: rgba(17, 22, 29);
}
.site-theme-dark .el-popper[x-placement^="bottom"] .popper__arrow,
.site-theme-dark .el-popper[x-placement^="bottom"] .popper__arrow::after{
	border-bottom-color: rgba(17, 22, 29);
	opacity: 1;
}
.site-theme-dark .el-popper[x-placement^="top"] .popper__arrow,
.site-theme-dark .el-popper[x-placement^="top"] .popper__arrow::after{
	border-top-color: rgba(17, 22, 29);
	opacity: 1;
}
	`;
}
if(useScripts.CSSsmileyScore){
	moreStyle.textContent += `
.fa-frown{
	color: red;
}

.fa-smile{
	color: green;
}
	`;
}
if(useScripts.limitProgress8){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+9){
	display:none!important;
}
	`;
}
else if(useScripts.limitProgress10){
	moreStyle.textContent += `
.home:not(.full-width) .media-preview-card:nth-child(n+11){
	display:none!important;
}
	`;
}
if(parseInt(useScripts.forumPreviewNumber) === 0){
	moreStyle.textContent += `
.home .recent-threads{
	display: none!important;
}
	`;
}
if(useScripts.CSSmobileTags){
	moreStyle.textContent += `
@media(max-width: 760px){
	.media .sidebar .tags{
		display: inline;
	}
	.media .sidebar .tags .tag{
		display: inline-block;
		margin-right: 2px;
	}
	.media .sidebar .tags .tag .rank{
		display: inline;
	}
	.media .sidebar .tags .tag .vote-dropdown .el-dropdown-link{
		display: inline;
	}
	.media .sidebar .tags .add-icon{
		opacity: 1;
	}
}
	`;
}
if(useScripts.SFWmode){
	moreStyle.textContent += `
.forum-thread .no-comments::after{
	content: "No replies yet";
	visibility: visible;
	margin-left: -250px;
}
.forum-thread .no-comments{
	visibility: hidden;
}
.list-preview .cover,
.favourites .cover{
	background-image: none!important;
}
.logo{
	display: none!important;
}
.user .banner,
.media .banner{
	background-image: none!important;
	height: 200px;
}
.review-card .banner{
	display: none;
}
.home .review-card,.home .review-card .content{
	min-height: 120px;
}
.donator-badge{
	animation-name: none!important;
	display: none;
}
.list-editor .header,
.review .banner{
	background-image: none !important;
}
.list-editor .cover{
	display: none;
}
.emoji-spinner{
	display:none!important;
}
.avatar[style*=".gif"]{
	background-image: none!important;
}
img[src*=".gif"],
video,
.youtube{
	filter: contrast(0);
}
img[src*=".gif"]:hover,
video:hover,
.youtube:hover{
	filter: contrast(1);
}
.activity-entry .cover{
	filter: contrast(0.1) brightness(0.5);
}
.activity-entry .cover:hover{
	filter: none;
}
.activity-markdown img{
	max-width: 30%;
}
.recent-reviews + div{
	display: none;
}
.favourite.studio::after{
	background-image: none!important;
}
.hohDownload{
	display: none;
}
.history-day.lv-1{
	background: rgba(var(--color-green),.2)!important;
}
.history-day.lv-3{
	background: rgba(var(--color-green),.5)!important;
}
.history-day.lv-5{
	background: rgba(var(--color-green),.9)!important;
}
.history-day.lv-7{
	background: rgba(var(--color-green))!important;
}
.history-day.lv-9{
	background: rgba(var(--color-green))!important;
}
.percentage-bar{
	display: none!important;
}
.medialist.compact .cover .image,
.medialist.table .cover .image{
	opacity: 0;
}
.hohCencor .header img.cover,
.hohCencor .relations .cover,
.hohCencor .character .cover{
	filter: contrast(0);
}
.hohCencor .header img.cover:hover,
.hohCencor .relations .cover:hover,
.hohCencor .character .cover:hover{
	filter: contrast(1);
}
.categories > span{
	position: relative;
}
.category[href="/forum/recent?category=1"],
.category[href="/forum/recent?category=1"]:hover{
	color: rgb(78, 163, 230);
}
.category[href="/forum/recent?category=1"]:hover::after{
	color: rgba(26,27,28,.6);
}
.category[href="/forum/recent?category=1"]::after{
	content: "View";
	color: #fff;
	left: 20px;
	position: absolute;
}
.category[href="/forum/recent?category=2"],
.category[href="/forum/recent?category=2"]:hover{
	color: rgb(76, 175, 80);
}
.category[href="/forum/recent?category=2"]:hover::after{
	color: rgba(26,27,28,.6);
}
.category[href="/forum/recent?category=2"]::after{
	content: "Read";
	color: #fff;
	left: 20px;
	position: absolute;
}
.avatar[style*="/default.png"]{
	background-image: url("https://i.stack.imgur.com/TRuSD.png")!important;
}
	`;
	if(useScripts.CSSverticalNav){
		moreStyle.textContent += `
#nav .link[href*="/animelist"]{
	visibility: hidden;
}
#nav .link[href*="/animelist"]::after{
	content: "View List";
	visibility: visible;
	left: 0;
	right: 0;
	position: absolute;
	margin-left: auto;
	margin-right: auto;
}
#nav .link[href*="/animelist"]::before{
	visibility: visible;
}
#nav .link[href*="/mangalist"]{
	visibility: hidden;
}
#nav .link[href*="/mangalist"]::after{
	content: "Read List";
	visibility: visible;
	left: 0;
	right: 0;
	position: absolute;
	margin-left: auto;
	margin-right: auto;
}
#nav .link[href*="/mangalist"]::before{
	visibility: visible;
}`;
	}
}
if(useScripts.cleanSocial){
	moreStyle.textContent += `
.social .activity-feed + div{
	display: flex;
	flex-direction: column;
}
.social .activity-feed + div > div:first-child{
	order: 2;
	margin-top: 25px;
}
	`;
}
};initCSS();

documentHead.appendChild(moreStyle);
let customStyle = create("style");
let currentUserCSS = "";
customStyle.id = "customCSS-aniscripts-styles";
customStyle.type = "text/css";
documentHead.appendChild(customStyle);


let aliases = new Map();
(
	JSON.parse(
		localStorage.getItem("titleAliases")
	) || []
).concat(
	shortRomaji
).forEach(alias => {
	let matches = alias[0].match(/^\/(anime|manga)\/(\d+)\/$/);
	if(matches){
		aliases.set(parseInt(matches[2]),alias[1])
	}
});

