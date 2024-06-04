const dotenv = require("dotenv").config();
const fb = require("fb");

fb.setAccessToken(process.env.TOKEN);

// Remove post by id
// listen from node delete.js <post_id>
const postId = process.argv[2];

fb.api(`/${postId}`, "delete", function (res) {
    if (!res || res.error) {
        console.log(!res ? "error occurred" : res.error);
        return;
    }
    console.log(`Post ${postId} deleted`);
});