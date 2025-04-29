import passport from 'passport'
import passportGoogle from 'passport-google-oauth20'
import AppleStrategy from 'passport-apple'
import config from '../config'
import prisma from '../shared/prisma'
import { generateToken } from './jwt'
import { Secret } from 'jsonwebtoken'

const GoogleStartegy = passportGoogle.Strategy


passport.use(new GoogleStartegy({
    clientID:config.google.client_id as string,
    clientSecret:config.google.client_secret as string,
    callbackURL:"/api/v1/auth/google/callback"

},async (accessToken:any, refreshToken:any, profile:any, done:any) => {  
    // 🗂️ In a real app, you'd save the user info to your DB here  
    console.log('Google profile:', profile);  
    try {
      // Check if the user exists
      let user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value },
      });

      if (!user) {
        // If not, create the user
        user = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            username: profile.displayName,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            photos: { url: profile.photos[0].value },
            isCompleteProfile: false,
            status: 'ACTIVE',
             
          },
        });
      }

      
  const accessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role

    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

      // Issue a JWT token
      // const token = jwt.sign(
      //   {
      //     id: user.id,
      //     email: user.email,
      //     role: user.role,
      //   },
      //   process.env.JWT_SECRET,
      //   { expiresIn: '7d' }
      // );

      // Pass the token to the next middleware
      done(null, { user, accessToken });
    } catch (error) {
      done(error, null);
    }
  }  
)  )





// 🚀 Serialize user into session  
passport.serializeUser((user, done) => {  
    done(null, user);  
  });  
  passport.deserializeUser((user, done:any) => {  
    done(null, user);  
  });

