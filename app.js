#!/usr/bin/env node
'use strict'

require('now-env')
const log     = (...v)=> console.log(...v)
const Telegraf= require('telegraf')
const session = require('telegraf/session')
const Stage   = require('telegraf/stage')

//require('./api-db-init')
const location= require('./api-location')
const scenes  = require('./api-scenes')
const command = require('./api-command')
const stage   = new Stage([ scenes.radio ], { ttl: 10 })
const radios  = [1, 2, 5, 10, 25, 50]

const bot= new Telegraf( process.env.BOT_TOKEN )
bot.context.db= { radios:radios, radTxt:radios.reduce((ac,e)=>[...ac,e.toString()],[]) }

bot.use( session() )
   .use( command.logger )
   .use( stage.middleware() )
   .start( command.start )
   .command('ayuda', command.start )
   .command('uptime', command.uptime )
   .command('radio', ctx=> ctx.scene.enter('radio') )
   .on('message', location.onMessage )
   .startPolling()

log( "MongoDB Geospatial Demo working on real data from Spainsh Fuel Stations" )
