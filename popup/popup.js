if (typeof browser == "undefined") {
    var browser = chrome;
}

var homepageLink = document.querySelector("#homepage");
homepageLink.addEventListener("click", () => {
    browser.tabs.create({
        url: "https://github.com/warpech/QuickReply",
        active: true
    });
    return false;
})
