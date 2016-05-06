var Datastore = require('nedb')
var VKApi = require('node-vkapi')
var Promise = require('promise')

var db = {}
db.answers = new Datastore({filename: './storage/answers.db'})
db.bayans = new Datastore({filename: './storage/bayans.db'})
db.answers.loadDatabase()
db.bayans.loadDatabase()

var dbModule = function() {
    this.fillBayans = function() {
        return new Promise((resolve, reject) => {
            var VK = new VKApi()
        	var ownerId = 15301063, albumIds = [133461410,226850821,171105304] //Вынести в пропы
            albumsPromises = albumIds.map(albumId => {
                return VK.call('photos.get', {
            		owner_id: ownerId,
            		album_id: albumId,
            		extended: 0
            	}).then(res => {
            		var pics = res.items.map(e => {
                        var url = ''
            			if (e.photo_1280) url = e.photo_1280
            			else if (e.photo_807) url = e.photo_807
            			else if (e.photo_604) url = e.photo_604
            			else if (e.photo_130) url = e.photo_130
                        return {url: url, posted: false}
            		})
                    db.bayans.insert(pics)
            	}, err => {
            		console.log("Bayans are not downloaded")
            	})
            })
            Promise.all(albumsPromises).then(res => {
                resolve()
            })
        })
    }

    this.getBayans = function(count, callback) {
        var result = []
        db.bayans.find({posted: false}, (err, bayans) => {
            console.log("bayans count: " + bayans.length)
            while(count--) {
                result.push(bayans[Math.floor(Math.random()*bayans.length)].url)
            }
            callback(result)
        })
    }

    this.setBayansPosted = function(bayans) {
        bayans = Array.isArray(bayans) ? bayans : [bayans]
        console.log("posted bayans")
        console.log(Array.isArray(bayans))
        db.bayans.update({url: {$in: bayans}}, {posted: true}, {multi: true}, (numAffected, affDocs) => {
            console.log({numAffected: numAffected, newDocs: affDocs})
        })
    }
}

module.exports = dbModule
