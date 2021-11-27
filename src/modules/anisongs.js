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
    return /^https:\/\/anilist\.co\/(anime|manga)\/[0-9]+\/.*/.test(url)
	},
	code: function(){
const options = {
  cacheTTL: 604800000, // 1 week in ms
  class: 'anisongs', // container class
}

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
    return new Promise((resolve, reject) => {
      generalAPIcall("query($id:Int){Media(id:$id){idMal status}}", {id}, ({data}) => {
        resolve(data.Media)
      })
    });
  },
  async getSongs(mal_id) {
    const res = await fetch(`https://api.jikan.moe/v3/anime/${mal_id}`)
    return res.json()
  },
  async getVideos(anilist_id) {
    const res = await fetch(`https://staging.animethemes.moe/api/anime?filter[has]=resources&filter[site]=AniList&filter[external_id]=${anilist_id}&include=animethemes.animethemeentries.videos`)
    return res.json()
  }
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
    create("div",false,"No songs to show (つ﹏<)･ﾟ｡",parent,"text-align:center");
  }
  else {
    songs.forEach( (song, i) => {
      const txt = `${i+1}. ${song.title || song}`;
      const node = create("div","anisongs-entry",txt,parent);
      if (song.url) {
        const vid = new VideoElement(node, song.url)
        node.addEventListener("click", () => vid.toggle())
        node.classList.add("has-video")
      }
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
  let op = createTargetDiv(translate("$anisongs_openings"), anisongs_temp.target, 0);
  if(data.opening_themes.length === 1){
    op.innerText = translate("$anisongs_opening")
  }
  let ed = createTargetDiv(translate("$anisongs_endings"), anisongs_temp.target, 1);
  if(data.ending_themes.length === 1){
    ed.innerText = translate("$anisongs_ending")
  }
  insert(data.opening_themes, op);
  insert(data.ending_themes, ed);
}

function cleaner(target) {
  if (!target) return;
  let el = target.querySelectorAll(`.${options.class}`);
  el.forEach(e => target.removeChild(e))
}

async function launch(currentid) {
  // get from cache and check TTL
  const cache = await Cache.get(currentid) || {time: 0};
  if(
    (cache.time + options.cacheTTL)
    < +new Date()
  ) {
    const {idMal: mal_id, status} = await API.getMedia(currentid);
    if (mal_id) {
      const filterThemes = themes => themes.filter(theme => !theme.includes("Help improve our database"))
      let {opening_themes, ending_themes} = await API.getSongs(mal_id);
      opening_themes = filterThemes(opening_themes)
      ending_themes = filterThemes(ending_themes)
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
    const {anime} = await API.getVideos(this.id);
    if(anime.length === 0){
      return {"OP":[], "ED":[]}
    }
    return Videos.groupTypes(anime[0].animethemes)
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
      return song.replace(/^\d{1,2}:/, "")
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

let currentpath = location.pathname.match(/(anime|manga)\/([0-9]+)\/[^\/]*\/?(.*)/)
if(currentpath[1] === "anime") {
	let currentid = currentpath[2];
	let location = currentpath[3];
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
