const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");

// Database connection
mongoose
    .connect(process.env.MONGO_LOCAL, { useNewUrlParser: true })
    .then(() => console.log("DB connection successful!"));

app.listen(PORT, () => {
    console.log(
        `Server is running on PORT ${process.env.PORT} in ${process.env.NODE_ENV} Mode`
    );
});
