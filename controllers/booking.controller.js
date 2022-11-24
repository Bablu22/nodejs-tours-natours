const stripe = require("stripe")(
    "sk_test_51M5NOUEs42PZB7Gk6uxYu7O01vwFxXPrbM5DxRbP4lxNLeflH8s5RWtxQSK7o39xxbvy2BVrFjcbz6n2kDAWlchn00p4lXQ21w"
);
const Tour = require("../models/TourModel");

exports.getCheckoutSession = async (req, res, next) => {
    try {
        const { tourId } = req.params;
        //1. Get the currently booking tour
        const tour = await Tour.findById(tourId);
        //2. Create checkout session

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
            //   req.params.tourId
            // }&user=${req.user.id}&price=${tour.price}`,
            success_url: `${req.protocol}://${req.get("host")}/`,
            cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
            customer_email: req.user.email,
            client_reference_id: tourId,
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: tour.price,
                        product_data: {
                            name: `${tour.name} Tour`,
                            description: tour.summary,
                            images: [
                                `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover
                                }`,
                            ],
                        },
                    },

                    quantity: 1,
                },
            ],
            mode: 'payment',
        });

        //3. Create session as response
        res.status(200).json({
            status: "success",
            session,
        });
    } catch (error) {
        next(error);
    }
};


exports.createBooking = async (req, res, next) => {
    try {

    } catch (error) {
        next(error)
    }
}

