const router = require('express').Router();
const auth = require('../auth');
const Article = require('mongoose').model('Article');
const User = require('mongoose').model('User');
const Comment = require('mongoose').model('Comment');
const validator = require('../validation');

// Param ==========================================================================================
// doing something with params before router execution
router.param('slug', (req, res, next, slug) => {
  if (slug === 'feed') return next();

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

router.param('id', (req, res, next, id) => {
  console.log('ROUTE articles/comments : before articles route : param : id ', id);
  Comment.findOne({ _id: id })
    .then((comment) => {
      if (!comment) return res.sendStatus(404);

      req.COMMENT = comment;

      return next();
    })
    .catch(next);
});

// Article ==========================================================================================
// get feed list : Feed Articles created by followed users
// 아래 slug를 받는 것보다 먼저 와야 한다.
// router.get('/feed', auth.requiredIfget, async (req, res, next) => {
router.get('/feed', auth.required, async (req, res, next) => {
  console.log('ROUTER : articles/feed : your feed : req.AUTH : ', req.AUTH);
  // console.log('ROUTER : articles/feed : your feed : req.DOC : ', req.DOC);
  console.log('ROUTER : articles/feed : your feed : req.query : ', req.query);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).send('Token does not match');

  var query = {};
  var limit = 10;
  var offset = 0;

  // from following me
  // const followers = await User.find({ following: { $in: [req.AUTH.id] } });
  // console.log('ROUTER : articles/feed : followers.length :  : ', followers.length);
  // const articles = await Article.find({ author: followers }).populate('author').exec();
  // console.log('ROUTER : articles/feed : articles.length :  : ', articles.length);
  // console.log('ROUTER : articles/feed : articles :  : ', articles);

  const articles = await Article.find({ author: { $in: user.following } })
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ createdAt: 'desc' })
    .populate('author')
    .exec();
  console.log('ROUTER : articles/feed : articles.length :  : ', articles.length);
  // console.log('ROUTER : articles/feed : articles :  : ', articles);

  return res.json({ articles: articles.map((article) => article.toJSONFor(user)) });
});

// get one article
router.get('/:slug', auth.optional, async (req, res, next) => {
  console.log('ROUTE articles : get : article : ', req.article);

  const user = req.AUTH ? await User.findById(req.AUTH.id) : null;

  return res.json({ article: req.ARTICLE.toJSONFor(user) });
});

// get article list
router.get('/', auth.optional, async (req, res, next) => {
  console.log('ROUTER : articles : get all : req.AUTH : ', req.AUTH);

  var query = {};
  var limit = 20;
  var offset = 0;
  // ?tag=AngularJS  // ?author=jake  // ?favorited=jake  // ?limit=20  // ?offset=0
  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== 'undefined') {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tagList = { $in: [req.query.tag] };
  }

  if (req.query.author) {
    const author = await User.findOne({ username: req.query.author });
    if (!author) return res.status(401).json({ errors: { query: ['is wrong.'] } }); // go home ??
    query.author = author._id;
  }

  if (req.query.favorited) {
    const favoritedUser = await User.findOne({ username: req.query.favorited });
    if (!favoritedUser) return res.status(401).json({ errors: { query: ['is wrong.'] } }); // go home ??
    query._id = favoritedUser.favorites;
    // query._id = {$in: favoriter.favorites};
  }

  let user = null;
  if (req.AUTH) {
    user = await User.findById(req.AUTH.id);
    if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });
  }

  console.log('ROUTER articles : get : articles : ', limit, offset, query);
  const articles = await Article.find(query)
    .skip(Number(offset))
    .limit(Number(limit))
    .sort({ createdAt: 'desc' })
    .populate('author')
    .exec();

  // console.log('ROUTER articles : ', articles);
  console.log('ROUTER articles : articles.length : ', articles.length);

  // return res.json({
  //   articles: articles.map((article) => article.toJSONFor()),
  //   articlesCount: articles.length
  // });
  return res.json({ articles: articles.map((article) => article.toJSONFor(user)) });
});

// add article
router.post(
  '/',
  auth.required,
  validator(['title', 'description', 'body'], 'article'),
  async (fields, req, res, next) => {
    console.log('ROUTE articles : post : add : fields : ', fields);
    console.log('ROUTE articles : post : add : req.body : ', req.body);
    console.log('ROUTE articles : post : add : req.AUTH : ', req.AUTH);

    const user = await User.findById(req.AUTH.id);
    if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });

    const article = new Article(req.body.article);
    article.author = user;

    return article
      .save()
      .then(() => res.json({ article: article.toJSONFor(user) }))
      .catch(next);
  }
);

