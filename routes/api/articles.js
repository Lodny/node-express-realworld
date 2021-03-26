const router = require('express').Router();
const auth = require('../auth');
const Article = require('mongoose').model('Article');
const User = require('mongoose').model('User');
const Comment = require('mongoose').model('Comment');

// doing something with params before router execution
router.param('slug', (req, res, next, slug) => {
  console.log('ROUTE articles : before articles route : param : slug ', slug);
  Article.findOne({ slug: slug })
    .populate('author')
    .then((article) => {
      if (!article) return res.sendStatus(404);

      req.ARTICLE = article;

      return next();
    })
    .catch(next);
});

// get article
router.get('/:slug', auth.optional, async (req, res, next) => {
  console.log('ROUTE articles : get : article : ', req.article);

  let user = null;
  if (req.AUTH) user = await User.findById(req.AUTH.id);

  return res.json({ article: req.ARTICLE.toJSONFor(user) });
});

// get article list
router.get('/', async (req, res, next) => {
  var query = {};
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = { $in: [req.query.tag] };
  }

  const author = req.query.author ? await User.findOne({ username: req.query.author }) : null;
  if (author) query.author = author._id;

  console.log('ROUTE articles : get : articles : ', limit, offset, query);
  const articles = await Article.find(query)
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ createdAt: 'desc' })
    .populate('author')
    .exec();

  // console.log('ROUTE articles : router : articles : ', articles);
  // return res.json({ articles: articles, articlesCount: articles.length });

  return res.json({
    articles: articles.map((article) => article.toJSONFor()),
    articlesCount: articles.length,
  });

  // Promise.all([
  //   req.query.author ? User.findOne({username: req.query.author}) : null,
  //   req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  // ]).then(function(results){
  //   var author = results[0];
  //   var favoriter = results[1];

  //   if(author){
  //     query.author = author._id;
  //   }

  //   if(favoriter){
  //     query._id = {$in: favoriter.favorites};
  //   } else if(req.query.favorited){
  //     query._id = {$in: []};
  //   }

  //   return Promise.all([
  //     Article.find(query)
  //       .limit(Number(limit))
  //       .skip(Number(offset))
  //       .sort({createdAt: 'desc'})
  //       .populate('author')
  //       .exec(),
  //     Article.count(query).exec(),
  //     req.payload ? User.findById(req.payload.id) : null,
  //   ]).then(function(results){
  //     var articles = results[0];
  //     var articlesCount = results[1];
  //     var user = results[2];

  //     return res.json({
  //       articles: articles.map(function(article){
  //         return article.toJSONFor(user);
  //       }),
  //       articlesCount: articlesCount
  //     });
  //   });
  // }).catch(next);
});

// add
router.post('/', auth.required, async (req, res, next) => {
  console.log('ROUTE articles : post : add : body : ', req.body);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).send('Token is not correct with User data');

  const article = new Article(req.body.article);
  // article.author = user;

  return article
    .save()
    .then(() => res.json({ article: article.toJSONFor(user) }))
    .catch(next);
});

// update
router.put('/:slug', auth.required, async (req, res, next) => {
  console.log('ROUTE articles : put : update : req.body : ', req.body);

  // console.log('ROUTE articles : put : update : AUTH.id : ', req.AUTH.id);
  // console.log('ROUTE articles : put : update : ARTICLE.author._id : ', req.ARTICLE.author._id);

  if (req.ARTICLE.author._id.toString() === req.AUTH.id.toString()) {
    User.findById(req.AUTH.id).then((user) => {
      if (typeof req.body.article.title !== 'undefined') {
        req.ARTICLE.title = req.body.article.title;
      }

      if (typeof req.body.article.description !== 'undefined') {
        req.ARTICLE.description = req.body.article.description;
      }

      if (typeof req.body.article.body !== 'undefined') {
        req.ARTICLE.body = req.body.article.body;
      }

      if (typeof req.body.article.tagList !== 'undefined') {
        req.ARTICLE.tagList = req.body.article.tagList;
      }

      req.ARTICLE.save()
        .then((article) => {
          return res.json({ article: article.toJSONFor(user) });
        })
        .catch(next);
    });
  } else {
    res.status(403).send('Token is broken.');
  }
});

// Comments ======================================================================================
// -----------------------------------------------------------------------------------------------
router.post('/:slug/comments', auth.required, async (req, res, next) => {
  console.log('ROUTE comments : post[add] : ', req.body);
  // console.log('ROUTE comments : req.ARTICLE : ', req.ARTICLE);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).send('Token is not correct with User data');

  const comment = new Comment(req.body.comment);
  comment.author = user;
  comment.article = req.ARTICLE;
  // console.log(comment);
  return comment
    .save()
    .then(() => res.json({ comment: comment.toJSONFor(user, req.ARTICLE) }))
    .catch(next);
});

router.get('/:slug/comments', auth.optional, async (req, res, next) => {
  console.log('ROUTE comments : get all : ');
  console.log('ROUTE comments : article : ', req.ARTICLE);

  const comments = await Comment.find({ article: req.ARTICLE._id });
  console.log('ROUTE comments : comments : ', comments);

  res.send('get comments');
});

module.exports = router;
