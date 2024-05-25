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
    addToCart: (proId, userId) => {
        let proObj = {
            item: new objectId(proId),
            quantity: 1
        
        };
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)});
            if(userCart){
                let proExist = userCart.products.findIndex(product=>product.item==proId);
                console.log(proExist);
                console.log('proExist');
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId),'products.item':new objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }).then((response)=>{
                        resolve();
                    });
                } else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user: new objectId(userId)},
                {
                    $push:{products: proObj}
                }).then((response)=>{
                    resolve();
                });
                }
            }else{
                let cartObj = {
                    user: new objectId(userId),
                    products:[proObj]
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
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTIONS,
                //         let:{prodList:'$products'},
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id','$$prodList']
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItems'
                //     }
                // }
            ]).toArray();
            console.log(cartItems);
            resolve(cartItems);
            
        })
    },
    getCartCount: (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)});
            if(cart){
                count = cart.products.length;
            }
            resolve(count);
        });
    },
    changeProductQuantity: (details)=>{
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:new objectId(details.cart)},
                {
                    $pull:{products:{item:new objectId(details.product)}}
                }).then((response)=>{
                    resolve({removeProduct:true});
                });
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:new objectId(details.cart),'products.item':new objectId(details.product)},
                {
                    $inc:{'products.$.quantity':details.count}
                }).then((response)=>{
                    resolve({status:true});
                });
            }
        });
    },
    removeProduct: (details)=>{
        return new Promise((resolve,reject)=>{
            console.log('removeProduct')
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:new objectId(details.cart)},
            {
                $pull:{products:{item:new objectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true});
            });
        });
    }
    
}