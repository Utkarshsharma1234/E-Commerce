/// >>>>>>>>> THIS IS THE CODE IF WE ARE NOT USING THE DATABASE AND JUST ONLY USING THE FILE SYSTEM TO FETCH AND STORE DATA NOW WE WILL USE DATABASE.

// const products = []
// const fs = require('fs');

// const path = require('path')
// const p = path.join(__dirname, '../', 'data', 'products.json');
// const Cart = require('../model/cart')

// const getProductsFromFile = (callback)=>{
//         fs.readFile(p, (err,fileContent)=>{
//             if(err){
//                return callback([]);
//             }
//             else{
//                 return callback(JSON.parse(fileContent));
//             }
//         })
// } 

// module.exports = class Product {
//     constructor(id,title, imageUrl, price, description){
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save() {
//         // products.push(this);
        
//         getProductsFromFile(products =>{
            
//             if(this.id){
//                 const existingProductIndex = products.findIndex(prod => prod.id === this.id);
//                 const updatedProduct = [...products];
//                 updatedProduct[existingProductIndex] = this;
//                 fs.writeFile(p,JSON.stringify(updatedProduct),(err)=>{
//                     console.log(err);
//                 });   
//             }

//             else{
//                 this.id = Math.random().toString();
//                 products.push(this);
//                 fs.writeFile(p,JSON.stringify(products),(err)=>{
//                     console.log(err);
//                 });
//             }
            
//         })

//     }
    

//     static deleteById(id) {
//         getProductsFromFile(products =>{
//             const product = products.find(prod => prod.id === id);
//             const updatedProducts = products.filter(prod => prod.id !== id);    // by doing this we are just saving all those products whose id doesnot matches the product id which i want to delete and then we will render the new array of updated products.
//             fs.writeFile(p,JSON.stringify(updatedProducts),err=>{
//                 if(!err){
//                     Cart.deleteProduct(id,product.price);
//                 }
//             })
//         })
//     }
//     static fetchAll(callback) {
//         getProductsFromFile(callback);
//     }


//     static findById(id,callback) {
//         getProductsFromFile(products =>{
//             const product = products.find(p => p.id === id);
//             callback(product);
//         })
//     }
// }


// >>>>>>>>>> IN THIS MODEL WE WILL BE USING OUR  MYSQL DATABASE TO STORE THE VALUES AND FETCH THEM <<<<<<<< ////


// const Cart = require('../model/cart')
// const db = require('../utils/database');

// module.exports = class Product {
//     constructor(id,title, imageUrl, price, description){
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//     }

//     save() {
//       return  db.execute(
//         'INSERT INTO products(title,price,description,imageUrl) VALUES(?,?,?,?)',
//         [this.title, this.price,this.description, this.imageUrl]);
//     }
    

//     static deleteById() {
        
//     }
//     static fetchAll() {
//        return db.execute('SELECT * FROM products');
//     }


//     static findById(id) {
//        return db.execute(' SELECT * FROM products WHERE products.id = ?',[id]);
//     }
// }


// >>>>>> IN THIS MODEL WE WILL BE USING OUR SEQUELIZE TO CONNECT TO THE DATABASE AND TO STORE AND FETCH THE VALUES. <<<<<

// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');

// const Product = sequelize.define('product',{
//     id : {
//         type : Sequelize.INTEGER,
//         autoIncrement : true,
//         allowNull : false,
//         primaryKey : true
//     },
//     title : {
//         type : Sequelize.STRING,
//         allowNull : false
//     },
//     price : {
//         type : Sequelize.DOUBLE,
//         allowNull : false
//     },
//     imageUrl : {
//         type : Sequelize.STRING,
//         allowNull : false
//     },
//     description : {
//         type : Sequelize.TEXT,
//         allowNull : false
//     }
// })

// module.exports = Product;







//  >>>NOW WE WILL USE MONGODB SERVER DATABASE <<< ///

// const mongodb = require('mongodb');
// const getDb = require('../utils/database').getDb;

// class Product{
//     constructor(title,price,description,imageUrl,id,userId){
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     }

//     save(){

//         const db = getDb();
//         if(this._id){
//             // Update the Product
//             return db.collection('products').updateOne({_id : this._id}, {$set : this})
//             .then(result =>{
//                 console.log(result);
//             })
//             .catch(err =>{
//                 console.log(err);
//             });

//         }
//         else{
//           return db.collection('products').insertOne(this)
//             .then(result =>{
//                 console.log(result);
//             })
//             .catch(err =>{
//                 console.log(err);
//             });
//         }
//     }

//     static fetchAll(){
//         const db = getDb();
//         return db.collection('products').find().toArray()       // find me hum filters bhi laga skte h in an object format. like .find({title : "A book"}).
//         .then(products =>{
//             console.log(products);
//             return products;
//         })
//         .catch(err => {
//             console.log(err)
//         });    
//     }


//     static findById(prodId){
//         const db = getDb();
//         return db.collection('products')
//             .find({_id : new mongodb.ObjectId(prodId)})          // mongodb bson format me store krta h values toh humne usme check kiya ki ek particular id waala object agar present h toh usko return kr do.
//             .next()
//             .then(product =>{
//                 console.log(product);
//                 return product;
//             })
//             .catch(err => {
//                 console.log(err)
//             });
//     }

//     static deleteById(prodId){
//         const db = getDb();
//        return db.collection('products').deleteOne({_id : new mongodb.ObjectId(prodId)})
//         .then(result =>{
//             console.log("Deleted!");
//         })
//         .catch(err =>{
//             console.log(err);
//         });
//     }
// }

// module.exports = Product;

// 1. constructor function me hum ek naya object bna rhe h aur uss object me title me hum jo bhi arguement diya jaa rha h usse use kr rhe h
// 2. save se hum products naam ki array me uss created object ko store kr rhe h.
// 3. fetchAll function se hum log jo bhi this naam ke object me store h usme se products ko fetch kr rhe h.
// 4. JSON.parse() kisi bhi json format ki file ko array format me change kr deta h.
// 5. JSON.stringify koi bhi js object ya array ko input leta h aur ek JSON file me change krke deta h.
// 6. This in the class is used for making an object inside the class and helps to use it inside it only.
// 7. save me 2 files isliye bnayi kyoki agar koi naya product aata h toh usko random id allot kr dnege lekin agar hum existing product ke liye check kr rhe h toh uske paas already ek id present hogi.
// 8. db.execute('INSERT INTO products(title,price,description,imageUrl) VALUES('?','?','?','?')',[this,title, this.price,this.description, this.imageUrl]); iss command se hum log database me values ko insert kr rhe h aur question mark laga de rhe h just for security purposes and id jo h woh database automatic generate kr lega.   
// 9. const Product me Sequelize use krke hum ek table create kr rhe h jisme data jo h product ki tarah store hoga where id, title, description, price jaise fields present honge.
// 10. collection.find() returns a cursor to the data and we can change it to the array format.








// >>>>>>>>>>>> USING THE MONGOOSE TO CONNECT TO THE MONGODB SERVER AND CREATING ALL THE SCHEMAS <<<<< /////

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title :{
        type : String,
        required : true
    },

    price : {
        type : Number,
        required : true
    },

    description : {
        type : String,
        required : true
    },

    imageUrl : {
        type : String,
        required : true
    },

    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User',      // jo naam tumne apne user schema me diya h yeh wahi naam h
        required : true
    }
})

module.exports = mongoose.model('Product', productSchema);