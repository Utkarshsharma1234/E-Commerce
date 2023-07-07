// const getDb = require('../utils/database').getDb;
// const mongodb = require('mongodb');
// const ObjectId = mongodb.ObjectId;

// class User {
//     constructor(username, email,cart,id){
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp =>{
//             return cp.productId.toString() === product._id.toString();
//         })

//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if(cartProductIndex >=0) {    // means that the product exists in the cart
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         }

//         else{
//             updatedCartItems.push({
//                 productId : new ObjectId(product._id),
//                 quantity : newQuantity
//             })
//         }

//         const updatedCart = {
//             items : updatedCartItems
//         };
//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne(
//           {_id : new ObjectId(this._id)},
//           {$set : {cart : updatedCart}}
//         )
//       }

//     getCart(){
//         const db = getDb();
//         const productsIds = this.cart.items.map(item =>{
//             return item.productId;
//         })
//         return db
//         .collection('products')
//         .find({_id : {$in : productsIds}})
//         .toArray()
//         .then(products =>{
//             return products.map(p =>{
//                 return {
//                     ...p,
//                     quantity : this.cart.items.find(i =>{
//                         return i.productId.toString() === p._id.toString();
//                     }).quantity
//                 }

//             })
//         });
//     }

//     deleteItemFromCart = (productId)=>{
//         const updatedCartItems = this.cart.items.filter(item=>{   // jo product nhi chahiye usko remove kr denge
//             return item.productId.toString() !== productId.toString();
//         })

//         const db = getDb();
//         return db
//         .collection('users')
//         .updateOne(
//           {_id : new ObjectId(this._id)},
//           {$set : {cart : {items : updatedCartItems}}}
//         )
//     }

//     addOrder(){
//         const db = getDb();
//        return this.getCart().then(products =>{    // accessing the cart of the particular user.
//             const order = {        // converting the cart into an order by also storing the value of user ID
//                 items : products,
//                 user : {
//                     _id : new ObjectId(this._id),
//                     name : this.name
//                 }
//             }
//             return db.collection('orders').insertOne(order)    // inserting the order into the orders collection.
//         })
//         .then(result =>{        // emptying the cart.
//                 this.cart = {items :[]};
//                 return db
//                     .collection('users')
//                     .updateOne(
//                         {_id : new ObjectId(this._id)},         // it is used to search for that particular user and then removing all the elements from the cart of that user.
//                         {$set : {cart :{items :[]}}}
//                     )
//             })
//     }

//     getOrders(){
//         const db = getDb();
//         return db
//             .collection('orders')
//             .find({'user._id' : new ObjectId(this._id)})
//             .toArray();
//     }

//     static findById(userId){
//         const db = getDb();
//         return db.collection('users').findOne({_id : new ObjectId(userId)})
//         .then(user =>{
//             console.log(user);
//             return user;
//         })
//         .catch(err =>{
//             console.log(err);
//         });
//     }

// }

// module.exports = User;

// >>>>>>>>>>>> MONGOOSE CODE <<<<<< ////

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },

  password : {
    type : String,
    required : true
  },

  resetToken : String,
  resetTokenExpiration : Date,
  email: {
    type: String,
    required: true,
  },

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
        return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        // means that the product exists in the cart
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity,
        });
    }

    const updatedCart = {
        items: updatedCartItems,
    };
    
    this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function(productId){
    const updatedCartItems = this.cart.items.filter(item=>{   // jo product nhi chahiye usko remove kr denge
    return item.productId.toString() !== productId.toString();
    })  

    const updatedCart = {
        items : updatedCartItems
    }

    this.cart = updatedCart
    return this.save();
}

userSchema.methods.clearCart = function(){
    this.cart.items = [];
   return this.save();
}
module.exports = mongoose.model("User", userSchema);
