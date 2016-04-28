﻿var TelegramBot = require('node-telegram-bot-api') 
var VKApi = require('node-vkapi')
var https = require('https')
var VK = new VKApi()
//var googleImages = require('google-images') //https://github.com/vdemedes/google-images#set-up-google-custom-search-engine

var http = require('http')

var token = '197402890:AAFYbn7ZGjPUAiL2mIYKqSgsSLsLZUbeHv0'
var bot = new TelegramBot(token, {polling: false})
var answers = ["лол", "всегда так делаю", "SUQA", "вот он пес", "че творится тоооо", "лол бля", "проиграл", "сасают пускай", "збс истории", "бля", "ебаные вазы", "пиздец какой", "чот лол ваще", "здорово у них получается", "ох\nсмешно", "хехе", "да ето так", "все так", "жиза", "жзнн", "жизненно", "ну и истории", "там на хохлятском что ли?", "все ебанулись", "пощаади", "ссУКАа", "крепко поясняет", "крепко"]
var stickers = ["BQADAgADDgAD0lqIAS4_Dn8BQpYIAg", 'BQADAgADEwAD0lqIAZPkeV9UWs1eAg', 'BQADAgADFwAD0lqIAW6NhqV3Oc1XAg', 'BQADAgADKQAD8IE4BxfpeSzDpf7xAg', 'BQADAgADaSEAAlOx9wO2b3V0S-YJQQI', 'BQADAgADwQAD8IE4B7rHpeqamcA4Ag']

var cseId = '011789341044406885438:jrc8evcrftg' //cx param
var googleApiKey = 'AIzaSyCPB1_pPKab6es9a16-ZMVoxYFXEhjDr5s' //key param
var maxBayanCount = 10

function kobaResponse(msg) {
    var chatId = msg.chat.id
	console.log(msg)
	if (msg.text) {
		if (searchRequest(msg.text)) kobaFind(chatId, msg.text)
		else if (bayanRequest(msg.text)) {	
			if (bayanHeap(msg.text)) {
				console.log("heap")
				var match = msg.text.match(/\d+/)
				var count = match ? match[0] : 3
				postBayan(chatId, count)
			} 
			else postBayan(chatId)
		} else if (randomMessage(msg)) {
			postResponse(chatId)
		}
	} else if (msg.sticker) {
		var rndIdx = Math.random() * stickers.length
		bot.sendSticker(chatId, stickers[Math.floor(rndIdx)])
	} else if (msg.photo || msg.voice) {
		postResponse(chatId)
	}
}

function bayanHeap(text) {
	return (text.toUpperCase().lastIndexOf("ПАЧКУ") != -1 || text.toUpperCase().lastIndexOf("КУЧУ") != -1)
}

function bayanRequest(text) {
	return (text.toUpperCase().lastIndexOf("КОБ") != -1 
		&& (text.toUpperCase().lastIndexOf("БАЯН") != -1 
			|| text.toUpperCase().lastIndexOf("БАЯНЕЦ") != -1
			|| text.toUpperCase().lastIndexOf("БАЯНЦА") != -1
			|| text.toUpperCase().lastIndexOf("КАРТИНК") != -1))
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

function getOffset() {
	var updatesPromise = bot.getUpdates(1, 10)
	updatesPromise.then((data) => {
		console.log("data: ")
		console.log(data)
		offset = data && data.length ? data[data.length-1].update_id+1 : 0
	})
}

// Response-part
var offset = getOffset()
setInterval(function() {
	console.log("start")	
	console.log("offset = " + offset)	
	var updatesPromise = bot.getUpdates(1, 10, offset)
	updatesPromise.then((data) => {
		var unique = []
		for (var i = 0; i < data.length; i++) {
			var ids = unique.map(e => e.message.message_id)
			if (ids.lastIndexOf(data[i].message.message_id) == -1)
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