// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'

// Setup constants
const chatLink = 'https://t.me/joinchat/BIlEB0V-2J6tGgKkvSFzzQ'
const chatId = -1001165940894

// Start and help commands
export function setupStartAndHelp(bot: Telegraf<ContextMessageUpdate>) {
  bot.command(['start', 'help'], (ctx) => {
    if (ctx.chat.type === 'private') {
      ctx.replyWithHTML(`Привет! Этот бот поможет вам купить рекламу в чате <a href="${chatLink}">Раздача Безоса</a>. Условия просты:\n\n• Рекламодатели отправляют текст рекламы сюда и Ethereum на личный адрес ввода\n• Каждый день в 10 утра по Московскому времени в <a href="${chatLink}">чате</a> пинится рекламный текст из начала очереди рекламодателей, отсортированной по убыванию введенных средств, ровно на сутки\n• Если ваш текст не был опубликован сегодня, то он может быть опубликован на следующий день, если никто не введет больше Ethereum, чем вы (суммы ввода переносятся на следующий день)\n• Довводить новый Ethereum можно в любой момент — он прибавится к вашей текущей сумме ввода на текущий рекламный текст\n• Ваши введенные деньги в итоге будут отправлены случайно выбранному пользователю из чата.\n\n/help — это сообщение\n/ad <code>рекламный текст</code> — отправка рекламного текста боту в очередь (заменяет текущий рекламный текст)\n/info — информация о текущей очереди рекламных текстов (и введенным суммам рекламодателей), вашей позиции в очереди, вашем адресе пополнения, текущем балансе, текущем рекламном тексте`)
    } else {
      if (ctx.chat.id === chatId) {
        ctx.replyWithHTML(`Хотите купить рекламу в чате <a href="${chatLink}">Раздача Безоса</a>? Милости прошу ко <a href="https://t.me/official_bezos_bot">мне в личку</a>. Выиграли и хотите получить приз? Ответьте на это сообщение с адресом кошелька эфира — я сразу отправлю вам вознаграждение.`)
      } else {
        ctx.replyWithHTML(`Сорямба, но я работаю только в чате <a href="${chatLink}">Раздача Безоса</a>. Только там я бесплатно раздаю Ethereum активным участникам. Пис!`)
      }
    }
  })
}