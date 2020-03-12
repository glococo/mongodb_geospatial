'use strict'

const log   = (...v)=> console.log(...v)
const fetch = require('node-fetch')
const db    = require('./api-db')
const url   = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

async function init(ctx,next){
  if( !ctx.db.updating && (!ctx.db.lastUpdate || isMoreThanOneDayOld( ctx.db.lastUpdate )) ) requestDBupdate(ctx).catch( _=>ctx.db.updating=false )
  if( !ctx.session.radio ) ctx.session.radio= ctx.db.radios[2]*1000
  next().catch( e=>log("Next: "+ctx.message,e) )
}

function isMoreThanOneDayOld( lastUpdate ) {
  if( !lastUpdate ) return true
  let now = Math.round( new Date().getTime() / 1000 / 60 )
  if( (now - lastUpdate) > (24*60) ) return true
  return false
}
async function requestDBupdate(ctx) {
  ctx.db.updating = true
  if( !ctx.db.lastUpdate ) {
    ctx.db.lastUpdate = await db.lastUpdateInMinutes()
    ctx.db.updating = false
    return !isMoreThanOneDayOld( ctx.db.lastUpdate )
  }
  let response = await fetch( url )
  let body     = await response.json()
  let stations = await db.sanitize( body )
  log('Received records ... ' + stations)
  if( stations > 1000 ) ctx.db.lastUpdate = await db.lastUpdateInMinutes()
  ctx.db.updating = false
}

function start(ctx) {
  ctx.reply(`👋 Hi !\nSend me a 📎 Location inside Spain and I will search the cheapest fuel station in a ${ctx.session.radio/1000} kmts radius.
              \n\nSend me a /radio command to change your radius search preferences.`)
}

module.exports= { start, init }
