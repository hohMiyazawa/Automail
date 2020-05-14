// Make sure that localStorage is available to us
// FIXME-QA: Peer-review required
try{
	localStorage.setItem("test","test");
	localStorage.removeItem("test");
}
catch(e){
	alert("Error: LocalStorage not available.");
	console.log("LocalStorage, required for saving settings, is not available. Terminating Autopod.")
}