const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "GET student route is working"
    });
});

router.post("/", (req, res) => {
    res.json({
        message: "POST student route is working",
        data: req.body
    });
});

module.exports = router;