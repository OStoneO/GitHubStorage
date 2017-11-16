/* globals chrome, qrcode */

var isPageActionPopup = location.search === "";
var options = JSON.parse(localStorage.getItem("options")) || {
    ecl: "M",
    moduleSize: 4,
    ask: true,
    autoclose: true
};

var dpr = window.devicePixelRatio || 1;
var $qrcode = document.getElementById("qrcode");
var qr;

options.moduleSize *= dpr;

window.makeCode = function(data, tn) {
    var img;
    tn = tn || 4;

    try {
        qr = qrcode(tn, options.ecl);
        qr.addData(data);
        qr.make();
        $qrcode.title = data;
        $qrcode.innerHTML = qr.createImgTag(options.moduleSize, options.moduleSize);

        var size = $qrcode.querySelector("img").getAttribute("width") / dpr;
        $qrcode.style.width = $qrcode.style.height = size + "px";
        if (isPageActionPopup) document.body.style.minWidth = document.body.style.minHeight = Math.max(300, size * 1.25) + "px";
    } catch (e) {
        if (tn < 20) {
            makeCode(data, tn + 2);
        } else {
            chrome.runtime.sendMessage({
                alert: chrome.i18n.getMessage("error") + "\r" + e.message
            });
        }
    }
};

if (isPageActionPopup) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        makeCode(tabs[0].url);
    });
} else {
    document.title = chrome.i18n.getMessage("short_name");

    if (options.autoclose) window.onblur = window.close;

    $qrcode.ondblclick = function() {
        var oldData = $qrcode.title;
        var newData = prompt(chrome.i18n.getMessage("edit"), oldData);

        if (newData && newData !== oldData) {
            makeCode(newData);
        }
    };
}
