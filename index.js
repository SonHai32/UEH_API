let axios = require("axios").default;
const cheerio = require("cheerio");
const tough = require("tough-cookie");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const API_SERVER = "http://online.ueh.edu.vn/";

class UEH_API {
  constructor() {
    this.jar = new tough.CookieJar();
    this.__VIEWSTATEGENERATOR = ''
    this.__EVENTVALIDATION = ''
    this.__VIEWSTATE = ''
    this.request = axios.create({
      headers: {
        "accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "upgrade-insecure-requests": "1",
        "connection": "keep-alive",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
      },
      jar: this.jar,
      withCredentials: true,
    });

    axiosCookieJarSupport(this.request);
    this.request.defaults.jar = this.jar;
  }

  requestServer = (formData = "") => {
    return this.request(API_SERVER, {
      method: typeof formData !== "" ? "POST" : "GET",
      data: formData,
      jar: this.jar,
      withCredentials: true,
    });
  };

  JSONtoUrlEncode = (data) => {
    let str = [];
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
    }
    return str.join("&");
  };


  setHidenParam = (pageBody) =>{
    const $ = cheerio.load(pageBody)
    this.__VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
    this.__EVENTVALIDATION = $("#__EVENTVALIDATION").val();
    this.__VIEWSTATE = $("#__VIEWSTATE").val();
  }
  getHiddenParam = () =>{
    return {
      __VIEWSTATE: this.__VIEWSTATE,
      __EVENTVALIDATION: this.__EVENTVALIDATION,
      __VIEWSTATEGENERATOR: this.__VIEWSTATEGENERATOR
    }
  }

  fetchHiddenParam = () => {
    return new Promise((reslove, reject) => {
      this.requestServer()
        .then( (res) => {
          this.setHidenParam(res.data)

          this.requestServer(this.JSONtoUrlEncode({
            __EVENTTARGET: "ctl00$lbtDangnhap",
            __EVENTARGUMENT: "",
            __LASTFOCUS: "",
            __EVENTVALIDATION: this.__EVENTVALIDATION,
            __VIEWSTATE: this.__VIEWSTATE,
            __VIEWSTATEGENERATOR: this.__VIEWSTATEGENERATOR,
            "ctl00$ContentPlaceHolder1$ctl00$ctl00$ctl00$ctl00$txtSearch": ""
          })).then(res_2 =>{
            this.setHidenParam(res_2.data)
            reslove(this.getHiddenParam())
          })

        })
        .catch((err) => reject(err));
    });
  };
  login = ({userID, userPassword }) => {
    return new Promise((reslove, reject) => {
      return this.requestServer(
        this.JSONtoUrlEncode({
          __EVENTTARGET: "",
          __EVENTARGUMENT: "",
          __EVENTVALIDATION: this.__EVENTVALIDATION,
          __VIEWSTATE: this.__VIEWSTATE,
          __VIEWSTATEGENERATOR: this.__VIEWSTATEGENERATOR,
          ctl00$ContentPlaceHolder1$ctl00$ctl00$Role: "rbtnStudent",
          ctl00$ContentPlaceHolder1$ctl00$ctl00$txtUserName: userID,
          ctl00$ContentPlaceHolder1$ctl00$ctl00$txtPassword: userPassword,
          ctl00$ContentPlaceHolder1$ctl00$ctl00$btLogin: "Đăng nhập",
        })
      )
        .then((res) => {
          const $ = cheerio.load(res.data);
          this.setHidenParam(res.data)
          if($("#lbtDangnhap").text().toString() === "Đăng Thoát"){
            reslove("LOGIN OK")
          }
          else{
            reject("LOGIN FAIL")
          }
        })
        .catch((err) => reject(err));
    });
  };

  getStudentInfo() {
    return new Promise(async (reslove, reject) => {
      this.requestServer(this.JSONtoUrlEncode({
        __EVENTTARGET: "ctl00$ContentPlaceHolder1$ctl00$ctl00$lnkInfo",
        __EVENTARGUMENT: "",
        __VIEWSTATE: this.__VIEWSTATE,
        __VIEWSTATEGENERATOR: this.__VIEWSTATEGENERATOR,
        __EVENTVALIDATION: this.__EVENTVALIDATION,
      }))
        .then((res) => {
          const $ = cheerio.load(res.data);
          let user = {
            id: $("#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbMaso").text(),
            name: $("#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbHoVaTen").text(),
            birthDate: $(
              "#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbNgaysinh"
            ).text(),
            place: $("#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbNoiSinh").text(),
            gender: $(
              "#ContentPlaceHolder1_ctl00_ctl00_ctl00_blGioiTinh"
            ).text(),
            email: $(
              "#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbEmailInfor"
            ).text(),
            emailUEH: $(
              "#ContentPlaceHolder1_ctl00_ctl00_ctl00_lbEmailInfo2"
            ).text(),
            avatar:
              API_SERVER +
              "/" +
              $("#ContentPlaceHolder1_ctl00_ctl00_ctl00_imgStudents").attr(
                "src"
              ),
          };

          reslove(user);
        })
        .catch((err) => reject(err));
    });
  }

  getSchedule(){
    return new Promise(async (reslove, reject) =>{
      this.requestServer(this.JSONtoUrlEncode({
        __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ctl00$ctl00$lnkThoiKhoaBieu', 
        __EVENTARGUMENT: '',
        __VIEWSTATE: this.__VIEWSTATE,
        __VIEWSTATEGENERATOR: this.__VIEWSTATEGENERATOR,
        __EVENTVALIDATION: this.__EVENTVALIDATION,
      
      })).then(res =>{
         
        let listSchedule = [];
        
        const $ = cheerio.load(res.data)
        
        let scheduleTable = $('#ContentPlaceHolder1_ctl00_ctl00_ctl00_grvThoikhoabieu').children('tbody').children()
        
        scheduleTable.map(function(){
          const columns = $(this).children();

          listSchedule.push({
            weekIndex: $(columns[0]).find('span').text(),
            subjectName: $(columns[1]).find('span').text(),
            room: $(columns[2]).find('span').text(),
            startAt: $(columns[3]).find('span').text(),
            endAt: $(columns[4]).find('span').text(),
            date: $(columns[5]).find('span').text(),
            note: $(columns[6]).find('span').text(),
          })
        })
        reslove(listSchedule)
      }).catch(err => reject(err))
      })
      }

  getAllData({userID, userPassword}){
    return new Promise(async (reslove, reject) =>{

      try {
        const fetch = await this.fetchHiddenParam()   
        const login = await this.login({
          userID,
          userPassword,
        })
        const userInfo = await this.getStudentInfo()
        const schedule = await this.getSchedule()

        reslove({
          userInfo,
          schedule
        })

      } catch (err) {
        /* handle error */
        reject(err)
      }
    })
    
  }
}


