exportModule({
	id: "additionalTranslation",
	description: "$additionalTranslation_description",
	extendedDescription: `Use "Automail language" to translate some native parts of the site too`,
	isDefault: true,//logic: if translation is turned on, it should be comprehensive. Turning *off* parts of it should be the active opt
	importance: 0,
	categories: ["Script","Newly Added"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return useScripts.partialLocalisationLanguage !== "English"
	},
	code: function(){
		let times = [100,200,400,1000,2000,3000,5000,7000,10000,15000];
		let caller = function(url,element,counter){
			if(!document.URL.match(url)){
				return
			}
			if(element.multiple){
				let place = document.querySelectorAll(element.lookup);
				if(place){
					Array.from(place).forEach(elem => {
						element.multiple.forEach(possible => {
							if(elem.childNodes[0].textContent.trim() === possible.ofText){
								elem.childNodes[0].textContent = translate(possible.replacement)
								possible.translated = true
							}
						})
					})
					if(counter < times.length && !element.multiple.every(possible => possible.translated)){
						setTimeout(function(){
							caller(url,element,counter + 1)
						},times[counter])
					}
				}
				else if(counter < times.length){
					setTimeout(function(){
						caller(url,element,counter + 1)
					},times[counter])
				}
			}
			else{
				let place = document.querySelector(element.lookup);
				if(place){
					if(element.textType === "placeholder"){
						place.placeholder = translate(element.replacement)
					}
					else{
						if(place.childNodes[element.selectIndex || 0]){
							place.childNodes[element.selectIndex || 0].textContent = translate(element.replacement)
						}
						else{
							console.warn("translation key failed", element, place)
						}
					}
				}
				else if(counter < times.length){
					setTimeout(function(){
						caller(url,element,counter + 1)
					},times[counter])
				}
			}
		};
		[
			{
				regex: /./,
				elements: [
					{
						lookup: ".theme-selector > h2",
						replacement: "$footer_siteTheme"
					},
					{
						lookup: ".footer [href=\"https://submission-manual.anilist.co/\"]",
						replacement: "$footer_addData"
					},
					{
						lookup: ".footer [href=\"/moderators\"]",
						replacement: "$footer_moderators"
					},
					{
						lookup: ".footer [href=\"mailto:contact@anilist.co\"]",
						replacement: "$footer_contact"
					},
					{
						lookup: ".footer [href=\"/terms\"]",
						replacement: "$footer_terms"
					},
					{
						lookup: ".footer .links [href=\"/apps\"]",
						replacement: "$footer_apps"
					},
					{
						lookup: ".footer [href=\"/sitemap/index.xml\"]",
						replacement: "$footer_siteMap"
					},
					{
						lookup: ".footer [href=\"/site-stats\"]",
						replacement: "$stats_siteStats_title"
					},
					{
						lookup: ".footer .links [href=\"/recommendations\"]",
						replacement: "$submenu_recommendations"
					},
					{
						lookup: ".footer .links [href=\"https://github.com/AniList/ApiV2-GraphQL-Docs\"]",
						replacement: "$footer_api"
					},
					{
						lookup: "#nav .quick-search input",
						textType: "placeholder",
						replacement: "$placeholder_searchAnilist"
					},
					{
						lookup: "#nav .quick-search .hint",
						replacement: "$search_hint"
					}
				]
			},
			{
				regex: /\/user\/([^/]+)\/?$/,
				elements: [
					{
						lookup: ".activity-edit .el-textarea__inner",
						textType: "placeholder",
						replacement: "$placeholder_status"
					},
					{
						lookup: ".activity-feed-wrap h2.section-header",
						replacement: "$feed_header"
					},
					{
						lookup: ".activity-feed-wrap .load-more",
						replacement: "$load_more"
					},
					{
						lookup: ".activity-feed-wrap ul li:nth-child(1)",
						selectIndex: 1,
						replacement: "$feedSelect_all"
					},
					{
						lookup: ".activity-feed-wrap ul li:nth-child(2)",
						selectIndex: 1,
						replacement: "$feedSelect_status"
					},
					{
						lookup: ".activity-feed-wrap ul li:nth-child(3)",
						selectIndex: 1,
						replacement: "$feedSelect_message"
					},
					{
						lookup: ".activity-feed-wrap ul li:nth-child(4)",
						selectIndex: 1,
						replacement: "$feedSelect_list"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 0,
						replacement: "$menu_overview"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 2,
						replacement: "$menu_animelist"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 4,
						replacement: "$menu_mangalist"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 6,
						replacement: "$submenu_favourites"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 8,
						replacement: "$submenu_stats"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 10,
						replacement: "$submenu_social"
					},
					{
						lookup: ".user .nav.container",
						selectIndex: 12,
						replacement: "$submenu_reviews"
					},
					{
						lookup: ".user .nav.container [href$=submissions]",
						replacement: "$submenu_submissions"
					},
					{
						lookup: ".user .overview h2.section-header",
						multiple: [
							{
								ofText: "characters",
								replacement: "$submenu_characters"
							},
							{
								ofText: "Activity History",
								replacement: "$heading_activityHistory"
							},
							{
								ofText: "Genre Overview",
								replacement: "$heading_genreOverview"
							},
							{
								ofText: "staff",
								replacement: "$submenu_staff"
							},
							{
								ofText: "studios",
								replacement: "$submenu_studios"
							}
						]
					}
				]
			},
			{
				regex: /\.co\/forum\/thread\/\d+\/comment\//,
				elements: [
					{
						lookup: ".comments-header a",
						replacement: "$forum_singleThread"
					}
				]
			},
			{
				regex: /\.co\/notifications/,
				elements: [
					{
						lookup: ".notifications-feed .filter-group div.link",
						multiple: [
							{
								ofText: "All",
								replacement: "$notifications_all"
							},
							{
								ofText: "Airing",
								replacement: "$notifications_airing"
							},
							{
								ofText: "Activity",
								replacement: "$notifications_activity"
							},
							{
								ofText: "Forum",
								replacement: "$notifications_forum"
							},
							{
								ofText: "Follows",
								replacement: "$notifications_follows"
							},
							{
								ofText: "Media",
								replacement: "$notifications_media"
							}
						]
					}
				]
			},
			{
				regex: /\.co\/(manga|anime)\//,
				elements: [
					{
						lookup: ".media .nav",
						selectIndex: 0,
						replacement: "$menu_overview"
					},
					{
						lookup: ".media .nav [href$=characters]",
						replacement: "$submenu_characters"
					},
					{
						lookup: ".media .nav [href$=staff]",
						replacement: "$submenu_staff"
					},
					{
						lookup: ".media .nav [href$=reviews]",
						replacement: "$submenu_reviews"
					},
					{
						lookup: ".media .nav [href$=stats]",
						replacement: "$submenu_stats"
					},
					{
						lookup: ".media .nav [href$=social]",
						replacement: "$submenu_social"
					},
					{
						lookup: ".overview .characters > h2",
						replacement: "$submenu_characters"
					},
					{
						lookup: ".overview .staff > h2",
						replacement: "$submenu_staff"
					},
					{
						lookup: ".overview .recommendations > h2",
						replacement: "$submenu_recommendations"
					},
					{
						lookup: ".overview .reviews > h2",
						replacement: "$submenu_reviews"
					},
					{
						lookup: ".sidebar .review.button span",
						replacement: "$button_review"
					}
				]
			},
			{
				regex: /\/user\/([^/]+)\/(animelist|mangalist)\/?/,
				elements: [
					{
						lookup: ".filters-wrap [placeholder='Filter']",
						textType: "placeholder",
						replacement: "$mediaList_filter"
					},
					{
						lookup: ".filters-wrap [placeholder='Genres']",
						textType: "placeholder",
						replacement: "$stats_genre"
					},
					{
						lookup: ".filters .filter-group .group-header",
						multiple: [
							{
								ofText: "Lists",
								replacement: "$filters_lists"
							},
							{
								ofText: "Filters",
								replacement: "$filters"
							},
							{
								ofText: "Year",
								replacement: "$filters_year"
							},
							{
								ofText: "Sort",
								replacement: "$staff_sort"
							}
						]
					},
					{
						lookup: ".filters .filter-group > span",
						multiple: [
							{
								ofText: "all",
								replacement: "$mediaStatus_all"
							},
							{
								ofText: "Watching",
								replacement: "$mediaStatus_watching"
							},
							{
								ofText: "Reading",
								replacement: "$mediaStatus_reading"
							},
							{
								ofText: "Rewatching",
								replacement: "$mediaStatus_rewatching"
							},
							{
								ofText: "Rereading",
								replacement: "$mediaStatus_rereading"
							},
							{
								ofText: "Completed",
								replacement: "$mediaStatus_completed"
							},
							{
								ofText: "Paused",
								replacement: "$mediaStatus_paused"
							},
							{
								ofText: "Dropped",
								replacement: "$mediaStatus_dropped"
							},
							{
								ofText: "Planning",
								replacement: "$mediaStatus_planning"
							}
						]
					}
				]
			},
			{
				regex: /\/home\/?$/,
				elements: [
					{
						lookup: ".activity-edit .el-textarea__inner",
						textType: "placeholder",
						replacement: "$placeholder_status"
					},
					{
						lookup: ".activity-feed-wrap h2.section-header",
						replacement: "$feed_header"
					},
					{
						lookup: ".activity-feed-wrap .load-more",
						replacement: "$load_more"
					},
					{
						lookup: ".feed-select ul li:nth-child(1)",
						selectIndex: 1,
						replacement: " " + translate("$feedSelect_all") + " "
					},
					{
						lookup: ".feed-select ul li:nth-child(2)",
						selectIndex: 1,
						replacement: " " + translate("$feedSelect_text") + " "
					},
					{
						lookup: ".feed-select ul li:nth-child(3)",
						selectIndex: 1,
						replacement: " " + translate("$feedSelect_list") + " "
					},
					{
						lookup: ".feed-select .feed-type-toggle div:nth-child(1)",
						replacement: "$filter_following"
					},
					{
						lookup: ".feed-select .feed-type-toggle div:nth-child(2)",
						replacement: "$terms_option_global"
					},
					{
						lookup: ".list-preview-wrap .section-header h2",
						multiple: [
							{
								ofText: "Manga in Progress",
								replacement: "$preview_mangaSection_title"
							},
							{
								ofText: "Anime in Progress",
								replacement: "$preview_animeSection_title"
							}
						]
					}
					//see also: middleClickLinkFixer.js
				]
			},
			{
				regex: /\/reviews\/?$/,
				elements: [
					{
						lookup: ".load-more",
						replacement: "$load_more"
					}
				]
			},
			{
				regex: /\/forum\/(overview|recent)\/?$/,
				elements: [
					{
						lookup: ".overview-header[href='/forum/recent']",
						replacement: "$forumHeading_recentlyActive"
					},
					{
						lookup: ".overview-header[href='/forum/recent?category=5']",
						replacement: "$forumHeading_releaseDiscussion"
					},
					{
						lookup: ".overview-header[href='/forum/new']",
						replacement: "$forumHeading_newThreads"
					}
				]
			},
		].forEach(matchset => {
			if(document.URL.match(matchset.regex)){
				matchset.elements.forEach(element => {
					caller(matchset.regex,element,0)
				})
			}
		})
	}
})

