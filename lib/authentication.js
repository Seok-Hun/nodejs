var db = require('./db')
var qs = require('querystring')

function authIsOwner(request,response){
    if(request.session.is_logined){
        return true;
    }
    else{
        return false;
    }
}

module.exports = {
    login : function(request, response){
        var subdoc;
        if(authIsOwner(request,response)===true) subdoc='./book/book.ejs'
        else subdoc='./login.ejs'

        var context = {
            doc:subdoc,
            logined:authIsOwner(request,response),
            id:request.session.login_id,
            cls:request.session.class
        }
        request.app.render('index',context,function(err,html){
            response.end(html)
        })
    },
    login_process:function(request,response){
        var body='';
        request.on('data',function(data){
            body=body+data
        })
        request.on('end',function(){
            var post = qs.parse(body);
            db.query(`SELECT loginid, password, class FROM person WHERE loginid = ? and password = ?`,
            [post.id, post.pw],function(error,result){
                if(error){
                    throw error;
                }
                if(result[0]===undefined){
                response.writeHead(302,{'Content-Type': 'text/html; charset=utf-8'})
                response.write('<script>alert("로그인 정보가 틀립니다.")</script>')
                response.write(`<script>window.location='/login'</script>`)
                response.end()
            }
                else{
                    request.session.is_logined = true;
                    request.session.login_id=result[0].loginid;
                    request.session.class=result[0].class;
                    response.redirect('/')
                }
            })
        })
    },
    logout : function(request,response){
        
        request.session.destroy(function(err){
            console.error(err)
            response.redirect('/')
        })
    },
    register : function(request,response){
        var context={
            doc:'./register.ejs',
            loginid:'',
            password:'',
            name:'',
            address:'',
            tel:'',
            birth:'',
            Class:'B',
            grade:'B',
            logined:authIsOwner(request,response),
            id:request.session.login_id
        }
        request.app.render('index',context,function(e,html){
            response.end(html)
        })
    },
    register_process:function(request,response){
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
                    response.writeHead(302,{Location: `/`})
                    response.end()
                }
            )
        })
    },
    changepw:function(request,response){
        db.query(`SELECT * FROM person WHERE loginid='${request.session.login_id}'`,
        function(error, result){
            if(error){
                throw error
            }
            var context = {
                doc:`./changepw.ejs`,
                logined:request.session.is_logined,
                id:request.session.login_id,
                results:result
            }
            request.app.render('index',context,function(err,html){
                response.end(html)
            })
    })
    },
    changepw_process:function(request,response){
        var body=''
        request.on('data',function(data){
            body=body+data
        })
        request.on('end',function(){
            var cal = qs.parse(body)
            var planId = request.session.login_id
            db.query('UPDATE person SET password=? WHERE loginid=?',
            [cal.pwd, planId],function(error,result){
                response.writeHead(302,{Location:`/`})
                response.end();
            })
        })
    }
}