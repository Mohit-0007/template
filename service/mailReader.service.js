const Imap = require('node-imap');
const { simpleParser } = require('mailparser');
const crypto = require('crypto');


function generateTicketId() {
  return 'TCK-' + Date.now() + '-' + crypto.randomBytes(2).toString('hex').toUpperCase();
}

  async function readEmailsAndCreateTickets() {
  const imap = new Imap({
    user: 'unicmohit0001@gmail.com',         
    password: 'ajtlwdtoifkuxqxa',         
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) throw err;

      console.log('Reading unread emails');
      imap.search(['UNSEEN'], function (err, results) {
        if (err) throw err;
        if (!results || results.length === 0) {
          console.log('No new replies found.');
          imap.end();
          return;
        }
        const f = imap.fetch(results,{ bodies: '' });

        f.on('message', function (msg,seqno) {
          msg.on('body', function (stream) {
            simpleParser(stream, async (err, parsed) => {
              if (err) console.error(err);

              // Extract email details
              const from = parsed.from.text;
              const subject = parsed.subject;
              const body = parsed.text;

              // Ticket ID nikalna 
              let ticketIdMatch = subject.match(/\[Ticket ID: (.*?)\]/);
              let ticketId = ticketIdMatch ? ticketIdMatch[1] : generateTicketId();

              console.log('Ticket ID:', ticketId);
              console.log('From:', from);
              console.log('Subject:', subject);
              console.log('Body:', body);
         
            });
          });
        });

        f.once('error', function (err) {
          console.log('Fetch error:'+ err);
        });

        f.once('end', function () {
          console.log('Done reading all unread mails');
          imap.end();
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.log(err);
  });

  imap.connect();
}

module.exports = readEmailsAndCreateTickets;