const elements = {
    loadBody: document.querySelector('#loadBody'),
    lobby : document.querySelector('#lobby'),
    lobbyTable: document.querySelector('#lobbyTable'),
    gamePlay : document.querySelector('#gamePlay'),
    newQuiz : document.querySelector('#newQuiz'),
    saveQuiz : document.querySelector('#saveQuiz')
};

var userData;
var isDone = false;
var quizName;

window.onload = function (e) {
    renderLoader(elements.loadBody);
    
    liff.init(
        data => {
            userData = initializeApp(data);
            liff.getProfile().then(function (userProfile) {
                userData.displayName = userProfile.displayName;
                userData.pictureUrl = userProfile.pictureUrl;
            }).then(() => {
                
           
                sendData('/users/register', userData).then((res) => {
                    isDone = true;
                    elements.lobby.style.display = 'block';
                    elements.newQuiz.style.display = 'block';
                    renderLobby(res);
                    clearLoader();
                }).catch(function (e) {
                    
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
        <div class="${elementStrings.loader}" align="center">
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
        channelId: channelId,
        displayName: '',
        pictureUrl: '',
        gamePlay: {}
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
        return res;
    } catch (error) {
        //alert(error);
        return Promise.reject(error);
    }

}

function renderLobby(res){
    res.data.channelList.forEach(element => {
        var markup = `<tr>
                        <th><img src="${element.pictureUrl}"></th>
                        <td id="displayName">${element.displayName}</td>
                    </tr>`;
        elements.lobbyTable.insertAdjacentHTML('beforeend', markup);
    });
}

elements.newQuiz.addEventListener("click", () => {
    quizName = prompt('What your quiz?');
    if(quizName != null){
        //process to gameDrawing
        elements.lobby.style.display = "none";
        elements.newQuiz.style.display = "none";
        elements.saveQuiz.style.display = "block";
        elements.gamePlay.style.display = "block";
        //console.log(quizName);
    }
});

elements.saveQuiz.addEventListener("click", () => {
    renderLoader(elements.loadBody);
    var markup = {
        id,
        quiz: quizName,
        data: replayData
    }
    
    userData.gamePlay = markup;
    sendData('/users/save', userData).then((res) => {
        quizName = null;
        replayData = [];
        elements.lobby.style.display = "block";
        elements.newQuiz.style.display = "block";
        elements.saveQuiz.style.display = "none";
        elements.gamePlay.style.display = "none";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }).then(() => {
        
        sendData('/users/me', userData).then((res) => {
            renderLobby(res);
            clearLoader();
        }).catch(function (e) {
            clearLoader();
            alert(e);
        });
    }).catch(function (e) {
        clearLoader();
        alert(e);
        //document.getElementById('debug2').textContent = JSON.stringify(e, null, 2);
    });
})
// Configuration
var line_thickness = 7;
var line_colour = "blue";

// Variables
var canvas = $('#paper');
var ctx = canvas[0].getContext('2d');
var id = Math.round($.now() * Math.random()); // Generate a unique ID
var drawing = false; // A flag for drawing activity
var touchUsed = false; // A flag to figure out if touch was used
var deleting = false;
var clients = {};
var cursors = {};
var prev = {}; // Previous coordinates container
var lastEmit = $.now();
var replayData = [];

// Drawing helper function
function drawLine(fromx, fromy, tox, toy)
{
    ctx.lineWidth = line_thickness;
    ctx.strokeStyle = line_colour;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
}

// On mouse down
canvas.on('mousedown', function(e) {
    replayData.push({
        'x': e.pageX,
        'y': e.pageY,
        'touch': false,
        'drawing': drawing,
        'id': id
    });
    e.preventDefault();
    drawing = true;
    prev.x = e.pageX;
    prev.y = e.pageY;
});

// On touch start
canvas.on('touchstart', function(e) {
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    drawing = true;
    prev.x = touch.pageX;
    prev.y = touch.pageY;
    
});

// On mouse move
canvas.on('mousemove', function(e) {
    // Emit the event to the server
    if ($.now() - lastEmit > 30)
    {
        replayData.push({
            'x': e.pageX,
            'y': e.pageY,
            'touch': false,
            'drawing': drawing,
            'id': id          
        });
        lastEmit = $.now();
    }
    
    // Draw a line for the current user's movement
    if (drawing)
    {
        drawLine(prev.x, prev.y, e.pageX, e.pageY);
        prev.x = e.pageX;
        prev.y = e.pageY;
    }
});

// On touch move
canvas.on('touchmove', function(e) {
    e.preventDefault();
    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
    
    // Emit the event to the server
    if ($.now() - lastEmit > 10)
    {
        replayData.push({
            'x': touch.pageX,
            'y': touch.pageY,
            'startX': prev.x,
            'startY': prev.y,
            'touch': true,
            'drawing': drawing,
            'id': id
        });
        lastEmit = $.now();
    }
    
    // Draw a line for the current user's movement
    if (drawing)
    {
        drawLine(prev.x, prev.y, touch.pageX, touch.pageY);
        prev.x = touch.pageX;
        prev.y = touch.pageY;
    }
});

// On mouse up
canvas.on('mouseup mouseleave', function(e) {
    drawing = false;
    if(deleting){
        line_thickness = 7;
        line_colour = "blue";
        deleting = false;
    }
});

// On touch end
canvas.on('touchend touchleave touchcancel', function(e) {
    drawing = false;
    if(deleting){
        line_thickness = 7;
        line_colour = "blue";
        deleting = false;
    }
});