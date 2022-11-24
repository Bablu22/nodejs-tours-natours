exports.topTourAlice = async (req, res, next) => {
    req.query.limit = "5";
    req.query.sort = "-ratingAverage,price";
    req.query.fields = ""
    next()
}
