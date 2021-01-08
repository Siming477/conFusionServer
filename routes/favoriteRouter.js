const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({ user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id}, (err, fav) => {
        if(err) return next(err);
        if(fav) {
            for(var i=0; i<req.body.length; i++){
                if(fav.dishes.indexOf(req.body[i]._id) === -1){
                    fav.dishes.push(req.body[i]._id);
                }
            }
            fav.save()
            .then((fav) => {
                console.log('Favorite updated', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err))   
        } 
        else {
            Favorites.create({
                user: req.user._id,
                dishes: req.body
            })
            .then((fav) => {
                console.log('Favorite created', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err))   
        }
    })
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.deleteOne({ user: req.user._id}, (err, fav) => {
        if(err) return next(err);
        if(fav) {
            console.log('Favorite remove', fav);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        }
    })
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorite/' + req.params.dishId);
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id}, (err, fav) => {
        if(err) return next(err);
        if(fav) {
            if (fav.dishes.indexOf(req.params.dishId) === -1) {
                fav.dishes.push(req.params.dishId);
                fav.save()
                .then((fav) => {
                    console.log('Favorite added', fav);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }, (err) => next(err))
                .catch((err) => next(err))   
            } 
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }
        }
        else {
            Favorites.create({
                user: req.user._id,
                dishes: req.params.dishId
            })
            .then((fav) => {
                console.log('Favorite added', fav);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err))   
        }
    });
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite/' + req.params.dishId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ "user": req.user._id}, (err, fav) => {
        if(err) return next(err);
        if(fav) {
            index = fav.dishes.indexOf(req.params.dishId);
            if(!index) {
                fav.dishes.splice(index, 1);
                fav.save()
                .then((fav) => {
                    console.log('Favorite deleted', fav);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }, (err) => next(err))
                .catch((err) => next(err))   
            }
            else {
                err = new Error('Dish '+req.params.dishId+' not found');
                err.status = 404;
                return next(err);
            }
        }
        else {
            err = new Error('Favorites not found');
            err.statusCode = 404;
            return next(err); 
        }
    });
})

module.exports = favoriteRouter;
