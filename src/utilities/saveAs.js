function saveAs(data,fileName,pureText){
	let link = create("a");
	document.body.appendChild(link);
	let json = pureText ? data : JSON.stringify(data);
	let blob = new Blob([json],{type: "octet/stream"});
	let url = window.URL.createObjectURL(blob);
	link.href = url;
	link.download = fileName || translate("$default_filename");
	link.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(link)
}
