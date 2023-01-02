var db = require('./db')
var qs = require('querystring')

module.exports={
    userHome : function(request,response){
        db.query(`SELECT * FROM person`,
            function(error, result){
                if(error){
                    throw error
                }
                var context={
                    doc:'./user/user.ejs',
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
    userCreate: function(request,response){
        var context = {
            doc:'./user/userCreate.ejs',
            loginid:'',
            password:'',
            name:'',
            address:'',
            tel:'',
            birth:'',
            Class:'',
            grade:'',
            kindOfDoc:'C',
            logined:request.session.is_logined,
            id:request.session.login_id,
        }
        request.app.render('index',context,function(err,html){
            response.end(html)
        })
    },
    userCreate_process:function(request,response){
        var body='';
        request.on('data',function(data){
            body=body+data;
        })
        request.on('end',function(){
            var cal = qs.parse(body)
            db.query(
                `INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES(?,?,?,?,?,?,?,?)`,
                [cal.loginid, cal.password, cal.name, cal.address, cal.tel, cal.birth, cal.class, cal.grade], function(error,result){
                    if(error){
                        throw error;
                    }
                    response.writeHead(302,{Location: `/user`})
                    response.end()
                }
            )
        })
    },
    userList:function(request,response){
        db.query(`SELECT * FROM person`,
            function(error, result){
                if(error){
                    throw error
                }
                tmplogin = 'Y'
                var context = {
                    doc:`./user/userList.ejs`,
                    logined:request.session.is_logined,
                    id:request.session.login_id,
                    results:result
                }
                request.app.render('index',context,function(err,html){
                    response.end(html)
                })
        })
    },
    userUpdate : function(request,response){
        var planId = request.params.planId

        db.query(`SELECT * FROM person where loginid='${planId}'`,
            function(error,result){
                if(error){
                    throw error;
                }
                var context = {
                    doc:`./user/userCreate.ejs`,
                    password:result[0].password,
                    name:result[0].name,
                    address:result[0].address,
                    tel:result[0].tel,
                    birth:result[0].birth,
                    Class:result[0].class,
                    grade:result[0].grade,
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
    userUpdate_process:function(request,response){
        var body=''
        request.on('data',function(data){
            body=body+data
        })
        request.on('end',function(){
            var cal = qs.parse(body)
            var planId = request.params.planId
            db.query('UPDATE person SET password=?, name=?, address=?, tel=?, birth=?, class=?, grade=? WHERE loginid=?',
            [cal.password, cal.name, cal.address, cal.tel, cal.birth, cal.class, cal.grade, planId],function(error,result){
                response.writeHead(302,{Location:`/user`})
                response.end();
            })
        })
    },
    userDelete_process:function(request,response){
        var planId=request.params.planId
        db.query('DELETE FROM person WHERE loginid=?',[planId],function(error,result){
            if(error){
                throw error
            }
            response.writeHead(302,{Location:`/user/list`})
            response.end()
        })
    }
}