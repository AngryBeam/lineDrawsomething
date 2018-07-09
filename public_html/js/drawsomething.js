const elements = {
    loadBody: document.querySelector('#loadBody')
};

var userData;
var isDone = false;
//window.onload = function (e) {
    /* renderLoader(elements.loadBody);
    liff.init((data) => {
        userData = initializeApp(data);
    });
    document.getElementById('debugfield').textContent = JSON.stringify(userData, null, 2);
    alert(userData);
    clearLoader(); */
    liff.init(
        data => {
          // Now you can call LIFF API
          //const userId = data.context.userId;
            var userData = initializeApp(data);
            liff.getProfile().then((userProfile) => {
                userData.displayName = userProfile.displayName;
                userData.pictureUrl = userProfile.pictureUrl;
                isDone = true;
            });
        },
        err => {
          // LIFF initialization failed
        }
      ).then(() => {
        document.getElementById('debugfield').textContent = JSON.stringify(userData, null, 2);
      });
    
//};

const elementStrings = {
    loader: 'loader'
};

const renderLoader = parent => {
    const loader = `
        <div class="${elementStrings.loader}">
            <img src="images/Ellipsis-1s-200px.gif">
        </div>
    `;
    parent.insertAdjacentHTML('afterbegin', loader);
};

const clearLoader = () => {
    const loader = document.querySelector(`.${elementStrings.loader}`);
    if (loader) loader.parentElement.removeChild(loader);
};

function initializeApp(data) {
    
    var channelId = data.context.utouId || data.context.roomId || data.context.groupId;

    userData = {
        language: data.language,
        viewtype: data.context.viewType,
        userId: data.context.userId,
        channelId: channelId
    }
    
    return userData;
}

function getProfile(userData){
    liff.getProfile().then((profile) => {
        this.userData.displayName = profile.displayName;
        this.userData.pictureUrl = profile.pictureUrl;
        document.getElementById('roomidfield').textContent = profile.displayName;
        document.getElementById('groupidfield').textContent = profile.pictureUrl;
        document.getElementById('debug2').textContent = JSON.stringify(userData, null, 2);
        sendData('/users/register', userData);
    });
  
    document.getElementById('debug3').textContent = JSON.stringify(userData, null, 2);
    return userData;
}

async function sendData(url, data){
    
    try {
        const res = await axios({
            method: 'post',
            url: url,
            data: data
        });
        //const res = await axios(path);      
        document.getElementById('axiosfield').textContent = JSON.stringify(res, null, 2);
    } catch (error) {
        //alert(error);
    }
}

document.getElementById('closewindowbutton').addEventListener('click', function () {
    liff.closeWindow();
});
