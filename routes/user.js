var express = require('express');
var router = express.Router();
var productHelper = require('../config/helpers/product-helper');
const userHelper = require('../config/helpers/user-helpers');

const verifyLogin = (req,res,next)=> {
  if(req.session.loggedIn){
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let cartCount = null;
  let user = req.session.user;
  console.log(user);
  if (req.session.user){
  cartCount = await userHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', { products, user, cartCount });

  })
});
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
  } else {
    res.render('user/login',{loginErr:req.session.loginErr});
    req.session.loginErr = false;
  }
});
router.get('/signup', (req, res) => {
  res.render('user/signup');
});
router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect('/');
  })
});
router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect('/login');

    }
  });
});
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
router.get('/cart', verifyLogin, async(req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id);
  let totalValue = await userHelper.getTotalAmount(req.session.user._id);
  console.log(products);
  res.render('user/cart',{products,totalValue,user:req.session.user});
});
router.get('/add-to-cart/:id', (req, res) => {
  console.log('api called')
  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    //res.redirect('/');
    res.json({status:true});
  });
});
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body);
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelper.getTotalAmount(req.body.user);
    res.json(response);
  
  });
});
router.post('/remove-product',(req,res,next)=>{
  console.log(req.body);
  userHelper.removeProduct(req.body).then((response)=>{
    res.json(response);
  });
});
router.get('/place-order',verifyLogin,async(req,res)=>{
  let total = await userHelper.getTotalAmount(req.session.user._id);
  if(total === 0){
    res.redirect('/cart');
  }else {
  res.render('user/place-order',{total,user:req.session.user});

  }
});
router.post('/place-order',async(req,res)=>{
  let products = await userHelper.getCartProductList(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body.payment === 'COD'){
      console.log('req.body.payment:'+ req.body.payment);
      res.json({codSuccess:true});
  } else{
    userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
      res.json(response);
    });
  }
}); 
});
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user});
});
router.get('/orders',async(req,res)=>{
  if (req.session.user) {
    let orders = await userHelper.getUserOrders(req.session.user._id);
    // rest of your code
    console.log(orders);
    res.render('user/orders',{user:req.session.user,orders});
  } else {
    // handle the case where the user is not logged in
    // for example, redirect to the login page
    res.redirect('/login');
  }
});
router.get('/view-order-products/:id',async(req,res)=>{
  let products = await userHelper.getOrderProducts(req.params.id);
  res.render('user/view-order-products',{user:req.session.user,products});
});
router.post('/verify-payment',(req,res)=>{
  console.log('payment api called');
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment success');
      res.json({status:true});
    });
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''});
  });
});
module.exports = router;
