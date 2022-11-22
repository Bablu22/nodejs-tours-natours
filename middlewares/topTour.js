exports.topTourAlice = async (req, res, next) => {
    req.query.limit = "6";
    req.query.sort = "-ratingAverage,price";
    req.query.fields = "name,price,ratingAverage,summary,difficulty,imageCover"
    next()
}