// update article
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
    return res.status(403).send('Token is broken.');
  }
});

// delete article
router.delete('/:slug', auth.required, async (req, res, next) => {
  console.log('ROUTER articles : delete : req.AUTH : ', req.AUTH);
  console.log('ROUTER articles : delete : req.ARTICLE : ', req.ARTICLE);

  return req.ARTICLE.remove().then(() => res.status(200).json({}));
});

// Favorite ======================================================================================
// favorite
router.post('/:slug/favorite', auth.required, async (req, res, next) => {
  console.log('ROUTE favorite : AUTH : ', req.AUTH);
  console.log('ROUTE favorite : ARTICLE : ', req.ARTICLE);

  const user = await User.findById(req.AUTH.id);
  if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });

  console.log('favorites : ', user.favorites, req.ARTICLE._id);
  const favorited = user.favorites.find((id) => id.toString() === req.ARTICLE._id.toString());
  console.log('ROUTE favorite : favorited : ', favorited);

  if (favorited) {
    // unfavorited
    req.ARTICLE.favoritesCount--;
    user.favorites = user.favorites.filter((id) => id.toString() !== req.ARTICLE._id.toString());
  } else {
    // favorited
    req.ARTICLE.favoritesCount++;
    user.favorites.push(req.ARTICLE._id);
  }

  console.log('ROUTE favorite : user.favorites : ', user.favorites);

  return user
    .save()
    .then(() => req.ARTICLE.save().then(() => res.json({ article: req.ARTICLE.toJSONFor(user) })))
    .catch(next);
});

// Comments ======================================================================================
// -----------------------------------------------------------------------------------------------
// add comment
router.post('/:slug/comments', auth.required, validator(['body'], 'comment'), async (fields, req, res, next) => {
  console.log('ROUTER /comments : add : fields : ', fields);
  console.log('ROUTER /comments : add : req.body : ', req.body);

  const user = await User.findById(req.AUTH.id);
  // if (!user) return res.status(401).send('Token is not correct with User data');
  if (!user) return res.status(401).json({ errors: { token: ['is broken.'] } });

  const comment = new Comment(req.body.comment);
  comment.article = req.ARTICLE;
  comment.author = user;
  // console.log(comment);
  return comment
    .save()
    .then(() => {
      req.ARTICLE.comments.push(comment);
      return req.ARTICLE.save().then((article) => res.json({ comment: comment.toJSONFor(user) }));
      // return req.ARTICLE.save().then( (article) => res.json({ comment: comment.toJSONFor(user, req.ARTICLE) }));
    })
    .catch(next);
});

// get article's comments
router.get('/:slug/comments', auth.optional, async (req, res, next) => {
  console.log('ROUTE comments : get all : article : ', req.ARTICLE);

  const user = req.AUTH ? await User.findById(req.AUTH.id) : null;
  const comments = await Comment.find({ article: req.ARTICLE._id }).populate('author').exec();
  // console.log('ROUTE comments : comments : ', comments);

  return res.json({
    comments: comments.map((comment) => {
      // comment.article = req.ARTICLE;
      return comment.toJSONFor(user);
    }),
    // comments: req.ARTICLE.comments.map((comment) => {
    //   console.log('ROUTE comment : ', comment);
    //   comment.article = req.ARTICLE;
    //   return comment.toJSONFor(user);
    // })
  });
});

// delete article's comment
router.delete('/:slug/comments/:id', auth.required, async (req, res, next) => {
  console.log('ROUTE comments : delete : comment : ', req.COMMENT);
  // console.log('ROUTE comments : delete : article : ', req.ARTICLE);

  // if (req.COMMENT.author === req.AUTH.id)
  // req.ARTICLE.comments = req.ARTICLE.comments.filter(comment => comment._id !== req.COMMENT._id);

  req.ARTICLE.comments.remove(req.COMMENT._id);
  return req.ARTICLE.save()
    .then(Comment.find({ _id: req.COMMENT._id }).deleteOne().exec())
    .then(() => res.sendStatus(204));
});

module.exports = router;
