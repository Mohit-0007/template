// const Imap = require('node-imap');
// const { simpleParser } = require('mailparser');
// const nodemailer = require('nodemailer');
// const { MongoClient } = require('mongodb');

// const uri = process.env.URI;
// const client = new MongoClient(uri);

// function readEmailsinbox() {
//   return new Promise((resolve, reject) => {
//     const imap = new Imap({
//       user: 'unicmohit0001@gmail.com',
//       password: 'ajtlwdtoifkuxqxa',
//       host: 'imap.gmail.com',
//       port: 993,
//       tls: true,
//     });

//     async function sendmail(emailaddress, name) {
//       try {
//         const transport = nodemailer.createTransport({
//           service: process.env.SMTP_SERVICE,
//           auth: {
//             user: process.env.SMTP_USER,
//             pass: process.env.SMTP_PASS,
//           },
//         });

//         await transport.sendMail({
//           from: 'unicmohit0001@gmail.com', 
//           to: emailaddress, 
//           subject: 'Thanks for contacting us!',
//           text: `Hi ${name}, We have received your inquiry. Our team will contact you shortly.`,
//         });
//       } catch (err) {
//         console.error('Error sending mail:', err);
//       }
//     }

//     function inboxOpen(cb) {
//       imap.openBox('INBOX', false, cb);
//     }

//     imap.on('ready', () => {
//       inboxOpen((err, box) => {
//        if (err)
//         {
//            return reject(err);
//         }

//         imap.search(['UNSEEN'], (err, results) => {
//        if(err)
//         { 
//           return reject(err);
//         }

//           if (!results || results.length === 0) {
//             imap.end();
//             return resolve([]);
//           }

//           const data = imap.fetch(results,{bodies:''});

//           data.on('message', (msg) => {
//             msg.on('body', async (stream) => {
//               try {
//                 const parsed = await simpleParser(stream);

//                 // MongoDB connect
//                  await client.connect();
//                  await client.db('portfolio').command({ping:1})
//                 const mydb = client.db('portfolio');
//                 const collection = mydb.collection('user');

//                 const fromObj = parsed.from?.value?.[0] || {};
//                 const from = fromObj.address;
//                 const name = fromObj.name;
//                 const subject = parsed.subject;
//                 const body = parsed.text || parsed.html;

//                 // Send mail
//                 await sendmail(from, name);

//                 // Update MongoDB
//                 const result = await collection.findOne({email:from});
//                 if (result) {
//                   const dataObj = {
//                     note: `New email received: ${subject}`,
//                     Body: body,
//                     date: new Date(),
//                     type: 'Email',
//                   };
//                   await collection.updateOne({email:from},{$push:{followUp:dataObj}},{upsert:true});
//                 }
//               } catch(err){
//                 console.error('Error processing email:', err);
//               }
//             });
//           });

//           data.on('error',(err)=>reject(err));

//           data.on('end',()=>{
//             console.log('Done reading all unread mails');
//             imap.end();
//             resolve(true);
//           });
//         });
//       });
//     });

//     imap.once('error', (err) => reject(err));
//     imap.connect();
//   });
// }

// module.exports = readEmailsinbox;

const Imap = require('imap');
require('dotenv').config();
const { simpleParser } = require('mailparser');

const imapConfig = {
  user: process.env.GMAIL,
  password: process.env.GMAIL_PASSWORD,
  host: process.env.GMAIL_IMAP_HOST,
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
};

function readMails() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) return reject(err);

        imap.search(['ALL'], async (err, results) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            console.log('No new emails found.');
            imap.end();
            return resolve([]);
          }

          const emailsArray = [];

          const f = imap.fetch(results, { bodies: '', struct: true });

          const messagePromises = [];

          f.on('message', (msg) => {
            const msgPromise = new Promise((res, rej) => {
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (err) return rej(err);

                  const sender = parsed.from?.value?.[0]?.address?.toLowerCase() || '';
                  const myEmail = process.env.GMAIL.toLowerCase();
                  // console.log('sender', sender)
                  // console.log('myemail', myEmail)
                  if (sender && sender !== myEmail) {
                    // Get subject from header
                    let subject = parsed.subject || '';

                    // If it's a reply (starts with "Re:"), replace with first line of body
                    if (/^re:/i.test(subject)) {
                      const bodyText = parsed.text || '';
                      const firstLine = bodyText
                        .split('\n')
                        .map(l => l.trim())
                        .filter(Boolean)[0]; // pick first non-empty line
                      if (firstLine) {
                        subject = firstLine;
                      }
                    }
                    emailsArray.push({
                      From: sender,
                      Subject: subject,       // fixed subject
                      TextBody: parsed.text,
                      HtmlBody: parsed.html,
                      Date: parsed.date,
                    });
                  }
                  res();
                });
              });
            });

            messagePromises.push(msgPromise);
          });

          f.once('error', (err) => reject(err));

          f.once('end', async () => {
            try {
              await Promise.all(messagePromises); // wait for all parsing
              console.log('Done fetching all messages!');
              imap.end();
              resolve(emailsArray);
            } catch (err) {
              reject(err);
            }
          });
        });
      });
    });

    imap.once('error', (err) => reject(err));
    imap.once('end', () => console.log('Connection ended'));

    imap.connect();
  });
}

module.exports = readMails;