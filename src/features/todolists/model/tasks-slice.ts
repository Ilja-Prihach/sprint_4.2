// import { nanoid } from "@reduxjs/toolkit"
import { createTodolistTC, deleteTodolistTC } from "./todolists-slice"
import { createAppSlice } from "@/common/utils"
import { tasksApi } from "@/features/todolists/api/tasksApi.ts"
import { DomainTask, UpdateTaskModel } from "@/features/todolists/api/tasksApi.types.ts"
import { TaskStatus } from "@/common/enums"
import { RootState } from "@/app/store.ts"
import { changeStatusAC } from "@/app/app-slice.ts"
//import { TaskStatus } from "@/common/enums"
//import { RootState } from "@/app/store.ts"

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState: {} as TasksState,
  selectors: {
    selectTasks: (state) => state,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTodolistTC.fulfilled, (state, action) => {
        state[action.payload.todolist.id] = []
      })
      .addCase(deleteTodolistTC.fulfilled, (state, action) => {
        delete state[action.payload.id]
      })
  },
  reducers: (create) => ({
    fetchTasksTC: create.asyncThunk(
      async (todolistId: string, thunkAPI) => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const res = await tasksApi.getTasks(todolistId)
          return { todolistId, tasks: res.data.items }
        } catch (error) {
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          state[action.payload.todolistId] = action.payload.tasks
        },
      },
    ),
    createTaskTC: create.asyncThunk(
      async (args: { todolistId: string; title: string }, thunkAPI) => {
        try {
          thunkAPI.dispatch(changeStatusAC({ status: "loading" }))
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const res = await tasksApi.createTask(args)
          thunkAPI.dispatch(changeStatusAC({ status: "succeeded" }))
          return res.data.data.item
        } catch (error) {
          thunkAPI.dispatch(changeStatusAC({ status: "failed" }))
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          // const newTask: DomainTask = {
          //   title: action.payload.title,
          //   status: TaskStatus.New,
          //   id: action.payload.id,
          //   description: "",
          //   priority: TaskPriority.Low,
          //   startDate: "",
          //   deadline: "",
          //   todoListId: action.payload.todoListId,
          //   order: 0,
          //   addedDate: "",
          // }  этот объект приходит в action.payload
          state[action.payload.todoListId].unshift(action.payload)
        },
      },
    ),
    deleteTaskTC: create.asyncThunk(
      async (args: { todolistId: string; taskId: string }, thunkAPI) => {
        try {
          await tasksApi.deleteTask(args)
          return args
        } catch (error) {
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const tasks = state[action.payload.todolistId]
          const index = tasks.findIndex((task) => task.id === action.payload.taskId)
          if (index !== -1) {
            tasks.splice(index, 1)
          }
        },
      },
    ),
    // changeTaskStatusTC: create.asyncThunk(
    //   async (task: DomainTask, thunkAPI) => {
    //     try {
    //
    //         const model: UpdateTaskModel = {
    //           status: task.status,
    //           description: task.description,
    //           title: task.title,
    //           priority: task.priority,
    //           startDate: task.startDate,
    //           deadline: task.deadline,
    //         }
    //         const res = await tasksApi.updateTask({taskId: task.id, todolistId: task.todoListId, model})
    //         return res.data.data.item
    //     } catch (error) {
    //       return thunkAPI.rejectWithValue(null)
    //     }
    //   },
    //   {
    //     fulfilled: (state, action) => {
    //       const task = state[action.payload.todoListId].find((task) => task.id === action.payload.id)
    //       if (task) {
    //         //task.isDone = action.payload.isDone
    //         task.status = action.payload.status
    //       }
    //     },
    //   },
    // ),
    changeTaskStatusTC: create.asyncThunk(
      async (args: { todolistId: string; taskId: string; status: TaskStatus }, thunkAPI) => {
        try {
          const state = thunkAPI.getState() as RootState
          const allTasks = state.tasks
          const tasksForTodolist = allTasks[args.todolistId]
          const task = tasksForTodolist.find((el) => el.id === args.taskId)
          if (task) {
            const model: UpdateTaskModel = {
              status: args.status,
              description: task.description,
              title: task.title,
              priority: task.priority,
              startDate: task.startDate,
              deadline: task.deadline,
            }
            const res = await tasksApi.updateTask({ taskId: args.taskId, todolistId: args.todolistId, model })
            return res.data.data.item
          } else {
            return thunkAPI.rejectWithValue(null)
          }
        } catch (error) {
          return thunkAPI.rejectWithValue(null)
        }
      },
      {
        fulfilled: (state, action) => {
          const task = state[action.payload.todoListId].find((task) => task.id === action.payload.id)
          if (task) {
            //task.isDone = action.payload.isDone
            task.status = action.payload.status
          }
        },
      },
    ),
    changeTaskTitleTC: create.asyncThunk(
      async (args: { todolistId: string; taskId: string; title: string }, thunkAPI) => {
        try {
          const state = thunkAPI.getState() as RootState
          const allTasks = state.tasks
          const tasksForTodolist = allTasks[args.todolistId]
          const task = tasksForTodolist.find((el) => el.id === args.taskId)
          if (task) {
            const model: UpdateTaskModel = {
              status: task.status,
              description: task.description,
              title: args.title,
              priority: task.priority,
              startDate: task.startDate,
              deadline: task.deadline,
            }
            const res = await tasksApi.updateTask({ taskId: args.taskId, todolistId: args.todolistId, model })
            return res.data.data.item
          } else {
            return thunkAPI.rejectWithValue(null)
          }
        } catch (error) {
        return thunkAPI.rejectWithValue(null)
      }
    },
      {
        fulfilled: (state, action) => {
          const task = state[action.payload.todoListId].find((task) => task.id === action.payload.id)
          if (task) {
            task.title = action.payload.title
          }
        }
      }
      ),
    // deleteTaskAC: create.reducer<{ todolistId: string; taskId: string }>((state, action) => {
    //   const tasks = state[action.payload.todolistId]
    //   const index = tasks.findIndex((task) => task.id === action.payload.taskId)
    //   if (index !== -1) {
    //     tasks.splice(index, 1)
    //   }
    // }),
    // createTaskAC: create.reducer<{ todolistId: string; title: string }>((state, action) => {
    //   const newTask: DomainTask = {
    //     title: action.payload.title,
    //     status: TaskStatus.New,
    //     id: nanoid(),
    //     description: "",
    //     priority: TaskPriority.Low,
    //     startDate: "",
    //     deadline: "",
    //     todoListId: action.payload.todolistId,
    //     order: 0,
    //     addedDate: "",
    //   }
    //   state[action.payload.todolistId].unshift(newTask)
    // }),
    // changeTaskStatusAC: create.reducer<{ todolistId: string; taskId: string; status: TaskStatus }>((state, action) => {
    //   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
    //   if (task) {
    //     //task.isDone = action.payload.isDone
    //     task.status = action.payload.status
    //   }
    // }),
    // _changeTaskTitleAC: create.reducer<{ todolistId: string; taskId: string; title: string }>((state, action) => {
    //   const task = state[action.payload.todolistId].find((task) => task.id === action.payload.taskId)
    //   if (task) {
    //     task.title = action.payload.title
    //   }
    // }),
  }),
})

export const { selectTasks } = tasksSlice.selectors
export const { changeTaskStatusTC, changeTaskTitleTC, fetchTasksTC, createTaskTC, deleteTaskTC } = tasksSlice.actions
export const tasksReducer = tasksSlice.reducer

export type Task = {
  id: string
  title: string
  isDone: boolean
}

export type TasksState = Record<string, DomainTask[]>

