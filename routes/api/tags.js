const router = require('express').Router();
const Article = require('mongoose').model('Article');

// Router ===========================================================
router.get('', async (req, res, next) => {
  console.log('ROUTER : /tags : ');

  // const tmp = await Article.find({ $where: 'this.tagList.length > 0' });
  const tagListList = await Article.find({}, { tagList: 1, _id: 0 });
  console.log('tagListList : ', tagListList);

  const tags = {};
  tagListList?.forEach((tagList) => tagList.tagList.forEach((tag) => (tags[tag] = tags[tag] ? tags[tag] + 1 : 1)));

  return res.json({ tags: Object.keys(tags) });
});

module.exports = router;
