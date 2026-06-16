import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const sql = postgres(connectionString,{
    family: 4,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,}
)

export default sql;