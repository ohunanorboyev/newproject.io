const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = Router()

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Ruxsat so\'rash',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')

    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })

})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)
            if (areSame) {

                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            }
            else {
                req.flash('loginError', 'Noto\'g\'ri parol')

                res.redirect('/auth/login#login')

            }
        }

        else {
            req.flash('loginError', 'Bunday foydalanuvchi yo\'q')
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err);
    }

})

router.post('/register', async (req, res) => {
    try {
        const { email, password, repeat, name } = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
            req.flash('registerError', 'Bunday Email foydalanuvchisi o\'rni band')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({
                email, name, password: hashPassword, cart: { items: [] }
            })
            await user.save()
            res.redirect('/auth/login#login')
        }
    } catch (err) {
        console.log(err);
    }
})

module.exports = router