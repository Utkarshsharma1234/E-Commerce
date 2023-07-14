//// >>>>> THE CODE IS FOR CONNECTING DIRECTLY TO THE MONGODB SERVER WITHOUT THE USE OF MONGOOSE.


const { validationResult } = require('express-validator');
const Product = require('../model/product')
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
const fileHelper = require('../utils/file');
const ITEMS_PER_PAGE = 3

exports.getAddProduct = (req,res,next)=>{
    console.log('product added');
    // res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'))

    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    res.render('admin/edit-product',
        {pageTitle : "Waise Edit product route h but page add product hi h.",
        path : '/admin/add-product',
        editing :false,
        isAuthenticated : req.session.isLoggedIn,
        errorMessage : null,
        hasError : false
    })
}


exports.postAddProduct = (req,res,next)=>{ 

/////>>>>>> MONGOOSE CODE <<<< ////
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    if (!image){
        return res.status(422).render('admin/edit-product',{
            pageTitle : 'Add Product',
            path : 'admin/add-product',
            editing : false,
            hasError : true,
            product : {
                title : title,
                price : price,
                description : description
            },
            errorMessage : 'Attached file is not an image.'
        })
    }
    const errors = validationResult(req);
    console.log(errors.array());
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product',{
            pageTitle : 'Add Product',
            path : 'admin/add-product',
            editing : false,
            hasError : true,
            product : {
                title : title,
                price : price,
                description : description
            },
            errorMessage : errors.array()[0].msg
        })
    }

    const imageUrl = "images/" + new Date().toISOString + '-' + image.originalname;
    
    const product = new Product({    // isme right me jo values h woh jo product add ho rha h uski h.
        title : title,     // left waali value jo product schema humne product model me define kiya h woh h.
        price : price,
        description : description,
        imageUrl : imageUrl,
        userId : req.user._id
    })
    
    
    product
        .save()             // this save method is given by mongoose itself and we don't need to define it as we were doing it before while connecting to the mongodb driver.
        .then(result =>{
            console.log('A new Product has been added!')
            res.redirect('/admin/products');
        })
        .catch(err =>{
            console.log(err);

            // A better way of handling the error.
            // return res.status(500).render('admin/edit-product',{
            //     pageTitle : 'Add Product',
            //     path : 'admin/add-product',
            //     editing : false,
            //     hasError : true,
            //     product : {
            //         title : title,
            //         imageUrl : imageUrl,
            //         price : price,
            //         description : description
            //     },
            //     errorMessage : 'Server side issue. We will be back in a while. '
            // })

            // res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.getEditProduct = (req,res,next)=>{
    console.log('product edited');
    const editMode = req.query.edit;
    if(!editMode){
        return res.redirect('/');
    }

    const prodId = req.params.productId;

/// >>>  MONGODB DRIVER CODE AS WELL AS THE MONGOOSE CODE. <<< ///


    Product.findById(prodId)
        .then(product =>{
            if(!product){
                res.redirect('/');
            }
            else{
                res.render('admin/edit-product',
                {pageTitle : "Edit Product from ejs",
                path : '/admin/edit-product',
                editing : editMode,
                product : product,
                hasError : false,
                isAuthenticated : req.session.isLoggedIn,
                errorMessage : null
            })
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.postEditProduct = (req,res,next) =>{
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDesc = req.body.description;
    const image = req.file;

    const errors = validationResult(req);
    console.log(errors.array());
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product',{
            pageTitle : 'Edit Product',
            path : 'admin/edit-product',
            editing : true,
            hasError : true,
            product : {
                title : updatedTitle,
                price : updatedPrice,
                description : updatedDesc,
                _id : prodId
            },
            errorMessage : errors.array()[0].msg
        })
    }
    Product
        .findById(prodId)
        .then(product =>{
        
        if(product.userId.toString() !== req.user._id.toString()){
           return res.redirect('/');
        }
        product.title = updatedTitle
        product.price = updatedPrice
        product.description = updatedDesc

        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path
        }
        
        return product.save().then(result =>{
            console.log('Product has been updated successfully!');
            res.redirect('/admin/products');
        })
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


exports.getProducts =(req,res,next) =>{
    let totalItems;
    const page = +req.query.page || 1;
// >>>>>>> USING MONGOOSE TO RENDER ALL THE PRODUCTS <<<<<< ////
        Product
            .find({userId : req.user._id})
            .countDocuments()
            .then(numProducts =>{
                totalItems = numProducts;
                return Product
                .find({userId : req.user._id})
                .skip((page-1) * ITEMS_PER_PAGE)        // this helps us to skip the specified number of items from start.
                .limit(ITEMS_PER_PAGE)
            }) 
            .then(products =>{
                console.log(products);
                res.render('admin/products',{
                prods : products,
                pageTitle : 'Admin Products',
                path : '/admin/products',
                isAuthenticated : req.session.isLoggedIn,
                currentPage : page,
                hasNextPage : ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage : page > 1,
                nextPage : page+1,
                previousPage : page - 1,
                lastPage : Math.ceil(totalItems/ITEMS_PER_PAGE)
                })
            })                                               // .select('title price - _id')    // this helps us to only fetch the title and price and other information is not extracted.                                                    // .populate('userId')           // populate helps in giving us the all information about the particular userId
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
}

exports.deleteProduct = (req,res,next) =>{
    const prodId = req.params.productId;
    Product.findById(prodId)
           .then(product =>{
                if(!product){
                   return next(new Error('Product not Found!'));
                }
                
                fileHelper.deleteFile(product.imageUrl);
                return  Product.deleteOne({_id : prodId, userId : req.user._id})
    })
            .then((product) =>{
                console.log('Product Destroyed!');
                // res.redirect('/admin/products');
                res.status(200).json({message : "Successfully deleted!"})
            })
            .catch(err => {
                // const error = new Error(err);
                // error.httpStatusCode = 500;
                // return next(error);

                res.status(500).json({message : "Deleting Failed!"})
            });
    // IN MONGODB DRIVER WE USE DELETEBYID WHICH IS MADE BY US ONLY BUT MONGOOSE PROVIDES IT AS FINDBYIDANDREMOVE METHOD <<< ///
   
        
} 