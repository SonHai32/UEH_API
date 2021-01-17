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
                 "cookie": "_ga=GA1.3.558671917.1606993663; _fbp=fb.2.1606993664855.1318858175; ASP.NET_SessionId=klx4fdtul3ja3ohyuvnov0pe"
            },

            referrerPolicy: 'strict-origin-when-cross-origin',
            referrer: "http://online.ueh.edu.vn/",
            mode: "cors"

        })
    }

    requestServer(data = {
        formData: '', isTransform: false
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


    fetchHiddenParam(){
        return new Promise(async (reslove, reject) =>{
            try{
            
                const $ = await this.requestServer({isTransform: true})
                __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').val()
                __EVENTVALIDATION = $('#__EVENTVALIDATION').val()
                __VIEWSTATE = $('#__VIEWSTATE').val()


                reslove('loaded')
            }catch(err){
                reject(err)
            }
        }) 
    }

    login(){
        return new Promise(async (reslove, reject) =>{
            try{
                const $ = await this.requestServer({
                    formData:{
                        __EVENTTARGET: '',
                        __EVENTARGUMENT: '',
                        __VIEWSTATE,
                        __VIEWSTATEGENERATOR,
                        __EVENTVALIDATION,
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$Role: 'rbtnStudent',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$txtUserName: '31201020315',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$txtPassword: '21967754',
                        ctl00$ContentPlaceHolder1$ctl00$ctl00$btLogin: 'Đăng nhập'
                    },
                    isTransform: true,

                })
            
                //if($('#lbtDangnhap').text() === 'Đăng Thoát') reject('Đăng Nhập Thất Bại');
                console.log($('#lbtDangnhap').text())
                __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').val()
                __EVENTVALIDATION = $('#__EVENTVALIDATION').val()
                __VIEWSTATE = $('#__VIEWSTATE').val()
               reslove(this.jar)
            }
            catch(err){
                reject(err)
            }
        })
    }

    getStudentInfo(){
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
    
                let user = {
                    id: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbMaso').text(),
                    name: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbHoVaTen').text(),
                    birthDate: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbNgaysinh').text(),
                    place: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbNoiSinh').text(),
                    gender: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_blGioiTinh').text(),
                    email: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbEmailInfor').text(),
                    emailUEH: $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbEmailInfo2').text(),
                    avatar: API_SERVER + '/' + $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_imgStudents').attr('src')
                }

                reslove(user)
            }catch(err){
                reject(err)
            }
    
        })
    }
    
    getSchedule(){
        return new Promise(async (reslove, reject) =>{
            try{
                

                let listSchedule = [];
                const $ = await this.requestServer({
                    formData: {
                        __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ctl00$ctl00$lnkThoiKhoaBieu', 
                        __EVENTARGUMENT: '',
                        __VIEWSTATE,
                        __VIEWSTATEGENERATOR,
                        __EVENTVALIDATION
                    },
                    isTransform: true
                })

                let scheduleTable = $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_grvThoikhoabieu').children('tbody').children()
                scheduleTable.map(function(){
                    listSchedule.push({
                        weekIndex: $(this).children()[0].find('span').text(),
                        subjectName: $(this).find('td').text(),
                        room: $(this).find('td').text(),
                        startAt: $(this).find('td').text(),
                        endAt: $(this).find('span').text(),
                        date: $(this).find('#ContentPlaceHolder1_ctl00_ctl00_ctl00_grvThoikhoabieu_lblEndTime_0').text(),
                        note: $(this).find('#ContentPlaceHolder1_ctl00_ctl00_ctl00_grvThoikhoabieu_lblFullName_0').text(),
                    })
                })
                console.log(listSchedule)
               /* const tableSchedule = $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_grvThoikhoabieu').childen('tbody').childen()
                tableSchedule.map(function(){
                    console.log($(this).text())
                })*/
                reslove('0k')
            }catch(error){
                reject(error)
            }
        })
        

    }
    
}

const API = new UEH_Crawl(); 
(async() =>{
    try{
        const login = await API.fetchHiddenParam()
        const a = await API.login()
        const user = await API.getStudentInfo()


        console.log(user)
       const c = await API.getSchedule(null)
        console.log(c)
    
    }catch(err){
        console.log(err)
    }
})();
