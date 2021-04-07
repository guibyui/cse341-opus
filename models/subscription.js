const mongoose = require('mongoose');
const { callbackPromise } = require('nodemailer/lib/shared');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  emails: [String]
});

subscriptionSchema.statics.findOneOrCreate = function(name) {
  // used code from "https://tomanagle.medium.com/adding-findoneorcreate-to-a-mongoose-model-efc7c2e11294"
  const self = this;
  return new Promise((resolve, reject) => {
    return self.findOne({ name: name })
      .then((result) => {
        if (result) {
          return resolve(result);
        }
        return self.create({ name: name })
          .then((result) => {
            return resolve(result);
          })
          .catch((error) => { reject(error) })
      })
      .catch((error) => { reject(error) })
  })
};

subscriptionSchema.methods.addEmail = function(email) {
  const self = this;
  self.emails.push(email);
  self.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);