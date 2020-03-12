#!/usr/bin/env node
'use strict'

const log     = (...v)=> console.log(...v)
const now     =     _ => `[ ${new Date().toISOString().slice(0,19)} ] : `
const Telegraf= require('telegraf')
const session = require('telegraf/session')
const Stage   = require('telegraf/stage')

const location= require('./api-location')
const scenes  = require('./api-scenes')
const { start, init } = require('./api-command')
const stage   = new Stage([ scenes.radio ], { ttl: 60 })
const radios  = [1, 2, 5, 10, 15, 25]

const bot= new Telegraf( process.env.BOT_TOKEN, { telegram:{ webhookReply: false } } )
bot.context.db= { lastUpdate: null, updating: false, radios:radios, radTxt:radios.reduce((ac,e)=>[...ac,e.toString()],[]) }

bot.use( session() )
   .use( init )
   .use( stage.middleware() )
   .start( start )
   .command('ayuda', start )
   .command('radio', ctx=> ctx.scene.enter('radio') )
   .on('message', location.onMessage )

log( "MongoDB Geospatial Demo working on real data from Spainsh OpenData Portal - Fuel Stations" )

if ( require.main === module ) {
    bot.telegram.deleteWebhook().then( _=> bot.startPolling() )
    log( `${now()} Bot started` )
} else {
    if( process.env.NOW_REGION ) bot.telegram.setWebhook('https://mongodb-geospatial.now.sh/api/app')   // running on zeit.co
    module.exports = bot.webhookCallback('/api/app')
}
