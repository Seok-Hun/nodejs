const f = require("session-file-store");
var db = require("./db")
var qs = require('querystring')

function dateOfEightDigit() {
    var today = new Date();
    var nowdate = String(today.getFullYear());
    var month;
    var day;
    if (today.getMonth < 9)
        month = "0" + String(today.getMonth() + 1);
    else
        month = String(today.getMonth() + 1);

    if (today.getDate < 10)
        day = "0" + String(today.getDate());
    else
        day = String(today.getDate());

    return nowdate + month + day;
}

module.exports = {
    home: function (request, response) {
        db.query(`SELECT count(*) as total FROM book`, function (err, nums) {
            if (err) throw err
            var numPerPage = 4;
            var pageNum = request.params.peNum;
            var offs = (pageNum - 1) * numPerPage;
            var totalPages = Math.ceil(nums[0].total / numPerPage)
            db.query(`SELECT * FROM book ORDER BY id desc LIMIT ? OFFSET ?`, [numPerPage, offs], function (error, result) {
                if (error) {
                    throw error
                }
                var context = {
                    doc: './book/book.ejs',
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    booklist: result,
                    kind: 'Book',
                    pageNum: pageNum,
                    totalpages: totalPages
                }
                request.app.render('index', context, function (err, html) {
                    response.end(html)
                })
            })
        })
    },
    bestbook: function (request, response) {
        db.query(`SELECT * FROM book B join (SELECT*
        FROM(
            SELECT bookid, count(bookid) as numOfSeller
            FROM purchase
            group by bookid
            order by count(bookid) desc) A LIMIT 3)
            S on B.id = S.bookid`, (function (error, result) {
            if (error) {
                throw error
            }
            var context = {
                doc: './book/book.ejs',
                logined: request.session.is_logined,
                id: request.session.login_id,
                booklist: result,
                kind: 'Best Seller'
            }
            request.app.render('index', context, function (err, html) {
                response.end(html)
            })
        })
        )
    },
    monthbook: function (request, response) {
        db.query(`SELECT * FROM book B join (SELECT * FROM (
            SELECT bookid, count(bookid) as numOfSeller
            FROM purchase
            WHERE left(purchasedate,6) = ?
            group by bookid
            order by count(bookid) desc) A LIMIT 3)
            S on B.id = S.bookid`, [dateOfEightDigit().substring(0, 6)], function (error, result) {
            if (error) {
                throw error
            }
            var context = {
                doc: './book/book.ejs',
                logined: request.session.is_logined,
                id: request.session.login_id,
                booklist: result,
                kind: '이달의 책'
            }
            request.app.render('index', context, function (err, html) {
                if (err) {
                    throw err
                }
                response.end(html)
            })
        })
    },
    searchbook: function (request, response) {
        var context = {
            doc: './search.ejs',
            logined: request.session.is_logined,
            id: request.session.login_id,
            kind: 'Book 검색',
            link: '/book/search',
            listyn: null
        }
        request.app.render('index', context, function (err, html) {
            if (err) throw err
            response.end(html)
        })
    },
    searchbook_result: function (request, response) {
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var post = qs.parse(body)
            db.query(`SELECT * FROM book where name like ?`, [`%${post.keyword}%`], function (error, result) {
                if (error) {
                    throw error
                }
                var context = {
                    doc: './search.ejs',
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    kind: 'Book 검색',
                    listyn: 'Y',
                    link: '/book/search',
                    bs: result
                }
                request.app.render('index', context, function (err, html) {
                    if (err) throw err
                    response.end(html)
                })
            })
        })
    },
    detail: function (request, response) {
        var planId = request.params.bId
        db.query(`SELECT * FROM book where id='${planId}'`,
            function (error, result) {
                if (error) {
                    throw error;
                }
                var context = {
                    doc: `./book/bookdetail.ejs`,
                    results: result,
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    kind: 'book'
                }
                request.app.render('index', context, function (err, html) {
                    response.end(html)
                })
            }
        )
    },
    cart: function (request, response) {
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var post = qs.parse(body)
            if (post.qty != '') {
                db.query(`INSERT INTO cart (custid,bookid,cartdate,qty) VALUES(?,?,?,?)`,
                    [post.custid, post.bookid, dateOfEightDigit(), post.qty], function (error, result) {
                        if (error) {
                            throw error
                        }
                        response.writeHead(302, { Location: `/${request.session.login_id}/cart` })
                        response.end()
                    })
            }
            else{
                response.writeHead(302,{'Content-Type': 'text/html; charset=utf-8'})
                response.write('<script>alert("수량을 입력하시오.")</script>')
                response.write(`<script>window.location='/book_detail/${post.bookid}'</script>`)
                response.end()
            }
        })
    },
    cart_page: function (request, response) {
        db.query(`SELECT * FROM cart WHERE custid=?`,
            [request.session.login_id], function (error, result) {
                db.query(`SELECT * FROM book`, function (error, bookdata) {
                    var booklist = []
                    result.map((dataR) => {
                        bookdata.map((dataB) => {
                            if (dataB.id === dataR.bookid) {
                                booklist.push(dataB)
                            }
                        })
                    })
                    var context = {
                        doc: './cart.ejs',
                        logined: request.session.is_logined,
                        id: request.session.login_id,
                        booklist: booklist,
                        results: result
                    }
                    request.app.render('index', context, function (err, html) {
                        response.end(html)
                    })
                })
            })
    },
    cart_delete: function (request, response) {
        var cartId = request.params.cId
        db.query('DELETE FROM cart WHERE cartid=?', [cartId], function (error, result) {
            if (error) {
                throw error
            }
            response.writeHead(302, { Location: `/${request.session.login_id}/cart` })
            response.end()
        })
    },
    purchase: function (request, response) {
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var json = qs.decode(body)
            var post = JSON.parse(json.cartdata)
            post.map((data) => {
                db.query(`SELECT * FROM book WHERE id=?`, [data.bookid], function (error, result) {
                    db.query(`INSERT INTO purchase (custid,bookid,purchasedate,price,point,qty) VALUES(?,?,?,?,?,?)`,
                        [data.custid, data.bookid, dateOfEightDigit(), result[0].price, result[0].price * 0.1, data.qty], function (error, result) {
                            if (error) {
                                throw error
                            }
                        })
                })
            })
            response.writeHead(302, { Location: `/${request.session.login_id}/purchase` })
            response.end()
        })
    },
    purchase_from_detail: function (request, response) {
        var body = ''
        request.on('data', function (data) {
            body = body + data
        })
        request.on('end', function () {
            var post = qs.parse(body)
            if (post.qty != '') {
                db.query(`SELECT * FROM book WHERE id=?`, [post.bookid], function (error, result) {
                    db.query(`INSERT INTO purchase (custid,bookid,purchasedate,price,point,qty) VALUES(?,?,?,?,?,?)`,
                        [post.custid, post.bookid, dateOfEightDigit(), result[0].price, result[0].price * 0.1, post.qty], function (error, result) {
                            if (error) throw error
                            response.writeHead(302, { Location: `/${request.session.login_id}/purchase` })
                            response.end()
                        })
                })
            }
            else{
                response.writeHead(302,{'Content-Type': 'text/html; charset=utf-8'})
                response.write('<script>alert("수량을 입력하시오.")</script>')
                response.write(`<script>window.location='/book_detail/${post.bookid}'</script>`)
                response.end()
            }
        })
    },
    purchase_page: function (request, response) {
        cId = request.params.cId
        if(cId!='admin'){
        db.query(`SELECT * FROM purchase WHERE custid=?`,
            [cId], function (error, result) {
                db.query(`SELECT * FROM book`, function (error, bookdata) {
                    var booklist = []
                    result.map((dataR) => {
                        bookdata.map((dataB) => {
                            if (dataB.id === dataR.bookid) {
                                booklist.push(dataB)
                            }
                        })
                    })
                    context = {
                        doc: './purchase.ejs',
                        logined: request.session.is_logined,
                        id: request.session.login_id,
                        results: result,
                        booklist: booklist
                    }
                    request.app.render('index', context, function (err, html) {
                        response.end(html)
                    })
                })
            })
        }else{
            db.query(`SELECT * FROM purchase`,
            function (error, result) {
                db.query(`SELECT * FROM book`, function (error, bookdata) {
                    var booklist = []
                    result.map((dataR) => {
                        bookdata.map((dataB) => {
                            if (dataB.id === dataR.bookid) {
                                booklist.push(dataB)
                            }
                        })
                    })
                    context = {
                        doc: './purchase.ejs',
                        logined: request.session.is_logined,
                        id: request.session.login_id,
                        results: result,
                        booklist: booklist
                    }
                    request.app.render('index', context, function (err, html) {
                        response.end(html)
                    })
                })
            })
        }
    },
    purchase_delete: function (request, response) {
        var purId = request.params.pId
        db.query('DELETE FROM purchase WHERE purchaseid=?', [purId], function (error, result) {
            if (error) {
                throw error
            }
            response.writeHead(302, { Location: `/${request.session.login_id}/purchase` })
            response.end()
        })
    },
    bookCreate: function (request, response) {
        var context = {
            doc: './book/bookCreate.ejs',
            kindOfDoc: 'C',
            name: '',
            publisher: '',
            author: '',
            stock: null,
            pubdate: '',
            pagenum: null,
            ISBN: '',
            ebook: '',
            kdc: '',
            price: null,
            img: null,
            nation: '',
            description: '',
            logined: request.session.is_logined,
            id: request.session.login_id
        }
        request.app.render('index', context, function (err, html) {
            response.end(html)
        })
    },
    bookCreate_process: function (request, response) {
        const img = request.file.originalname
        const cal = request.body
        db.query(
            `INSERT INTO book (name, publisher, author, stock, pubdate, pagenum, ISBN, ebook, kdc, img, price, nation, description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [cal.name, cal.publisher, cal.author, cal.stock, cal.pubdate, cal.pagenum, cal.ISBN, cal.ebook, cal.kdc, img, cal.price, cal.nation, cal.description], function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/book/list` })
                response.end()
            }
        )
    },
    bookList: function (request, response) {
        db.query(`SELECT * FROM book`,
            function (error, result) {
                if (error) {
                    throw error
                }
                var context = {
                    doc: `./book/bookList.ejs`,
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                    results: result
                }
                request.app.render('index', context, function (err, html) {
                    response.end(html)
                })
            })
    },
    bookUpdate: function (request, response) {
        var planId = request.params.bId
        db.query(`SELECT * FROM book where id=${planId}`,
            function (error, result) {
                if (error) {
                    throw error;
                }
                var context = {
                    doc: `./book/bookCreate.ejs`,
                    name: result[0].name,
                    publisher: result[0].publisher,
                    author: result[0].author,
                    stock: result[0].stock,
                    pubdate: result[0].pubdate,
                    pagenum: result[0].pagenum,
                    ISBN: result[0].ISBN,
                    ebook: result[0].ebook,
                    kdc: result[0].kdc,
                    price: result[0].price,
                    img: result[0].img,
                    nation: result[0].nation,
                    description: result[0].description,
                    pId: planId,
                    kindOfDoc: 'U',
                    logined: request.session.is_logined,
                    id: request.session.login_id,
                }
                request.app.render('index', context, function (err, html) {
                    response.end(html)
                })
            }
        )
    },
    bookUpdate_process: function (request, response) {
        var img
        if (request.file) { img = request.file.originalname }
        const cal = request.body
        var planId = request.params.bId
        if (img === undefined) {
            db.query('UPDATE book SET name=?,publisher=?,author=?, stock=?, pubdate=?,pagenum=?,ISBN=?,ebook=?,kdc=?,price=?,nation=?,description=? WHERE id=?',
                [cal.name, cal.publisher, cal.author, Number(cal.stock), cal.pubdate, Number(cal.pagenum), cal.ISBN, cal.ebook, cal.kdc, Number(cal.price), cal.nation, cal.description, planId], function (error, result) {
                    console.error(error)
                    response.writeHead(302, { Location: `/book/list` })
                    response.end();
                })
        }
        else {
            db.query('UPDATE book SET name=?,publisher=?,author=?, stock=?, pubdate=?,pagenum=?,ISBN=?,ebook=?,kdc=?,img=?,price=?,nation=?,description=? WHERE id=?',
                [cal.name, cal.publisher, cal.author, Number(cal.stock), cal.pubdate, Number(cal.pagenum), cal.ISBN, cal.ebook, cal.kdc, img, Number(cal.price), cal.nation, cal.description, planId], function (error, result) {
                    console.error(error)
                    response.writeHead(302, { Location: `/book/list` })
                    response.end();
                })
        }
    },
    bookDelete_process: function (request, response) {
        var planId = request.params.bId
        db.query('DELETE FROM book WHERE id=?', [planId], function (error, result) {
            if (error) {
                throw error
            }
            response.writeHead(302, { Location: `/book/list` })
            response.end()
        })
    }
}