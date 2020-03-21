'use strict'

const now   =     _ => `[ ${new Date().toISOString().slice(0,19)} ] : `
const log   = (...v)=> console.log(...v)
const fetch = require('node-fetch')
const db    = require('./api-db')
const url   = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

async function init(ctx,next){
  if( !ctx.db.updating && isMoreThanOneDayOld( ctx.db.lastUpdate ) ) requestDBupdate(ctx).finally( _=>ctx.db.updating=false )
  if( !ctx.session.radio ) ctx.session.radio= ctx.db.radios[2]*1000
  next().catch( e=>log( now()+'Next: '+ctx.message,e) )
}

function isMoreThanOneDayOld( lastUpdate ) {
  if( !lastUpdate ) return true
  let rightNow = Math.round( new Date().getTime() / 1000 / 60 )
  if( (rightNow - lastUpdate) > (24*60) ) return true
  return false
}
async function requestDBupdate(ctx) {
  if( process.env.NOW_REGION ) return   // Don't do DBupdate in NOW hobby plan since it will took more than 10 seconds to complete and NOW will destroy the thread.
  ctx.db.updating = true
  if( !ctx.db.lastUpdate ) ctx.db.lastUpdate = await db.lastUpdateInMinutes()
  if( !isMoreThanOneDayOld( ctx.db.lastUpdate ) ) return
  let response = await fetch( url )
  let body = await response.json()
  let stations = await db.sanitize( body )
  log( now()+'Received records ... ' , stations)
  if( stations > 1000 ) ctx.db.lastUpdate = await db.lastUpdateInMinutes()
  ctx.db.updating = false
}

function start(ctx) {
  ctx.reply(`👋 Hi !\nSend me a 📎 Location inside Spain and I will search the cheapest fuel station in a ${ctx.session.radio/1000} kmts radius.
              \n\nSend me a /radio command to change your radius search preferences.`)
}

function uptime( elapsed ){
  if( !elapsed ) elapsed = process.uptime()
  let tSeconds = Math.floor( elapsed )
  let days     = Math.floor( tSeconds / 86400 )
  let hours    = Math.floor( tSeconds % 86400 / 3600 )
  let minutes  = Math.floor( tSeconds % 86400 % 3600 / 60 )
  let seconds  = Math.floor( tSeconds % 86400 % 3600 % 60 )
  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
}
async function lastDBupdate(){
  let lastUpdate = await db.lastUpdate()
  if( !lastUpdate ) return 'Error connectng. Try again.'
  return 'Last DB Update ' + uptime( Date.now()/1000 - lastUpdate ) + '\nVM Uptime ' + uptime()
}
module.exports= { start, init, uptime, lastDBupdate }
