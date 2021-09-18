//fork of anisongs by morimasa
//https://greasyfork.org/en/scripts/374785-anisongs
const anisongs_temp = {
	last: null,
	target: null
}

exportModule({
	id: "anisongs",
	description: "Add OP/ED data to media pages [by Morimasa]",
	isDefault: false,
	categories: ["Media"],
	visible: true,
	urlMatch: function(url,oldUrl){
		return ["anime","manga"].includes(window.location.pathname.split("/")[1])
	},
	code: function(){
const options = {
  cacheName: 'anison', // name in localstorage
  cacheTTL: 604800000, // 1 week in ms
  class: 'anisongs', // container class
}

localforage.config({
    name: 'Anisongs'
})

const Cache = {
  async add(key, value) {
    await localforage.setItem(key, value)
    return value
  },
  async get(key) {
    return localforage.getItem(key)
  }
}

const API = {
  async getMedia(id) {
    const query = "query($id:Int){Media(id:$id){idMal startDate{year} status}}",
          vars = {id}
    const resp = await request("https://graphql.anilist.co", {
      method: "POST",
      body: JSON.stringify({query: query, variables: vars}),
    })
    try {
      const {idMal, startDate, status} = resp.data.Media
      return {mal_id: idMal, year: startDate.year, status}
    }
    catch(e) {
      console.log("Anisongs: Error getting malId")
      return null
    }
  },
  async getSongs(mal_id) {
    const splitSongs = list => list.flatMap(e => e.split(/\#\d{1,2}\s/)).filter(e => e!=="")
    let {opening_themes, ending_themes} = await request(`https://api.jikan.moe/v3/anime/${mal_id}/`)
    opening_themes = splitSongs(opening_themes)
    ending_themes = splitSongs(ending_themes)
    return {opening_themes, ending_themes}
  }
}

function request(url, options={}) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      url,
      method: options.method || "GET",
      headers: options.headers || {Accept: "application/json",
                                   "Content-Type": "application/json"},
      responseType: options.responseType || "json",
      data: options.body || options.data,
      onload: res => resolve(res.response),
      onerror: reject
    })
  })
}

class VideoElement {
  constructor(parent, url) {
    this.url = url
    this.parent = parent
    this.make()
  }

  toggle() {
    if (this.el.parentNode) {
      this.el.remove()
    }
    else {
      this.parent.append(this.el)
      this.el.children[0].autoplay = true // autoplay
    }
  }

  make() {
    const box = document.createElement('div'),
          vid = document.createElement('video')
    vid.src = this.url
    vid.controls = true
    vid.preload = "none"
    vid.volume = 0.4
    box.append(vid)
    this.el = box
  }
}

function insert(songs, parent) {
  if (!songs || !songs.length) {
    const node = document.createElement('div')
    node.innerText = 'No songs to show (つ﹏<)･ﾟ｡'
    node.style.textAlign = "center"
    parent.appendChild(node)
  }
  else {
    songs.forEach( (song, i) => {
      const node = document.createElement('div')
      const txt = `${i+1}. ${song.title || song}`
      if (song.url) {
        const vid = new VideoElement(node, song.url)
        node.addEventListener("click", () => vid.toggle())
        node.classList.add("has-video")
      }
      node.innerText = txt
      node.classList.add("anisong-entry")
      parent.appendChild(node)
    })
  }
}

function createTargetDiv(text, target, pos) {
  let el = document.createElement('div');
  el.appendChild(document.createElement('h2'));
  el.children[0].innerText = text;
  el.classList = options.class;
  target.insertBefore(el, target.children[pos]);
  return el;
}

function placeData(data) {
  cleaner(anisongs_temp.target);
  let op = createTargetDiv('Openings', anisongs_temp.target, 0);
  let ed = createTargetDiv('Endings', anisongs_temp.target, 1);
  insert(data.opening_themes, op);
  insert(data.ending_themes, ed);
}

function cleaner(target) {
  if (!target) return;
  let el = target.querySelectorAll(`.${options.class}`);
  el.forEach(e => target.removeChild(e))
}

function TTLpassedCheck(timestamp, TTL) {
  return (timestamp + TTL) < +new Date()
}

