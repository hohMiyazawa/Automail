function betterListPreview(){
	if(window.screen.availWidth && window.screen.availWidth <= 1040){
		return
	}
	let errorHandler = function(e){
		console.error(e);
		console.warn("Alternative list preview failed. Trying to bring back the native one");
		let hohListPreviewToRemove = document.getElementById("hohListPreview");
		if(hohListPreviewToRemove){
			hohListPreviewToRemove.remove()
		};
		document.querySelectorAll(".list-preview-wrap").forEach(wrap => {
			wrap.style.display = "block"
		})
	}
	try{//it's complex, and could go wrong. Furthermore, we want a specific behavour when it fails, namely bringing back the native preview
	let hohListPreview = document.getElementById("hohListPreview");
	if(hohListPreview){
		return
	};
	let buildPreview = function(data,overWrite){try{
		if(!data){
			return
		}
		if(!hohListPreview){
			overWrite = true;
			let listPreviews = document.querySelectorAll(".list-previews h2");
			if(!listPreviews.length){
				setTimeout(function(){buildPreview(data)},200);
				return
			};
			hohListPreview = create("div","#hohListPreview");
			listPreviews[0].parentNode.parentNode.parentNode.parentNode.insertBefore(hohListPreview,listPreviews[0].parentNode.parentNode.parentNode);
			listPreviews.forEach(heading => {
				if(!heading.innerText.includes("Manga")){
					heading.parentNode.parentNode.style.display = "none";
				}
			})
		};
		if(overWrite){
			let mediaLists = data.data.Page.mediaList.map((mediaList,index) => {
				mediaList.index = index;
				if(aliases.has(mediaList.media.id)){
					mediaList.media.title.userPreferred = aliases.get(mediaList.media.id)
				}
				return mediaList
			});
			let notAiring = mediaLists.filter(
				mediaList => !mediaList.media.nextAiringEpisode
			)
			let airing = mediaLists.filter(
				mediaList => mediaList.media.nextAiringEpisode
			).map(
				mediaList => {
					mediaList.points = 100/(mediaList.index + 1) + mediaList.priority/10 + (mediaList.scoreRaw || 60)/10;
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
						mediaList.points -= 100/(mediaList.index + 1);
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 1;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*3){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 2;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*1){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 3;
						}
					}
					if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*10){
						mediaList.points += 1;
						if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1){
							mediaList.points += 5;
						}
						else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
							mediaList.points += 2;
						}
					}
					if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2){
						mediaList.points += 7;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 3;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 3;
							}
						}
					}
					else if(mediaList.progress === mediaList.media.nextAiringEpisode.episode - 3){
						mediaList.points += 2;
						if(mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7){
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*3){
								mediaList.points += 1;
							}
							if(mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*7 - 60*60*1){
								mediaList.points += 1;
							}
						}
					}
					return mediaList;
				}
			).sort(
				(b,a) => a.points - b.points
			);
			let airingImportant = mediaLists.filter(
				(mediaList,index) => mediaList.media.nextAiringEpisode && (
					index < 20
					|| mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*4
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*12
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 1
					)
					|| (
						mediaList.media.nextAiringEpisode.timeUntilAiring > 60*60*24*6
						&& mediaList.media.nextAiringEpisode.timeUntilAiring < 60*60*24*7
						&& mediaList.progress === mediaList.media.nextAiringEpisode.episode - 2
					)
				)
			).length;
			if(airingImportant > 3){
				airingImportant = Math.min(5*Math.ceil((airingImportant - 1)/5),airing.length)
			}
			removeChildren(hohListPreview)
			let drawSection = function(list,name,moveExpander){
				let airingSection = create("div","list-preview-wrap",false,hohListPreview,"margin-bottom: 20px;");
				let airingSectionHeader = create("div","section-header",false,airingSection);
				if(name === "Airing"){
					create("a","asHeading",name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
						.href = "https://anilist.co/airing"
				}
				else{
					create("h2",false,name,airingSectionHeader,"font-size: 1.4rem;font-weight: 500;")
				};
				if(moveExpander && document.querySelector(".size-toggle")){
					airingSectionHeader.appendChild(document.querySelector(".size-toggle"))
				};
				let airingListPreview = create("div","list-preview",false,airingSection,"display:grid;grid-template-columns: repeat(5,85px);grid-template-rows: repeat(auto-fill,115px);grid-gap: 20px;padding: 20px;background: rgb(var(--color-foreground));");
				list.forEach((air,index) => {
					let card = create("div",["media-preview-card","small","hohFallback"],false,airingListPreview,"width: 85px;height: 115px;background: rgb(var(--color-foreground));border-radius: 3px;display: inline-grid;");
					if(air.media.coverImage.color){
						card.style.backgroundColor = air.media.coverImage.color
					};
					if((index % 5 > 1) ^ useScripts.rightToLeft){
						card.classList.add("info-left")
					};
					let cover = create("a","cover",false,card,"background-position: 50%;background-repeat: no-repeat;background-size: cover;text-align: center;border-radius: 3px;");
					cover.style.backgroundImage = "url(\"" + air.media.coverImage.large + "\")";
					cover.href = "/anime/" + air.media.id + "/" + safeURL(air.media.title.userPreferred);
					if(air.media.nextAiringEpisode){
						let imageText = create("div","image-text",false,cover,"background: rgba(var(--color-overlay),.7);border-radius: 0 0 3px 3px;bottom: 0;color: rgba(var(--color-text-bright),.91);display: inline-block;font-weight: 400;left: 0;letter-spacing: .2px;margin-bottom: 0;position: absolute;transition: .3s;width: 100%;font-size: 1.1rem;line-height: 1.2;padding: 8px;");
						let imageTextWrapper = create("div","countdown",false,imageText);
						let createCountDown = function(){
							removeChildren(imageTextWrapper)
							create("span",false,"Ep " + air.media.nextAiringEpisode.episode,imageTextWrapper);
							create("br",false,false,imageTextWrapper);
							if(air.media.nextAiringEpisode.timeUntilAiring <= 0){
								create("span",false,"Recently aired",imageTextWrapper);
								return;
							};
							let days = Math.floor(air.media.nextAiringEpisode.timeUntilAiring/(60*60*24));
							let hours = Math.floor((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24))/3600);
							let minutes = Math.round((air.media.nextAiringEpisode.timeUntilAiring - days*(60*60*24) - hours*3600)/60);
							if(minutes === 60){
								hours++;
								minutes = 0;
								if(hours === 24){
									days++;
									hours = 0;
								}
							};
							if(days){
								create("span",false,days + "d ",imageTextWrapper)
							}
							if(hours){
								create("span",false,hours + "h ",imageTextWrapper)
							}
							if(minutes){
								create("span",false,minutes + "m",imageTextWrapper)
							}
							setTimeout(function(){
								air.media.nextAiringEpisode.timeUntilAiring -= 60;
								createCountDown();
							},60*1000);
						};createCountDown();
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							create("div","behind-accent",false,imageText,"background: rgb(var(--color-red));border-radius: 0 0 2px 2px;bottom: 0;height: 5px;left: 0;position: absolute;transition: .2s;width: 100%;")
						}
					}
					let imageOverlay = create("div","image-overlay",false,cover);
					let plusProgress = create("div","plus-progress",air.progress + " +",imageOverlay);
					let content = create("div","content",false,card);
					if(air.media.nextAiringEpisode){
						const behind = air.media.nextAiringEpisode.episode - 1 - air.progress;
						if(behind > 0){
							let infoHeader = create("div","info-header",false,content,"color: rgb(var(--color-blue));font-size: 1.2rem;font-weight: 500;margin-bottom: 8px;");
							if(behind > 1){
								create("div",false,translate("$preview_Mbehind",behind),infoHeader)
							}
							else{
								create("div",false,translate("$preview_1behind"),infoHeader)
							}
						}
					}
					let title = create("a","title",air.media.title.userPreferred,content,"font-size: 1.4rem;");
					let info = create("div",["info","hasMeter"],false,content,"bottom: 12px;color: rgb(var(--color-text-lighter));font-size: 1.2rem;left: 12px;position: absolute;");
					let pBar;
					if(air.media.episodes && useScripts.progressBar){
						pBar = create("meter",false,false,info);
						pBar.value = air.progress;
						pBar.min = 0;
						pBar.max = air.media.episodes;
						if(air.media.nextAiringEpisode){
							pBar.low = air.media.nextAiringEpisode.episode - 2;
							pBar.high = air.media.nextAiringEpisode.episode - 1;
							pBar.optimum = air.media.nextAiringEpisode.episode - 1;
						}
					};
					let progress = create("div",false,translate("$preview_progress") + " " + air.progress + (air.media.episodes ? "/" + air.media.episodes : ""),info);
					let isBlocked = false;
					plusProgress.onclick = function(e){
						if(isBlocked){
							return
						};
						if(air.media.episodes){
							if(air.progress < air.media.episodes){
								if(useScripts.progressBar){
									pBar.value++;
								}
								air.progress++;
								progress.innerText = "Progress: " + air.progress + (air.media.episodes ? "/" + air.media.episodes : "");
								isBlocked = true;
								setTimeout(function(){
									plusProgress.innerText = air.progress + " +";
									isBlocked = false;
								},300);
								if(air.progress === air.media.episodes){
									progress.innerText += " Completed";
									if(air.status === "REWATCHING"){//don't overwrite the existing end date
										authAPIcall(
											`mutation($progress: Int,$id: Int){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED){id}
											}`,
											{id: air.id,progress: air.progress},
											data => {}
										);
									}
									else{
										authAPIcall(
											`mutation($progress: Int,$id: Int,$date:FuzzyDateInput){
												SaveMediaListEntry(progress: $progress,id:$id,status:COMPLETED,completedAt:$date){id}
											}`,
											{
												id: air.id,
												progress: air.progress,
												date: {
													year: (new Date()).getUTCFullYear(),
													month: (new Date()).getUTCMonth() + 1,
													day: (new Date()).getUTCDate(),
												}
											},
											data => {}
										);
									}
								}
								else{
									authAPIcall(
										`mutation($progress: Int,$id: Int){
											SaveMediaListEntry(progress: $progress,id:$id){id}
										}`,
										{id: air.id,progress: air.progress},
										data => {}
									);
								}
								localStorage.setItem("hohListPreview",JSON.stringify(data));
							}
						}
						else{
							air.progress++;
							plusProgress.innerText = air.progress + " +";
							progress.innerText = "Progress: " + air.progress;
							isBlocked = true;
							setTimeout(function(){
								plusProgress.innerText = air.progress + " +";
								progress.innerText = "Progress: " + air.progress;
								isBlocked = false;
							},300);
							authAPIcall(
								`mutation($progress: Int,$id: Int){
									SaveMediaListEntry(progress: $progress,id:$id){id}
								}`,
								{id: air.id,progress: air.progress},
								data => {}
							);
							localStorage.setItem("hohListPreview",JSON.stringify(data));
						};
						if(air.media.nextAiringEpisode){
							if(air.progress === air.media.nextAiringEpisode.episode - 1){
								if(card.querySelector(".behind-accent")){
									card.querySelector(".behind-accent").remove()
								}
							}
						}
						e.stopPropagation();
						e.preventDefault();
						return false
					}
					let fallback = create("span","hohFallback",air.media.title.userPreferred,card,"background-color: rgb(var(--color-foreground),0.6);padding: 3px;border-radius: 3px;");
					if(useScripts.titleLanguage === "ROMAJI"){
						fallback.innerText = air.media.title.userPreferred
					}
					
				});
			};
			if(airingImportant > 3){
				drawSection(
					airing.slice(0,airingImportant),translate("$preview_airingSection_title"),true
				);
				drawSection(
					notAiring.slice(0,5*Math.ceil((20 - airingImportant)/5)),translate("$preview_animeSection_title")
				)
			}
			else{
				let remainderAiring = airing.slice(0,airingImportant).filter(air => air.index >= 20);
				drawSection(mediaLists.slice(0,20 - remainderAiring.length).concat(remainderAiring),translate("$preview_animeSection_title"),true);
			}
		}
	}catch(e){errorHandler(e)}}
	authAPIcall(
		`query($name: String){
			Page(page:1){
				mediaList(type:ANIME,status_in:[CURRENT,REPEATING],userName:$name,sort:UPDATED_TIME_DESC){
					id
					priority
					scoreRaw: score(format: POINT_100)
					progress
					status
					media{
						id
						episodes
						coverImage{large color}
						title{userPreferred}
						nextAiringEpisode{episode timeUntilAiring}
					}
				}
			}
		}`,{name: whoAmI},function(data){
			localStorage.setItem("hohListPreview",JSON.stringify(data));
			buildPreview(data,true);
		}
	);
	buildPreview(JSON.parse(localStorage.getItem("hohListPreview")),false);
	}
	catch(e){
		errorHandler(e)
	}
}
