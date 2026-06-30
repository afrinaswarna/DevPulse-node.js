import  jwt, { type JwtPayload }  from 'jsonwebtoken';
import type { NextFunction, Request, Response } from "express"
import config from '../../config';
import { pool } from '../../db';
import type { ROLES } from '../../types';

const auth = (...roles:ROLES[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
      try {
          const token = req.headers.authorization
        // console.log(token);
        if(!token){
            res.status(401).json({
                success:false,
                message:"Unauthorized",

            })
        }

        const decodedToken = jwt.verify(token as string,config.secret as string)as JwtPayload

        // console.log(decodedToken);

        const userDataFromDB = await pool.query(`
           SELECT * FROM users WHERE email=$1 
            `,[decodedToken.email])

        const user = userDataFromDB.rows[0]
        // console.log(user);   

        if(userDataFromDB.rows.length === 0){
            res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        if(roles.length && !roles.includes(user.role)){
            res.status(403).json({
                success:false,
                message:"Forbidden"
            })
        }


        req.user = decodedToken;
        
        next()
      } catch (error) {
        next(error)
      }


        
        

    }
}

export default auth;