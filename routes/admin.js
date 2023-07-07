const express = require('express')
const path = require('path')
const {check,body} = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')

// /admin/add-product
router.get('/add-product',isAuth,adminController.getAddProduct)


// // /admin/products
router.get('/products',isAuth,adminController.getProducts);


// // /admin/add-product
router.post('/add-product',
            [check('title', 'Please enter a valid title with minimum length of 5 and alphanumeric characters only.')
            .isString()
            .isLength({min : 5}),
            
            // body('imageUrl', 'Please enter a valid URL')
            // .isURL(),
        
            body('price', 'Please enter an integer price value.')
            .isNumeric(),
        
            body('description', 'Please enter description minimum upto 8 characters.')
            .isLength({min : 8})],
            isAuth, 
            adminController.postAddProduct)


router.get('/edit-product/:productId',isAuth, adminController.getEditProduct)

router.post('/edit-product',
            [body('title', 'Please enter a valid title with minimum length of 5.')
            .isString()
            .isLength({min : 5}),

            // body('imageUrl', 'Please enter a valid URL')
            // .isURL(),

            body('price', 'Please enter an integer price value.')
            .isNumeric(),

            body('description')
            .isLength({min : 8})],
            isAuth,
            adminController.postEditProduct)


// instead of below code we can use another delete route becoz now we are using client side javascript to delete the product.
// router.post('/delete-product',isAuth,adminController.postDeleteProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);
module.exports = router;

// Important Notes  : 
// 1. res.render() me hum jo bhi file specify krenge toh humne templating engine jisko bhi set kiya hoga express ussi templating engine ki same name waali file ko views me search kregi aur milte hi render kr degi.
// 2. router.get('/add-product',productController.getAddProduct) isme hum productController file me jo bhi export getAddProduct ke naam se ho rha h usko waha pe use kr rhe h aur function ko tab execute krwaayenge jab koi /admin/add-product pe aayega.
// 3. app.post handles all the post requests and app.get handles all the get request.
// 4. url me ':' laga ke hum jo bhi likhte h usko hum req.params.(jo bhi name diya h usko) krke access kr skte h.
