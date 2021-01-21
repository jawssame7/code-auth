/**
 * リダイレクトURLからのコールバック関数
 * @param window
 * @param parent
 */
function responseHandler(window, parent) {
    var p;
    var location = window.location;

    // Is this an auth relay message which needs to call the proxy?
    //p = _this.param(location.search);

    p = parse();

    console.log(location.hash)
    console.log(p)

    if (p && p.code) {
        p.callback = 'authCode';

        authCallback(p, window, parent);
    }


    // Trigger a callback to authenticate
    function authCallback(obj, window, parent) {

        var cb = obj.callback;


        // Remove from session object
        if (parent && cb && cb in parent) {

            try {
                delete obj.callback;
            }
            catch (e) {}


            // Call the globalEvent function on the parent
            // It's safer to pass back a string to the parent,
            // Rather than an object/array (better for IE8)
            var str = JSON.stringify(obj);

            try {
                callback(parent, cb)(str, obj);
            }
            catch (e) {
                // Error thrown whilst executing parent callback
            }
        }

        closeWindow();
    }

    function callback(parent, callbackID) {

        return parent[callbackID];
    }

    function closeWindow() {

        // Close this current window
        try {
            window.close();
        }
        catch (e) {}

        // IOS bug wont let us close a popup if still loading
        if (window.addEventListener) {
            window.addEventListener('load', function() {
                window.close();
            });
        }

    }
}

responseHandler(window, window.opener);