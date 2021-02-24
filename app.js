const express = require('express');
const exphbs  = require('express-handlebars');

const mercadopago = require ('mercadopago');
mercadopago.configure({
  access_token: 'APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439',
  integrator_id: 'dev_2e4ad5dd362f11eb809d0242ac130004'
});

const port = process.env.PORT || 3000

const app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    res.render('detail', req.query);
});

app.post('/detail', (req, res) => {
  
  const productImage = `${req.protocol}://${req.hostname}${req.body.productImage}`;  
  const productPrice = +req.body.productPrice;
    
  const preference = {
    items: [
      {
        id: 1234,
        title: req.body.productDescription,
        description: 'Dispositivo móvil de Tienda e-commerce',
        quantity: 1,
        currency_id: 'PEN',
        picture_url: productImage, 
        unit_price: productPrice
      }
    ],
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_46542185@testuser.com",
      phone: {
        area_code: "52",
        number: 5549737300        
      },
      identification: {
        type: "DNI",
        number: "22334445"
      },
      address: {        
        zip_code: "03940",
        street_name: "Insurgentes Sur",
        street_number: 1602,        
      }
    },
    payment_methods: {
      excluded_payment_types: [
        { id: "atm" }
      ],
      excluded_payment_methods: [        
        { id: "diners" }
      ],
      installments: 6
    },
    back_urls: {
      success: `${req.protocol}://${req.hostname}/responsePayment`,
      pending: `${req.protocol}://${req.hostname}/responsePayment`,
      failure: `${req.protocol}://${req.hostname}/responsePayment`,
    },    
    notification_url: `${req.protocol}://${req.hostname}/notification`,
    auto_return: 'approved',
    external_reference: 'juanjosechiroque@gmail.com'
  };
  
  mercadopago.preferences.create(preference)
    .then(response => {
      
      console.log(response);
      res.redirect(response.body.init_point);
    
    })
    .catch(err => console.log(err));
   
});

app.get('/responsePayment', (req, res) => {
  
  if(req.query.collection_status == "approved") {
    req.query.isSuccess = true;
  }
  
  console.log('req.query');
  console.log(req.query);
  
  res.render('responsePayment', req.query);
  
});

app.post('/notification', (req, res) => {
  
  console.log(' =========================================================== ');      
  console.log(req.body);    
  console.log(' =========================================================== ');      
  res.status(201);
  
});

app.listen(port);