var db = require('./db')
var qs = require('querystring')

module.exports={
    namecardHome : function(request,response){
        db.query(`SELECT * FROM namecard`,
            function(error, result){
                if(error){
                    throw error
                }
                var context={
                    doc:'./namecard/namecard.ejs',
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
    searchnamecard:function(request,response){
        var context = {
            doc: './search.ejs',
            logined: request.session.is_logined,
            id: request.session.login_id,
            kind: 'Namecard 검색',
            link:'/namecard/search',
            listyn: null
        }
        request.app.render('index', context, function (err, html) {
            if (err) throw err
            response.end(html)
        })
    },
    searchnamecard_result:function(request,response){
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var post = qs.parse(body)
            db.query(`SELECT * FROM namecard where title like ?`, [`%${post.keyword}%`], function (error, result) {
                if (error) {
                    throw error
                }
                var context={
                    doc: './search.ejs',
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    kind:'Namecard 검색',
                    listyn:'Y',
                    link:'/namecard/search',
                    bs:result
                }
                request.app.render('index', context, function (err, html) {
                    if (err) throw err
                    response.end(html)
                })
            })
        })
    },
    namecardCreate: function(request,response){
        var context = {
            doc:'./namecard/namecardCreate.ejs',
            title:'',
            description:'',
            kindOfDoc:'C',
            logined:request.session.is_logined,
            id:request.session.login_id,
        }
        request.app.render('index',context,function(err,html){
            response.end(html)
        })
    },
    namecardCreate_process:function(request,response){
        
        var body='';
        request.on('data',function(data){
            body=body+data;
        })
        request.on('end',function(){
            var cal = qs.parse(body)
            db.query(
                `INSERT INTO namecard (title, description, created, author_id) VALUES(?,?,NOW(),2)`,
                [cal.title, cal.description], function(error,result){
                    if(error){
                        throw error;
                    }
                    response.writeHead(302,{Location: `/namecard`})
                    response.end()
                }
            )
        })
    },
    namecardList:function(request,response){
        db.query(`SELECT * FROM namecard`,
            function(error, result){
                if(error){
                    throw error
                }
                var context = {
                    doc:`./namecard/namecardList.ejs`,
                    logined:request.session.is_logined,
                    id:request.session.login_id,
                    results:result
                }
                request.app.render('index',context,function(err,html){
                    response.end(html)
                })
        })
    },
    namecardUpdate : function(request,response){
        var planId = request.params.planId

        db.query(`SELECT * FROM namecard where id=${planId}`,
            function(error,result){
                if(error){
                    throw error;
                }
                var context = {
                    doc:`./namecard/namecardCreate.ejs`,
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
    namecardUpdate_process:function(request,response){
        var body=''
        request.on('data',function(data){
            body=body+data
        })
        request.on('end',function(){
            var plan = qs.parse(body)
            var planId = request.params.planId
            db.query('UPDATE namecard SET title=?,description=?,author_id=? WHERE id=?',
            [plan.title, plan.description, 2, planId],function(error,result){
                response.writeHead(302,{Location:`/namecard`})
                response.end();
            })
        })
    },
    namecardDelete_process:function(request,response){
        var planId=request.params.planId
        db.query('DELETE FROM namecard WHERE id=?',[planId],function(error,result){
            if(error){
                throw error
            }
            response.writeHead(302,{Location:`/namecard/list`})
            response.end()
        })
    }
}