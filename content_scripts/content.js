//I know the code is a mess :)

if (typeof browser == "undefined") {
    var browser = chrome;
}

var findCommentButton = (parent) => {
    return parent.querySelector("#partial-new-comment-form-actions > button.btn.btn-primary");
};
var findCloseButton = (parent) => {
    return parent.querySelector("#partial-new-comment-form-actions > button[name='comment_and_close']");
};
var findCommentTextarea = (parent) => {
    return parent.querySelector("#new_comment_field");
};
var findQuickReplyContainer = (parent) => {
    return parent.querySelector("#quick-reply-container");
};
var findQuickReplyButton = (parent) => {
    return parent.querySelector("#quick-reply-button");
};

var replies = [{
        title: "I think this issue can be closed. The problem is solved.",
        closes: true,
        issue: true
    },
    {
        title: "I think this issue can be closed. All of the items are tracked in other issues.",
        closes: true,
        issue: true
    },
    {
        title: "Closing as done.",
        closes: true,
        issue: true
    },
    {
        title: "This PR seems stale. Please consider what can be done to finish it.",
        closes: false,
        issue: true
    }
];

var style = `
body {
  /*border: 5px solid green !important;*/
}

#quick-reply-container {
  float: right;
  margin-right: 5px;
}

.qr-caret {
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 8px;
  vertical-align: middle;
  border-top: 4px dashed;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
}`;

function parsedHtml(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    return doc.querySelector("div");
}

function createStyle(doc) {
    var elem = doc.createElement("style");
    elem.appendChild(doc.createTextNode(style));
    doc.head.appendChild(elem);
}

function createButton(doc) {
    var elem = doc.createElement("button");
    elem.id = "quick-reply-button";
    elem.classList.add("btn", "btn-secondary");
    elem.appendChild(doc.createTextNode("Quick Reply"));

    var caret = doc.createElement("span");
    caret.classList.add("qr-caret");
    elem.appendChild(caret);

    elem.addEventListener("click", (ev) => {
        ev.preventDefault();
    });
    return elem;
}

function createMenu(doc) {
    var elem = doc.createElement("div");
    elem.id = "quick-reply-container";

    var innerHTML = `<div style="position: relative; clear: both">
    <div class="select-menu-modal-holder" style="bottom: 0">
        <div class="select-menu-modal subscription-menu-modal js-menu-content" style="margin-bottom: 0">
          <div class="select-menu-header js-navigation-enable" tabindex="-1">
            <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path fill-rule="evenodd" d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg>
            <span class="select-menu-title">Choose an option to send a quick reply</span>
          </div>

            <div class="select-menu-list js-navigation-container js-active-navigation-container" role="menu">
            </div>

          </div>
        </div>
    </div>`;

    elem.appendChild(parsedHtml(innerHTML));

    var quickReplyButton = createButton(document);
    elem.appendChild(quickReplyButton);

    quickReplyButton.addEventListener("click", () => {
        elem.querySelector('.select-menu-modal-holder').style.display = "block";
    });

    elem.close = () => {
        elem.querySelector('.select-menu-modal-holder').style.display = "none";
    };

    elem.querySelector('[aria-label="Close"]').addEventListener("click", () => {
        elem.close();
    });

    elem.addEventListener("click", (ev) => {
        ev.stopPropagation();
    });

    window.addEventListener("click", () => {
        elem.close();
    });

    return elem;
}

function createOption(doc, reply) {
    var elem = doc.createElement("div");
    elem.classList.add("select-menu-item", "js-navigation-item");
    elem.setAttribute("role", "menuitem");
    elem.setAttribute("tabindex", "0");

    var text = reply.title;
    var icon = "";

    if (reply.closes) {
        icon = `<span class="select-menu-item-icon" title="Closes the issue">🔴</span>`;
    }

    var innerHTML = `<div class="select-menu-item-text">
      ${icon}
      <span class="select-menu-item-text">${text}</span>
    </div>`;

    elem.appendChild(parsedHtml(innerHTML));

    elem.addEventListener("click", () => {
        var textarea = findCommentTextarea(document.body);
        textarea.value = "Quick Reply<sup>[?](https://github.com/warpech/QuickReply)</sup>: " + reply.title;
        findQuickReplyContainer(document.body).close();
        var commentButton = findCommentButton(document.body);
        var closeButton = findCloseButton(document.body);
        if (reply.closes && closeButton) {
            closeButton.click();
        } else {
            commentButton.click();
        }
        textarea.value = "";
    });

    return elem;
}

function init(ev) {
    var commentButton = findCommentButton(document.body);
    if (commentButton) {
        var quickReplyButton = findQuickReplyButton(document.body);
        if (quickReplyButton) {
            if (commentButton.hasAttribute("disabled") && !quickReplyButton.hasAttribute("disabled")) {
                quickReplyButton.setAttribute("disabled", "");
            } else if (quickReplyButton.hasAttribute("disabled")) {
                quickReplyButton.removeAttribute("disabled");
            }
            return;
        }

        var menu = createMenu(document);
        var menuItems = menu.querySelector("[role='menu']");
        replies.forEach((reply) => {
            menuItems.appendChild(createOption(document, reply));
        });
        commentButton.parentNode.appendChild(menu);
    }
}

var target = document.querySelector('#js-repo-pjax-container');
if (target) {
    var observer = new MutationObserver(function(mutations) {
        init();
    });
    var config = {
        childList: true,
        subtree: true
    };
    observer.observe(target, config);
    init();

    createStyle(document);
}