function editor_translate(editor){
	let times = [100,200,400,1000,2000,3000,5000,7000,10000,15000];
	let caller = function(element,counter){
		if(element.multiple){
			let place = editor.querySelectorAll(element.lookup);
			if(place){
				Array.from(place).forEach(elem => {
					element.multiple.forEach(possible => {
						if(elem.childNodes[0].textContent.trim() === possible.ofText){
							elem.childNodes[0].textContent = translate(possible.replacement)
							possible.translated = true
						}
					})
				})
				if(counter < times.length && !element.multiple.every(possible => possible.translated)){
					setTimeout(function(){
						caller(url,element,counter + 1)
					},times[counter])
				}
			}
			else if(counter < times.length){
				setTimeout(function(){
					caller(element,counter + 1)
				},times[counter])
			}
		}
		else{
			let place = editor.querySelector(element.lookup);
			if(place){
				if(element.textType === "placeholder"){
					place.placeholder = translate(element.replacement)
				}
				else{
					if(place.childNodes[element.selectIndex || 0]){
						place.childNodes[element.selectIndex || 0].textContent = translate(element.replacement)
					}
					else{
						console.warn("editor translation key failed", element, place)
					}
				}
			}
			else if(counter < times.length){
				setTimeout(function(){
					caller(element,counter + 1)
				},times[counter])
			}
		}
	};
	[
		{
			elements: [
				{
					lookup: ".form.status > .input-title",
					replacement: "$editor_status"
				},
				{
					lookup: ".form.score > .input-title",
					replacement: "$editor_score"
				},
				{
					lookup: ".form.progress > .input-title",
					replacement: "$editor_progress"
				},
				{
					lookup: ".form.start > .input-title",
					replacement: "$editor_startDate"
				},
				{
					lookup: ".form.finish > .input-title",
					replacement: "$editor_finishDate"
				},
				{
					lookup: ".form.notes > .input-title",
					replacement: "$editor_notes"
				},
				{
					lookup: ".manga .form.repeat > .input-title",
					replacement: "$editor_mangaRepeat"
				},
				{
					lookup: ".manga .form.volumes > .input-title",
					replacement: "$editor_volumes"
				},
				{
					lookup: ".anime .form.repeat > .input-title",
					replacement: "$editor_animeRepeat"
				},
				{
					lookup: ".save-btn",
					replacement: "$button_save"
				},
				{
					lookup: ".delete-btn",
					replacement: "$button_delete"
				},
				{
					lookup: ".custom-lists > .input-title",
					replacement: "$editor_customLists"
				},
				{
					lookup: ".custom-lists ~ .checkbox .el-checkbox__label",
					multiple: [
						{
							ofText: "Hide from status lists",
							replacement: "$editor_hideFromStatusLists"
						},
						{
							ofText: "Private",
							replacement: "$editor_private"
						}
					]
				},
				{
					lookup: ".status .el-input__inner",
					textType: "placeholder",
					replacement: "$editor_statusPlaceholder"
				},
				{
					lookup: ".anime .status .el-select-dropdown__item span",
					multiple: [
						{
							ofText: "Watching",
							replacement: capitalize(translate("$mediaStatus_watching"))
						},
						{
							ofText: "Plan to watch",
							replacement: capitalize(translate("$mediaStatus_planningAnime"))
						},
						{
							ofText: "Completed",
							replacement: capitalize(translate("$mediaStatus_completedWatching"))
						},
						{
							ofText: "Rewatching",
							replacement: capitalize(translate("$mediaStatus_rewatching"))
						},
						{
							ofText: "Paused",
							replacement: capitalize(translate("$mediaStatus_paused"))
						},
						{
							ofText: "Dropped",
							replacement: capitalize(translate("$mediaStatus_dropped"))
						},
					]
				},
				{
					lookup: ".manga .status .el-select-dropdown__item span",
					multiple: [
						{
							ofText: "Reading",
							replacement: capitalize(translate("$mediaStatus_reading"))
						},
						{
							ofText: "Plan to read",
							replacement: capitalize(translate("$mediaStatus_planningManga"))
						},
						{
							ofText: "Completed",
							replacement: capitalize(translate("$mediaStatus_completedReading"))
						},
						{
							ofText: "Rereading",
							replacement: capitalize(translate("$mediaStatus_rereading"))
						},
						{
							ofText: "Paused",
							replacement: capitalize(translate("$mediaStatus_paused"))
						},
						{
							ofText: "Dropped",
							replacement: capitalize(translate("$mediaStatus_dropped"))
						},
					]
				},
			]
		},
	].forEach(matchset => {
		matchset.elements.forEach(element => {
			caller(element,0)
		})
	})
}
