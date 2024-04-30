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
const post = require('./models/post.js');

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: true,
}));

app.get('/account/login' , (req, res) => {
    res.render('./account/login.ejs', {
        user: req.session.user
    })
})

app.get('/account/new', (req, res) => {
    res.render('./account/new.ejs', {
        user: req.session.user
    } )
})

app.get('/post/new', (req, res) => {
    res.render('./post/new.ejs', {
        user: req.session.user
    })
})

app.get('/post/:postId/edit' , async(req, res) => {
    const foundPost = await Post.findById(req.params.postId);

    res.render('./post/edit.ejs', {
        user: req.session.user,
        post: foundPost,
    })
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
        id: emailInDatabase.id
    }

    res.redirect('/');
})

app.get('/' , async(req, res) => {
    const posts = await Post.find({});
    const users = await User.find({});
    res.render('homePage.ejs', {
        posts: posts,
        users: users,
        user: req.session.user
    })
})

app.post('/post/new', async (req, res) => {
    const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        createdBy: req.session.user.username,
        accountId: req.session.user.id,
    });
    res.redirect('/');
})

app.delete('/post/:postId', async (req, res) => {
    const selectPost = await Post.findById(req.params.postId);

   if(req.session.user){
        if(req.session.user.id === selectPost.accountId) {
            await Post.findByIdAndDelete(req.params.postId);
        }
   }

    res.redirect('/');
})

app.get('/sign-out', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

app.get('/account/:accountId/show', async (req, res) => {
    const user = await User.findById(req.params.accountId);

    res.render('./account/show.ejs',{
        user: user
    })
})

app.put('/post/:postId/edit', async (req, res) => {
    const selectPost = await Post.findById(req.params.postId);

    if(req.session.user){
        if(req.session.user.id === selectPost.accountId) {
            await Post.findByIdAndUpdate(req.params.postId, req.body);
        }
   }
    res.redirect('/');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`the express app is running on ${PORT}`);
})
