var db = require('../connections');
var collection = require('../collections');
const { response } = require('express');
const { doLogin } = require('./user-helpers');
var objectId = require('mongodb').ObjectId;

module.exports = {
    doLoginAdmin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            console.log(adminData);
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({
                email: adminData.email,
                password: adminData.password
            })
            if (admin) {
                console.log('Admin Login success');
                response.admin = admin;
                response.status = true;
                resolve(response);
            } else {
                console.log('Admin Login failed');
                response.status = false;
                resolve(response);
            }
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(users);
        })
    }
}
