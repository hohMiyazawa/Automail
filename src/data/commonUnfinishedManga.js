//used by the stats module, and to safeguard the manga chapter guesses
const commonUnfinishedManga = {
	"53390":{//aot
		chapters:116,
		volumes:26
	},
	"30002":{//berserk
		chapters:359,
		volumes:40
	},
	"30013":{//one piece
		chapters:967,
		volumes:92
	},
	"85486":{//mha
		chapters:202,
		volumes:20
	},
	"74347":{//opm
		chapters:119,
		volumes:17
	},
	"30026":{//HxH
		chapters:390,
		volumes:36
	},
	"30656":{//vagabond
		chapters:327,
		volumes:37
	},
	"30105":{//yotsuba&
		chapters:106,
		volumes:14
	}
};
if(NOW() - new Date(2020,0,1) > 365*24*60*60*1000){
	console.log("remind hoh to update the commonUnfinishedManga list")
};
