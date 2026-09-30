const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = 3000;

// ================================
// ESEWA TEST CONFIGURATION
// ================================

const ESEWA_URL =
    "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

const PRODUCT_CODE = "EPAYTEST";

// Test secret supplied by eSewa for UAT
const SECRET_KEY = "8gBm/:&EnhH.1/q";

// ================================
// MIDDLEWARE
// ================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ================================
// CREATE ESEWA SIGNATURE
// ================================

function createSignature(totalAmount, transactionUuid) {

    const message =
        `total_amount=${totalAmount},` +
        `transaction_uuid=${transactionUuid},` +
        `product_code=${PRODUCT_CODE}`;

    return crypto
        .createHmac("sha256", SECRET_KEY)
        .update(message)
        .digest("base64");
}

// ================================
// START PAYMENT
// ================================

app.post("/api/esewa/payment", (req, res) => {

    try {

        const amount = Number(req.body.amount);

        if (!amount || amount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });

        }

        const totalAmount = amount.toFixed(2);

        const transactionUuid =
            "BLOOM-" +
            Date.now();

        const signature =
            createSignature(
                totalAmount,
                transactionUuid
            );

        const formData = {

            amount: totalAmount,

            tax_amount: "0",

            total_amount: totalAmount,

            transaction_uuid:
                transactionUuid,

            product_code:
                PRODUCT_CODE,

            product_service_charge: "0",

            product_delivery_charge: "0",

            success_url:
                "http://localhost:3000/esewa-success",

            failure_url:
                "http://localhost:3000/esewa-failure",

            signed_field_names:
                "total_amount,transaction_uuid,product_code",

            signature:
                signature
        };

        res.json({

            success: true,

            paymentUrl:
                ESEWA_URL,

            formData:
                formData
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Could not create payment"

        });

    }

});

// ================================
// SUCCESS PAGE
// ================================

app.get("/esewa-success", (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Payment Successful</title>

<style>

body {
    font-family: Arial;
    background: #fff1f5;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.box {
    background: white;
    padding: 50px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 40px #0002;
}

.icon {
    font-size: 70px;
}

h1 {
    color: #294c43;
}

p {
    color: #777;
}

a {
    display: inline-block;
    margin-top: 20px;
    padding: 14px 25px;
    background: #e9577d;
    color: white;
    text-decoration: none;
    border-radius: 8px;
}

</style>

</head>

<body>

<div class="box">

<div class="icon">🌸</div>

<h1>Payment Successful!</h1>

<p>
Thank you for shopping with Bloom & Co.
</p>

<a href="/">
Return to Bloom & Co.
</a>

</div>

</body>

</html>

`);

});

// ================================
// FAILURE PAGE
// ================================

app.get("/esewa-failure", (req, res) => {

    res.send(`

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Payment Failed</title>

<style>

body {
    font-family: Arial;
    background: #fff1f5;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
}

.box {
    background: white;
    padding: 50px;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 10px 40px #0002;
}

.icon {
    font-size: 70px;
}

h1 {
    color: #c33;
}

p {
    color: #777;
}

a {
    display: inline-block;
    margin-top: 20px;
    padding: 14px 25px;
    background: #294c43;
    color: white;
    text-decoration: none;
    border-radius: 8px;
}

</style>

</head>

<body>

<div class="box">

<div class="icon">❌</div>

<h1>Payment Failed</h1>

<p>
Your eSewa payment was not completed.
</p>

<a href="/">
Return to Shop
</a>

</div>

</body>

</html>

`);

});

// ================================
// START SERVER
// ================================

app.listen(PORT, () => {

    console.log("");
    console.log("🌸 Bloom & Co. is running!");
    console.log("");
    console.log(
        `Open: http://localhost:${PORT}`
    );
    console.log("");

});
