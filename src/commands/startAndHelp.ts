// Dependencies
import { Telegraf, ContextMessageUpdate } from 'telegraf'
import { getRaffleByWinnerId } from '../models/raffle';
import { getRaffleBalance } from '../helpers/Ethereum';

// Start and help commands
export function setupStartAndHelp(bot: Telegraf<ContextMessageUpdate>) {
  bot.command(['start', 'help'], async (ctx) => {
    // Prepare text
    let text = `Привет! Этот бот поможет вам купить рекламу на канале @${process.env.CHANNEL_HANDLE}. Условия просты:\n\n• Рекламодатели отправляют текст рекламы сюда и Ethereum на личный адрес ввода\n• Каждый день в 10 утра по Московскому времени в на @${process.env.CHANNEL_HANDLE} публикуется рекламный текст из начала очереди рекламодателей, отсортированной по убыванию введенных средств.\n• Если ваш текст не был опубликован сегодня, то он может быть опубликован на следующий день, если никто не введет больше Ethereum, чем вы (суммы ввода переносятся на следующий день).\n• Довводить новый Ethereum можно в любой момент — он прибавится к вашей текущей сумме ввода на текущий рекламный текст.\n• Ваши введенные деньги в итоге будут отправлены случайно выбранному активному участнику спустя сутки после публикации вашей рекламы.\n\n/help — это сообщение.\n/ad <code>рекламный текст</code> — отправка рекламного текста боту в очередь (заменяет текущий рекламный текст). В вашем рекламном тексте обязательно должен содержаться оффер подписчикам канала — иначе текст будет отклонен.\n/info — информация о текущей очереди рекламных текстов (и введенным суммам рекламодателей), вашей позиции в очереди, вашем адресе пополнения, текущем балансе, текущем рекламном тексте.\n\nКод бота <a href="https://github.com/backmeupplz/bezos">в открытом доступе</a> (звезды ставить можно и нужно).`
    // Check if winner
    const raffle = await getRaffleByWinnerId(ctx.from.id)
    if (raffle) {
      // Check balance
      const balance = await getRaffleBalance(raffle)
      if (balance >= Number(process.env.MIN_ETH)) {
        text = `${text}\n\n🎉 Поздравляем! Вы выиграли ${balance} ETH! Чтобы забрать свой выигрыш, ответьте на это сообщение (не просто напишите в чат или сделайте форвард сообщения, а именно ответьте на это сообщение) кошельком Ethereum. Остались вопросы? Пишите @borodutch.`
      }
    }
    // Reply
    ctx.replyWithHTML(text)
  })
}