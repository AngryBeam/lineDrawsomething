var userData;
window.onload = function (e) {
    liff.init(function (data) {
        initializeApp(data);
    });
};

function initializeApp(data) {
    
    let profile = liff.getProfile().then(function (profile) {
        var lineUserData = data.context;
        isLineUser = true;
        userData = { 
            'isLineUser': isLineUser,
            'userData': lineUserData,
            'userProfile': profile
        };

    }).catch(function (error) {
        window.alert("Error getting profile: " + error);
    });
    
}