const dotenv = require("dotenv").config();
const fb = require("fb");
const PixivApi = require("pixiv-api-client");

const pixiv = new PixivApi();
fb.setAccessToken(process.env.TOKEN);

const word = "初音ミク";

// Get random views number from 200 - 400
const viewsNum = Math.floor(Math.random() * 200) + 200;
console.log(`Views: ${viewsNum}`);

// Get random number algorithm
let lastIndex = -1;
function getRandom(length) {
    let index;
    do {
        index = Math.floor(Math.random() * length);
    } while (index === lastIndex && length > 1);
    lastIndex = index;
    return index;
}

// Get date
const date = Math.floor(Math.random() * 119) + 2; // Get random date from 2 - 120 days ago
console.log(`Date: ${date} ago`);
function getDate(date) {
    // The correct output must be date with format 'Y-m-d'
    const today = new Date();
    const dateOffset = 24 * 60 * 60 * 1000 * date;
    const targetDate = new Date(today - dateOffset);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
    const day = String(targetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
const searchDate = getDate(date);

// Where the magic happens
pixiv.refreshAccessToken(process.env.REFRESH_TOKEN).then(() => {
    pixiv
        .searchIllust(word, {
            search_target: "partial_match_for_tags",
            end_date: searchDate,
        })
        .then(async (json) => {
            // Filter out illusts where illust_ai_type is 2
            json.illusts = json.illusts.filter(
                (illust) => illust && illust.illust_ai_type !== 2
            );
            for (let i = 0; i < json.illusts.length; i++) {
                if (json.illusts[i] && json.illusts[i].total_view >= viewsNum) {
                    if (
                        json.illusts[i] &&
                        json.illusts[i].illust_ai_type === 1
                    ) {
                        // If ai type = 1, then it's an illust made by human
                        // const illust = json.illusts[i];

                        // Get random number from illusts
                        const index = getRandom(json.illusts.length);
                        const randomIllust = json.illusts[index];

                        if (randomIllust.page_count > 1) {
                            const illust = await pixiv.illustDetail(
                                randomIllust.id
                            );
                            const illustPages = illust.illust.meta_pages;
                            const CatillustUrls = [];
                            for (let j = 0; j < illustPages.length; j++) {
                                const illustPage = illustPages[j];
                                const url =
                                    illustPage.image_urls.original.replace(
                                        "i.pximg.net",
                                        "i.pixiv.cat"
                                    );
                                CatillustUrls.push(url);
                            }
                            let formattedCaption = randomIllust.caption.replace(
                                /<br \/>/g,
                                "\n"
                            );
                            console.log(
                                `Number of pages: ${CatillustUrls.length}`
                            );
                            console.log(
                                `AI Type: ${randomIllust.illust_ai_type}`
                            );
                            console.log(CatillustUrls);
                            fb.api(
                                "/me/photos",
                                "post",
                                {
                                    url: CatillustUrls,
                                    caption: `${randomIllust.title}\n${formattedCaption}\n\nPixiv ID: https://www.pixiv.net/en/artworks/${randomIllust.id}`,
                                },
                                function (response) {
                                    if (response && !response.error) {
                                        console.log("Post was successful!");
                                        console.log(response.id);
                                    } else {
                                        console.log(
                                            "Post was unsuccessful because of:",
                                            response.error
                                        );
                                    }
                                }
                            );
                        } else {
                            const CatillustUrl =
                                randomIllust.meta_single_page.original_image_url.replace(
                                    "i.pximg.net",
                                    "i.pixiv.cat"
                                );
                            let formattedCaption = randomIllust.caption.replace(
                                /<br \/>/g,
                                "\n"
                            );

                            console.log(
                                `Number of pages: ${CatillustUrl.length}`
                            );
                            console.log(
                                `AI Type: ${randomIllust.illust_ai_type}`
                            );

                            console.log(CatillustUrl);
                            fb.api(
                                "/me/photos",
                                "post",
                                {
                                    url: CatillustUrl,
                                    caption: `${randomIllust.title}\n${formattedCaption}\n\nPixiv ID: https://www.pixiv.net/en/artworks/${randomIllust.id}`,
                                },
                                function (response) {
                                    if (response && !response.error) {
                                        console.log("Post was successful!");
                                        console.log(response.id);
                                    } else {
                                        console.log(
                                            "Post was unsuccessful because of:",
                                            response.error
                                        );
                                    }
                                }
                            );
                        }

                        break; // Break the loop
                    }
                }
            }
        })
        .catch((error) => {
            console.error("Error refreshing access token:", error);
        });
});
