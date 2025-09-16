const Imap = require('node-imap');
require('dotenv').config();
const { simpleParser } = require('mailparser');

const imapConfig = {
  user: process.env.GMAIL,
  password: process.env.GMAIL_PASSWORD,
  host: process.env.GMAIL_IMAP_HOST,
  port: 993,
  tls: true,
};

function readMails() {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
      if (err){
        return reject(err);
      }

        imap.search(['UNSEEN'], async (err, results) => {
        if (err){
          return reject(err);
        }
          if (!results || results.length === 0) {
            console.log('No new emails found.');
            imap.end();
            return resolve([]);
          }

          const emailsArray = [];

          const f = imap.fetch(results,{bodies:'',struct:true});

          const messagePromises = [];

          f.on('message', (msg) => {
            const msgPromise = new Promise((res, rej) => {
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if(err){
                    return rej(err);
                  }

                  const sender = parsed.from.value?.[0].address;
                  const myEmail = process.env.GMAIL;
                  // console.log('sender', sender)
                  // console.log('myemail', myEmail)
                  if (sender && sender !== myEmail) {
                  
                    let subject = parsed.subject;

                    // If it's a reply starts with Re:, replace with first line of body
                    if (/^re:/i.test(subject)) {
                      const bodyText = parsed.text;
                      const firstLine = bodyText
                        .split('\n')
                        .map(l => l.trim())
                        .filter(Boolean)[0]; 
                      if (firstLine) {
                        subject = firstLine;
                      }
                    }
                    emailsArray.push({
                      From: sender,
                      Subject: subject,     
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

          f.once('error',(err)=>reject(err));

          f.once('end',async()=>{
            try {
              // wait for all parsing
              await Promise.all(messagePromises); 
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