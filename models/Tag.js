const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  lowtagname: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    index: true,
  },
  tagname: String,
  count: Number,
});

TagSchema.methods.getTagName = function () {
  return this.tagname;
};

mongoose.model('Tag', UserSchema);
