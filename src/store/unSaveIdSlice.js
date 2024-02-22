import { createSlice } from '@reduxjs/toolkit'

export const unSaveFileSlice = createSlice({
  name: 'unSaveFile',
  initialState: {
    unSaveFileIds: [],
  },
  reducers: {
    unSaveFileIdAdd: (state, action) => {
      if (!state.unSaveFileIds.includes(action.payload)) {
        state.unSaveFileIds = [...state.unSaveFileIds, action.payload]
      }
    },
    unSaveFileIdRemove: (state, action) => {
        state.unSaveFileIds = state.unSaveFileIds.filter(id => id !== action.payload)
    }
  }
})

// Action creators are generated for each case reducer function
export const { unSaveFileIdAdd, unSaveFileIdRemove } = unSaveFileSlice.actions

export default unSaveFileSlice.reducer