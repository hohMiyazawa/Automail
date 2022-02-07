function addFeedFilters_user(){
	if(!/^https:\/\/anilist\.co\/user/.test(document.URL)){
		return
	}
	let activityFeed = document.querySelector(".activity-feed");
	if(!activityFeed){
		setTimeout(addFeedFilters_user,100);
		return
	}
	if(activityFeed.classList.contains("hohTranslated")){
		return
	}
	activityFeed.classList.add("hohTranslated");
	let postTranslator = function(){
		Array.from(activityFeed.children).forEach(activity => {
			try{
				let timeElement = activity.querySelector(".time time");
				if(timeElement && !timeElement.classList.contains("hohTimeGeneric")){
					let seconds = new Date(timeElement.dateTime).valueOf()/1000;
					let replacement = nativeTimeElement(seconds);
					timeElement.style.display = "none";
					replacement.style.position = "relative";
					replacement.style.right = "unset";
					replacement.style.top = "unset";
					timeElement.parentNode.insertBefore(replacement, timeElement)
				}
			}
			catch(e){
				console.warn("time element translation is broken")
			}
		})
	}
	let mutationConfig = {
		attributes: false,
		childList: true,
		subtree: false
	};
	let observer = new MutationObserver(function(){
		if(useScripts.additionalTranslation && useScripts.partialLocalisationLanguage !== "English"){
			postTranslator()
		}
	});
	observer.observe(activityFeed,mutationConfig);
	let observerObserver = new MutationObserver(function(){
		activityFeed = document.querySelector(".activity-feed");
		if(activityFeed){
			observer.disconnect();
			observer = new MutationObserver(function(){
				postRemover();
				if(useScripts.additionalTranslation && useScripts.partialLocalisationLanguage !== "English"){
					postTranslator()
				}
			});
			observer.observe(activityFeed,mutationConfig);
		}
	});
	observerObserver.observe(activityFeed,mutationConfig);
	if(useScripts.additionalTranslation && useScripts.partialLocalisationLanguage !== "English"){
		postTranslator()
	}
}
