var express = require('express');
var router = express.Router();
var Page = require('../models/pages')
var Product = require('../models/products')
var Categories = require('../models/categories')

router.get('/', function(req, res) {
    Product.find(function(err, product){
        if(err){
          console.log(err)
        }
        res.render('all_product', {
          title: 'All Product',
          product: product
        })
    })
});

router.get('/category/:category', function(req, res){
  var categoryLink = req.params.category;

  Categories.findOne({link:categoryLink}, function(err, cat){
    Product.find({categories: categoryLink}, function(err, product){
      if(err){
        console.log(err)
      }
      res.render('cat_product', {
        title: "cat.title",
        product: product
      });
    });
  });
});

router.get('/detail/:product', function(req, res){
  Product.findOne({link: req.params.product}, function(err, product){
    if(err){
      console.log(err)
    }
    res.render('product_detail', {
      product: product
    })
  });
});

module.exports = router;