var db = require('../connections');
var collection = require('../collections');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId;

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            console.log(userData);
            if (userData && typeof userData.password === 'string') {
                userData.password = await bcrypt.hash(userData.password, 10);
            } else {
                console.log('Invalid arguments to bcrypt.hash()');
            }
            console.log(userData.password);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                userData._id = data.insertedId;
                console.log(userData._id);
                resolve(data.insertedId);
            });
        });
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                Email:userData.Email
            });
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log('Login success');
                        response.user = user;
                        response.status = true;
                        resolve(response);
                    }else{
                        console.log('Login failed');
                        resolve({status:false});
                    }
                });
            }else{
                console.log('Login failed');
                resolve({status:false});
            }
        })
    },
    addToCart: (productId, userId) => {
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)});
            if(userCart){
                db.get().collection(collection.CART_COLLECTION).updateOne({user: new objectId(userId)},
                {
                    $push:{products: new objectId(productId)}
                }).then((response)=>{
                    resolve();
                });
            }else{
                let cartObj = {
                    user: new objectId(userId),
                    products:[new objectId(productId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve();
                });
            }
        });
    },
    getCartProducts: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        let:{prodList:'$products'},
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id','$$prodList']
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray();
            resolve(cartItems[0].cartItems);
            
        })
    }
    
}