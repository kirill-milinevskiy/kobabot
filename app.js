var TelegramBot = require('node-telegram-bot-api')
var dbModule = require('./db/dbmodule.js')
var db = new dbModule()

var VKApi = require('node-vkapi')
var VK = new VKApi()

var googleImages = require('google-images') //https://github.com/vdemedes/google-images#set-up-google-custom-search-engine
var cseId = '011789341044406885438:jrc8evcrftg' //cx param
var googleApiKey = 'AIzaSyCPB1_pPKab6es9a16-ZMVoxYFXEhjDr5s' //key param
var giClient = googleImages(cseId, googleApiKey)

var token = '197402890:AAFYbn7ZGjPUAiL2mIYKqSgsSLsLZUbeHv0'
var bot = new TelegramBot(token, {polling: false})
var answers = ["лол", "всегда так делаю", "SUQA", "вот он пес", "че творится тоооо", "лол бля", "проиграл", "сасают пускай", "збс истории", "бля", "ебаные вазы", "пиздец какой", "чот лол ваще", "здорово у них получается", "ох\nсмешно", "хехе", "да ето так", "все так", "жиза",
    "жзнн", "жизненно", "ну и истории", "там на хохлятском что ли?", "все ебанулись", "пощаади", "ссУКАа", "крепко поясняет", "крепко", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе", "хехе"]
var stickers = ["BQADAgADDgAD0lqIAS4_Dn8BQpYIAg", 'BQADAgADEwAD0lqIAZPkeV9UWs1eAg', 'BQADAgADFwAD0lqIAW6NhqV3Oc1XAg', 'BQADAgADKQAD8IE4BxfpeSzDpf7xAg', 'BQADAgADaSEAAlOx9wO2b3V0S-YJQQI', 'BQADAgADwQAD8IE4B7rHpeqamcA4Ag']

var maxBayanCount = 10
var okKobaResponse = "Так бля, значит:\n- Поиск: кобыч найди.\n- Пивко: просто упомяни пивко.\n- Баян: спроси у меня баян. Можешь сразу пачку.\nОстальное и так поймешь."

function kobaResponse(msg) {
    var chatId = msg.chat.id
    if (addedToChat(msg)) {
        sayHello(chatId)
    }
	if (msg.text) {
        if (beerRequest(msg.text)) postBeer(chatId)
		if (okKoba(msg.text)) bot.sendMessage(chatId, okKobaResponse)
		else if (searchRequest(msg.text)) kobaFind(chatId, msg.text)
        else if (bayanRequest(msg.text)) {
			if (bayanHeap(msg.text)) {
				var match = msg.text.match(/\d+/)
				var count = match ? match[0] : 3
				postBayan2(chatId, count)
			}
			else postBayan2(chatId)
		} else if (randomMessage(msg)) postResponse(chatId)
	} else if (msg.sticker) {
		var rndIdx = Math.random() * stickers.length
		bot.sendSticker(chatId, stickers[Math.floor(rndIdx)])
	} else if (msg.photo || msg.voice) {
		postResponse(chatId)
	}
}

function beerRequest(text) {
	return (text.match(/.*[Пп][Ии][Вв][Кк]*(О|о|А|а|У|у)/))
}

function okKoba(text) {
	return (text.match(/((Ок)+|(ок)+),* (К|к)обыч/))
}

function bayanHeap(text) {
	return (text.toUpperCase().lastIndexOf("ПАЧКУ") != -1 || text.toUpperCase().lastIndexOf("КУЧУ") != -1)
}

function bayanRequest(text) {
	return ((text.toUpperCase().lastIndexOf("КОБ") != -1 || text.toUpperCase().lastIndexOf("ЕЩЕ") != -1)
		      && (text.toUpperCase().lastIndexOf("БАЯН") != -1 || text.toUpperCase().lastIndexOf("КАРТИНК") != -1))
}

function randomMessage(msg) {
	return (msg.text.lastIndexOf('http') != -1
		|| msg.text.toUpperCase().lastIndexOf("КОБЫЧ") != -1
		|| msg.text.toUpperCase().lastIndexOf("КОБА") != -1
		|| msg.text.toUpperCase().lastIndexOf("КОБЕ") != -1
		|| msg.text.toUpperCase().lastIndexOf("ЕБАТЬ") != -1)
}

function searchRequest(text) {
	return (text.toUpperCase().lastIndexOf("КОБ") != -1 && text.toUpperCase().lastIndexOf("НАЙДИ") != -1)
}

function postBayan(chatId, count) {
	count = count ? count : 1
	if (count > maxBayanCount) {
		bot.sendMessage(chatId, "ты че охуел? че так дохуя то?")
		return
	}
	bot.sendMessage(chatId, "ща")
	var ownerId = 15301063, albumIds = [133461410,226850821,171105304]
	var albumId = albumIds[Math.floor(Math.random() * albumIds.length)]
	VK.call('photos.get', {
		owner_id: ownerId,
		album_id: albumId,
		extended: 0
	}).then(res => {
		var pics = res.items.map(e => {
			if (e.photo_1280) return e.photo_1280
			if (e.photo_807) return e.photo_807
			if (e.photo_604) return e.photo_604
			if (e.photo_130) return e.photo_130
		})
		for(var i = 0; i<count; i++) {
		var rndIdx = Math.floor(Math.random() * res.count)
			bot.sendMessage(chatId, pics[rndIdx])
		}
	}, err => {
		bot.sendMessage(chatId, "бля кротаны, чет не нашел")
	})
}

function postBayan2(chatId, count) {
	count = count ? count : 1
	if (count > maxBayanCount) {
		bot.sendMessage(chatId, "ты че охуел? че так дохуя то?")
		return
	}
	bot.sendMessage(chatId, "ща")
    db.getBayans(count, bayans => {
        bayans.forEach(bayan => {
            bot.sendMessage(chatId, bayan)
        })
        db.setBayansPosted(bayans)
    })

}

function postResponse(chatId) {
	var rnd = Math.random() * 100
	if (rnd < 70) {
		var rndIdx = Math.random() * answers.length
		bot.sendMessage(chatId, answers[Math.floor(rndIdx)])
	} else if (rnd >= 70 && rnd < 97) {
		var rndIdx = Math.random() * stickers.length
		bot.sendSticker(chatId, stickers[Math.floor(rndIdx)])
	} else {
		bot.sendMessage(chatId, "кек")
	}
}

function kobaFind(chatId, text) {
	var query = text.replace(/.*\n*[Н|н]айди /, "").replace(/\s/g, "+")
	if (query) bot.sendMessage(chatId, 'Гугл отменили чтоль? https://google.gik-team.com/?q=' + query)
	else bot.sendMessage(chatId, 'чет непонятна')
}

function postBeer(chatId) {
	giClient.search('Пиво', {page: Math.floor(Math.random()*10)}).then((images) => {
		bot.sendMessage(chatId, images[Math.floor(Math.random()*images.length)].url)
	})
}

function addedToChat(msg) {
    return msg.new_chat_participant && msg.new_chat_participant.username == "KeikkBot"
}

function sayHello(chatId) {
    bot.sendMessage(chatId, "вечер в хату жизнь ворам")
}

function sayAllIsOver(chatId) {
    bot.sendMessage(chatId, 'пиздос')
}

function getOffsetAndStart(offsetData) {
    var offset = offsetData && offsetData.length ? offsetData[offsetData.length-1].update_id + 1 : 0

    setInterval(function() {
    	console.log(new Date())
    	console.log("start")
    	console.log("offset = " + offset)
    	var updatesPromise = bot.getUpdates(1, 99, offset)
    	updatesPromise.then(data => {
    		var unique = []
    		for (var i = 0; i < data.length; i++) {
    			var ids = unique.map(e => e.message.message_id)
    			if (data[i].message && ids.lastIndexOf(data[i].message.message_id) == -1)
    				unique.push(data[i])
    		}
    		console.log("-----------------------")
    		for (var i = 0; i < unique.length; i++) {
    			if (i == unique.length - 1) offset = unique[i].update_id+1
    			console.log(unique[i])
    			kobaResponse(unique[i].message)
    		}
    	})
    }, 5000)
}

db.fillBayans().then(res => {
    bot.getUpdates(1,99).then(getOffsetAndStart)
})
