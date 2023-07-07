// >>>>>> MONGODB SETUP <<<<< ///

const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback)=>{
    MongoClient.connect('mongodb+srv://Utkarsharma:Utkarsh%40123@newcluster.qjhysui.mongodb.net/?retryWrites=true&w=majority')
    .then((client)=>{
        console.log('Connected to the server!');
        _db = client.db('shop');
        callback();
    })
    .catch(err => {
        console.log('Database Connection error : ',err)
        throw err; 
    });
}

const getDb = () => { 
    if(_db){
        return _db;
    }
    throw 'No database found!';
}
// module.exports = mongoConnect;

exports.mongoConnect = mongoConnect;   // here we are running the mongodb client server which will keep running.
exports.getDb = getDb;   // here we are returning a connection to the _db database.

