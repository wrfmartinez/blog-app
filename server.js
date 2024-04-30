const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const morgan = require('morgan')
const session = require('express-session');

mongoose.connect(process.env.MONGODB_URI);

const User = require('./models/user.js');
const Post = require('./models/post.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public')); 
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));





app.get('/account/login' , (req, res) => {
    res.render('./account/login.ejs')
})

app.get('/account/new', (req, res) => {
    res.render('./account/new.ejs')
})
app.get('/post/new', (req, res) => {
    res.render('./post/new.ejs')
})
app.post('/account/new', async (req, res) => {
    const account = await User.create(req.body);
    res.redirect('/');
})

app.post('/account/login' ,async (req, res) => {
    const emailInDatabase = await User.findOne({email:  req.body.email});

    if(!emailInDatabase) return res.send('Login failed. email not found');

    req.session.user = {
        username: emailInDatabase.username,
    }

    res.redirect('/');

})
app.get('/' , async(req, res) => {
    const posts = await Post.find({});
    res.render('homePage.ejs', {
        posts: posts,
        user: req.session.user
    })
})

app.post('/post/new', async (req, res) => {
    const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        createdBy: req.session.user.username,
    });
    res.redirect('/');
})
app.get('/sign-out', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})




app.listen('3000', () => {
    console.log('the express app is running on port 3000');
})