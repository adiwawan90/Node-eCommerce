var express = require('express');
var router = express.Router();
var Page = require('../models/pages')

router.get('/', function(req, res) {
  Page.find({}).sort({sorting:1}).exec(function(err, pages){
    res.render('admin/pages',{
      pages: pages
    });
  });
});

router.get('/add-page', function(req, res) {
  var title = '';
  var link = '';
  var content = '';

  res.render('admin/add_page', {
    title: title,
    link: link,
    content: content
  });
});


router.post('/add-page', function(req, res) {
  req.checkBody('title', 'Title harus diisi.!').notEmpty();
  req.checkBody('content', 'Content harus diisi.!').notEmpty();

  var title = req.body.title;
  var link = req.body.link.replace(/\s+/g, '-').toLowerCase();
  if (link == '') {
    link = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;

  // jika program error
  var errors = req.validationErrors();

  if (errors) {
    res.render('admin/add_page', {
      errors: errors,
      title: title,
      link: link,
      content: content
    });
  } else {
    // console.log('Berhasil..!');
    Page.findOne({link:link}, function(err, page){
      if(page){
        req.flash('danger', 'Page telah ada, silakan gunakan nama lain');
        res.render('admin/add_page', {
          title: title,
          link: link,
          content: content
        });
      }else{
        var page = new Page({
          title: title,
          link: link,
          content: content,
          sorting: 100
        });

        page.save(function(err){
          if(err){
            return console.log(err);
          }
            Page.find({}).sort({sorting: 1}).exec(function(err, pages){
              if(err){
                console.log(err)
              }else{
                req.app.locals.pages = pages
              }
            });
            req.flash('success', "Page berhasil ditambahkan")
            var title = '';
            var link = '';
            var content = '';

            res.render('admin/add_page', {
              title: title,
              link: link,
              content: content
            });
        });
      }
    });
  }
});


// untuk sorting pages
function sortPages(ids,callbacks){
  var count = 0; 
  // melakukan looing krn id berupa list array.
    for (let i = 0; i < ids.length; i++) {
      var id = id[i];  // ini untuk menamung id satu2
      count ++;
  
      (function(count){
        Page.findById(id, function(err, page){
          page.sorting = count; 
          page.save(function(err){
            if(err){
              return console.log(err)
            }
            ++count;
            if(count >= ids.length){
              callbacks()
            }
          })
        })
      })(count);
    }
}

router.post('/reorder-pages', function(req, res){
  var ids = req.body['id[]']; // ini menagkap data dr admin/page.ejs

  sortPages(ids, function(){
    Page.find({}).sort({sorting:1}).exec(function(err, pages){
      if(err){
        console.log(err)
      }else {
        req.app.locals.pages = pages;
      }
    });
  })
})

router.get('/edit-page/:id', function(req, res) {

  Page.findById(req.params.id, function(err, page){
    if(err){
      return console.log(err)
    }
    res.render('admin/edit_page', {
      title: page.title,
      link: page.link,
      content: page.content,
      id: page._id
    });
  });
});

router.post('/edit-page',function(req, res){
  req.checkBody('title', 'Title harus diisi.!').notEmpty()
  req.checkBody('content', 'Content harus diisi.!').notEmpty()

  var title =  req.body.title;
  var link = req.body.link.replace(/\s+/g, '-').toLowerCase();
  if(link ==""){
    link = req.body.title.replace(/\s+/g, '-').toLowerCase();
  }
  var content = req.body.content;
  var id = req.body.id;

  var errors = req.validationErrors();

  if(errors){
    res.render('admin/edit_page', {
      errors : errors,
      title: title,
      link: link,
      content: content,
      id: id
    });
  }else{
    Page.findOne({link:link, _id: {'$ne':id}}, function(err, page){
      if(page){
        req.flash('danger', "Page ini sdh ada, Silakan gunakan nama lain");
        res.render('admin/edit_page', {
          title: title,
          link: link,
          content: content,
          id: id
        });
        // console.log('line183 '+title)
      }else{
        Page.findById(id, function(err, page){
          if(err){
            return console.log(err)
          }
          page.title = title;
          page.link = link;
          page.content = content;
          page.save(function(err){
            if(err){
              return console.log(err)
            }
            Page.find({}).sort({sorting:1}).exec(function(err, pages){
              if(err){
                return console.log(err)
              }else{
                req.app.locals.pages = pages
              }
            });
            // console.log(title)
            req.flash('success', "Page Berhasil Diubah");
            res.redirect('/admin/pages/edit-page/' + id)
          });
        });
      }
    });
  }
});

router.get('/delete-page/:id', function(req,res){
  Page.findByIdAndRemove(req.params.id, function(err){
    if(err){
      return console.log(err)
    }
    Page.find(function(err, pages){
      if(err){
        return console.log(err)
      }else{
        req.app.locals.pages = pages;
      }
    });
    req.flash('success', 'Page Berhasil Dihapus.!')
    res.redirect('/admin/pages')
  })
})

module.exports = router;
