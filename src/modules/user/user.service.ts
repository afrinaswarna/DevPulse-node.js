import { pool } from "../../db"

const getAllUserFromDB=async()=>{
const result = await pool.query(`
    SELECT * FROM users
    `)
    delete result.rows[0].password

    return result
}

export const userService ={
    getAllUserFromDB
}