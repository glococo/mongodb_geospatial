'use strict'

const mongo = require('mongoose')
const log   = (...v)=> console.log(...v)
const now   =     _ => `[ ${new Date().toISOString().slice(0,19)} ] : `

let conn, fuel, location, station

const connect= _=> new Promise( async (resolve,reject) => {
  if ( conn ) return resolve(1)
  conn = await mongo.createConnection( process.env.MONGO_DB, { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true, bufferCommands:false, bufferMaxEntries:0 } ).catch( _=>reject(0) )
  if ( !conn ) return setTimeout( _=>connect(), 2000)

  fuel     = new mongo.Schema({ }, { strict:false, _id:false })
  location = new mongo.Schema({ type:{type:String}, coordinates:[Number] }, { _id:false })
  station  = conn.model('stations', { id:Number, name:String, addr:String, hour:String, location:{ type:location, index:'2dsphere' }, prices:fuel }, 'stations')

  return resolve(1)
})
async function findStations(location, radio) {
  while(!conn) { await connect() }
  return station.find({ location:{ $near:{ $geometry:{ type:"Point", coordinates: location }, $maxDistance: radio } } }).lean()
}
async function findCloserStations(location, radio, fuel) {
  while(!conn) { await connect() }
  return station.aggregate([
                  { $geoNear:{ near:{ type:"Point", coordinates: location }, distanceField: "metersAway", maxDistance: radio, query:{ [fuel]:{ $exists:true } }, spherical: true } },
                  { $sort:{ [fuel]: 1 } },
                  { $limit: 3 }
               ])
}
async function updateStations( data ) {
  while(!conn) { await connect() }
  await station.deleteMany({})
  let update = await station.insertMany( data ).catch( err=>log("Uploading err->",err) )
  return update.length
}

async function lastUpdateInMinutes() {
  while(!conn) { await connect() }
  let recordDay = await station.findOne({},{_id:1}).catch( e=> log('Error getting timestamp of one document') )
  return Math.round( recordDay._id.getTimestamp() /1000 /60 ) // returning timestamp without seconds and milliseconds
}

async function lastUpdate() {
  while(!conn) { await connect() }
  let recordDay = await station.findOne({},{_id:1}).catch( e=> log('Error getting timestamp of one document') )
  return Math.round( recordDay._id.getTimestamp() /1000 ) // returning timestamp without milliseconds
}

async function sanitize(list){
  while(!conn) { await connect() }
  let update=[]
  list.ListaEESSPrecio.forEach(e=>{
    let provider= { prices:{}, location:{ type: "Point", coordinates:[] } }
    if( !e.Latitud || !e['Longitud (WGS84)'] ) return
    provider.id = +e['IDEESS']
    provider.name= e['Rótulo']
    provider.hour= e['Horario']
    provider.addr= e['Dirección']
    provider.location.coordinates.push( ( typeof e['Longitud (WGS84)']=="string" )? +(e['Longitud (WGS84)'].replace(',','.')) : e['Longitud (WGS84)'] )
    provider.location.coordinates.push( ( typeof e.Latitud=="string" )? +(e.Latitud.replace(',','.')) : e.Latitud )
    Object.keys(e).filter( f=> (f.match(/^Precio/) && e[f]) ).forEach(f=> provider.prices[f.replace('Precio','').trim().replace('  ',' ')]=+e[f].replace(',','.'))
    update.push( provider )
  })
  if( !update.length ) return log("Error: No Stations processed")
  return await updateStations( update )
}

module.exports= { findStations, findCloserStations, lastUpdateInMinutes, sanitize, lastUpdate }
