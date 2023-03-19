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
							if(possible.topNode){
								if(elem.textContent.trim() === possible.ofText){
									elem.textContent = translate(possible.replacement,undefined,possible.ofText)
									possible.translated = true
								}
							}
							else{
								if(elem.childNodes[0].textContent.trim() === possible.ofText){
									elem.childNodes[0].textContent = translate(possible.replacement,undefined,possible.ofText)
									possible.translated = true
								}
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
							if(!element.ofText || element.ofText === place.childNodes[element.selectIndex || 0].textContent.trim()){
								place.childNodes[element.selectIndex || 0].textContent = translate(element.replacement)
							}
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
						lookup: ".footer .links [href=\"/forum/thread/2340\"]",
						replacement: "$footer_donate"
					},
					{
						lookup: ".footer [href=\"#\"]",
						replacement: "$footer_logout"
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
				elements: [,
					{
						lookup: ".overview .genre-overview .genre > .name",
						multiple: [
							{
								ofText: "Action",
								replacement: "$genre_action"
							},
							{
								ofText: "Adventure",
								replacement: "$genre_adventure"
							},
							{
								ofText: "Comedy",
								replacement: "$genre_comedy"
							},
							{
								ofText: "Drama",
								replacement: "$genre_drama"
							},
							{
								ofText: "Ecchi",
								replacement: "$genre_ecchi"
							},
							{
								ofText: "Fantasy",
								replacement: "$genre_fantasy"
							},
							{
								ofText: "Horror",
								replacement: "$genre_horror"
							},
							{
								ofText: "Mahou Shoujo",
								replacement: "$genre_mahouShoujo"
							},
							{
								ofText: "Mecha",
								replacement: "$genre_mecha"
							},
							{
								ofText: "Music",
								replacement: "$genre_music"
							},
							{
								ofText: "Mystery",
								replacement: "$genre_mystery"
							},
							{
								ofText: "Psychological",
								replacement: "$genre_psychological"
							},
							{
								ofText: "Romance",
								replacement: "$genre_romance"
							},
							{
								ofText: "Hentai",//does this show up on profiles?
								replacement: "$genre_hentai"
							}
						]
					}
				]
			},
			{
				regex: /\/user\/([^/]+)\/?/,
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
				regex: /\.co\/(manga|anime)\/\d+\/.*\/stats\/?/,
				elements: [
					{
						lookup: ".media-stats .status-distribution > h2",
						replacement: "$submenu_statusDistribution"
					},
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
						lookup: ".overview .relations > h2",
						replacement: "$submenu_relations"
					},
					{
						lookup: ".overview .status-distribution > h2",
						replacement: "$submenu_statusDistribution"
					},
					{
						lookup: ".overview .trailer > h2",
						replacement: "$submenu_trailer"
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
						lookup: ".sidebar .review.button:not(.edit) span",
						replacement: "$button_review"
					},
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Add to List",
						replacement: capitalize(translate("$mediaStatus_not"))
					},
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Dropped",
						replacement: capitalize(translate("$mediaStatus_dropped"))
					}
				]
			},
			{
				regex: /\.co\/anime\//,
				elements: [
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Watching",
						replacement: capitalize(translate("$mediaStatus_watching"))
					},
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Completed",
						replacement: capitalize(translate("$mediaStatus_completedWatching"))
					},
					{
						lookup: ".sidebar .data-set .type",
						multiple: [
							{
								ofText: "Format",
								replacement: "$dataSet_format"
							},
							{
								ofText: "Episodes",
								replacement: "$dataSet_episodes"
							},
							{
								ofText: "Episode\n\t\t\tDuration",
								topNode: true,
								replacement: "$dataSet_episodeDuration"
							},
							{
								ofText: "Duration",
								replacement: "$dataSet_duration"
							},
							{
								ofText: "Status",
								replacement: "$dataSet_status"
							},
							{
								ofText: "Start Date",
								replacement: "$dataSet_startDate"
							},
							{
								ofText: "End Date",
								replacement: "$dataSet_endDate"
							},
							{
								ofText: "Release Date",
								replacement: "$dataSet_releaseDate"
							},
							{
								ofText: "Season",
								replacement: "$dataSet_season"
							},
							{
								ofText: "Average Score",
								replacement: "$dataSet_averageScore"
							},
							{
								ofText: "Mean Score",
								replacement: "$dataSet_meanScore"
							},
							{
								ofText: "Popularity",
								replacement: "$dataSet_popularity"
							},
							{
								ofText: "Favorites",
								replacement: "$dataSet_favorites"
							},
							{
								ofText: "Studios",
								replacement: "$dataSet_studios"
							},
							{
								ofText: "Producers",
								replacement: "$dataSet_producers"
							},
							{
								ofText: "Source",
								replacement: "$dataSet_source"
							},
							{
								ofText: "Hashtag",
								replacement: "$dataSet_hashtag"
							},
							{
								ofText: "Genres",
								replacement: "$dataSet_genres"
							},
							{
								ofText: "Romaji",
								replacement: "$dataSet_romaji"
							},
							{
								ofText: "English",
								replacement: "$dataSet_english"
							},
							{
								ofText: "Native",
								replacement: "$dataSet_native"
							},
							{
								ofText: "Synonyms",
								replacement: "$dataSet_synonyms"
							}
						]
					}
				]
			},
			{
				regex: /\.co\/manga\//,
				elements: [
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Reading",
						replacement: capitalize(translate("$mediaStatus_reading"))
					},
					{
						lookup: ".media .header .actions .list .add",
						ofText: "Completed",
						replacement: capitalize(translate("$mediaStatus_completedReading"))
					},
					{
						lookup: ".sidebar .data-set .type",
						multiple: [
							{
								ofText: "Format",
								replacement: "$dataSet_format"
							},
							{
								ofText: "Chapters",
								replacement: "$dataSet_chapters"
							},
							{
								ofText: "Volumes",
								replacement: "$dataSet_volumes"
							},
							{
								ofText: "Status",
								replacement: "$dataSet_status"
							},
							{
								ofText: "Start Date",
								replacement: "$dataSet_startDate"
							},
							{
								ofText: "End Date",
								replacement: "$dataSet_endDate"
							},
							{
								ofText: "Average Score",
								replacement: "$dataSet_averageScore"
							},
							{
								ofText: "Mean Score",
								replacement: "$dataSet_meanScore"
							},
							{
								ofText: "Popularity",
								replacement: "$dataSet_popularity"
							},
							{
								ofText: "Favorites",
								replacement: "$dataSet_favorites"
							},
							{
								ofText: "Source",
								replacement: "$dataSet_source"
							},
							{
								ofText: "Hashtag",
								replacement: "$dataSet_hashtag"
							},
							{
								ofText: "Genres",
								replacement: "$dataSet_genres"
							},
							{
								ofText: "Romaji",
								replacement: "$dataSet_romaji"
							},
							{
								ofText: "English",
								replacement: "$dataSet_english"
							},
							{
								ofText: "Native",
								replacement: "$dataSet_native"
							},
							{
								ofText: "Synonyms",
								replacement: "$dataSet_synonyms"
							}
						]
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
						lookup: ".filters-wrap [placeholder='Format']",
						textType: "placeholder",
						replacement: "$editor_format"
					},
					{
						lookup: ".filters-wrap [placeholder='Status']",
						textType: "placeholder",
						replacement: "$editor_status"
					},
					{
						lookup: ".filters-wrap [placeholder='Country']",
						textType: "placeholder",
						replacement: "$editor_country"
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
				regex: /\/activity\//,
				elements: [
					{
						lookup: "[placeholder='Write a reply...']",
						textType: "placeholder",
						replacement: "$placeholder_reply"
					}
				]
			},
			{
				regex: /\/search\//,
				elements: [
					{
						lookup: ".primary-filters .filter-select > .name",
						multiple: [
							{
								ofText: "Search",
								replacement: "$filters_search"
							},
							{
								ofText: "genres",
								replacement: "$filters_genres"
							},
							{
								ofText: "year",
								replacement: "$filters_year"
							},
							{
								ofText: "format",
								replacement: "$filters_format"
							},
							{
								ofText: "country of origin",
								replacement: "$filters_countryOfOrigin"
							}
						]
					}
				]
			},
			{
				regex: /\/search\/anime/,
				elements: [
					{
						lookup: ".primary-filters .filter-select > .name",
						multiple: [
							{
								ofText: "season",
								replacement: "$filters_season"
							},
							{
								ofText: "airing status",
								replacement: "$filters_airingStatus"
							}
						]
					}
				]
			},
			{
				regex: /\/search\/anime\/?$/,
				elements: [
					{
						lookup: ".search-landing h3",
						multiple: [
							{
								ofText: "Trending now",
								replacement: "$searchLanding_trending"
							},
							{
								ofText: "Popular this season",
								replacement: "$searchLanding_popularSeason"
							},
							{
								ofText: "Upcoming next season",
								replacement: "$searchLanding_nextSeason"
							},
							{
								ofText: "All time popular",
								replacement: "$searchLanding_popular"
							},
							{
								ofText: "Top 100 Anime",
								replacement: "$searchLanding_topAnime"
							}
						]
					}
				]
			},
			{
				regex: /\/search\/manga/,
				elements: [
					{
						lookup: ".primary-filters .filter-select > .name",
						multiple: [
							{
								ofText: "publishing status",
								replacement: "$filters_publishingStatus"
							}
						]
					}
				]
			},
			{
				regex: /co\/staff\/?/,
				elements: [
					{
						lookup: ".description-wrap .data-point .label",
						multiple: [
							{
								ofText: "Birth:",
								replacement: "$staffData_birth"
							},
							{
								ofText: "Death:",
								replacement: "$staffData_death"
							},
							{
								ofText: "Age:",
								replacement: "$staffData_age"
							},
							{
								ofText: "Gender:",
								replacement: "$staffData_gender"
							},
							{
								ofText: "Years active:",
								replacement: "$staffData_yearsActive"
							},
							{
								ofText: "Hometown:",
								replacement: "$staffData_hometown"
							},
							{
								ofText: "Blood Type:",
								replacement: "$staffData_bloodType"
							},
							{
								ofText: "Circle:",
								replacement: "$staffData_circle"
							},
							{
								ofText: "Residency:",
								replacement: "$staffData_residency"
							},
							{
								ofText: "Graduated:",
								replacement: "$staffData_graduated"
							}
						]
					}
				]
			},
			{
				regex: /co\/character\/?/,
				elements: [
					{
						lookup: ".description-wrap .data-point .label",
						multiple: [
							{
								ofText: "Birthday:",
								replacement: "$staffData_birthday_DUPLICATE"
							},
							{
								ofText: "Death:",
								replacement: "$staffData_death"
							},
							{
								ofText: "Age:",
								replacement: "$staffData_age"
							},
							{
								ofText: "Gender:",
								replacement: "$staffData_gender"
							},
							{
								ofText: "Hometown:",
								replacement: "$staffData_hometown"
							},
							{
								ofText: "Blood Type:",
								replacement: "$staffData_bloodType"
							}
						]
					}
				]
			},
			{
				regex: /\/forum\/?(overview|recent)?\/?$/,
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
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=7']",
						replacement: "$forumCategory_7"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=1']",
						replacement: "$forumCategory_1"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=2']",
						replacement: "$forumCategory_2"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=5']",
						replacement: "$forumCategory_5"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=13']",
						replacement: "$forumCategory_13"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=8']",
						replacement: "$forumCategory_8"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=9']",
						replacement: "$forumCategory_9"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=10']",
						replacement: "$forumCategory_10"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=4']",
						replacement: "$forumCategory_4"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=3']",
						replacement: "$forumCategory_3"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=16']",
						replacement: "$forumCategory_16"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=15']",
						replacement: "$forumCategory_15"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=11']",
						replacement: "$forumCategory_11"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=12']",
						replacement: "$forumCategory_12"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=18']",
						replacement: "$forumCategory_18"
					},
					{
						lookup: ".filter-group [href='/forum/recent?category=17']",
						replacement: "$forumCategory_17"
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
