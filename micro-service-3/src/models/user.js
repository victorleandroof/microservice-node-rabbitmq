const {Schema, model} = require('mongoose');

const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v),
      message: props => `${props.value} não é um email valido!`,
    },
  },
  password: {
    type: String,
    required: true,
    min: [6, 'senha muito pequena'],
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  resetPassword: {
    type: String,
    required: false,
  },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

module.exports =  model('User', userSchema);
