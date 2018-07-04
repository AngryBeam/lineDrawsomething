const elements = {
    loadBody: document.querySelector('#loadBody')
};

window.onload = function (e) {
    renderLoader(elements.loadBody);
    liff.init(function (data) {
        initializeApp(data);
        alert(userData);
    });
    clearLoader();

};

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
    document.getElementById('languagefield').textContent = data.language;
    document.getElementById('viewtypefield').textContent = data.context.viewType;
    document.getElementById('useridfield').textContent = data.context.userId;
    document.getElementById('utouidfield').textContent = data.context.utouId;
    document.getElementById('roomidfield').textContent = data.context.roomId;
    document.getElementById('groupidfield').textContent = data.context.groupId;
    var channelId = data.context.utouId || data.context.roomId || data.context.groupId;
    var userData = {
        language: data.language,
        viewtype: data.context.viewType,
        userId: data.context.userId,
        channelId: channelId
    }

    liff.getProfile().then(function (profile) {
        userData.displayName = profile.displayName;
        userData.pictureUrl = profile.pictureUrl;
    });

    document.getElementById('debugfield').textContent = JSON.stringify(userData, null, 2);
    sendData('/users/register', userData);
    
}

async function sendData(url, data){
    document.getElementById('axiosfield').textContent = `Sending Data: ${data}`;
    try {
        const res = await axios({
            method: 'post',
            url: url,
            data: data
        });
        //const res = await axios(path);      
        document.getElementById('debugfield').textContent = res;
    } catch (error) {
        alert(error);
    }
}

document.getElementById('closewindowbutton').addEventListener('click', function () {
    liff.closeWindow();
});
