const express = require('express')
const app = express()
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './images')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })
const fs = require('fs')
var qs = require('querystring')
var etc = require('./lib/etc')
var namecard = require('./lib/namecard')
var user = require('./lib/user')
var book = require('./lib/book')
var board = require('./lib/board')
//var book = reuqire('./lib/book')
var session = require('express-session')
var MySqlStore = require('express-mysql-session')(session)
var auth = require('./lib/authentication')

var options = {
    host: 'localhost',
    user: 'nodejs',
    password: 'nodejs',
    database: 'webdb2022'
}
var sessionStore = new MySqlStore(options)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}))

app.use(express.static('images'));

app.get('/login', function (request, response) {
    auth.login(request, response)
})
app.post('/login_process', function (request, response) {
    auth.login_process(request, response)
})
app.get('/logout', function (request, response) {
    auth.logout(request, response)
})
app.get('/register', function (request, response) {
    auth.register(request, response)
})
app.post('/register_process', function (request, response) {
    auth.register_process(request, response)
})
app.get('/changepw', function (request, response) {
    auth.changepw(request, response)
})
app.post('/changepw_process', function (request, response) {
    auth.changepw_process(request, response)
})

app.get('/',function(request,response){
    response.writeHead(302,{Location:'/1'})
    response.end()
})
app.get('/:peNum', function (request, response) {
    book.home(request, response)
})
app.post('/', function (request, response) {
    book.home(request, response)
})
app.get('/book_detail/:bId', function (request, response) {
    book.detail(request, response)
})
app.get('/book/create', function (request, response) {
    book.bookCreate(request, response)
})
app.post('/book/create_process',upload.single('img'), function (request, response) {
    book.bookCreate_process(request, response)
})
app.get('/book/list', function (request, response) {
    book.bookList(request, response)
})
app.get('/book/update/:bId', function (request, response) {
    book.bookUpdate(request, response)
})
app.post('/book/update_process/:bId',upload.single('img'), function (request, response) {
    book.bookUpdate_process(request, response)
})
app.get('/book/delete_process/:bId', function (request, response) {
    book.bookDelete_process(request, response)
})

app.get('/book/best',function(request,response){
    book.bestbook(request,response)
})
app.get('/book/month',function(request,response){
    book.monthbook(request,response)
})
app.post('/book/cart',function(request,response){
    book.cart(request,response)
})
app.get('/:cId/cart',function(request,response){
    book.cart_page(request,response)
})
app.get('/cart/delete_process/:cId',function(request,response){
    book.cart_delete(request,response)
})
app.post('/book/purchase',function(request,response){
    book.purchase(request,response)
})
app.post('/book/purchase_detail',function(request,response){
    book.purchase_from_detail(request,response)
})
app.get('/:cId/purchase',function(request,response){
    book.purchase_page(request,response)
})
app.get('/purchase/delete_process/:pId',function(request,response){
    book.purchase_delete(request,response)
})
app.get('/book/search',function(request,response){
    book.searchbook(request,response)
})
app.post('/book/search',function(request,response){
    book.searchbook_result(request,response)
})

app.get('/calendar', function (request, response) {
    etc.calendarHome(request, response)
})
app.get('/calendar/create', function (request, response) {
    etc.calendarCreate(request, response)
})
app.post('/calendar/create_process', function (request, response) {
    etc.calendarCreate_process(request, response)
})
app.get('/calendar/list', function (request, response) {
    etc.calendarList(request, response)
})
app.get('/calendar/update/:planId', function (request, response) {
    etc.calendarUpdate(request, response)
})
app.post('/calendar/update_process/:planId', function (request, response) {
    etc.calendarUpdate_process(request, response)
})
app.get('/calendar/delete_process/:planId', function (request, response) {
    etc.calendarDelete_process(request, response)
})
app.get('/calendar/search',function(request,response){
    etc.searchcalendar(request,response)
})
app.post('/calendar/search',function(request,response){
    etc.searchcalendar_result(request,response)
})

app.get('/namecard', function (request, response) {
    namecard.namecardHome(request, response)
})
app.get('/namecard/create', function (request, response) {
    namecard.namecardCreate(request, response)
})
app.post('/namecard/create_process', function (request, response) {
    namecard.namecardCreate_process(request, response)
})
app.get('/namecard/list', function (request, response) {
    namecard.namecardList(request, response)
})
app.get('/namecard/update/:planId', function (request, response) {
    namecard.namecardUpdate(request, response)
})
app.post('/namecard/update_process/:planId', function (request, response) {
    namecard.namecardUpdate_process(request, response)
})
app.get('/namecard/delete_process/:planId', function (request, response) {
    namecard.namecardDelete_process(request, response)
})
app.get('/namecard/search',function(request,response){
    namecard.searchnamecard(request,response)
})
app.post('/namecard/search',function(request,response){
    namecard.searchnamecard_result(request,response)
})

app.get('/user', function (request, response) {
    user.userHome(request, response)
})
app.get('/user/create', function (request, response) {
    user.userCreate(request, response)
})
app.post('/user/create_process', function (request, response) {
    user.userCreate_process(request, response)
})
app.get('/user/list', function (request, response) {
    user.userList(request, response)
})
app.get('/user/update/:planId', function (request, response) {
    user.userUpdate(request, response)
})
app.post('/user/update_process/:planId', function (request, response) {
    user.userUpdate_process(request, response)
})
app.get('/user/delete_process/:planId', function (request, response) {
    user.userDelete_process(request, response)
})

app.get('/board/list/:pNum',function(request,response){
    board.list(request,response)
})
app.get('/board/view/:bNum/:pNum',function(request,response){
    board.view(request,response)
})
app.get('/board/create',function(request,response){
    board.create(request,response)
})
app.post('/board/create_process',function(request,response){
    board.create_process(request,response)
})
app.get('/board/update/:bNum/:pNum',function(request,response){
    board.update(request,response)
})
app.post('/board/update_process',function(request,response){
    board.update_process(request,response)
})
app.get('/board/delete/:bNum/:pNum',function(request,response){
    board.delete(request,response)
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000')
    if (!fs.existsSync('./images')) {
        fs.mkdirSync('./images')
    }
})
