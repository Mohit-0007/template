const Imap = require('node-imap');
const {simpleParser} = require('mailparser');
const crypto = require('crypto');
 
function ticketId(){
return 'TIC'+'-'+crypto.randomBytes(2).toString('hex').toUpperCase()
}

function readEmailsinbox(){
  return new Promise((resolve,reject)=>{
    const imap =new Imap({
       user: '',
       password: '',
       host:'imap.gmail.com',
       port:993,
       tls:true
    });

// inboxOpen function

function inboxOpen(res){
  imap.openBox('INBOX',false,res)
};

// ready event and function run

imap.on('ready',function(){
     inboxOpen(function(err,box){
    if(err){
      reject(err);
     };
     imap.search(['ALL'],function(err,results){
      if(err){
        return reject(err)
      };
      if(!results||results.length===0){
        imap.end();
       return resolve([])
      };
      const data = imap.fetch(results,{bodies:''});
      let email = [];
      data.on('message',function(msg,err){
           msg.on('body',function(stream){
            simpleParser(stream,function(err,parsed){
              if(err) return reject(err)
                // console.log(parsed)    
              
                const from = parsed.from.text;
                const subject = parsed.subject;
                const body = parsed.body;
                const date = parsed.date;
 
                let ticketIdMatch = subject.match(/\[Ticket ID: (.*?)\]/);
                let ticket = ticketIdMatch ? ticketIdMatch[1] : ticketId();

                console.log(from)
                console.log(subject)
                // console.log(body)
                console.log(date)

                const obj={
                  ticket,
                  from,
                  subject,
                  date
                }

                email.push(obj);

            })
           })
      })
         data.on('error',function(err){
          reject(err)
         })
         data.on('end',function(){
          console.log('Done reading all unread mails')
          imap.end();
          resolve(email);
         })
     })
     })
})
imap.once('error',function(err){
       reject(err)
})
imap.connect()
  });

  
};

module.exports = readEmailsinbox;