const passportStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");

/**
 * @function passport
 * returns promisified done status for login/register
 */
module.exports = passport => {
  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .exec()
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  passport.use(
    "login",
    new passportStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        process.nextTick(() => {
          console.log("trying passport");

          User.findOne({
            email: email
          })
            .exec()
            .then(user => {
              console.log(user);

              if (!user) {
                console.log("wrong id");
                return done(
                  null,
                  false,
                  req.flash("message", "User not found")
                );
              }
              if (!bcrypt.compareSync(password, user.password)) {
                console.log("wrong pass");
                return done(
                  null,
                  false,
                  req.flash("message", "Password is Incorrect")
                );
              }
              console.log("password valid, success");

              return done(null, user);
            })
            .catch(err => done(err));
        });
      }
    )
  );

  passport.use(
    "loginwebview",
    new passportStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
      },
      (req, email, password, done) => {
        process.nextTick(async () => {
          console.log("hello");

          const user = await User.findById(req.user.id);
          if (!user) {
            return done(null, false, req.flash("message", "User not found"));
          }
          return done(null, user);
        });
      }
    )
  );
};