async function launch(currentid) {
  // get from cache and check TTL
  const cache = await Cache.get(currentid) || {time: 0};
  const TTLpassed = TTLpassedCheck(cache.time, options.cacheTTL);
  if (TTLpassed) {
    const {mal_id, year, status} = await API.getMedia(currentid);
    if (mal_id) {
      let {opening_themes, ending_themes} = await API.getSongs(mal_id);
      // add songs to cache if they're not empty and query videos
      if (opening_themes.length || ending_themes.length) {
        if (["FINISHED", "RELEASING"].includes(status)) {
          try {
            const _videos = await new Videos(year, mal_id).get()
            opening_themes = Videos.merge(opening_themes, _videos.OP)
            ending_themes = Videos.merge(ending_themes, _videos.ED)
          }
          catch(e){console.log("Anisongs", e)} // 🐟
        }
        await Cache.add(currentid, {opening_themes, ending_themes, time: +new Date()});
      }
      // place the data onto site
      placeData({opening_themes, ending_themes});
      return "Downloaded songs"
    }
    else {
      return "No malid"
    }
  }
  else {
    // place the data onto site
    placeData(cache);
    return "Used cache"
  }
}

class Videos {
  constructor(year, id_mal) {
    this.year = this.parseYear(year)
    this.URL = `https://www.reddit.com/r/AnimeThemes/wiki/${this.year}.json`;
    this.id_mal = id_mal
  }

  async get() {
    const cache_name = `cache${this.year}`
    const cached = await Cache.get(cache_name)
    const makepromise = async v => v // small hack because things
    if (cached && !TTLpassedCheck(cached.time, options.cacheTTL)) {
      console.log("Anisongs: used videos cache")
      return makepromise(cached.html)
        .then(cache => Videos.find(cache, this.id_mal))
        .then(Videos.groupTypes)
    }
    else {
      return request(this.URL)
        .then(Videos.parseResponse)
        .then(html => Cache.add(cache_name, {html, time: +new Date()}))
        .then(cache => cache.html)
        .then(html => Videos.find(html, this.id_mal))
        .then(Videos.groupTypes)
    }
  }

  parseYear(year) {
    if (year > 1999) {
      return year
    }
    else {
      return `${year.toString()[2]}0s`
    }
  }

  static parseResponse(data) {
    const html = data.data.content_html
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
    return html
  }

  static find(html_str, mal_id) {
    const html = new DOMParser().parseFromString(html_str, "text/html")
    const findTable = el => el.nodeName === "TABLE" ? el : findTable(el.nextElementSibling),
          url_el = html.querySelector(`a[href='https://myanimelist.net/anime/${mal_id}/']`),
          table = findTable(url_el.parentNode.nextElementSibling),
          entries = [...table.children[1].children]
    return entries.map(Videos.parseSong).filter(e => e)
  }

  static parseSong(entry) {
    const cells = [...entry.cells]
    if (cells[0].innerText === "") return null
    const url = cells[1].children.length ? cells[1].children[0].href : null
    let [_, type, n] = cells[0].innerText.match(/(OP|ED)(\d*)/)
    n = n!=="" ? parseInt(n) : 1
    return {type, n, url}
  }

  static groupTypes(songs) {
    const groupBy = (xs, key) => {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
    return groupBy(songs, "type")
  }

  static merge(entries, videos) {
    const findUrl = n => {
      const found = videos.find(e => e.n == n+1)
      return found ? found.url : null
    }
    return entries.map((e, i) => {
      return {
        title: e,
        url: findUrl(i)
      }
    })
  }
}

let currentpath = window.location.pathname.split("/");
if(currentpath[1] === "anime") {
	let currentid = currentpath[2];
	let location = currentpath.pop();
	if(location !== ""){
		anisongs_temp.last = 0
	}
	anisongs_temp.target = document.querySelectorAll(".grid-section-wrap")[2];
	if(anisongs_temp.last !== currentid && location === ""){
		if(anisongs_temp.target){
			anisongs_temp.last = currentid;
			launch(currentid)
		}
		else{
			setTimeout(()=>{this.code.call(this)},500)
		}
	}
}
else if(currentpath[1] === "manga"){
	cleaner(anisongs_temp.target);
	anisongs_temp.last = 0
}
else{
	anisongs_temp.last = 0
}
	}
})
