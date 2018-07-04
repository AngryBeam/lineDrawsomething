import axios from 'axios';

export default class Server {
    constructor(userData) {
        this.userData = userData;
    }

    async getResults() {
        try {
            //const res = await axios(method: 'post',`https://linedrawsomething.herokuapp.com/`, {this.userData});
            const res = await axios({
                method: 'post',
                url: 'https://linedrawsomething.herokuapp.com//users/register',
                data: this.userData
              });
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch (error) {
            alert(error);
        }
    }
}