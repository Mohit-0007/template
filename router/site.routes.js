const express=require('express');
const router= express.Router();
const controller= require('../controllers/site.controller');
router.get('/',controller.home);
router.get('/signin',controller.signin);
router.get('/lead-details',controller.lead_details);
router.get('/alerts',controller.alerts);
router.get('/blank',controller.blank);
router.get('/leads',controller.leads);
router.get('/blog-list',controller.blog_list);
router.get('/blog-single',controller.blog_single);
router.get('/bug-issues',controller.bug_issues);
router.get('/bug-tracker',controller.bug_tracker);
router.get('/buttons',controller.buttons);
router.get('/calendar',controller.calendar);
router.get('/code-editor',controller.code_editor);
router.get('/compose',controller.compose);
router.get('/email',controller.email);
router.get('/extras',controller.extras);
router.get('/fixed-width-noleft',controller.fixed_width_noleft);
router.get('/fixed-width',controller.fixed_width);
router.get('/fixed-width2',controller.fixed_width2);
router.get('/form-layouts',controller.form_layouts);
router.get('/form-validation',controller.form_validation);
router.get('/form-wizards',controller.form_wizards);
router.get('/general-forms',controller.general_forms);
router.get('/graphs',controller.graphs);
router.get('/horizontal-menu',controller.horizontal_menu);
router.get('/horizontal-menu2',controller.horizontal_menu2);
router.get('/icons',controller.icons);
router.get('/invoice',controller.invoice);
router.get('/layouts',controller.layouts);
router.get('/locked',controller.locked);
router.get('/maps',controller.maps);
router.get('/media-manager',controller.media_manager);
router.get('/modals',controller.modals);
router.get('/notfound',controller.notfound);
router.get('/people-directory',controller.people_directory);
router.get('/profile',controller.profile);
router.get('/read',controller.read);
router.get('/search-results',controller.search_results);
router.get('/signup',controller.signup);
router.get('/sliders',controller.sliders);
router.get('/tables',controller.tables);
router.get('/tabs-accordions',controller.tabs_accordions);
router.get('/timeline',controller.timeline);
router.get('/typography',controller.typography);
router.get('/view-issue',controller.view_issue);
router.get('/widgets',controller.widgets);
router.get('/wysiwyg',controller.wysiwyg);
router.get('/x-editable',controller.x_editable);
router.post('/followUp/add',controller.add);
router.post('/Home',controller.login);
router.get('/read-mails',controller.readEmails)
router.get('/readMails',controller.readEmails)



//ajax

router.get('/accordion',controller.accordion);
router.get('/panel',controller.panel)
router.get('/photo-viewer-rtl',controller.photo_viewer_rtl)
router.get('/photo-viewer',controller.photo_viewer)
router.get('/remote',controller.remote)
router.get('/tabs',controller.tabs)




module.exports=router;


