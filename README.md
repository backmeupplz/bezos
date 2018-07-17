# [@official_bezos_bot](https://t.me/official_bezos_bot)
Code of the [@official_bezos_bot](https://t.me/official_bezos_bot) Telegram bot.
# Installation and local launch
1. Clone this repo: `git clone https://github.com/backmeupplz/bezos`
2. Create `.env` file with environment variables listed below
3. Run `yarn install` in the root folder
4. Run `yarn distribute`
# Environment variables in `.env` file
* `TOKEN` — Telegram bot token
* `CHAT_LINK` — Link to the Telegram chat
* `CHAT_ID` — ID of the chat
* `MONGO` — URL of the mongo db
* `MIN_ETH` — Minimum amount on advertiser ETH address to add them to the advertiser queue
# Continuous integration
Any commit pushed to master gets deployed to [@official_bezos_bot](https://t.me/official_bezos_bot) via [CI Ninja](https://github.com/backmeupplz/ci-ninja).

# License
MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!