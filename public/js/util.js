

/**
 * オブジェクトをクエリー文字列に変換
 * @param value
 * @param sep
 * @param eq
 * @param isEncode
 * @return {string}
 */
function stringify (value, sep, eq, isEncode) {
    // デフォルト値を設定
    sep = sep || '&'; // 省略時は &
    eq = eq || '=';   // 省略時は =
    // エンコードするかどうか
    var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
    // Object.keys で key 配列を取得し, それを map で回した結果を sep(&) で join して返す
    return Object.keys(value).map(function(key) {
        // key, value を eq(=) で連結した文字列を返す
        return key + eq + encode(value[key]);
    }).join(sep);
}

/**
 * クエリー文字列をオブジェクトに変換
 * @param text
 * @param sep
 * @param eq
 * @param isDecode
 * @return {{}}
 */
function parse(text, sep, eq, isDecode) {
    // デフォルト値を設定
    text = text || location.search.substr(1); // 省略時は URL パラメータ
    sep = sep || '&'; // 省略時は &
    eq = eq || '=';   // 省略時は =
    // デコードするかどうか
    var decode = (isDecode) ? decodeURIComponent : function(a) { return a; };
    // sep(&) で split した配列を reduce で回した結果を返す
    return text.split(sep).reduce(function(obj, v) {
        // eq(=) で split して一番目を key 二番目を value として obj に代入
        var pair = v.split(eq);
        obj[pair[0]] = decode(pair[1]);
        return obj;
    }, {});
}

/**
 * ポップアップ作成
 * @param url
 * @param redirectUri
 * @param options
 * @return {Window}
 */
function createPopup(url, redirectUri, options) {

    var documentElement = document.documentElement;

    // Multi Screen Popup Positioning (http://stackoverflow.com/a/16861050)
    // Credit: http://www.xtf.dk/2011/08/center-new-popup-window-even-on.html
    // Fixes dual-screen position                         Most browsers      Firefox

    if (options.height && options.top === undefined) {
        var dualScreenTop = window.screenTop !== undefined ? window.screenTop : screen.top;
        var height = screen.height || window.innerHeight || documentElement.clientHeight;
        options.top = parseInt((height - options.height) / 2, 10) + dualScreenTop;
    }

    if (options.width && options.left === undefined) {
        var dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : screen.left;
        var width = screen.width || window.innerWidth || documentElement.clientWidth;
        options.left = parseInt((width - options.width) / 2, 10) + dualScreenLeft;
    }

    // Convert options into an array
    var optionsArray = [];
    Object.keys(options).forEach(function(name) {
        var value = options[name];
        optionsArray.push(name + (value !== null ? '=' + value : ''));
    });

    // Call the open() function with the initial path
    //
    // OAuth redirect, fixes URI fragments from being lost in Safari
    // (URI Fragments within 302 Location URI are lost over HTTPS)
    // Loading the redirect.html before triggering the OAuth Flow seems to fix it.
    //
    // Firefox  decodes URL fragments when calling location.hash.
    //  - This is bad if the value contains break points which are escaped
    //  - Hence the url must be encoded twice as it contains breakpoints.
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
        url = redirectUri + '#oauth_redirect=' + encodeURIComponent(encodeURIComponent(url));
    }

    var popup = window.open(
        url,
        '_blank',
        optionsArray.join(',')
    );

    // popup.addEventListener('beforeunload', function() {
    //     console.log('aaaaaaaaaaa', arguments)
    // });

    // popup.onload = function () {
    //     console.log('hoge')
    // }

    // var popup = window.open(
    //     './test.html',
    //     '_blank',
    //     optionsArray.join(',')
    // );
    //
    // popup.onload = function () {
    //     console.log('hoge', this)
    //     var me = this;
    //     var iframe = me.document.createElement('iframe');
    //     iframe.src = 'https://login.microsoftonline.com/common/oauth2/authorize';
    //     console.log(url)
    //     console.log(iframe)
    //     var element = me.document.querySelector("body");
    //     element.appendChild(iframe);
    //
    // }


    //popup.document.write('<iframe height="100%" allowTransparency="true" frameborder="0" scrolling="no" style="width:100%;" src=url+\'" type= "text/javascript"></iframe>');

    if (popup && popup.focus) {
        popup.focus();
    }


    //
    //console.log(popup.location.href)

    window.popup = popup;
    return popup;
}

/**
 * ポップアップを監視
 * @param popup
 */
function popupMonitoring(popup) {

    var timer = setInterval(function() {

        if (!popup || popup.closed) {
            clearInterval(timer);

            var response = 'cancelled Login has been cancelled';
            if (!popup) {
                response = 'blocked Popup was blocked';
            }
            console.log(response)
        }
    }, 100);
}

/**
 * 認可コード取得時のコールバック
 * @param str
 * @param obj
 */
function authCode (str, obj) {
    // console.log(str)
    // console.log(obj)
    //getAccessToken(obj);
    authCodeResult(str, obj);
}

/**
 * code_verifier を作成
 */
function generateCodeVerifier() {
    var code_verifier = generateRandomString(32);
    return code_verifier;
}

/**
 * ランダムな文字列を作成
 * @param length
 * @return {string}
 */
function generateRandomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/**
 * code_challenge を作成
 * @param code_verifier
 * @return {*}
 */
function generateCodeChallenge(code_verifier) {
    var code_challenge = base64URL(CryptoJS.SHA256(code_verifier));
    return code_challenge;
}

/**
 * Base64 に変換
 * @param string
 * @return {string}
 */
function base64URL(string) {
    return string.toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}