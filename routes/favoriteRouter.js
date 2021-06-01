const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) 
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({user:req.user._id})
        .populate("user")
        .populate("campsites")
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
        })
        .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user:req.user._id})
        .then(favorite => {
            if(favorite) {
                req.body.forEach((campsite, i) => {
                    if (!favorite.campsites.includes(req.body[i])) {
                        favorite.campsites.push(req.body[i]);
                    }
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                    })
                    .catch(err => next(err));
                })
            } else {
                Favorite.create({user: req.user._id, campsites: req.body})
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({user: req.user._id})
        .then(favorite => {
            if(favorite) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("You do not have any favorites to delete");
            }
        })
    })

favoriteRouter.route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("GET operation not supported on /favorites for specific campsites");
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /favorites");
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user:req.user._id})
        .then(favorite => {
            if(favorite) {
                if(favorite.campsites.includes(req.params.campsiteId)) {
                    res.statusCode = 200;
                    res.end("That campsite is already in the list of favorites!");
                } else {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                    })
                    .catch(err => next(err));
                }
            } else {
                Favorite.create({
                    user: req.user._id,
                    campsites: [{_id: req.params.campsiteId}]
                })
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if(favorite) {
                favorite.campsites = favorite.campsites.filter((campsite, i) => {
                    console.log("DB Campsite", campsite);
                    console.log("User Campsite", req.params.campsiteId);
                    return (!campsite.equals(req.params.campsiteId))
                });
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("You do not have any favorites to delete");
            }
        })
        .catch(err => next(err));
    })

module.exports = favoriteRouter;