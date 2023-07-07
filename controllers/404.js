exports.pageNotFound = (req,res)=>{
    console.log('page not found')
    // res.sendFile(path.join(__dirname, './', 'views', '404.html'));    
    res.status(404).render('404', {pageTitle : "Page Not Found from ejs", path : '/404',
    isAuthenticated : req.isLoggedIn})
}

exports.get500 = (req,res,next) =>{
    res.status(404).render('500', {
        pageTitle : "Page Not Found from ejs", 
        path : '/404',
        isAuthenticated : req.isLoggedIn
    })
}