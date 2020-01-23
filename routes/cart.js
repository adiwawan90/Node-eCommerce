var express = require('express');
var router = express.Router();
var Product = require('../models/products');

router.get('/add/:product', function(req, res){
    // membuat var dr url
    var link = req.params.product;

    Product.findOne({link:link}, function(err, product){ //mencari data product melalui link yg sdh didapat
        if(err){ //jika error
            console.log(err)
        }
        if(typeof req.session.cart == 'undefined'){
            req.session.cart = [];
            req.session.cart.push({
                title:link,
                qty: 1,
                price: product.price,
                image: '/product_images/'+product._id+'/'+product.image
            });
        }else{
            var cart = req.session.cart;
            var newItem = true;

            for (let i = 0; i < cart.length; i++) {
                if(cart[i].title == link){
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if(newItem){
                cart.push({
                    title: link,
                    qty: 1,
                    price: product.price,
                    image: '/product_images/'+product._id+'/'+product.image
                });
            }
        }

        req.flash('success', 'Product berhasil ditambahkan');
        res.redirect('back');

    });
});

module.exports = router;