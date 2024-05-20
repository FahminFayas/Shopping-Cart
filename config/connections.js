const mongoClient = require('mongodb').mongoClient;
const state ={
    db: null
}
module.exports.connect = function(done){
    const url = 'mongodb://localhost:27017';
    const dbName = 'shoppingDB';
    mongoClient.connect(url, function(err, data){
        if(err){
            return done(err);
        }
        state.db = data.db(dbName);
        done();
    });
}
module.exports.get = function(){
    return state.db;
}