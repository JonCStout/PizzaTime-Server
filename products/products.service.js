const dbclient = require('../helpers/db')
const { checkInput } = require('../helpers/schemas')


let collection 
(async () => { collection = await dbclient.collections() })()

module.exports = {
    getById,
    getByCategory,
    newProduct,
    changeProduct
}

async function getById(id) {
    console.log("Looking for productID: ", id)
    return await collection.Products.findOne({ "productId": id })    
}

async function getByCategory(category) {
    console.log("Looking for product category: ", category)
    return await collection.Products.find({ "category": category }).toArray() 

}

async function newProduct(productData) {
    if (productData.productId)  throw('productId should NOT exist on received data')
    productData.productId = Math.floor(Math.random() * 10000) + 10000;
    // *** verify Id doesn't already exist in database?
    // *** verify itemName doesn't already exist?

    err = checkInput(productData, 'product')
    if (err)  throw(err)

    return await collection.Products.insertOne(productData)
}

async function changeProduct(prodId, productData) {
    if (productData.productId && prodId !== productData.productId)  throw('a new productId should NOT exist on received data')
    productData.productId = prodId

    err = checkInput(productData, 'product')  // this uses a complete object that passes all requirements: can't just check individual properties
    if (err)  throw(err)

    return await collection.Products.updateOne( { "productId": prodId }, { $set: productData } )
}
