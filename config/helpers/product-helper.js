var db = require('../connections');
var collection = require('../collections');
var objectId = require('mongodb').ObjectId;
module.exports = {
    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data);
            callback(data.insertedId);
        });
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray();
            resolve(products);
        });
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({ _id: new objectId(proId)}).then((response) => {
                resolve(response);
            })
        });
    }
}