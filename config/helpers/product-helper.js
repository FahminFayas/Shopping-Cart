var db = require('../connections');
module.exports = {
    addProduct: (product, callback) => {
        db.get().collection('product').insertOne(product).then((data) => {
            console.log(data);
            callback(data.insertedId);
        });
    }
}