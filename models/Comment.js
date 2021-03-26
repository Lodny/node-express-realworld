const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  },
  { timestamps: true }
);

CommentSchema.methods.toJSONFor = function (user, article) {
  console.log('CommentSchema : toAuthJSON() : ');
  return {
    body: this.body,
    author: this.author.toProfileJSONFor(user),
    article: this.article.toJSONFor(article),
  };
};

mongoose.model('Comment', CommentSchema);
