import { elements, renderLoader, clearLoader } from './views/base';

/* var userData;
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
    
} */

window.onload = function (e) {
    liff.init(function (data) {
        initializeApp(data);
    });
};

function initializeApp(data) {
    document.getElementById('languagefield').textContent = data.language;
    document.getElementById('viewtypefield').textContent = data.context.viewType;
    document.getElementById('useridfield').textContent = data.context.userId;
    document.getElementById('utouidfield').textContent = data.context.utouId;
    document.getElementById('roomidfield').textContent = data.context.roomId;
    document.getElementById('groupidfield').textContent = data.context.groupId;
}

//get profile call
document.getElementById('getprofilebutton').addEventListener('click', function () {
    liff.getProfile().then(function (profile) {
        document.getElementById('useridprofilefield').textContent = profile.userId;
        document.getElementById('displaynamefield').textContent = profile.displayName;

        var profilePictureDiv = document.getElementById('profilepicturediv');
        if (profilePictureDiv.firstElementChild) {
            profilePictureDiv.removeChild(profilePictureDiv.firstElementChild);
        }
        var img = document.createElement('img');
        img.src = profile.pictureUrl;
        img.alt = "Profile Picture";
        profilePictureDiv.appendChild(img);

        document.getElementById('statusmessagefield').textContent = profile.statusMessage;
        toggleProfileData();
    }).catch(function (error) {
        window.alert("Error getting profile: " + error);
    });
});

function toggleProfileData() {
    var elem = document.getElementById('profileinfo');
    if (elem.offsetWidth > 0 && elem.offsetHeight > 0) {
        elem.style.display = "none";
    } else {
        elem.style.display = "block";
    }
}