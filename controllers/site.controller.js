const { MongoClient, ObjectId } = require('mongodb');
const readMails = require('../service/mailReader.service');
const dotenv = require("dotenv");
dotenv.config();
const uri = process.env.URI;
const client = new MongoClient(uri);
const fs = require('fs')
const path = require('path')

// monngo connect
async function monodbclient(){
    await client.connect();
    await client.db('portfolio').command({ ping: 1 });
    const db = client.db('portfolio');
    return db.collection('user');
}

// pages folder files
async function renderFile(req, res, pageName, title) {
  // lead page data send 
  if (pageName == 'leads') {
    const clientData=await monodbclient()
    const result = await clientData.find().toArray();
    return res.render(`pages/${pageName}`, { title: title, data: result });
  }
  return res.render(`pages/${pageName}`, { title: title })
}
// pages folder files
exports.home = (req, res) => renderFile(req, res, 'index', 'Bracket Responsive Bootstrap3 Admin');
exports.alerts = (req, res) => renderFile(req, res, 'alerts', 'alerts');
exports.leads = (req, res) => renderFile(req, res, 'leads', 'leads');
exports.blank = (req, res) => renderFile(req, res, 'blank', 'blank');
exports.blog_list = (req, res) => renderFile(req, res, 'blog-list', 'blog-list');
exports.blog_single = (req, res) => renderFile(req, res, 'blog-single', 'blog-single');
exports.bug_issues = (req, res) => renderFile(req, res, 'bug-issues', 'bug-issues');
exports.bug_tracker = (req, res) => renderFile(req, res, 'bug-tracker', 'bug-tracker');
exports.buttons = (req, res) => renderFile(req, res, 'buttons', 'buttons');
exports.calendar = (req, res) => renderFile(req, res, 'calendar', 'calendar');
exports.code_editor = (req, res) => renderFile(req, res, 'code-editor', 'code-editor');
exports.compose = (req, res) => renderFile(req, res, 'compose', 'compose');
exports.email = (req, res) => renderFile(req, res, 'email', 'email');
exports.extras = (req, res) => renderFile(req, res, 'extras', 'extras');
exports.fixed_width_noleft = (req, res) => renderFile(req, res, 'fixed-width-noleft', 'fixed-width-noleft');
exports.fixed_width = (req, res) => renderFile(req, res, 'fixed-width', 'fixed-width');
exports.fixed_width2 = (req, res) => renderFile(req, res, 'fixed-width2', 'fixed-width2');
exports.form_layouts = (req, res) => renderFile(req, res, 'form-layouts', 'form-layouts');
exports.form_validation = (req, res) => renderFile(req, res, 'form-validation', 'form-validation');
exports.form_wizards = (req, res) => renderFile(req, res, 'form-wizards', 'form-wizards');
exports.general_forms = (req, res) => renderFile(req, res, 'general-forms', 'general-forms');
exports.graphs = (req, res) => renderFile(req, res, 'graphs', 'graphs');
exports.horizontal_menu = (req, res) => renderFile(req, res, 'horizontal-menu', 'horizontal-menu');
exports.horizontal_menu2 = (req, res) => renderFile(req, res, 'horizontal-menu2', 'horizontal-menu2');
exports.icons = (req, res) => renderFile(req, res, 'icons', 'icons');
exports.invoice = (req, res) => renderFile(req, res, 'invoice', 'invoice');
exports.layouts = (req, res) => renderFile(req, res, 'layouts', 'layouts');
exports.locked = (req, res) => renderFile(req, res, 'locked', 'locked');
exports.maps = (req, res) => renderFile(req, res, 'maps', 'maps');
exports.lead_details = (req, res) => renderFile(req, res, 'lead-details', 'lead-details');
exports.media_manager = (req, res) => renderFile(req, res, 'media-manager', 'media-manager');
exports.modals = (req, res) => renderFile(req, res, 'modals', 'modals');
exports.notfound = (req, res) => renderFile(req, res, 'notfound', 'Notfound');
exports.people_directory = (req, res) => renderFile(req, res, 'people-directory', 'people-directory');
exports.profile = (req, res) => renderFile(req, res, 'profile', 'profile');
exports.read = (req, res) => renderFile(req, res, 'read', 'read');
exports.search_results = (req, res) => renderFile(req, res, 'search-results', 'search-results');
exports.signin = (req, res) => renderFile(req, res, 'signin', 'signin');
exports.add = (req, res) => renderFile(req, res, 'add', 'add');
exports.signup = (req, res) => renderFile(req, res, 'signup', 'signup');
exports.sliders = (req, res) => renderFile(req, res, 'sliders', 'sliders');
exports.tables = (req, res) => renderFile(req, res, 'tables', 'tables');
exports.tabs_accordions = (req, res) => renderFile(req, res, 'tabs-accordions', 'tabs-accordions');
exports.timeline = (req, res) => renderFile(req, res, 'timeline', 'timeline');
exports.typography = (req, res) => renderFile(req, res, 'typography', 'typography');
exports.view_issue = (req, res) => renderFile(req, res, 'view-issue', 'view-issue');
exports.widgets = (req, res) => renderFile(req, res, 'widgets', 'widgets');
exports.wysiwyg = (req, res) => renderFile(req, res, 'wysiwyg', 'wysiwyg');
exports.x_editable = (req, res) => renderFile(req, res, 'x-editable', 'x-editable');

