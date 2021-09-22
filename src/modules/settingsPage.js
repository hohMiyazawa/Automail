exportModule({
	id: "settingsPage",
	description: "This settings page",
	isDefault: true,//must be true
	categories: ["Script"],
	visible: false,
	urlMatch: function(url,oldUrl){
		return url === "https://anilist.co/settings/apps"
	},
	code: function(){
		if(location.pathname !== "/settings/apps"){
			return
		};
		if(document.getElementById("hohSettings")){
			return
		};
		let targetLocation = document.querySelector(".settings.container .content");
		let hohSettings = create("div","#hohSettings",false,targetLocation);
		hohSettings.classList.add("all");
		let scriptStatsHead = create("h1",false,translate("$settings_title"),hohSettings);
		let scriptStats = create("div",false,false,hohSettings);
		let sVersion = create("p",false,false,scriptStats);
		create("span",false,translate("$settings_version"),sVersion);
		create("span","hohStatValue",scriptInfo.version,sVersion);
		let sHome = create("p",false,translate("$settings_homepage"),scriptStats);
		let sHomeLink = create("a","external",scriptInfo.link,sHome);
		let sHome2 = create("p",false,translate("$settings_repository"),scriptStats);
		let sHomeLink2 = create("a","external",scriptInfo.repo,sHome2);
		if(!useScripts.accessToken){
			create("p",false,"Faded options only have limited functionallity without signing in to the script (scroll down to the bottom of the page for that) which also requires persistent cookies, see https://github.com/hohMiyazawa/Automail/issues/26#issuecomment-623677462",scriptStats)
		}
		sHomeLink.href = scriptInfo.link;
		sHomeLink2.href = scriptInfo.repo;
		let categories = create("div",["container","hohCategories"],false,scriptStats);
		let catList = ["Notifications","Feeds","Forum","Lists","Profiles","Stats","Media","Navigation","Browse","Script","Login","Newly Added"];
		let activeCategory = "";
		catList.forEach(function(category){
			let catBox = create("div","hohCategory",translate("$settings_category_" + category),categories);
			catBox.onclick = function(){
				hohSettings.className = "";
				if(activeCategory === category){
					catBox.classList.remove("active");
					activeCategory = "";
					hohSettings.classList.add("all");
				}
				else{
					if(activeCategory !== ""){
						categories.querySelector(".hohCategory.active").classList.remove("active")
					};
					catBox.classList.add("active");
					hohSettings.classList.add(category.replace(" ",""));
					activeCategory = category
				}
			}
		});
		let scriptSettings = create("div",false,false,hohSettings);
		if(!useScripts.accessToken){
			scriptSettings.classList.add("noLogin")
		}
		useScriptsDefinitions.sort((b,a) => (a.importance || 0) - (b.importance || 0));
		useScriptsDefinitions.forEach(function(def){
			let setting = create("p","hohSetting",false,scriptSettings);
			if(def.visible === false){
				setting.style.display = "none"
			};
			if(def.hasOwnProperty("type")){//other kinds of input
				let input;
				if(def.type === "select"){
					input = create("select",false,false,setting);
					if(def.id === "partialLocalisationLanguage"){
						//English stafff credits aren't included in the files since the site is already in English, but we still want to estimate the amount
						const nativeEnglishRoleCount = Object.keys(languageFiles["Norsk"].keys).filter(e => e.substring(0,6) === "$role_").length;
						def.values.forEach(
							value => create("option",false,value + " (" + Math.max(
									Object.keys(languageFiles[value].keys).length
									+ (value === "English" ? nativeEnglishRoleCount : 0),
									(
										languageFiles[value].info.variation_of
										?
										Object.keys(languageFiles[languageFiles[value].info.variation_of].keys).length	
										+ (value === "English (US)" ? nativeEnglishRoleCount : 0)
										:
										0
									)
								) + " keys)",input)
								.value = value
						)
					}
					else{
						if(def.displayValues){
							def.values.forEach(
								(value,index) => create("option",false,translate(def.displayValues[index]),input)
									.value = value
							)
						}
						else{
							def.values.forEach(
								value => create("option",false,value,input)
									.value = value
							)
						}
					}
				}
				else if(def.type === "text"){
					input = create("input",false,false,setting)
				}
				else if(def.type === "number"){
					input = create("input",false,false,setting);
					input.type = "number";
					if(def.min !== undefined){
						input.setAttribute("min",def.min)
					}
					if(def.max){
						input.setAttribute("max",def.max)
					}
				}
				if(def.type !== "heading"){
					input.targetSetting = def.id;
					input.value = useScripts[def.id];
					input.onchange = function(){
						useScripts[this.targetSetting] = this.value;
						useScripts.save()
					}
				}
			}
			else{//default: a checkbox
				let input = createCheckbox(setting);
				input.targetSetting = def.id;
				input.checked = useScripts[def.id];
				input.onchange = function(){
					useScripts[this.targetSetting] = this.checked;
					useScripts.save();
					initCSS();
					if(!this.checked && def.destructor){
						def.destructor()
					}
					if(this.checked && def.css){
						moreStyle.textContent += def.css
					}
				}
			};
			if(def.categories){
				def.categories.forEach(
					category => setting.classList.add(category.replace(/\s/g,""))
				)
			};
			create("span",false,translate(def.description),setting);
			if(def.extendedDescription){
				let infoButton = create("span","hohInfoButton","🛈",setting);
				infoButton.title = translate("$settings_moreInfo_tooltip");
				infoButton.onclick = function(){
					createDisplayBox(false,"Module info").innerText = translate(def.extendedDescription)
				}
			}
		});
		let titleAliasSettings = create("div");
		let titleAliasInstructions = create("p");
		titleAliasInstructions.innerText = `
	Add title aliases. Use the format /type/id/alias , one per line. Examples:

	/anime/5114/Fullmetal Alchemist
	/manga/30651/Nausicaä

	Changes take effect on reload.`;
		let titleAliasInput = create("textarea","#titleAliasInput");
		(
			JSON.parse(localStorage.getItem("titleAliases")) || []
		).forEach(
			alias => titleAliasInput.value += alias[0] + alias[1] + "\n"
		);
		titleAliasInput.rows = "6";
		titleAliasInput.cols = "50";
		let titleAliasChange = create("button",["hohButton","button"],translate("$button_submit"));
		titleAliasChange.onclick = function(){
			let newAliases = [];
			let aliasContent = titleAliasInput.value.split("\n");
			let aliasRegex = /^(\/(anime|manga)\/\d+\/)(.*)/;
			let cssAlias = /^(css\/)(.*)/;
			aliasContent.forEach(content => {
				let matches = content.match(aliasRegex);
				if(!matches){
					let cssMatches = content.match(cssAlias);
					if(cssMatches){
						newAliases.push([cssMatches[1],cssMatches[2]])
					};
					return
				};
				newAliases.push([matches[1],matches[3]]);
			});
			localStorage.setItem("titleAliases",JSON.stringify(newAliases))
		};
		titleAliasSettings.appendChild(create("hr"));
		titleAliasSettings.appendChild(titleAliasInstructions);
		titleAliasSettings.appendChild(titleAliasInput);
		create("br",false,false,titleAliasSettings);
		titleAliasSettings.appendChild(titleAliasChange);
		titleAliasSettings.appendChild(create("hr"));
		hohSettings.appendChild(titleAliasSettings);
		//
		let notificationColour = create("div");
		if(useScripts.accessToken){
			const notificationTypes = Object.keys(notificationColourDefaults);
			const supportedColours = [
				{name:translate("$colour_transparent"),value:"rgb(0,0,0,0)"},
				{name:translate("$colour_blue"),value:"rgb(61,180,242)"},
				{name:translate("$colour_white"),value:"rgb(255,255,255)"},
				{name:translate("$colour_black"),value:"rgb(0,0,0)"},
				{name:translate("$colour_red"),value:"rgb(232,93,117)"},
				{name:translate("$colour_peach"),value:"rgb(250,122,122)"},
				{name:translate("$colour_orange"),value:"rgb(247,154,99)"},
				{name:translate("$colour_yellow"),value:"rgb(247,191,99)"},
				{name:translate("$colour_green"),value:"rgb(123,213,85)"}
			];
			create("p",false,translate("$settings_notificationDotColour"),notificationColour);
			let nColourType = create("select",false,false,notificationColour);
			let nColourValue = create("select",false,false,notificationColour);
			let supressOption = createCheckbox(notificationColour);
			let supressOptionText = create("span",false,"Don't show dot for this type",notificationColour);
			notificationTypes.forEach(
				type => create("option",false,type,nColourType)
					.value = type
			);
			supportedColours.forEach(
				colour => create("option",false,colour.name,nColourValue)
					.value = colour.value
			);
			create("br",false,false,notificationColour);
			let resetAll = create("button",["hohButton","button"],translate("$button_resetAll"),notificationColour);
			resetAll.onclick = function(){
				useScripts.notificationColours = notificationColourDefaults;
				useScripts.save();
			};
			nColourType.oninput = function(){
				nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
				supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
			};
			nColourValue.oninput = function(){
				useScripts.notificationColours[nColourType.value].colour = nColourValue.value;
				useScripts.save();
			};
			supressOption.oninput = function(){
				useScripts.notificationColours[nColourType.value].supress = supressOption.checked;
				useScripts.save()
			};
			nColourValue.value = useScripts.notificationColours[nColourType.value].colour;
			supressOption.checked = useScripts.notificationColours[nColourType.value].supress;
			hohSettings.appendChild(notificationColour);
		}
		hohSettings.appendChild(create("hr"));
		let blockList = localStorage.getItem("blockList");
		if(blockList){
			blockList = JSON.parse(blockList)
		}
		else{
			blockList = []
		};
		let blockSettings = create("div");
		let blockInstructions = create("p",false,false,blockSettings);
		blockInstructions.innerText = `
Block stuff in the home feed.

Example1: To block "planning" activities by a specific user, fill out those two fields and leave the media field blank.
Example2: To block a specific piece of media, fill out that field and leave the other two blank.

Changes take effect on reload.`;
		let blockInput = create("div","#blockInput",false,blockSettings);
		create("span",false,"User: ",blockInput);
		let blockUserInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
		blockUserInput.value = "";
		create("span",false," Status: ",blockInput);
		let blockStatusInput = create("select",false,false,blockInput,"margin-right:10px;");
		const blockStatuses = ["","all","status","progress","anime","manga","planning","watching","reading","pausing","dropping","rewatching","rereading"];
		blockStatuses.forEach(
			status => create("option",false,capitalize(status),blockStatusInput)
				.value = status
		);
		blockStatusInput.value = "";
		create("span",false," Media ID: ",blockInput);
		let blockMediaInput = create("input",false,false,blockInput,"width:100px;margin-right:10px;");
		blockMediaInput.type = "number";
		blockMediaInput.value = "";
		blockMediaInput.min = 1;
		blockMediaInput.addEventListener("paste",function(e){
			let clipboardData = e.clipboardData || window.clipboardData;
			if(!clipboardData){//don't mess with paste
				return
			}
			let pastedData = clipboardData.getData("Text");
			if(!pastedData){
				return
			}
			e.stopPropagation();
			e.preventDefault();
			let possibleFullURL = pastedData.match(/(anime|manga)\/(\d+)\/?/);
			if(possibleFullURL){
				blockMediaInput.value = parseInt(possibleFullURL[2])
			}
			else{
				blockMediaInput.value = pastedData
			}
		});
		let blockAddInput = create("button",["button","hohButton"],"Add",blockInput);
		let blockVisual = create("div",false,false,blockSettings);
		let drawBlockList = function(){
			removeChildren(blockVisual)
			blockList.forEach(function(blockItem,index){;
					let item = create("div","hohBlock",false,blockVisual);
					let cross = create("span","hohBlockCross",svgAssets.cross,item);
					cross.onclick = function(){
						blockList.splice(index,1);
						localStorage.setItem("blockList",JSON.stringify(blockList));
						drawBlockList();
					};
					if(blockItem.user){
						create("span","hohBlockSpec",blockItem.user,item)
					}
					if(blockItem.status){
						create("span","hohBlockSpec",capitalize(blockItem.status),item)
					}
					if(blockItem.media){
						create("span","hohBlockSpec","ID:" + blockItem.media,item)
					}
			})
		};drawBlockList();
		blockAddInput.onclick = function(){
			let newBlock = {
				user: false,
				status: false,
				media: false
			};
			if(blockUserInput.value){
				newBlock.user = blockUserInput.value
			}
			if(blockStatusInput.value){
				newBlock.status = blockStatusInput.value
			}
			if(blockMediaInput.value){
				newBlock.media = blockMediaInput.value
			}
			if(newBlock.user || newBlock.status || newBlock.media){
				blockList.push(newBlock);
				localStorage.setItem("blockList",JSON.stringify(blockList));
				drawBlockList();
			}
		};
		hohSettings.appendChild(blockSettings);
		//
		hohSettings.appendChild(create("hr"));
		if(useScripts.profileBackground && useScripts.accessToken){
			let backgroundSettings = create("div",false,false,hohSettings);
			create("p",false,translate("$profileBackground_help1"),backgroundSettings);
			create("pre","hohCode","red",backgroundSettings);
			create("pre","hohCode","#640064",backgroundSettings);
			create("pre","hohCode","url(https://www.example.com/myBackground.jpg)",backgroundSettings);
			create("p",false,translate("$profileBackground_help2"),backgroundSettings);
			create("pre","hohCode","rgb(100,0,100,0.4)",backgroundSettings);
			create("p",false,translate("$profileBackground_help3"),backgroundSettings);
			create("pre","hohCode","linear-gradient(rgb(var(--color-background),0.8),rgb(var(--color-background),0.8)), url(https://www.example.com/myBackground.jpg) center/100% fixed",backgroundSettings);
			let inputField = create("input",false,false,backgroundSettings);
			inputField.value = useScripts.profileBackgroundValue;
			create("br",false,false,backgroundSettings);
			let backgroundChange = create("button",["hohButton","button"],translate("$button_submit"),backgroundSettings);
			backgroundChange.onclick = function(){
				useScripts.profileBackgroundValue = inputField.value;
				useScripts.save();
				let jsonMatch = (userObject.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
				let profileJson = {};
				if(jsonMatch){
					try{
						profileJson = JSON.parse(atob(jsonMatch[1]))
					}
					catch(e){
						try{
							profileJson = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
						}
						catch(e){
							console.warn(translate("$settings_errorInvalidJSON"))
						}
					}
				}
				profileJson.background = useScripts.profileBackgroundValue;
				if(!profileJson.background){
					delete profileJson["background"]
				}
				//let newDescription = "[](json" + btoa(JSON.stringify(profileJson)) + ")" + (userObject.about.replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/,""));
				let newDescription = "[](json" + LZString.compressToBase64(JSON.stringify(profileJson)) + ")" + ((userObject.about || "").replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/,""));
				authAPIcall(
					`mutation($about: String){
						UpdateUser(about: $about){
							about
						}
					}`,
					{about: newDescription},function(data){
						if(!data){
							return
						}
						deleteCacheItem("hohProfileBackground" + whoAmI)
					}
				)
			};
			hohSettings.appendChild(create("hr"));
		};
		if(useScripts.customCSS && useScripts.accessToken){
			let backgroundSettings = create("div",false,false,hohSettings);
			create("p",false,translate("$settings_CSSadd"),backgroundSettings);
			let inputField = create("textarea",false,false,backgroundSettings,"width: 100%");
			inputField.value = useScripts.customCSSValue;
			if(inputField.value){
				inputField.rows = 10
			}
			else{
				inputField.rows = 4
			}
			create("br",false,false,backgroundSettings);
			create("p",false,translate("$settings_CSSlinkTip"),backgroundSettings);
			let backgroundChange = create("button",["hohButton","button"],translate("$button_submit"),backgroundSettings);
			backgroundChange.onclick = function(){
				useScripts.customCSSValue = inputField.value;
				let jsonMatch = (userObject.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
				let profileJson = {};
				if(jsonMatch){
					try{
						profileJson = JSON.parse(atob(jsonMatch[1]))
					}
					catch(e){
						try{
							profileJson = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
						}
						catch(e){
							console.warn(translate("$settings_errorInvalidJSON"))
						}
					}
				}
				profileJson.customCSS = useScripts.customCSSValue;
				if(!profileJson.customCSS){
					delete profileJson["customCSS"]
				}
				//let newDescription = "[](json" + btoa(JSON.stringify(profileJson)) + ")" + (userObject.about.replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/,""));
				let newDescription = "[](json" + LZString.compressToBase64(JSON.stringify(profileJson)) + ")" + ((userObject.about || "").replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/,""));
				if(newDescription.length > 1e6){
					alert(translate("$cssTooBig"))
				}
				else{
					useScripts.save();
					authAPIcall(
						`mutation($about: String){
							UpdateUser(about: $about){
								about
							}
						}`,
						{about: newDescription},
						function(data){
							if(!data){
								alert("failed to save custom CSS")
							}
							deleteCacheItem("hohProfileBackground" + whoAmI)
						}
					)
				}
			};
			hohSettings.appendChild(create("hr"))
		};
		if(useScripts.customCSS && useScripts.accessToken){
			let pinSettings = create("div",false,false,hohSettings);
			create("p",false,translate("$settings_pinnedActivity"),pinSettings);
			let inputField = create("input",false,false,pinSettings);
			inputField.value = useScripts.pinned;
			inputField.setAttribute("placeholder","activity link");
			create("br",false,false,pinSettings);
			let pinChange = create("button",["hohButton","button"],translate("$button_submit"),pinSettings);
			let hohSpinner = create("span","hohSpinner","",pinSettings);
			pinChange.onclick = function(){
				hohSpinner.innerText = svgAssets.loading;
				hohSpinner.classList.remove("spinnerError");
				hohSpinner.classList.remove("spinnerDone");
				hohSpinner.classList.add("spinnerLoading");
				let activityID = parseInt(inputField.value);
				if(inputField.value !== ""){
					if(!activityID){
						let matches = inputField.value.match(/^https:\/\/anilist\.co\/activity\/(\d+)\/?$/);
						if(matches){
							activityID = parseInt(matches[1])
						}
					}
					if(!activityID){
						alert(translate("$settings_errorInvalidActivity"));
						hohSpinner.innerText = svgAssets.cross;
						hohSpinner.classList.add("spinnerError");
						hohSpinner.classList.remove("spinnerLoading");
						return
					}
					generalAPIcall(
`
query{
	Activity(id: ${activityID}){
		... on ListActivity{
			id
		}
		... on MessageActivity{
			id
		}
		... on TextActivity{
			id
		}
	}
}
`,
						{},
						function(data){
							if(!data){
								hohSpinner.innerText = svgAssets.cross;
								hohSpinner.classList.add("spinnerError");
								hohSpinner.classList.remove("spinnerLoading");
								hohSpinner.classList.remove("spinnerDone");
								alert(translate("$settings_errorInvalidActivity"))
							}
						}
					)
				}
				else{
					activityID = ""
				}
				useScripts.pinned = activityID;
				let jsonMatch = (userObject.about || "").match(/^\[\]\(json([A-Za-z0-9+/=]+)\)/);
				let profileJson = {};
				if(jsonMatch){
					try{
						profileJson = JSON.parse(atob(jsonMatch[1]))
					}
					catch(e){
						try{
							profileJson = JSON.parse(LZString.decompressFromBase64(jsonMatch[1]))
						}
						catch(e){
							hohSpinner.innerText = svgAssets.cross;
							hohSpinner.classList.add("spinnerError");
							hohSpinner.classList.remove("spinnerLoading");
							console.warn(translate("$settings_errorInvalidJSON"));
							return
						}
					}
				}
				profileJson.pinned = useScripts.pinned;
				if(!profileJson.pinned){
					delete profileJson["pinned"]
				}
				let newDescription = "[](json" + LZString.compressToBase64(JSON.stringify(profileJson)) + ")" + ((userObject.about || "").replace(/^\[\]\(json([A-Za-z0-9+/=]+)\)/,""));
				if(newDescription.length > 1e6){
					hohSpinner.innerText = svgAssets.cross;
					hohSpinner.classList.add("spinnerError");
					hohSpinner.classList.remove("spinnerLoading");
					alert(translate("$jsonTooBig"))
				}
				else{
					useScripts.save();
					authAPIcall(
						`mutation($about: String){
							UpdateUser(about: $about){
								about
							}
						}`,
						{about: newDescription},
						function(data){
							if(!data){
								hohSpinner.innerText = svgAssets.cross;
								hohSpinner.classList.add("spinnerError");
								hohSpinner.classList.remove("spinnerLoading");
								alert("failed to save pinned activity")
							}
							else{
								hohSpinner.innerText = svgAssets.check;
								hohSpinner.classList.add("spinnerDone");
								hohSpinner.classList.remove("spinnerLoading");
							}
							deleteCacheItem("hohProfileBackground" + whoAmI)
						}
					)
				}
			};
			hohSettings.appendChild(create("hr"))
		}

		create("p",false,"Delete all custom settings. Re-installing the script will not do that by itself.",hohSettings);
		let cleanEverything= create("button",["hohButton","button","danger"],"Default Settings",hohSettings);
		cleanEverything.onclick = function(){
			localStorage.removeItem("hohSettings");
			window.location.reload(false);
		}
		create("hr","hohSeparator",false,hohSettings);
		let loginURL = create("a",false,translate("$terms_signin_link"),hohSettings,"font-size: x-large;");
		loginURL.href = authUrl;
		loginURL.style.color = "rgb(var(--color-blue))";
		create("p",false,"Enables or improves every module in the \"Login\" tab, improves those greyed out.",hohSettings);
		if(useScripts.accessToken){
			create("hr","hohSeparator",false,hohSettings);
			create("p",false,"Current access token (do not share with others):",hohSettings);
			create("p","hohMonospace",useScripts.accessToken,hohSettings,"word-wrap: anywhere;font-size: small;line-break: anywhere;")
		}

		hohSettings.appendChild(create("hr"));

		let debugInfo = create("button",["hohButton","button"],translate("$settings_button_export"),hohSettings);
		create("p",false,translate("$settings_export_description"),hohSettings);
		create("p",false,translate("$settings_import"),hohSettings);
		let debugImport = create("input","input-file",false,hohSettings);
		debugImport.setAttribute("type","file");
		debugImport.setAttribute("name","json");
		debugImport.setAttribute("accept","application/json");
		debugInfo.onclick = function(){
			let export_settings = JSON.parse(JSON.stringify(useScripts));//deepclone
			if(export_settings.accessToken){//idiot proofing: we don't want users leaking their access tokens
				export_settings.accessToken = "[REDACTED]"
			}
			if(whoAmI){
				saveAs(export_settings,"automail_settings_" + whoAmI + ".json")
			}
			else{
				saveAs(export_settings,"automail_settings.json")
			}
		}
		debugImport.oninput = function(){
			let reader = new FileReader();
			reader.readAsText(debugImport.files[0],"UTF-8");
			reader.onload = function(evt){
				let data;
				try{
					data = JSON.parse(evt.target.result)
				}
				catch(e){
					alert("error parsing JSON")
					return
				}
				if(!data.hasOwnProperty("automailAPI")){//sanity check
					alert("not a settings file")
					return
				}
				Object.keys(data).forEach(//this is to keep the default settings if the version imported is outdated
					key => {
						if(key === "accessToken"){
							if(!useScripts.accessToken && data[key] === "[REDACTED]"){
								alert("Access tokens are not stored in settings files for security reasons. You have to click the 'Sign in with the script' button again")
							}
						}
						else{
							useScripts[key] = data[key]
						}
					}
				)
				useScripts.save();
				alert("settings imported!")
			}
			reader.onerror = function(evt){
				alert("error reading file")
			}
		}
		create("p",false,translate("$debug_tip"),hohSettings);
	}
})
