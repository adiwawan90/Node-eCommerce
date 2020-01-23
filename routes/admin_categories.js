var express = require('express');
var router = express.Router();
var Categories = require('../models/categories');

router.get('/', function(req, res) {
  // res.send('Hello World')
  // res.render('index', {
  //   h1: 'Babastudio ADMIN',
  //   p: 'Ini area Admin yaa'
  // });
  Categories.find({})
    .sort({ sorting: 1 })
    .exec(function(err, categories) {
      res.render('admin/categories', {
        categories: categories
      });
    });
});

//
router.get('/add-categories', function(req, res) {
  var title = '';

  res.render('admin/add-categories', {
    title: title
  });
});

router.post('/add-categories', function(req, res) {
  // req.checkBody('title', 'Title is required.').notEmpty();
  req.checkBody('title', 'Title harus diisi.!').notEmpty();

  var title = req.body.title;
  var link = req.body.title.replace(/\s+/g, '-').toLowerCase();

  // jika program error
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add-categories', {
      errors: errors,
      title: title
    });
  } else {
    // console.log('Berhasil..!');
    Categories.findOne({ link: link }, function(err, categories) {
      if (categories) {
        req.flash('danger', 'categories telah ada, silakan gunakan nama lain');
        res.render('admin/add-categories', {
          title: title
        });
      } else {
        var categories = new Categories({
          title: title,
          link: link
        });

        categories.save(function(err) {
          if (err) {
            return console.log(err);
          }
          Categories.find(function(err, categoriess) {
            if (err) {
              console.log(err);
            } else {
              req.app.locals.categories = categoriess;
            }
          });
          req.flash('success', 'Categories berhasil ditambahkan');
          res.redirect('/admin/categories');
        });
      }
    });
  }
});

router.get('/edit-categories/:id', function(req, res) {
  Categories.findById(req.params.id, function(err, categories) {
    if (err) {
      return console.log(err);
    }
    res.render('admin/edit_categories', {
      title: categories.title,
      id: categories._id
    });
  });
});

router.post('/edit-categories', function(req, res) {
  req.checkBody('title', 'Title harus diisi.!').notEmpty();

  var title = req.body.title;
  var link = req.body.title.replace(/\s+/g, '-').toLowerCase();

  var content = req.body.content;
  var id = req.body.id;

  var errors = req.validationErrors();

  if (errors) {
    res.render('/admin/edit_categories', {
      errors: errors,
      title: title,
      id: id
    });
  } else {
    Categories.findOne({ link: link, _id: { $ne: id } }, function(
      err,
      categories
    ) {
      if (categories) {
        req.flash('danger', 'categories inisdh ada, Silakan gunakan nama lain');
        res.render('admin/edit_categories', {
          title: title,
          id: id
        });
      } else {
        Categories.findById(id, function(err, categories) {
          if (err) {
            return console.log(err);
          }

          categories.title = title;
          categories.link = link;
          categories.save(function(err) {
            if (err) {
              return console.log(err);
            }
            Categories.find({})
              .sort({ sorting: 1 })
              .exec(function(err, categoriess) {
                if (err) {
                  return console.log(err);
                } else {
                  req.app.locals.categoriess = categoriess;
                }
              });

            req.flash('success', 'Categories Berhasil Diubah');
            res.redirect('/admin/categories/edit-categories/' + id);
          });
        });
      }
    });
  }
});

router.get('/delete-categories/:id', function(req, res) {
  Categories.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      return console.log(err);
    }
    Categories.find(function(err, categories) {
      if (err) {
        return console.log(err);
      } else {
        req.app.locals.categories = categories;
      }
      req.flash('success', 'Categories berhasil dihapus.!');
    });
    res.redirect('/admin/Categories');
  });
});

module.exports = router;
