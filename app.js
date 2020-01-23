var express = require('express'); //memasukkan express ke dalam file app
var path = require('path'); //path ini adlh module dr NodeJs, utk menyediakan jalur routing url
var app = express(); //app menjalankan express
const mongoose = require('mongoose'); // import mongodb
const config = require('./config/database'); // ini link connection dr mongoDB
const bodyParser = require('body-parser');
const session = require('express-session');
var validation = require('express-validator'); //untuk validation
// const flash = require('express-flash-notification');
var fileUpload = require('express-fileupload')


// mongodb
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// create connection to mongodb
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("we're connected to mongoDB!");
});

// body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/jsonnpm install
app.use(bodyParser.json());

// express-session
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  })
);

// untuk message -express
app.use(require('connect-flash')());
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// ini untuk express-validator
app.use(validation({
  // membuat validator file imae upload
  customValidators: {
    isImage: function(value, filename) {
      var extension = (path.extname(filename)).toLowerCase();
      switch(extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg': 
          return '.jpeg';
        case '.png':
          return '.png';
        case "":
          return '.jpg';
        default:
          return false;
      }
    }
  }
}));


// Express file Upload
app.use(fileUpload())

app.set('views', path.join(__dirname, 'views')); //utk mngtur folder tampilan / menentukan layout. menggabungkan dirname(direktory name)
app.set('view engine', 'ejs'); //menentukan yg akan tampil dlm bentuk extension apa? disini mggnakn 'ejs' atau javascript

app.use(express.static(path.join(__dirname, 'public'))); //nanti semua akan mggnkan folder public

// set global error variable
app.locals.errors = null;

// app.get('/', function(req, res) {
//   // res.send('Hello World')
//   res.render('index',{
//     h1: "babastudio"
//   });
// });

app.get('*', function(req, res, next){
  res.locals.cart = req.session.cart;
  var cart = req.session.cart;
  var qty = 0;
  if(typeof cart == "undefined"){
    qty = 0;
  }else{
    for(var i=0; i<cart.length; i++){
      qty = qty + qty[i].qty;
    }
  }

  res.locals.qtyheader = qty;
  next();
});

var Page = require('./models/pages'); // ini ngambil schema
var pages = require('./routes/pages.js');
var pagesadmin = require('./routes/admin_pages.js');
var catadmin = require('./routes/admin_categories.js');
var productadmin = require('./routes/admin_product.js');
var Category = require('./models/categories');
var Productuser = require('./routes/product');
var cart = require('./routes/cart');
// app.use(flash(app));

app.use('/', pages);
app.use('/admin/pages', pagesadmin);
app.use('/admin/categories', catadmin);
app.use('/admin/product', productadmin);
app.use('/products', Productuser);
app.use('/cart', cart)

// Get all pages toheader.js
Page.find({}).sort({sorting:1}).exec(function(err, pages){
  if(err){
    console.log(err)
  }else {
    app.locals.pages = pages;
  }
});

// Get All categories 
Category.find(function(err, categories){
  if(err){
    console.log(err)
  }else{
    app.locals.categories = categories;
  }
})

var port = 3000;
app.listen(port, function() {
  console.log('server berjalan dgn port: ', port);
});
