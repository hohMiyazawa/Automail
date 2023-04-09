import { anilistAPI, apiResetLimit } from "./api.mjs";
import { fuzzyDateCompare } from "./fuzzyDateCompare.mjs";
import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv;
const maxPage = args[2] || null;
const sequels = new Set();
const animeQuery = `
query($page: Int){
	Page(page: $page){
		pageInfo{
			currentPage
			hasNextPage
		}
		media(type: ANIME, sort: START_DATE_DESC){
			id
			startDate{year month day}
			relations{
				edges{
					relationType(version:2)
					node{
						type
						startDate{year month day}
					}
				}
			}
		}
	}
}`;

async function getAnime(){
	let nextPage = true;
	let page = 1;
	const pageProgress = setInterval(() => {
		process.stdout.write(`Page processed: ${page}\r`);
	}, 1000);
	console.log("Starting API search")
	/* eslint-disable no-await-in-loop */
	do{
		const data = await anilistAPI(animeQuery, {page});
		if(data.errors){
			if(data.errors.some(thing => thing.status === 429)){
				const wait = Math.max(1000, Date.now() - apiResetLimit*1000);
				await new Promise(res => {setTimeout(res, wait)})
			}
			else{
				console.error(errors)
			}
		}
		else{
			data.data.Page.media.forEach(entry => {
				const isSequel = entry.relations.edges.some(rel => {
					if(rel.node.type === "MANGA"){
						return false
					}
					let sequel = rel.relationType === "PREQUEL" || rel.relationType === "PARENT";
					const compare = fuzzyDateCompare(entry.startDate,rel.node.startDate);
					if(compare === 1){
						sequel = false;
					}
					return sequel;
				});
				if(isSequel && ![101517,69625,30336,37776,104271,95,82,96].includes(entry.id)){
					sequels.add(entry.id)
				}
			})
			nextPage = data.data.Page.pageInfo.hasNextPage === true && !maxPage || data.data.Page.pageInfo.currentPage < maxPage;
			if(nextPage){
				page = data.data.Page.pageInfo.currentPage + 1;
				await new Promise(res => {setTimeout(res, (Math.floor(Math.random()*3)+1)*1000)})
			}
		}
	}
	while(nextPage)
	/* eslint-enable no-await-in-loop */
	clearInterval(pageProgress)
	console.log("Completed API search")
}

async function init(){
	await getAnime()
	const filePath = join(__dirname, "../sequels.json");
	const sequelFile = await readFile(filePath, "utf8");
	console.log("Reading anime sequels file");
	const fileSet = new Set(JSON.parse(sequelFile));
	//const diff =Array.from(sequels).filter(seq => !fileSet.has(seq)));
	//await writeFile("diff.json", JSON.stringify(diff), "utf8");
	const combinedSet = new Set([...fileSet, ...sequels]);
	await writeFile(filePath, JSON.stringify(Array.from(combinedSet)), "utf8");
	console.log("Updated anime sequels file")
}
init()
