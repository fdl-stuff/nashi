module.exports = [
    {   
        "url": "/artikel",
        "export": require("./routers/articles")
    },
    {   
        "url": "/paedagogik",
        "export": require("./routers/articles")
    },
    {   
        "url": "/info",
        "export": require("./routers/articles")
    },
    
    {   
        "url": "/konto",
        "export": require("./routers/account")
    },
    {
        "url": "/impressum",
        "export": require("./routers/info")
    },
    {
        "url": "/datenschutz",
        "export": require("./routers/info")
    },
    {
        "url": "/kontakt",
        "export": require("./routers/contact")
    }
]
