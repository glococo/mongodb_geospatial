'use strict'
const mongo = require('mongoose')
const log   = (...v)=> console.log(...v)

mongo.connect( process.env.MONGO_DB, { useNewUrlParser:true } )
        .then( _=>log('MongoDB Connected'))
       .catch( e=>log("MongoDB connect error",e) )

const fuel     = mongo.Schema({ }, { strict:false, _id:false })
const location = mongo.Schema({ type:{type:String}, coordinates:[Number] }, { _id:false })
const stations = mongo.model('stations', { id:Number, name:String, addr:String, hour:String, location:{ type:location, index:'2dsphere' }, prices:fuel }, 'stations')

async function updateStations( data ) {
  await stations.remove({})
  stations.insertMany( data )
    .then( resp=>log( resp.length+" records uploaded.") )
    .catch( err=>log("Uploading err->",err) )
}

module.exports= { updateStations, stations }
