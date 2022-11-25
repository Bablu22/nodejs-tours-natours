const stripe = require("stripe")(
    "sk_test_51M5NOUEs42PZB7Gk6uxYu7O01vwFxXPrbM5DxRbP4lxNLeflH8s5RWtxQSK7o39xxbvy2BVrFjcbz6n2kDAWlchn00p4lXQ21w"
);
const Booking = require("../models/BookingModel");
const Tour = require("../models/TourModel");
const User = require("../models/UserModel");

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


const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);

    res.status(200).json({ received: true });
};


