var express = require('express');
var router = express.Router();
var productHelper = require('../config/helpers/product-helper');

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products);
  res.render('admin/view-products',{admin: true,products})

  })
  
});
router.get('/add-product', function(req, res,) {
  res.render('admin/add-product');
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
router.get('/delete-product/:id', function(req, res) {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/');
  })
});

module.exports = router;
