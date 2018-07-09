const elements = {
    loadBody: document.querySelector('#loadBody'),
    lineUserData : document.querySelector('#lineUserData'),
    lobby : document.querySelector('#lobby'),
    gamePlay : document.querySelector('#gamePlay')
};

var userData;
var isDone = false;

window.onload = function (e) {
    renderLoader(elements.loadBody);
    liff.init(
        data => {
            userData = initializeApp(data);
            liff.getProfile().then(function (userProfile) {
                userData.displayName = userProfile.displayName;
                userData.pictureUrl = userProfile.pictureUrl;
            }).then(() => {
                document.getElementById('debugfield').textContent = JSON.stringify(userData, null, 2);
           
                sendData('/users/register', userData).then((res) => {
                    isDone = true;
                    document.getElementById('debug1').textContent = JSON.stringify(res, null, 2);
                    
                    elements.lobby.style.display = 'block';
                    elements.lineUserData.style.display = 'none';
                    renderLobby(res);
                    clearLoader();
                }).catch(function (e) {
                    document.getElementById('debug2').textContent = JSON.stringify(e, null, 2);
                });
                
            }).catch(function (error) {
                window.alert("Error getting profile: " + error);
            });
        },
        err => {
          console.log(err);
        }
    );
    
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
    
    var channelId = data.context.utouId || data.context.roomId || data.context.groupId;

    userData = {
        language: data.language,
        viewtype: data.context.viewType,
        userId: data.context.userId,
        channelId: channelId
    }
    
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
        return res;
    } catch (error) {
        //alert(error);
        document.getElementById('axiosfield').textContent = JSON.stringify(error, null, 2);
        return Promise.reject(error);
    }

}

function renderLobby(res){
    res.channelList.forEach(element => {
        var markup = `<tr>
                        <th><img src="${element.pictureUrl}"></th>
                        <td id="displayName">${element.displayName}</td>
                    </tr>`;
        elements.lobby.insertAdjacentHTML('beforeend', markup);
    });
}
