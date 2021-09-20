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
    let {opening_themes, ending_themes} = await request(`https://api.jikan.moe/v3/anime/${mal_id}/`)
    return {opening_themes, ending_themes}
  },
  async getVideos(anilist_id) {
    const res = await request(`https://staging.animethemes.moe/api/anime?filter[has]=resources&filter[site]=AniList&filter[external_id]=${anilist_id}&include=animethemes.animethemeentries.videos`)
    if(res.anime.length === 0){
      return null
    } else {
      return res.anime[0];
    }
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
    const {mal_id, status} = await API.getMedia(currentid);
    if (mal_id) {
      let {opening_themes, ending_themes} = await API.getSongs(mal_id);
      // add songs to cache if they're not empty and query videos
      if (opening_themes.length || ending_themes.length) {
        if (["FINISHED", "RELEASING"].includes(status)) {
          try {
            const _videos = await new Videos(currentid).get()
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
  constructor(id) {
    this.id = id
  }

  async get() {
    const {animethemes} = await API.getVideos(this.id);
    return Videos.groupTypes(animethemes)
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
    const cleanTitle = song => {
      return song.replace(/^#\d{1,2}:\s/, "")
    }
    const findUrl = n => {
      let url;
      if(videos[n]) {
        url = videos[n].animethemeentries[0]?.videos[0]?.link
        if(url) url = url.replace(/staging\./, "")
      }
      return url
    }
    if(videos) {
      return entries.map((e, i) => {
        return {
          title: cleanTitle(e),
          url: findUrl(i)
        }
      })
    }
    return entries.map((e, i) => {
      return {
        title: cleanTitle(e)
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
