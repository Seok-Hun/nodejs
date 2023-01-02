var db = require('./db')
var qs = require('querystring')

module.exports={
    calendarHome : function(request,response){
        db.query(`SELECT * FROM calendar`,
            function(error, result){
                if(error){
                    throw error
                }
                var tmplogin=true
                var context={
                    doc:'./calendar/calendar.ejs',
                    logined:request.session.is_logined,
                    id:request.session.login_id,
                    results:result
                }
                request.app.render('index',context,function(err,html){
                    response.end(html)
                })
            }
        )
    },
    searchcalendar:function(request,response){
        var context = {
            doc: './search.ejs',
            logined: request.session.is_logined,
            id: request.session.login_id,
            kind: 'Calendar 검색',
            link:'/calendar/search',
            listyn: null
        }
        request.app.render('index', context, function (err, html) {
            if (err) throw err
            response.end(html)
        })
    },
    searchcalendar_result:function(request,response){
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var post = qs.parse(body)
            db.query(`SELECT * FROM calendar where title like ?`, [`%${post.keyword}%`], function (error, result) {
                if (error) {
                    throw error
                }
                var context={
                    doc: './search.ejs',
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    kind:'Calendar 검색',
                    listyn:'Y',
                    link:'/calendar/search',
                    bs:result
                }
                request.app.render('index', context, function (err, html) {
                    if (err) throw err
                    response.end(html)
                })
            })
        })
    },
    calendarCreate: function(request,response){
        var titleofcreate='Create';
        var context = {
            doc:'./calendar/calendarCreate.ejs',
            title:'',
            description:'',
            kindOfDoc:'C',
            logined:request.session.is_logined,
            id:request.session.login_id,
            pId:''
        }
        request.app.render('index',context,function(err,html){
            response.end(html)
        })
    },
    calendarCreate_process:function(request,response){
        var body='';
        request.on('data',function(data){
            body=body+data;
        })
        request.on('end',function(){
            var cal = qs.parse(body)
            db.query(
                `INSERT INTO calendar (title, description, created, author_id) VALUES(?,?,NOW(),2)`,
                [cal.title, cal.description], function(error,result){
                    if(error){
                        throw error;
                    }
                    response.writeHead(302,{Location: `/calendar`})
                    response.end()
                }
            )
        })
    },
    calendarList:function(request,response){
        var titleofcreate = 'Create'
        db.query(`SELECT * FROM calendar`,
            function(error, result){
                if(error){
                    throw error
                }
                tmplogin = 'Y'
                var context = {
                    doc:`./calendar/calendarList.ejs`,
                    logined:request.session.is_logined,
                    id:request.session.login_id,
                    results:result
                }
                request.app.render('index',context,function(err,html){
                    response.end(html)
                })
        })
    },
    calendarUpdate : function(request,response){
        var titleofcreate = 'Update'
        var planId = request.params.planId

        db.query(`SELECT * FROM calendar where id=${planId}`,
            function(error,result){
                if(error){
                    throw error;
                }
                var context = {
                    doc:`./calendar/calendarCreate.ejs`,
                    title:result[0].title,
                    description:result[0].description,
                    pId:planId,
                    kindOfDoc:'U',
                    logined:request.session.is_logined,
                    id:request.session.login_id,
                }
                request.app.render('index',context,function(err,html){
                    response.end(html)
                })
            }
        )
    },
    calendarUpdate_process:function(request,response){
        var body=''
        request.on('data',function(data){
            body=body+data
        })
        request.on('end',function(){
            var plan = qs.parse(body)
            var planId = request.params.planId
            db.query('UPDATE calendar SET title=?,description=?,author_id=? WHERE id=?',
            [plan.title, plan.description, 2, planId],function(error,result){
                response.writeHead(302,{Location:`/calendar`})
                response.end();
            })
        })
    },
    calendarDelete_process:function(request,response){
        var planId=request.params.planId
        db.query('DELETE FROM calendar WHERE id=?',[planId],function(error,result){
            if(error){
                throw error
            }
            response.writeHead(302,{Location:`/calendar`})
            response.end()
        })
    }
}