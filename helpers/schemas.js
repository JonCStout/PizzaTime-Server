const fs = require('fs')  // for JSON import
const Ajv = require('ajv')  // Another JSON (Schema) Validator, https://www.npmjs.com/package/ajv
const _ = require('lodash')  // for flattening the schema to make error messages easier to get to
let ajv = new Ajv( { allErrors: true } )  // ***** TODO: remove allErrors for production release, which fixes DoS issue


let schemas = { }
let validators = { }


// async json import, see here: https://goenning.net/2016/04/14/stop-reading-json-files-with-require/
function readJson(path, cb) {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err)  {  // may not even need this because it looks like node will just barf with a useful error, if there's a problem
            console.log('=== Unable to import file ', path)
            console.log(err)
            process.exit(-1)
        }
        try{
            cb(JSON.parse(data))
        } catch(err2) {
            console.log('=== JSON-parse error with file ', path)
            console.log(err2)
            process.exit(-1)
        }
    })
}

// import schema(s)
(function () {
    readJson('ajv/lib/refs/json-schema-secure.json', (schemaObj1) => {
        let securitySchemaValidator = ajv.compile(schemaObj1)  // securitySchemaValidator is only needed during schema imports, not globally forever

        readJson('../public/custAccountSchema.json', (schemaObj) => {
            if (!securitySchemaValidator(schemaObj))  console.log("=== custAccountSchema failed security check ===")
            validators.custAccount = ajv.compile(schemaObj)
            schemas.custAccount = schemaObj  // save the schema also, for later use
        })

        readJson('../public/orderSchema.json', (schemaObj) => {
            if (!securitySchemaValidator(schemaObj))  console.log("=== orderSchema failed security check ===")
            validators.order = ajv.compile(schemaObj)
            schemas.order = schemaObj
        })

        readJson('../public/productSchema.json', (schemaObj) => {
            if (!securitySchemaValidator(schemaObj))  console.log("=== productSchema failed security check ===")
            validators.product = ajv.compile(schemaObj)
            schemas.product = schemaObj
        })
    })
})()

function getErrorStrings(errArray, schema) {
    let returnMsg
    errArray.forEach(errObj => {  // loop for multiple errors
        let errorPath = errObj.dataPath
        errorPath = errorPath.substr(1, errorPath.length)  // strip beginning "." off
        errorPath = errorPath.replace(".", ".properties.")  // replace nested items with expanded path in schema
        errorPath = errorPath.replace(/\[\d+\]/, ".items")  // replace array-indexing [0] with .items
        let schemaPath = _.get(schema.properties, errorPath)  // use lodash to get the potentially nested errorPath property
        if (schemaPath && schemaPath.description)  // make sure our error description is pointing to a valid message property
            returnMsg =  (!returnMsg) ?  schemaPath.description  :  returnMsg + '\n' + schemaPath.description
        else
            if (errObj.message) 
                returnMsg =  (!returnMsg) ?  errObj.message  :  returnMsg + '\n' + errObj.message
            else
                returnMsg =  (!returnMsg) ?  errObj  :  returnMsg + '\n' + errObj
    })
    return returnMsg
}

// this function takes a JSON input object (from req.body) and validates it against a given schema;
// returns an error string or error array, or null if no issue
function checkInput(inputData, schemaStr) {
    let validatorFunc = validators[schemaStr]
    let schema = schemas[schemaStr]
    if (!validatorFunc)  return 'server isn\'t ready, try again in a moment'  // schema may not be done being async loaded when a call happens to come in;  *** pause, auto-retry instead of failing?
    if (typeof inputData != 'object')  return 'unexpected data'  // *** should something like this be persistently logged somewhere?  may be a sign of a hacking attempt

    if (!validatorFunc(inputData)) {
        let returnMsg = getErrorStrings(validatorFunc.errors, schema)
        console.log(returnMsg)
        return returnMsg || validatorFunc.errors  // return whole error object if we couldn't construct an error message
    }

    return null
}

module.exports = { checkInput }