This website uses a data base "C4131F23U100" with password "10050" to handle the data required for every page to function. It was developed and tested
using the ssh tunnel from HW6. Normal steps for launching website on the server side included opening the ssh tunnel with
"node tunnel.js" and running the server with "node server.js".

implemented features and where to find them:
users can create short posts max of 500 characters (main page)
posts can be viewed in reverse recent order and by likes with basic pagination(main page)
posts can be viewed in depths showing stats like view count, like count, and post date (view page)
posts can be edited if posted by signed in user (view page/edit page)
posts can be deleted if posted by signed in user (edit page)
posts can be liked and likes are tracked(main page/view page)
user accounts can be made and are saved(create page)
logged in status is tracked (express session work found in server specifcally signin, signout, and auth portions of the server code)
log in feature (sign in page)
log out feature (main page nav button)
post security for users, only edit and delete posts from yourself(edit page, server code for delete and edit api)

extra credit:
password are stored encrypted using bcrypt and checked using bcrypt compare(create account, and signin parts of server) 

below are some instructions on how to access each of the features above split up by pages. 

Signing in and account creation: 
Important URLs: http://localhost:4131/ , http://localhost:4131/signin, and http://localhost:4131/create
Every page in the website is connceted by some navigation button on each of the pages. All other pages are locked behind 
a user sign in protection that requires the user to sign in so the first page to start at is / or /signin.
From there you can make an account or sign in to an existing one. New accounts are brought back to the signin screen.
I created the account "admin" with a password of "password" so graders can test parts of the project. 

Main Page:
Once signed into the site you are brought to the main page where you can sign out, see posts, create your own posts, 
view posts and like posts. You can also sort posts by recent or popular are displayed. There is also buttons to page between 
more posts.

View Page:
Once the view button is pushed you are taken to the view page where post stats are shown. The stats like count, views, 
and time of posting are displayed here. This works for all posts regardless of who made the post.

Editing Page:
An edit button for the posts is also displayed on the view page, if the post is from the user you can push the edit button 
to be taken to the editing post page. If the post is not your own you are not given access to the post and notified. 
From the edit screen you can see your old message and given a text box to enter in a new message. You are also given the 
oppertunity to delete the post entirely.