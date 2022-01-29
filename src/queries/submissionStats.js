{name: "Submission stats",code: async function(){
	const query = `
query ($id: Int) {
	anime_total: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: ANIME, userId: $id, sort: ID) { createdAt }
	},
	anime_pending: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: ANIME, userId: $id, status: PENDING) { id }
	},
	anime_rejected: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: ANIME, userId: $id, status: REJECTED) { id }
	},
	anime_partially_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: ANIME, userId: $id, status: PARTIALLY_ACCEPTED) { id }
	},
	anime_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: ANIME, userId: $id, status: ACCEPTED) { id }
	},
	manga_total: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: MANGA, userId: $id, sort: ID) { createdAt }
	},
	manga_pending: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: MANGA, userId: $id, status: PENDING) { id }
	},
	manga_rejected: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: MANGA, userId: $id, status: REJECTED) { id }
	},
	manga_partially_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: MANGA, userId: $id, status: PARTIALLY_ACCEPTED) { id }
	},
	manga_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: mediaSubmissions(type: MANGA, userId: $id, status: ACCEPTED) { id }
	},
	characters_total: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: characterSubmissions(userId: $id, sort: ID) { createdAt }
	},
	characters_pending: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: characterSubmissions(userId: $id, status: PENDING) { id }
	},
	characters_rejected: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: characterSubmissions(userId: $id, status: REJECTED) { id }
	},
	characters_partially_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: characterSubmissions(userId: $id, status: PARTIALLY_ACCEPTED) { id }
	},
	characters_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: characterSubmissions(userId: $id, status: ACCEPTED) { id }
	},
	staff_total: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: staffSubmissions(userId: $id, sort: ID) { createdAt }
	},
	staff_pending: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: staffSubmissions(userId: $id, status: PENDING) { id }
	},
	staff_rejected: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: staffSubmissions(userId: $id, status: REJECTED) { id }
	},
	staff_partially_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: staffSubmissions(userId: $id, status: PARTIALLY_ACCEPTED) { id }
	},
	staff_accepted: Page(page: 1, perPage: 1) {
		pageInfo { total } submissions: staffSubmissions(userId: $id, status: ACCEPTED) { id }
	}
}
`
	const subTypes = ["anime", "manga", "characters", "staff"];
	const statusTypes = ["pending", "rejected", "partially_accepted", "accepted"];

	function parseStats(data){
		let grandTotal = 0;
		subTypes.forEach(subtype => {
			create("h1", null, capitalize(subtype), miscResults)
			statusTypes.forEach(status => {
				const statusWrap = create("p", null, null, miscResults);
				create("span", null, capitalize(status.replace("_", " ")) + ": ", statusWrap)
				create("span", "hohStatValue", data[subtype + "_" + status].pageInfo.total, statusWrap)
			})
			const total = data[subtype + "_total"].pageInfo.total;
			grandTotal += total
			const totalWrap = create("p", null, null, miscResults);
			create("span", null, "Total: ", totalWrap)
			create("span", "hohStatValue", total, totalWrap)
			const firstSub = data[subtype + "_total"].submissions[0] ? data[subtype + "_total"].submissions[0].createdAt : undefined;
			if(firstSub) create("p", null, "First submission created on " + new Date(firstSub*1000).toLocaleString(), miscResults)
			create("br", null, null, miscResults)
		})
		create("br", null, null, miscResults)
		const grandTotalWrap = create("p", null, null, miscResults);
		create("span", null, "You have made a grand total of ", grandTotalWrap)
		create("span", "hohStatValue", grandTotal, grandTotalWrap)
		create("span", null, " submissions.", grandTotalWrap)
	}

	miscResults.innerText = "";
	const {data, errors} = await anilistAPI(query, {
		variables: {id: whoAmIid},
		cacheKey: "submissionStats",
		duration: 20*60*1000,
		internal: true
	})
	if(!errors) parseStats(data)
	else miscResults.innerText = "API error occurred"
}},
