var db = require('../connections');
module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            callback(true);
        });
    }
}