var Datastore = require('nedb')
var VKApi = require('node-vkapi')
var db = {}
db.answers = new Datastore({filenane: '../db/storage/answers.db'})
db.bayans = new Datastore({filenane: '../db/storage/bayans.db'})

db.answers.loadDatabase()
db.bayans.loadDatabase()

var dbModule = function() {
    this.fillBayans = function() {
        var VK = new VKApi()
    	var ownerId = 15301063, albumIds = [133461410,226850821,171105304] //Вынести в пропы
        albumIds.forEach(albumId => {
            VK.call('photos.get', {
        		owner_id: ownerId,
        		album_id: albumId,
        		extended: 0
        	}).then(res => {
        		var pics = res.items.map(e => {
                    var url = ''
        			if (e.photo_1280) url = e.photo_1280
        			if (e.photo_807) url = e.photo_807
        			if (e.photo_604) url = e.photo_604
        			if (e.photo_130) url = e.photo_130
                    return {url: url, posted: false}
        		})
                db.bayans.insert(pics)

        		for(var i = 0; i<count; i++) {
                    var rndIdx = Math.floor(Math.random() * res.count)
        			bot.sendMessage(chatId, pics[rndIdx])
        		}
        	}, err => {
        		console.log("Byans are not downloaded")
        	})
        })
    }

    this.getBayans = function(count) {
        var result = []
        db.bayans.find({posted: false}, (err, bayans) => {
            console.log(bayans)
            console.log(bayans.length)
            while(count--) {
                result.push(bayans[Math.floor(Math.random()*bayans.length)].url)
            }
        })
        return result
    }

    var toString = function() {console.log("хуй")}
}

module.exports = dbModule
