const RabbitMQ = require('../mq/RabbitMQ');

module.exports = {
    
    async store(req,res){
       const user = {...req.body};
       console.log(user);
       await RabbitMQ.emit(JSON.stringify(user));
       return res.send({msg:'ok'});
    },
    async index(req,res){
      return res.send({msg:'ok'});
    }

}