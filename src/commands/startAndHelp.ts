// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { trySettingUpReferral } from '../helpers/referral'

// Setup constants
const chatLink = process.env.CHAT_LINK
const chatId = Number(process.env.CHAT_ID)

// Start and help commands
export function setupStartAndHelp(bot: Telegraf<ContextMessageUpdate>) {
  bot.command(['start', 'help', 'ref'], (ctx) => {
    // Check referral
    if (ctx.message.text.startsWith('/start') || ctx.message.text.startsWith('/ref')) {
      // Check if there is second part to the command
      const parts = ctx.message.text.split(' ')
      if (parts.length > 1) {
        // Check if it's a valid number
        const refId = parseInt(parts[1])
        if (!isNaN(refId)) {
          trySettingUpReferral(ctx.message.from.id, refId, bot, ctx)
          return
        }
      }
    }

    // Check the rest
    if (ctx.chat.type === 'private') {
      ctx.replyWithHTML(`Привет! Этот бот поможет вам купить рекламу в чате <a href="${chatLink}">Раздача Безоса</a>. Условия просты:\n\n• Рекламодатели отправляют текст рекламы сюда и Ethereum на личный адрес ввода\n• Каждый день в 10 утра по Московскому времени в <a href="${chatLink}">чате</a> пинится рекламный текст из начала очереди рекламодателей, отсортированной по убыванию введенных средств, ровно на сутки\n• Если ваш текст не был опубликован сегодня, то он может быть опубликован на следующий день, если никто не введет больше Ethereum, чем вы (суммы ввода переносятся на следующий день)\n• Довводить новый Ethereum можно в любой момент — он прибавится к вашей текущей сумме ввода на текущий рекламный текст\n• Ваши введенные деньги в итоге будут отправлены случайно выбранному пользователю из чата.\n\n/help — это сообщение\n/ad <code>рекламный текст</code> — отправка рекламного текста боту в очередь (заменяет текущий рекламный текст)\n/info — информация о текущей очереди рекламных текстов (и введенным суммам рекламодателей), вашей позиции в очереди, вашем адресе пополнения, текущем балансе, текущем рекламном тексте\n\nВаша реферальная ссылка — t.me/official_bezos_bot?start=${ctx.message.from.id}. Алсо, код бота <a href="https://github.com/backmeupplz/bezos">в открытом доступе</a>. Звезды ставить можно и нужно. <a href="http://telegra.ph/Pravila-i-usloviya-uchastiya-v-Razdache-Bezosa-07-18">Правила чата тут</a>.`)
    } else {
      if (ctx.chat.id === chatId) {
        ctx.replyWithHTML(`• Хотите купить рекламу в чате <a href="${chatLink}">Раздача Безоса</a>? Милости прошу ко <a href="https://t.me/official_bezos_bot">мне в личку</a>\n• Выиграли и хотите получить приз? Ответьте на это сообщение с адресом кошелька эфира — я сразу отправлю вам вознаграждение\n• Ваша реферальная ссылка — t.me/official_bezos_bot?start=${ctx.message.from.id}\n• <a href="http://telegra.ph/Pravila-i-usloviya-uchastiya-v-Razdache-Bezosa-07-18">Правила чата тут</a>`)
      } else {
        ctx.replyWithHTML(`Сорямба, но я работаю только в чате <a href="${chatLink}">Раздача Безоса</a>. Только там я бесплатно раздаю Ethereum активным участникам. Пис!`)
      }
    }
  })
}