function saveAttachments(attachments) {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  return attachments.map((att) => {
    const filePath = path.join(uploadDir, att.filename);
    fs.writeFileSync(filePath, att.content);

    return {
      filename: att.filename,
      contentType: att.contentType,
      url:` /uploads/${att.filename}`, // serve via express.static
    };
  });
}
// Read mail
async function read_mail() {
  try {
    const emails = await readMails();
    if (!emails.length) {
      // console.log("No emails from others.");
      return [];
    }
    return emails.map((email) => {
    const attachments = saveAttachments(email.Attachments);

      return {
        Date: email.Date,
        From: email.From,
        Subject: email.Subject,
        Attachments: attachments, // only filename, type, url
      };
    });
  } catch (error) {
    // console.error(error);
    return [];
  }
}



//  login form function
exports.login = async (req, res, next) => {
  try {
    const data = req.body;
    const { Username, password } = data;
    // console.log(Username, password)
     const clientData=await monodbclient()
    const result = await clientData.findOne({ email: Username.trim() });
    if (!result) {
      return res.render("pages/signin", { title: "Signin", error: "Invalid Username" })
    }
    if (result.password !== password.trim()) {
      return res.render("pages/signin", { title: "Signin", errorpass: "Invalid password" })
    }
    return res.render('pages/index', { title: "index" })
  }
  catch (error) {
    next(error)
  }
}


// lead_details page edit form and table
exports.lead_details = async (req, res, next) => {
  try {
    const objectid = ObjectId.createFromHexString(req.query.id);
    // console.log('object id ',objectid)
    const clientData=await monodbclient()
    const user = await clientData.findOne({ _id: objectid });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const mail_data = await read_mail();
    const userMails = mail_data.filter(
      (x) => x.From?.toLowerCase() === user.email?.toLowerCase()
    );
    const senderSubject = userMails.map((x) => ({
      date: x.Date,
      remarks: x.Subject,
      attachments: x.Attachments || 'No Attechment',
    }))

    // console.log(senderSubject);
    if (senderSubject.length > 0) {
      await clientData.updateOne({ _id: objectid }, { $addToSet: { followup: { $each: senderSubject } } }, { $upsert: true })
    }

    const result = await clientData.findOne({ _id: objectid });
    // console.log('object result', result)
    // console.log('mail_data', senderSubject)
    return res.render('pages/lead-details', { title: "lead-details", data: result });
  } catch (next) {
    next(error)
  }
}
// add button to add table data
exports.add = async (req, res, next) => {
  try {
    // console.log('add works')
    const data = req.body;
    const objectid = ObjectId.createFromHexString(data.id);
    const clientData=await monodbclient()
    const dataupdate = await clientData.updateOne({ _id: objectid }, { $push: { followup: data } }, { $upsert: true });
    // console.log(dataupdate);
    return res.redirect(`/lead-details?id=${objectid}`);
  } catch (error) {
    next(error)
  }
}

//ajax folder file                        
function ajaxFolder(res, fileName) {
  return res.render(`ajax/${fileName}`)
};

exports.accordion = (req, res) => ajaxFolder(res, 'accordion')
exports.panel = (req, res) => ajaxFolder(res, 'panel')
exports.photo_viewer_rtl = (req, res) => ajaxFolder(res, 'photo-viewer-rtl')
exports.photo_viewer = (req, res) => ajaxFolder(res, 'photo-viewer')
exports.remote = (req, res) => ajaxFolder(res, 'remote')
exports.tabs = (req, res) => ajaxFolder(res, 'tabs')