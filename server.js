module.import = "./data.js"

const session = require("express-session")
const express = require("express");
const bcrypt = require('bcrypt');
const {getRecentPosts, getLikedPosts, addPost, editPost, deletePost, incLikes, decLikes, incViews, getPost, createUser, userSignIn, userNameCheck} = require("./data");
const app = express();
const port = 4131;

app.set("views", "templates");
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static("resources"));

app.use(session({
    secret: "randomstuffandthingsyes",
    saveUninitialized:true,
    resave: false 
}));

//auth to check if a session is logged in
async function Auth(req, res, next){
    if(req.session.userid){
        res.status(200);
        next();
    }else{
        res.status(403);
        res.send("unable to load page: Please sign in");
    }
}
//base page will bring you to the sign in right away
app.get("/", (req, res)=>{
    res.render("signInUser.pug");
})

app.get("/signin", (req, res)=>{
    res.render("signInUser.pug");
})

app.post("/signin", async (req, res)=>{
    if("userName" in req.body && "password" in req.body){
        let result = await userSignIn(req.body.userName);
        if(result != ""){
            if(await bcrypt.compare(req.body.password, result)){
                req.session.userid = req.body.userName;
                res.render("mainPage.pug", {posts : await getRecentPosts(0)});
            }else{
                res.status(403);
                res.send('Invalid username or password');
            }
        }else{
            res.status(400);
            res.send('Invalid username or password');
        }
    }else{
        res.status(400);
        res.send('Invalid username or password');
    }
})

app.get("/signout", (req, res)=>{
    req.session.destroy();
    res.render("signInUser.pug");
})

app.get("/create", (req, res)=>{
    res.render("createUser.pug");
})

app.post("/create", async (req, res)=>{
    if("userName" in req.body && "password" in req.body){
        if(await userNameCheck(req.body.userName) == false){
            const hpass = await bcrypt.hash(req.body.password, 10);
            await createUser([req.body.userName, hpass]);
            res.render("signInUser.pug");
        }else{
            res.status(400);
            res.send("unable to create account: user name has been taken"); 
        }
    }else{
        res.status(400);
        res.send("unable to create account: missing password of user name");
    }
})

app.get("/main", Auth, async (req, res)=>{
    const arrangement = req.query.arrangement;
    let page = req.query.page;
    if(page == undefined || page < 0){
        page = 0;
    }
    if(arrangement != undefined){
        if(arrangement == "recent"){
            res.render("mainPage.pug", {posts : await getRecentPosts(page)});
        }else if(arrangement == "liked"){
            res.render("mainPage.pug", {posts : await getLikedPosts(page)});
        }
    }else{
        res.render("mainPage.pug", {posts : await getRecentPosts(page)});
    }
})

app.post("/main", Auth, async (req, res)=>{
    if("post_message" in req.body){
        if(req.body.post_message.length < 500){
            await addPost([req.session.userid, req.body.post_message]);
            res.render("mainPage.pug", {posts : await getRecentPosts(0)});
        }else{
            res.status(400);
            res.send("unable to post due to post length");
        }
    }else{
        res.status(400);
        res.send("unable to post: missing message");
    }
}) 

//dynamic pages based on page ID
app.get("/viewPage", Auth, async (req, res)=>{
    const id = req.query.post;
    if(id != undefined){
        let postData = await getPost(id);
            if(postData.length > 0){
                await incViews(id);
                let properties = [id, postData[0].userName, postData[0].post_text, postData[0].views, postData[0].likes, postData[0].start_time]
                res.render("viewPage", {postProp: properties});
            }else{
                res.status(404);
                res.send("unable to view page: unable to find post");
            }
    }else{
        res.status(404);
        res.send("unable to view page: unable to find post");
    }
}) 

app.get("/editPage", Auth, async (req, res)=>{
    const id = req.query.post;
    if(id != undefined){
        let post = await getPost(id);
        if(post.length > 0){
            if(req.session.userid == post[0].userName){
                res.render("editPage", {postProp: [id, post[0].post_text]});
            }else{
                res.status(403);
                res.send("Access denied: unable to edit other users posts");
            }
        }else{
            res.status(404);
            res.send("unable to load page: unable to find post");
        }
    }else{
        res.status(404);
        res.send("unable to load page: unable to find post");
    }
})

//API for posts and main page
app.delete("/api/delete", async (req, res)=>{ 
    if("id" in req.body){
        let post = await getPost(req.body["id"]);
        if(post.length > 0){
            if(req.session.userid == post[0].userName){
                let result = await deletePost(req.body["id"]);
                if(result == true){
                    res.status(200);
                    res.setHeader("Content-Type", "text/plain");
                    res.send("removed requested ID from contacts");
                }else{
                res.status(404);
                res.setHeader("Content-Type", "text/plain");
                res.send("unable to find requested id");
                }
            }else{
                res.status(403);
                res.send("Access denied: unable to edit other users posts");
            }
        }
    }else{
        res.status(400);
        res.setHeader("Content-Type", "text/plain");
        res.send("unable to load JSON from delete request");
    }
})
    //change post likes api
    app.post("/api/likes", async (req, res)=>{
        if("id" in req.body && "option" in req.body){
            if(req.body["option"] == "like"){
                await incLikes(req.body["id"]);
                res.send("liked post");
            }else if(req.body["option"] == "dislike"){
                await decLikes(req.body["id"]);
                res.send("disliked post");
            }else{
                res.status(403);
                res.send("unable to like or dislike: missing option");
            }
        }else{
            res.status(404);
            res.send("unable to find post");
        }
    })

    //edit post api
    app.post("/api/editPost", async (req, res)=>{
        if("id" in req.body && "message" in req.body){
            let post = await getPost(req.body["id"]);
            if(post.length > 0){
                if(req.session.userid == post[0].userName){
                    if(req.body["message"].length < 500){
                        await editPost(req.body["message"], req.body["id"]);
                        res.send("edited post");
                    }else{
                        res.status(400);
                        res.send("unable to edit post: missing id or message");
                    }
                }else{
                    res.status(403);
                    res.send("Access denied: unable to edit other users posts");
                }
            }else{
                res.status(400);
                res.send("unable to edit post: message length exceeds limit"); 
            }
            }else{
                res.status(400);
                res.send("unable to edit post: missing id or message");
        }
    })


app.use((req, res, next) => {
    res.status(404);
    res.render("404.pug");
})

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`);
})