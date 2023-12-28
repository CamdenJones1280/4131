
const mysql = require(`mysql-await`); // npm install mysql-await

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: "localhost",
  user: "C4131F23U100",
  database: "C4131F23U100",
  password: "10050",
});

async function getRecentPosts(page){
    //gets the 5 most recent posts
    let result = await connPool.awaitQuery("SELECT * FROM posts ORDER BY start_time DESC;");
    let start = page*5;
    let returnList = [];
    for(let i=start; i < start+5; i++){
        if(i < result.length){
            let formatted = [];
            formatted.push(result[i].userName);
            formatted.push(result[i].post_text);
            formatted.push(result[i].id);
            returnList.push(formatted);
        }
    }
    if(returnList.length == 0){
        returnList.push(["","no more posts to load!", "-1"]);
    }
    return returnList
}

async function getLikedPosts(page){
    //gets the 5 most liked posts
    let result = await connPool.awaitQuery("SELECT * FROM posts ORDER BY likes DESC;");
    let start = page*5;
    let returnList = [];
    for(let i=start; i < start+5; i++){
        if(i < result.length){
            let formatted = [];
            formatted.push(result[i].userName);
            formatted.push(result[i].post_text);
            formatted.push(result[i].id);
            returnList.push(formatted);
        }
    }
    if(returnList.length == 0){
        returnList.push(["","no more posts to load!", "-1"]);
    }
    return returnList
}

async function addPost(data){
    //takes in list of post data and adds a post to the database
    return await connPool.awaitQuery("INSERT INTO posts (userName, post_text) VALUES (?, ?);", [data[0], data[1]]);
}

async function editPost(id, message){
    //takes in a new message for a post and sets that post message to the new one
    return await connPool.awaitQuery("UPDATE posts SET post_text = ? where id = ?", [id, message]);
}

async function deletePost(id){
    //takes in post id and deletes it from database
    let result = await connPool.awaitQuery("DELETE FROM posts WHERE id=?;", [id]);
    if(result.affectedRows == 1){
        return true;
      }
      return false;
}

async function incLikes(id){
    //takes in post id and increments the likes count
    return await connPool.awaitQuery("UPDATE posts SET likes = likes + 1 WHERE id = ?;", [id]);
}

async function decLikes(id){
    //takes in an id and decreases the likes count
    return await connPool.awaitQuery("UPDATE posts SET likes = likes - 1 WHERE id = ?;", [id]);
}

async function incViews(id){
    //takes in an ID and increases the view count
    return await connPool.awaitQuery("UPDATE posts SET views = views + 1 WHERE id = ?;", [id]);
}

async function getPost(id){
    //gets the user and post text for a given post
    return await connPool.awaitQuery("SELECT * FROM posts WHERE id = ?;", [id]);
}

async function createUser(data){
    //takes in a list of [user,password] pair and creates a user for them
    return await connPool.awaitQuery("INSERT INTO users (userName, password) VALUES (?, ?);", [data[0], data[1]]);
}

async function userSignIn(user){
    //a username and returns the password of a given user
    let result = await connPool.awaitQuery("SELECT * FROM users WHERE userName = ?", [user]);
    if(result.length == 1){
        return result[0].password;
    }
    return "";
}

async function userNameCheck(user){
    //username and checks if it already exists in the database
    let result = await connPool.awaitQuery("SELECT * FROM users WHERE userName = ?", [user]);
    if(result.length > 0){
        return true;
    }
    return false;
}


module.exports = {getRecentPosts, getLikedPosts, addPost, editPost, deletePost, incLikes, decLikes, incViews, getPost, createUser, userSignIn, userNameCheck}