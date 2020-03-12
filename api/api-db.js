'use strict'

const mongo = require('mongoose')
const log   = (...v)=> console.log(...v)
const now   =     _ => `[ ${new Date().toISOString().slice(0,19)} ] : `

mongo.connect( process.env.MONGO_DB, { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex:true } )
        .then( _=>log( now()+'MongoDB Connected') )
       .catch( e=>log( now()+'MongoDB connect error',e) )

const fuel     = mongo.Schema({ }, { strict:false, _id:false })
const location = mongo.Schema({ type:{type:String}, coordinates:[Number] }, { _id:false })
const stations = mongo.model('stations', { id:Number, name:String, addr:String, hour:String, location:{ type:location, index:'2dsphere' }, prices:fuel }, 'stations')

async function updateStations( data ) {
  await stations.deleteMany({})
  let update = await stations.insertMany( data ).catch( err=>log("Uploading err->",err) )
  return update.length
}

async function lastUpdateInMinutes() {
  let recordDay = await stations.findOne({},{_id:1}).catch( e=> log('Error getting timestamp of one document') )
  return Math.round( recordDay._id.getTimestamp() /1000 /60 ) // returning timestamp without seconds and milliseconds
}

async function sanitize(list){
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

module.exports= { stations, lastUpdateInMinutes, sanitize }
