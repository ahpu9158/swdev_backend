const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');

const auth = require('./routes/auth');
const campgrounds = require('./routes/campgrounds');
const bookings = require('./routes/bookings');
const promotions = require('./routes/promotions');
const reviews = require('./routes/reviews');



//load env vars
dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

app.use(mongoSanitize());

app.use(helmet());

app.use(xss());

//rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100
});

app.use(limiter);

app.use(hpp());

app.use(cors());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Camground API'
        },
        servers: [
            {
                url: process.env.HOST + ":" + process.env.PORT + 'api/v1'
                //'http://localhost:5000/api/v1'
            }
        ]
    },
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));




app.use('/api/v1/auth', auth);
app.use('/api/v1/campgrounds', campgrounds);
app.use('/api/v1/bookings', bookings);

app.use('/api/v1/promotions', promotions);
app.use('/api/v1/reviews', reviews);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //close server & exit process
    server.close(() => process.exit(1));
});

