const mongoClient = require('mongodb').MongoClient;
const state ={
    db: null
}
module.exports.connect = async function(done){
    const url = 'mongodb://localhost:27017';
    const dbName = 'shopping';
    try {
        const client = await mongoClient.connect(url);
        state.db = client.db(dbName);
        done();
    } catch (error) {
        done(error);
    }
};
module.exports.get = function(){
    return state.db;
}