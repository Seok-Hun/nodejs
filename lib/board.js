var db = require('./db');
var qs = require('querystring');

function authIsOwner(request, response) {
    if (request.session.is_logined) {
        return true;
    } else {
        return false;
    }
}

function dateOfEightDigit() {
    var today = new Date();
    var nowdate = String(today.getFullYear());
    var month;
    var day;
    if (today.getMonth() < 9)
        month = "0" + String(today.getMonth() + 1);
    else
        month = String(today.getMonth() + 1);
    if (today.getDate() < 10)
        day = "0" + String(today.getDate());
    else
        day = String(today.getDate());

    return nowdate + month + day;
}

module.exports = {
    list: function (request, response) {
    //게시글 목록
        db.query(`SELECT count(*) as total FROM board`, function (error, nums) {
        //board 테이블의 총 행 개수를 total로 저장
            if (error) throw error
            var numPerPage = 5;
            //numPerPage : 한 페이지에 나타낼 컨텐츠 수
            var pageNum = request.params.pNum
            //pageNum : url에서 pNum 패머리터(현재 페이지)를 가져와 저장
            var offs = (pageNum - 1) * numPerPage;
            //offs : 게시판의 페이지 번호에 따라 보여줄 컨텐츠를 구분하는 용도
            var totalPages = Math.ceil(nums[0].total / numPerPage);
            //totalPages : board의 전체 행을 한 페이지에 나타낼 컨텐츠 수로 나눔(Math.ceil : 소수점 아래 올림)

            db.query(`SELECT * FROM board ORDER BY date desc, id LIMIT ? OFFSET ?`, [numPerPage, offs], function (error, boards) {
                // board 테이블의 행을 날짜 역순으로 정렬
                // 정렬순으로 offs번째 행부터 numPerPage만큼의 행만 가져옴
                if (error) throw error
                //sql 에러 처리
                var context = {
                    doc: `./board/boardlist.ejs`,
                    //브라우저에 boardlist.ejs를 보여줌
                    cls: request.session.class,
                    //로그인한 유저의 직급
                    logined: authIsOwner(request, response),
                    //로그인 여부
                    id: request.session.login_id,
                    //로그인한 유저의 id
                    kind: '게시판',
                    //현재 창 종류
                    board: boards,
                    //sql을 수행해 추출한 데이터
                    pageNum: pageNum,
                    //현재 페이지
                    totalpages: totalPages
                    //전체 페이지
                };
                request.app.render('index', context, function (err, html) {
                //브라우저 창에 index.ejs 렌더링
                //context 포함
                    response.end(html);
                    //response 전송 종료
                })
            });
        })
    },
    view: function (request, response) {
    //선택한 게시글 상세 내용
        var bNum = request.params.bNum;
        //url에서 패러미터로 선택한 게시글의 id 가져오기
        //mySql에서 게시글을 구분하는 역할
        var pNum = request.params.pNum;
        //url에서 패러미터로 선택한 게시글이 있던 게시글 페이지 번호 가져오기
        //해당 게시물을 수정하거나 삭제할 경우 이동할 페이지 지정에 사용
        db.query(`SELECT *  FROM board WHERE id = ? `, [bNum], function (error, board) {
            //board 테이블에서 패러미터로 가져온 id에 해당하는 게시글 내용 가져오기    
            if (error) throw error;
            var context = {
                doc: `./board/boardview.ejs`,
                cls: request.session.class,
                logined: authIsOwner(request, response),
                id: request.session.login_id,
                kind: '게시물 내용',
                pageNum: pNum,
                board: board
            };
            request.app.render('index', context, function (err, html) {
                response.end(html);
            })

        })
    },
    create: function (request, response) {
    //게시글 작성
        db.query(`SELECT *  FROM person WHERE loginid = ? `, [request.session.login_id], function (error, person) {
        //현재 로그인한 유저 정보 가져오기
            if (error) throw error;
            var context = {
                doc: `./board/boardcreate.ejs`,
                //브라우저에 boardcreate.ejs 보여줌
                cls: request.session.class,
                //로그인한 유저의 class
                logined: authIsOwner(request, response),
                //로그인 여부
                id: request.session.login_id,
                //로그인한 유저의 id
                title: '',
                content: '',
                boardid: '',
                name: person[0].name,
                //로그인한 유저의 이름 전달
                pNum: '',
                kind: 'C'
                //C를 전달해 게시글 생성임을 알림
            };
            request.app.render('index', context, function (err, html) {
                response.end(html);
            });
        });
    },
    create_process: function (request, response) {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query(`
                INSERT INTO board (loginid, name, date, content,title,password) VALUES(?, ?, ?, ?, ?,?)`,
                [post.id, post.nmh, dateOfEightDigit(), post.content, post.title,post.pwd], function (error, result) {
                //date에 현재 시간(8자리) 저장    
                    if (error) {
                        throw error;
                    }
                    response.writeHead(302, { Location: `/board/list/1` });
                    response.end();
                }
            );
        });
    },
    update: function (request, response) {
        var bNum = request.params.bNum;
        //url에서 패러미터로 선택한 게시글의 id 가져오기
        //mySql에서 게시글을 구분하는 역할
        var pNum = request.params.pNum;
        //url에서 패러미터로 선택한 게시글이 있던 게시글 페이지 번호 가져오기
        //게시글 수정 후 해당 게시글이 있던 페이지로 이동하기 위한 용도
        db.query(`SELECT *  FROM person WHERE loginid = ? `, [request.session.login_id], function (error, person) {
            db.query(`SELECT * FROM board WHERE id= ?`, [bNum], function (error, board) {
                if (error) {
                    throw error;
                }
                var context = {
                    doc: `./board/boardcreate.ejs`,
                    cls: request.session.class,
                    logined: authIsOwner(request, response),
                    id: request.session.login_id,
                    title: board[0].title,
                    content: board[0].content,
                    boardid: bNum,
                    name: person[0].name,
                    pNum: pNum,
                    kind: 'U'
                };
                request.app.render('index', context, function (err, html) {
                    response.end(html);
                });
            });
        });
    },
    update_process: function (request, response) {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            db.query('SELECT * FROM board WHERE id=?',[post.boardid],function(error,result){
                if(post.pwd===result[0].password || request.session.login_id==='admin'){
                    db.query('UPDATE board SET title=?, content=?, date=? WHERE id=?',
                        [post.title, post.content, dateOfEightDigit(), post.boardid], function (error, result) {
                            response.writeHead(302, { Location: `/board/view/${post.boardid}/${post.pNum}` });
                            response.end();
                        });
                }
                else{
                    //글을 작성했을 때 작성했던 비밀번호가 다르면 수정 불가(관리자는 해당 안됨)
                    //알람이 뜬 다음 다시 수정 창으로 돌아옴
                    response.writeHead(302,{'Content-Type': 'text/html; charset=utf-8'})
                    response.write('<script>alert("비밀번호가 올바르지 않습니다.")</script>')
                    response.write(`<script>window.location='/board/update/${post.boardid}/${post.pNum}'</script>`)
                    response.end()
                }
            })
        });
    },
    delete: function (request, response) {
        var bNum = request.params.bNum;
        //url에서 패러미터로 선택한 게시글의 id 가져오기
        //mySql에서 게시글을 구분하는 역할
        var pNum = request.params.pNum;
        //url에서 패러미터로 선택한 게시글이 있던 게시글 페이지 번호 가져오기
        //게시글 삭제 후 해당 게시글이 있던 페이지로 이동하기 위한 용도
        db.query('DELETE FROM board WHERE id = ?', [bNum], function (error, result) {
            if (error) {
                throw error;
            }
            response.writeHead(302, { Location: `/board/list/${pNum}` });
            response.end();
        });
    }
}
