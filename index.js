/** Express Framework to create Routing & API*/
var express = require("express")
    /**  Body Parser to accept & parse Payload **/
var bodyparser = require("body-parser")



var sha512 = require("js-sha512")
var path = require('path');
const request = require("request");
var port = 5000;
/** For Creating Express App middleware */
const app = express()
app.use(express.static(__dirname + '/public'));
/** For Parsing application/JSON */
app.use(bodyparser.json())


/** Create Authorization */
var createAuthRequest = function() {
    var accountId = "360484792791582230"
    var apiSettingId = "359804420193596758"
    var apiKey = "YKrKZDCl+fu0gqH8k3B6pexzGfQw97p2"
    var date = Date.now()
    auth = accountId + ":" + apiSettingId + ":" + date + apiKey
        /** Encode Auth Token */
    authToken = sha512(auth);
    /** Generate Auth Token */
    authReq = accountId + ":" + apiSettingId + ":" + date + ":" + authToken
    return authReq
}

app.post("/getChatData", function(req, res) {
    /** Create Auth Token */
    authReq = createAuthRequest()
    console.log(req.body.reportID)
    var reportID = req.body.reportID
    console.log(reportID)
        /** Create URL */
    url = 'https://api.boldchat.com/aid/360484792791582230/data/rest/json/v1/getReport?auth=' + authReq + "&ReportID=" + reportID
        //2392542153370937189 - chatType
        //2499533127729437248 - Mobility
        //
    console.log(url)
    request(url, function(error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

        console.log('body:', body); // Print the HTML for the Google homepage.
        body = JSON.parse(body)
        if (response.statusCode == 200) {

            sumReport = []
            if (body.Data && body.Data.Summary)
                sumReport = body.Data.Summary
            console.log(body.Data && body.Data.ColumnHeaders && body.Data.ColumnHeaders[0].Title == "Mobility")
            sumValue = 0
            if (body.Data && body.Data.ColumnHeaders && body.Data.ColumnHeaders[0].Title == "Mobility") {
                /*Total Click SubDivision*/
                desktopValue = 0
                mobileValue = 0
                console.log(body.Data.Data.length)
                if (body.Data && body.Data.Data.length > 0)
                    for (i = 0; i < body.Data.Data.length; i++) {
                        console.log(body.Data.Data[i][0].Value)
                        if (body.Data.Data[i][0].Value == "Desktop/Laptop")
                            desktopValue = body.Data.Data[i][1].Value
                        if (body.Data.Data[i][0].Value == "Mobile")
                            mobileValue = body.Data.Data[i][1].Value
                    }
                sendRes = { "data": [desktopValue, mobileValue] }
                    /*for (i = 2; i < 6 && sumReport.length > 0; i++) {
                        sumValue += parseInt(sumReport[i].Value)
                    }*/
            } else {
                sumValue += parseInt(sumReport[1].Value)
                sendRes = { "data": sumValue }
            }
            if (body.Status == "error") {
                res.status(400)
                res.send({ "data": "Error in Getting data", "message": body.Message })
            } else {
                res.status(200)
                res.send({ sendRes })
            }
        }
    });

})


app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))

})

app.listen(port, function() {
    console.log("App is listening in port" + port)
})