# MongoDB Geospatial Demo

MongoDB’s geospatial indexing allows you to efficiently execute spatial queries on a collection that contains geospatial shapes and points.
To showcase the capabilities of geospatial features, I wrote this Demo to show you how easy is to implement this feature in a useful Telegram Bot.

Bots are special Telegram accounts designed to handle messages automatically. Users can interact with bots by sending them command messages in private or group chats.
These accounts serve as an interface for code running somewhere on your server.

<p align="center">
  <img width="60%" src="/screenshot.jpg">
</p>

This is a Telegram Bot that help you find the cheapest Spanish fuel station around your location.
The current downloaded Data is gathered from [Spainsh Portal](https://geoportalgasolineras.es) and is updated every 30 minutes.

Check out my bot in Telegram -> [@gasolinabaratabot](https://t.me/gasolinabaratabot)

## Run
Before run, edit the enviroment vars in package.json

```
git clone https://github.com/glococo/mongodb_geospatial.git
npm i
npm start
```
