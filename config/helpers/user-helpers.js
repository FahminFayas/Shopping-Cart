var db = require('../connections');
var collection = require('../collections');
const bcrypt = require('bcrypt');
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
    }
}