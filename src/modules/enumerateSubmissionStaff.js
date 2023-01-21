exportModule({
	id: "enumerateSubmissionStaff",
	description: "$enumerateSubmissionStaff_description",
	isDefault: true,
	categories: [/*"Submissions",*/"Profiles"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return url.match(/^https:\/\/anilist\.co\/edit/)
	},
	code: function enumerateSubmissionStaff(){
		if(!location.pathname.match(/^\/edit/)){
			return
		}
		setTimeout(enumerateSubmissionStaff,500);
		let staffFound = [];
		let staffEntries = document.querySelectorAll(".staff-row .col > .image");
		Array.from(staffEntries).forEach(function(staff){
			let enumerate = staffFound.filter(a => a === staff.href).length;
			if(enumerate === 1){
				let firstStaff = document.querySelector(".staff-row .col > .image[href=\"" + staff.href.replace("https://anilist.co","") + "\"]");
				if(!firstStaff.previousSibling){
					firstStaff.parentNode.insertBefore(
						create("span","hohEnumerateStaff",1),
						firstStaff
					)
				}
			}
			if(enumerate > 0){
				if(staff.previousSibling){
					staff.previousSibling.innerText = enumerate + 1;
				}
				else{
					staff.parentNode.insertBefore(
						create("span","hohEnumerateStaff",(enumerate + 1)),
						staff
					)
				}
			}
			staffFound.push(staff.href);
		})
	}
})
