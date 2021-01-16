let cheerio = require('cheerio');
let request = require('request-promise');
const API_SERVER = 'http://online.ueh.edu.vn';
let __VIEWSTATE = '';
let __VIEWSTATEGENERATOR = ''
let __EVENTVALIDATION = ''
class UEH_Crawl{
    
    constructor(){
            
       this.jar = request.jar() 
        request = request.defaults({
            headers:{
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "upgrade-insecure-requests": "1",
                "cookie": "_ga=GA1.3.1645879011.1599398296; _fbp=fb.2.1599475167843.167287746; ASP.NET_SessionId=cz1lzj1j0hll55ykfhdivzz3",
            },

            referrerPolicy: 'strict-origin-when-cross-origin',
            referrer: "http://online.ueh.edu.vn/",
            mode: "cors"

        })
    }

    requestServer(data = {
        pathURI, formData: '', isTransform: false
    }){
        let form = {
            uri: API_SERVER,
            jar: this.jar,
            method: (typeof data.formData === 'object') ? 'post' : 'get',
            formData: data.formData,
        }
        if(data.isTransform) form.transform = body => cheerio.load(body)
        return request(form)
    }


    login(){
        return new Promise(async (reslove, reject) =>{
            try{
                const $ = await this.requestServer({
                    pathURI: '/',
                    formData:{
                        __EVENTTARGET: '',
                        __EVENTARGUMENT: '',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$Role: 'rbtnStudent',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$txtUserName: '31201020315',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$txtPassword: '21967754',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$btLogin: 'Đăng nhập'
                    },
                    isTransform: true,

                })
            
                //if($('#lbtDangnhap').text() === 'Đăng Thoát') reject('Đăng Nhập Thất Bại');
                __VIEWSTATE = $('#__VIEWSTATE').val()
                __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').val()
                __EVENTVALIDATION = $('#__EVENTVALIDATION').val()
               reslove(this.jar)
            }
            catch(err){
                reject(err)
            }
        })
    }

    getInfo(){
        return new Promise(async (reslove, reject) =>{
            try{
                console.log(__VIEWSTATEGENERATOR)
                const $ = await this.requestServer({
            
                    pathURI: '/',
                    formData: {
                        __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ctl00$ctl00$lnkInfo', 
                        __EVENTARGUMENT: '',
                        __VIEWSTATE,
                        __VIEWSTATEGENERATOR,
                        __EVENTVALIDATION

                    },
                    isTransform: true
                })
                const userTable = $('#Table3').children('tbody').children()
                let user = {}
                userTable.map(function(){

                    user[$(this).find('span.StudentInfoText_dl').text()]  = $(this).find('span.StudentInfoDetails_dl').text()
                })
                
                console.log(user)
                reslove("aa")

            }catch(err){
                reject(err)
            }
    
        })
    }
    
}

const API = new UEH_Crawl(); 
(async() =>{
    try{
        await API.login()
        let username = await API.getInfo()
        console.log(username)
    
    }catch(err){
        console.log(err)
    }
})();
