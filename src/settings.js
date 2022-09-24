//begin "settings.js"
//this is not the code for the settings page! See /src/modules/settingsPage.js for that
try{
	localStorage.setItem("test","test");
	localStorage.removeItem("test");
}
catch(e){
	console.log("LocalStorage, required for saving settings, is not available. " + script_type + " may not work correctly.")
}

const notificationColourDefaults = {
	"ACTIVITY_LIKE":             {"colour":"rgb(250,122,122)","supress":false},
	"ACTIVITY_REPLY_LIKE":       {"colour":"rgb(250,122,122)","supress":false},
	"THREAD_COMMENT_LIKE":       {"colour":"rgb(250,122,122)","supress":false},
	"THREAD_LIKE":               {"colour":"rgb(250,122,122)","supress":false},
	"THREAD_COMMENT_REPLY":      {"colour":"rgb(61,180,242)", "supress":false},
	"ACTIVITY_REPLY":            {"colour":"rgb(61,180,242)", "supress":false},
	"ACTIVITY_MESSAGE":          {"colour":"rgb(123,213,85)", "supress":false},
	"FOLLOWING":                 {"colour":"rgb(123,213,85)", "supress":false},
	"ACTIVITY_MENTION":          {"colour":"rgb(123,213,85)", "supress":false},
	"THREAD_COMMENT_MENTION":    {"colour":"rgb(123,213,85)", "supress":false},
	"THREAD_SUBSCRIBED":         {"colour":"rgb(247,191,99)", "supress":false},
	"ACTIVITY_REPLY_SUBSCRIBED": {"colour":"rgb(247,191,99)", "supress":false},
	"RELATED_MEDIA_ADDITION":    {"colour":"rgb(247,191,99)", "supress":false},
	"MEDIA_DATA_CHANGE":         {"colour":"rgb(247,191,99)", "supress":false},
	"MEDIA_MERGE":               {"colour":"rgb(247,191,99)", "supress":false},
	"MEDIA_DELETION":            {"colour":"rgb(247,191,99)", "supress":false},
	"AIRING":                    {"colour":"rgb(247,191,99)", "supress":false}
};

//this is the legacy way of specifying default modules, use exportModule's isDefault instead.
let useScripts = {
	socialTab: true,
	socialTabFeed: true,
	forumMedia: true,
	staffPages: true,
	completedScore: true,
	droppedScore: false,
	studioFavouriteCount: true,
	CSSfavs: true,
	CSScompactBrowse: true,
	CSSgreenManga: true,
	CSSfollowCounter: true,
	CSSprofileClutter: false,
	CSSdecimalPoint: false,
	CSSverticalNav: false,
	CSSbannerShadow: true,
	CSSdarkDropdown: true,
	hideLikes: false,
	dubMarker: false,
	CSSsmileyScore: true,
	feedCommentFilter: false,
	feedCommentComments: 0,
	feedCommentLikes: 0,
	colourPicker: false,
	colourSettings: [],
	progressBar: false,
	noRewatches: false,
	hideCustomTags: false,
	titlecaseRomaji: false,
	shortRomaji: false,
	replaceNativeTags: true,
	draw3x3: true,
	newChapters: true,
	limitProgress8: false,
	limitProgress10: false,
	tagIndex: true,
	expandRight: false,
	timeToCompleteColumn: false,
	mangaGuess: true,
	settingsTip: true,
	MALscore: false,
	MALserial: false,
	MALrecs: false,
	entryScore: true,
	showRecVotes: true,
	activityTimeline: true,
	browseFilters: true,
	embedHentai: false,
	comparissionPage: true,
	noImagePolyfill: false,
	blockWord: false,
	showMarkdown: true,
	myThreads: false,
	dismissDot: true,
	statusBorder: false,
	moreImports: true,
	plussMinus: true,
	milestones: false,
	allStudios: false,
	termsFeedNoImages: false,
	customCSS: false,
	rightToLeft: false,
	subTitleInfo: false,
	customCSSValue: "",
	pinned: "",
	negativeCustomList: false,
	globalCustomList: false,
	betterListPreview: true,
	previewMaxRows: 4,
	homeScroll: true,
	blockWordValue: "nsfw",
	hideGlobalFeed: false,
	cleanSocial: false,
	SFWmode: false,
	hideAWC: false,
	hideOtherThreads: false,
	forumPreviewNumber: 3,
	profileBackground: true,
	profileBackgroundValue: "inherit",
	viewAdvancedScores: true,
	betterReviewRatings: true,
	notificationColours: notificationColourDefaults,
	staffRoleOrder: "alphabetical",
	titleLanguage: "ROMAJI",
	dubMarkerLanguage: "English",
	accessToken: "",
	comparisionColourFilter: true,
	comparisionSystemFilter: false,
	annoyingAnimations: true,
	navbarDroptext: true,
	browseSubmenu: false,
	reinaDarkEnable: false,
	customDefaultListOrder: "",
	softBlock: [],
	partialLocalisationLanguage: "English"
};

let userObject;
let whoAmI = "";
let whoAmIid = 0;
try{
	userObject = JSON.parse(localStorage.getItem("auth"));
}
catch(err){
	console.warn("could not get userObject")
}
if(userObject){
	whoAmI = userObject.name
	whoAmIid = userObject.id
}
else{
	try{
		whoAmI = document.querySelector(".nav .links .link[href^='/user/']").href.match(/\/user\/(.*)\//)[1]//looks at the navbar
	}
	catch(e){
		console.warn("could not get username")
	}
}

//Script is boneless: enable
//User is mod: enable
//user is hoh: enable
if(script_type !== "Boneless" && userObject && (userObject.donatorTier > 0 && (new Date()).valueOf() > (new Date('2020-09-01T03:24:00')).valueOf()) && userObject.name !== "hoh" && !userObject.moderatorStatus){
	alert("Sorry, " + script_type + " does not work for donators")
	return
}

if(document.hohTypeScriptRunning){
	console.warn("Duplicate script detected. Please make sure you don't have more than one instance of " + script_type + " or similar installed");
	return
}
document.hohTypeScriptRunning = script_type;

let forceRebuildFlag = false;

useScripts.save = function(){
	localStorage.setItem("hohSettings",JSON.stringify(useScripts))
};
const useScriptsSettings = JSON.parse(localStorage.getItem("hohSettings"));
if(useScriptsSettings){
	let keys = Object.keys(useScriptsSettings);
	keys.forEach(//this is to keep the default settings if the version in local storage is outdated
		key => useScripts[key] = useScriptsSettings[key]
	)
}
if(userObject){
	useScripts.titleLanguage = userObject.options.titleLanguage
}
useScripts.save();
//end "settings.js"
