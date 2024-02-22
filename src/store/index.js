import { configureStore } from '@reduxjs/toolkit'
import unSaveFileSlice from './unSaveIdSlice'

export default configureStore({
  reducer: {
    unSaveFile: unSaveFileSlice
  }
})