var express = require('express');
var router = express.Router();
var productHelper = require('../config/helpers/product-helper');
var adminHelper = require('../config/helpers/admin-helper');

const verifyLogin = (req,res,next)=> {
  if(req.session.admin){
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
  res.render('admin/view-products',{admin:true,products})

  })
  
});
router.get('/login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/');
  } else {
    res.render('admin/login',{adminLoginErr:req.session.adminLoginErr});
    req.session.adminLoginErr = false;
  }
});
router.post('/login', (req, res) => {
  adminHelper.doLoginAdmin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.admin.loggedIn = true;
      res.redirect('/admin');
    } else {
      req.session.adminLoginErr = "are you sure you are an admin?";
      res.redirect('/admin/login');
    }
  });
});
router.get('/add-product',verifyLogin, function(req, res,) {
  res.render('admin/add-product',{admin:true});
});
router.post('/add-product', function(req, res) {

  productHelper.addProduct(req.body, (id)=>{
    let image = req.files.Image;
    console.log(id);// added console.log to check the id
    image.mv('./public/images/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product');
      }else{
        console.log(err);
      }
    })
    
  });
});
router.get('/delete-product/:id',verifyLogin, function(req, res) {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/');
  })
});


router.get('/edit-product/:id',verifyLogin,  async function(req, res) {
  let product = await productHelper.getProductDetails(req.params.id);
  console.log(product);
  res.render('admin/edit-product',{admin:true,product});
});

router.post('/edit-product/:id', function(req, res) {
  console.log(req.params.id);
  let id = req.params.id;
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/');
    if(req.files && req.files.Image){
      let image = req.files.Image;
      image.mv('./public/images/product-images/'+id+'.jpg');
    }
  });
})

module.exports = router;
