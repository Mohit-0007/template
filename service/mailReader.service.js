const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const crypto = require('crypto'); // ticket id banane ke liye
const { error } = require('console');

// function generateTicketId() {
//   // Random unique ticket id generate karega
//   return 'TCK-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
// }

//   async function readEmailsAndCreateTickets() {
//   const imap = new Imap({
//     user: 'unicmohit0001@gmail.com',           // ✅ apna gmail daalo
//     password: 'ajtlwdtoifkuxqxa',          // ✅ gmail app password (16 char)
//     host: 'imap.gmail.com',
//     port: 993,
//     tls: true
//   });

//   function openInbox(cb) {
//     imap.openBox('INBOX', false, cb);
//   }

//   imap.once('ready', function () {
//     openInbox(function (err, box) {
//       if (err) throw err;

//       console.log('📥 Reading unread emails...');
//       imap.search(['UNSEEN'], function (err, results) {
//         if (err) throw err;
//         if (!results || results.length === 0) {
//           console.log('No new replies found.');
//           imap.end();
//           return;
//         }

//         const f = imap.fetch(results, { bodies: '' });

//         f.on('message', function (msg, seqno) {
//           msg.on('body', function (stream) {
//             simpleParser(stream, async (err, parsed) => {
//               if (err) console.error(err);

//               // Extract email details
//               const from = parsed.from.text;
//               const subject = parsed.subject;
//               const body = parsed.text;

//               // Ticket ID nikalna (agar mail me already hai)
//               let ticketIdMatch = subject.match(/\[Ticket ID: (.*?)\]/);
//               let ticketId = ticketIdMatch ? ticketIdMatch[1] : generateTicketId();

//               console.log('========================');
//               console.log('🎫 Ticket Created/Found');
//               console.log('Ticket ID:', ticketId);
//               console.log('From:', from);
//               console.log('Subject:', subject);
//               console.log('Body:', body);
//               console.log('========================');
//             });
//           });
//         });

//         f.once('error', function (err) {
//           console.log('Fetch error: ' + err);
//         });

//         f.once('end', function () {
//           console.log('✅ Done reading all unread mails');
//           imap.end();
//         });
//       });
//     });
//   });

//   imap.once('error', function (err) {
//     console.log(err);
//   });

//   imap.connect();
// }

// module.exports = readEmailsAndCreateTickets;
function generateTicketId(){
    return 'TCK-'+Date.now()+'-'+crypto.randomBytes(2).toString('hex').toUpperCase();
}
async function  readEmailsAndCreateTickets(){
    

const imap = new Imap({
    user:"unicmohit0001@gmail.com",
    password:"ajtlwdtoifkuxqxa",
    host:"imap.gmail.com",
    port:993,
    tls:true
});

function openInbox(result){
     imap.openBox("INBOX",false,result);
};

imap.once('ready',function(){
    openInbox(function(err,box){
      if(err){
        throw new Error
      }  
     imap.search(["UNSEEN"],(err,data)=>{
         if(err){
            throw new Error
         }
         if(!data||data.length===0){
            console.log("no new emails")
            imap.end();
            return;
         }

         const fdata = imap.fetch(data,{bodies:''});
         fdata.on("message",function(msg,sqn){
            msg.on('body',function(err,stream){
                   if(err){
                    throw new Error;
                   }
                   simpleParser(stream,(err,parse)=>{
                    if(err){
                        console.log(err)
                    }
                    const from = parse.from.text;
                    const subject = parse.subject;
                    const body = parse.text;

                   const ticketmatch =  subject.match(/\[Ticket ID:(.*?)\]/);
                   const ticket = ticketmatch ?ticketmatch[1]:generateTicketId();
                   console.log(ticket);
                   console.log(from);
                   console.log(subject);
                   console.log(body);
                  
                   })
            })
         })
         fdata.once("end",function(){
            console.log("all mail read")
            imap.end()
         })

     })
    })
})
imap.connect();
}    
module.exports = readEmailsAndCreateTickets;