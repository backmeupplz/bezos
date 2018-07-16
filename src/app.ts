// Get environment variables
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
const telegraf = require('telegraf')

// Setup the bot
const bot: Telegraf<ContextMessageUpdate> = new telegraf(process.env.TOKEN, { username: 'official_bezos_bot' })
bot.startPolling()

// Start and help commands
bot.command(['start', 'help'], (ctx) => {
  if (ctx.chat.type === 'private')
  ctx.replyWithHTML('Привет! Этот бот поможет вам купить рекламу в чате <a href="https://t.me/joinchat/BIlEB0V-2J6tGgKkvSFzzQ">Раздача Безоса</a>. Условия просты: рекламодатели отправляют текст рекламы сюда и Ethereum на личный адрес ввода; каждый день в 10 утра по Московскому времени в <a href="https://t.me/joinchat/BIlEB0V-2J6tGgKkvSFzzQ">чате</a> пинится рекламный текст из начала очереди рекламодателей, отсортированной по убыванию введенных средств, ровно на сутки. Если ваш текст не был опубликован сегодня, то он может быть опубликован на следующий день, если никто не введет больше Ethereum, чем вы (суммы ввода переносятся на следующий день). Довводить новый Ethereum можно в любой момент — он прибавится к вашей текущей сумме ввода на текущий рекламный текст. Ваши введенные деньги в итоге будут отправлены случайно выбранному пользователю из чата.\n\n/help — это сообщение\n/ad <рекламный текст> — отправка рекламного текста боту в очередь (заменяет текущий рекламный текст)\n/address — ваш Ethereum адрес для пополнения\n/info — информация о текущей очереди рекламных текстов (и введенным суммам рекламодателей), вашей позиции в очереди, вашем адресе ввода и текущем балансе, текущем рекламном тексте')
})