const authorizedUser = (req, res, next) => {
    if (req.session.authenticated) {
        return next();
    }

    else {
        res.status(403).json({msg: "You are not authorized to veiw this page."})
    }
}

module.exports - authorizedUser;