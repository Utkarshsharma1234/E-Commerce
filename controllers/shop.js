
// >>>>>>>>>>>  THE BELOW CODE IS WHEN WE ARE DIRECTLY CONNECTING TO THE MONGODB SERVER <<<<<<<<<<<< ///////

const Product = require('../model/product');
const user = require('../model/user');
const Order = require('../model/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const ITEMS_PER_PAGE = 3;
const stripe = require('stripe')('sk_test_51NA8OqSIdoDtrleWBgllgaXUESWiHnkcrP5RVjwGqiPT3ba3x9awi9ZFICgSm1azQhbS9fUAt5h49WFb1kQsTrGm00Pwx1lQs1')
// const Cart = require('../model/cart')


exports.getProducts = (req, res) => {

    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
           .countDocuments()
           .then(numProducts =>{
            totalItems = numProducts;
            return Product
              .find()
              .skip((page-1) * ITEMS_PER_PAGE)        // this helps us to skip the specified number of items from start.
              .limit(ITEMS_PER_PAGE)
           })
           .then(products =>{
            res.render('shop/product-list',{
              pageTitle : "Main Index Page",
              prods : products,
              path : '/products',
              isAuthenticated : req.session.isLoggedIn,
              currentPage : page,
              hasNextPage : ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage : page > 1,
              nextPage : page+1,
              previousPage : page - 1,
              lastPage : Math.ceil(totalItems/ITEMS_PER_PAGE)
            })
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
  }


exports.getProduct = (req,res,next) =>{

/// >>>> USING MONGOOOSE CODE <<<<<<<////
    
    const prodId = req.params.productId;
    Product
      .findById(prodId)          // mongoose provides findbyid method by itself.
      .then(product =>{
        res.render('shop/product-detail',{
          product : product,
          pageTitle : product.title,
          path : '/products',
          isAuthenticated : req.session.isLoggedIn
        })
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.getIndex = (req,res,next) =>{
  const page = +req.query.page || 1;
  let totalItems;
///// >>>>> USING MONGOOSE CODE <<<<////

    Product.find()
           .countDocuments()
           .then(numProducts =>{
            totalItems = numProducts;
            return Product
              .find()
              .skip((page-1) * ITEMS_PER_PAGE)        // this helps us to skip the specified number of items from start.
              .limit(ITEMS_PER_PAGE)
           })
           .then(products =>{
            res.render('shop/index',{
              pageTitle : "Main Index Page",
              prods : products,
              path : '/',
              isAuthenticated : req.session.isLoggedIn,
              csrfToken : req.csrfToken(),
              mailSent : req.flash('mailSent'),
              currentPage : page,
              hasNextPage : ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage : page > 1,
              nextPage : page+1,
              previousPage : page - 1,
              lastPage : Math.ceil(totalItems/ITEMS_PER_PAGE)
            })
          })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.getCart =(req,res,next) =>{

  req.user
    .populate('cart.items.productId')
    .then(user =>{
        const products = user.cart.items;
        res.render('shop/cart',{
                path : '/cart',
                pageTitle : "View Your Cart",
                products : products,
                isAuthenticated : req.session.isLoggedIn
              })
      })
    
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postCart =(req,res,next) =>{
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product =>{
   return req.user.addToCart(product);
    
  })
  .then(result =>{
    res.redirect('/cart');
    console.log(result);
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
}

exports.postCartDeleteProduct = (req,res,next) =>{
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result =>{
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
}



exports.getOrders =(req,res,next) =>{
  Order.find({'user.userId' : req.user._id})
  .then(orders =>{
    res.render('shop/orders',{
      path : '/orders',
      pageTitle : "Your Orders",
      orders : orders,
      isAuthenticated : req.session.isLoggedIn
    })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
    
}

exports.getCheckout = (req,res,next) =>{
  req.user
    .populate('cart.items.productId')
    .then(user =>{
        const products = user.cart.items;
        let total = 0;
        products.forEach(p=>{
          total += p.quantity * p.productId.price;
        })
        res.render('shop/checkout',{
                path : '/checkout',
                pageTitle : "Chekout Page",
                products : products,
                totalSum : total,
                isAuthenticated : req.session.isLoggedIn
              })
      })
    
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}

exports.postOrder =(req,res,next) =>{

  let cost = 0;
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .then(user =>{
      
      user.cart.items.forEach(p =>{
        totalSum += p.quantity * p.productId.price;
      })
      const products = user.cart.items.map(i =>{
        const quantity = i.quantity;
        const product = {...i.productId._doc};
        cost += product.price * quantity;

        return {quantity,product};
      });

      const order = new Order ({
        user : {
          email : req.user.email,
          userId : req.user._id 
        },

        products : products,
        TotalCost : cost
      });
     return order.save();
    })
    .then(result =>{
     return req.user.clearCart();
    })
    .then(()=>{
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  });
}

exports.getInvoice = (req,res,next) =>{
  const orderId = req.params.orderId;
  Order.findById(orderId)
       .then(order =>{
        if(!order){
          return next(new Error('No order Found!'));
        }

        if(order.user.userId.toString() !== req.user._id.toString()){
          return next(new Error('Unauthorized!'));
        }

        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));   // this will create the file on the fly to the specified path.
        pdfDoc.pipe(res);  // this will give the response to the user.

        // pdfDoc.text('Hey this is pdfkit application!');       // this just starts creating the pdf

        pdfDoc.fontSize(26).text('Invoice', {
          underline : true
        });

        pdfDoc.text('-----------------------');

        order.products.forEach(prod =>{
          pdfDoc.fontSize(16).text(prod.product.title + '-' + prod.quantity + ' x ' + '$' + prod.product.price);
        })

        pdfDoc.fontSize(30).text('Total Cost = ' + order.TotalCost);

        pdfDoc.end();    // this will end up the pdf creation.


  // READING FILES USING FILE SYSTEM MAY WORK FOR TINY FILES BUT IT WILL TAKE A LONG TIME BEFORE SENDING ANY RESPONSE IF THE FILES ARE TOO LARGE
  // SO WE USE THE STREAMING FUNCTIONALITY TO OVERCOME THIS PROBLEM
        // fs.readFile(invoicePath, (err,data) =>{
        //   if(err){
        //     return next(err);
        //   }

        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        //   res.send(data);
        // })

  // THIS HELPS US TO READ ANY FILE FROM THE DATA AND THEN SERVE IT TO THE CLIENT IN DIFFERENT SMALL CHUNKS.
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      // file.pipe(res);    
       })
       .catch(err=>{
          console.log(err);
  })
}
// Important Notes :
// 1. controllers me hum logic ko store krte h toh jo bhi function calls hongi ya phit koi bhi file rendering hogi woh sab hum controllers me rkhenge. jaise ki add-product waali file me jab user '/admin/add-product' pe jaayega toh usse kya dikhega uska logic hum yaha product controller se bhej rhe h.
// 2. const Product krke hum log jo humne model bnaya h product waala usko yaha pe import kr rhe h.
// 3. aur jo functions me local products aur product naam ke constants bnaye h usme hum Product class jo ki model me define ki gyi h usko use kr rhe h jisse ki hum uske functions ko use kr ske jaise ki fetchAll and save functions.
// 4. actually view engine set krte waqt humara view engine sirf views folder me file dekhta h agar file kisi aur naye folder me h toh hume usse specify krna padega.


