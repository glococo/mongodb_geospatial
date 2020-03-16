# MongoDB Geospatial Demo

MongoDB’s geospatial indexing allows you to efficiently execute spatial queries on a collection that contains geospatial shapes and points.
To showcase the capabilities of geospatial features, I wrote this Demo to show you how easy is to implement this feature in a useful Telegram Bot.

Check out my bot in Telegram -> [@gasolinabaratabot](https://t.me/gasolinabaratabot)
Check out running code in Zeit -> [https://mongodb-geospatial.now.sh/_src](https://mongodb-geospatial.now.sh/_src)
Check out uptime in now.sh bot -> [https://mongodb-geospatial.now.sh/api?uptime](https://mongodb-geospatial.now.sh/api?uptime)

Bots are special Telegram accounts designed to handle messages automatically. Users can interact with bots by sending them command messages in private or group chats.
These accounts serve as an interface for code running somewhere on your server.

<p align="center">
  <img width="60%" src="/screenshot.jpg">
</p>

This is a Telegram Bot that help you find the cheapest Spanish fuel station around your location.
The current downloaded Data is gathered from [Spainsh Portal](https://geoportalgasolineras.es) and is updated every 30 minutes.


## Run locally

```
git clone https://github.com/glococo/mongodb_geospatial.git
cd mongodb_geospatial
npm i
BOT_TOKEN="_your_telegram_bot_token_" MONGO_DB="mongodb+srv://_user_:_pass_@_your_mongodb_server_/_mongodb_database_" node api/index.js
```
