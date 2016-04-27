var TelegramBot = require('node-telegram-bot-api')

var token = '197402890:AAFYbn7ZGjPUAiL2mIYKqSgsSLsLZUbeHv0'
var bot = new TelegramBot(token, {polling: false})
var answers = ["лол", "всегда так делаю", "SUQA", "ОН ПЕС НОВЕРНОЕ", "че творится тоооо", "лол бля", "проиграл", "сасают пускай", "збс истории", "бля", "ебаные вазы", "пиздец какой", "чот лол ваще", "здорово у них получается", "ох\nсмешно", "хехе", "да ето так", "все так", "жиза", "жзнн", "жизненно", "ну и истории", "там на хохлятском что ли?", "все ебанулись", "пощаади", "ссУКАа", "крепко поясняет", "крепко"]
var stickers = ["BQADAgADDgAD0lqIAS4_Dn8BQpYIAg", 'BQADAgADEwAD0lqIAZPkeV9UWs1eAg', 'BQADAgADFwAD0lqIAW6NhqV3Oc1XAg', 'BQADAgADKQAD8IE4BxfpeSzDpf7xAg', 'BQADAgADaSEAAlOx9wO2b3V0S-YJQQI', 'BQADAgADwQAD8IE4B7rHpeqamcA4Ag']

function kobaResponse(msg) {
    var chatId = msg.chat.id
	console.log(msg)
	if ((msg.text 
		&& (msg.text.lastIndexOf('http')!=-1 
			|| msg.text.toUpperCase().lastIndexOf("КОБЫЧ")!=-1
			|| msg.text.toUpperCase().lastIndexOf("КОБА")!=-1
			|| msg.text.toUpperCase().lastIndexOf("ЕБАТЬ")!=-1)) || msg.photo) {
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
	} else if (msg.sticker) {
		var rndIdx = Math.random() * stickers.length
		bot.sendSticker(chatId, stickers[Math.floor(rndIdx)])
	}
}

var offset = 0;


setInterval(function() {
	console.log("start")	
	console.log("offset = " + offset)	
	var updatesPromise = bot.getUpdates(1, 10, offset)
	updatesPromise.then(function(data) {
		var unique = []
		for (var i = 0; i < data.length; i++) {
			var ids = unique.map(function(e){return e.message.message_id})
			if (ids.lastIndexOf(data[i].message.message_id) == -1)
				unique.push(data[i])
		}		
		console.log("-----------------------")
		for (var i = 0; i < unique.length; i++) {
			if (i == unique.length - 1) offset = unique[i].update_id+2
			console.log(unique[i])
			kobaResponse(unique[i].message)
		}
	})
}, 5000)

