const Imap = require('imap');
require('dotenv').config();
const nodemailer = require('nodemailer')
const { simpleParser } = require('mailparser');
const { MongoClient } = require('mongodb');
const uri = process.env.URI;
const client = new MongoClient(uri);

// Find user for mongodb
async function monogoclient(Email) {
  await client.connect()
  await client.db('portfolio').command({ ping: 1 });
  const mydb = client.db('portfolio');
  const collection = mydb.collection('user');
  return await collection.findOne({ email: Email })
}

// Auto send mail function
function sendmail(email, name, ticketId) {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  const message = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `We received your query:`,
    text: `Hello ${name},

We have received your inquiry.
Your ticket ID is ${ticketId}.

Our support team will get back to you shortly.

Thanks,
Support Team
`
  };

  try {
    transporter.sendMail(message)
  } catch {
    console.log('Email not send')
  }

}
// Imap server connection
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

        imap.search(['UNSEEN'], async (err, results) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            console.log('No new emails found.');
            imap.end();
            return resolve([]);
          }

          const emailsArray = [];

          const f = imap.fetch(results, { bodies: '', struct: true, markSeen: true });

          const messagePromises = [];

          f.on('message', (msg) => {
            const msgPromise = new Promise((res, rej) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) return rej(err);

                  const sender = parsed.from.value?.[0].address.toLowerCase();
                  const myEmail = process.env.GMAIL.toLowerCase();
                  // console.log('sender', sender)
                  // console.log('myemail', myEmail)
                  if (sender && sender !== myEmail) {
                    // Get subject from header
                    let subject = parsed.subject;

                    // If it's a reply starts with "Re:", replace with first line of body
                    if (/^re:/i.test(subject)) {
                      const bodyText = parsed.text;
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
                      Attachments: parsed.attachments || 'no atattachmnt found',
                    });
                  }

                  // mongoclient function call
                  const userdata = await monogoclient(sender)
                  console.log("userdata", userdata)
                  const ticketId = userdata.tckid;
                  const name = userdata.FirstName;
                  // End mongoclient function call
                  // Response mail  function
                  await sendmail(sender, name, ticketId);
                  //End Response mail  function
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