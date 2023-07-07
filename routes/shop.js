// yeh main page h shop waala jo user ko dikhega website open hote hi.

const express = require("express");

const path = require("path");
const router = express.Router();
const isAuth = require('../middleware/is-auth')
const shopController = require('../controllers/shop')

router.get("/",shopController.getIndex);

router.get('/products',shopController.getProducts)

router.get('/products/:productId',shopController.getProduct)

router.get('/cart',isAuth,shopController.getCart)

router.post('/cart',isAuth,shopController.postCart);

router.get('/orders',isAuth,shopController.getOrders);

router.get('/checkout', isAuth, shopController.getCheckout)

router.post('/cart-delete-item',isAuth,shopController.postCartDeleteProduct)

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;

// Important Notes :

// 1. path.join(__dirname, '../', 'views', 'shop.html') -->> yeh humare views folder me jaake check krega ki shop.html file h kya aur milte hi render kr degi.
// 2. res.render() me hum jo bhi file specify krenge toh humne templating engine jisko bhi set kiya hoga express ussi templating engine ki same name waali file ko views me search kregi aur milte hi render kr degi.
// 3. res.sendFile(path.join(__dirname, '../', 'views', 'shop.html')) used to send a file named with shop.html and path.join constructs a path to that particular directory.
// 4. express me jab hum kisi bhi route me  ':' ka use krte h toh express usko as a dynamic content ki tarah treat krta h aur tumne uske aage jo bhi naam diya h uss naam me uss dynamic value ko store kr leta h.