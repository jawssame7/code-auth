// google 設定
var googleClientId = '180953330333-3kgm275nmd7bsa7pq20sa79q2v4hd770.apps.googleusercontent.com';
// var googleClientId = '180953330333-3kgm275nmd7bsa7pq20sa79q2v4hd770.apps.googleusercontent.com';
var googleScope = 'openid profile https://www.googleapis.com/auth/calendar.readonly';
var googleCodeVerifier = generateCodeVerifier();

// office 設定
var officeClientId = '46a95529-84f6-4705-a25d-21300e6559c1';
var codeVerifierOffice = generateCodeVerifier();


// 共通
var redirectUri = 'http://localhost:8080/callback';

var popupOptions = {
    height: 550,
    resizable: 1,
    scrollbars: 1,
    width: 500
};

/**
 *
 */
var authInfoGoogle;

var authInfoOffice;

/**
 * googleの認証
 */
function connectGoogle() {
    var authUrl = 'https://accounts.google.com/o/oauth2/v2/auth',
        params;

    var ret = 'urn:ietf:wg:oauth:2.0:oob';

    params = {
        response_type: 'code',
        redirect_uri: encodeURIComponent(redirectUri),
        client_id: encodeURIComponent(googleClientId),
        scope: googleScope,
        approval_prompt: 'force',
        access_type: 'offline',
        code_challenge_method: 'S256',
        code_challenge: generateCodeChallenge(googleCodeVerifier)

    };

    authUrl = authUrl + '?' + stringify(params);

    var popup = createPopup(authUrl, redirectUri, popupOptions);

    popupMonitoring(popup);

}

function connectOffice365() {
    var authUrl = 'https://login.microsoftonline.com/common/oauth2/authorize',
        officeRedirectUri = 'https://login.microsoftonline.com/common/oauth2/nativeclient';
        // officeRedirectUri = 'http://127.0.0.1:8080';

    var params = {
        response_type: 'code',
        redirect_uri: encodeURIComponent(redirectUri),
        client_id: encodeURIComponent(officeClientId),
        response_mode: 'query',
        //scope: 'openid offline_access https://graph.microsoft.com/Calendars.Read',
        scope: 'openid offline_access',
        code_challenge_method: 'S256',
        code_challenge: generateCodeChallenge(codeVerifierOffice)
    };

    authUrl = authUrl + '?' + stringify(params);

    var popup = createPopup(authUrl, redirectUri, popupOptions);

    popupMonitoring(popup);
    window.popup = popup;
console.log(params)
}

function authCodeResult(str, obj) {
    var el;
    console.log(str)
    console.log(obj)
    if (obj.authuser) {
        el = document.getElementById('google_code_info');
        el.innerHTML = str;
        authInfoGoogle = JSON.parse(str);
    } else {
        console.log(str)
        el = document.getElementById('office365_token_info');
        el.innerHTML = str;
        authInfoOffice = JSON.parse(str);
    }
}

function getRefreshTokenGoogle() {
    getAccessToken(authInfoGoogle);
}

/**
 * トークンリフレッシュ処理
 */
function tokenRefreshGoogle () {
    var xhr = new XMLHttpRequest(),
        url = './refresh_token_google?',
        params;

    if (!authInfoGoogle) {
        return;
    }

    params = {
        refresh_token: authInfoGoogle.refresh_token,
        client_id: googleClientId,
        //client_secret: authInfoGoogle.client_secret,
        grant_type: 'refresh_token'
    };

    url = url + stringify(params);

    xhr.open('GET', url, false);
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // リクエストの終了。ここの処理を実行します。
            console.log(arguments, this);
            console.log(JSON.parse(this.response));
            var el = document.getElementById('google_refresh_token_info');
            el.innerHTML = this.response;
        }
    };

    xhr.send();

}

function tokenRefreshOffice365() {
    var xhr = new XMLHttpRequest(),
        url = './refresh_token_office365?',
        params;

    if (!authInfoOffice) {
        return;
    }

    params = {
        refresh_token: authInfoOffice.refresh_token,
        client_id: officeClientId,
        //client_secret: authInfoOffice.client_secret,
        grant_type: 'refresh_token'
    };

    url = url + stringify(params);

    xhr.open('GET', url, false);
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // リクエストの終了。ここの処理を実行します。
            console.log(arguments, this);
            console.log(JSON.parse(this.response));
            var el = document.getElementById('office365_token_refresh');
            el.innerHTML = this.response;
        }
    };

    xhr.send();
}

/**
 * アクセストークンの取得
 * @param obj
 */
function getAccessToken(obj) {
    console.log('getAccessToken', obj)
    var xhr = new XMLHttpRequest(),
        url = './auth/',
        param;

    if (obj.authuser) {
        param = getGoogleAccessTokenParam(obj);
        url = url + 'google?' + stringify(param);
    } else {
        param = getOffice365AccessTokenParam(obj);
        url = url + 'office365?' + stringify(param);
    }

    xhr.open('GET', url, false);
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            // リクエストの終了。ここの処理を実行します。
            console.log(arguments, this)
            console.log(JSON.parse(this.response));
            var el;
            if (obj.authuser) {
                authInfoGoogle = JSON.parse(this.response);
                el = document.getElementById('google_token_info');
            } else {
                authInfoOffice = JSON.parse(this.response);
                el = document.getElementById('office365_token_info');
            }
            el.innerHTML = this.response;
        }
    };

    xhr.send();

}

/**
 * googleのトークン取得のためのパラメータを取得
 * @param obj
 * @return {{code: string, client_id: string|*, client_secret: string, redirect_uri: string|*, grant_type: string, code_verifier}}
 */
function getGoogleAccessTokenParam(obj) {
    obj.grant_type = 'authorization_code';
    obj.clientId = googleClientId;
    //obj.client_secret = 'Tw1x3B-nm3NB0X8kKGz-qRJq';
    obj.redirect_uri = location.href + 'callback';
    console.log(obj)


    var params = {
        code: decodeURIComponent(obj.code),
        client_id: obj.clientId,
        //client_secret: obj.client_secret,
        redirect_uri: obj.redirect_uri,
        grant_type: obj.grant_type,
        code_verifier: googleCodeVerifier
    };

    return params;
}

function getOffice365AccessTokenParam(obj) {

    var params = {
        grant_type: 'authorization_code',
        client_id: decodeURIComponent(officeClientId),
        code: decodeURIComponent(obj.code),
        redirect_uri: decodeURIComponent(redirectUri),
        code_verifier: codeVerifierOffice
    };

    return params;
}


