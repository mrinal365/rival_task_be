// import pool from '../../config/db.js';


export const createTaskService = async () => {
    // const result = await pool.query()
    const fakeResult = { "name": "createTaskService" }
    return fakeResult
}
export const getAllTasksService = async () => {
    // const result = pool.query("SELECT * FROM tasks ")
    const fakeResult = [{ "name": "createTaskService" }, { "name": "createTaskService" }]
    return fakeResult
}
export const getTaskByIdService = async (id) => {
    // const result = pool.query("SELECT * FROM tasks where id =$1", [id])
    const fakeResult = { "name": "getTaskByIdService" }
    return fakeResult
}
export const updateTaskByIdService = async (id, task) => {
    // const result = pool.query("UPDATE tasks SET title=$1, status=$2 WHERE id=$3 RETURNING *", [task.title, task.status, id])
    const fakeResult = { "name": "updateTaskByIdService" }
    return fakeResult
}
export const deleteTaskByIdService = async (id) => {
    // const result = pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    const fakeResult = { "name": "deleteTaskByIdService" }
    return fakeResult
}
