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
        liff.sendMessages([{
            type: 'text',
            text: userData
        }]).then(function () {
            //window.alert("Message sent");
        }).catch(function (error) {
            window.alert("Error sending message: " + error);
        });

    }).catch(function (error) {
        window.alert("Error getting profile: " + error);
    });
    
}