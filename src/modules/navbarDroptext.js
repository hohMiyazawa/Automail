if(useScripts.navbarDroptext){
	let addDrop = function(){
		let navThingy = document.querySelector(".nav");
		if(navThingy){
			navThingy.ondragover = function(event){
				event.preventDefault()
			}
			navThingy.ondrop = function(event){
				event.preventDefault();
				let data = event.dataTransfer.getData("text");
				if(data.length && data.length < 1000){//avoid performance issues if someone accidentally drops the lord of the rings script into the navbar or something
					document.querySelector(".nav .wrap .search").click();
					let observer = new MutationObserver(function(){
						let inputElement = document.querySelector(".nav .quick-search .input input");
						inputElement.value = data;
						inputElement.dispatchEvent(new Event("input"));
						observer.disconnect()
					});
					observer.observe(document.querySelector(".nav .quick-search"),{
						attributes: true,
						childList: false,
						subtree: false
					})
				}
			}
		}
		else{
			setTimeout(addDrop,500)
		}
	};addDrop()
}
