exportModule({
	id: "tweets",
	description: "$setting_tweets",
	extendedDescription: `
This works by running Twitter's official embedding script. Be advised that Twitter embeds display NSFW content no differently than other content.
	`,
	isDefault: false,
	categories: ["Feeds"],
	visible: true,
	boneless_disabled: true
})

const isPublishedMozillaAddon = false;
let tweetLoop;
if(useScripts.tweets && !isPublishedMozillaAddon){
	tweetLoop = setInterval(function(){
		document.querySelectorAll(
			`.markdown a[href^="https://twitter.com/"][href*="/status/"]`
		).forEach(tweet => {
			if(tweet.classList.contains("hohEmbedded")){
				return
			}
			let tweetMatch = tweet.href.match(/^https:\/\/twitter\.com\/(.+?)\/status\/\d+/)
			if(!tweetMatch || tweet.href !== tweet.innerText){
				return
			}
			tweet.classList.add("hohEmbedded");
			let tweetBlockQuote = create("blockquote",false,false,tweet);
			tweetBlockQuote.classList.add("twitter-tweet");
			if(document.body.classList.contains("site-theme-dark")){
				tweetBlockQuote.setAttribute("data-theme","dark")
			}
			let tweetBlockQuoteInner = create("p",false,false,tweetBlockQuote);
			tweetBlockQuoteInner.setAttribute("lang","en");
			tweetBlockQuoteInner.setAttribute("dir","ltr");
			let tweetBlockQuoteInnerInner = create("a","hohEmbedded","Loading tweet by " + tweetMatch[1] + "...",tweetBlockQuoteInner)
				.href = tweet.href;
			if(document.getElementById("hohTwitterEmbed") && window.twttr){
				window.twttr.widgets.load(tweet)
			}
			else{
				let script = document.createElement("script");
				script.setAttribute("src","https://platform.twitter.com/widgets.js");
				script.setAttribute("async","");
				script.id = "hohTwitterEmbed";
				document.head.appendChild(script)
			}
		})
	},400);
}
