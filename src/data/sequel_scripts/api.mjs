let apiResetLimit;

/**
 * Constructs and sends a request to the AniList GraphQL API
 * @param {string} query - A GraphQL query string.
 * @param {object} [variables] - GraphQL variables.
 * @returns {Promise<object>} Response data from the API.
 */
async function anilistAPI(query, variables){
	if(apiResetLimit){
		if(Date.now() < apiResetLimit*1000){
			return {
				"data": null,
				"errors": [{"message": "Too Many Requests.","status": 429}]
			};
		}
		apiResetLimit = undefined;
	}
	const req = new Request("https://graphql.anilist.co", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({query, variables})
	});
	try{
		const res = await fetch(req);
		const data = await res.json();
		if(res.status === 429){
			apiResetLimit = res.headers.has("x-ratelimit-reset") ? res.headers.get("x-ratelimit-reset") : (Date.now()+60*1000)/1000;
		}
		return data;
	}
	catch(e){
		console.error(e)
		if(e.message === "NetworkError when attempting to fetch resource."){
			apiResetLimit = (Date.now()+60*1000)/1000;
		}
		return {
			"data": null,
			"errors": [{"message": e,"status": null}]
		};
	}
}

export { anilistAPI, apiResetLimit }
