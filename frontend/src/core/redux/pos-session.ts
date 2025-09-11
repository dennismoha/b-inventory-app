// src/store/posSessionSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PosSessionState {
  posSessionId: null | { pos_session_id: string };
}

const initialState: PosSessionState = {
  posSessionId: null
};

const posSessionSlice = createSlice({
  name: 'posSession',
  initialState,
  reducers: {
    setPosSessionId(state, action: PayloadAction<{ pos_session_id: string }>) {
      state.posSessionId = action.payload;
    },
    clearPosSessionId(state) {
      state.posSessionId = null;
    }
  }
});

export const { setPosSessionId, clearPosSessionId } = posSessionSlice.actions;
export default posSessionSlice.reducer;
