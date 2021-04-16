module.exports = {
    article_hidden_types: {
        "0":            "Public",
        "1":            "Unlisted",
        "2":            "Hidden"
    },
    article_types: {
        "artikel":      "/artikel, articles.",
        "datenschutz":  "/datenschutz, privacy policies, this will only use the one with the newest page_content_id and the type of datenschutz.",
        "info":         "/info, information.",
        "impressum":    "/impressum, imprint, these are the same as the privacy policies.",
        "kontakt":      "/kontakt, contact, !!DEPRECATED!! this is currently not used, it was supposed to be used like info and datenschutz but i ended up dumping it, possibly gonna use it again in same way shape or form in the future but idk yet.",
        "paedagogik":   "/paedagogik, pedagogy."
    },
    image_types: {
        "user":         "User profile pictures",
        "page":         "Images within an article",
        "banner":       "The banner images, shown on front page, at the top of the article and in the article lists",
        "temp_banner":  "currently used for front page while i make it so that articles can be selected for the front page, for now the type_id acts as the index of the slideshow e.g 1 = first."
        
        "_temp":        "currently unused, maybe used in the future for temporary images in article previews."
    }
}