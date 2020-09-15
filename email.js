var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'zhengli990718@gmail.com',
        pass: 'z19990718'
    }
  });
  
    var mailOptions =  {
        from: '"LiZHENG" <zhengli990718@gmail.com>', 
        to: '', 
        subject: '',
        text: '', 
        html: '' 
    };
    
    exports.send = function(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
  }