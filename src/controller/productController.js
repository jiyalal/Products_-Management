const productModel = require("../model/productModel")

exports.getProduct = async (req, res) => {
    try
    {

        let filters = req.query
        if (Object.keys(filters).length == 0)
        {

            let product = await productModel.find({ isDeleted: false }).select({
                _id: 1, title: 1, description: 1, price: 1,
                currencyId: 1, currencyFormat: 1, isFreeShipping: 1, productImage: 1, style: 1, availableSizes: 1, installments: 1,
                deletedAt: 1, isDeleted: 1, createdAt: 1, updatedAt: 1
            })


            if (product.length == 0)
            {
                return res.status(404).send({ status: false, message: "HEY..🤨🤨 NO RESULT FOUND" })
            }
            let sortedProduct = product.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB)
                {
                    return -1; //titleA comes first
                }
                if (titleA > titleB)
                {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, data: sortedProduct })


        }
        else
        {
            Object.keys(filters).forEach(x => filters[x] = filters[x].trim())

            if (filters.size)
            {
                if (filters.size.includes(","))
                {
                    let sizeArray = filters.size.split(",").map(String).map(x => x.trim())
                    filters.size = { $all: sizeArray }
                }
            }
            if(filters.name){
                
            }
        }

    } catch (err)
    {
        console.log(err)
        return res.status(500).send({ status: false, err: err.message })
    }




}