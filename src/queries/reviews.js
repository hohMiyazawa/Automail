{name: "Reviews",code: function(){
	miscResults.innerText = "";
	let dataHeader = create("div",false,false,miscResults);
	create("p",false,"Static statistics as of January 13, 2023. (Maybe this can become dynamic again one day)",dataHeader);
	create("span",false,"Scanned ",dataHeader);
	let data_amount = create("span",false,"12401",dataHeader);
	create("span",false," reviews on Anilist, with ",dataHeader);
	let data_ratingAmount = create("span",false,"612920",dataHeader);
	create("span",false," ratings (",dataHeader);
	let data_ratingPositive = create("span",false,"68.3",dataHeader);
	create("span",false,"% positive)",dataHeader);
let cache = {
	"time": 1673628542376,
	"largestId": 19658,
	"prolificReviewers": [{"id":173334,"name":"TheRealKyuubey","rating":3781,"ratingAmount":7152,"amount":193},{"id":5477050,"name":"DomG26","rating":3791,"ratingAmount":5178,"amount":146},{"id":63817,"name":"TheGruesomeGoblin","rating":6640,"ratingAmount":8069,"amount":141},{"id":164274,"name":"CodeBlazeFate","rating":5116,"ratingAmount":9320,"amount":138},{"id":39746,"name":"Juliko25","rating":1668,"ratingAmount":2395,"amount":122},{"id":157905,"name":"Pockeyramune919","rating":3379,"ratingAmount":4495,"amount":102},{"id":98053,"name":"planetJane","rating":3984,"ratingAmount":4907,"amount":90},{"id":169913,"name":"GonzoLewd","rating":774,"ratingAmount":1114,"amount":86},{"id":5679514,"name":"SpiritChaser","rating":2588,"ratingAmount":5051,"amount":81},{"id":334159,"name":"saulgoodman","rating":3323,"ratingAmount":3522,"amount":67},{"id":899326,"name":"HidamariSeashore","rating":909,"ratingAmount":1039,"amount":66},{"id":160628,"name":"biogundam","rating":799,"ratingAmount":2326,"amount":66},{"id":5468370,"name":"R2R","rating":2066,"ratingAmount":2910,"amount":63},{"id":213985,"name":"TheAnimeBingeWatcher","rating":2502,"ratingAmount":3939,"amount":63},{"id":5478024,"name":"RoseFaerie","rating":795,"ratingAmount":877,"amount":59},{"id":151833,"name":"Shellshock","rating":617,"ratingAmount":1403,"amount":57},{"id":132095,"name":"CryingLad","rating":3074,"ratingAmount":4640,"amount":56},{"id":5464976,"name":"Mcsuper","rating":3004,"ratingAmount":4061,"amount":55},{"id":5670114,"name":"Benkei","rating":1306,"ratingAmount":1423,"amount":52},{"id":5502166,"name":"Kalladry","rating":1050,"ratingAmount":1307,"amount":51},{"id":135302,"name":"CaninnTurtle","rating":2979,"ratingAmount":3726,"amount":47},{"id":39336,"name":"KayiOu","rating":8987,"ratingAmount":14639,"amount":47},{"id":5687449,"name":"RebelPanda","rating":1191,"ratingAmount":1993,"amount":45},{"id":5306432,"name":"ZNote","rating":2030,"ratingAmount":2593,"amount":44},{"id":245642,"name":"ChillLaChill","rating":794,"ratingAmount":976,"amount":43}],
	"bestReviewers": [{"id":475301,"name":"Kumichou","rating":246,"ratingAmount":253,"amount":4},{"id":5930257,"name":"pseudo","rating":291,"ratingAmount":300,"amount":5},{"id":133213,"name":"Dayne64","rating":62,"ratingAmount":62,"amount":2},{"id":5717442,"name":"Kizamui","rating":89,"ratingAmount":90,"amount":4},{"id":135898,"name":"ladyfreyja","rating":89,"ratingAmount":90,"amount":4},{"id":167196,"name":"Fleur","rating":343,"ratingAmount":356,"amount":6},{"id":334159,"name":"saulgoodman","rating":3323,"ratingAmount":3522,"amount":67},{"id":668464,"name":"Arciboldo","rating":106,"ratingAmount":108,"amount":7},{"id":287201,"name":"Goldiizz","rating":316,"ratingAmount":330,"amount":3},{"id":213918,"name":"springchild","rating":110,"ratingAmount":113,"amount":4},{"id":450490,"name":"nephilimk","rating":304,"ratingAmount":319,"amount":12},{"id":5318591,"name":"Rewsula","rating":375,"ratingAmount":395,"amount":6},{"id":5493316,"name":"Louistrea","rating":123,"ratingAmount":127,"amount":3},{"id":206429,"name":"DoodleDelta","rating":122,"ratingAmount":126,"amount":2},{"id":146557,"name":"ManlyButterBath","rating":183,"ratingAmount":191,"amount":3},{"id":256364,"name":"Ari","rating":183,"ratingAmount":191,"amount":3},{"id":563929,"name":"Kassenentleerer","rating":119,"ratingAmount":123,"amount":2},{"id":695961,"name":"CinccinoHome","rating":424,"ratingAmount":449,"amount":3},{"id":700869,"name":"Jaekoi","rating":1054,"ratingAmount":1128,"amount":8},{"id":682518,"name":"StorLucilfer","rating":116,"ratingAmount":120,"amount":4}],
	"worstReviewers": [{"id":159522,"name":"Sun","rating":65,"ratingAmount":678,"amount":2},{"id":788401,"name":"malkafajas","rating":29,"ratingAmount":200,"amount":2},{"id":494283,"name":"Aaheel","rating":14,"ratingAmount":110,"amount":2},{"id":6023236,"name":"Aivvin","rating":15,"ratingAmount":113,"amount":2},{"id":126178,"name":"JOBEY","rating":13,"ratingAmount":100,"amount":2},{"id":467348,"name":"MaliTigar","rating":37,"ratingAmount":225,"amount":2},{"id":31405,"name":"Chibi243","rating":28,"ratingAmount":170,"amount":2},{"id":482910,"name":"ThePieGod","rating":48,"ratingAmount":270,"amount":3},{"id":5175766,"name":"FranMan","rating":112,"ratingAmount":573,"amount":2},{"id":375371,"name":"Mannoumi","rating":118,"ratingAmount":566,"amount":2},{"id":76257,"name":"AkiFosu","rating":91,"ratingAmount":426,"amount":4},{"id":143077,"name":"lublei","rating":60,"ratingAmount":291,"amount":4},{"id":5110196,"name":"boogiepopawa","rating":5,"ratingAmount":40,"amount":2},{"id":5830649,"name":"NerfMiner","rating":358,"ratingAmount":1495,"amount":7},{"id":5923658,"name":"WallahSous","rating":292,"ratingAmount":1177,"amount":12},{"id":365729,"name":"yabp1600","rating":73,"ratingAmount":315,"amount":7},{"id":126196,"name":"garthol","rating":167,"ratingAmount":650,"amount":13},{"id":5587883,"name":"JackDSF123","rating":48,"ratingAmount":208,"amount":2},{"id":5245658,"name":"lizeo","rating":97,"ratingAmount":390,"amount":2},{"id":151499,"name":"PlatinuMan","rating":238,"ratingAmount":885,"amount":20}],
	"reviews": [[8804,30104,"Yotsuba to!",139,139,100,334159,"saulgoodman"],[9542,129574,"1-nichi Go ni Shinu Gorilla",999,1024,100,5104257,"who717"],[16527,86559,"Golden Kamuy",93,93,100,5325636,"fastlane956"],[10704,30657,"Real",87,87,100,589910,"unimportantuser"],[9825,85412,"Shoujo Shuumatsu Ryokou",128,129,100,422656,"Syne"],[9218,205,"Samurai Champloo",220,224,93,700869,"Jaekoi"],[14820,113024,"Shoujo☆Kageki Revue Starlight Movie",181,184,100,5318591,"Rewsula"],[6455,100557,"Sachi-iro no One Room",115,116,94,475301,"Kumichou"],[13609,139586,"Go! Saitama",110,111,90,334159,"saulgoodman"],[7344,100568,"Supyeongseon",248,254,100,524198,"benitobandito"],[4611,86099,"Wind Breaker",106,107,99,47730,"Fuchsia"],[7577,111444,"Musume no Tomodachi",70,70,80,334159,"saulgoodman"],[6528,31133,"Dorohedoro",188,192,100,19842,"MasterCrash"],[8923,98361,"Mikkakan no Koufuku",159,162,100,762381,"isyatup43"],[3741,38967,"Onani Master Kurosawa",185,189,85,127279,"waifwu"],[12176,128547,"Odd Taxi",255,262,90,334159,"saulgoodman"],[5008,15227,"Kono Sekai no Katasumi ni",128,130,90,323992,"seanny"],[9655,41514,"Otoyomegatari",66,66,90,373255,"Krankastel"],[2224,19315,"Pupa",250,257,10,63817,"TheGruesomeGoblin"],[11518,105790,"Subete no Jinrui wo Hakai Suru. Sorera wa Saisei Dekinai.",65,65,95,613706,"animejas"],[9700,30021,"DEATH NOTE",123,125,91,665346,"sadJoe"],[9385,30003,"20 Seiki Shounen",147,150,91,700869,"Jaekoi"],[2434,85277,"Kuro",63,63,100,63817,"TheGruesomeGoblin"],[9512,100994,"Jigokuraku",146,149,85,334159,"saulgoodman"],[3645,30912,"Tomie",61,61,75,63817,"TheGruesomeGoblin"],[12386,98263,"Tongari Boushi no Atelier",90,91,95,530637,"nicobonito"],[3174,413,"Hametsu no Mars",313,324,1,167047,"zakarias"],[13681,112802,"Uramichi Oniisan",163,167,95,838061,"Zmar234"],[3521,578,"Hotaru no Haka",185,190,95,124111,"Grassman"],[7340,110413,"Lupin III: THE FIRST",60,60,80,373255,"Krankastel"],[10229,118586,"Sousou no Frieren",115,117,90,334159,"saulgoodman"],[13377,39726,"Kubikiri Cycle: Aoiro Savant to Zaregotozukai",114,116,100,370192,"Railgun"],[3626,437,"PERFECT BLUE",347,360,98,22219,"DaLadybugMan"],[10335,106503,"EX-ARM",1085,1140,100,540135,"Pigooz"],[14194,40443,"Bakuon Rettou",57,57,90,450490,"nephilimk"],[17500,31706,"JoJo no Kimyou na Bouken: Steel Ball Run",84,85,100,355736,"aran"],[9177,21804,"Saiki Kusuo no Ψ-nan",126,129,90,155040,"RecDoT"],[3903,457,"Mushishi",146,150,100,43326,"aikaflip"],[7401,103373,"Gokiburi Taisou",102,104,100,80421,"JDinkleberg"],[3613,33575,"Saikyou Densetsu Kurosawa",102,104,100,146557,"ManlyButterBath"],[14561,132288,"Hirayasumi",53,53,80,334159,"saulgoodman"],[11270,33588,"Double House",53,53,95,167908,"faktory"],[15673,5680,"K-ON!",238,247,100,287201,"Goldiizz"],[19322,130003,"Bocchi the Rock!",272,283,100,544588,"Sirion"],[9960,30107,"Chobits",52,52,90,85141,"ninjamushi"],[11364,21837,"Gakuen Handsome",196,203,100,5232975,"groggy1"],[9691,30729,"Emma",51,51,80,373255,"Krankastel"],[9148,4896,"Umineko no Naku Koro ni",51,51,20,197973,"pixeldesu"],[10213,108725,"Yakusoku no Neverland 2",347,363,40,495720,"An1meDweeb"],[9440,101583,"Sono Bisque Doll wa Koi wo Suru",136,140,80,334159,"saulgoodman"],[6639,350,"Ojamajo Doremi",50,50,85,155143,"Tani"],[5320,90911,"Dead Word Puzzle",50,50,1,63817,"TheGruesomeGoblin"],[4499,85911,"Tomodachi Game",74,75,83,125448,"afwcal"],[9931,94490,"The Fable",73,74,90,334159,"saulgoodman"],[14402,30745,"PLUTO",49,49,90,5436130,"Lyadh"],[16171,146983,"Sayonara Eri",286,299,100,5272329,"LuminousMagic"],[9861,126287,"PUPARIA",219,228,78,604123,"imnap"],[10904,98579,"Henkei Shoujo",72,73,100,5232975,"groggy1"],[16305,125828,"SAKAMOTO DAYS",48,48,95,5670114,"Benkei"],[6541,108196,"My Home Hero",48,48,90,133213,"Dayne64"],[11478,74489,"Houseki no Kuni",111,114,92,5240018,"SXNGXNG"],[10671,100855,"Emiya-san Chi no Kyou no Gohan",111,114,80,5232975,"groggy1"],[17716,100568,"Supyeongseon",71,72,70,5137884,"EpicSponge101"],[13160,38967,"Onani Master Kurosawa",71,72,95,780369,"NegevTv"],[2215,20645,"Glasslip",147,152,10,63817,"TheGruesomeGoblin"],[11421,30002,"Berserk",534,564,100,403142,"c4e"],[15794,143690,"AMONG US",385,405,100,695961,"CinccinoHome"],[4388,185,"Initial D",109,112,90,137953,"serime"],[11052,30642,"Vinland Saga",177,184,100,950180,"lloydcyber"],[10885,132692,"GHOST",69,70,100,31227,"Hideki"],[3841,47465,"Omoide Emanon",69,70,95,118275,"BastBard"],[7608,2251,"Baccano!",125,129,100,602195,"laforet"],[7451,100991,"act-age",234,245,99,206087,"WhiteHikari"],[9836,86781,"Ashizuri Suizokukan",45,45,80,334159,"saulgoodman"],[6491,82,"Kidou Senshi Gundam 0080: Pocket no Naka no Sensou",45,45,100,245642,"ChillLaChill"],[4260,16664,"Kaguya-hime no Monogatari",67,68,95,119023,"Mionge"],[7567,101233,"Gokushufudou",122,126,90,334159,"saulgoodman"],[4562,108556,"SPY×FAMILY",292,307,90,111469,"OttoVonBismarck"],[7770,110349,"GREAT PRETENDER",153,159,86,404903,"pointydelta"],[6617,98034,"Saiki Kusuo no Ψ-nan 2",85,87,92,493585,"AnishG555"],[14860,113024,"Shoujo☆Kageki Revue Starlight Movie",120,124,100,140376,"SpookSpark"],[4802,20668,"Gekkan Shoujo Nozaki-kun",120,124,100,221282,"Revisionary"],[12227,131773,"Wonder Egg Priority: Tokubetsu-hen",310,327,10,825358,"bebop"],[6586,87459,"Sabishisugite Rezu Fuzoku ni Ikimashita Report",195,204,100,225075,"meniel"],[15057,43290,"Ningen Shikkaku",43,43,90,682518,"StorLucilfer"],[9084,21595,"Sakamoto desu ga?",43,43,78,899326,"HidamariSeashore"],[7421,119944,"Tenkyuu, Suisei wa Yoru wo Mataide",64,65,100,31227,"Hideki"],[3907,86238,"Kono Subarashii Sekai ni Shukufuku wo!",64,65,95,97990,"bonbons"],[2608,21170,"Ansatsu Kyoushitsu 2",179,187,98,130243,"AmishaelAL"],[10423,103047,"Violet Evergarden Movie",148,154,94,665346,"sadJoe"],[11820,918,"Gintama",132,137,100,751934,"JabroniPie"],[15732,139589,"Kotarou wa Hitorigurashi",115,119,80,5468370,"R2R"],[12807,33285,"Holyland",63,64,100,302649,"Laevatein"],[10223,117696,"Tenchi Souzou Design-bu",63,64,95,948063,"ranrannerson"],[5360,85198,"Kasane",81,83,100,63817,"TheGruesomeGoblin"],[17667,100994,"Jigokuraku",42,42,80,5923019,"polkura"],[15944,85316,"Dead Dead Demon's Dededededestruction",42,42,85,5568115,"hoeberries"],[7100,34625,"Kamigami no Itadaki",42,42,100,563929,"Kassenentleerer"],[5330,42549,"Fourteen",42,42,99,63817,"TheGruesomeGoblin"],[4532,30481,"Planetes",42,42,90,279478,"AdmiralTofuKing"],[13193,30002,"Berserk",31,409,30,159522,"Sun"],[7105,99426,"Sora yori mo Tooi Basho",16,211,30,375097,"Saudade"],[15626,21366,"3-gatsu no Lion",11,144,60,31405,"Chibi243"],[12796,21284,"Flying Witch",3,61,20,5502166,"Kalladry"],[11291,19,"MONSTER",48,459,1,151833,"Shellshock"],[6567,4224,"Toradora!",7,99,65,494283,"Aaheel"],[8381,20623,"Kiseijuu: Sei no Kakuritsu",29,278,0,719139,"NickCrouton"],[2799,1535,"DEATH NOTE",24,232,65,123510,"isahbellah"],[19340,130003,"Bocchi the Rock!",24,228,45,5679514,"SpiritChaser"],[3022,232,"Cardcaptor Sakura",6,80,62,160628,"biogundam"],[19555,130003,"Bocchi the Rock!",18,178,60,6029546,"Redpillman"],[11023,268,"GOLDEN BOY: Sasurai no Obenkyou Yarou",11,122,32,5315218,"sarre"],[12405,30002,"Berserk",16,160,60,5435290,"P3PO"],[6512,101348,"VINLAND SAGA",25,226,42,76257,"AkiFosu"],[11934,98478,"3-gatsu no Lion 2",8,94,61,5420721,"YuiHirasawa39"],[17460,97986,"Made in Abyss",49,398,30,5923658,"WallahSous"],[18506,7791,"K-ON!!",14,141,30,5784148,"namenotgiven"],[11947,12531,"Sakamichi no Apollon",4,59,51,5420721,"YuiHirasawa39"],[8723,329,"Planetes",6,75,30,324025,"geovannyboss"],[18180,5680,"K-ON!",52,404,40,5784148,"namenotgiven"],[9958,33,"Kenpuu Denki Berserk",22,195,40,211521,"Eagleshadow"],[3543,99426,"Sora yori mo Tooi Basho",15,142,40,126196,"garthol"],[14871,20607,"Ping Pong THE ANIMATION",12,118,30,5699600,"commandrbigglesworth"],[11238,477,"ARIA The ANIMATION",51,386,14,5345052,"Puppyhumper"],[17277,125367,"Kaguya-sama wa Kokurasetai: Ultra Romantic",67,491,63,677174,"Alicemagic18"],[8655,9253,"Steins;Gate",14,131,69,332074,"Fractured"],[13391,20954,"Koe no Katachi",34,269,10,159522,"Sun"],[7108,21355,"Re:Zero kara Hajimeru Isekai Seikatsu",25,204,30,442831,"Criiza"],[8814,11741,"Fate/Zero 2nd Season",25,198,38,482910,"ThePieGod"],[5893,9617,"K-ON! Movie",5,60,67,132397,"TK8878"],[15507,9260,"Kizumonogatari I: Tekketsu-hen",18,150,65,5732627,"Wilza"],[9844,21366,"3-gatsu no Lion",19,156,34,860175,"JGamer"],[9445,104578,"Shingeki no Kyojin 3 Part 2",48,339,20,382192,"VirtuousZero"],[2780,33104,"Helter Skelter",17,142,40,123510,"isahbellah"],[18059,9253,"Steins;Gate",21,168,55,5670443,"SuperVak"],[6837,20972,"Shouwa Genroku Rakugo Shinjuu",4,51,70,151499,"PlatinuMan"],[18641,47,"AKIRA",11,100,46,6023236,"Aivvin"],[18275,106286,"Tenki no Ko",24,184,20,5784148,"namenotgiven"],[16111,108632,"Re:Zero kara Hajimeru Isekai Seikatsu 2nd Season",7,72,30,5813892,"Seff"],[8290,457,"Mushishi",17,138,30,788401,"malkafajas"],[18222,20912,"Hibike! Euphonium",12,104,50,5784148,"namenotgiven"],[11948,19703,"Kyousougiga (TV)",4,49,54,5420721,"YuiHirasawa39"],[6900,99424,"SSSS.GRIDMAN",7,70,33,470469,"magnifico"],[6206,108617,"Somali to Mori no Kamisama",10,90,44,365729,"yabp1600"],[2575,21126,"ChäoS;Child",6,63,30,127754,"beanwolf"],[11741,10165,"Nichijou",43,291,30,5175766,"FranMan"],[9360,875,"Mind Game",15,121,30,213985,"TheAnimeBingeWatcher"],[7380,21875,"No Game No Life Zero",44,294,30,365383,"Visconde"],[8281,101348,"VINLAND SAGA",14,112,70,606215,"akasinan"],[11933,21366,"3-gatsu no Lion",7,67,57,5420721,"YuiHirasawa39"],[2977,21087,"One Punch Man",10,86,66,160628,"biogundam"],[6368,115122,"DEATH NOTE: Tokubetsu Yomikiri",33,221,1,467348,"MaliTigar"],[3301,98505,"Princess Principal",15,116,31,164274,"CodeBlazeFate"],[17358,125367,"Kaguya-sama wa Kokurasetai: Ultra Romantic",14,109,64,5420721,"YuiHirasawa39"],[13083,19,"MONSTER",39,252,43,5528428,"AsteRiA004"],[12651,918,"Gintama",76,453,40,39336,"KayiOu"],[8550,20954,"Koe no Katachi",28,188,30,829256,"RatPoison69"],[16396,687,"Tokyo Mew Mew",4,45,38,5826452,"Fluoxetine50mg"],[5342,30656,"Vagabond",43,270,50,359721,"GGShang"],[8500,20954,"Koe no Katachi",91,526,0,375371,"Mannoumi"],[14672,127720,"Mushoku Tensei: Isekai Ittara Honki Dasu Part 2",49,301,35,677174,"Alicemagic18"],[17688,5680,"K-ON!",22,152,52,39746,"Juliko25"],[9444,104578,"Shingeki no Kyojin 3 Part 2",43,267,39,238614,"TobioMark"],[19228,101338,"Mob Psycho 100 II",10,82,60,5815844,"Granzchesta"],[12864,1535,"DEATH NOTE",16,116,60,5386493,"inductionstove"],[17009,486,"Kino no Tabi: the Beautiful World",2,30,30,5110196,"boogiepopawa"],[10559,108465,"Mushoku Tensei: Isekai Ittara Honki Dasu",21,141,50,823985,"Iero"],[15756,131586,"86: Eighty Six Part 2",67,381,45,5679514,"SpiritChaser"],[10869,11981,"Mahou Shoujo Madoka☆Magica: Hangyaku no Monogatari",10,79,65,213985,"TheAnimeBingeWatcher"],[12724,124675,"Osananajimi ga Zettai ni Makenai Love Come",12,90,100,5287139,"Swiftr13"],[7375,34632,"Oyasumi Punpun",14,101,65,373722,"hamzafezzaz12"],[9620,101922,"Kimetsu no Yaiba",100,542,100,5124525,"KimetsuNoTanjiro"],[12342,9253,"Steins;Gate",33,202,45,5344597,"GhostHardware"],[14694,138714,"Heike Monogatari",4,42,75,142076,"tinyraccoon"],[1033,136,"HUNTER×HUNTER",91,493,100,20306,"aeptia"],[3037,97980,"Re:CREATORS",7,60,53,160628,"biogundam"],[13858,6956,"Working!!",11,83,20,406399,"Shisui0"],[5809,20954,"Koe no Katachi",28,173,40,151499,"PlatinuMan"],[10359,5680,"K-ON!",29,178,30,194615,"Lili1228"],[9794,104647,"Otome Game no Hametsu Flag shika Nai Akuyaku Reijou ni Tensei shiteshimatta…",25,157,25,5142007,"BaronS"],[2198,1358,"Hokuto no Ken Movie",5,47,0,91709,"JTurner82"],[4852,11061,"HUNTER×HUNTER (2011)",101,528,4,309857,"PatricianBliss"],[7408,20954,"Koe no Katachi",47,266,30,622511,"spacexdragon"],[9491,30,"Shin Seiki Evangelion",26,159,45,383328,"CandycaneRay"],[16300,30149,"BLAME!",9,69,35,596338,"LauruxKittyCat"],[11935,20602,"Amagi Brilliant Park",6,52,63,5420721,"YuiHirasawa39"],[3620,100077,"Hinamatsuri",12,85,50,147221,"Fountainstand"],[5798,7791,"K-ON!!",13,90,66,132397,"TK8878"],[16452,112151,"Kimetsu no Yaiba: Mugen Ressha-hen",27,162,100,5830649,"NerfMiner"],[19476,127230,"Chainsaw Man",14,95,20,886302,"DYNASTIA"],[13989,21355,"Re:Zero kara Hajimeru Isekai Seikatsu",16,105,30,5581051,"ImmoralOrel"],[13325,1142,"Hachimitsu to Clover II",2,27,50,660526,"cmac1027"],[8459,21719,"Fate/stay night [Heaven's Feel] III. spring song",19,120,60,229298,"Struggler"],[17675,5680,"K-ON!",10,73,65,5803895,"NBreviews"],[18988,6746,"Durarara!!",5,45,67,5559434,"AllLuckBased"],[9384,97917,"Yoru wa Mijikashi Arukeyo Otome",11,78,60,213985,"TheAnimeBingeWatcher"],[7258,14131,"Girls und Panzer",3,33,10,589910,"unimportantuser"],[2188,136,"HUNTER×HUNTER",36,203,40,69738,"spacebro"],[18398,100178,"Liz to Aoi Tori",18,114,10,5784148,"namenotgiven"],[9769,102976,"Kono Subarashii Sekai ni Shukufuku wo! Kurenai Densetsu",17,108,50,5142007,"BaronS"]]
};

	let list = cache.reviews.map(comp => ({
		id: comp[0],
		media: {
			id: comp[1],
			title: {romaji: comp[2]}
		},
		rating: comp[3],
		ratingAmount: comp[4],
		score: comp[5],
		user: {
			id: comp[6],
			name: comp[7]
		}
	}))

	let render = function(){
		list.sort((b,a) => wilson(a.rating,a.ratingAmount).left - wilson(b.rating,b.ratingAmount).left);
		create("h3",false,"100 best reviews on Anilist",miscResults);
		let datalist1 = create("div",false,false,miscResults);
		list.slice(0,100).forEach((review,index) => {
			let dataCel = create("p",false,false,datalist1);
			create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
			create("span","hohMonospace",wilson(review.rating,review.ratingAmount).left.toPrecision(3) + " ",dataCel);
			let userName = "[error]";
			if(review.user){
				if(review.user.name){
					userName = review.user.name
				}
			};
			create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
				.href = "/review/" + review.id
		});
		list.sort((a,b)=>wilson(a.rating,a.ratingAmount).right - wilson(b.rating,b.ratingAmount).right);
		create("h3",false,"100 worst reviews on Anilist",miscResults);
		let datalist2 = create("div",false,false,miscResults);
		list.slice(0,100).forEach((review,index) => {
			let dataCel = create("p",false,false,datalist2);
			create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
			create("span","hohMonospace",wilson(review.rating,review.ratingAmount).right.toPrecision(3) + " ",dataCel);
			let userName = "[error]";
			if(review.user){
				if(review.user.name){
					userName = review.user.name
				}
			};
			create("a",["link","newTab"],userName + "'s  review of " + review.media.title.romaji,dataCel)
				.href = "/review/" + review.id
		});
		create("h3",false,"10 best reviewers on Anilist",miscResults);
		let datalist3 = create("div",false,false,miscResults);
		cache.bestReviewers.slice(0,10).forEach((rev,index) => {
			let dataCel = create("p",false,false,datalist3);
			create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
			create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).left.toPrecision(3) + " ",dataCel);
			let userName = rev.name || "[private or deleted]";
			let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
			link.href = "/user/" + rev.name || "removed"
		});
		create("h3",false,"10 worst reviewers on Anilist",miscResults);
		let datalist4 = create("div",false,false,miscResults);
		cache.worstReviewers.slice(0,10).forEach((rev,index) => {
			let dataCel = create("p",false,false,datalist4);
			create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
			create("span","hohMonospace",wilson(rev.rating,rev.ratingAmount).right.toPrecision(3) + " ",dataCel);
			let userName = rev.name || "[private or deleted]";
			let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
			link.href = "/user/" + rev.name || "removed"
		});
		create("h3",false,"25 most prolific reviewers on Anilist",miscResults);
		let datalist5 = create("div",false,false,miscResults);
		let profilicSum = 0;
		cache.prolificReviewers.slice(0,25).forEach((rev,index) => {
			profilicSum += rev.amount;
			let dataCel = create("p",false,false,datalist5);
			create("span",false,(index + 1) + ". ",dataCel,"width:35px;display:inline-block;");
			create("span","hohMonospace",rev.amount + " ",dataCel);
			let userName = rev.name || "[private or deleted]";
			let link = create("a",["link","newTab"],userName,dataCel,"color:rgb(var(--color-blue));");
			link.href = "/user/" + rev.name || "removed";
			create("span",false," average rating: " + (100*rev.rating/rev.ratingAmount).toPrecision(2) + "%",dataCel)
		});
		create("p",false,"That's " + Math.round(100*profilicSum/12401) + "% of all reviews on Anilist",miscResults);

		create("p",false,`3759 users have contributed reviews (3.2 reviews each on average, median 1, mode 1)`,miscResults);

		let lowRatingRating = 69065;
		let lowRatingAmount = 152647;
		let lowRatingCount = 1986;
		let highRatingRating = 349671;
		let highRatingAmount = 460273;
		let highRatingCount = 10059;
		let topRatingRating = 89024;
		let topRatingAmount = 108245;
		let topRatingCount = 1718;
		let distribution = [65,56,6,5,4,36,4,3,4,3,110,1,4,9,6,38,4,6,9,7,177,4,10,10,9,46,8,4,7,4,236,15,10,10,15,77,9,8,36,15,241,21,20,25,16,79,21,15,24,8,426,16,23,25,19,135,24,25,28,29,445,31,45,43,32,237,40,56,61,62,721,52,107,84,81,470,70,100,118,77,995,87,109,104,112,583,127,166,132,100,1100,98,142,112,106,536,120,125,143,88,1718];
		create("p",false,"The " + lowRatingCount + " reviews with a score 0-50 are rated " + (100*lowRatingRating/lowRatingAmount).toPrecision(2) + "% on average.",miscResults);
		create("p",false,"The " + highRatingCount + " reviews with a score 51-100 are rated " + (100*highRatingRating/highRatingAmount).toPrecision(2) + "% on average.",miscResults);
		create("p",false,"The " + topRatingCount + " reviews with a score 100/100 are rated " + (100*topRatingRating/topRatingAmount).toPrecision(2) + "% on average.",miscResults);

		create("p",false,"The average score for a review to give is " + Stats.average(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
		create("p",false,"The median score for a review to give is " + Stats.median(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
		create("p",false,"The most common score for a review to give is " + Stats.mode(list.map(e => e.score)).toPrecision(3) + "/100.",miscResults);
		const height = 250;
		const width = 700;
		let dia = svgShape("svg",miscResults,{
			width: width,
			height: height,
			viewBox: "0 0 " + width + " " + height
		});
		dia.style.borderRadius = "3px";
		let background = svgShape("rect",dia,{
			fill: "rgb(var(--color-foreground))",
			x: 0,
			y: 0,
			width: "100%",
			height: "100%"
		});
		let margin = {
			bottom: 30,
			top: 30,
			left: 20,
			right: 20
		};
		const bars = 101;
		const barWidth = 0.74 * (width - margin.left - margin.right)/bars;
		const barSpacing = 0.24 * (width - margin.left - margin.right)/bars;
		let maxVal = Math.max(...distribution);
		let magnitude = Math.pow(10,Math.floor(Math.log10(maxVal)));
		let mantissa = maxVal/magnitude;
		if(mantissa < 1.95){
			maxVal = 2*magnitude
		}
		else if(mantissa < 2.95){
			maxVal = 3*magnitude
		}
		else if(mantissa < 4.9){
			maxVal = 5*magnitude
		}
		else if(mantissa < 9.8){
			maxVal = 10*magnitude
		}
		else{
			maxVal = 15*magnitude
		};
		let valueFunction = function(val){
			return height - margin.bottom - (val/maxVal) * (height - margin.bottom - margin.top)
		};
		let title = svgShape("text",dia,{
			x: 10,
			y: 20,
			fill: "rgb(var(--color-text))"
		});
		title.textContent = "Review score distribution";
		distribution.forEach((val,index) => {
			if(!val){
				return;
			}
			let colour = "rgb(var(--color-text))";
			if(index % 10 === 0){
				colour = "rgb(61,180,242)";
				let text = svgShape("text",dia,{
					x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
					y: valueFunction(val) - barWidth,
					fill: colour,
					"text-anchor": "middle",
				});
				text.textContent = val;
				let text2 = svgShape("text",dia,{
					x: margin.left + index*barWidth + index*barSpacing + barWidth/2,
					y: height - margin.bottom + 3*barWidth,
					fill: colour,
					"text-anchor": "middle",
				});
				text2.textContent = index;
			}
			else if(index % 10 === 5){
				colour = "rgb(123,213,85)"
			}
			svgShape("rect",dia,{
				x: margin.left + index*barWidth + index*barSpacing,
				y: valueFunction(val),
				width: barWidth,
				height: height - valueFunction(val) - margin.bottom,
				fill: colour
			})
		})
	}
	render();
/*
	for(var i=1;i<=data.data.Page.pageInfo.lastPage;i++){
		generalAPIcall(
			`query ($page: Int){
				Page (page: $page){
					pageInfo{
						perPage
						currentPage
						hasNextPage
					}
					reviews{
						id
						rating
						ratingAmount
						score
						user{
							name
							id
						}
						media{
							id
							title{romaji}
						}
					}
				}
			}`,
			{page: i},
			function(reviewData){
				if(!reviewData){
					hasErrors++;
					if(i !== data.data.Page.pageInfo.lastPage){
						return
					}
				}
				list = list.concat(reviewData.data.Page.reviews);
				if(list.length !== reviewData.data.Page.pageInfo.total && (!hasErrors || i !== data.data.Page.pageInfo.lastPage)){
					return
				};
			}
		)
	}
*/
}},
