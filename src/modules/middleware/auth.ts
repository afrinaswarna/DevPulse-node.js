import  jwt, { type JwtPayload }  from 'jsonwebtoken';
import type { NextFunction, Request, Response } from "express"
import config from '../../config';
import { pool } from '../../db';
import type { ROLES } from '../../types';
import { issuesService } from '../issues/issues.service';

const auth = (...roles:ROLES[])=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
      try {
          const token = req.headers.authorization
          const payLoad = req.body
          const {title,description,type,status} = payLoad

          
      
        if(!token){
            res.status(401).json({
                success:false,
                message:"Unauthorized",

            })
        }

        const decodedToken = jwt.verify(token as string,config.secret as string)as JwtPayload

        

        const userDataFromDB = await pool.query(`
           SELECT * FROM users WHERE email=$1 
            `,[decodedToken.email])

        const user = userDataFromDB.rows[0]
       
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


        const result = await pool.query(`
            INSERT INTO issues (title,description,type,status,reporter_id) VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
            `,[title,description,type,status,req.user.id])

       res.status(201).json({
        success:true,
        message:"Issue created successfully",
        data:result.rows[0]
       })
        
        next()
      } catch (error) {
        next(error)
      }


        
        

    }
}

export default auth;