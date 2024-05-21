var express = require('express');
var router = express.Router();
var productHelper = require('../config/helpers/product-helper');
const userHelper = require('../config/helpers/user-helpers');


/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.session.user;
  console.log(user);
  productHelper.getAllProducts().then((products)=>{
  res.render('user/view-products',{products,user})

  })
});
router.get('/login',(req, res) => {
  res.render('user/login');
});
router.get('/signup',(req, res) => {
  res.render('user/signup');
});
router.post('/signup',(req, res) => {
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response);
  })
});
router.post('/login',(req, res) => {
  userHelper.doLogin(req.body).then((response)=>{
    console.log(response);
  })
});
router.get('/logout',(req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
